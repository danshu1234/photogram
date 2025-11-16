'use client'

import { FC } from "react"
import getMessIdAndDate from "./getMessIdAndDate";

interface ShareBtnProps{
    text: string;
    photos: string[];
    date: string;
    id: string;
    typeMess: string;
    per: string;
    email: string;
    user: string;
}

const ShareBtn: FC <ShareBtnProps> = (props) => {
    const { messId } = getMessIdAndDate()
    return <button onClick={() => {
        let shareMess = {}
        if (props.per === '') {
            shareMess = {
                user: props.email,
                text: props.text,
                photos: props.photos,
                date: props.date,
                id: messId,
                ans: '',
                edit: false,
                typeMess: props.typeMess,
                per: props.user,
            }
        } else {
            shareMess = {
                user: props.email,
                text: props.text,
                photos: props.photos,
                date: props.date,
                id: messId,
                ans: '',
                edit: false,
                typeMess: props.typeMess,
                per: props.per,
            }
        }
        localStorage.setItem('shareMess', JSON.stringify(shareMess))
        window.location.href='/chats'
    }}>Переслать</button>
}

export default ShareBtn