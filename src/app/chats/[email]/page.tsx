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

interface SendPhoto{
    file: File;
    base64: string;
}

const UserChat: FC = () => {
    
    const { startRecording, stopRecording, mediaBlobUrl } = useReactMediaRecorder({audio: true});
    

    const socket = io('http://localhost:4000')

    const {} = useCheckReg()

    const [socketId, setSocketId] = useState ('')

    const { email, trueEmail, setEmail, setTrueEmail } = useGetEmail()
    const { trueParamEmail, setTrueParamEmail } = useGetTrueParamEmail()

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

    if (Array.isArray(myBanArr)) {
        if (myBanArr.includes(trueParamEmail)) {
            const email = trueEmail
            banBtn = <button onClick={async() => {
                await fetch('http://localhost:4000/users-controller/unban/user', {
                    method: "PATCH",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, trueParamEmail })
                })
                window.location.reload()
            }}>Разблокировать</button>
        } else {
            banBtn = <button onClick={async() => {
                await fetch('http://localhost:4000/users-controller/ban/user', {
                    method: "PATCH",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, trueParamEmail })
                })
                window.location.reload()
            }}>Заблокировать</button>
        }
    }

    const getAllGifs = () => {
        setGifsArr([...gifs.smile, ...gifs.money, ...gifs.sad])
    }

    if (gifsArr.length !== 0) {
        showGifs = <div>
            <button onClick={getAllGifs}>Все</button>
            <button onClick={() => setGifsArr(gifs.smile)}>Улыбка</button>
            <button onClick={() => setGifsArr(gifs.money)}>Деньги</button>
            <button onClick={() => setGifsArr(gifs.sad)}>Грустно</button>
            <ul>
                {gifsArr.map((item, index) => <li key={index}><img src={item} width={150} height={150} onClick={async() => {
                    const { formattedDate, messId } = getMessIdAndDate()
                    if (messages) { 
                        if (messages.length !== 0) {
                            const formData = new FormData()
                            formData.append('user', trueEmail)
                            formData.append('text', item)
                            formData.append('date', formattedDate)
                            formData.append('id', messId)
                            formData.append('ans', answMess)
                            formData.append('code', email)
                            formData.append('trueParamEmail', trueParamEmail)
                            formData.append('per', '')
                            formData.append('type', 'gif')
                            await fetch('http://localhost:4000/users-controller/new/mess', {
                                method: "PATCH",
                                body: formData,
                            })
                            setMessages([...messages, {user: trueEmail, text: item, photos: [], date: formattedDate, id: messId, ans: answMess, edit: false, typeMess: 'gif', per: '', controls: false, pin: false}])
                            setGifsArr([])
                            setAnswMess('')
                        } else {
                            const formData = new FormData()
                            formData.append('user', trueEmail)
                            formData.append('text', item)
                            formData.append('date', formattedDate)
                            formData.append('id', messId)
                            formData.append('ans', answMess)
                            formData.append('code', email)
                            formData.append('trueParamEmail', trueParamEmail)
                            formData.append('per', '')
                            formData.append('type', 'gif')
                            await fetch('http://localhost:4000/users-controller/new/chat', {
                                method: "PATCH",
                                body: formData,
                            })
                            setMessages([{user: trueEmail, text: item, photos: [], date: formattedDate, id: messId, ans: answMess, edit: false, typeMess: 'gif', per: '', controls: false, pin: false}])
                            setGifsArr([])
                        }
                    }
                }}/></li>)}
            </ul>
        </div>
    }

    if (imageBase64.length !== 0) {
        photos = <div>
            <ul>
                {imageBase64.map((item, index) => <li key={index}><div>
                        <p onClick={() => {
                            let resultImages = []
                            for (let el of imageBase64) {
                                if (el.base64 !== item.base64) {
                                    resultImages.push(el)
                                }
                            }
                            setImageBase64(resultImages)
                        }}>X</p>
                        <img src={item.base64} width={100} height={100}/>
                    </div></li>)}
            </ul>
        </div>
    }


    if (messages !== null) {
        if (messages.length === 0) {
            showMess = <h2>Этот чат пока пуст</h2>
        } else if (messages.length !== 0) {
            showMess = <MessDisplay messages={messages} email={trueEmail} trueParamEmail={trueParamEmail} setMessages={setMessages} setAnswMess={setAnswMess} setEditMess={setEditMess} setInputMess={setInputMess} setSucCopy={setSucCopy} pinMess={pinMess} setPinMess={setPinMess}/>
        }
    } else {
        showMess = <h2>Загрузка...</h2>
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

    const zeroMess = async (email: string, trueParamEmail: string) => {
        await fetch('http://localhost:4000/users-controller/zero/mess', {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, trueParamEmail })
        })
    }

    const getMessages = async () => {
        const getMess = await fetch(`http://localhost:4000/users-controller/get/mess`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, trueParamEmail })
        })
        const resultMess = await getMess.json()
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
        setMessages(myMess)
    }

    const getBanArr = async () => {
        const banArr = await fetch(`http://localhost:4000/users-controller/get/ban/mess/${trueParamEmail}`)
        const resultBanArr = await banArr.json()
        setUsersBan(resultBanArr)
    }

    const getMyBanArr = async () => {
        const banArr = await fetch(`http://localhost:4000/users-controller/get/my/ban/mess/${trueEmail}`)
        const resultBanArr = await banArr.json()
        setMyBanArr(resultBanArr)
    }

    const getUserPermAndSubs = async () => {
        const email = trueEmail
        const getPermData = await fetch('http://localhost:4000/users-controller/get/perm/data', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, trueParamEmail })
        })
        const resultPermData = await getPermData.json()
        setMySubs(resultPermData.mySubs)
        setUserSubs(resultPermData.friendSubs)
        setUserPermMess(resultPermData.friendPermMess)
    }

    useEffect(() => {
        if (typing !== '' && typing !== 'Записывает голосовое сообщение') {
            setTimeout(() => {
                setTyping('')
            }, 1000);
        }
    }, [typing])

    useEffect(() => {
        if (trueEmail !== '' && trueParamEmail !== '') {
            const getOnlineStatus = async () => {
                await fetch('http://localhost:4000/users-controller/get/online/status', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ trueEmail, trueParamEmail })
                })
            }
            getOnlineStatus()
        }
    }, [trueEmail, trueParamEmail])

    useEffect(() => {
        if (sucCopy === true) {
            setTimeout(() => {
                setSucCopy(false)
            }, 2000);
        }
    }, [sucCopy])

    useEffect(() => {
        if (trueParamEmail !== '' && trueEmail !== '' && email !== '') {
            getMessages()
            getBanArr()
            getMyBanArr()
            getUserPermAndSubs()
        }
        zeroMess(email, trueParamEmail)
    }, [trueParamEmail, trueEmail, email])

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
                        formData.append('code', email)
                        formData.append('trueParamEmail', trueParamEmail)
                        formData.append('per', '')
                        formData.append('type', 'voice')
                        await fetch('http://localhost:4000/users-controller/new/mess', {
                            method: "PATCH",
                            body: formData,
                        })
                        setMessages([...messages, {user: trueEmail, text: base64String, photos: [], date: formattedDate, id: messId, ans: answMess, edit: false, typeMess: 'voice', controls: false, per: '', pin: false}])
                        setAnswMess('')
                    } else {
                        const formData = new FormData()
                        formData.append('user', trueEmail)
                        formData.append('text', base64String)
                        formData.append('date', formattedDate)
                        formData.append('id', messId)
                        formData.append('ans', answMess)
                        formData.append('code', email)
                        formData.append('trueParamEmail', trueParamEmail)
                        formData.append('per', '')
                        formData.append('type', 'voice')
                        await fetch('http://localhost:4000/users-controller/new/chat', {
                            method: "PATCH",
                            body: formData,
                        })
                        setMessages([...messages, {user: trueEmail, text: base64String, photos: [], date: formattedDate, id: messId, ans: answMess, edit: false, typeMess: 'voice', controls: false, per: '', pin: false}])
                        setAnswMess('')
                        setMessages([{user: trueEmail, text: base64String, photos: [], date: formattedDate, id: messId, ans: '', edit: false, typeMess: 'voice', controls: false, per: '', pin: false}])
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

        socket.on('replyMessage', async(message: {type: string, user: string, text: string, photos: string[], date: string, id: string, ans: string, socketId?: string, mess: Message[], typeMess: 'text', per: string}) => {
            if (message.type === 'message') {
                setTrueParamEmail(prev => {
                if (prev === message.user) {
                    setMessages(prev => {
                        if (prev) {
                            return [...prev, {...message, controls: false, pin: false}]
                        } else {
                            return prev
                        }
                    });
                }
                return prev
            })
            setEmail(prev => {
                setTrueParamEmail(paramPrev => {
                    zeroMess(prev, paramPrev)
                    return paramPrev
                })
                return prev
            })
            const user = message.user
            setEmail(prev => {
                let email = prev
                if (document.visibilityState !== 'visible') {
                    getUserChats(email, user)
                }
                return prev
            })
            const userSocket = message.socketId
            await fetch(`http://localhost:4000/users-controller/zero/mess/count/${userSocket}`)
            } else if (message.type === 'typing') {
                setTrueParamEmail(prev => {
                    if (message.user === prev) {
                        console.log('typing')
                    setTyping('Печатает...')
                }
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
                    if (prev === message.user) {
                        setTyping('Записывает голосовое сообщение')
                    }
                    return prev
                })
            } else if (message.type === 'stopVoice') {
                setTrueParamEmail(prev => {
                    if (prev === message.user) {
                        setTyping('')
                    }
                    return prev
                })
            } else if (message.type === 'giveOnlineStatus') {
                setOnlineStatus('Online')
            } else if (message.type === 'onlineStatus') {
                const userEmail = message.user
                await fetch('http://localhost:4000/users-controller/give/online/status', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userEmail })
                })
            }
        });
    }, [])
    
    useEffect(() => {
        if (socketId !== '' && trueEmail !== '') {
        const addSocket = async () => {
            await fetch('http://localhost:4000/users-controller/add/socket', {
                method: "PATCH",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                body: JSON.stringify({ email, socketId })
            })
        }
        addSocket()
        }
    }, [socketId, trueEmail])


    if (trueEmail !== '' && Array.isArray(usersBan) && mySubs !== null && userSubs !== null && userPermMess !== null) {
        if (usersBan.includes(trueEmail) === false) {
            if (userPermMess === 'Все' || (userPermMess === 'Только друзья' && mySubs.includes(trueParamEmail) && userSubs.includes(trueEmail))) {
                showMessInter = <div>
                <div>
                    <p>{answMess}</p>
                    {answMess !== '' ? <p onClick={() => setAnswMess('')}>X</p> : null}                        
                </div>
                <input placeholder="Сообщение" onChange={async(event: ChangeEvent<HTMLInputElement>) => {
                setInputMess(event.target.value)
                const email = trueEmail
                await fetch('http://localhost:4000/users-controller/typing', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, trueParamEmail })
                })
                }} value={inputMess}/>
            <input type="file" onChange={handleFileChange}/>
            {showGifs}
            <img src='/images/images.png' width={40} height={40} onClick={() => {
                if (gifsArr.length === 0) {
                    getAllGifs()
                } else {
                    setGifsArr([])
                }
            }}/>
            <SendBtn inputMess={inputMess} editMess={editMess} setAnswMess={setAnswMess} setEditMess={setEditMess} setMessages={setMessages} setInputMess={setInputMess} setImageBase64={setImageBase64} imageBase64={imageBase64} messages={messages} email={email} trueEmail={trueEmail} trueParamEmail={trueParamEmail} socketId={socketId} answMess={answMess}/>
            {startStop === false ? <button onClick={async() => {
                startRecording()
                setStartStop(true)
                const email = trueEmail
                await fetch('http://localhost:4000/users-controller/start/voice', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, trueParamEmail })
                })
            }}>Запись</button> : <button onClick={async() => {
                stopRecording()
                const email = trueEmail
                await fetch('http://localhost:4000/users-controller/stop/voice', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, trueParamEmail })
                })
            }}>Стоп</button>}
            </div>
            } else {
                showMessInter = <div>
                <p>Пользователь ограничил отправку сообщений</p>
            </div>
            }
        } else {
            showMessInter = <div>
                <p>Пользователь ограничил отправку сообщений</p>
            </div>
        }
    }

    return (
        <div style={{height: '100vh'}}>
            <h3 onClick={() => window.location.href=`/${trueParamEmail}`}>{trueParamEmail}</h3>
            <p>{onlineStatus}</p>
            {bonuceAction === true ? <div>
                {banBtn}
                {messages?.length !== 0 ? <button onClick={() => window.location.href=`/files/${trueParamEmail}`}>Файлы чата</button> : null}
                <button onClick={() => setBonuceAction(false)}>Закрыть</button>
            </div> : <button onClick={() => setBonuceAction(true)}>Раскрыть</button>}
            <p>{typing}</p>
            {sucCopy === true ? <p>Текст успешно скопирован!</p> : null}
            {showMess}
            {photos}
            {showMessInter}
        </div>
    )
}

export default UserChat