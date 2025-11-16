'use client'

import { FC, useEffect, useState, memo } from "react"
import { ClipLoader } from "react-spinners";
import Download from "./Download";

interface VideoProps{
    videoMessId: string;
    trueParamEmail: string;
    setVideoMessId: Function;
}

const Video: FC <VideoProps> = (props) => {

    const [resultVideo, setResultVideo] = useState <string | null> (null)

    useEffect(() => {
        const getVideo = async () => {
            setResultVideo(null)
            const videoMessId = props.videoMessId
            const trueParamEmail = props.trueParamEmail
            const video = await fetch('http://localhost:4000/users-controller/video', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ videoMessId, trueParamEmail }),
                credentials: 'include',
            })
            const resultVideoSrc = await video.text()
            setResultVideo(resultVideoSrc)
        }
        getVideo()
    }, [])

    return (
        <div>
            <p onClick={() => props.setVideoMessId(null)}>X</p>
            {resultVideo === null ? <div>
                <ClipLoader/>
            </div> : <div>
                <video src={resultVideo} controls={true} width={300} height={300}/>
                <Download downloadFile={resultVideo}/>
            </div>}
        </div>
    )
}

export default Video