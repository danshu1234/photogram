'use client';

import { useEffect, useState } from "react";
import getUserPhoto from '../GetUserPhoto';
import Photo from "../PhotoInterface";
import HomeBtn from "../HomeBtn";
import useGetEmail from "../useGetEmail";
import { useParams } from 'next/navigation'; 
import List from "../List";
import styles from './UserPage.module.css';

export default function UserPage() {

    const params = useParams()
    const { email } = useGetEmail()

    const [visits, setVisits] = useState <number> (0)
    const [visWarn, setVisWarn] = useState <string> ('none')
    const [trueParamEmail, setTrueParamEmail] = useState <string> ('')
    const [subCount, setSubCount] = useState<number>(0)
    const [subStatus, setSubStatus] = useState<boolean | null>(null)
    const [photos, setPhotos] = useState<Photo[]>([])
    let userPhotos;
    let subBtn;

    if (photos.length !== 0) {
        userPhotos = <List photos={photos} setPhotos={setPhotos} email={email}/>
    } else {
        userPhotos = <h2 className={styles.loading}>Пользователь пока не публиковал фото</h2>;
    }

    if (subStatus === true) {
        subBtn = (
            <button 
                className={styles.unsubButton}
                onClick={async () => {
                    const targetEmail = params.email; 
                    await fetch('http://localhost:4000/users-controller/unsub', {
                        method: "PATCH",
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ email, targetEmail })
                    });
                    window.location.reload();
                }}
            >
                Отписаться
            </button>
        );
    } else if (subStatus === false) {
        subBtn = (
            <button 
                className={styles.subButton}
                onClick={async() => {
                    const targetEmail = params.email; 
                    await fetch('http://localhost:4000/users-controller/sub', {
                        method: "PATCH",
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ email, targetEmail })
                    });
                    window.location.reload();
                }}
            >
                Подписаться
            </button>
        );
    }

    useEffect(() => {
        const checkIsUser  = async () => {
            const isUserCheck = await fetch(`http://localhost:4000/users-controller/check/user/${params.email}`);
            const resultCheckUser  = await isUserCheck.text();
            if (resultCheckUser  === 'true') {
                const fetchPhotos = async () => {
                    try {
                        const resultMyPhotos = await getUserPhoto(params.email);
                        if (resultMyPhotos.length !== 0) {
                            setPhotos(resultMyPhotos);
                        }
                    } catch (error) {
                        console.error('Ошибка при получении фото', error);
                    }
                };
                fetchPhotos();


                const getVisits = async () => {
                    const getUserVisits = await fetch(`http://localhost:4000/users-controller/get/visits/${params.email}`)
                    const resultVisitsArr = await getUserVisits.json()
                    const myEmail = localStorage.getItem('photogram-enter')
                    let resultMyEmail: string = ''
                    if (myEmail) {
                        resultMyEmail = JSON.parse(myEmail)
                    }
                    const findMeAmongVisits = resultVisitsArr.find((el: string) => el === resultMyEmail)
                    if (findMeAmongVisits === undefined) {
                        let targetEmail = ''
                        if (typeof params.email === "string") {
                        const arrFromParamEmail = params.email.split('')
                        const resultParamArr = arrFromParamEmail.map(el => {
                        if (el === '%') {
                        return '@'
                        } else if (el === '4' || el === '0') {
                            return ''
                        } else {
                            return el
                        }
                    })
                        const resultParamEmail = resultParamArr.join('')
                        targetEmail = resultParamEmail
                    }
                        const visitsWithMe: string[] = [...resultVisitsArr, resultMyEmail]
                        const update = await fetch('http://localhost:4000/users-controller/update/visits', {
                            method: "PATCH",
                            headers: {
                            'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ visitsWithMe, targetEmail })
                        })
                        const resultUpdate = await update.text()
                        console.log(resultUpdate)
                    } 
                    setVisits(resultVisitsArr.length)
                }
                getVisits()
            } else {
                window.location.href = '/undef';
            }
        };
        checkIsUser ();
    }, []); 

    useEffect(() => {
        if (email !== '') {
            const checkSubStatus = async () => {
                const getAllSubs = await fetch(`http://localhost:4000/users-controller/all/subs/${params.email}`);
                const resultSubs = await getAllSubs.json();
                const findMeAmongSubs = resultSubs.find((el: string) => el === email);
                if (findMeAmongSubs !== undefined) {
                    setSubStatus(true)
                } else {
                    setSubStatus(false)
                }
                setSubCount(resultSubs.length - 1);
            };
            checkSubStatus();
        }
    }, [email]); 

    useEffect(() => {
        if (typeof params.email === "string") {
            const arrFromParamEmail = params.email.split('')
            const resultParamArr = arrFromParamEmail.map(el => {
                if (el === '%') {
                    return '@'
                } else if (el === '4' || el === '0') {
                    return ''
                } else {
                    return el
                }
            })
            const resultParamEmail = resultParamArr.join('')
            setTrueParamEmail(resultParamEmail)
        }
    }, [])

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.userInfo}>
                    <h2 className={styles.username}>{trueParamEmail}</h2>
                    <p className={styles.subCount}>Подписчики: {subCount}</p>
                </div>
                <div className={styles.actions}>
                    <p style={{display: visWarn, opacity: 0.7}}>Просмотры профиля</p>
                    <img src='https://steamuserimages-a.akamaihd.net/ugc/1916862140782257945/241CAB7053DABFB20EBBA44DC21AFE9F46D87494/?imw=512&amp;imh=289&amp;ima=fit&amp;impolicy=Letterbox&amp;imcolor=%23000000&amp;letterbox=true' width={30} height={20} onMouseEnter={() => setVisWarn('block')} onMouseLeave={() => setVisWarn('none')}/>
                    <p>{visits}</p>
                    {subBtn}
                    <HomeBtn />
                </div>
            </header>
            <div className={styles.photos}>
                {userPhotos} 
            </div>
        </div>
    );
}