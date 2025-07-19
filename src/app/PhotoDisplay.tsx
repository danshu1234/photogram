import { FC, useEffect } from "react";
import Photo from "./PhotoInterface";
import styles from './PhotoDisplay.module.css';
import getUserEmail from "./getUserEmail";
import { usePathname } from 'next/navigation';  

interface PropsPhotoDisplay{
    url: string[],
    countLikes: number,
    likeUrl: string,
    id: string,
    email: string,
    photos: Photo[],
    setPhotos: Function,
    userEmail: string,
    descript: string,
    commentsCount: number,
    date: string,
    trueEmail: string,
    photoIndex: number,
    bonuce: boolean,
    pin: boolean,
    setSavePhotos: Function | undefined,
    setSharePost: Function | undefined,
}

const PhotoDisplay: FC <PropsPhotoDisplay> = (props) => {

    const params = usePathname()

    const nextPhoto = () => {
        const newArr = props.photos.map(el => {
        if (el.id === props.id) {
            return {
                ...el,
                photoIndex: el.photoIndex + 1
            }
            } else {
                return el
            }
        })
        props.setPhotos(newArr)
    }

    const prevPhoto = () => {
        const newArr = props.photos.map(el => {
        if (el.id === props.id) {
            return {
                ...el,
                photoIndex: el.photoIndex - 1
            }
            } else {
                return el
            }
        })
        props.setPhotos(newArr)
    }

    const goToBigPhoto = () => {
        localStorage.setItem('photoIndex', JSON.stringify(props.photoIndex))
        window.location.href=`bigphoto/${props.id}`
    }

    const pinUnpinPhoto = async (type: boolean) => {
        const id = props.id
        await fetch('http://localhost:4000/photos/pin/photo', {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id, type })
        })
        window.location.reload()
    }

    const likeUnlikePhoto = async () => {
        const id = props.id
                const email = props.trueEmail
                const userEmail = props.userEmail
                const photoId = props.id
                const type = 'photo'
                if (props.likeUrl === 'https://avatars.mds.yandex.net/i?id=e3e0e2429c17d22c59253ed4a53292cdb278ffc5-4283205-images-thumbs&n=13') {
                    await fetch('http://localhost:4000/photos/like/this/photo', {
                        method: "PATCH",
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ id, email })
                    })
                    const resultEmail = await getUserEmail()
                    await fetch('http://localhost:4000/users-controller/new/notif', {
                        method: "PATCH",
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ resultEmail, userEmail, photoId, type })
                    })
                    const newArr = props.photos.map(el => {
                        if (el.id !== props.id) {
                            return el
                        } else {
                            return {
                                ...el,
                                likes: [...el.likes, email],
                            }
                        }
                    })
                    props.setPhotos(newArr)
                } else {
                    await fetch('http://localhost:4000/photos/unlike/photo', {
                        method: "PATCH",
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ id, email })
                    })
                    const findPhoto = props.photos.find((el: Photo) => el.id === props.id)
                    const prevLikes = findPhoto?.likes
                    console.log(prevLikes)
                    const filteredLikes = prevLikes?.filter((el: string) => el !== props.trueEmail)
                    const newArr = props.photos.map(el => {
                        if (el.id !== props.id) {
                            return el
                        } else {
                            return {
                                ...el,
                                likes: filteredLikes,
                            }
                        }
                    })
                    console.log(newArr)
                    props.setPhotos(newArr)
                }
    }

    let showPhoto;
    let pinBtn;
    let deleteBtn;

    if (params === '/myacc') {
        deleteBtn = <button onClick={async() => {
            const photoId = props.id
            await fetch(`http://localhost:4000/photos/delete/photo/${photoId}`, {method: "DELETE"})
            const resultPhotos = props.photos.filter(el => el.id !== photoId)
            props.setPhotos(resultPhotos)
        }}>Удалить</button>
    }

    if (params === '/myacc') {
        if (props.pin === false) {
            pinBtn = <button onClick={() => pinUnpinPhoto(true)}>Закрепить</button>
        } else {
            pinBtn = <button onClick={() => pinUnpinPhoto(false)}>Открепить</button>
        }
    }

    if (props.url.length === 1) {
        showPhoto = <div>
                <img src={props.url[props.photoIndex]} style={{width: 150, height: 100, borderRadius: 4, objectFit: 'cover', cursor: 'pointer'}} onClick={goToBigPhoto}/>
            </div>
    } else {
        if (props.photoIndex === 0) {
            showPhoto = <div>
                    <img src={props.url[props.photoIndex]} style={{width: 150, height: 100, borderRadius: 4, objectFit: 'cover', cursor: 'pointer'}} onClick={goToBigPhoto}/>
                    <button onClick={nextPhoto}>Дальше</button>
            </div>
        } else if (props.photoIndex === props.url.length - 1) {
            showPhoto = <div>
                    <img src={props.url[props.photoIndex]} style={{width: 150, height: 100, borderRadius: 4, objectFit: 'cover', cursor: 'pointer'}} onClick={goToBigPhoto}/>
                    <button onClick={prevPhoto}>Назад</button>
            </div>
        } else if (props.photoIndex !== 0 && props.photoIndex !== props.url.length - 1) {
            showPhoto = <div>
                    <img src={props.url[props.photoIndex]} style={{width: 150, height: 100, borderRadius: 4, objectFit: 'cover', cursor: 'pointer'}} onClick={goToBigPhoto}/>
                    <button onClick={nextPhoto}>Дальше</button>
                    <button onClick={prevPhoto}>Назад</button>
            </div>
        }
    }

    return (
        <div className={styles.photoContainer}>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {props.descript && ( 
                <div style={{ display: 'flex', flexWrap: 'wrap', overflow: 'hidden' }} onClick={() => window.location.href=`/showpost/${props.id}`}>
                    {props.descript.split(' ').map((item, index) => {
                        const arrFromWord = item.split('')
                        if (arrFromWord[0] === '#') {
                            return <span key={index} style={{marginLeft: 5, color: 'blue', cursor: 'pointer'}} onClick={() => {
                                let onlyClickTegPhotos = []
                                for (let el of props.photos) {
                                    const giveDescript = el.descript?.split(' ') || []; 
                                    if (giveDescript.includes(item)) {
                                        onlyClickTegPhotos.push(el)
                                    }
                                }
                                props.setPhotos(onlyClickTegPhotos)
                            }}>{item}</span>
                        } else {
                            return <span key={index} style={{marginLeft: 5}}>{item}</span>
                        }
                    })}
                </div>
            )}
            </div>
            <p>{props.date}</p>
            {showPhoto}
            <div className={styles.likeSection}>
                <img 
                    src={props.likeUrl} 
                    className={styles.likeButton}
                    onClick={() => {
                        if (window.location.pathname === '/') {
                            likeUnlikePhoto()
                        } else {
                            if (localStorage.getItem('photogram-enter')) {
                                likeUnlikePhoto()
                            } else {
                                window.location.href='/enter'
                            }
                        }
                    }}
                />
                <span className={styles.likesCount}>{props.countLikes} likes</span>
                <img src='https://sun1-96.userapi.com/s/v1/ig2/o5F__9P9IORxLs2a_wFMBkeaZu1nsQSJqPzhQrbrITIHOi8HMJH0803aSSQ9TsjrjPbRYP_eiqKRf3f1s3lLSGn9.jpg?quality=96&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640,720x720,980x980&from=bu&u=xwUZd4QfmsbZj4d5NFu0DGHUFn5F7CorDidsYKL6VsM&cs=980x980' style={{width: 30, height: 30, cursor: 'pointer'}} onClick={() => {
                    if (localStorage.getItem('photogram-enter')) {
                        window.open(`/bigphoto/${props.id}`, '_blank')
                    } else {
                        window.location.href='/enter'
                    }
                    }}/>
                <p>{props.commentsCount}</p>
                {props.bonuce === true ? <div>
                    <p onClick={() => {
                    console.log('save function')
                    if (props.setSavePhotos) {
                      props.setSavePhotos(props.url)  
                    }
                }}>Сохранить</p>
                <button onClick={() => {
                    if (props.setSharePost !== undefined) {
                        props.setSharePost(props.id)
                    }
                }}>Поделиться</button>
                {pinBtn}
                {deleteBtn}
                <img src='https://cdn-icons-png.flaticon.com/512/6488/6488593.png' width={40} height={40} onClick={() => {
                    const newPhotos = props.photos.map(el => {
                        return {
                            ...el,
                            bonuce: false,
                        }
                    })
                    props.setPhotos(newPhotos)
                }}/>
                </div> : <img src='https://cdn-icons-png.flaticon.com/512/6488/6488593.png' width={40} height={40} onClick={() => {
                    const newPhotos = props.photos.map(el => {
                        if (el.id === props.id) {
                            return {
                                ...el,
                                bonuce: true,
                            }
                        } else {
                            return {
                                ...el,
                                bonuce: false,
                            }
                        }
                    })
                    props.setPhotos(newPhotos)
                }}/>}
            </div>
        </div>
    )
}

export default PhotoDisplay