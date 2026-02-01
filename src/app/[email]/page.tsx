'use client';

import { useEffect, useState } from "react";
import UserInterface from "../UserInterface";
import Photo from "../PhotoInterface";
import useGetEmail from "../useGetEmail";
import { PulseLoader } from "react-spinners";
import List from "../List";
import useGetTrueParamEmail from "../useGetTrueParamEmail";
import ChatBtn from "../ChatBtn";
import getUserEmail from "../getUserEmail";
import useCheckReg from "../CheckReg";
import useNotif from "../useNotif";
import styles from './UserPage.module.css';
import exitAcc from "../exitAcc";
import Call from "../Call";
import useOnlineStatus from "../useOnlineStatus";
import useCheckPrivateKey from "../useCheckPrivateKey";

export default function UserPage() {
    
    const {} = useNotif()
    const {} = useCheckReg()
    const {} = useOnlineStatus()
    const {} = useCheckPrivateKey()
    
    const { trueEmail } = useGetEmail();
    const [myEmail, setMyEmail] = useState<string | null>(null);
    const [mySubs, setMySubs] = useState<string[] | null>(null);
    const { trueParamEmail } = useGetTrueParamEmail();
    const [user, setUser] = useState<null | UserInterface>(null);
    const [photos, setPhotos] = useState<null | string | Photo[]>(null);
    const [succesCopy, setSuccesCopy] = useState <boolean> (false)

    let mainShow;
    let avatar;
    let photoShow;
    let chatBtn;

    if (user?.permMess === 'Все') {
        chatBtn = <ChatBtn trueParamEmail={trueParamEmail} />;
    } else if (user?.permMess === 'Только друзья') {
        if (mySubs?.includes(trueParamEmail) && user.subscribes.includes(trueEmail)) {
            chatBtn = <ChatBtn trueParamEmail={trueParamEmail} />;
        }
    }

    if (photos === 'unsend') {
        photoShow = (
            <div className={styles.photoRequest}>
                <h3>Пользователь скрыл свои фото</h3>
                <button className={styles.primaryBtn} onClick={async () => {
                    const userEmail = trueParamEmail;
                    const type = 'perm';
                    await fetch('http://localhost:4000/users-controller/new/notif', {
                        method: "PATCH",
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ userEmail, type }),
                        credentials: 'include',
                    });
                    setPhotos('send')
                }}>Отправить запрос</button>
            </div>
        );
    } else if (photos === 'send') {
        photoShow = <h3 className={styles.infoText}>Запрос отправлен</h3>;
    } else if (Array.isArray(photos) && trueEmail !== '') {
        if (photos?.length === 0) {
            photoShow = <h3 className={styles.infoText}>Пользователь еще не публиковал фото</h3>;
        } else {
            photoShow = <List photos={photos} setPhotos={setPhotos} trueEmail={trueEmail} />;
        }
    }

    avatar = user?.avatar
        ? <img src={user.avatar} className={styles.avatar} />
        : <div className={styles.emptyAvatar}></div>;

    if (user !== null && photos !== null && mySubs !== null && myEmail !== null && trueEmail !== '') {
        mainShow = (
            <div className={styles.profileContainer}>
                <div className={styles.headerSection}>
                    {avatar}
                    <div className={styles.userInfo}>
                        {succesCopy === true ? <p>Ссылка успешно скопирована!</p> : null}
                        <p style={{cursor: 'pointer'}} onClick={async() => {
                            await navigator.clipboard.writeText(`http://localhost:3000/${user.email}`)
                            setSuccesCopy(true)
                        }}>Скопировать ссылку на профиль</p>
                        <h3 className={styles.userEmail}>{user.email}</h3>
                        <h2 className={styles.userName}>{user.name}</h2>
                        <p className={styles.subCount}>Подписчики: {user.subscribes.length - 1}</p>
                        {chatBtn}
                    </div>
                </div>

                <div className={styles.actions}>
                    {user.subscribes.includes(myEmail) ? 
                        <button className={styles.secondaryBtn} onClick={async () => {
                            const targetEmail = trueParamEmail;
                            await fetch('http://localhost:4000/users-controller/unsub', {
                                method: "PATCH",
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ targetEmail }),
                                credentials: 'include',
                            });
                            setUser({...user, subscribes: user.subscribes.filter(el => el !== myEmail)})
                        }}>Отписаться</button>
                        :
                        <button className={styles.primaryBtn} onClick={async () => {
                            const targetEmail = trueParamEmail;
                            const userEmail = targetEmail
                            const type = 'sub'
                            await fetch('http://localhost:4000/users-controller/sub', {
                                method: "PATCH",
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ targetEmail }),
                                credentials: 'include',
                            });
                            await fetch('http://localhost:4000/users-controller/new/notif', {
                                method: "PATCH",
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ userEmail, type }),
                                credentials: 'include',
                            })
                            setUser({...user, subscribes: [...user.subscribes, myEmail]})
                        }}>Подписаться</button>
                    }

                    {user.reports.includes(trueEmail) ? 
                        <p className={styles.infoText}>Жалоба отправлена</p>
                        :
                        <button className={styles.dangerBtn} onClick={async () => {
                            const targetEmail = trueParamEmail;
                            await fetch('http://localhost:4000/users-controller/new/report', {
                                method: "PATCH",
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ targetEmail }),
                                credentials: 'include',
                            });
                            window.location.reload();
                        }}>Пожаловаться</button>
                    }
                </div>

                <div className={styles.photosSection}>
                    {photoShow}
                </div>
            </div>
        );
    } else {
        mainShow = <div className={styles.loader}><PulseLoader /></div>;
    }

    const getUserPhotos = async () => {
        const getPhotos = await fetch(`http://localhost:4000/photos/get/user/photos`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ trueParamEmail }),
            credentials: 'include',
        });
        if (getPhotos.ok) {
            const resultPhotos = await getPhotos.json();
            if (resultPhotos.type === 'photos') {
                setPhotos(resultPhotos.photos.map((el: any) => ({
                    ...el,
                    photoIndex: 0,
                    bonuce: false,
                })));
            } else {
                setPhotos(resultPhotos.type === 'send' ? 'send' : 'unsend');
            }
        } else {
            exitAcc()
        }
    };

    useEffect(() => {
        if (trueParamEmail !== '') {
            const getUserData = async () => {
                const getUser = await fetch(`http://localhost:4000/users-controller/get/user/data/${trueParamEmail}`);
                const resultUserData = await getUser.json();
                if (!resultUserData) {
                    window.location.href = '/undef';
                } else {
                    setUser(resultUserData);
                }
            };
            getUserData();
        }
    }, [trueParamEmail]);

    useEffect(() => {
        if (succesCopy === true) {
            setTimeout(() => {
                setSuccesCopy(false)
            }, 1500);
        }
    }, [succesCopy])

    useEffect(() => {
        const getMySubs = async () => {
            const mySubs = await fetch('http://localhost:4000/users-controller/all/subs/and/country', {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
            const resultSubs = await mySubs.json();
            setMySubs(resultSubs.subscribes);
        };
        const getMyEmail = async () => {
            const resultMyEmail = await getUserEmail();
            if (resultMyEmail) setMyEmail(resultMyEmail);
        };
        getMySubs();
        getMyEmail();
    }, []);

    useEffect(() => {
        if (user && trueEmail && trueParamEmail) {
            getUserPhotos();

            if (user.visits && !user.visits.includes(trueEmail)) {
                const targetEmail = trueParamEmail;
                fetch('http://localhost:4000/users-controller/update/visits', {
                    method: "PATCH",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ targetEmail }),
                    credentials: 'include',
                });
            }
        }
    }, [user, trueEmail, trueParamEmail]);

    return (
        <div className={styles.pageWrapper}>
            <Call/>
            {mainShow}
        </div>
    );
}
