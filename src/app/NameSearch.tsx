'use client'

import { ChangeEvent, FC, useEffect, useState, memo } from "react"
import styles from './NameSearch.module.css'

interface NameSearchProps{
    allUsers: any[],
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
                {usersList.map((item, index) => (
                  <li key={index}>
                    <p onClick={() => window.location.href=`${item.email}`}>{item.email}</p>
                  </li>
                ))}
            </ul>
        }
    }

    useEffect(() => {
        if (nameInput === '') {
            setUsersList(null)
        } else {
            const filteredUsers = props.allUsers.filter(el => el.name.includes(nameInput))
            setUsersList(filteredUsers)
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
