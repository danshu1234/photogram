'use client'

import { FC } from "react"
import getMessIdAndDate from "./getMessIdAndDate";
import { SendPhoto } from "./chats/[email]/page";

interface ShareBtnProps{
    text: string;
    date: string;
    id: string;
    typeMess: string;
    per: string;
    email: string;
    user: string;
    trueParamEmail: string;
}

const ShareBtn: FC <ShareBtnProps> = (props) => {
    const { messId } = getMessIdAndDate()
    return <button onClick={() => {
        let shareMess = {}
        if (props.per === '') {
            shareMess = {
                user: props.email,
                text: props.text,
                photos: [],
                date: props.date,
                id: messId,
                ans: '',
                edit: false,
                typeMess: props.typeMess,
                per: props.user,
                origId: props.id,
                origUser: props.trueParamEmail,
            }
        } else {
            shareMess = {
                user: props.email,
                text: props.text,
                photos: [],
                date: props.date,
                id: messId,
                ans: '',
                edit: false,
                typeMess: props.typeMess,
                per: props.per,
                origId: props.id,
                origUser: props.trueParamEmail,
            }
        }
        localStorage.setItem('shareMess', JSON.stringify(shareMess))
        window.location.href='/chats'
    }}>Переслать</button>
}

export default ShareBtn