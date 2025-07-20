'use client'

import { FC, useEffect, useState, memo } from "react"

interface PhotoSaveProps{
    savePhotos: string[],
    setSavePhotos: Function,
}

interface PhotoSave{
    id: number,
    url: string,
    saveStatus: boolean,
}

const PhotoSave: FC <PhotoSaveProps> = (props) => {

    const [resultPhotos, setResultPhotos] = useState <PhotoSave[]> ([])
    let photosResult;

    if (resultPhotos.length !== 0) {
        photosResult = <div>
            <ul>
                {resultPhotos.map((item, index) => <li key={index}>
                    <div>
                        <img src={item.url} width={100} height={100}/>
                        <input type="checkbox" onChange={() => {
                            const newArr = resultPhotos.map(el => {
                                if (el.id === item.id) {
                                    return {
                                        url: el.url,
                                        id: el.id,
                                        saveStatus: !el.saveStatus,
                                    }
                                } else {
                                    return el
                                }
                            })
                            setResultPhotos(newArr)
                        }}/>
                    </div>
                </li>)}
            </ul>
        </div>
    }

    useEffect(() => {
        const urlWithSaveStatus = props.savePhotos.map((el, index) => {
            return {
                id: index + 1,
                url: el,
                saveStatus: false
            }
        })
        setResultPhotos(urlWithSaveStatus)
    }, [])

    return (
        <div>
            {photosResult}
            {resultPhotos.find(el => el.saveStatus === true) !== undefined ? <button onClick={() => {
                for (let item of resultPhotos) {
                    if (item.saveStatus === true) {
                        fetch(item.url)
                        .then(response => response.blob())
                        .then(blob => {
                        const blobUrl = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = blobUrl;
                        a.download ='image.jpg'; 
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(blobUrl); 
                        })
                        .catch(err => console.error('Ошибка загрузки:', err));
                    } 
                }
                props.setSavePhotos([])
            }}>Сохранить выбранные фото</button> : <button>Сохранить выбранные фото</button>}
        </div>
    )
}

export default memo(PhotoSave)