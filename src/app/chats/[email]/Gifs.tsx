'use client'

import { ChangeEvent, FC, useEffect, useRef, useState } from "react"
import "./UserChat.css"
import { Message } from "@/app/Chat"
import getMessIdAndDate from "@/app/getMessIdAndDate"
import gifs from "@/app/gifs"
import getGifs from "./getGifs"

interface GifsProps{
    gifsArr: string[];
    getAllGifs: Function;
    setGifsArr: Function;
    messages: Message[] | null;
    trueEmail: string;
    trueParamEmail: string;
    answMess: string;
    setInputMess: Function;
    setMessages: Function;
    backUpMess: Function;
    succesSend: Function;
}

const Gifs: FC <GifsProps> = (props) => {

    const [userInput, setUserInput] = useState <string> ('')

    return (
        <div className="gifs-container">
            <p onClick={() => props.setGifsArr([])}>X</p>
            <div className="gifs-header">
                <input placeholder="GIF" onChange={((e: ChangeEvent<HTMLInputElement>) => setUserInput(e.target.value))}/>
                <button onClick={async() => {
                    if (userInput !== '') {
                        const resultGifs = await getGifs(userInput)
                        props.setGifsArr(resultGifs)
                    } else {
                        const resultGifs = await getGifs()
                        props.setGifsArr(resultGifs)
                    }
                }}>Найти</button>
            </div>
            <div className="gifs-grid">
                {props.gifsArr.map((item, index) => <div key={index} className="gif-item"><img src={item} onClick={async() => {
                    const { formattedDate, messId } = getMessIdAndDate()
                    const trueParamEmail = props.trueParamEmail
                    const messRealCount = await fetch('http://localhost:4000/users-controller/mess/length', {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json',
                        },  
                        body: JSON.stringify({ trueParamEmail }),
                        credentials: 'include',      
                    })
                    const resultMessRealCount = await messRealCount.json()
                    if (props.messages) { 
                        if (resultMessRealCount !== 0) {
                            const newMess = [...props.messages, {user: props.trueEmail, text: item, photos: [], date: formattedDate, id: messId, ans: props.answMess, edit: false, typeMess: 'gif', per: '', controls: false, pin: false, read: false, sending: true}]
                            props.setMessages(newMess)
                            props.setInputMess('')
                            const formData = new FormData()
                            formData.append('user', props.trueEmail)
                            formData.append('text', JSON.stringify(item))
                            formData.append('myText', JSON.stringify(item))
                            formData.append('date', formattedDate)
                            formData.append('id', messId)
                            formData.append('ans', props.answMess)
                            formData.append('trueParamEmail', props. trueParamEmail)
                            formData.append('per', '')
                            formData.append('type', 'gif')
                            const sendMess = await fetch('http://localhost:4000/users-controller/new/mess', {
                                method: "PATCH",
                                body: formData,
                                credentials: 'include',
                            })
                            const resultSendMess = await sendMess.json()
                            if (resultSendMess.status !== 'OK') {
                                const resultBackupMess = props.backUpMess(props.messages, messId)
                                props.setMessages(resultBackupMess)
                                alert('Произошла ошибка при отправке сообщения')
                            } else {
                                props.succesSend(newMess, messId)
                            }
                        } else {
                            const newMess = [{user: props.trueEmail, text: item, photos: [], date: formattedDate, id: messId, ans: props.answMess, edit: false, typeMess: 'gif', per: '', controls: false, pin: false, read: false, sending: true}]
                            props.setMessages(newMess)
                            props.setGifsArr([])
                            const formData = new FormData()
                            formData.append('user', props.trueEmail)
                            formData.append('text', JSON.stringify(item))
                            formData.append('myText', JSON.stringify(item))
                            formData.append('date', formattedDate)
                            formData.append('id', messId)
                            formData.append('ans', props.answMess)
                            formData.append('trueParamEmail', props.trueParamEmail)
                            formData.append('per', '')
                            formData.append('type', 'gif')
                            const firstMess = await fetch('http://localhost:4000/users-controller/new/chat', {
                                method: "PATCH",
                                body: formData,
                                credentials: 'include',
                            })
                            const resultFirstMess = await firstMess.text()
                            if (resultFirstMess !== 'OK') {
                                const resultBackupMess = props.backUpMess(props.messages, messId)
                                props.setMessages(resultBackupMess)
                                alert('Произошла ошибка при отправке сообщения')
                            } else {
                                props.succesSend(newMess, messId)
                            }
                        }
                    }
                }}/></div>)}
            </div>
        </div>
    )
}

export default Gifs