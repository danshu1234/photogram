'use client'

import { useEffect } from "react"

const useCheckReg = () => {

    useEffect(() => {
        if (localStorage.getItem('photogram-enter') === null) {
            window.location.href = '/enter'
        } else {
            const checkToken = async () => {
                const token = localStorage.getItem('photogram-enter')
                const tokenCheck = await fetch(`http://localhost:4000/users-controller/check/token`, {
                    method: "POST",
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                })
                if (!tokenCheck.ok) {
                    localStorage.removeItem('photogram-enter')
                    window.location.href='/home'
                }
            }
            checkToken()
        }
    }, [])

    return {}

}

export default useCheckReg