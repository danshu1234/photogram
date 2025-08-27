'use client'

import { ChangeEvent, FC, useState } from "react"

const Reg: FC = () => {

    const [sendCode, setSendCode] = useState <boolean> (false)
    const [email, setEmail] = useState <string> ('')
    const [code, setCode] = useState <string> ('')

    const codeSend = async () => {
        if (email !== '') {
            const send = await fetch(`http://localhost:4000/users-controller/send/enter/code/${email}`, {method: "POST"})
            const resultSendCode = await send.text()
            if (resultSendCode === 'OK') {
                setSendCode(true)
            } else if (resultSendCode === 'ERR') {
                alert('Такого аккаунта не существует')
            }
        }
    }

    const checkCode = async () => {
        if (code !== '') {
            const emailEnter = await fetch('http://localhost:4000/users-controller/email/enter', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, code })
            })
            const resultEmailEnter = await emailEnter.text()
            if (resultEmailEnter !== 'ERR') {
                localStorage.setItem('photogram-enter', resultEmailEnter)
                window.location.href='/home'
            } else {
                alert('Неверный код')
            }
        }
    }

    return (
        <div>
            {sendCode === false ? <div>
                <input placeholder="Email" onChange={((event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value))} value={email}/>
                <button onClick={codeSend}>Отправить код</button>
            </div> : <div>
                <input placeholder="Code" onChange={((event: ChangeEvent<HTMLInputElement>) => setCode(event.target.value))} value={code}/>
                <button onClick={checkCode}>Войти</button>
            </div>}
        </div>
    )
}

export default Reg