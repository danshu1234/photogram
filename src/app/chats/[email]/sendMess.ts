import { Message } from "@/app/Chat"
import getMessIdAndDate from "@/app/getMessIdAndDate"
import { SendPhoto } from "./page"
import { v4 as uuidv4 } from 'uuid';

const sendMess = async (type: string, inputMess: string, imageBase64: SendPhoto[], videoFile: {file: File, type: string} | null, messages: Message[] | null, editMess: string, trueEmail: string, setMessages: Function, answMess: string, setAnswMess: Function, setImageBase64: Function, setVideoFile: Function, setInputMess: Function, setOverStatus: Function, setFiles: Function, files: File[], succesSend: Function, trueParamEmail: string, backUpMess: Function, setEditMess: Function, setProcessSendMess: Function, fileName?: string, file?: File) => {
    const isText = inputMess !== ''
    const isPhotos = imageBase64.length !== 0
    if ((isText && isPhotos) || (isText && !isPhotos) || (!isText && isPhotos) || (!isPhotos && videoFile) || (!isPhotos && !videoFile && files.length !== 0) || fileName) {
        try {
            const videoId = uuidv4()
            if (messages?.length !== 0) {
                if (messages) {
                    if (editMess === '') {
                        const { formattedDate, messId } = getMessIdAndDate() 
                        let newMess: Message[] = []
                        if (type === 'text' || type === 'voice') {
                            console.log('New messages: ')
                            console.log(messages)
                            const resultNewMess = [...messages, {user: trueEmail, text: inputMess, photos: imageBase64.map(el => el.base64), date: formattedDate, id: messId, ans: answMess, edit: false, typeMess: type, per: '', controls: false, pin: false, read: false, sending: true}]
                            newMess = resultNewMess
                            setMessages(resultNewMess)
                        } else {
                            setMessages((prev: Message[]) => {
                                if (prev) {
                                    if (fileName) {
                                        const resultNewMess = [...prev, {user: trueEmail, text: fileName, photos: [], date: formattedDate, id: messId, ans: answMess, edit: false, typeMess: type, per: '', controls: false, pin: false, read: false, sending: true}] 
                                        newMess = resultNewMess
                                        return resultNewMess
                                    } else {
                                        if (videoFile) {
                                            const resultNewMess = [...prev, {user: trueEmail, text: videoId, photos: [], date: formattedDate, id: messId, ans: answMess, edit: false, typeMess: type, per: '', controls: false, pin: false, read: false, sending: true}] 
                                            newMess = resultNewMess
                                            return resultNewMess
                                        } else {
                                            return prev
                                        }
                                    }
                                } else {
                                    return prev
                                }
                            })
                        }
                        setAnswMess('')
                        setImageBase64([])
                        setVideoFile(null)
                        setInputMess('')
                        setOverStatus(false)
                        setFiles([])
                        const formData = new FormData()
                        if (imageBase64.length !== 0) {
                            for (let item of imageBase64) {
                                formData.append('photo', item.file)
                            }
                        } else if (imageBase64.length === 0 && videoFile && !file) {
                            formData.append('photo', videoFile.file)
                        } else if (imageBase64.length === 0 && !videoFile && file) {
                            formData.append('photo', file)
                        }
                        formData.append('user', trueEmail)
                        if (videoFile === null) {
                            if (files.length === 0) {
                                if (fileName) {
                                    formData.append('text', fileName)
                                } else {
                                    formData.append('text', inputMess)
                                }
                            } else if (files.length !== 0 && fileName) {
                                formData.append('text', fileName)
                            }
                        } else {
                            if (type === 'video' && videoFile) {
                                formData.append('text', videoFile.file.name)
                            }
                        }
                        formData.append('date', formattedDate)
                        formData.append('id', messId)
                        formData.append('ans', answMess)
                        formData.append('trueParamEmail', trueParamEmail)
                        formData.append('per', '')
                        formData.append('type', type)
                        formData.append('videoId', videoId)
                        const sendMess = await fetch('http://localhost:4000/users-controller/new/mess', {
                            method: "PATCH",
                            body: formData,
                            credentials: 'include',
                        })
                        const resultSendMess = await sendMess.text()
                        console.log(`Result of the sending: ${resultSendMess}`)
                        if (resultSendMess !== 'OK') {
                            const resultBackupMess = backUpMess(messages, messId)
                            setMessages(resultBackupMess)
                            if (type === 'video') {
                                alert('Превышен допустимый объем файлов')
                            } else {
                                alert('Произошла ошибка при отправке сообщения')
                            }
                        } else {
                            succesSend(newMess, messId)
                        }
                    } else {
                        const per = ''
                        await fetch('http://localhost:4000/users-controller/edit/mess', {
                            method: "PATCH",
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ trueParamEmail, editMess, inputMess, per }),
                            credentials: 'include',
                        })
                        const newMess = messages.map(el => {
                            if (el.id === editMess) {
                                return {
                                    ...el,
                                    text: inputMess,
                                    edit: true,
                                }
                            } else {
                                return el
                            }
                        })
                        setMessages(newMess)
                        setEditMess('')
                        setImageBase64([])
                        setProcessSendMess(false)
                        setFiles([])
                    }                        
                }
            } else {
                if (messages) {
                    const { formattedDate, messId } = getMessIdAndDate()
                    const formData = new FormData()
                    let newMess: Message[] = []
                    if (imageBase64.length !== 0) {
                        for (let item of imageBase64) {
                            formData.append('photo', item.file)
                        }
                    } else if (imageBase64.length === 0 && videoFile) {
                        formData.append('photo', videoFile.file)
                    }
                    if (type === 'text') {
                        const resultNewMess = [{user: trueEmail, text: inputMess, photos: imageBase64.map(el => el.base64), date: formattedDate, id: messId, ans: '', edit: false, typeMess: 'text', per: '', controls: false, pin: false, read: false, sending: true}]
                        newMess = resultNewMess
                        setMessages(resultNewMess)
                        setInputMess('')
                    } else {
                        const resultNewMess = [...messages, {user: trueEmail, text: inputMess, photos: [], date: formattedDate, id: messId, ans: answMess, edit: false, typeMess: 'video', per: '', controls: false, pin: false, read: false, sending: true}]
                        newMess = resultNewMess
                        setMessages(resultNewMess)
                    }
                    formData.append('user', trueEmail)
                    formData.append('text', inputMess)
                    formData.append('date', formattedDate)
                    formData.append('id', messId)
                    formData.append('ans', answMess)
                    formData.append('trueParamEmail', trueParamEmail)
                    formData.append('per', '')
                    formData.append('type', type)
                    formData.append('videoId', videoId)
                    const firstMess = await fetch('http://localhost:4000/users-controller/new/chat', {
                        method: "PATCH",
                        body: formData,
                        credentials: 'include',
                    })
                    const resultFirstMess = await firstMess.text()
                    if (resultFirstMess !== 'OK') {
                        const resultBackupMess = backUpMess(messages, messId)
                        setMessages(resultBackupMess)
                        if (type === 'video') {
                            alert('Превышен допустимый объем файлов')
                        } else {
                            alert('Произошла ошибка при отправке сообщения')
                        }
                    } else {
                        succesSend(newMess, messId)
                    }
                }
            }
            setInputMess('')
            setFiles([])
        } catch (e) {
            alert('Превышен допустимый объем файлов')
            setImageBase64([])
            setInputMess('')
            setFiles([])
        }                   
    }
}

export default sendMess