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

const Chats: FC = () => {
    const socket = io('http://localhost:4000')
    const [socketId, setSocketId] = useState('')
    const {} = useCheckReg()
    const { email, trueEmail, setEmail } = useGetEmail()
    const [shareMess, setShareMess] = useState<Message | null>(null)
    const [basePerm, setBasePerm] = useState<string>('')
    const [changePerm, setChangePerm] = useState<string>('')
    const [chats, setChats] = useState<Chat[] | null>(null)  

    let showChats;
    let showChangePerm;
    let saveChangePermBtn;
    let shareMessage;

    if (shareMess) {
        shareMessage = <div className={styles.shareMessage}>
            Переслать сообщение от {shareMess.per}
        </div>
    }

    if (changePerm !== '' && changePerm !== basePerm) {
        saveChangePermBtn = <button 
            className={styles.saveButton}
            onClick={async() => {
                await fetch('http://localhost:4000/users-controller/new/perm/mess', {
                    method: "PATCH",
                    headers: {
                        'Authorization': `Bearer ${email}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ changePerm })
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
        setChats(myResultChats)
    }

    const getChats = async (prevEmail?: string) => {
        let resChats = []
        if (prevEmail) {
            const chats = await fetch('http://localhost:4000/users-controller/get/chats', {
                method: "GET",
                headers: {
                    'Authorization': `Bearer ${email}`,
                    'Content-Type': 'application/json',
                },
            })
            const resultChats = await chats.json()
            resChats = resultChats
        } else {
            const chats = await fetch('http://localhost:4000/users-controller/get/chats', {
                method: "GET",
                headers: {
                    'Authorization': `Bearer ${email}`,
                    'Content-Type': 'application/json',
                },
            })
            const resultChats = await chats.json()
            resChats = resultChats
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
            sortChats(finalChats)
        } else {
            setChats(resChats)
        }
    }

    const pinUnpinChat = async (user: string, pin: boolean) => {
        const newChats = await fetch('http://localhost:4000/users-controller/pin/chat', {
            method: "PATCH",
            headers: {
                'Authorization': `Bearer ${email}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user, pin })
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
        sortChats(finalChats)
    }

    const changeNotifs = async (notifs: boolean, user: string) => {
        await fetch('http://localhost:4000/users-controller/change/notifs', {
            method: "PATCH",
            headers: {
                'Authorization': `Bearer ${email}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ notifs, user })
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
                        } else {
                            lastMess = <span>Пост</span>
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
                                            await fetch('http://localhost:4000/users-controller/new/mess', {
                                                method: "PATCH",
                                                headers: {
                                                    'Authorization': `Bearer ${email}`,
                                                    'Content-Type': 'application/json',
                                                },
                                                body: formData,
                                            })
                                            localStorage.removeItem('shareMess')
                                            const newChats = chats.map(el => {
                                                if (el.user === item.user) {
                                                    return {
                                                        ...el,
                                                        messages: [...el.messages, {user: shareMess.user, text: shareMess.text, photos: [], date: shareMess.date, id: shareMess.id, ans: '', edit: false, typeMess: shareMess.typeMess, pin: false, controls: false, per: ''}]
                                                    }
                                                } else {
                                                    return el
                                                }
                                            })
                                            setChats(newChats)
                                            setShareMess(null)
                                        }
                                    }}
                                >
                                    {item.user}
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
            setEmail(prev => {
                getChats(prev)
                return prev
            })
            if (message.type === 'message') {
                const user = message.user
                setEmail(prev => {
                    let email = prev
                    if (document.visibilityState !== 'visible') {
                        getUserChats(email, user)
                    }
                    return prev
                })
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
        })
    }, [])

    useEffect(() => {
        const getStorage = localStorage.getItem('shareMess')
        if (getStorage) {
            setShareMess(JSON.parse(getStorage))
        }
    }, [])

    const getPerm = async () => {
        const myPerm = await fetch(`http://localhost:4000/users-controller/get/perm/mess`, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${email}`,
                'Content-Type': 'application/json',
            },
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
                        'Authorization': `Bearer ${email}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ socketId })
                })
            }
            addSocket()
            getPerm()
        }
    }, [socketId, trueEmail])
    
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                {shareMessage}
                {showChangePerm}
            </div>
            {showChats}
        </div>
    )
}

export default Chats