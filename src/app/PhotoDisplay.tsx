import { FC } from "react";
import Photo from "./PhotoInterface";
import styles from './PhotoDisplay.module.css';

interface PropsPhotoDisplay{
    url: string,
    countLikes: number,
    likeUrl: string,
    id: string,
    email: string,
    photos: Photo[],
    setPhotos: Function,
    userEmail: string,
    descript: string,
}

const PhotoDisplay: FC <PropsPhotoDisplay> = (props) => {

    const likeUnlikePhoto = async () => {
        const id = props.id
                const email = props.email
                const userEmail = props.userEmail
                const photoId = props.id
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
                        body: JSON.stringify({ email, userEmail, photoId })
                    })
                    const newArr = props.photos.map(el => {
                        if (el.id !== props.id) {
                            return el
                        } else {
                            return {
                                id: el.id,
                                url: el.url,
                                email: el.email,
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
                                id: el.id,
                                url: el.url,
                                email: el.email,
                                likes: filteredLikes,
                            }
                        }
                    })
                    props.setPhotos(newArr)
                }
    }

    return (
        <div className={styles.photoContainer}>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {props.descript && ( 
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
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
            <img src={props.url} className={styles.photoImage} onClick={() => window.open(`/bigphoto/${props.id}`, '_blank')}/>
            <div className={styles.likeSection}>
                <img 
                    src={props.likeUrl} 
                    className={styles.likeButton}
                    onClick={likeUnlikePhoto}
                />
                <span className={styles.likesCount}>{props.countLikes} likes</span>
                <img src='https://cdn-icons-png.flaticon.com/512/892/892303.png' style={{width: 30, height: 30, marginLeft: 120, cursor: 'pointer'}} onClick={() => {
                const a = document.createElement('a');
                a.href = props.url;
                a.download = props.id || 'image.jpg';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                }}/>
            </div>
        </div>
    )
}

export default PhotoDisplay