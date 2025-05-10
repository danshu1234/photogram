import { FC } from "react";
import styles from './NotifsList.module.css';
import Link from "next/link";

interface Notif{
    notif: string,
    photoId: string,
}

interface NotifsListProps{
    notifs: Notif[],
    setIsNotifs: Function,
    email: string,
    setNotifs: Function,
}

const NotifsList: FC <NotifsListProps> = (props) => {
    let notifs;

    if (props.notifs.length !== 0 && Array.isArray(props.notifs) === true) {
        notifs = <ul className={styles.notifsList}>
            {props.notifs.map((item, index) => <li key={index} className={styles.notifItem}>{item.notif} <span
             style={{color: 'blue', cursor: 'pointer'}} onClick={() => window.open(`/bigphoto/${item.photoId}`, '_blank')}>фото</span></li>)}
        </ul>
    }

    return (
        <div className={styles.notifsContainer}>
            <div className={styles.notifsHeader}>
                <h3>Уведомления</h3>
                <button 
                    className={styles.closeButton}
                    onClick={async() => {
                        const email = props.email
                        await fetch('http://localhost:4000/users-controller/clear/notifs', {
                            method: "PATCH",
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ email })
                        })
                        props.setIsNotifs(false)
                        props.setNotifs([])
                    }}
                >X</button>
            </div>
            {notifs}
        </div>
    )
}

export default NotifsList;