'use client'

import { Message } from "@/app/Chat"
import { FC } from "react";
import getMessIdAndDate from "./getMessIdAndDate";
import "./SendBtn.css"

interface SendPhoto{
    file: File;
    base64: string;
}


interface SendBtnProps{
    sendMess: Function;
    editMess: string;
    inputMess: string;
    type: string;
    imageBase64: SendPhoto[];
}


const SendBtn: FC <SendBtnProps> = (props) => {
    const isActive = props.inputMess.trim() !== '' || props.imageBase64.length > 0;
    
    return (
        <button 
            className={`send-btn ${isActive ? 'active' : 'inactive'}`}
            onClick={async() => props.sendMess(props.type)}
            disabled={!isActive && props.editMess === ''}
        >
            {props.editMess ? '✏️' : '➤'}
        </button>
    )
}

export default SendBtn