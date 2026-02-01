'use client'

import { ChangeEvent, FC, useEffect, useState } from "react"
import useGetEmail from "../useGetEmail"
import Chat from "../Chat"
import { io } from "socket.io-client";
import Message from "../../../server-for-photogram/src/Message";
import UserInterface from "../UserInterface"
import useCheckReg from "../CheckReg";
import getUserChats from "../getChats";
import styles from './Chats.module.css';
import Call from "../Call";
import useOnlineStatus from "../useOnlineStatus";
import NameSearch from "../NameSearch";
import decryptMess from "./decrpytMess";
import useCheckPrivateKey from '../useCheckPrivateKey'

interface MessageWithBonuce extends Message{
    origUser: string;
    origId: string;
}

const Chats: FC = () => {
    const socket = io('http://localhost:4000')
    const [socketId, setSocketId] = useState('')

    const {} = useCheckReg()
    const {} = useOnlineStatus()
    const {} = useCheckPrivateKey()

    const { trueEmail, setTrueEmail } = useGetEmail()
    const [shareMess, setShareMess] = useState<MessageWithBonuce | null>(null)
    const [basePerm, setBasePerm] = useState<string>('')
    const [changePerm, setChangePerm] = useState<string>('')
    const [chats, setChats] = useState<Chat[] | null>(null)  
    const [deleteWarn, setDeleteWarn] = useState <{friendEmail: string, friendDel: boolean} | null> (null)
    const [typing, setTyping] = useState <string> ('')
    const [sendMess, setSendMess] = useState <string> ('')

    let showChats;
    let showChangePerm;
    let saveChangePermBtn;
    let shareMessage;

    if (shareMess) {
        shareMessage = <div className={styles.shareMessage}>
            <p onClick={() => {
                setShareMess(null)
                localStorage.removeItem('shareMess')
            }}>X</p>
            <p>Переслать сообщение от {shareMess.per}</p>
        </div>
    }

    if (changePerm !== '' && changePerm !== basePerm) {
        saveChangePermBtn = <button 
            className={styles.saveButton}
            onClick={async() => {
                await fetch('http://localhost:4000/users-controller/new/perm/mess', {
                    method: "PATCH",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ changePerm }),
                    credentials: 'include',
                })
                setBasePerm(changePerm)
            }}
        >
            Сохранить
        </button>
    }

    if (basePerm !== '') {
        showChangePerm = <div className={styles.permSettings}>
            <p>Кто может мне писать</p>
            <p>Сейчас: {basePerm}</p>
            <select 
                value={changePerm} 
                onChange={(event: ChangeEvent<HTMLSelectElement>) => setChangePerm(event.target.value)}
            >
                <option value='Все'>Все</option>
                <option value='Никто'>Никто</option>
                <option value='Только друзья'>Только друзья</option>
            </select>
            {saveChangePermBtn}
        </div>
    }

    const sortChats = (finalChats: Chat[]) => {
        let myResultChats = []
        const pinnedChats = finalChats.filter((el: Chat) => el.pin === true)
        myResultChats = [...pinnedChats]
        const unpinnedChats = finalChats.filter((el: Chat) => el.pin === false)
        unpinnedChats.sort((a: Chat, b: Chat) => b.messCount - a.messCount)
        myResultChats = [...myResultChats, ...unpinnedChats]
        return myResultChats
    }

    const getChats = async (prevEmail?: string) => {
        let resChats = []
        if (prevEmail) {
            const chats = await fetch('http://localhost:4000/users-controller/get/chats', {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            })
            const resultChats = await chats.json()
            resChats = resultChats
        } else {
            const chats = await fetch('http://localhost:4000/users-controller/get/chats', {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            })
            const resultChats = await chats.json()  
            if (resultChats.length !== 0) {
                const resultMyChats = resultChats.map((el: any) => {
                    const resultMess = decryptMess(el.messages, trueEmail)
                    const checkAllText = resultMess.every((element: any) => element.text === undefined)
                    if (checkAllText === true) {
                        return false
                    } else {
                        return {
                            ...el,
                            messages: resultMess,
                        }
                    }
                })
            resChats = resultMyChats.filter((el: any) => el !== false)
            console.log(resChats)
            } else {
                resChats = resultChats
            }
        }
        if (resChats.length !== 0) {
            const allUsers = await fetch('http://localhost:4000/users-controller/get/all/users')
            const resultUsers = await allUsers.json()
            const finalChats = resChats.map((el: Chat) => {
                const findUser = resultUsers.find((element: UserInterface) => element.email === el.user)
                return {
                    ...el,
                    avatar: findUser.avatar,
                }
            })
            const newChats = sortChats(finalChats)
            setChats(newChats)
        } else {
            setChats(resChats)
        }
    }

    const pinUnpinChat = async (user: string, pin: boolean) => {
        const newChats = await fetch('http://localhost:4000/users-controller/pin/chat', {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user, pin }),
            credentials: 'include',
        })
        const resultChats = await newChats.json()
        const allUsers = await fetch('http://localhost:4000/users-controller/get/all/users')
        const resultUsers = await allUsers.json()
        const finalChats = resultChats.map((el: Chat) => {
            const findUser = resultUsers.find((element: UserInterface) => element.email === el.user)
            return {
                ...el,
                avatar: findUser.avatar,
            }
        })
        const resultNewChats = sortChats(finalChats)
        setChats(resultNewChats)
    }

    const changeNotifs = async (notifs: boolean, user: string) => {
        await fetch('http://localhost:4000/users-controller/change/notifs', {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ notifs, user }),
            credentials: 'include',
        })
        if (chats !== null) {
            const newChats = chats.map(el => {
                if (el.user === user) {
                    return {
                        ...el,
                        notifs: notifs,
                    }
                } else {
                    return el
                }
            })
            setChats(newChats)
        }
    }
    
    if (chats !==  null) {
        if (chats.length === 0) {
            showChats = <div className={styles.noChats}>Чатов пока нет</div>
        } else {
            showChats = <div className={styles.chatsList}>
                <ul>
                    {chats.map((item, index) => {
                        let lastMess;
                        const lastMessage = item.messages[item.messages.length - 1];

                        if (!localStorage.getItem(item.user)) {
                            if (sendMess !== item.user) {
                                if (typing !== item.user) {
                                    if (lastMessage.typeMess === 'text') {
                                        if (lastMessage.text === '') {
                                            lastMess = <span>Фото</span>
                                        } else {
                                            if (lastMessage.text.length < 50) {
                                                lastMess = <span>{lastMessage.text}</span>
                                            } else {
                                                lastMess = <span>{lastMessage.text.slice(0, 50)}...</span>
                                            }
                                        }
                                    } else if (lastMessage.typeMess === 'voice') {
                                        lastMess = <span>Голосовое сообщение</span>
                                    } else if (lastMessage.typeMess === 'gif') {
                                        lastMess = <span>GIF</span>
                                    } else if (lastMessage.typeMess === 'post') {
                                        lastMess = <span>Пост</span>
                                    } else if (lastMessage.typeMess === 'video') {
                                        lastMess = <span>Видео</span>
                                    } else {
                                        lastMess = <span>Файл</span>
                                    }
                                } else {
                                    lastMess = <span>Печатает...</span>
                                }
                            } else {
                                lastMess = <span>Отправка сообщения...</span>
                            }
                        } else {
                            lastMess = <span>[Черновик]</span>
                        }
                        
                        return <li key={index} className={`${styles.chatItem} ${item.pin ? styles.pinned : ''}`}>
                            <div>
                                {item.avatar === '' ? 
                                    <div className={styles.avatarPlaceholder}>{item.user.charAt(0).toUpperCase()}</div> : 
                                    <img src={item.avatar} className={styles.avatar} alt={item.user}/>
                                }
                            </div>
                            <div className={styles.chatContent}>
                                <h3 
                                    className={styles.userName}
                                    onClick={async() => {
                                        if (shareMess === null) {
                                            window.location.href=`/chats/${item.user}`
                                        } else {
                                            const formData = new FormData()
                                            formData.append('user', shareMess.user)
                                            formData.append('text', shareMess.text)
                                            formData.append('date', shareMess.date)
                                            formData.append('id', shareMess.id)
                                            formData.append('ans', '')
                                            formData.append('trueParamEmail', item.user)
                                            formData.append('per', shareMess.per)
                                            formData.append('type', shareMess.typeMess)
                                            formData.append('origUser', shareMess.origUser)
                                            formData.append('origId', shareMess.origId)
                                            const newChats = chats.map(el => {
                                                if (el.user === item.user) {
                                                    return {
                                                        ...el,
                                                        messages: [...el.messages, {user: shareMess.user, text: shareMess.text, photos: [], date: shareMess.date, id: shareMess.id, ans: '', edit: false, typeMess: shareMess.typeMess, pin: false, controls: false, per: '', read: false, sending: false}]
                                                    }
                                                } else {
                                                    return el
                                                }
                                                })
                                            setSendMess(item.user)
                                            setChats(newChats)
                                            setShareMess(null)
                                            const sendMess = await fetch('http://localhost:4000/users-controller/new/mess', {
                                                method: "PATCH",
                                                body: formData,
                                                credentials: 'include',
                                            })
                                            const resultSendMess = await sendMess.json()
                                            if (resultSendMess.status === 'OK') {
                                                localStorage.removeItem('shareMess')
                                                setSendMess('')
                                            } else {
                                                alert('Превышен допустимый объем файлов')
                                            }
                                        }
                                    }}
                                >
                                    {item.user === trueEmail ? 'Избранное' : item.user}
                                </h3>
                                <div className={styles.lastMessage}>
                                    {lastMessage.user === trueEmail && <span className={styles.youLabel}>Вы:</span>}
                                    {lastMess}
                                </div>
                            </div>
                            <div className={styles.chatActions}>
                                {item.pin === false ? 
                                    <button 
                                        className={styles.pinButton}
                                        onClick={() => pinUnpinChat(item.user, true)}
                                    >
                                        📌
                                    </button> : 
                                    <button 
                                        className={styles.pinButton}
                                        onClick={() => pinUnpinChat(item.user, false)}
                                    >
                                        ❌
                                    </button>
                                }
                                {item.messCount !== 0 && 
                                    <span className={styles.messageCount}>
                                        {item.messCount}
                                    </span>
                                }
                                {item.notifs === true ? 
                                    <img 
                                        src='/images/1191931.png' 
                                        className={styles.notifButton}
                                        onClick={() => changeNotifs(false, item.user)}
                                        alt="Уведомления включены"
                                    /> : 
                                    <img 
                                        src='/images/1691892266_grizly-club-p-kartinki-znachok-zvuka-bez-fona-28.png' 
                                        className={styles.notifButton}
                                        onClick={() => changeNotifs(true, item.user)}
                                        alt="Уведомления выключены"
                                    />
                                }
                                <button onClick={async() => setDeleteWarn({friendEmail: item.user, friendDel: false})}>Удалить чат</button>
                            </div>
                        </li>
                    })}
                </ul>
            </div>
        }
    } else {
        showChats = <div className={styles.loading}>Загрузка...</div>
    }

    useEffect(() => {
        if (trueEmail !== '') {
            getChats()
        }
    }, [trueEmail])

    useEffect(() => {
        socket.on('connect', () => {
            if (socket.id) {
                setSocketId(socket.id)
            }
        })

        socket.on('replyMessage', async(message: any) => {
            if (message.type === 'message') {
                console.log('New message')
                console.log(message)
                const user = message.user
                setTrueEmail((prev: any) => {
                    setChats((prevChats: any) => {
                        const findThisChat = prevChats.find((el: Chat) => el.user === user)
                        if (findThisChat !== undefined) {
                            const newChats = prevChats.map((el: any) => {
                                if (el.user === user) {
                                    const newMess = decryptMess([...el.messages, {user: message.user, text: message.text, id: message.id, photos: message.photos, date: message.date, typeMess: message.typeMess, ans: message.ans, controls: false, per: '', pin: false, read: false}], prev)
                                    return {
                                        ...el,
                                        messages: newMess,
                                        messCount: el.messCount + 1
                                    }
                                } else {
                                    return el
                                }
                            })
                            console.log('New chats: ')
                            console.log(newChats)
                            if (newChats) {
                                const resultChats = sortChats(newChats)
                                console.log('Result chats: ')
                                console.log(resultChats)
                                return resultChats
                            } else {
                                return prevChats
                            }
                        } else {
                            const newChats: Chat[] = [...prevChats, {user: user, messages: decryptMess([{user: message.user, text: message.text, id: message.id, photos: message.photos, date: message.date, typeMess: message.typeMess, ans: message.ans, controls: false, per: '', pin: false, read: false, sending: false}], prev), messCount: 1, avatar: '', pin: false, notifs: true}]
                            return newChats
                        }
                    })
                    return prev
                })
                if (document.visibilityState !== 'visible') {
                    getUserChats(user)
                }
            } else if (message.type === 'onlineStatus') {
                const userEmail = message.user
                await fetch('http://localhost:4000/users-controller/give/online/status', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userEmail })
                })
            } else if (message.type === 'delete') {
                console.log('Delete a message')
                setChats((prevChats: any) => {
                        const newChats = prevChats?.map((el: any) => {
                            if (el.user === message.user) {
                                const newMess = el.messages.map((element: any) => {
                                    if (message.id.includes(element.id)) {
                                        return false
                                    } else {
                                        return element
                                    }
                                })
                                const resultNewMess = newMess.filter((message: any) => message !== false)
                                console.log('Prev mess: ')
                                console.log(prevChats.messages)
                                console.log('New mess: ')
                                console.log(resultNewMess)
                                return {
                                    ...el,
                                    messages: resultNewMess,
                                    messCount: el.messCount - message.readStatus
                                }
                            } else {
                                return el
                            }
                        })
                        if (prevChats && newChats) {
                            const resultChats = sortChats(newChats)
                            return resultChats.filter(el => el.messages.length !== 0)
                        } else {
                            return prevChats
                        }
                    })
                } else if (message.type === 'typing') {
                    setTyping(message.user)
                }
            })
        }, [])

    useEffect(() => {
        const getStorage = localStorage.getItem('shareMess')
        if (getStorage) {
            setShareMess(JSON.parse(getStorage))
        }
    }, [])

    useEffect(() => {
        if (typing !== '') {
            setTimeout(() => {
                setTyping('')
            }, 1000);
        }
    }, [typing])

    const getPerm = async () => {
        const myPerm = await fetch(`http://localhost:4000/users-controller/get/perm/mess`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        })
        const resultPerm = await myPerm.text()
        setBasePerm(resultPerm)
        setChangePerm(resultPerm)
    }

    useEffect(() => {
        if (socketId !== '' && trueEmail !== '') {
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
            getPerm()
        }
    }, [socketId, trueEmail])

    useEffect(() => {
        console.log(deleteWarn)
    }, [deleteWarn])
    
    return (
        <div className={styles.container}>
            <Call/>
            <div className={styles.header}>
                {shareMessage}
                {showChangePerm}
            </div>
            <h3 onClick={() => window.location.href='/bot'}>AI-Chat</h3>
            {chats ? <NameSearch allUsers={chats} type="chats"/> : null}
            {showChats}
            {deleteWarn ? <div>
                <p>Вы уверены, что хотите удалить чат?</p>
                <p>Также удалить для {deleteWarn.friendEmail}</p>
                <input type="checkbox" onChange={() => setDeleteWarn({friendEmail: deleteWarn.friendEmail, friendDel: !deleteWarn.friendDel})}/>
                <button onClick={async() => {
                    const friendEmail = deleteWarn.friendEmail
                    const friendDel = deleteWarn.friendDel
                    const deleteChat = await fetch('http://localhost:4000/users-controller/delete/chat', {
                        method: "PATCH",
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ friendEmail, friendDel }),
                        credentials: 'include',
                    })
                    const resultDeleteChat = await deleteChat.text()
                    if (resultDeleteChat === 'OK' && chats) {
                        const resultChats = chats.filter(el => el.user !== friendEmail)
                        setChats(resultChats)
                        setDeleteWarn(null)
                    }
                }}>Удалить</button>
            </div> : null}
        </div>
    )
}

export default Chats