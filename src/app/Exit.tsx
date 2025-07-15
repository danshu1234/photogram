import { FC } from "react";
const { v4: uuidv4 } = require('uuid');

interface ExitBtnProps{
    trueEmail: string;
}

const ExitBtn: FC <ExitBtnProps> = (props) => {
    return (
        <p style={{color: 'black', opacity: '0.7', cursor: 'pointer'}} onClick={async() => {
            const newCode = uuidv4()
            const trueEmail = props.trueEmail
            await fetch('http://localhost:4000/users-controller/change/code', {
                method: "PATCH",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ newCode, trueEmail })
            })
            localStorage.removeItem('photogram-enter')
            window.location.reload()
        }}>Выйти на всех устройствах</p>
    )
}

export default ExitBtn