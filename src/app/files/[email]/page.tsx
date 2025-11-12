'use client'

import { FC, useEffect, useState } from "react"
import useGetTrueParamEmail from "@/app/useGetTrueParamEmail"
import useGetEmail from "@/app/useGetEmail"
import useNotif from "@/app/useNotif"
import Call from "@/app/Call"
import useOnlineStatus from "@/app/useOnlineStatus"
import { Message } from "@/app/Chat"
import { ClipLoader } from "react-spinners"

interface PhotoInfo{
    url: string;
    user: string;
    date: string;
}

interface VideoMess extends Message{
    videoSrc: string;
}

interface VideoMessage{
    date: string;
    videoMessages: VideoMess[];
}

const Files: FC = () => {

    const {} = useNotif()
    const {} = useOnlineStatus()

    const { trueEmail } = useGetEmail()

    const { trueParamEmail } = useGetTrueParamEmail()

    const [typeFile, setTypeFile] = useState <string> ('photo')
    const [bigPhoto, setBigPhoto] = useState <PhotoInfo | null> (null)
    const [resultPhotos, setResultPhotos] = useState <PhotoInfo[] | null> (null) 
    const [resultVideos, setResultVideos] = useState <VideoMessage[] | null> (null)
    let showFiles;

    const changeVideo = (videoSrc: string, messId: string, date: string): VideoMessage[] => {
        if (resultVideos) {
            const newVideos = resultVideos.map(el => {
                if (el.date === date) {
                    const resultVideoMess = el.videoMessages.map(element => {
                        if (element.id === messId) {
                            return {
                                ...element,
                                videoSrc: videoSrc,
                            }
                        } else {
                            return element
                        }
                    })
                    return {
                        date: el.date,
                        videoMessages: resultVideoMess,
                    }
                } else {
                    return el
                }
            })
            return newVideos
        } else {
            return []
        }
    }

    if (typeFile === 'photo') {
        if (resultPhotos !== null) {
            if (resultPhotos.length !== 0) {
                showFiles = <ul>
                    {resultPhotos.map((item, index) => <li key={index}><img src={item.url} width={100} height={100} onClick={() => setBigPhoto(item)}/></li>)}
                </ul>
            } else {
                showFiles = <h2>В этом чате пока нет фото</h2>
            }
        } else {
            showFiles = <h3>Загрузка...</h3>
        }
    } else if (typeFile === 'video') {
        if (resultVideos) {
            if (resultVideos.length !== 0) {
                showFiles = <ul>
                    {resultVideos.map((item, index) => {
                        return <li key={index}>
                            <div>
                                <p>{item.date}</p>
                                {item.videoMessages.map((item, index) => {
                                    if (item.videoSrc === '') {
                                        return <div key={index}>
                                            <img src='/images/Play_groen.png' width={200} height={200} style={{cursor: 'pointer'}} onClick={async() => {
                                                const messId = item.id
                                                const videoLoad = changeVideo('loading', item.id, item.date)
                                                setResultVideos(videoLoad)
                                                const video = await fetch('http://localhost:4000/users-controller/video/mess', {
                                                    method: "POST",
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                    },
                                                    body: JSON.stringify({ trueParamEmail, messId }),
                                                    credentials: 'include',
                                                })
                                                const resultVideo = await video.text()
                                                const newVideos = changeVideo(resultVideo, item.id, item.date)
                                                setResultVideos(newVideos)
                                            }}/>
                                        </div>
                                    } else if (item.videoSrc !== '' && item.videoSrc !== 'loading') {
                                        return <video key={index} src={item.videoSrc} controls={true} width={200} height={200}/>
                                    } else if (item.videoSrc === 'loading') {
                                        return <div key={index} style={{width: 200, height: 200, backgroundColor: 'gray'}}><ClipLoader/></div>
                                    }
                                })}
                            </div>
                        </li>
                    })}
                </ul>
            } else {
                showFiles = <h2>В этом чате пока нет видео</h2>
            }
        } else {
            showFiles = <h3>Загрузка...</h3>
        }
    }

    const getFiles = async () => {
        const getMess = await fetch(`http://localhost:4000/users-controller/get/mess`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ trueParamEmail }),
            credentials: 'include',
        })
        let resultVideoMessages: VideoMessage[] = []
        const resultMess = await getMess.json()
        const videoMess = resultMess.filter((el: Message) => el.typeMess === 'video')
        if (videoMess.length !== 0) {
            const datesArr = videoMess.map((el: Message) => el.date)
            const uniqueDate: string[] = Array.from(new Set(datesArr))
            const resultVideosMess = uniqueDate.map(el => {
                const thisDateVideoMess: VideoMess[] = videoMess.filter((element: Message) => element.date === el).map((element: Message) => {
                    return {
                        ...element,
                        videoSrc: '',
                    }
                })
                return {
                    date: el,
                    videoMessages: thisDateVideoMess,
                }
            })
            resultVideoMessages = resultVideosMess
        }
        let resultPhotos: PhotoInfo[] = []
        for (let item of resultMess) {
            if (item.photos.length !== 0) {
                for (let el of item.photos) {
                    resultPhotos = [...resultPhotos, {url: el, user: item.user, date: item.date}]
                }
            }
        }
        setResultPhotos(resultPhotos)
        setResultVideos(resultVideoMessages.reverse())
    }

    useEffect(() => {
        if (trueEmail !== '' && trueParamEmail !== '') {
            getFiles()
        }
    }, [trueEmail, trueParamEmail])

    return (
        <div>
            <p onClick={() => setTypeFile('photo')}>Фото</p>
            <p onClick={() => setTypeFile('video')}>Видео</p>
            {showFiles}
            {bigPhoto !== null ? <div>
                <Call/>
                <p onClick={() => setBigPhoto(null)}>X</p>
                <img src={bigPhoto.url} width={300} height={300}/>
                <h3>{bigPhoto.user}</h3>
                <h4>{bigPhoto.date}</h4>
            </div> : null}
        </div>
    )
}

export default Files