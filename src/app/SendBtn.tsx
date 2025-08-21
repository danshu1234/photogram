'use client'

import { Message } from "@/app/Chat"
import { FC } from "react";
import getMessIdAndDate from "./getMessIdAndDate";

interface SendPhoto{
    file: File;
    base64: string;
}

interface SendBtnProps{
    inputMess: string;
    imageBase64: SendPhoto[];
    messages: Message[] | null;
    answMess: string;
    email: string;
    trueEmail: string;
    trueParamEmail: string;
    editMess: string;
    socketId: string;
    setMessages: Function;
    setEditMess: Function;
    setInputMess: Function;
    setAnswMess: Function;
    setImageBase64: Function;
}


const SendBtn: FC <SendBtnProps> = (props) => {
    return (
        <button onClick={async() => {
                const isText = props.inputMess !== ''
                const isPhotos = props.imageBase64.length !== 0
                if ((isText && isPhotos) || (isText && !isPhotos) || (!isText && isPhotos)) {
                    try {
                    const email = props.email
                    const trueParamEmail = props.trueParamEmail
                    const editMess = props.editMess
                    const inputMess = props.inputMess
                    const imageBase64 = props.imageBase64
                    if (props.messages?.length !== 0) {
                        if (props.messages) {
                            if (editMess === '') {
                                const { formattedDate, messId } = getMessIdAndDate() 
                                const newMessages = [...props.messages, {user: props.trueEmail, text: inputMess, photos: imageBase64.map(el => el.base64), date: formattedDate, id: messId, ans: props.answMess, edit: false, typeMess: 'text', per: ''}]
                                const formData = new FormData()
                                for (let item of props.imageBase64) {
                                    formData.append('photo', item.file)
                                }
                                formData.append('user', props.trueEmail)
                                formData.append('text', inputMess)
                                formData.append('date', formattedDate)
                                formData.append('id', messId)
                                formData.append('ans', props.answMess)
                                formData.append('code', email)
                                formData.append('trueParamEmail', trueParamEmail)
                                formData.append('per', '')
                                formData.append('type', 'text')
                                await fetch('http://localhost:4000/users-controller/new/mess', {
                                    method: "PATCH",
                                    body: formData,
                                })
                                props.setMessages(newMessages)
                                props.setAnswMess('')
                                props.setImageBase64([])
                            } else {
                                const per = ''
                                await fetch('http://localhost:4000/users-controller/edit/mess', {
                                    method: "PATCH",
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({ email, trueParamEmail, editMess, inputMess, per })
                                })
                                const newMess = props.messages.map(el => {
                                    if (el.id === editMess) {
                                        return {
                                            ...el,
                                            text: inputMess,
                                            edit: true,
                                        }
                                    } else {
                                        return el
                                    }
                                })
                                props.setMessages(newMess)
                                props.setEditMess('')
                                props.setImageBase64([])
                            }                        
                        }
                    } else {
                        if (props.messages) {
                            const { formattedDate, messId } = getMessIdAndDate()
                            const formData = new FormData()
                            formData.append('user', props.trueEmail)
                            formData.append('text', inputMess)
                            formData.append('date', formattedDate)
                            formData.append('id', messId)
                            formData.append('ans', props.answMess)
                            formData.append('code', email)
                            formData.append('trueParamEmail', trueParamEmail)
                            formData.append('per', '')
                            formData.append('type', 'text')
                            await fetch('http://localhost:4000/users-controller/new/chat', {
                                method: "PATCH",
                                body: formData,
                            })
                            props.setMessages([{user: props.trueEmail, text: inputMess, photos: imageBase64.map(el => el.base64), date: formattedDate, id: messId, ans: '', edit: false, typeMess: 'text', per: ''}])
                        }
                    }
                    props.setInputMess('')
                    } catch (e) {
                        alert('Превышен допустимый объем файлов')
                        props.setImageBase64([])
                        props.setInputMess('')
                    }                   
                }
            }}>Отправить</button>
    )
}

export default SendBtn