import { FC } from "react";

const ExitBtn: FC = () => {
    return (
        <button style={{color: 'aqua', backgroundColor: 'red', width: '60px', height: '35px', borderRadius: '5px', cursor: 'pointer'}} onClick={() => {
            localStorage.removeItem('photogram-enter')
            window.location.reload()
        }}>Выйти</button>
    )
}

export default ExitBtn