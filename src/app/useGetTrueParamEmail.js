'use client'

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const useGetTrueParamEmail = () => {

    const params = useParams()

    const [trueParamEmail, setTrueParamEmail] = useState ('')

    useEffect(() => {
        const paramEmail = params.email
        if (paramEmail) {
            const paramArr = Array.from(paramEmail)
            const newParamArr = paramArr.map(el => {
                if (el !== '4' && el !== '0') {
                    return el
                }
            })
            const resultParamArr = newParamArr.map(el => {
                if (el !== '%') {
                    return el
                } else {
                    return '@'
                }
            })
            const resultParamEmail = resultParamArr.join('')
            setTrueParamEmail(resultParamEmail)
        }
    }, [])

    return { trueParamEmail, setTrueParamEmail }
}

export default useGetTrueParamEmail