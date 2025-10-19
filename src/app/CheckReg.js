'use client'

import { useEffect } from "react"

const useCheckReg = () => {

    useEffect(() => {
            const checkToken = async () => {
                const tokenCheck = await fetch(`http://localhost:4000/users-controller/check/token`, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                })
                if (!tokenCheck.ok) {
                    const refreshToken = localStorage.getItem('photogram-enter-refresh')
                    if (refreshToken) {
                            const getNewAccessToken = await fetch('http://localhost:4000/users-controller/get/new/token', {
                            method: "PATCH",
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ refreshToken }),
                            credentials: 'include',
                        })
                        if (getNewAccessToken.ok) {
                            const resultNewAccessToken = await getNewAccessToken.json()
                            localStorage.setItem('photogram-enter-refresh', resultNewAccessToken.refreshToken)
                            
                        } else {
                            localStorage.removeItem('photogram-enter-refresh')
                            window.location.href = '/enter'
                        }
                    } else {
                        window.location.href = '/enter'
                    }
                }
            }
            checkToken()
    }, [])

    return {}

}

export default useCheckReg