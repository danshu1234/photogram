'use client'

import { ChangeEvent, FC, useState } from "react"
import Photo from "./PhotoInterface";

interface PropsSearchPhoto{
    photos: Photo[] | null,
    setPhotos: Function,
    allPhotos: Photo[] | null,
}

const SearchPhoto: FC <PropsSearchPhoto> = (props) => {

    const [input, setInput] = useState <string> ('')

    return (
        <div>
            <input placeholder="Найти фото по описанию" onChange={(event: ChangeEvent<HTMLInputElement>) => setInput(event.target.value)}/>
            <button onClick={() => {
                if (props.photos !== null) {
                    if (input !== '') {
                        const sortedArr = props.photos.filter((el: Photo) => el.descript.includes(input))
                        props.setPhotos(sortedArr)
                    } else {
                        props.setPhotos(props.allPhotos)
                    }                   
                }
            }}>Поиск</button>
        </div>
    )
}

export default SearchPhoto