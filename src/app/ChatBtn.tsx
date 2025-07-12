'use client'

import { FC } from "react"

interface ChatBtnProps{
    trueParamEmail: string;
}

const ChatBtn: FC <ChatBtnProps> = (props) => {
    return <button onClick={() => window.location.href=`/chats/${props.trueParamEmail}`}>Чат</button>
}

export default ChatBtn