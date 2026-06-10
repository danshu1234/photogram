'use client'

import { ChangeEvent, FC } from "react"
import { Link } from "react-scroll";
import sendMess from "./sendMess";
import { Message, PhotoMess } from "@/app/Chat"
import UserInterface from "@/app/UserInterface";
import NameSearch from "@/app/NameSearch";

interface PartChatProps{
    participantsChat: string[];
    admin: string[];
    trueEmail: string;
    trueParamEmail: string;
    messages: Message[] | null;
    allUsers: UserInterface[];
    setEntrans: Function;
    setParticipantsChat: Function;
    setMessages: Function;
    succesSend: Function;
}

const PartChat: FC <PartChatProps> = (props) => {

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const avatarFile = e.target.files?.[0];
        if (avatarFile) {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const formData = new FormData()
                formData.append('ava', avatarFile)
                formData.append('id', props.trueParamEmail)
                await fetch('http://localhost:4000/chats-controller/group/new/avatar', {
                    method: "PATCH",
                    body: formData,
                    credentials: 'include',
                })
            };
            reader.readAsDataURL(avatarFile);
        }
    };
    
    return (
        <div>
            <p onClick={() => props.setEntrans(false)}>X</p>
            {/* <input 
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
            <p style={{opacity: 0.7, color: 'black'}}>Загрузить аватар</p>
        </label> */}
            <ul>
                {props.participantsChat.map((item, index) => {
                    return <li key={index}>
                        <div>
                            <p>{item}</p>
                            {(props.admin.includes(props.trueEmail) && item !== props.trueEmail) ? <div>
                                <p onClick={async() => {
                                    const trueParamEmail = props.trueParamEmail
                                    const particip = item
                                    await sendMess('text', `${item} исключен(а) из группы`, [], null, props.messages, '', props.trueEmail, props.setMessages, null, null, null, null, null, null, null, [], props.succesSend, trueParamEmail, null, null, null, props.participantsChat, '')
                                    const deleteParticip = await fetch('http://localhost:4000/chats-controller/delete/particip', {
                                        method: "PATCH",
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({ trueParamEmail, particip }),
                                        credentials: 'include',
                                    })
                                    const resultDeleteParticip = await deleteParticip.text()
                                    if (resultDeleteParticip === 'OK') {
                                        const resultChatParticip = props.participantsChat.filter(el => el !== item)
                                        props.setParticipantsChat(resultChatParticip)
                                    }
                                }}>Исключить</p>
                            </div> : null}
                        </div>
                    </li>
                })}
            </ul>
            {props.admin.includes(props.trueEmail) ? <NameSearch allUsers={props.allUsers} type={'participAdd'} trueParamEmail={props.trueParamEmail} trueEmail={props.trueEmail} usersGroup={props.participantsChat} setParticipantsChat={props.setParticipantsChat}/> : null}
        </div>
    )
}

export default PartChat