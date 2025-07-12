'use client'

import { useEffect, useState } from "react";
import useCheckReg from "../CheckReg";
import useGetEmail from "../useGetEmail";
import CreatePhoto from "../CreatePhoto";
import styles from './MyPage.module.css';
import ExitBtn from "../Exit";
import Avatar from "../Avatar";
import Photo from "../PhotoInterface";
import List from "../List";
import useGetSavePhotos from "../useGetSavePhotos";

async function getUserPhoto(email: string): Promise<Photo[]> {
    const myPhotosResponse = await fetch(`http://localhost:4000/photos/get/user/photos/${email}`);
    const resultUserPhotos = await myPhotosResponse.json();
    return resultUserPhotos;
}

export default function MyPage() {

  const {} = useCheckReg();
  const { email } = useGetEmail();

  const [width, setWidth] = useState <number> (30)

  const { mySavePosts, setMySavePosts } = useGetSavePhotos()
  const [openAcc, setOpenAcc] = useState <boolean> (false) 
  const [subs, setSubs] = useState <string[]> ([])
  const [isModal, setIsModal] = useState<boolean>(false)
  const [myPhotos, setMyPhotos] = useState<Photo[] | null>(null)
  let photosList;
  let showAva;
  let open;

  const closeAcc = async () => {
    const close = await fetch('http://localhost:4000/users-controller/close/acc', {
      method: "PATCH",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    })
    const resultClose = await close.text()
    if (resultClose === 'OK') {
      setOpenAcc(false)
    }
  }

  const openAccaunt = async () => {
    const opAcc = await fetch('http://localhost:4000/users-controller/open/acc', {
      method: "PATCH",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    })
    const resultOpen = await opAcc.text()
    if (resultOpen === 'OK') {
      setOpenAcc(true)
    }
  }

  if (openAcc) {
    open = <img src='https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/OOjs_UI_icon_unLock-ltr.svg/60px-OOjs_UI_icon_unLock-ltr.svg.png' width={40} height={40} onClick={closeAcc}/>
  } else {
    open = <img src='https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/OOjs_UI_icon_secure-link.svg/640px-OOjs_UI_icon_secure-link.svg.png' width={40} height={40} onClick={openAccaunt}/>
  }

  let exitBtnAndFeedback;

  if (email !== '') {
    showAva = <Avatar email={email} type='edit'/>
  }

  if (width === 200) {
    exitBtnAndFeedback = <div>
      <ExitBtn/>
    </div>
  }

  if (myPhotos !== null && myPhotos.length !== 0 && mySavePosts !== null) {
    photosList = <List photos={myPhotos} setPhotos={setMyPhotos} email={email} mySavePosts={mySavePosts} setMySavePosts={setMySavePosts}/>
  } else if (myPhotos !== null && myPhotos.length === 0) {
    photosList = <h2 className={styles.noPhotos}>Вы еще не публиковали фото</h2>
  } else {
    photosList = <h2 className={styles.noPhotos}>Загрузка...</h2>
  }

  useEffect(() => {
    if (email !== '') {
      const fetchPhotos = async () => {
        try {
          const resultMyPhotos = await getUserPhoto(email);
          if (resultMyPhotos.length !== 0) {
            const resultArr = resultMyPhotos.map(el => {
              return {
                ...el,
                photoIndex: 0,
              }
            })
            setMyPhotos(resultArr.reverse());
          } else {
            setMyPhotos([])
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
        const getAllSubs = await fetch(`http://localhost:4000/users-controller/all/subs/and/country/${email}`)
        const resultSubs = await getAllSubs.json()
        const result = resultSubs.subscribes.slice(1, resultSubs.length)
        setSubs(result)
      }
      getMySubs()
    }
  }, [email])

  useEffect(() => {
    if (email !== '') {
      const checkOpenStatus = async () => {
        const checkStatus = await fetch(`http://localhost:4000/users-controller/check/open/${email}`)
        const resultStatus = await checkStatus.json()
        setOpenAcc(resultStatus)
      }
      checkOpenStatus()
    }
  }, [email])

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        {showAva}
        <h1 className={styles.title}>Мои фото</h1>
        <h3 style={{cursor: 'pointer'}} onClick={() => {
          if (subs.length !== 0) {
            window.location.href='/mysubs'
          }
        }}>Мои подписчики: <span style={{color: 'green'}}>{subs.length}</span></h3>
        {open}
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
      <div style={{position: 'absolute', right: 0, bottom: 50, backgroundColor: 'turquoise', height: 100, width: width, transitionDuration: '0.7s'}} onMouseEnter={() => setWidth(200)} onMouseLeave={() => setWidth(20)}>{exitBtnAndFeedback}</div>
    </div>
  );
}