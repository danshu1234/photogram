'use client'

import { FC, useEffect, useState, memo } from "react"
import useGetEmail from "./useGetEmail";
import Chat from "./Chat";
import getMessIdAndDate from "./getMessIdAndDate";

interface ShareWindowProps{
    sharePost: string;
    setSharePost: Function;
}

const ShareWindow: FC <ShareWindowProps> = (props) => {

    const { trueEmail } = useGetEmail()

    const [chats, setChats] = useState <Chat[] | null> (null)
    let chatsList;

    const closeShareWindow = () => props.setSharePost('')

    if (chats !== null) {
        if (Array.isArray(chats) && chats.length !== 0) {
            chatsList = <div>
                <ul>
                    {chats.map((item, index) => <li key={index}>
                        <div>
                            <h3>{item.user}</h3>
                            <button onClick={async() => {
                                const trueParamEmail = item.user
                                const socketId = ''
                                const email = trueEmail
                                const { formattedDate, messId } = getMessIdAndDate()
                                const newMessages = [...item.messages, {user: email, text: props.sharePost, photos: [], date: formattedDate, id: messId, ans: '', edit: false, typeMess: 'post', per: ''}]
                                await fetch('http://localhost:4000/users-controller/new/mess', {
                                    method: "PATCH",
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({ newMessages, email, trueParamEmail, socketId })
                                })
                                closeShareWindow()
                            }}>Отправить</button>
                        </div>
                    </li>)}
                </ul>
            </div>
        } else {
            chatsList = <h3>У вас пока нет чатов</h3>
        }
    } else {
        chatsList = <h3>Загрузка...</h3>
    }

    useEffect(() => {
        const getChats = async () => {
            const myChats = await fetch(`http://localhost:4000/users-controller/get/chats/${trueEmail}`)
            const resultChats = await myChats.json()
            setChats(resultChats)
        }
        getChats()
    }, [trueEmail])

    return (
        <div>
            <p onClick={closeShareWindow}>X</p>
            {chatsList}
        </div>
    )
}

export default memo(ShareWindow)