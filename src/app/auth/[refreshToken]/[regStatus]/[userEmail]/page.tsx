'use client'

import { useParams } from "next/navigation"
import { FC, useState, useEffect, useRef } from "react"
import generateKeyPair from "@/app/generateKeyPair"
import getTrueParamEmail from "@/app/getTrueParamEmail"

const AuthSucces: FC = () => {

    const params = useParams()

    useEffect(() => {
        const regUser = async () => {
            if (params.refreshToken) {
                if (typeof params.refreshToken === 'string') {
                    localStorage.setItem('photogram-enter-refresh', params.refreshToken)
                }
            }
            const regStatus = params.regStatus
            if (regStatus === 'true') {
                const keyPair = generateKeyPair()
                const privateKey = keyPair.privateKey
                const publicKey = keyPair.publicKey
                const addPublicKey = await fetch('http://localhost:4000/users-controller/add/public/key', {
                    method: "PATCH",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ publicKey }),
                    credentials: 'include',
                })
                const resultAddPublicKey = await addPublicKey.text()
                if (resultAddPublicKey === 'OK') {
                    if (params.userEmail) {
                        if (typeof params.userEmail === 'string') {
                            const resultUserEmail = getTrueParamEmail(params.userEmail)
                            localStorage.setItem(`${resultUserEmail}PrivateKey`, privateKey)
                            window.location.href='/home'
                        }
                    }
                }
            } else {
                window.location.href='/home'
            }
        }
        regUser()
    }, [])

    return (
        <div>
            
        </div>
    )
}

export default AuthSucces