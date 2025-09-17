'use client'

import { useParams } from "next/navigation";
import Peer from "peerjs";
import { FC, useEffect, useRef } from "react";

const ActiveCall: FC = () => {

    const params = useParams()

    const peer = useRef <Peer | null> (null)
    const remoteAudioRef = useRef <HTMLAudioElement | null> (null)

    useEffect(() => {

        const peerInstance = new Peer({
            host: 'localhost',
            port: 3001,
            path: '/peerjs',
            config: {
              iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
              ]
            }
        });

        peer.current = peerInstance

        peerInstance.on('open', async(id) => {
            const email = localStorage.getItem('photogram-enter')
            const peerId = id
            await fetch('http://localhost:4000/users-controller/add/peer', {
                method: "PATCH",
                headers: {
                    'Authorization': `Bearer ${email}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ peerId })
            })
        })

        const initCall = async () => {
            const resultPeerId = params.peerId as string
            const localStream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const call = peerInstance.call(resultPeerId, localStream)
            if (call) {
                call.on('stream', (remoteAudio) => {
                    if (remoteAudioRef.current) {
                        remoteAudioRef.current.srcObject = remoteAudio
                    }
                })
            }
        }   
        initCall()

    }, [])

    return (
        <div>
            <audio ref={remoteAudioRef} autoPlay={true}/>
            <div>
                <h2>Активный звонок</h2>
            </div>
        </div>
    )
}

export default ActiveCall