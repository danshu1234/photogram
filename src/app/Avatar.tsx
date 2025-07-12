'use client'

import { ChangeEvent, FC, useEffect, useState } from "react"
import FileChanger from "./FileChanger"

interface AvaProps{
    email: string,
    type: string,
}

const Avatar: FC <AvaProps> = (props) => {

    const [newAva, setNewAva] = useState <string> ('')
    const [ava, setAva] = useState <string | null> (null)
    let showAva;

    if (ava === null) {
        showAva = <div style={{width: 200, height: 200, borderRadius: '100%', backgroundColor: 'green'}}>Загрузка аватара</div>
    } else if (ava === '') {
        if (props.type === 'edit') {
            showAva = <div>
                <div style={{width: 200, height: 200, borderRadius: '100%', backgroundColor: 'green', cursor: 'pointer'}}>Нет фото</div>
                <FileChanger setNewAva={setNewAva} newAva={newAva} email={props.email}/>
            </div>
        } else {
            showAva = <div style={{width: 200, height: 200, borderRadius: '100%', backgroundColor: 'green', cursor: 'pointer'}}>Нет фото</div>
        }
    } else {
        if (props.type === 'edit') {
            showAva = <div>
                <img src={ava} style={{width: 200, height: 200, borderRadius: '100%'}}/>
                <FileChanger setNewAva={setNewAva} newAva={newAva} email={props.email}/>
            </div>
        } else {
            showAva = <img src={ava} style={{width: 200, height: 200, borderRadius: '100%'}}/>
        }
    }

    useEffect(() => {
        const getAvatar = async () => {
            console.log('Получение аватара...')
            const avatar = await fetch(`http://localhost:4000/users-controller/get/avatar/${props.email}`)
            const resultAvatar = await avatar.text()
            setAva(resultAvatar)
        }
        getAvatar()
    }, [])

    return (
        <div>
            {showAva}
        </div>
    )
}

export default Avatar