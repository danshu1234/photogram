'use client'

import { FC, useEffect, useState } from "react"
import { useParams } from "next/navigation";
import Photo from "@/app/PhotoInterface";
import useNotif from "@/app/useNotif";

const ShowPost: FC = () => {

    const {} = useNotif()

    const params = useParams()
    
    const [photo, setPhoto] = useState <string> ('')
    const [post, setPost] = useState <Photo | null> (null)

    useEffect(() => {
        const getPhoto = async () => {
            const photo = await fetch(`http://localhost:4000/photos/big/photo/${params.photoId}`)
            const resultPost = await photo.blob()
            setPhoto(URL.createObjectURL(resultPost))
        }
        const getPost = async () => {
            const photo = await fetch(`http://localhost:4000/photos/big/photo/info/${params.photoId}`)
            const resultPost = await photo.json()
            setPost(resultPost)
        }
        getPhoto()
        getPost()
    }, [])

    return (
        <div>
            {post !== null ? <div>
                <h3 onClick={() => window.location.href=`/${post.email}`}>{post.email}</h3>
                <h4>{post.date}</h4>
                <p>{post.descript}</p>
                {photo !== '' ? <div>
                    <img src={photo} width={400} height={400}/>
                </div> : null}
            </div> : null}
        </div>
    )
}

export default ShowPost