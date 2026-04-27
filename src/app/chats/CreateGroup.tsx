'use client'

import { ChangeEvent, FC, useEffect, useRef, useState } from "react"
import UserInterface from "../UserInterface"
import NameSearch from "../NameSearch";
import sendMess from "./[email]/sendMess";

interface CreateGroupProps{
    allUsers: UserInterface[];
    setCreateGroupChat: Function;
    trueEmail: string;
}

const CreateGroup: FC <CreateGroupProps> = (props) => {

    const [usersGroup, setUsersGroup] = useState <string[]> ([])
    const [groupName, setGropuName] = useState <string> ('')

    return (
        <div> 
            <p onClick={() => props.setCreateGroupChat(false)}>X</p>
            <input placeholder="Название" onChange={((event: ChangeEvent<HTMLInputElement>) => setGropuName(event.target.value))}/>
            <NameSearch allUsers={props.allUsers} type='groupCreate' usersGroup={usersGroup} setUsersGroup={setUsersGroup} trueEmail={props.trueEmail}/>
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
                const resultUsersGroup = [...usersGroup, props.trueEmail]
                sendMess('text', 'Добро пожаловать в чат', [], null, [], '', props.trueEmail, null, '', null, null, null, null, null, null, [], null, '', null, null, null, resultUsersGroup, groupName)
            }}>Создать чат</button> : null}
        </div>
    )
}

export default CreateGroup