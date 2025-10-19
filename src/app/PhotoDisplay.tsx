import { FC } from "react";
import Photo from "./PhotoInterface";
import styles from './PhotoDisplay.module.css';
import getUserEmail from "./getUserEmail";
import { usePathname } from 'next/navigation';  

interface PropsPhotoDisplay {
    url: string,
    countLikes: number,
    likeUrl: string,
    id: string,
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
    setSavePhotos?: Function,
    setSharePost?: Function,
}

const PhotoDisplay: FC<PropsPhotoDisplay> = (props) => {
    const params = usePathname();

    const likeUnlikePhoto = async () => {
        const { id, trueEmail, userEmail } = props;
        if (!props.likeUrl.includes('сердце')) {
            await fetch('http://localhost:4000/photos/like/this/photo', {
                method: "PATCH",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id }),
                credentials: 'include',
            });
            await fetch('http://localhost:4000/users-controller/new/notif', {
                method: "PATCH",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userEmail, photoId: id, type: 'photo' }),
                credentials: 'include',
            });
            props.setPhotos(props.photos.map(el =>
                el.id === id ? { ...el, likes: [...el.likes, trueEmail] } : el
            ));
        } else {
            await fetch('http://localhost:4000/photos/unlike/photo', {
                method: "PATCH",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id }),
                credentials: 'include',
            });
            const findPhoto = props.photos.find(el => el.id === id);
            const filteredLikes = findPhoto?.likes.filter(el => el !== trueEmail) || [];
            props.setPhotos(props.photos.map(el =>
                el.id === id ? { ...el, likes: filteredLikes } : el
            ));
        }
    };

    let deleteBtn;
    if (params === '/myacc') {
        deleteBtn = (
            <button className={styles.actionBtn} onClick={async () => {
                const photoId = props.id
                await fetch('http://localhost:4000/photos/delete/photo', {
                    method: "DELETE",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ photoId }),
                    credentials: 'include',
                });
                props.setPhotos(props.photos.filter(el => el.id !== props.id));
            }}>Удалить</button>
        );
    }

    return (
        <div className={styles.photoContainer}>
            <p className={styles.date}>{props.date}</p>
            <div className={styles.navWrapper}><img src={props.url} className={styles.photoImage} onClick={() => window.location.href=`bigphoto/${props.id}`}/></div>
            <div className={styles.likeSection}>
                <img src={props.likeUrl} className={styles.likeButton} onClick={likeUnlikePhoto} />
                <span className={styles.likesCount}>{props.countLikes} likes</span>
                <img src='/images/gas-kvas-com-p-znak-soobshcheniya-na-prozrachnom-fone-34.png'
                    className={styles.zoomIcon}
                    onClick={() => {
                        if (localStorage.getItem('photogram-enter')) {
                            window.open(`/bigphoto/${props.id}`, '_blank');
                        } else {
                            window.location.href = '/enter';
                        }
                    }} />
                <p className={styles.commentsCount}>{props.commentsCount}</p>
                {deleteBtn}
            </div>
        </div>
    );
};

export default PhotoDisplay;
