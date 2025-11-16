'use client'

import { ChangeEvent, FC, useEffect, useState } from "react"
import useGetTrueParamEmail from "@/app/useGetTrueParamEmail"
import useGetEmail from "@/app/useGetEmail"
import { Message } from "@/app/Chat"
import { io } from "socket.io-client";
import { useReactMediaRecorder } from "react-media-recorder"
import getMessIdAndDate from "@/app/getMessIdAndDate"
import SendBtn from "@/app/SendBtn"
import MessDisplay from "@/app/MessDisplay"
import gifs from "@/app/gifs"
import useCheckReg from "@/app/CheckReg"
import getUserChats from "@/app/getChats"
import "./UserChat.css"
import Call from "@/app/Call"
import { useRouter } from 'next/navigation'
import useOnlineStatus from "@/app/useOnlineStatus"
import Video from "@/app/Video"
import { ClipLoader } from "react-spinners"
import backUpMess from '@/app/backupMess'

interface SendPhoto{
    file: File;
    base64: string;
}
const UserChat: FC = () => {
    
    const { startRecording, stopRecording, mediaBlobUrl } = useReactMediaRecorder({audio: true})

    const router = useRouter()
    
    const socket = io('http://localhost:4000')

    const {} = useCheckReg()
    const {} = useOnlineStatus()

    const [socketId, setSocketId] = useState ('')

    const { trueEmail, setTrueEmail } = useGetEmail()
    const { trueParamEmail, setTrueParamEmail } = useGetTrueParamEmail()

    const [overStatus, setOverStatus] = useState <boolean> (false)
    const [processSendMess, setProcessSendMess] = useState <boolean> (false)
    const [videoMessId, setVideoMessId] = useState <string | null> (null)
    const [file, setFile] = useState <{file: File, type: string} | null> (null)
    const [onlineStatus, setOnlineStatus] = useState <string> ('Offline')
    const [pinMess, setPinMess] = useState <string[]> ([])
    const [sucCopy, setSucCopy] = useState <boolean> (false)
    const [bonuceAction, setBonuceAction] = useState <boolean> (false)
    const [gifsArr, setGifsArr] = useState <string[]> ([])
    const [startStop, setStartStop] = useState <boolean> (false)
    const [mySubs, setMySubs] = useState <string[] | null> (null)
    const [userSubs, setUserSubs] = useState <string[] | null> (null)
    const [userPermMess, setUserPermMess] = useState <string | null> (null)
    const [editMess, setEditMess] = useState <string> ('')
    const [answMess, setAnswMess] = useState <string> ('')
    const [myBanArr, setMyBanArr] = useState <string[] | null> (null)
    const [usersBan, setUsersBan] = useState <string[] | null> (null)
    const [typing, setTyping] = useState <string> ('')
    const [imageBase64, setImageBase64] = useState <SendPhoto[]> ([])
    const [inputMess, setInputMess] = useState <string> ('')
    const [messages, setMessages] = useState <Message[] | null> (null)
    let showMess;
    let photos;
    let showMessInter;
    let banBtn;
    let showGifs;

    if (trueEmail !== trueParamEmail) {
        if (Array.isArray(myBanArr)) {
            if (myBanArr.includes(trueParamEmail)) {
                banBtn = <button className="unban-btn" onClick={async() => {
                    await fetch('http://localhost:4000/users-controller/unban/user', {
                        method: "PATCH",
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ trueParamEmail }),
                        credentials: 'include',
                    })
                    window.location.reload()
                }}>Разблокировать</button>
            } else {
                banBtn = <button className="ban-btn" onClick={async() => {
                    await fetch('http://localhost:4000/users-controller/ban/user', {
                        method: "PATCH",
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ trueParamEmail }),
                        credentials: 'include',
                    })
                    window.location.reload()
                }}>Заблокировать</button>
            }
        }
    }

    const getAllGifs = () => {
        setGifsArr([...gifs.smile, ...gifs.money, ...gifs.sad])
    }

    if (gifsArr.length !== 0) {
        showGifs = <div className="gifs-container">
            <div className="gifs-header">
                <button className="gif-filter-btn" onClick={getAllGifs}>Все</button>
                <button className="gif-filter-btn" onClick={() => setGifsArr(gifs.smile)}>Улыбка</button>
                <button className="gif-filter-btn" onClick={() => setGifsArr(gifs.money)}>Деньги</button>
                <button className="gif-filter-btn" onClick={() => setGifsArr(gifs.sad)}>Грустно</button>
            </div>
            <div className="gifs-grid">
                {gifsArr.map((item, index) => <div key={index} className="gif-item"><img src={item} onClick={async() => {
                    const { formattedDate, messId } = getMessIdAndDate()
                    if (messages) { 
                        if (messages.length !== 0) {
                            setMessages([...messages, {user: trueEmail, text: item, photos: [], date: formattedDate, id: messId, ans: answMess, edit: false, typeMess: 'gif', per: '', controls: false, pin: false, read: false}])
                            setInputMess('')
                            const formData = new FormData()
                            formData.append('user', trueEmail)
                            formData.append('text', item)
                            formData.append('date', formattedDate)
                            formData.append('id', messId)
                            formData.append('ans', answMess)
                            formData.append('trueParamEmail', trueParamEmail)
                            formData.append('per', '')
                            formData.append('type', 'gif')
                            const sendMess = await fetch('http://localhost:4000/users-controller/new/mess', {
                                method: "PATCH",
                                body: formData,
                                credentials: 'include',
                            })
                            const resultSendMess = await sendMess.text()
                            if (resultSendMess !== 'OK') {
                                const resultBackupMess = backUpMess(messages, messId)
                                setMessages(resultBackupMess)
                                alert('Произошла ошибка при отправке сообщения')
                            }
                        } else {
                            setMessages([{user: trueEmail, text: item, photos: [], date: formattedDate, id: messId, ans: answMess, edit: false, typeMess: 'gif', per: '', controls: false, pin: false, read: false}])
                            setGifsArr([])
                            const formData = new FormData()
                            formData.append('user', trueEmail)
                            formData.append('text', item)
                            formData.append('date', formattedDate)
                            formData.append('id', messId)
                            formData.append('ans', answMess)
                            formData.append('trueParamEmail', trueParamEmail)
                            formData.append('per', '')
                            formData.append('type', 'gif')
                            const firstMess = await fetch('http://localhost:4000/users-controller/new/chat', {
                                method: "PATCH",
                                body: formData,
                                credentials: 'include',
                            })
                            const resultFirstMess = await firstMess.text()
                            if (resultFirstMess !== 'OK') {
                                const resultBackupMess = backUpMess(messages, messId)
                                setMessages(resultBackupMess)
                                alert('Произошла ошибка при отправке сообщения')
                            }
                        }
                    }
                }}/></div>)}
            </div>
        </div>
    }

    if (imageBase64.length !== 0) {
        photos = <div className="photos-preview">
            <div className="photos-list">
                {imageBase64.map((item, index) => <div key={index} className="photo-item">
                        <div className="photo-remove" onClick={() => {
                            let resultImages = []
                            for (let el of imageBase64) {
                                if (el.base64 !== item.base64) {
                                    resultImages.push(el)
                                }
                            }
                            setImageBase64(resultImages)
                        }}>×</div>
                        <img src={item.base64}/>
                    </div>)}
            </div>
        </div>
    }


    if (messages !== null) {
        if (messages.length === 0) {
            showMess = <div className="empty-chat"><h2>Этот чат пока пуст</h2></div>
        } else if (messages.length !== 0) {
            showMess = <MessDisplay messages={messages} email={trueEmail} trueParamEmail={trueParamEmail} setMessages={setMessages} setAnswMess={setAnswMess} setEditMess={setEditMess} setInputMess={setInputMess} setSucCopy={setSucCopy} pinMess={pinMess} setPinMess={setPinMess} setVideoMessId={setVideoMessId}/>
        }
    } else {
        showMess = <div className="loading-chat"><h2>Загрузка...</h2></div>
    }

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const newSendPhoto: SendPhoto = {
                    file: file,
                    base64: event.target?.result as string,
                }
                setImageBase64([...imageBase64, newSendPhoto]);
            };
            reader.readAsDataURL(file);
        }
    };

    const zeroMess = async (trueParamEmail: string) => {
        await fetch('http://localhost:4000/users-controller/zero/mess', {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ trueParamEmail }),
            credentials: 'include',
        })
    }

    const getMessages = async () => {
        const getMess = await fetch('http://localhost:4000/users-controller/get/mess', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ trueParamEmail }),
            credentials: 'include',
        })
        const resultMess = await getMess.json()
        const getMessCount = await fetch('http://localhost:4000/users-controller/get/friend/mess/count', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ trueParamEmail }),
            credentials: 'include'
        })
        const resultFriendMessCount = await getMessCount.json()
        const pinnedMess = resultMess.filter((el: any) => el.pin === true)
        if (pinnedMess.length !== 0) {
            setPinMess(pinnedMess.map((el: any) => el.id))
        }
        const myMess = resultMess.map((el: any) => {
            return {
                ...el,
                controls: false,
            }
        })
        if (myMess.length !== resultFriendMessCount) {
            const readMess = myMess.slice(0, myMess.length - resultFriendMessCount).map((el: any) => {
                return {
                    ...el, 
                    read: true,
                }
            })
            const unreadMess = myMess.slice(readMess.length, myMess.length).map((el: any) => {
                return {
                    ...el, 
                    read: false,
                }
            })
            const resultMyMess = [...readMess, ...unreadMess]
            setMessages(resultMyMess)
        } else {
            const resultMyMess = myMess.map((el: any) => {
                return {
                    ...el, 
                    read: false,
                }
            })
            setMessages(resultMyMess)
        }
    }

    const getBanArr = async () => {
        const banArr = await fetch(`http://localhost:4000/users-controller/get/ban/mess/${trueParamEmail}`)
        const resultBanArr = await banArr.json()
        setUsersBan(resultBanArr)
    }

    const getMyBanArr = async () => {
        const banArr = await fetch('http://localhost:4000/users-controller/get/my/ban/mess', {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        })
        const resultBanArr = await banArr.json()
        setMyBanArr(resultBanArr)
    }

    const sendMess = async (type: string) => {
        const isText = inputMess !== ''
                const isPhotos = imageBase64.length !== 0
                if ((isText && isPhotos) || (isText && !isPhotos) || (!isText && isPhotos) || (!isPhotos && file)) {
                    try {
                        if (messages?.length !== 0) {
                            if (messages) {
                                if (editMess === '') {
                                    const { formattedDate, messId } = getMessIdAndDate() 
                                    const newMessages = [...messages, {user: trueEmail, text: inputMess, photos: imageBase64.map(el => el.base64), date: formattedDate, id: messId, ans: answMess, edit: false, typeMess: 'text', per: '', controls: false, pin: false, read: false}]
                                    if (type === 'text') {
                                        setMessages(newMessages)
                                    } else {
                                        setMessages([...messages, {user: trueEmail, text: inputMess, photos: [], date: formattedDate, id: messId, ans: answMess, edit: false, typeMess: 'video', per: '', controls: false, pin: false, read: false}])
                                    }
                                    setAnswMess('')
                                    setImageBase64([])
                                    setFile(null)
                                    setInputMess('')
                                    const formData = new FormData()
                                    if (imageBase64.length !== 0) {
                                        for (let item of imageBase64) {
                                            formData.append('photo', item.file)
                                        }
                                    } else if (imageBase64.length === 0 && file) {
                                        formData.append('photo', file.file)
                                    }
                                    formData.append('user', trueEmail)
                                    formData.append('text', inputMess)
                                    formData.append('date', formattedDate)
                                    formData.append('id', messId)
                                    formData.append('ans', answMess)
                                    formData.append('trueParamEmail', trueParamEmail)
                                    formData.append('per', '')
                                    formData.append('type', type)
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
                                }                        
                            }
                        } else {
                            if (messages) {
                                const { formattedDate, messId } = getMessIdAndDate()
                                const formData = new FormData()
                                if (imageBase64.length !== 0) {
                                    for (let item of imageBase64) {
                                        formData.append('photo', item.file)
                                    }
                                } else if (imageBase64.length === 0 && file) {
                                    formData.append('photo', file.file)
                                }
                                if (type === 'text') {
                                    setMessages([{user: trueEmail, text: inputMess, photos: imageBase64.map(el => el.base64), date: formattedDate, id: messId, ans: '', edit: false, typeMess: 'text', per: '', controls: false, pin: false, read: false}])
                                    setInputMess('')
                                } else {
                                    setMessages([...messages, {user: trueEmail, text: inputMess, photos: [], date: formattedDate, id: messId, ans: answMess, edit: false, typeMess: 'video', per: '', controls: false, pin: false, read: false}])
                                }
                                formData.append('user', trueEmail)
                                formData.append('text', inputMess)
                                formData.append('date', formattedDate)
                                formData.append('id', messId)
                                formData.append('ans', answMess)
                                formData.append('trueParamEmail', trueParamEmail)
                                formData.append('per', '')
                                formData.append('type', type)
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
                                }
                            }
                        }
                        setInputMess('')
                    } catch (e) {
                        alert('Превышен допустимый объем файлов')
                        setImageBase64([])
                        setInputMess('')
                    }                   
                }
    }

    const getUserPermAndSubs = async () => {
        const getPermData = await fetch('http://localhost:4000/users-controller/get/perm/data', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ trueParamEmail }),
            credentials: 'include',
        })
        const resultPermData = await getPermData.json()
        setMySubs(resultPermData.mySubs)
        setUserSubs(resultPermData.friendSubs)
        setUserPermMess(resultPermData.friendPermMess)
    }

    const openChat = async () => {
        await fetch('http://localhost:4000/users-controller/open/chat', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ trueParamEmail }),
            credentials: 'include',
        })
    }

    useEffect(() => {
        if (typing !== '' && typing !== 'Записывает голосовое...') {
            setTimeout(() => {
                setTyping('')
            }, 1000);
        }
    }, [typing])

    useEffect(() => {
        const handleGlobalKeyPress = (event: any) => {
          if (event.key === 'Enter') {
            sendMess('text')
          }
        };   

        document.addEventListener('keydown', handleGlobalKeyPress);     
        
        return () => {
          document.removeEventListener('keydown', handleGlobalKeyPress);
        };
    })

    useEffect(() => {
        if (sucCopy === true) {
            setTimeout(() => {
                setSucCopy(false)
            }, 2000);
        }
    }, [sucCopy])

    useEffect(() => {
        if (trueParamEmail !== '' && trueEmail !== '') {
            getMessages()
            getBanArr()
            getMyBanArr()
            getUserPermAndSubs()
            zeroMess(trueParamEmail)
            openChat()
        }
    }, [trueParamEmail, trueEmail])

    useEffect(() => {
        if (mediaBlobUrl !== undefined) {
            const newVoiceMess = async () => {
                const getBase64FromBlobUrl = async (blobUrl: any) => {
                const response = await fetch(blobUrl);
                const blob = await response.blob();
                const base64data = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
        });
        return base64data
        };
                const base64String = await getBase64FromBlobUrl(mediaBlobUrl)

                if (typeof base64String === 'string') {
                    const { formattedDate, messId } = getMessIdAndDate()
                if (messages) {
                    if (messages.length !== 0) {
                        const formData = new FormData()
                        formData.append('user', trueEmail)
                        formData.append('text', base64String)
                        formData.append('date', formattedDate)
                        formData.append('id', messId)
                        formData.append('ans', answMess)
                        formData.append('trueParamEmail', trueParamEmail)
                        formData.append('per', '')
                        formData.append('type', 'voice')
                        setMessages([...messages, {user: trueEmail, text: base64String, photos: [], date: formattedDate, id: messId, ans: answMess, edit: false, typeMess: 'voice', controls: false, per: '', pin: false, read: false}])
                        setAnswMess('')
                        setInputMess('')
                        const sendMess = await fetch('http://localhost:4000/users-controller/new/mess', {
                            method: "PATCH",
                            body: formData,
                            credentials: 'include',
                        })
                        const resultSendMess = await sendMess.text()
                        if (resultSendMess !== 'OK') {
                            const resultBackupMess = backUpMess(messages, messId)
                            setMessages(resultBackupMess)
                            alert('Произошла ошибка при отправке сообщения')
                        }
                    } else {
                        setMessages([{user: trueEmail, text: base64String, photos: [], date: formattedDate, id: messId, ans: '', edit: false, typeMess: 'voice', controls: false, per: '', pin: false, read: false}])
                        setInputMess('')
                        const formData = new FormData()
                        formData.append('user', trueEmail)
                        formData.append('text', base64String)
                        formData.append('date', formattedDate)
                        formData.append('id', messId)
                        formData.append('ans', answMess)
                        formData.append('trueParamEmail', trueParamEmail)
                        formData.append('per', '')
                        formData.append('type', 'voice')
                        const firstMess = await fetch('http://localhost:4000/users-controller/new/chat', {
                            method: "PATCH",
                            body: formData,
                            credentials: 'include',
                        })
                        const resultFirstMess = await firstMess.text()
                        if (resultFirstMess !== 'OK') {
                            const resultBackupMess = backUpMess(messages, messId)
                            setMessages(resultBackupMess)
                            alert('Произошла ошибка при отправке сообщения')
                        }
                    }                  
                }
                }
            }
            newVoiceMess()
        }
    }, [mediaBlobUrl])

    useEffect(() => {
        socket.on('connect', () => {
            if (socket.id) {
                setSocketId(socket.id)
            }
        })

        socket.on('replyMessage', async(message: {type: string, user: string, text: string, photos: string[], date: string, id: string, ans: string, socketId?: string, mess: Message[], typeMess: string, per: string}) => {
            if (message.type === 'message') {
                setTrueParamEmail(prev => {
                if (prev === message.user) {
                    setMessages(prev => {
                        if (prev) {
                            return [...prev, {user: message.user, text: message.text, id: message.id, photos: message.photos, date: message.date, typeMess: message.typeMess, ans: message.ans, controls: false, per: message.per, pin: false, read: false}]
                        } else {
                            return prev
                        }
                    });
                    const readMess = async () => {
                        const targetEmail = message.user
                        await fetch('http://localhost:4000/users-controller/read/mess', {
                            method: "POST",
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ targetEmail })
                        })
                    }
                    readMess()
                }
                return prev
            })
            setTrueParamEmail(paramPrev => {
                zeroMess(paramPrev)
                return paramPrev
            })
            const user = message.user
            if (document.visibilityState !== 'visible') {
                getUserChats(user)
            }
            const userSocket = message.socketId
            await fetch(`http://localhost:4000/users-controller/zero/mess/count/${userSocket}`)
            } else if (message.type === 'typing') {
                setTrueParamEmail(prev => {
                    setTrueEmail(prevTrueEmail => {
                        if (message.user === prev && prevTrueEmail !== message.user) {
                            console.log('typing')
                            setTyping('Печатает...')
                        }
                        return prevTrueEmail
                    })
                return prev
                })
            } else if (message.type === 'delete') {
                setMessages(prev => {
                    if (prev) {
                        return prev.filter(el => el.id !== message.id)
                    } else {
                        return prev
                    }
                });
            } else if (message.type === 'editMess') {
                if (message.mess) {
                    setTrueParamEmail(prev => {
                        if (prev === message.user) {
                            const myMess = message.mess.map(el => {
                                return {
                                    ...el,
                                    controls: false,
                                }
                            })
                            setMessages(myMess)
                        }
                        return prev
                    })
                }
            } else if (message.type === 'startVoice') {
                setTrueParamEmail(prev => {
                    setTrueEmail(prevTrueEmail => {
                        if (message.user === prev && prevTrueEmail !== message.user) {
                            console.log('typing')
                            setTyping('Записывает голосовое...')
                        }
                        return prevTrueEmail
                    })
                return prev
                })
            } else if (message.type === 'stopVoice') {
                setTrueParamEmail(prev => {
                    if (prev === message.user) {
                        setTyping('')
                    }
                    return prev
                })
            } else if (message.type === 'readMess') {
                setMessages(prev => {
                    if (prev) {
                        const resultMess = prev.map(el => {
                            return {...el, read: true}
                        })
                        return resultMess
                    } else {
                        return prev
                    }
                })
            } else if (message.type === 'openChat') {
                setTrueParamEmail(prevTrueParamEmail => {
                    if (prevTrueParamEmail === message.user) {
                        setMessages(prevMessages => {
                            if (prevMessages) {
                                const resultMess = prevMessages.map(el => {
                                    return {...el, read: true}
                                })
                                return resultMess
                            } else {
                                return prevMessages
                            }
                        })
                        return prevTrueParamEmail
                    } else {
                        return prevTrueParamEmail
                    }
                })
            }
        });
    }, [])
    
    useEffect(() => {
        if (trueParamEmail !== '') {
                const getStatusOnline = async () => {
                const getUserStatusOnline = await fetch(`http://localhost:4000/users-controller/get/status/online/${trueParamEmail}`)
                const resultUserOnlineStatus = await getUserStatusOnline.text()
                if (resultUserOnlineStatus === 'Online') {
                    setOnlineStatus(resultUserOnlineStatus)
                } else {
                    setOnlineStatus(`Был(а) в сети ${resultUserOnlineStatus}`)
                }
            }
            getStatusOnline()
        }
    }, [trueParamEmail])

    useEffect(() => {
        if (trueParamEmail !== '') {
            const checkUser = async () => {
                const checkThisUser = await fetch(`http://localhost:4000/users-controller/check/user/${trueParamEmail}`)
                const resultCheckThisUser = await checkThisUser.text()
                if (resultCheckThisUser === 'undefined') {
                    router.back()
                }
            }
            checkUser()
        }
    }, [trueParamEmail])
    
    useEffect(() => {
        console.log(messages)
    }, [messages])
    
    useEffect(() => {
        if (socketId !== '') {
        const addSocket = async () => {
            await fetch('http://localhost:4000/users-controller/add/socket', {
                method: "PATCH",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ socketId }),
                credentials: 'include',
            })
        }
        addSocket()
        }
    }, [socketId])

    if (file === null) {
        if (trueEmail !== '' && Array.isArray(usersBan) && mySubs !== null && userSubs !== null && userPermMess !== null) {
            if (usersBan.includes(trueEmail) === false) {
                if (userPermMess === 'Все' || (userPermMess === 'Только друзья' && mySubs.includes(trueParamEmail) && userSubs.includes(trueEmail))) {
                    showMessInter = <div className="message-input-container">
                    <div className="reply-indicator">
                        <p>{answMess}</p>
                        {answMess !== '' ? <div className="reply-close" onClick={() => setAnswMess('')}>×</div> : null}                        
                    </div>
                    {overStatus === false ? <input 
                            placeholder="Сообщение" 
                            className="message-input"
                            onChange={async(event: ChangeEvent<HTMLInputElement>) => {
                            setInputMess(event.target.value)
                            await fetch('http://localhost:4000/users-controller/typing', {
                                method: "POST",
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ trueParamEmail }),
                                credentials: 'include',
                            })
                            }} 
                            value={inputMess}
                            onDragOver={((e) => {
                                e.preventDefault()
                                setOverStatus(true)
                            })}
                        /> : <div style={{width: 300, height: 100, border: '2px solid black'}} onDragOver={((e) => e.preventDefault())} onDragLeave={((e) => {
                            e.preventDefault()
                            setOverStatus(false)
                        })} onDrop={((e) => {
                            e.preventDefault()
                            const files = e.dataTransfer.files
                            if (files.length > 0) {
                                const resultFile = files[0]
                                if (resultFile) {
                                    if (resultFile.type === 'image/png' || resultFile.type === 'image/jpeg') {
                                        const reader = new FileReader();
                                        reader.onload = async (event) => {
                                            const resultPhoto = event.target?.result as string
                                            setImageBase64([...imageBase64, {file: resultFile, base64: resultPhoto}])
                                        };
                                        reader.readAsDataURL(resultFile);
                                    } else if (resultFile.type === 'video/mp4') {
                                        setFile({file: resultFile, type: 'video'})
                                    } else {
                                        setFile({file: resultFile, type: 'file'})
                                    }
                                }
                            }
                        })}>
                                <p>Копировать файл</p>
                            </div>}
                    <div className="input-group">
                        <label className="file-upload-btn">
                            📎
                        <input type="file" accept="image/*" onChange={handleFileChange} className="file-input"/>
                        </label>
                        <div className="gif-btn" onClick={() => {
                            if (gifsArr.length === 0) {
                                getAllGifs()
                            } else {
                                setGifsArr([])
                            }
                        }}>🎬</div>
                        {startStop === false ? 
                            <div className="record-btn" onClick={async() => {
                                startRecording()
                                setStartStop(true)
                                await fetch('http://localhost:4000/users-controller/start/voice', {
                                    method: "POST",
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({ trueParamEmail }),
                                    credentials: 'include',
                                })
                            }}>🎤</div> : 
                            <div className="stop-record-btn" onClick={async() => {
                                setStartStop(false)
                                stopRecording()
                                await fetch('http://localhost:4000/users-controller/stop/voice', {
                                    method: "POST",
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({ trueParamEmail }),
                                    credentials: 'include',
                                })
                            }}>⏹️</div>
                        }
                    <input type="file" onChange={async(e: ChangeEvent<HTMLInputElement>) => {
                        const resultFile = e.target.files?.[0];
                            if (resultFile) {
                                const reader = new FileReader();
                                reader.onload = async (event) => {
                                    setFile({file: resultFile, type: 'video'})
                                };
                                reader.readAsDataURL(resultFile);
                            }
                        }}/>
                        {processSendMess === false ? <SendBtn sendMess={sendMess} editMess={editMess} inputMess={inputMess} type={'text'} imageBase64={imageBase64}/> : <ClipLoader/>}
                    </div>
                </div>
                } else {
                    showMessInter = <div className="restricted-message">
                    <p>Пользователь ограничил отправку сообщений</p>
                </div>
                }
            } else {
                showMessInter = <div className="restricted-message">
                    <p>Пользователь ограничил отправку сообщений</p>
                </div>
            }
        }
    } else {
        showMessInter = <div className="restricted-message">
            <p>Видеофайл    </p>
        </div>
    }

    return (
        <div className="chat-container">
            <Call/>
            <div className="chat-header">
                {trueParamEmail === trueEmail ? <h3 className="chat-user-name">Избранное</h3> : <h3 className="chat-user-name" onClick={() => window.location.href=`/${trueParamEmail}`}>{trueParamEmail}</h3>}
                {trueEmail !== trueParamEmail ? <button onClick={() => window.open(`/call/${trueParamEmail}`, '_blank')}>Позвонить</button> : null}
                {trueEmail !== trueParamEmail ? <div className="online-status">
                    <span className={`status-dot ${onlineStatus === 'Online' ? 'online' : 'offline'}`}></span>
                    <span>{onlineStatus}</span>
                </div> : null}
                {bonuceAction === true ? <div className="chat-actions">
                    {banBtn}
                    {messages?.length !== 0 ? <button className="files-btn" onClick={() => window.location.href=`/files/${trueParamEmail}`}>Файлы чата</button> : null}
                    <button className="close-actions-btn" onClick={() => setBonuceAction(false)}>✕</button>
                </div> : <button className="show-actions-btn" onClick={() => setBonuceAction(true)}>⋮</button>}
            </div>

            <div className="typing-indicator">
                {typing && <p>{typing}</p>}
            </div>

            {sucCopy === true ? <div className="copy-notification"><p>Текст успешно скопирован!</p></div> : null}
            
            {videoMessId ? <Video videoMessId={videoMessId} setVideoMessId={setVideoMessId} trueParamEmail={trueParamEmail}/> : null}

            <div className="messages-container">
                {showMess}
            </div>

            {photos}
            {showGifs}
            {file ? <div>
                <p onClick={() => setFile(null)}>X</p>
                <h3>{file.type === 'video' ? 'Видеофайл' : 'Файл'}</h3>
                {processSendMess === false ? <SendBtn sendMess={sendMess} editMess={editMess} inputMess={inputMess} type={file.type} imageBase64={[{file: file.file, base64: ''}]}/> : <ClipLoader/>}
            </div> : null}
            {showMessInter}
        </div>
    )
}

export default UserChat