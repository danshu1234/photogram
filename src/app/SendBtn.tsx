'use client'

import { Message } from "@/app/Chat"
import { FC } from "react";
import getMessIdAndDate from "./getMessIdAndDate";
import "./SendBtn.css"
import AnsMess from "./chats/[email]/Answ";

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
    answMess: AnsMess | null;
    setAnswMess: Function;
    setImageBase64: Function;
    setVideoFile: Function;
    setInputMess: Function;
    setOverStatus: Function;
    setFiles: Function;
    files: File[];
    usersChat: string[];
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
            onClick={async() => {
                const photosCountPack = Math.ceil(props.imageBase64.length / 10)
                let resultPhotos: any[] = []
                for (let i=0; i<photosCountPack; i++) {
                    resultPhotos = [...resultPhotos, []]
                }
                console.log('Photos: ')
                console.log(resultPhotos)
                const imagesWithSequenNumbers = props.imageBase64.map((el, index) => {
                    return {
                        ...el,
                        index: index,
                    }
                })
                for (let item of imagesWithSequenNumbers) {
                    const numberImage = Math.floor(item.index / 10)
                    resultPhotos = resultPhotos.map((element, index) => {
                        if (index === numberImage) {
                            return [...element, {file: item.file, base64: item.base64}]
                        } else {
                            return element
                        }
                    })
                }
                for (let photosPack of resultPhotos) {
                    props.sendMess(props.type, props.inputMess, photosPack, props.videoFile, props.messages, props.editMess, props.trueEmail, props.setMessages, props.answMess, props.setAnswMess, props.setImageBase64, props.setVideoFile, props.setInputMess, props.setOverStatus, props.setFiles, props.files, props.succesSend, props.trueParamEmail, props.backUpMess, props.setEditMess, props.setProcessSendMess, props.usersChat)
                }
            }}
            disabled={!isActive && props.editMess === ''}
        >
            {props.editMess ? '✏️' : '➤'}
        </button>
    )
}

export default SendBtn