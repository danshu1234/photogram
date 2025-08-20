'use client'

import { FC, useEffect, useState } from "react"
import useGetTrueParamEmail from "@/app/useGetTrueParamEmail"
import useGetEmail from "@/app/useGetEmail"
import useNotif from "@/app/useNotif"

interface PhotoInfo{
    url: string;
    user: string;
    date: string;
}

const Files: FC = () => {

    const {} = useNotif()

    const { email, trueEmail } = useGetEmail()
    const { trueParamEmail } = useGetTrueParamEmail()

    const [bigPhoto, setBigPhoto] = useState <PhotoInfo | null> (null)
    const [resultFiles, setResultFiles] = useState <PhotoInfo[] | null> (null) 
    let showFiles;

    if (resultFiles !== null) {
        if (resultFiles.length !== 0) {
            showFiles = <ul>
                {resultFiles.map((item, index) => <li key={index}><img src={item.url} width={100} height={100} onClick={() => setBigPhoto(item)}/></li>)}
            </ul>
        } else {
            showFiles = <h2>В этом чате файлов пока нет</h2>
        }
    }

    const getFiles = async () => {
        const getMess = await fetch(`http://localhost:4000/users-controller/get/mess`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, trueParamEmail })
        })
        const resultMess = await getMess.json()
        let resultPhotos: PhotoInfo[] = []
        for (let item of resultMess) {
            if (item.photos.length !== 0) {
                for (let el of item.photos) {
                    resultPhotos = [...resultPhotos, {url: el, user: item.user, date: item.date}]
                }
            }
        }
        setResultFiles(resultPhotos)
    }

    useEffect(() => {
        if (trueEmail !== '' && trueParamEmail !== '') {
            getFiles()
        }
    }, [trueEmail, trueParamEmail])

    return (
        <div>
            {showFiles}
            {bigPhoto !== null ? <div>
                <p onClick={() => setBigPhoto(null)}>X</p>
                <img src={bigPhoto.url} width={300} height={300}/>
                <h3>{bigPhoto.user}</h3>
                <h4>{bigPhoto.date}</h4>
            </div> : null}
        </div>
    )
}

export default Files