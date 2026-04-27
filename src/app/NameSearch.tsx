'use client'

import { ChangeEvent, FC, useEffect, useState, memo } from "react"
import styles from './NameSearch.module.css'

interface NameSearchProps{
    allUsers: any[],
    type: string,
    usersGroup?: string[];
    trueEmail?: string;
    setUsersGroup?: Function;
}

const NameSearch: FC<NameSearchProps> = (props) => {

    const [nameInput, setNameInput] = useState<string>('')
    const [usersList, setUsersList] = useState<any[] | null>(null)
    let showUsers;

    if (usersList !== null) {
        if (usersList.length === 0) {
            showUsers = <p className={styles.nameSearchEmpty}>Ничего не найдено</p>
        } else {
            showUsers = <ul className={styles.nameSearchList}>
                {usersList.map((item, index) => {
                    return <li key={index}>
                    <p onClick={() => {
                        if (props.type === 'users') {
                            window.location.href=`${item.email}`
                        } else if (props.type === 'chats') {
                            window.location.href=`chats/${item.user}`
                        } else if (props.type === 'groupCreate') {
                            if (props.usersGroup && props.setUsersGroup) {
                                if (props.trueEmail !== item.email) {
                                    console.log(props.usersGroup)
                                    if (!props.usersGroup.includes(item.email)) {
                                        const resultUsersGroup = [...props.usersGroup, item.email]
                                        props.setUsersGroup(resultUsersGroup)
                                    }
                                }
                            }
                        }
                    }}>{(props.type === 'users' || props.type === 'groupCreate') ? item.email : item.user}</p>
                    </li>
                })}
            </ul>
        }
    }
    
    useEffect(() => {
        console.log(`Email: ${props.trueEmail}`)
    }, [])

    useEffect(() => {
        if (nameInput === '') {
            setUsersList(null)
        } else {
            if (props.type === 'users' || props.type === 'groupCreate') {
                const filteredUsers = props.allUsers.filter(el => el.name.includes(nameInput))
                setUsersList(filteredUsers)
            } else {
                const filteredUsers = props.allUsers.filter(el => el.user.includes(nameInput))
                setUsersList(filteredUsers)
            }
        }
    }, [nameInput])


    return (
        <div className={styles.nameSearchContainer}>
            <input
              className={styles.nameSearchInput}
              placeholder="Поиск по имени"
              onChange={(event: ChangeEvent<HTMLInputElement>) => setNameInput(event.target.value)}
            />
            {showUsers}
        </div>
    )
}

export default memo(NameSearch)
