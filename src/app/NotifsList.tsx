import { FC, memo, useEffect, useState } from "react";
import styles from './NotifsList.module.css';
import exitAcc from "./exitAcc";

interface Notif{
    type: string,
    photoId?: string,
    user: string,
    photoCount?: number,
}

interface NotifsListProps{
    notifs: Notif[],
    setIsNotifs: Function,
    setNotifs: Function,
}

const NotifsList: FC <NotifsListProps> = (props) => {

    const [resNotifs, setResNotifs] = useState <Notif[]> ([])

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

    useEffect(() => {
      const notifsNames = props.notifs.map((el: Notif) => el.user)
      const uniqueNotifsNames = Array.from(new Set(notifsNames))
      const photoNotifs = uniqueNotifsNames.map(el => {
        const thisUserPhotos = props.notifs.filter((element: Notif) => element.user === el && element.type === 'photo')
        if (thisUserPhotos.length === 1) {
          return {
            user: el,
            type: 'photo',
            photoId: thisUserPhotos[0].photoId,
            photoCount: 1,
          }
        } else {
          return {
            user: el,
            type: 'photo',
            photoCount: thisUserPhotos.length,
          }
        }
      })
      const resultPhotoNotifs = photoNotifs.filter(el => el.photoCount !== 0)
      const resultSubNotifs = props.notifs.filter((el: Notif) => el.type !== 'photo')
      setResNotifs([...resultSubNotifs, ...resultPhotoNotifs])
    }, [])

    if (resNotifs.length !== 0) {
        notifs = <ul className={styles.notifsList}>
            {resNotifs.map((item, index) => {
                if (item.type === 'photo') {
                    if (item.photoCount === 1) {
                        return <li key={index}><p><span style={{cursor: 'pointer', color: 'blue'}} onClick={() => window.location.href=`/${item.user}`}>{item.user}</span> оценил(а) ваше <span style={{cursor: 'pointer', color: 'blue'}} onClick={() => window.open(`/bigphoto/${item.photoId}`, '_blank')}>фото</span></p></li>
                    } else {
                        return <li key={index}><p><span style={{cursor: 'pointer', color: 'blue'}} onClick={() => window.location.href=`/${item.user}`}>{item.user}</span> оценил(а) {item.photoCount} ваших фото</p></li>
                    }
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
                } else if (item.type === 'sub') {
                    return <li key={index}><p><span style={{cursor: 'pointer', color: 'blue'}} onClick={() => window.location.href=`/${item.user}`}>{item.user}</span> подписался(ась) на вас</p></li>
                } else if (item.type === 'comment') {
                    return <li key={index}><p><span style={{cursor: 'pointer', color: 'blue'}} onClick={() => window.location.href=`/${item.user}`}>{item.user}</span> прокомментировал(а) <span style={{cursor: 'pointer', color: 'blue'}} onClick={() => window.open(`/bigphoto/${item.photoId}`, '_blank')}>фото</span></p></li>
                } else if (item.type === 'public') {
                    return <li key={index}><p><span style={{cursor: 'pointer', color: 'blue'}} onClick={() => window.location.href=`/${item.user}`}>{item.user}</span> опубликовал(а) новую запись</p></li>
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