'use client'

import { ChangeEvent, FC, useEffect, useRef, useState } from "react"
import useOnlineStatus from "../useOnlineStatus";

const Bot: FC = () => {

    interface Message{
        type: string;
        text: string;
    }

    const {} = useOnlineStatus()

    const [inputPrompt, setInputPrompt] = useState <string> ('')
    const [messages, setMessages] = useState <Message[] | null> (null)
    const [think, setThink] = useState <boolean> (false)
    let showMess;

    if (messages) {
        if (messages.length !== 0) {
            showMess = <div>
                {messages.map((item, index) => {
                    if (item.type === 'user') {
                        return <li key={index}><p>{item.text}</p></li>
                    } else if (item.type === 'bot') {
                        return <li key={index}><p>{item.text}</p></li>
                    }
                })}
            </div>
        } else {
            showMess = <h2>Сообщений пока нет</h2>
        }
    } else {
        showMess = <h2>Загрузка...</h2>
    }

    useEffect(() => {
        const getBotMess = async () => {
            const botMessages = await fetch('http://localhost:4000/users-controller/get/bot/mess', {
                method: "GET",
                credentials: 'include',
            })
            const resultBotMessages = await botMessages.json()
            setMessages(resultBotMessages)
        }
        getBotMess()
    }, [])

    useEffect(() => {
        setInputPrompt('')
    }, [messages])

    return (
        <div>
            {showMess}
            <input placeholder="Задайте ваш вопрос" value={inputPrompt} onChange={((event: ChangeEvent<HTMLInputElement>) => setInputPrompt(event.target.value))}/>
            {think === false ? <button onClick={async() => {
                if (inputPrompt !== '') {
                    setThink(true)
                    const responseAi = await fetch('http://localhost:4000/openai/prompt', {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include',
                        body: JSON.stringify({ inputPrompt })
                    })
                    const resultResponseAi = await responseAi.text()
                    if (messages) {
                        setMessages([...messages, {type: 'user', text: inputPrompt}, {type: 'bot', text: resultResponseAi}])
                    }
                    setThink(false)
                }
            }}>Отправить</button> : null}
            {think === true ? <p>Думает...</p> : null}
        </div>
    )
}

export default Bot