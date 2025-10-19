'use client'

import { useEffect } from "react"
import { useState } from "react"
import getUserEmail from "./getUserEmail"

const useGetEmail = () => {

    const [trueEmail, setTrueEmail] = useState ('')

    useEffect(() => {
        const getTrueEmail = async () => {
            const resultEmail = await getUserEmail()
            setTrueEmail(resultEmail)
        }
        getTrueEmail()
    }, [])

    return { trueEmail, setTrueEmail }

}

export default useGetEmail