'use client'

import { ChangeEvent, FC, useEffect, useRef, useState } from "react"
import Peer, { DataConnection, MediaConnection, PeerConnectOption } from 'peerjs';

const Testing: FC = () => {

    interface Message{
        name: string;
        message: string;
    }

    const [show, setShow] = useState <{showState: string, peerId: string}> ({showState: '', peerId: ''})
    const [peerId, setPeerId] = useState <string> ('')
    const peer = useRef <Peer | null> (null)
    const remoteAudioRef = useRef <HTMLAudioElement | null> (null)
    const [watchArr, setWatchArr] = useState <string[]> ([])
    const [inputPeerId, setInputPeerId] = useState <string> ('')
    const [messages, setMessages] = useState <Message[]> ([])
    const [inputMess, setInputMess] = useState <string> ('')
    const [name, setName] = useState <string> ('')
    const [inputName, setInputName] = useState <string> ('')
    let mainShow;
    let messShow;

    if ((show.showState === 'watch' && show.peerId !== '') || show.showState === 'stream') {
        messShow = <div>
            <h3>Чат</h3>
            {messages.length !== 0 ? <ul style={{listStyle: 'none'}}>
                {messages.map((item, index) => {
                    return <li key={index}>{`${item.name}: ${item.message}`}</li>
                })}
            </ul> : null}
            <input placeholder="Сообщение" value={inputMess} onChange={(event: ChangeEvent<HTMLInputElement>) => setInputMess(event.target.value)}/>
            <button onClick={() => {
                if (peerId !== show.peerId) {
                    if (inputMess !== '') {
                        const signalConnection = peer.current?.connect(show.peerId)
                        if (signalConnection) {
                            signalConnection.on('open', () => {
                                signalConnection.send({
                                    type: 'new_mess',
                                    message: {name: name, message: inputMess},
                                })
                            })
                            setInputMess('')
                        }
                    }
                } else {
                    for (let item of watchArr) {
                        const signalConnection = peer.current?.connect(item)
                        if (signalConnection) {
                            signalConnection.on('open', () => {
                                signalConnection.send({
                                    type: 'new_message',
                                    message: {name: name, message: inputMess},
                                })
                            })
                        }
                    }
                    setMessages([...messages, {name: name, message: inputMess}])
                    setInputMess('')
                }
            }}>Отправить</button>
        </div>
    }

    if (show.showState === '') {
        mainShow = <div>
            <button onClick={() => {
                setShow({showState: 'stream', peerId: peerId})
            }}>Начать трансляцию</button>
            <button onClick={() => setShow({showState: 'watch', peerId: ''})}>Подключиться к трансляции</button>
            <button onClick={() => {
                localStorage.removeItem('name')
                window.location.reload()
            }}>Поменять имя</button>
        </div>
    } else {
        if (show.showState === 'stream' && show.peerId !== '') {
            mainShow = <div>
                <h3>Ссылка для подключения: {show.peerId}</h3>
                <button onClick={async() => {
                    await navigator.clipboard.writeText(show.peerId)
                }}>Скопировать</button>
                <p>Вас слушают {watchArr.length} человек</p>
            </div>
        } else if (show.showState === 'watch' && show.peerId === '') {
            mainShow = <div>
                <input placeholder="Ссылка для подключения" onChange={(event: ChangeEvent<HTMLInputElement>) => setInputPeerId(event.target.value)}/>
                <button onClick={() => {
                    if (inputPeerId !== '') {
                        setShow({showState: 'watch', peerId: inputPeerId})
                    }
                }}>Подключиться</button>
            </div>
        } 
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
            console.log(call.peer)
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            call.answer(stream)
            setWatchArr(prev => {
                return [...prev, call.peer]
            })
        })
        
        peerInstance.on('connection', (connection) => {
            connection.on('data', (data: any) => {
                if (data.type === 'finish_connect') {
                    setWatchArr(prev => {
                        return prev.filter(el => el !== connection.peer)
                    })
                } else if (data.type === 'new_mess') {
                    setWatchArr(prev => {
                        for (let item of prev) {
                            const signalConnection = peer.current?.connect(item)
                            if (signalConnection) {
                                signalConnection.on('open', () => {
                                    signalConnection.send({
                                        type: 'new_message',
                                        message: data.message,
                                    })
                                })
                            }
                        }
                        return prev
                    })
                    setMessages(prev => [...prev, data.message])
                } else if (data.type === 'new_message') {
                    setMessages(prev => [...prev, data.message])
                } else if (data.type === 'stream_end') {
                    alert('Трансляция завершена')
                    window.location.reload()
                }
            })
        })
    }, [])

    useEffect(() => {
        const name = localStorage.getItem('name')
        if (name) {
            setName(name)
        }
    }, [])

    useEffect(() => {
        if (show.showState === 'watch' && show.peerId !== '') {
            const startWatch = async () => {
                const localStream = await navigator.mediaDevices.getUserMedia({ audio: true })
                const call = peer.current?.call(show.peerId, localStream)
                if (call) {
                    call.on('stream', (remoteAudio) => {
                        console.log('Answer is here')
                        if (remoteAudioRef.current) {
                            remoteAudioRef.current.srcObject = remoteAudio
                        }
                    })
                }
            }
            startWatch()
        }
    }, [show])

    return (
        <div>
            {name !== '' ? <div>
                {mainShow}
                <audio style={{display: 'none'}} ref={remoteAudioRef} autoPlay={true} controls/>
                {messShow}
                {(show.showState === 'watch' && show.peerId !== '') ? <button onClick={() => {
                    if (remoteAudioRef.current) {
                        remoteAudioRef.current.srcObject = null
                    }
                    const signalConnection = peer.current?.connect(show.peerId)
                    if (signalConnection) {
                        signalConnection.on('open', () => {
                            signalConnection.send({
                                type: 'finish_connect',
                                message: 'finish connect',
                            })
                        })
                        setShow({showState: '', peerId: ''})
                    }
                }}>Отключиться</button> : null}
                {show.showState === 'stream' ? <button onClick={() => {
                    for (let item of watchArr) {
                        const signalConnection = peer.current?.connect(item)
                        if (signalConnection) {
                            signalConnection.on('open', () => {
                                signalConnection.send({
                                    type: 'stream_end',
                                    message: 'stream end',
                                })
                            })
                        }
                    }
                    window.location.reload()
                }}>Завершить трансляцию</button> : null}
                </div> : <div>
                    <h2>Как Вас зовут?</h2>
                    <input placeholder="Имя" onChange={(event: ChangeEvent<HTMLInputElement>) => setInputName(event.target.value)}/>
                    <button onClick={() => {
                        if (inputName !== '') {
                            setName(inputName)
                            localStorage.setItem('name', inputName)
                        }
                    }}>Войти</button>
                </div>}
        </div>
    )
}

export default Testing