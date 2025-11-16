'use client'

import { ChangeEvent, FC, useEffect, useRef, useState } from "react"
import Peer, { DataConnection, MediaConnection, PeerConnectOption } from 'peerjs';
import JSZip from "jszip";
const Testing: FC = () => {

    const [file, setFile] = useState <File | null> (null)
    const [video, setVideo] = useState <string> ('')
    const [inputSrc, setInputSrc] = useState <string> ('')

    return (
        <div>
            <input type="file" onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                const resultFile = event.target.files?.[0]
                if (resultFile) {
                    setFile(resultFile)
                }
            }}/>
            <button onClick={async() => {
                if (file) {
                    const formData = new FormData()
                    formData.append('file', file)
                    await fetch('http://localhost:4000/testing-users/save/big/file', {
                        method: "POST",
                        body: formData,
                    })
                }
            }}>Save</button><br/>
            <input placeholder="id" onChange={((event: ChangeEvent<HTMLInputElement>) => setInputSrc(event.target.value))}/>
            <button onClick={async() => {
                if (inputSrc !== '') {
                    const file = await fetch(`http://localhost:4000/testing-users/get/big/file/${inputSrc}`)
                    const resultFile = await file.blob()
                    const resultVideo = URL.createObjectURL(resultFile)
                    setVideo(resultVideo)
                }
            }}>Search</button>
            {video !== '' ? <video src={video} controls={true} width={200} height={200}/> : null}
        </div>
    )
}

export default Testing

