'use client'

import { FC } from "react"
import { Link } from "react-scroll";

interface PinListProps{
    pinMess: string[];
}

const PinList: FC <PinListProps> = (props) => {
    return (
        <div>
            <ul>
                {props.pinMess.map((item, index) => <li key={index}><Link to={item} smooth={true} duration={500}>Сообщение №{index+1}</Link></li>)}
            </ul>
        </div>
    )
}

export default PinList