'use client'

import { Message } from "@/app/Chat"
import { FC } from "react";
import getMessIdAndDate from "./getMessIdAndDate";
import "./SendBtn.css"

interface SendPhoto{
    file: File;
    base64: string;
}


export interface SendBtnProps{
    sendMess: Function;
    editMess: string;
    inputMess: string;
    type: string;
    imageBase64: SendPhoto[];
    videoFile: {file: File, type: string} | null;
    messages: Message[] | null;
    trueEmail: string;
    setMessages: Function;
    answMess: string;
    setAnswMess: Function;
    setImageBase64: Function;
    setVideoFile: Function;
    setInputMess: Function;
    setOverStatus: Function;
    setFiles: Function;
    files: File[];
    succesSend: Function;
    trueParamEmail: string;
    backUpMess: Function;
    setEditMess: Function;
    setProcessSendMess: Function;
}


const SendBtn: FC <SendBtnProps> = (props) => {
    const isActive = props.inputMess.trim() !== '' || props.imageBase64.length > 0;
    
    return (
        <button 
            className={`send-btn ${isActive ? 'active' : 'inactive'}`}
            onClick={async() => props.sendMess(props.type, props.inputMess, props.imageBase64, props.videoFile, props.messages, props.editMess, props.trueEmail, props.setMessages, props.answMess, props.setAnswMess, props.setImageBase64, props.setVideoFile, props.setInputMess, props.setOverStatus, props.setFiles, props.files, props.succesSend, props.trueParamEmail, props.backUpMess, props.setEditMess, props.setProcessSendMess)}
            disabled={!isActive && props.editMess === ''}
        >
            {props.editMess ? '✏️' : '➤'}
        </button>
    )
}

export default SendBtn