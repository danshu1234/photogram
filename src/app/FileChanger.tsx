'use client'

import { ChangeEvent, FC } from "react"

interface FileChangerProps{
    newAva: string;
    setAva: Function;
    setNewAva: Function;
}

const FileChanger: FC <FileChangerProps> = (props) => {

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const avatarFile = e.target.files?.[0];
        if (avatarFile) {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const formData = new FormData()
                formData.append('ava', avatarFile)
                await fetch('http://localhost:4000/users-controller/new/avatar', {
                    method: "PATCH",
                    body: formData,
                    credentials: 'include',
                })
                props.setAva('')
            };
            reader.readAsDataURL(avatarFile);
        }
    };

    return (
        <div>
        <input 
            type="file" 
            accept="image/*"
            onChange={handleFileChange}
            id="avatar-upload"
            style={{display: 'none'}}
        />
        <label htmlFor="avatar-upload" style={{
            display: 'block',
            width: '100%',
            height: '100%',
            cursor: 'pointer'
        }}>
            {props.newAva ? <img src={props.newAva} style={{width: '100%', height: '100%', borderRadius: '100%'}}/> : <p style={{opacity: 0.7, color: 'black'}}>Загрузить аватар</p>}
        </label>
    </div>
    )
}

export default FileChanger