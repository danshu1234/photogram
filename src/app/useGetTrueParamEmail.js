'use client'

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import getTrueParamEmail from "./getTrueParamEmail";

const useGetTrueParamEmail = () => {

    const params = useParams()

    const [trueParamEmail, setTrueParamEmail] = useState ('')

    useEffect(() => {
        const paramEmail = params.email
        if (paramEmail) {
            const resultParamEmail = getTrueParamEmail(paramEmail)
            setTrueParamEmail(resultParamEmail)
        }
    }, [])

    return { trueParamEmail, setTrueParamEmail }
}

export default useGetTrueParamEmail