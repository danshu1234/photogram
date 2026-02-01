'use client'

import { useEffect, useState } from "react"
import useGetEmail from './useGetEmail'
import generateKeyPair from './generateKeyPair'

const useCheckPrivateKey = () => {

    const { trueEmail } = useGetEmail()

    const [secretKey, setSecretKey] = useState('')

    const checkPrivateKey = async () => {
        const findPrivateKey = localStorage.getItem(`${trueEmail}PrivateKey`)
        if (!findPrivateKey) {
            console.log('fijewijf')
            const keyPair = generateKeyPair()
            const privateKey = keyPair.privateKey
            const publicKey = keyPair.publicKey
            const addKey = await fetch('http://localhost:4000/users-controller/add/public/key', {
                method: "PATCH",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ publicKey }),
                credentials: 'include',
            })
            const resultAddKey = await addKey.text()
            if (resultAddKey === 'OK') {
                localStorage.setItem(`${trueEmail}PrivateKey`, privateKey)
                setSecretKey(privateKey)
            }
        } else {
            setSecretKey(findPrivateKey)
        }
    }

    useEffect(() => {
        if (trueEmail !== '') {
            checkPrivateKey()
        }
    }, [trueEmail])

    return { secretKey }

}

export default useCheckPrivateKey