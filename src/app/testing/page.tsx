'use client'

import { ChangeEvent, FC, useEffect, useRef, useState } from "react"
import Peer, { DataConnection, MediaConnection, PeerConnectOption } from 'peerjs';
import JSZip from "jszip";
const Testing: FC = () => {

    const [file, setFile] = useState <File | null> (null)
    const [resultFiles, setResultFiles] = useState <Blob[]> ([])
    const [videos, setVideos] = useState <string[]> ([])

    useEffect(() => {
        const getFile = async () => {
            const savedFiles = await fetch('http://localhost:4000/testing-users/file')
            const resultSavedFile = await savedFiles.blob()
            const zip = new JSZip();
            const loadedZip = await zip.loadAsync(resultSavedFile);
            let finalFiles: Blob[] = []
            let finalVideos: string[] = []
            for (const [filename, file] of Object.entries(loadedZip.files)) {
                if (!file.dir) {
                    const blob = await file.async('blob');
                    finalFiles = [...finalFiles, blob]
                    const videoUrl = URL.createObjectURL(blob)
                    finalVideos = [...finalVideos, videoUrl]
                }
            }
            setResultFiles(finalFiles)
            setVideos(finalVideos)
        }
    getFile()
}, [])


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
                    const saveFile = await fetch('http://localhost:4000/testing-users/save/file', {
                        method: "POST",
                        body: formData,
                    })
                    const resultSaveFile = await saveFile.blob()
                    setResultFiles([...resultFiles, resultSaveFile])
                    alert('Файл успешно сохранен')
                }
            }}>Сохранить</button>

            {resultFiles.length !== 0 ? <ul>
                {resultFiles.map((item, index) => <li key={index} onClick={() => {
                    const url = URL.createObjectURL(item)
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'file';
                    link.click();
                    URL.revokeObjectURL(url);
                }}>Файл</li>)}
            </ul> : null}
            {videos.length !== 0 ? <ul>
                {videos.map((item, index) => <li key={index}><video src={item} style={{width: 200, height: 200}} controls={true}/></li>)}
            </ul> : null}
        </div>
    )
}

export default Testing

