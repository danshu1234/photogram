'use client'

import { ChangeEvent, FC, useEffect, useRef, useState } from "react"
import UserInterface from "../UserInterface"
import NameSearch from "../NameSearch";

interface CreateGroupProps{
    allUsers: UserInterface[];
    setCreateGroupChat: Function;
}

const CreateGroup: FC <CreateGroupProps> = (props) => {

    const [usersGroup, setUsersGroup] = useState <string[]> ([])
    const [groupName, setGropuName] = useState <string> ('')

    return (
        <div> 
            <p onClick={() => props.setCreateGroupChat(false)}>X</p>
            <input placeholder="Название" onChange={((event: ChangeEvent<HTMLInputElement>) => setGropuName(event.target.value))}/>
            <NameSearch allUsers={props.allUsers} type='groupCreate' usersGroup={usersGroup} setUsersGroup={setUsersGroup}/>
            <ul style={{listStyle: 'none'}}>
                {usersGroup.map((item, index) => {
                    return <li key={index}>
                        <div>
                            <p>{item}</p>
                            <p onClick={() => {
                                const resultUsers = usersGroup.filter(el => el !== item)
                                setUsersGroup(resultUsers)
                            }}>X</p>
                        </div>
                    </li>
                })}
            </ul>
            {(usersGroup.length > 1 && groupName !== '') ? <button onClick={() => {
                
            }}>Создать чат</button> : null}
        </div>
    )
}

export default CreateGroup