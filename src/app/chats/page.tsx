'use client'

import { ChangeEvent, FC, useEffect, useState } from "react"
import useGetEmail from "../useGetEmail"
import Chat from "../Chat"
import { io } from "socket.io-client";
import Message from "../../../server-for-photogram/src/Message";
import UserInterface from "../UserInterface"
import useCheckReg from "../CheckReg";
import getUserChats from "../getChats";

const Chats: FC = () => {

    const socket = io('http://localhost:4000')

    const [socketId, setSocketId] = useState ('')

    const {} = useCheckReg()

    const { trueEmail, setTrueEmail } = useGetEmail()

    const [shareMess, setShareMess] = useState <Message | null> (null)
    const [basePerm, setBasePerm] = useState <string> ('')
    const [changePerm, setChangePerm] = useState <string> ('')
    const [chats, setChats] = useState <Chat[] | null> (null)  
    let showChats;
    let showChangePerm;
    let saveChangePermBtn;
    let shareMessage;

    if (shareMess) {
        shareMessage = <h3>Переслать сообщение от {shareMess.per}</h3>
    }

    if (changePerm !== '' && changePerm !== basePerm) {
        saveChangePermBtn = <button onClick={async() => {
            const email = trueEmail
            await fetch('http://localhost:4000/users-controller/new/perm/mess', {
                method: "PATCH",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, changePerm })
            })
            setBasePerm(changePerm)
        }}>Сохранить</button>
    }

    if (basePerm !== '') {
        showChangePerm = <div>
                <p>Кто может мне писать</p>
                <p>Сейчас: {basePerm}</p>
                <select value={changePerm} onChange={(event: ChangeEvent<HTMLSelectElement>) => setChangePerm(event.target.value)}>
                    <option value='Все'>Все</option>
                    <option value='Никто'>Никто</option>
                    <option value='Только друзья'>Только друзья</option>
                </select>
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
            const chats = await fetch(`http://localhost:4000/users-controller/get/chats/${prevEmail}`)
            const resultChats = await chats.json()
            resChats = resultChats
        } else {
            const chats = await fetch(`http://localhost:4000/users-controller/get/chats/${trueEmail}`)
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
        const email = trueEmail
        const newChats = await fetch('http://localhost:4000/users-controller/pin/chat', {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user, pin, email })
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
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ notifs, trueEmail, user })
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
            showChats = <h2>Чатов пока нет</h2>
        } else {
            showChats = <div>
                <ul>
                    {chats.map((item, index) => {
                        let lastMess;

                        if (item.messages[item.messages.length - 1].typeMess === 'text') {
                            if (item.messages[item.messages.length - 1].text === '') {
                                lastMess = <p>Фото</p>
                            } else {
                                lastMess = <p>{item.messages[item.messages.length - 1].text}</p>
                            }
                        } else if (item.messages[item.messages.length - 1].typeMess === 'voice') {
                            lastMess = <p>Голосовое сообщение</p>
                        } else if (item.messages[item.messages.length - 1].typeMess === 'gif') {
                            lastMess = <p>GIF</p>
                        } else {
                            lastMess = <p>Пост</p>
                        }
                        return <li key={index}>
                        <div>
                            {item.avatar === '' ? <div style={{width: 70, height: 70, borderRadius: '100%', backgroundColor: 'gray'}}></div> : <img src={item.avatar} style={{width: 70, height: 70, borderRadius: '100%'}}/>}
                            {item.pin === false ? <button onClick={() => pinUnpinChat(item.user, true)}>Закрепить</button> : <button onClick={() => pinUnpinChat(item.user, false)}>Открепить</button>}
                            <h3 onClick={async() => {
                                if (shareMess === null) {
                                window.location.href=`/chats/${item.user}`
                            } else {
                                const trueParamEmail = item.user
                                const thisUserMess = await fetch('http://localhost:4000/users-controller/get/mess', {
                                    method: "POST",
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({ trueEmail, trueParamEmail })
                                })
                                const resultMess = await thisUserMess.json()
                                const newMessages = [...resultMess, {user: shareMess.user, text: shareMess.text, photos: shareMess.photos, date: shareMess.date, id: shareMess.id, ans: shareMess.ans, edit: false, typeMess: shareMess.typeMess, per: shareMess.per}]
                                const socketId = ''
                                await fetch('http://localhost:4000/users-controller/new/mess', {
                                    method: "PATCH",
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({ newMessages, trueEmail, trueParamEmail, socketId })
                                })
                                localStorage.removeItem('shareMess')
                                window.location.reload()
                            }
                            }}>{item.user}</h3>
                            {item.messages[item.messages.length - 1].user === trueEmail ? <p>Вы: </p>: null}
                            {lastMess}
                            {item.messCount !== 0 ? <p>{item.messCount}</p> : null}
                            {item.notifs === true ? <img src='https://cdn4.iconfinder.com/data/icons/design-and-development-bold-line-1/48/38-1024.png' width={30} height={30} onClick={() => changeNotifs(false, item.user)}/> : <img src='https://icon-library.com/images/img_99829.png' width={30} height={30} onClick={() => changeNotifs(true, item.user)}/>}
                        </div>
                    </li>
                    })}
                </ul>
            </div>
        }
    } else {
        showChats = <h2>Загрузка...</h2>
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
            setTrueEmail(prev => {
                getChats(prev)
                return prev
            })
            if (message.type === 'message') {
                const user = message.user
                setTrueEmail(prev => {
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
        const myPerm = await fetch(`http://localhost:4000/users-controller/get/perm/mess/${trueEmail}`)
        const resultPerm = await myPerm.text()
        setBasePerm(resultPerm)
        setChangePerm(resultPerm)
    }

    
        useEffect(() => {
            if (socketId !== '' && trueEmail !== '') {
            const addSocket = async () => {
                const email = trueEmail
                await fetch('http://localhost:4000/users-controller/add/socket', {
                    method: "PATCH",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, socketId })
                })
            }
            addSocket()
            getPerm()
        }
    }, [socketId, trueEmail])
    
    return (
        <div>
            {shareMessage}
            {showChangePerm}
            {saveChangePermBtn}
            {showChats}
        </div>
    )
}

export default Chats