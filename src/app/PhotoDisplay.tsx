import { FC, useEffect } from "react";
import Photo from "./PhotoInterface";
import styles from './PhotoDisplay.module.css';

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
    photoIndex: number,
    mySavePosts: string[],
    setMySavePosts: Function,
    setSavePhotos: Function | undefined,
    setSharePost: Function | undefined,
}

const PhotoDisplay: FC <PropsPhotoDisplay> = (props) => {

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

    const saveUnsavePost = async (type: string) => {
        const email = props.email
        const postId = props.id
        const savePost = await fetch('http://localhost:4000/users-controller/save/unsave/post', {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, postId, type })
        })
        const newSavePosts = await savePost.json()
        props.setMySavePosts(newSavePosts)
    }

    const likeUnlikePhoto = async () => {
        const id = props.id
                const email = props.email
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
                    await fetch('http://localhost:4000/users-controller/new/notif', {
                        method: "PATCH",
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ email, userEmail, photoId, type })
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
                    const filteredLikes = prevLikes?.filter((el: string) => el !== props.email)
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
                    props.setPhotos(newArr)
                }
    }

    let showPhoto;

    if (props.url.length === 1) {
        showPhoto = <img src={props.url[props.photoIndex]} style={{width: 150, height: 100, borderRadius: 4, objectFit: 'cover', cursor: 'pointer'}} onClick={goToBigPhoto}/>
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
                <p onClick={() => {
                    if (props.setSavePhotos) {
                      props.setSavePhotos(props.url)  
                    }
                }}>Сохранить</p>
                {props.mySavePosts.includes(props.id) ? <img src='https://cdn3.iconfinder.com/data/icons/complete-common-version-6-2/1024/bookmark-1024.png' width={30} height={30} onClick={() => saveUnsavePost('unsave')}/> : <img src='https://avatars.mds.yandex.net/i?id=4d8b277216049a435115f3a5492d8ee06ed9ed63-2417438-images-thumbs&n=13' width={30} height={30} onClick={() => saveUnsavePost('save')}/>}
                <button onClick={() => {
                    if (props.setSharePost !== undefined) {
                        props.setSharePost(props.id)
                    }
                }}>Поделиться</button>
            </div>
        </div>
    )
}

export default PhotoDisplay