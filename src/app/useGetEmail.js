'use client'

import { useEffect } from "react"
import { useState } from "react"
import getUserEmail from "./getUserEmail"

const useGetEmail = () => {

    const [email, setEmail] = useState ('')
    const [trueEmail, setTrueEmail] = useState ('')

    useEffect(() => {
        const myEmail = localStorage.getItem('photogram-enter')
        if (myEmail) {
            setEmail(JSON.parse(myEmail))
        }
    }, [])

    useEffect(() => {
        if (email !== '') {
            const getTrueEmail = async () => {
                const resultEmail = await getUserEmail()
                setTrueEmail(resultEmail)
            }
            getTrueEmail()
        }
    }, [email])

    return { email, setEmail, trueEmail, setTrueEmail }

}

export default useGetEmail