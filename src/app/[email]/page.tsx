'use client';

import { useEffect, useState } from "react";
import UserInterface from "../UserInterface";
import Photo from "../PhotoInterface";
import useGetEmail from "../useGetEmail";
import { PulseLoader } from "react-spinners";
import List from "../List";
import useGetTrueParamEmail from "../useGetTrueParamEmail";
import ChatBtn from "../ChatBtn";
import useGetSavePhotos from "../useGetSavePhotos";

export default function UserPage() {

    const { email } = useGetEmail()

    const { mySavePosts, setMySavePosts } = useGetSavePhotos()
    const [mySubs, setMySubs] = useState <string[] | null> (null)
    const { trueParamEmail } = useGetTrueParamEmail()
    const [user, setUser] = useState <null | UserInterface> (null)
    const [photos, setPhotos] = useState <null | string | Photo[]> (null)
    let mainShow;
    let avatar;
    let photoShow;
    let chatBtn;

    if (user?.permMess === 'Все') {
        chatBtn = <ChatBtn trueParamEmail={trueParamEmail}/>
    } else if (user?.permMess === 'Только друзья') {
        if (mySubs?.includes(trueParamEmail) && user.subscribes.includes(email)) {
            chatBtn = <ChatBtn trueParamEmail={trueParamEmail}/>
        }
    }

    if (photos === 'unsend') {
        photoShow = <div>
            <h3>Пользователь скрыл свои фото</h3>
            <button onClick={async() => {
                const userEmail = trueParamEmail
                const type = 'perm'
                await fetch('http://localhost:4000/users-controller/new/notif', {
                    method: "PATCH",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, userEmail, type })
                })
                window.location.reload()
            }}>Отправить запрос</button>
        </div>
    } else if (photos === 'send') {
        photoShow = <h3>Запрос отправлен</h3>
    } else if (Array.isArray(photos) && mySavePosts !== null) {
        if (photos?.length === 0) {
            photoShow = <h3>Пользователь еще не публиковал фото</h3>
        } else {
            photoShow = <List photos={photos} setPhotos={setPhotos} email={email} mySavePosts={mySavePosts} setMySavePosts={setMySavePosts}/>
        }
    }

    if (user?.avatar === '') {
        avatar = <div style={{width: 200, height: 200, backgroundColor: 'gray', borderRadius: '100%'}}></div>
    } else {
        avatar = <img src={user?.avatar} style={{width: 200, height: 200, borderRadius: '100%'}}/>
    }

    if (user !== null && photos !== null && mySubs !== null) {
        mainShow = <div>
            <h3>{user.email}</h3>
            {avatar}
            <h2>{user.name}</h2>
            <p>Подписчики: {user.subscribes.length - 1}</p>
            {chatBtn}
            <img src='https://ggkp3.by/Img/eye.png' width={40} height={40}/>
            <p>{user.visits.length}</p>
            {user.subscribes.includes(email) ? <button onClick={async() => {
                const targetEmail = trueParamEmail
                await fetch('http://localhost:4000/users-controller/unsub', {
                    method: "PATCH",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ targetEmail, email })
                })
                window.location.reload()
            }}>Отписаться</button> : <button onClick={async() => {
                const targetEmail = trueParamEmail
                await fetch('http://localhost:4000/users-controller/sub', {
                    method: "PATCH",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ targetEmail, email })
                })
                window.location.reload()
            }}>Подписаться</button>}
            {user.reports.includes(email) ? <p>Жалоба отправлена</p> : <button onClick={async() => {
                const targetEmail = trueParamEmail
                await fetch('http://localhost:4000/users-controller/new/report', {
                    method: "PATCH",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ targetEmail, email })
                })
                window.location.reload()
            }}>Пожаловаться на аккаунт</button>}
            {photoShow}
        </div>
    } else {
        mainShow = <PulseLoader/>
    }

    const getUserPhotos = async () => {
        const getPhotos = await fetch(`http://localhost:4000/photos/get/user/photos/${trueParamEmail}`)
        const resultPhotos = await getPhotos.json()
        const resultArr = resultPhotos.map((el: Photo) => {
            return {
                ...el,
                photoIndex: 0,
            }
        })
        setPhotos(resultArr.reverse())
    }

    useEffect(() => {
        if (trueParamEmail !== '') {
            const getUserData = async () => {
                const getUser = await fetch(`http://localhost:4000/users-controller/get/user/data/${trueParamEmail}`)
                const resultUserData = await getUser.json()
                if (resultUserData === false) {
                    window.location.href = '/undef'
                } else {
                    setUser(resultUserData)
                }
            }
            getUserData()
        }
    }, [trueParamEmail])

    useEffect(() => {
        if (email !== '') {
            const getMySubs = async () => {
                const mySubs = await fetch(`http://localhost:4000/users-controller/all/subs/and/country/${email}`)
                const resultSubs = await mySubs.json()
                setMySubs(resultSubs.subscribes)
            }
            getMySubs()
        }
    }, [email])

    useEffect(() => {
        if (user !== null) {
            if (user.open || user.email === email) {
                getUserPhotos()
            } else if (user.open === false) {
                if (user.permUsers.includes(email)) {
                    getUserPhotos()
                } else {
                    let resultArr = []
                    for (let item of user.notifs) {
                        if (item.type === 'perm' && item.user === email) {
                            resultArr.push(item)
                        }
                    }
                    if (resultArr.length === 0) {
                        setPhotos('unsend')
                    } else {
                        setPhotos('send')
                    }
                }
            }

            if (user?.visits) {
            if (!user.visits.includes(email)) {
                const visitsWithMe = [...user.visits, email]
                const targetEmail = trueParamEmail
                const updateVisits = async () => {
                    await fetch('http://localhost:4000/users-controller/update/visits', {
                        method: "PATCH",
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ visitsWithMe, targetEmail })
                    })
                }
                updateVisits()
        } 
    }
    }
    }, [user])

    return (
        <div>
            {mainShow}
        </div>
    );
}