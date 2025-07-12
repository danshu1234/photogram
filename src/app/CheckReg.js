'use client'

import { useEffect } from "react"

const useCheckReg = () => {

    useEffect(() => {
        if (localStorage.getItem('photogram-enter') === null) {
            window.location.href = '/enter'
        } else {
            const checkDeleteUser = async () => {
                const myEmail = JSON.parse(localStorage.getItem('photogram-enter'))
                const checkDeleteUser = await fetch(`http://localhost:4000/users-controller/check/delete/${myEmail}`)
                const resultCheck = await checkDeleteUser.text()
                if (resultCheck === 'undefined') {
                    localStorage.removeItem('photogram-enter')
                    window.location.href = '/enter'
                }
            }
            checkDeleteUser()
        }
    }, [])

    return {}

}

export default useCheckReg