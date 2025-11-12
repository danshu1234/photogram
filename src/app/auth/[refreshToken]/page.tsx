'use client'

import { useParams } from "next/navigation"
import { FC, useState, useEffect, useRef } from "react"

const AuthSucces: FC = () => {

    const params = useParams()

    useEffect(() => {
        if (params.refreshToken) {
            if (typeof params.refreshToken === 'string') {
                localStorage.setItem('photogram-enter-refresh', params.refreshToken)
                window.location.href='/home'
            }
        }
    }, [])

    return (
        <div>
            
        </div>
    )
}

export default AuthSucces