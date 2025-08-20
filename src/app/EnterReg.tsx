'use client'

import Link from "next/link";
import { ChangeEvent, FC, useEffect, useState } from "react";
import styles from './EnterReg.module.css';

interface Props{
    status: string
}

const EnterReg: FC <Props> = (props) => {
    
    const [name, setName] = useState <string> ('')
    const [login, setLogin] = useState <string> ('')
    const [firstPass, setFirstPass] = useState <string> ('')
    const [secondPass, setSecondPass] = useState <string> ('')

    return (
        <div className={styles.container}>
            {props.status === 'reg' ? <input placeholder="Name" onChange={(event: ChangeEvent<HTMLInputElement>) => setName(event.target.value)}/> : null}
            <input placeholder="Email" onChange={(event: ChangeEvent<HTMLInputElement>) => setLogin(event.target.value)}/>
            <input type="password" placeholder="Password" onChange={(event: ChangeEvent<HTMLInputElement>) => setFirstPass(event.target.value)}/>
            {props.status === 'reg' ? <input type="password" placeholder="Repeat the password" onChange={(event: ChangeEvent<HTMLInputElement>) => setSecondPass(event.target.value)}/> : null}
            {props.status === 'reg' ? <button onClick={async() => {
                const regUser = await fetch('http://localhost:4000/users-controller/reg', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ login, firstPass, secondPass, name })
                })
                if (regUser.ok) {
                    const resultRegUser = await regUser.text()
                    if (resultRegUser === 'FIRST_ERR') {
                        alert('Пользователь с таким email уже существует')
                    } else if (resultRegUser === 'SECOND_ERR') {
                        alert('Введенные пароли не совпадают')
                    } else if (resultRegUser === 'THIRD_ERR'){
                        alert('Пароль должен сожержать хотя бы одну латинскую строчную букву и один из символов: !, #, №, $, %, &, ?, -, *')
                    } else {
                        localStorage.setItem('photogram-enter', resultRegUser)
                        window.location.href='/home'
                    }
                } else {
                    const validateErr = await regUser.json()
                    alert(validateErr.message[0])
                }
            }}>Зарегистрироваться</button> : <button onClick={async() => {
                if (login !== '' && firstPass !== '') {
                    const password = firstPass
                    const enter = await fetch('http://localhost:4000/users-controller/enter', {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ login, password })
                    })
                    const resultEnter = await enter.text()
                    if (resultEnter !== 'ERR') {
                        localStorage.setItem('photogram-enter', resultEnter)
                        window.location.href='/home'
                    } else {
                        alert('Неверный логин или пароль')
                    }
                } else {
                    alert('Введите логин и пароль')
                }
            }}>Войти</button>}
            {props.status === 'reg' ? <p>Уже есть аккаунт? <span style={{color: 'blue'}} onClick={() => window.location.href='/enter'}>Войти</span></p> : <p>Нет аккаунта? <span style={{color: 'blue'}} onClick={() => window.location.href='/reg'}>Зарегистрироваться</span></p>}
        </div>
    )
}

export default EnterReg