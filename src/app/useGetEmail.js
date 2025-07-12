'use client'

import { useEffect } from "react"
import { useState } from "react"

const useGetEmail = () => {

    const [email, setEmail] = useState ('')

    useEffect(() => {
        const myEmail = localStorage.getItem('photogram-enter')
        if (myEmail) {
            setEmail(JSON.parse(myEmail))
        }
    }, [])

    return { email, setEmail }

}

export default useGetEmail