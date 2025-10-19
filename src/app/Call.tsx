'use client'

import { FC, useState, useRef, useEffect } from "react"
import Peer, { type Peer as PeerType } from 'peerjs'

const Call: FC = () => {

    const [peerId, setPeerId] = useState <string> ('')
    const peer = useRef <Peer | null> (null)
    const [incomeCall, setIncomeCall] = useState <{name: string, peerId: string} | null> (null)
    let mainShow;

    if (incomeCall) {
        mainShow = <div>
            <h3>Звонок от {incomeCall.name}</h3>
            <button onClick={() => (window).open(`/call-active/${incomeCall.peerId}`, '_blank')}>Принять</button>
            <button>Отклонить</button>
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

        peerInstance.on('connection', (connection) => {
            connection.on('data', (data: any) => {
                if (data.type === 'call_perm') {
                    console.log('Запрос на звонок')
                    setIncomeCall({name: data.message.name, peerId: data.message.peerId})
                }
            })
        })

    }, [])

    useEffect(() => {
        if (peerId !== '') {
            const addPeer = async () => {
                await fetch('http://localhost:4000/users-controller/add/peer', {
                    method: "PATCH",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ peerId }),
                    credentials: 'include',
                })
            }
            addPeer()
        }
    }, [peerId])

    return (
        <div>
            {mainShow}
        </div>
    )
}

export default Call