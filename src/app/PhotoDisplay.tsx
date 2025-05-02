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
}

const PhotoDisplay: FC <PropsPhotoDisplay> = (props) => {

    const likeUnlikePhoto = async () => {
        const id = props.id
                const email = props.email
                const userEmail = props.userEmail
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
                        body: JSON.stringify({ email, userEmail })
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
            <img src={props.url} className={styles.photoImage}/>
            <div className={styles.likeSection}>
                <img 
                    src={props.likeUrl} 
                    className={styles.likeButton}
                    onClick={likeUnlikePhoto}
                />
                <span className={styles.likesCount}>{props.countLikes} likes</span>
            </div>
        </div>
    )
}

export default PhotoDisplay