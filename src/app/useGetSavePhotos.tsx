'use client'

import { FC, useEffect, useState } from "react"
import useGetEmail from "./useGetEmail"

const useGetSavePhotos = () => {

     const { email } = useGetEmail()
    
    const [mySavePosts, setMySavePosts] = useState <string[] | null> (null)

    const getSavePosts = async () => {
        const mySavePosts = await fetch(`http://localhost:4000/users-controller/get/save/posts/${email}`)
        const resultSavePosts = await mySavePosts.json()
        setMySavePosts(resultSavePosts)
    }

    useEffect(() => {
        if (email !== '') {
            getSavePosts()
        }
    }, [email])

    return { mySavePosts, setMySavePosts }

}

export default useGetSavePhotos