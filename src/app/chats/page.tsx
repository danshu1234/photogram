'use client'

import { ChangeEvent, FC, useEffect, useState } from "react"
import useGetEmail from "../useGetEmail"
import Chat from "../Chat"
import { io } from "socket.io-client";
import Message from "../../../server-for-photogram/src/Message";
import UserInterface from "../UserInterface"
import CalendarComp from "../Calendar";

const Chats: FC = () => {

    const socket = io('http://localhost:4000')

    const [socketId, setSocketId] = useState ('')

    const { email, setEmail } = useGetEmail()

    const [birthdayFriends, setBirthdayFriends] = useState <string[]> ([])
    const [calendar, setCalendar] = useState <boolean> (false)
    const [birhday, setBirthday] = useState <string | null> (null)
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
            const chats = await fetch(`http://localhost:4000/users-controller/get/chats/${email}`)
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
                                    body: JSON.stringify({ email, trueParamEmail })
                                })
                                const resultMess = await thisUserMess.json()
                                const newMessages = [...resultMess, {user: shareMess.user, text: shareMess.text, photos: shareMess.photos, date: shareMess.date, id: shareMess.id, ans: shareMess.ans, edit: false, typeMess: shareMess.typeMess, per: shareMess.per}]
                                const socketId = ''
                                await fetch('http://localhost:4000/users-controller/new/mess', {
                                    method: "PATCH",
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({ newMessages, email, trueParamEmail, socketId })
                                })
                                localStorage.removeItem('shareMess')
                                window.location.reload()
                            }
                            }}>{item.user}</h3>
                            {lastMess}
                            {item.messCount !== 0 ? <p>{item.messCount}</p> : null}
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
        if (email !== '') {
            getChats()
        }
    }, [email])

    useEffect(() => {
        socket.on('connect', () => {
            if (socket.id) {
                setSocketId(socket.id)
            }
        })

        socket.on('replyMessage', (message: Message) => {
            setEmail(prev => {
                getChats(prev)
                return prev
            })
        })
    }, [])

    useEffect(() => {
        const getStorage = localStorage.getItem('shareMess')
        if (getStorage) {
            setShareMess(JSON.parse(getStorage))
        }
    }, [])

    const getPerm = async () => {
        const myPerm = await fetch(`http://localhost:4000/users-controller/get/perm/mess/${email}`)
        const resultPerm = await myPerm.text()
        setBasePerm(resultPerm)
        setChangePerm(resultPerm)
    }

    const getMyBirthday = async () => {
        const myBirthday = await fetch(`http://localhost:4000/users-controller/get/birthday/${email}`)
        const resultBirthday = await myBirthday.text()
        setBirthday(resultBirthday)
    }

    const getBirthdayFriends = async () => {
        const allUsers = await fetch('http://localhost:4000/users-controller/get/all/users')
        const resultAllUsers = await allUsers.json()
        const getMySubs = await fetch(`http://localhost:4000/users-controller/all/subs/and/country/${email}`)
        const resultMySubs = await getMySubs.json()
        const mySubs = resultMySubs.subscribes
        let friendsArr: UserInterface[] = []
        for (let item of mySubs) {
            if (typeof item !== 'number') {
            const thisSubUser = resultAllUsers.find((el: UserInterface) => el.email === item)
            if (thisSubUser.subscribes.includes(email)) {
                friendsArr.push(thisSubUser)
            }
        }
        }
        let resultBirthdayFriends: string[] = []
        const nowDate = new Date()
        const resultDate = nowDate.getDate() + '.' + (nowDate.getMonth() + 1)
        for (let item of friendsArr) {
            if (item.birthday === resultDate) {
                resultBirthdayFriends.push(item.email)
            }
        }
        setBirthdayFriends(resultBirthdayFriends)
    }
    
        useEffect(() => {
            if (socketId !== '' && email !== '') {
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
            getPerm()
            getMyBirthday()
            getBirthdayFriends()
        }
    }, [socketId, email])
    
    return (
        <div>
            {birhday === '' ? <p onClick={() => setCalendar(true)}>Укажите дату вашего рождения, чтобы друзья знали, когда вас поздравить</p> : null}
            {birthdayFriends.length !== 0 ? <div>
                <h3>Сегодня день рождения у: </h3>
                <ul>
                    {birthdayFriends.map((item, index) => <li key={index} onClick={() => window.location.href=`/chats/${item}`}>{item}</li>)}
                </ul>
            </div> : null}
            {calendar === true ? <CalendarComp setCalendar={setCalendar} email={email} setBirthday={setBirthday}/> : null}
            {shareMessage}
            {showChangePerm}
            {saveChangePermBtn}
            {showChats}
        </div>
    )
}

export default Chats