'use client'

import { useEffect, useState } from "react";
import useCheckReg from "../CheckReg";
import useGetEmail from "../useGetEmail";
import CreatePhoto from "../CreatePhoto";
import styles from './MyPage.module.css';

interface MyPhoto {
  url: string,
  email: string,
  id: string,
  likes: string[],
}

async function getUserPhoto(email: string): Promise<MyPhoto[]> {
    const myPhotosResponse = await fetch(`http://localhost:4000/photos/get/user/photos/${email}`);
    const resultUserPhotos = await myPhotosResponse.json();
    return resultUserPhotos;
}

export default function MyPage() {
  const {} = useCheckReg();
  const { email } = useGetEmail();

  const [subs, setSubs] = useState <string[]> ([])
  const [isModal, setIsModal] = useState<boolean>(false)
  const [myPhotos, setMyPhotos] = useState<MyPhoto[]>([])
  let photosList;

  if (myPhotos.length !== 0) {
    photosList = (
      <ul className={styles.photosList}>
        {myPhotos.map((item, index) => {
          return (
            <li key={index} className={styles.photoItem}>
              <div className={styles.photoCard}>
                <img 
                  src={item.url} 
                  className={styles.photoImage}
                  alt={`Фото пользователя ${email}`}
                />
                <div className={styles.photoFooter}>
                  <span className={styles.likesCount}>❤️ {item.likes.length}</span>
                  <button 
                    className={styles.deleteButton}
                    onClick={async() => {
                      const photoId = item.id
                      await fetch('http://localhost:4000/photos/delete/photo', {
                        method: "DELETE",
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ photoId })
                      })
                      window.location.reload()
                    }}
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    )
  } else {
    photosList = <h2 className={styles.noPhotos}>Вы еще не публиковали фото</h2>
  }

  useEffect(() => {
    if (email !== '') {
      const fetchPhotos = async () => {
        try {
          const resultMyPhotos = await getUserPhoto(email);
          if (resultMyPhotos.length !== 0) {
            setMyPhotos(resultMyPhotos);
          }
        } catch (error) {
          console.error('Ошибка при получении фото', error);
        }
      };
      
      fetchPhotos();
    }
  }, [email]);

  useEffect(() => {
    if (email !== '') {
      const getMySubs = async () => {
        const getAllSubs = await fetch(`http://localhost:4000/users-controller/all/subs/${email}`)
        const resultSubs = await getAllSubs.json()
        const result = resultSubs.slice(1, resultSubs.length)
        setSubs(result)
      }
      getMySubs()
    }
  }, [email])


  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Мои фото</h1>
        <h3 style={{cursor: 'pointer'}} onClick={() => {
          if (subs.length !== 0) {
            window.location.href='/mysubs'
          }
        }}>Мои подписчики: <span style={{color: 'green'}}>{subs.length}</span></h3>
        <button 
          className={styles.addButton}
          onClick={() => setIsModal(true)}
        >
          + Добавить фото
        </button>
      </header>
      
      {isModal && <CreatePhoto setIsModal={setIsModal} />}
      <div className={styles.photosContainer}>
        {photosList}
      </div>
    </div>
  );
}