'use client'

import { ChangeEvent, FC, useEffect, useState } from "react"
import useGetTrueParamEmail from "@/app/useGetTrueParamEmail"
import useGetEmail from "@/app/useGetEmail"
import { Message, PhotoMess } from "@/app/Chat"
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
import AnchorLink from 'react-anchor-link-smooth-scroll'
import { Link, scroller } from "react-scroll"
import BanBtn from "./BanBtn"
import Gifs from "./Gifs"
import sendMess from "./sendMess"
import PinMessInter from "../PinMessInter"
import getMessages from "../getMessages"
import getGifs from "./getGifs"
import SearchMess from "./SearchMess"


export interface SendPhoto{
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

    const [messFind, setMessFind] = useState <{id: string, text: string, date: string}[] | null> (null)
    const [messFindInput, setMessFindInput] = useState <string> ('')
    const [files, setFiles] = useState <File[]> ([])
    const [pinMess, setPinMess] = useState <PinMessInter | null> (null)
    const [overStatus, setOverStatus] = useState <boolean> (false)
    const [processSendMess, setProcessSendMess] = useState <boolean> (false)
    const [videoMessId, setVideoMessId] = useState <string | null> (null)
    const [videoFile, setVideoFile] = useState <{file: File, type: string} | null> (null)
    const [onlineStatus, setOnlineStatus] = useState <string> ('Offline')
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
    let showVideoSend;

    if (messages) {
        if (messages.length > 0) {
            showVideoSend = <input type="file" onChange={async(e: ChangeEvent<HTMLInputElement>) => {
            const resultFile = e.target.files?.[0];
                if (resultFile) {
                    const reader = new FileReader();
                    reader.onload = async (event) => {
                        setVideoFile({file: resultFile, type: 'video'})
                    };
                    reader.readAsDataURL(resultFile);
                }
            }}/>
        }
    }

    if (trueEmail !== trueParamEmail) {
        if (Array.isArray(myBanArr)) {
            if (myBanArr.includes(trueParamEmail)) {
                banBtn = <BanBtn trueParamEmail={trueParamEmail} banStatus={false}/>
            } else {
                banBtn = <BanBtn trueParamEmail={trueParamEmail} banStatus={true}/>
            }
        }
    }

    const getAllGifs = async () => {
        const resultGifs = await getGifs()
        setGifsArr(resultGifs)
    }

    const succesSend = (mess: Message[], messId: string) => {
        console.log('Messages: ')
        console.log(mess)
        if (messages) {
            const resultMess = mess.map(el => {
                if (el.id === messId) {
                    return {...el, sending: false}
                } else {
                    return el
                }
            })
            setMessages(resultMess)
        }
    }

    const getSaveInput = () => {
        const thisUserInput = localStorage.getItem(trueParamEmail)
        if (thisUserInput) {
            setInputMess(thisUserInput)
        }
    }

    if (gifsArr.length !== 0) {
        showGifs = <Gifs gifsArr={gifsArr} getAllGifs={getAllGifs} setGifsArr={setGifsArr} messages={messages} trueEmail={trueEmail} trueParamEmail={trueParamEmail} answMess={answMess} setInputMess={setInputMess} setMessages={setMessages} backUpMess={backUpMess} succesSend={succesSend}/>
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
            showMess = <MessDisplay messages={messages} email={trueEmail} trueParamEmail={trueParamEmail} setMessages={setMessages} setAnswMess={setAnswMess} setEditMess={setEditMess} setInputMess={setInputMess} setSucCopy={setSucCopy} setVideoMessId={setVideoMessId} pinMess={pinMess} setPinMess={setPinMess}/>
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

    const sendFiles = async () => {
        for (let file of files) {
            await sendMess('file', inputMess, imageBase64, videoFile, messages, editMess, trueEmail, setMessages, answMess, setAnswMess, setImageBase64, setVideoFile, setInputMess, setOverStatus, setFiles, files, succesSend, trueParamEmail, backUpMess, setEditMess, setProcessSendMess, file.name, file)
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

    const scrollToMessage = (messId: string) => {
        scroller.scrollTo(messId, {
            duration: 500,
            smooth: true,
            containerId: 'messages-container', 
            offset: -50
        });
    };

    useEffect(() => {
        if (typing !== '' && typing !== 'Записывает голосовое...') {
            setTimeout(() => {
                setTyping('')
            }, 1000);
        }
    }, [typing])

    useEffect(() => {
        if (videoFile !== null) {
            setImageBase64([])
        }
    }, [videoFile])

    useEffect(() => {
        if (inputMess !== '') {
            localStorage.setItem(trueParamEmail, inputMess)
        } else {
            localStorage.removeItem(trueParamEmail)
        }
    }, [inputMess])

    useEffect(() => {
        const handleGlobalKeyPress = (event: any) => {
          if (event.key === 'Enter') {
            setVideoFile(prev => {
                if (prev) {
                    sendMess('video', inputMess, imageBase64, videoFile, messages, editMess, trueEmail, setMessages, answMess, setAnswMess, setImageBase64, setVideoFile, setInputMess, setOverStatus, setFiles, files, succesSend, trueParamEmail, backUpMess, setEditMess, setProcessSendMess)
                    return prev
                } else {
                    setFiles(prevFiles => {
                        if (prevFiles.length !== 0) {
                            sendFiles()
                            return prevFiles
                        } else {
                            sendMess('text', inputMess, imageBase64, videoFile, messages, editMess, trueEmail, setMessages, answMess, setAnswMess, setImageBase64, setVideoFile, setInputMess, setOverStatus, setFiles, files, succesSend, trueParamEmail, backUpMess, setEditMess, setProcessSendMess)
                            return prevFiles
                        }
                    })
                    return prev
                }
            })
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
        if (messFindInput === '') {
            setMessFind(null)
        }
    }, [messFindInput])

    useEffect(() => {
        if (trueParamEmail !== '' && trueEmail !== '') {
            getMessages(trueParamEmail, setPinMess, setMessages)
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
                    sendMess('voice', base64String, imageBase64, videoFile, messages, editMess, trueEmail, setMessages, answMess, setAnswMess, setImageBase64, setVideoFile, setInputMess, setOverStatus, setFiles, files, succesSend, trueParamEmail, backUpMess, setEditMess, setProcessSendMess)
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

        socket.on('replyMessage', async(message: {type: string, user: string, text: string, photos: PhotoMess[], date: string, id: string | string[], ans: string, socketId?: string, mess: Message[], typeMess: string, per: string}) => {
            if (message.type === 'message') {
                setTrueParamEmail(prev => {
                if (prev === message.user) {
                    setMessages(prev => {
                        if (prev) {
                            if (typeof message.id === 'string') {
                                return [...prev, {user: message.user, text: message.text, id: message.id, photos: message.photos, date: message.date, typeMess: message.typeMess, ans: message.ans, controls: false, per: message.per, pin: false, read: false, sending: false}]
                            } else {
                                return prev
                            }
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
                        if (typeof message.id !== 'string') {
                            const newMess = prev.map(el => {
                                if (message.id.includes(el.id)) {
                                    return false
                                } else {
                                    return el
                                }
                            })
                            const resultNewMess = newMess.filter(el => el !== false)
                            return resultNewMess
                        } else {
                            return prev
                        }
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
            getSaveInput()
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

    if (videoFile === null) {
        if (files.length === 0) {
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
                            if (messages) { 
                                if (messages.length > 0) {
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
                                                setVideoFile({file: resultFile, type: 'video'})
                                            } else {
                                                if (messages?.length !== 0) {
                                                    setFiles([resultFile])
                                                }
                                            }
                                        }
                                    }
                                }
                                e.preventDefault()
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
                        {showVideoSend}
                        {processSendMess === false ? <SendBtn sendMess={sendMess} editMess={editMess} inputMess={inputMess} type='text' imageBase64={imageBase64} messages={messages} setEditMess={setEditMess} trueEmail={trueEmail} trueParamEmail={trueParamEmail} setAnswMess={setAnswMess} setImageBase64={setImageBase64} setVideoFile={setVideoFile} setInputMess={setInputMess} videoFile={videoFile} setMessages={setMessages} setProcessSendMess={setProcessSendMess} backUpMess={backUpMess} succesSend={succesSend} answMess={answMess} setOverStatus={setOverStatus} files={files} setFiles={setFiles}/> : <ClipLoader/>}
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
            showMessInter = <div>
                <p onClick={() => setFiles([])}>X</p>
                {files.map((item, index) => <p key={index}>Файл {index + 1}</p>)}
                <input type="file" accept=".xlsx, .docx, .pdf" onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const resultFile = e.target.files?.[0];
                    if (resultFile) {
                        const reader = new FileReader();
                        reader.onload = async (event) => {
                            setFiles([...files, resultFile])
                        };
                        reader.readAsDataURL(resultFile);
                    }
                }}/>
                <button onClick={sendFiles}>Отправить</button>
            </div>
        }
    } else {
        showMessInter = <div className="restricted-message">
            <p>Видеофайл</p>
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

            {pinMess ? <div onClick={() => {
                scrollToMessage(pinMess.pinMessages[pinMess.messIndex].id)
                if (pinMess.pinMessages.length !== 1) {
                    if (pinMess.direction === 'up') {
                        if ((pinMess.messIndex) > (pinMess.pinMessages.length)) {
                            setPinMess({pinMessages: pinMess.pinMessages, messIndex: pinMess.messIndex + 1, direction: pinMess.direction})
                        } else if ((pinMess.messIndex) === (pinMess.pinMessages.length - 1)) {
                            setPinMess({pinMessages: pinMess.pinMessages, messIndex: pinMess.messIndex - 1, direction: 'down'})
                        }
                    } else if (pinMess.direction === 'down') {
                        if ((pinMess.messIndex) > 0) {
                            setPinMess({pinMessages: pinMess.pinMessages, messIndex: pinMess.messIndex - 1, direction: pinMess.direction})
                        } else if ((pinMess.messIndex) === 0) {
                            setPinMess({pinMessages: pinMess.pinMessages, messIndex: pinMess.messIndex + 1, direction: 'up'})
                        }
                    }
                }
            }}>
                <p>{pinMess.pinMessages[pinMess.messIndex].text} </p><span>#{pinMess.messIndex + 1}</span>
            </div> : null}

            {messages?.length !== 0 ? <SearchMess messages={messages} messFindInput={messFindInput} setMessFind={setMessFind} setMessFindInput={setMessFindInput}/> : null}
            {messFind ? <div>
                {messFind.length !== 0 ? <ul>
                    {messFind.map((item, index) => <li key={index} onClick={() => scrollToMessage(item.id)}><div><p>{item.text}</p><p>{item.date}</p></div></li>)}
                </ul> : <p>Ничего не найдено</p>}
            </div> : null}
            
            <div id="messages-container" className="messages-container">
                {showMess}
            </div>

            {photos}
            {showGifs}
            {videoFile ? <div>
                <p onClick={() => setVideoFile(null)}>X</p>
                <h3>{videoFile.type === 'video' ? 'Видеофайл' : 'Файл'}</h3>
                {processSendMess === false ? <SendBtn sendMess={sendMess} editMess={editMess} inputMess={videoFile.file.name} type='video' imageBase64={imageBase64} messages={messages} setEditMess={setEditMess} trueEmail={trueEmail} trueParamEmail={trueParamEmail} setAnswMess={setAnswMess} setImageBase64={setImageBase64} setVideoFile={setVideoFile} setInputMess={setInputMess} videoFile={videoFile} setMessages={setMessages} setProcessSendMess={setProcessSendMess} backUpMess={backUpMess} succesSend={succesSend} answMess={answMess} setOverStatus={setOverStatus} files={files} setFiles={setFiles}/> : <ClipLoader/>}
            </div> : null}
            {showMessInter}
        </div>
    )
}

export default UserChat