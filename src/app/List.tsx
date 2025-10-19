import { FC, memo } from "react";
import Photo from "./PhotoInterface";
import PhotoDisplay from "./PhotoDisplay";
import Link from "next/link";
import styles from './List.module.css';

interface PropsList {
    photos: Photo[],
    setPhotos: Function,
    setSavePhotos?: Function,
    setSharePost?: Function,
    trueEmail: string,
}

const List: FC<PropsList> = (props) => {
    return (
        <div className={styles.listWrapper}>
            <ul className={styles.photoGrid}>
                {props.photos.map((item, index) => {
                    return (
                        <li key={index} className={styles.photoItem}>
                            <div className={styles.photoCard}>
                                <Link href={item.email} className={styles.userLink}>
                                    @{item.email.split('@')[0]}
                                </Link>
                                <PhotoDisplay
                                    url={item.url}
                                    userEmail={item.email}
                                    photos={props.photos}
                                    setPhotos={props.setPhotos}
                                    countLikes={item.likes.length}
                                    id={item.id}
                                    descript={item.descript}
                                    date={item.date}
                                    photoIndex={item.photoIndex}
                                    commentsCount={item.comments?.length || 0}
                                    setSavePhotos={props.setSavePhotos}
                                    setSharePost={props.setSharePost}
                                    trueEmail={props.trueEmail}
                                    bonuce={item.bonuce}
                                    pin={item.pin}
                                    likeUrl={
                                        item.likes.find(el => el === props.trueEmail) === undefined
                                            ? "/images/MOREmoji_gray_heart.svg.png"
                                            : "/images/icons8-сердце-100.png"
                                    }
                                />
                            </div>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}

export default memo(List);
