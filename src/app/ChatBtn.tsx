'use client'

import { FC } from "react";
import styles from './ChatBtn.module.css';

interface ChatBtnProps {
    trueParamEmail: string;
}

const ChatBtn: FC<ChatBtnProps> = (props) => {
    return (
        <button 
            className={styles.chatButton} 
            onClick={() => window.location.href=`/chats/${props.trueParamEmail}`}
        >
            💬 Чат
        </button>
    );
}

export default ChatBtn;
