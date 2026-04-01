'use client'

import { ChangeEvent, FC, useEffect, useRef, useState } from "react"
import Peer, { DataConnection, MediaConnection, PeerConnectOption } from 'peerjs';
import JSZip from "jszip";
import { Element, Link } from "react-scroll";
import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64 } from 'tweetnacl-util';
import { QRCodeSVG } from "qrcode.react";
import { Wheel } from 'react-custom-roulette';

const wheelColors = [
  '#f00', 
  '#ff7f00', 
  '#ff0', 
  '#0f0', 
  '#00f', 
  '#4b0082', 
  '#8b00ff', 
  '#ff69b4' 
];

const Testing: FC = () => {

    const [mustSpin, setMustSpin] = useState(false);
    const [data, setData] = useState<{option: string, style: {backgroundColor: string}}[]> ([])
    const [input, setInput] = useState <string> ('')

    useEffect(() => {
        const wordsArr = input.split(' ')
        const resultOptions = wordsArr.map((item, index) => {
            if (item !== '') {
                return {option: item, style: {backgroundColor: wheelColors[index]}}
            } else {
                return false
            }
        }).filter(el => el !== false)
        setData(resultOptions)
    }, [input])

    return (
        <div>
            {data.length !== 0 ? <div><Wheel mustStartSpinning={mustSpin} prizeNumber={Math.floor(Math.random() * data.length)} data={data} onStopSpinning={() => {
                setMustSpin(false)
            }}/>
            <button onClick={() => setMustSpin(true)}>Go</button></div> : <Wheel mustStartSpinning={mustSpin} prizeNumber={Math.floor(Math.random() * data.length)} data={[{option: '', style: {backgroundColor: 'green'}}]} onStopSpinning={() => {
                setMustSpin(false)
            }}/>}
            <input placeholder="Варианты через пробел" onChange={((event: ChangeEvent<HTMLInputElement>) => setInput(event.target.value))}/>
        </div>
    )
}

export default Testing

