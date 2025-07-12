'use client'

import Link from "next/link";
import { ChangeEvent, FC, useEffect, useState } from "react";
import styles from './EnterReg.module.css';

interface Props{
    status: string
}

const EnterReg: FC <Props> = (props) => {

    const [email, setEmail] = useState <string> ('')
    const [name, setName] = useState <string> ('')
    const [isNameInput, setisNameInput] = useState <boolean> (false)
    let nameInput;

    if (isNameInput) {
        nameInput = <input placeholder="Name" onChange={(event: ChangeEvent<HTMLInputElement>) => setName(event.target.value)} className={styles.input}/>
    }

    useEffect(() => {
        if (props.status === 'reg') {
            setisNameInput(true)
        }
    }, [])

    const checkEmail = async () => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (regex.test(email)) {
            if (props.status === 'reg') {
                if (name !== '') {
                    localStorage.setItem('dataForRegPhotoGram', JSON.stringify({status: 'reg', name: name, email: email}))
                    window.location.href = '/verify'
                } else {
                    alert('Введите имя')
                }
            } else {
                const findThisEmail = await fetch(`http://localhost:4000/users-controller/check/find/user/${email}`)
                const resultCheckUser = await findThisEmail.text()
                if (resultCheckUser === 'OK') {
                    localStorage.setItem('dataForRegPhotoGram', JSON.stringify({status: 'enter', email: email}))
                    window.location.href = '/verify'
                } else {
                    alert('Такого пользователя не существует')
                }
            }
        } else {
            alert('Введите корректный Email')
        }
    }

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>{props.status === 'reg' ? 'Регистрация' : 'Вход'}</h2>
            <input 
                placeholder="Email" 
                className={styles.input}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
            />
            {nameInput}
            <button 
                className={styles.button}
                onClick={checkEmail}
            >{props.status === 'reg' ? 'Регистрация' : 'Вход'}</button>
            <div className={styles.switch}>
                {props.status === 'enter' ? 
                    <p>Нет аккаунта? <Link href={'/reg'} className={styles.link}>Регистрация</Link></p> : 
                    <Link href={'/enter'} className={styles.link}>Вход</Link>
                }
            </div>
        </div>
    )
}

export default EnterReg