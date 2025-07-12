'use client'

import { FC } from "react"

interface StickerProps{
    setCommentInput: Function,
}

const Stickers: FC <StickerProps> = (props) => {

    const stickers: string[] = ['/smiles/d8360921a1e6bb4b0a756338aac17019.jpg', '/smiles/915cdd65844283f1332800b5ca2a8582.jpg', '/smiles/png-clipart-human-skin-color-emoji-thumb-signal-fitzpatrick-scale-emoji-hand-orange.png']

    return (
        <div>
            <div style={{width: 300, height: 100, backgroundColor: 'white'}}>
                <div>
                    {stickers.map((item, index) => <img src={item} key={index} style={{width: 40, height: 40, cursor: 'pointer'}} onClick={() => props.setCommentInput(item)}/>)}
                </div>
            </div>
        </div>
    )
}

export default Stickers