import { FC } from "react";
import Photo from "./PhotoInterface";
import PhotoDisplay from "./PhotoDisplay";
import Link from "next/link";
import styles from './List.module.css';

interface PropsList{
    photos: Photo[],
    setPhotos: Function,
    email: string,
}

const List: FC <PropsList> = (props) => {
    return (
        <div className={styles.list}>
            <ul className={styles.photoGrid}>
                {props.photos.map((item, index) => {
                    return <li key={index} className={styles.photoItem}>
                        <div className={styles.photoCard}>
                            <Link href={item.email} className={styles.userLink}>@{item.email.split('@')[0]}</Link>
                            <PhotoDisplay 
                                url={item.url} 
                                userEmail={item.email} 
                                photos={props.photos} 
                                setPhotos={props.setPhotos} 
                                countLikes={item.likes.length} 
                                email={props.email} 
                                id={item.id} 
                                descript={item.descript}
                                likeUrl={
                                    item.likes.find(el => el === props.email) === undefined ? 
                                    "https://avatars.mds.yandex.net/i?id=e3e0e2429c17d22c59253ed4a53292cdb278ffc5-4283205-images-thumbs&n=13" : 
                                    "https://www.pngall.com/wp-content/uploads/4/Red-Heart-Symbol-PNG-Picture.png"
                                }
                            />
                        </div>
                    </li>
                })}
            </ul>
        </div>
    )
}

export default List;