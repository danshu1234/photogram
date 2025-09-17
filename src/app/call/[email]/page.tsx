'use client'

import useGetEmail from "@/app/useGetEmail"
import useGetTrueParamEmail from "@/app/useGetTrueParamEmail"
import { useParams } from "next/navigation"
import Peer, { type Peer as PeerType } from 'peerjs'
import { FC, useState, useEffect, useRef } from "react"

const CallPage: FC = () => {

    const { trueParamEmail } = useGetTrueParamEmail()
    const { email, setEmail } = useGetEmail()

    const params = useParams()

    const [peerId, setPeerId] = useState <string> ('')
    const [friendPeer, setFriendPeer] = useState <string> ('')
    const [callStatus, setCallStatus] = useState <string> ('')
    const peer = useRef <Peer | null> (null)
    const remoteAudioRef = useRef <HTMLAudioElement | null> (null)

    let mainShow;

    if (callStatus === 'call') {
        mainShow = <h2>Звонок...</h2>
    } else if (callStatus === 'active') {
        mainShow = <div>
            <h2>Активный звонок</h2>
        </div>
    }

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
            setPeerId(id);    
        });

        peerInstance.on('call', async(call) => {
            const email = localStorage.getItem('photogram-enter')
            const paramEmail = params.email
            let trueParamEmail = ''
            if (paramEmail) {
                const paramArr = Array.from(paramEmail)
                const newParamArr = paramArr.map(el => {
                    if (el !== '4' && el !== '0') {
                        return el
                    }
                })
                const resultParamArr = newParamArr.map(el => {
                    if (el !== '%') {
                        return el
                    } else {
                        return '@'
                    }
                })
                trueParamEmail = resultParamArr.join('')
            }
            const dataForCall = await fetch('http://localhost:4000/users-controller/data/call', {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${email}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ trueParamEmail })
            }) 
            const resultDataForCall = await dataForCall.json()
            if (call.peer === resultDataForCall.friendPeer) {
                console.log('Звонок')
                call.on('stream', (remoteAudio) => {
                    if (remoteAudioRef.current) {
                        remoteAudioRef.current.srcObject=remoteAudio
                    }
                })
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                call.answer(stream)
                setCallStatus('active')
            }
        })
    }, [])

    useEffect(() => {
        if (email !== '' && peerId !== '') {
            const addPeer = async () => {
                const peerId = ''
                await fetch('http://localhost:4000/users-controller/add/peer', {
                    method: "PATCH",
                    headers: {
                        'Authorization': `Bearer ${email}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ peerId })
                })
            }
            addPeer()
        }
    }, [email, peerId])

    useEffect(() => {
        if (email !== '' && trueParamEmail !== '' && peerId !== '') {
            const getDataForCall = async () => {
                const dataForCall = await fetch('http://localhost:4000/users-controller/data/call', {
                    method: "POST",
                    headers: {
                        'Authorization': `Bearer ${email}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ trueParamEmail })
                })
                const resultDataForCall = await dataForCall.json()
                setFriendPeer(resultDataForCall.friendPeer)
                setCallStatus('call')
                const signalConnection = peer.current?.connect(resultDataForCall.friendPeer)
                    if (signalConnection) {
                        console.log('Connection open status:', signalConnection.open)
                        signalConnection.on('open', () => {
                            console.log('Here')
                            console.log(`Name: ${resultDataForCall.name}`)
                            console.log(`Peer: ${resultDataForCall.friendPeer}`)
                            signalConnection.send({
                                type: 'call_perm',
                                message: {name: resultDataForCall.name, peerId: peerId},
                            })
                        })
                        
                    }
                }
            getDataForCall()
        }
    }, [email, trueParamEmail, peerId])

    return (
        <div>
            <audio ref={remoteAudioRef}/>
            {mainShow}
        </div>
    )
}

export default CallPage