'use client'

import { QRCodeSVG } from "qrcode.react";
import { FC, use, useEffect, useState } from "react";
import { RingLoader } from "react-spinners";

interface EnterQrProps{
    setEnterCode: Function;
}

const EnterQr: FC <EnterQrProps> = (props) => {

    const [tokenUser, setTokenUser] = useState <string | null> (null)

    useEffect(() => {
        console.log(tokenUser)
    }, [tokenUser])

    useEffect(() => {
        const getToken = async () => {
            const refreshToken = localStorage.getItem('photogram-enter-refresh')
            if (refreshToken) {
                const userToken = await fetch('http://localhost:4000/users-controller/get/token', {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                    },      
                    credentials: 'include',         
                })
                const resultUserToken = await userToken.text()
                setTokenUser(JSON.stringify({token: resultUserToken, refreshToken: refreshToken}))
            }
        }
        getToken()
    }, [])

    return (
        <div> 
            <p onClick={() => props.setEnterCode(false)}>X</p>
            {tokenUser ? <QRCodeSVG value={tokenUser} width={200} height={200}/> : <RingLoader/>}
        </div>
    );
}

export default EnterQr