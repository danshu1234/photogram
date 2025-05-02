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

    const [subCount, setSubCount] = useState<number>(0)
    const [subStatus, setSubStatus] = useState<boolean | null>(null)
    const [photos, setPhotos] = useState<Photo[]>([])
    let userPhotos;
    let subBtn;

    if (photos.length !== 0) {
        userPhotos = <List photos={photos} setPhotos={setPhotos} email={email}/>
    } else {
        userPhotos = <h2 className={styles.loading}>Загрузка...</h2>;
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
            } else {
                window.location.href = '/undef/user';
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

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.userInfo}>
                    <h2 className={styles.username}>@{params.email?.toString().split('@')[0]}</h2>
                    <p className={styles.subCount}>Подписчики: {subCount}</p>
                </div>
                <div className={styles.actions}>
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