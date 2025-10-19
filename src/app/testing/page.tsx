'use client'

import { ChangeEvent, FC, useEffect, useRef, useState } from "react"

const Testing: FC = () => {

    const [login, setLogin] = useState <string> ('')
    const [pass, setPass] = useState <string> ('')
    const [authName, setAuthName] = useState <string | null> (null)
    let mainShow;

    if (authName) {
        if (authName !== 'auth') {
            mainShow = <div>
                <h2>Привет, {authName}</h2>
                <button onClick={async() => {
                    const accessToken = localStorage.getItem('accessToken')
                    await fetch('http://localhost:4000/testing-users/exit/from/all', {
                        method: "DELETE",
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                        },
                    })
                    localStorage.removeItem('accessToken')
                    localStorage.removeItem('refreshToken') 
                    window.location.reload()
                }}>Выйти на всех устройствах</button>
            </div>
        } else {
            mainShow = <div>
                <input placeholder="Login" onChange={((event: ChangeEvent<HTMLInputElement>) => setLogin(event.target.value))}/>
                <input placeholder="Password" type="password" onChange={((event: ChangeEvent<HTMLInputElement>) => setPass(event.target.value))}/>
                <button onClick={async() => {
                    if (login !== '' && pass !== '') {
                        const enter = await fetch('http://localhost:4000/testing-users/enter', {
                            method: "POST",
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ login, pass })
                        })
                        if (enter.ok) {
                            const resultEnter = await enter.json()
                            localStorage.setItem('accessToken', resultEnter.accessToken)
                            localStorage.setItem('refreshToken', resultEnter.refreshToken)
                            window.location.reload()
                        } else {
                            alert('Неверный логин или пароль')
                        }
                    }
                }}>Войти</button>
            </div>
        }
    } else {
        mainShow = <h2>Загрузка...</h2>
    }

    useEffect(() => {
        const getUserName = async () => {
            const accessToken = localStorage.getItem('accessToken')
            const refreshToken = localStorage.getItem('refreshToken')
            if (accessToken && refreshToken) {
                const getName = await fetch('http://localhost:4000/testing-users/get/name', {
                    method: "GET",
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                })
                if (getName.ok) {
                    const resultUserName = await getName.text()
                    setAuthName(resultUserName)
                } else {
                    const getNewToken = await fetch('http://localhost:4000/testing-users/get/access/token', {
                        method: "PATCH",
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ refreshToken })
                    })
                    if (getNewToken.ok) {
                        const resultNewToken = await getNewToken.json()
                        console.log(resultNewToken)
                        localStorage.setItem('accessToken', resultNewToken.accessToken)
                        localStorage.setItem('refreshToken', resultNewToken.refreshToken)
                        getUserName()
                    } else {
                        console.log('Мы обнаружили подозрительную активность на вашем аккаунте, пожалуйста, войдите в аккаунт снова и нажмите кнопку Выйти на всех устройствах')
                        localStorage.removeItem('accessToken')
                        localStorage.removeItem('refreshToken') 
                        window.location.reload()
                    }
                }
            } else {
                setAuthName('auth')
            }
        }
        getUserName()
    }, [])

    return (
        <div style={{width: '100%', height: '100vh', backgroundColor: 'gray'}}>
            {mainShow}
        </div>
    )
}

export default Testing