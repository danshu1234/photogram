'use client'

import { FC, use, useEffect, useState } from "react"
import { v4 as uuidv4 } from 'uuid';

interface TestingInterProps{
    mainShow: string;
}

const TestingInter: FC <TestingInterProps> = (props) => {

    const [userData, setUserData] = useState <{name: string, id: string, age: string}> ({name: '', id: '', age: ''})

    let nameInput;
    let idInput;
    let ageInput;

    if (props.mainShow === 'create' || props.mainShow === 'change') {
        nameInput = <input placeholder="Name" value={userData.name} onChange={(event) => setUserData({...userData, name: event.target.value})}/>
    }

    if (props.mainShow === 'change' || props.mainShow === 'delete') {
        idInput = <input placeholder="Id" value={userData.id} onChange={(event) => setUserData({...userData, id: event.target.value})}/>
    }

    if (props.mainShow === 'create') {
        ageInput = <input placeholder="Age" value={userData.age} onChange={(event) => setUserData({...userData, age: event.target.value})}/>
    }

    const clearData = () => setUserData({name: '', id: '', age: ''})

    const submit = async () => {
        if (props.mainShow === 'create') {
            if (userData.name !== '' && userData.age !== '') {
                const name = userData.name
                const age = userData.age
                const id = uuidv4()
                await fetch('http://localhost:4000/testing-users/create/user', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, age, id })
                })
                clearData()
            }
        } else if (props.mainShow === 'change') {
            if (userData.id !== '' && userData.name !== '') {
                const id = userData.id
                const name = userData.name
                await fetch('http://localhost:4000/testing-users/change/user', {
                    method: "PATCH",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id, name })
                })
                clearData()
            }
        } else if (props.mainShow === 'delete') {
            if (userData.id !== '') {
                const id = userData.id
                await fetch(`http://localhost:4000/testing-users/delete/user/${id}`, {method: "DELETE"})
                clearData()
            }
        }
    }

    return (
        <div>
            {nameInput}
            {idInput}
            {ageInput}
            <button onClick={submit}>Submit</button>
            <button onClick={async() => {
                const users = await fetch('http://localhost:4000/testing-users/get/users')
                const resultUsers = await users.json()
                console.log(resultUsers)
            }}>Get users</button>
        </div>
    )
}

export default TestingInter