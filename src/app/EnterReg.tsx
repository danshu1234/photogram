'use client'

import { ChangeEvent, FC, useEffect, useState } from "react";
import styles from './EnterReg.module.css';

interface Props{
    status: string
}

const EnterReg: FC <Props> = (props) => {
    
    const [show, setShow] = useState <string> ('')
    const [name, setName] = useState <string> ('')
    const [login, setLogin] = useState <string> ('')
    const [firstPass, setFirstPass] = useState <string> ('')
    const [secondPass, setSecondPass] = useState <string> ('')
    const [code, setCode] = useState <string> ('')
    let mainShow;

    useEffect(() => {
        localStorage.clear()
    }, [])

    if (show === '') {
        mainShow = <div>
            {props.status === 'reg' ? <input placeholder="Name" onChange={(event: ChangeEvent<HTMLInputElement>) => setName(event.target.value)}/> : null}
            <input placeholder="Login" onChange={(event: ChangeEvent<HTMLInputElement>) => setLogin(event.target.value)} value={login}/>
            <input type="password" placeholder="Password" onChange={(event: ChangeEvent<HTMLInputElement>) => setFirstPass(event.target.value)}/>
            {props.status === 'reg' ? <input type="password" placeholder="Repeat the password" onChange={(event: ChangeEvent<HTMLInputElement>) => setSecondPass(event.target.value)}/> : null}
            {props.status === 'reg' ? <button onClick={async() => {
                if (firstPass !== '' && secondPass !== '' && name !== '' && login !== '') {
                    const checkDataAndSendCode = await fetch('http://localhost:4000/users-controller/send/code', {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ firstPass, secondPass, name, login })
                    })
                    if (checkDataAndSendCode.ok) {
                        const resultSendCode = await checkDataAndSendCode.text()
                        if (resultSendCode === 'OK') {
                            setShow(resultSendCode)
                        } else if (resultSendCode === 'LOG_OCCUPIED') {
                            alert('Этот логин уже занят')
                        } else if (resultSendCode === 'PASS_ERR') {
                            alert('Пароль должен содержать один из символов: !, #, №, $, %, &, ?, -, *, и строчную латинскую букву')
                        } else if (resultSendCode === 'SAME_PASS') {
                            alert('Пароли должны совпадать')
                        }
                    } else {
                        const err = await checkDataAndSendCode.json()
                        alert(err.message[0])
                    }
                }
            }}>Отправить код</button> : <button onClick={async() => {
                if (login !== '' && firstPass !== '') {
                    const password = firstPass
                    const enter = await fetch('http://localhost:4000/users-controller/enter', {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ login, password }),
                        credentials: 'include',
                    })
                    if (enter.ok) {
                        const resultEnter = await enter.json()
                        localStorage.setItem('photogram-enter-refresh', resultEnter.refreshToken)
                        window.location.href='/home'
                    } else {
                        alert('Неверный логин или пароль')
                    }
                } else {
                    alert('Введите логин и пароль')
                }
            }}>Войти</button>}
            {props.status === 'reg' ? <p>Уже есть аккаунт? <span style={{color: 'blue'}} onClick={() => window.location.href='/enter'}>Войти</span></p> : <div><p>Нет аккаунта?<span style={{color: 'blue'}} onClick={() => window.location.href='/reg'}> Зарегистрироваться</span></p><p style={{color: 'blue'}} onClick={() => window.location.href='/emailenter'}>Войти по Email</p></div>}
            <p onClick={() => window.location.href = 'http://localhost:4000/users-controller/google'}>Войти через Google</p>
        </div>
    } else {
        mainShow = <div>
            <h3>На указанный email был отправлен код подтверждения</h3>
            <input placeholder="Код" onChange={((event: ChangeEvent<HTMLInputElement>) => setCode(event.target.value))} value={code}/>
            <button onClick={async() => {
                if (code !== '') {
                    const reg = await fetch('http://localhost:4000/users-controller/reg/user', {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ firstPass, secondPass, name, login, code }),
                        credentials: 'include',
                    })
                    if (reg.ok) {
                        const resultReg = await reg.json()
                        localStorage.setItem('photogram-enter-refresh', resultReg.refreshToken)
                        window.location.href = '/home' 
                    } else {
                        const resultReg = await reg.json()
                        alert(resultReg.message)
                    }
                } else {
                    console.log('Введите код')
                }
            }}>Регистрация</button>
        </div>
    }

    return (
        <div className={styles.container}>
            {mainShow}
        </div>
    )
}

export default EnterReg