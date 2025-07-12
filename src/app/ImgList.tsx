'use client'

import { FC } from "react"

interface ImgListProps{
    imgArr: string[];
    startIndex: number;
    setStartIndex: Function;
}

const ImgList: FC <ImgListProps> = (props) => {
    return (
        <div>
            <img src={props.imgArr[props.startIndex]} width={300} height={250}/>
            {props.startIndex !== 0 ? <button onClick={() => props.setStartIndex(props.startIndex - 1)}>Назад</button> : null}
            {props.startIndex !== (props.imgArr.length - 1) ? <button onClick={() => props.setStartIndex(props.startIndex + 1)}>Дальше</button> : null}
            <p>{props.startIndex + 1}/{props.imgArr.length}</p>
        </div>
    )
}

export default ImgList