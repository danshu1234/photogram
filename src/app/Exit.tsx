import { FC } from "react";

const ExitBtn: FC = () => {
    return (
        <p style={{color: 'black', opacity: '0.7'}} onClick={() => {
            localStorage.removeItem('photogram-enter')
            window.location.reload()
        }}>Выйти</p>
    )
}

export default ExitBtn