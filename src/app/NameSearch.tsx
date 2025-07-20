'use client'

import { ChangeEvent, FC, useEffect, useState, memo } from "react"

interface NameSearchProps{
    allUsers: any[],
}

const NameSearch: FC <NameSearchProps> = (props) => {

    const [nameInput, setNameInput] = useState <string> ('')
    const [usersList, setUsersList] = useState <any[] | null> (null)
    let showUsers;

    if (usersList !== null) {
        if (usersList.length === 0) {
            showUsers = <p>Ничего не найдено</p>
        } else {
            showUsers = <ul>
                {usersList.map((item, index) => <li key={index}><p onClick={() => window.location.href=`${item.email}`}>{item.email}</p></li>)}
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
        <div>
            <input placeholder="Поиск по имени" onChange={(event: ChangeEvent<HTMLInputElement>) => setNameInput(event.target.value)}/>
            {showUsers}
        </div>
    )
}

export default memo(NameSearch)