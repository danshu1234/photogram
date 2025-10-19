import { FC, memo } from "react";
import styles from './NotifsList.module.css';
import useGetEmail from "./useGetEmail";
import exitAcc from "./exitAcc";

interface Notif{
    type: string,
    photoId?: string,
    user: string,
}

interface NotifsListProps{
    notifs: Notif[],
    setIsNotifs: Function,
    setNotifs: Function,
}

const NotifsList: FC <NotifsListProps> = (props) => {

    let notifs;

    const tellUserAboutPerm = async (succOrErr: string, userEmail: string) => {
        const type = succOrErr
        await fetch('http://localhost:4000/users-controller/new/notif', {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userEmail, type }),
            credentials: 'include',
        })
    }

    const deletePermNotif = async (user: string) => {
        const deleteNotif = await fetch('http://localhost:4000/users-controller/delete/perm', {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user }),
            credentials: 'include',
        })
        const resultNotifs = await deleteNotif.json()
        props.setNotifs(resultNotifs)
    }

    if (props.notifs.length !== 0 && Array.isArray(props.notifs) === true) {
        notifs = <ul className={styles.notifsList}>
            {props.notifs.map((item, index) => {
                if (item.type === 'photo') {
                    return <li key={index}><p><span style={{cursor: 'pointer', color: 'blue'}} onClick={() => window.location.href=`/${item.user}`}>{item.user}</span> оценил(а) ваше <span style={{cursor: 'pointer', color: 'blue'}} onClick={() => window.open(`/bigphoto/${item.photoId}`, '_blank')}>фото</span></p></li>
                } else if (item.type === 'perm') {
                    return <li key={index}>
                        <div>
                            <p><span style={{cursor: 'pointer', color: 'blue'}} onClick={() => window.location.href=`/${item.user}`}>{item.user}</span> хочет посмотреть ваши фото</p>
                            <button onClick={async() => {
                                const newUserEmail = item.user
                                const addNewPermUser = async () => {
                                    await fetch('http://localhost:4000/users-controller/new/perm/user', {
                                        method: "PATCH",
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({ newUserEmail }),
                                        credentials: 'include',
                                    })
                                }
                                addNewPermUser()
                                await tellUserAboutPerm('succes', newUserEmail)
                                await deletePermNotif(item.user)
                            }}>Принять</button>
                            <button onClick={async() => {
                                const newUserEmail = item.user
                                await tellUserAboutPerm('err', newUserEmail)
                                await deletePermNotif(item.user)
                            }}>Отклонить</button>
                        </div>
                    </li>
                } else if (item.type === 'succes') {
                    return <li key={index}><p><span style={{cursor: 'pointer', color: 'blue'}} onClick={() => window.location.href=`/${item.user}`}>{item.user}</span> принял(а) ваш запрос на просмотр фото</p></li>
                } else if (item.type === 'err') {
                    return <li key={index}><p><span style={{cursor: 'pointer', color: 'blue'}} onClick={() => window.location.href=`/${item.user}`}>{item.user}</span> отклонил(а) ваш запрос на просмотр фото</p></li>
                }
            })}
        </ul>
    }

    return (
        <div className={styles.notifsContainer}>
            <div className={styles.notifsHeader}>
                <h3>Уведомления</h3>
                <button 
                    className={styles.closeButton}
                    onClick={async() => {
                        const clearNotifs = await fetch('http://localhost:4000/users-controller/clear/notifs', {
                            method: "PATCH",
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            credentials: 'include',
                        })
                        if (clearNotifs.ok) {
                            const resultNotifs = await clearNotifs.json()
                            props.setIsNotifs(false)
                            props.setNotifs(resultNotifs)
                        } else {
                            exitAcc()
                        }
                    }}
                >X</button>
            </div>
            {notifs}
        </div>
    )
}

export default memo(NotifsList);