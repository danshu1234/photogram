import { FC } from "react";
const { v4: uuidv4 } = require('uuid');
import styles from './ExitBtn.module.css'

interface ExitBtnProps {
    email: string;
}

const ExitBtn: FC<ExitBtnProps> = (props) => {
    return (
        <p 
            className={styles.exitAllButton}
            onClick={async() => {
                const newCode = uuidv4()
                const email = props.email
                await fetch('http://localhost:4000/users-controller/change/code', {
                    method: "PATCH",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ newCode, email })
                })
                localStorage.removeItem('photogram-enter')
                window.location.reload()
            }}
        >
            Выйти на всех устройствах
        </p>
    )
}

export default ExitBtn