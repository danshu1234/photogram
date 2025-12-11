'use client'

import { ChangeEvent, FC, useEffect, useRef, useState } from "react"
import Peer, { DataConnection, MediaConnection, PeerConnectOption } from 'peerjs';
import JSZip from "jszip";
import { Element, Link } from "react-scroll";


const Testing: FC = () => {

    const giphyKey: string = 'UXKa5L7bKIjiqGWzEhkkGjG3W3CMrK1B'

    const [randomGif, setRandomGif] = useState <string> ('')
    const [userInput, setUserInput] = useState <string> ('')
    const [keywordsFifs, setKeywordsGifs] = useState <string[]> ([])

    useEffect(() => {
        if (userInput === '') {
            setKeywordsGifs([])
        }
    }, [userInput])

    return (
        <div>
            <button onClick={async() => {
                const gifs = await fetch(`https://api.giphy.com/v1/gifs/trending?api_key=${giphyKey}&limit=10&rating=g`)
                const resultGifs = await gifs.json()
                const resultGif = resultGifs.data[0].images.original.url
                setRandomGif(resultGif)
            }}>Get GIF</button>
            {randomGif !== '' ? <img src={randomGif} width={200} height={200}/> : null}<br/>
            <input placeholder="GIF" onChange={((e: ChangeEvent<HTMLInputElement>) => setUserInput(e.target.value))}/>
            <button onClick={async() => {
                if (userInput !== '') {
                    console.log(userInput)
                    const gifs = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${giphyKey}&q=${encodeURIComponent(userInput)}&limit=${20}&offset=${0}&rating=g`)
                    const resultGifs = await gifs.json()
                    const finalGifs = resultGifs.data.map((el: any) => el.images.original.url)
                    setKeywordsGifs(finalGifs)
                }
            }}>Search</button>
            {keywordsFifs.length !== 0 ? <ul>
                {keywordsFifs.map((item, index) => <li key={index}><img src={item} width={100} height={100}/></li>)}
            </ul> : null}
        </div>
    )
}

export default Testing

