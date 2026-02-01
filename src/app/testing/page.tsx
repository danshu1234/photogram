'use client'

import { ChangeEvent, FC, useEffect, useRef, useState } from "react"
import Peer, { DataConnection, MediaConnection, PeerConnectOption } from 'peerjs';
import JSZip from "jszip";
import { Element, Link } from "react-scroll";
import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64 } from 'tweetnacl-util';
import { QRCodeSVG } from "qrcode.react";


const Testing: FC = () => {

    const [inputMess, setInputMess] = useState <string> ('')
    const [privateKey, setPrivateKey] = useState <string> ('')

    useEffect(() => {
        const resultPrivateKey = localStorage.getItem('privateKey')
        if (resultPrivateKey) {
            setPrivateKey(resultPrivateKey)
        }
    }, [])

    useEffect(() => {
        const keyPair = nacl.box.keyPair()
        console.log(Buffer.from(keyPair.secretKey).toString('base64'))
        console.log(Buffer.from(keyPair.publicKey).toString('base64'))
    }, [])

    return (
        <div>
            <input placeholder="Message" value={inputMess} onChange={((event: ChangeEvent<HTMLInputElement>) => setInputMess(event.target.value))}/>
            <button onClick={async() => {
                if (inputMess !== '') {
                    const publicKey = await fetch('http://localhost:4000/testing-users/public/key')
                    const resultPublicKey = await publicKey.json()
                    const privateKey = localStorage.getItem('privateKey')
                    if (privateKey) {
                        const resultPrivateKey = decodeBase64(privateKey)
                        const encoder = new TextEncoder()
                        const messageBytes = encoder.encode(inputMess)
                        const resultMess = resultPublicKey.map((el: string) => {
                            const nonce = nacl.randomBytes(nacl.box.nonceLength)
                            const recipientPublicKey = decodeBase64(el)
                            const resultEncryptedMessage = encodeBase64(nacl.box(messageBytes, nonce, recipientPublicKey, resultPrivateKey))
                            const nonceBase64 = encodeBase64(nonce)
                            return {
                                message: resultEncryptedMessage,
                                nonce: nonceBase64,
                            }
                        })
                        await fetch('http://localhost:4000/testing-users/new/mess', {
                            method: "PATCH",
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ resultMess })
                        })
                        setInputMess('')
                    }
                }
            }}>Send a message</button>
            <button onClick={async() => {
                const allMessages = await fetch('http://localhost:4000/testing-users/all/mess')
                const resultAllMessages = await allMessages.json()
                const userPublicKey: string = 'GWtlKst4fl6KZfPveN7OI2Her7pgqh1273JQgf6YggY='
                const resultUserPublicKey = decodeBase64(userPublicKey)
                const privateKey = localStorage.getItem('privateKey')
                if (privateKey) {
                    const resultPrivateKey = decodeBase64(privateKey)
                    const resultMessages = resultAllMessages.map((el: any) => {
                        const resultMess = el.map((el: {message: string, nonce: string}) => {
                            const resultEncryptedMessage = decodeBase64(el.message)
                            const resultNonce = decodeBase64(el.nonce)
                            const decryptedBytes = nacl.box.open(resultEncryptedMessage, resultNonce, resultUserPublicKey, resultPrivateKey)
                            const decoder = new TextDecoder()
                            if (decryptedBytes) {
                               const resultMessage = decoder.decode(decryptedBytes)
                               return resultMessage
                            }
                        })
                        return resultMess.filter((el: any) => el !== undefined)[0]
                    })
                    console.log(resultMessages)
                }
            }}>Get messages</button>
            <h2>QR Code</h2>
            <QRCodeSVG value={privateKey} size={256}/>
        </div>
    )
}

export default Testing

