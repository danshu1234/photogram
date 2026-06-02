import { Message } from "@/app/Chat"
import getMessIdAndDate from "@/app/getMessIdAndDate"
import { SendPhoto } from "./page"
import { v4 as uuidv4 } from 'uuid';
import buildFormData from "./formDataBuild";
import { decodeBase64, encodeBase64 } from "tweetnacl-util";
import nacl from "tweetnacl";
import encryptMess from "../encryptMess";
import AnsMess from "./Answ";

const sendMess = async (type: string, inputMess: string, imageBase64: SendPhoto[], videoFile: {file: File, type: string} | null, messages: Message[] | null, editMess: string, trueEmail: string, setMessages: Function | null, answMess: AnsMess | null, setAnswMess: Function | null, setImageBase64: Function | null, setVideoFile: Function | null, setInputMess: Function | null, setOverStatus: Function | null, setFiles: Function | null, files: File[], succesSend: Function | null, trueParamEmail: string, backUpMess: Function | null, setEditMess: Function | null, setProcessSendMess: Function | null, usersChat: string[], groupName?: string, fileName?: string, file?: File, options?: string[]) => {
    const isText = inputMess !== ''
    const isPhotos = imageBase64.length !== 0
    if ((isText && isPhotos) || (isText && !isPhotos) || (!isText && isPhotos) || (!isPhotos && videoFile) || (!isPhotos && !videoFile && files.length !== 0) || fileName) {
        try {
            let resultPrivateKey: string = ''
            const privateKey = localStorage.getItem(`${trueEmail}PrivateKey`)
            if (privateKey) {
                resultPrivateKey = privateKey
            }
            const decodePrivateKey = decodeBase64(resultPrivateKey)
            const encoder = new TextEncoder()
            let messageBytes: any = ''
            if (!fileName) {
                messageBytes = encoder.encode(inputMess)
            } else {
                messageBytes = encoder.encode(fileName)
            }
            const publicKeys = await fetch('http://localhost:4000/users-controller/public/keys', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                }, 
                body: JSON.stringify({ usersChat }),
                credentials: 'include',
            })
            const resultPublicKeys = await publicKeys.json()
            console.log('Keys: ')
            console.log(resultPublicKeys)
            const myPublicKeys = resultPublicKeys.find((el: any) => el.user === trueEmail)
            const testKeyPair = nacl.box.keyPair()
            let encPublicKey: string = ''
            for (let myPublicKey of myPublicKeys.publicKeys) {
                const message = new TextEncoder().encode("test")
                const testNonce = nacl.randomBytes(nacl.box.nonceLength) 
                const encrypted = nacl.box(
                    message,
                    testNonce,
                    testKeyPair.publicKey,
                    decodePrivateKey,
                )
                const decodeMyPublicKey = decodeBase64(myPublicKey)
                const decrypted = nacl.box.open(
                    encrypted,
                    testNonce,
                    decodeMyPublicKey,
                    testKeyPair.secretKey,
                )
                if (decrypted) {
                    encPublicKey = myPublicKey
                    break
                }
            }
            const resultText = resultPublicKeys.map((el: any) => {
                const resultUserText = encryptMess(el.publicKeys, messageBytes, decodePrivateKey, encPublicKey)
                return {
                    user: el.user,
                    message: resultUserText,
                }
            })
            const videoId = uuidv4()
            let previewVideo: string | undefined = undefined
            if (videoFile) {
                const preview = new Promise((resolve, reject) => {
                    const video = document.createElement('video');
                    video.preload = 'metadata';
                    
                    const videoUrl = URL.createObjectURL(videoFile.file);
                    video.src = videoUrl;
                    
                    video.onloadedmetadata = () => {
                      video.currentTime = Math.min(1, video.duration);
                    };
            
                    video.onseeked = () => {
                        const canvas = document.createElement('canvas');
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                        
                          const previewUrl = canvas.toDataURL('image/jpeg', 0.8);
                        
                          URL.revokeObjectURL(videoUrl);
                          video.remove();
                        
                          resolve(previewUrl);
                        } else {
                          reject(new Error('Не удалось создать контекст canvas'));
                        }
                    }
                    video.onerror = (error) => {
                      URL.revokeObjectURL(videoUrl);
                      reject(error);
                    };
                });
                const resultPreview = await preview
                if (typeof resultPreview === 'string') {
                    previewVideo = resultPreview
                }
            }
            const messRealCount = await fetch('http://localhost:4000/users-controller/mess/length', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },  
                body: JSON.stringify({ trueParamEmail }),
                credentials: 'include',      
            })
            const resultMessRealCount = await messRealCount.json()
            console.log('Mess count: ')
            console.log(resultMessRealCount)
            const readMess = usersChat.map(el => {
                if (el === trueEmail) {
                    return {
                        user: el,
                        read: true,
                    }
                } else {
                    return {
                        user: el,
                        read: false,
                    }
                }
            })
            if (resultMessRealCount !== 0) {
                if (messages) {
                    if (editMess === '') {
                        const { formattedDate, messId } = getMessIdAndDate() 
                        let newMess: Message[] = []
                        let votes: any = ''
                        if (type === 'vote') {
                            const resultVotes = options?.map(el => {
                                const voteId = uuidv4()
                                return {
                                    id: voteId,
                                    option: el,
                                    users: [],
                                }
                            })
                            votes = resultVotes
                            const resultNewMess = [...messages, {user: trueEmail, text: inputMess, photos: imageBase64.map(el => {
                                return {
                                    base64: el.base64,
                                    id: '',
                                }
                            }), date: formattedDate, id: messId, ans: answMess, edit: false, typeMess: type, per: '', controls: false, pin: false, read: readMess, sending: true, emojies: false, reactions: [], votes: resultVotes, allUserVotes: []}]
                            newMess = resultNewMess
                            if (setMessages) {  
                                setMessages(resultNewMess)
                            }
                        }
                        if (type === 'text' || type === 'voice' || type === 'geopos') {
                            console.log('New messages: ')
                            console.log(messages)
                            const resultNewMess = [...messages, {user: trueEmail, text: inputMess, photos: imageBase64.map(el => {
                                return {
                                    base64: el.base64,
                                    id: '',
                                }
                            }), date: formattedDate, id: messId, ans: answMess, edit: false, typeMess: type, per: '', controls: false, pin: false, read: readMess, sending: true, emojies: false, reactions: []}]
                            newMess = resultNewMess
                            if (setMessages) {
                                setMessages(resultNewMess)
                            }
                        } else {
                            if (setMessages) {
                                setMessages((prev: Message[]) => {
                                    if (prev) {
                                        if (fileName) {
                                            const resultNewMess = [...prev, {user: trueEmail, text: fileName, photos: [], date: formattedDate, id: messId, ans: answMess, edit: false, typeMess: type, per: '', controls: false, pin: false, read: readMess, sending: true, emojies: false, reactions: []}] 
                                            newMess = resultNewMess
                                            return resultNewMess
                                        } else {
                                            if (videoFile) {
                                                const resultNewMess = [...prev, {user: trueEmail, text: videoId, photos: [], date: formattedDate, id: messId, ans: answMess, edit: false, typeMess: type, per: '', controls: false, pin: false, read: readMess, sending: true, emojies: false, reactions: []}] 
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
                        }
                        if (setAnswMess) {
                            setAnswMess('')
                        }
                        if (setImageBase64 && setVideoFile && setInputMess && setOverStatus && setFiles) {
                            setImageBase64([])
                            setVideoFile(null)
                            setInputMess('')
                            setOverStatus(false)
                            setFiles([])
                        }
                        let formData: any = ''
                        if (type === 'text' || type === 'geopos' || type === 'vote') {
                            formData = buildFormData(imageBase64, videoFile, trueEmail, files, resultText, formattedDate, type, messId, trueParamEmail, answMess, videoId, file, fileName)
                        } else if (type === 'voice' || type === 'video') {
                            formData = buildFormData(imageBase64, videoFile, trueEmail, files, inputMess, formattedDate, type, messId, trueParamEmail, answMess, videoId, file, fileName)
                        }
                        if (type === 'vote') {
                            formData.append('options', JSON.stringify(votes))
                        }
                        const sendMess = await fetch('http://localhost:4000/users-controller/new/mess', {
                            method: "PATCH",
                            body: formData,
                            credentials: 'include',
                        })
                        const resultSendMess = await sendMess.json()
                        console.log('fisenginegnigneis')
                        console.log(`Result of the sending: ${resultSendMess.status}`)
                        if (resultSendMess.status !== 'OK') {
                            if (backUpMess) {
                                const resultBackupMess = backUpMess(messages, messId)
                                if (setMessages) {
                                    setMessages(resultBackupMess)
                                }
                            }
                            if (type === 'video') {
                                alert('Превышен допустимый объем файлов')
                            } else {
                                alert('Произошла ошибка при отправке сообщения')
                            }
                        } else {
                            if (succesSend) {
                                succesSend(newMess, messId)
                            }
                        }
                    } else {
                        const per = ''
                        const text = JSON.stringify(resultText)
                        await fetch('http://localhost:4000/users-controller/edit/mess', {
                            method: "PATCH",
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ trueParamEmail, editMess, inputMess, per, text }),
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
                        if (setMessages) {
                            setMessages(newMess)
                        }
                        if (setEditMess && setImageBase64 && setProcessSendMess && setFiles) {
                            setEditMess('')
                            setImageBase64([])
                            setProcessSendMess(false)
                            setFiles([])
                        }
                    }                        
                }
            } else {
                if (messages) {
                    const { formattedDate, messId } = getMessIdAndDate()
                    let newMess: Message[] = []
                    if (type === 'text') {
                        const resultNewMess = [...messages, {user: trueEmail, text: inputMess, photos: imageBase64.map(el => {
                            return {
                                base64: el.base64,
                                id: '',
                            }
                        }), date: formattedDate, id: messId, ans: answMess, edit: false, typeMess: type, per: '', controls: false, pin: false, read: readMess, sending: true, emojies: false, reactions: []}]
                        newMess = resultNewMess
                        if (setMessages && setInputMess) {
                            setInputMess('')
                            setMessages(resultNewMess)
                        }
                    } else {
                        const resultNewMess = [...messages, {user: trueEmail, text: inputMess, photos: [], date: formattedDate, id: messId, ans: answMess, edit: false, typeMess: 'video', per: '', controls: false, pin: false, read: readMess, sending: true, emojies: false, reactions: []}]
                        newMess = resultNewMess
                        if (setMessages) {
                            setMessages(resultNewMess)
                        }
                    }
                    const chatUsers: string[] = usersChat.filter(el => el !== trueEmail)
                    const formData = buildFormData(imageBase64, videoFile, trueEmail, files, resultText, formattedDate, type, messId, trueParamEmail, answMess, videoId, file, fileName)
                    formData.append('users', JSON.stringify(chatUsers))
                    if (groupName) {
                        formData.append('groupName', groupName)
                    }
                    const firstMess = await fetch('http://localhost:4000/users-controller/new/chat', {
                        method: "PATCH",
                        body: formData,
                        credentials: 'include',
                    })
                    const resultFirstMess = await firstMess.json()
                    console.log(resultFirstMess)
                    if (resultFirstMess.status !== 'OK') {
                        if (backUpMess) {
                            const resultBackupMess = backUpMess(messages, messId)
                            if (setMessages) {
                                setMessages(resultBackupMess)
                            }
                        }
                        if (type === 'video') {
                            alert('Превышен допустимый объем файлов')
                        } else {
                            alert('Произошла ошибка при отправке сообщения')
                        }
                    } else {
                        if (chatUsers.length > 1) {
                            window.location.href=`/chats/${resultFirstMess.id}`
                        }
                        if (succesSend) {
                            succesSend(newMess, messId)
                        }
                    }
                }
            }
            if (setImageBase64 && setInputMess && setFiles) {
                setImageBase64([])
                setInputMess('')
                setFiles([])
            }
        } catch (e) {
            console.log(e)
            alert('Превышен допустимый объем файлов')
            if (setImageBase64 && setImageBase64 && setInputMess && setFiles) {
                setImageBase64([])
                setInputMess('')
                setFiles([])
            }
        }                   
    }
}

export default sendMess