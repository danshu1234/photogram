'use client'

import { useEffect } from "react"

const useCheckReg = () => {

    useEffect(() => {
        if (localStorage.getItem('photogram-enter') === null) {
            window.location.href = '/enter'
        }
    }, [])

    return {}

}

export default useCheckReg