'use client'

import { ChangeEvent, FC, useEffect, useRef, useState } from "react"
import Peer, { DataConnection, MediaConnection, PeerConnectOption } from 'peerjs';
import JSZip from "jszip";
import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64 } from 'tweetnacl-util';
import { QRCodeSVG } from "qrcode.react";
import { Wheel } from 'react-custom-roulette';
import useCounterStore from './useCounterStore'
import Link from 'next/link';

const Testing: FC = () => {


    return (
        <div>
            <p>Count: {useCounterStore((store) => store.count)}</p>
            <p onClick={useCounterStore((store) => store.increment)}>+</p>
            <Link href="/enter">Enter page</Link>
        </div>
    )
}

export default Testing

