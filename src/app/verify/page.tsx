'use client'

import { ChangeEvent, FC, useEffect, useState } from "react"
import useCheckReg from "../CheckReg"
import useGetEmail from '../useGetEmail'
import styles from './VerifyCode.module.css';

const VerifyCode: FC = () => {

    const { email } = useGetEmail()

    const [code, setCode] = useState <string> ('')
    const [inputCode, setInputCode] = useState <string> ('')

    const giveCode = async () => {
        await fetch('https://formspree.io/f/mdkejvop', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: email,
              message: code,       
            }),
        });
    }

    useEffect(() => {
        if (localStorage.getItem('dataForRegPhotoGram')) {
            let codeArr = []
            for (let i = 0; i < 4; i++) {
                const randomNum = Math.floor(Math.random() * 10)
                codeArr.push(randomNum)
            }
            const strCodeArr = codeArr.map(el => el.toString())
            const resultCode = strCodeArr.join('')
            setCode(resultCode)
        } else {
            window.location.href='/enter'
        }
    }, [])

    useEffect(() => {
        if (code !== '') {
            giveCode()
        }
    }, [code])

    const checkCode = async () => {
        if (code === inputCode) {
            const dataForRegOrEnter = localStorage.getItem('dataForRegPhotoGram')
            if (dataForRegOrEnter) {
                const resultData = JSON.parse(dataForRegOrEnter)
                if (resultData.status === 'enter') {
                    localStorage.setItem('photogram-enter', JSON.stringify(resultData.email))
                    localStorage.removeItem('dataForRegPhotoGram')
                    window.location.href = '/'
                } else if (resultData.status === 'reg') {
                    const getLocal = localStorage.getItem('dataForRegPhotoGram')
                    let resultName = null
                    let resultEmail = null
                    if (getLocal) {
                        const resultLocal = JSON.parse(getLocal)
                        resultName = resultLocal.name
                        resultEmail = resultLocal.email
                    }
                    await fetch('http://localhost:4000/users-controller/create/new/user', {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ resultEmail, resultName })
                    })
                    localStorage.setItem('photogram-enter', JSON.stringify(resultData.email))
                    localStorage.removeItem('dataForRegPhotoGram')
                    window.location.href = '/'
                }
            }
        } else {
            alert('Неверный код')
        }
    }

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Подтверждение</h2>
            <p className={styles.description}>Мы отправили код подтверждения на вашу почту</p>
            <input 
                placeholder="Введите код" 
                className={styles.input}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setInputCode(event.target.value)}
            />
            <button 
                className={styles.button}
                onClick={checkCode}
            >Проверить код</button>
        </div>
    )
}

export default VerifyCode