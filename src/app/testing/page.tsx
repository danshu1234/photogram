'use client'

import { ChangeEvent, FC, useEffect, useState } from "react"

const Testing: FC = () => {

    return (
        <div>
            <button onClick={async() => {
                await fetch('http://localhost:4000/testing-users/create/user', {method: "POST"})
            }}>Создать пользователя</button> 
            <button onClick={async() => {
                const allUsers = await fetch('http://localhost:4000/testing-users/get/all/users')
                const resultAllUsers = await allUsers.json()
                console.log(resultAllUsers)
            }}>Получить всех пользователей</button>
        </div>
    )
}

export default Testing