'use client'

import { FC, useEffect, useState } from "react"
import { useParams } from "next/navigation";
import Photo from "@/app/PhotoInterface";

const ShowPost: FC = () => {

    const params = useParams()
    
    const [post, setPost] = useState <Photo | null> (null)

    useEffect(() => {
        const getPost = async () => {
            const postInfo = await fetch(`http://localhost:4000/photos/get/post/${params.photoId}`)
            const resultPost = await postInfo.json()
            setPost(resultPost)
        }
        getPost()
    }, [])

    return (
        <div>
            {post !== null ? <div>
                <h3 onClick={() => window.location.href=`/${post.email}`}>{post.email}</h3>
                <h4>{post.date}</h4>
                <p>{post.descript}</p>
                <ul>
                    {post.url.map((item, index) => <li key={index}><img src={item} width={300} height={300}/></li>)}
                </ul>
            </div> : null}
        </div>
    )
}

export default ShowPost