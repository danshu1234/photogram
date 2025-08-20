'use client'

import { ChangeEvent, FC, useEffect, useRef, useState } from "react"

const Testing: FC = () => {

    const [changePass, setChangePass] = useState <{old: string, new: string}> ({old: '', new: ''})
    const [changePassShow, setChangePassShow] = useState <string | null> (null)
    const [show, setShow] = useState <string | null> (null)
    const [authData, setAuthData] = useState <{login: string, password: string}> ({login: '', password: ''})
    let mainShow;
    let changePassInter;

    if (changePassShow === null) {
        changePassInter = <button onClick={() => setChangePassShow('change')}>Change password</button>
    } else {
        if (changePassShow === 'change') {
            changePassInter = <div>
                <input placeholder="Old password" onChange={((event: ChangeEvent<HTMLInputElement>) => setChangePass({old: event.target.value, new: changePass.new}))}/><br/>
                <input placeholder="New password" onChange={((event: ChangeEvent<HTMLInputElement>) => setChangePass({old: changePass.old, new: event.target.value}))}/><br/>
                <button onClick={async() => {
                    const oldPass = changePass.old
                    const newPass = changePass.new
                    const token = localStorage.getItem('token')
                    const changePassword = await fetch('http://localhost:4000/testing-users/change/pass', {
                        method: "PATCH",
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ oldPass, newPass, token })
                    })
                    if (changePassword.ok) {
                        const resultChange = await changePassword.text()
                        if (resultChange === 'succes') {
                            setChangePassShow('succes')
                        } else {
                            alert(resultChange)
                        }
                    } else {
                        if (changePassword.status === 400) {
                            alert('Password must be 8 or more length')
                        } else {
                            localStorage.removeItem('token')
                            window.location.reload()
                        }
                    }
                }}>Change password</button>
            </div>
        } else {
            changePassInter = <h3>Succes!</h3>
        }
    }

    if (show === null) {
        mainShow = <h2>Загрузка...</h2>
    } else if (show === 'service') {
        mainShow = <div>
            <h2>Welcome to Service!</h2>
            <button onClick={async() => {
                const token = localStorage.getItem('token')
                const userData = await fetch('http://localhost:4000/testing-users/get/user/data', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                if (userData.ok) {
                    const resultUserData = await userData.json()
                    alert(`Name: ${resultUserData.name}, age: ${resultUserData.age}`)
                } else {
                    alert('Invalid token')
                }
            }}>Get user data</button>

            <button onClick={async() => {
                const token = localStorage.getItem('token')
                const userName = await fetch('http://localhost:4000/testing-users/get/user/name', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                const resultUserName = await userName.text()
                console.log(resultUserName)
            }}>Get my name in console</button><br/>
            {changePassInter}
        </div>
    } else if (show === 'auth') {
        mainShow = <div>
            <input placeholder="Login" onChange={((event: ChangeEvent<HTMLInputElement>) => setAuthData({login: event.target.value, password: authData.password}))}/><br/>
            <input placeholder="Password" onChange={((event: ChangeEvent<HTMLInputElement>) => setAuthData({login: authData.login, password: event.target.value}))}/><br/>
            <button onClick={async() => {
                if (authData.login !== '' && authData.password !== '') {
                        const login = authData.login
                        const password = authData.password
                        const giveData = await fetch('http://localhost:4000/testing-users/enter', {
                            method: "POST",
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ login, password })
                        })
                        const enterResult = await giveData.text()
                        if (enterResult === 'ERR') {
                            alert('Invalid login or password')
                        } else {
                            localStorage.setItem('token', enterResult)
                            window.location.reload()
                        }
                }
            }}>Enter</button>
        </div>
    }

    useEffect(() => {
        const checkToken = async () => {
            const localToken = localStorage.getItem('token')
            if (localToken) {
                const tokenCheck = await fetch(`http://localhost:4000/testing-users/check/token/${localToken}`)
                if (tokenCheck.ok) {
                    setShow('service')
                } else {
                    setShow('auth')
                }
            } else {
                setShow('auth')
            }
        }
        checkToken()
    }, [])

    useEffect(() => {
        if (changePassShow === 'succes') {
            setTimeout(() => {
                setChangePassShow(null)
            }, 2000);
        }
    }, [changePassShow])

    return (
        <div>
            {mainShow}
        </div>
    )
}

export default Testing