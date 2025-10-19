'use client'
import { FC, useEffect, useState, memo } from "react"
import FileChanger from "./FileChanger"
import styles from './Avatar.module.css'

interface AvaProps {
    type: string,
}

const Avatar: FC<AvaProps> = (props) => {
    const [newAva, setNewAva] = useState<string>('')
    const [ava, setAva] = useState<string | null>(null)

    useEffect(() => {
        const getAvatar = async () => {
            const avatar = await fetch('http://localhost:4000/users-controller/get/avatar', {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            })
            const resultAvatar = await avatar.text()
            setAva(resultAvatar)
        }
        getAvatar()
    }, [])

    return (
        <div className={styles.avatarContainer}>
            {ava === null ? (
                <div className={styles.avatarPlaceholder}>Загрузка аватара</div>
            ) : ava === '' ? (
                <div className={styles.avatarPlaceholder}>Нет фото</div>
            ) : (
                <img src={ava} className={styles.avatarImage} alt="Аватар"/>
            )}
            {props.type === 'edit' && (
                <div className={styles.fileInputContainer}>
                    <FileChanger setNewAva={setNewAva} newAva={newAva} setAva={setAva}/>
                    {ava !== '' ? <button onClick={async() => {
                        await fetch('http://localhost:4000/users-controller/delete/avatar', {
                            method: "PATCH",
                            credentials: 'include',
                        })
                        setAva('')
                    }}>Удалить аватар</button> : null}
                </div>
            )}
        </div>
    )
}

export default memo(Avatar)