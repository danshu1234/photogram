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
import useNotif from "../useNotif"

export default function MyPage() {

  const {} = useNotif()
  const {} = useCheckReg();
  const { email, trueEmail } = useGetEmail();

  const [width, setWidth] = useState <number> (30)

  const [visitsCount, setVisitsCount] = useState <number> (0)
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
    open = <img src='/images/OOjs_UI_icon_unLock-ltr.svg.png' width={40} height={40} onClick={closeAcc}/>
  } else {
    open = <img src='/images/OOjs_UI_icon_secure-link.svg.png' width={40} height={40} onClick={openAccaunt}/>
  }

  let exitBtnAndFeedback;

  if (email !== '') {
    showAva = <Avatar email={email} type='edit'/>
  }

  if (width === 200) {
    exitBtnAndFeedback = <div>
      <ExitBtn email={email}/>
      <p onClick={() => {
        localStorage.removeItem('photogram-enter')
        window.location.reload()
      }}>Выйти</p>
    </div>
  }

  if (myPhotos !== null && myPhotos.length !== 0 && trueEmail !== '') {
    photosList = <List photos={myPhotos} setPhotos={setMyPhotos} email={email} trueEmail={trueEmail}/>
  } else if (myPhotos !== null && myPhotos.length === 0) {
    photosList = <h2 className={styles.noPhotos}>Вы еще не публиковали фото</h2>
  } else {
    photosList = <h2 className={styles.noPhotos}>Загрузка...</h2>
  }

  useEffect(() => {
    if (email !== '' && trueEmail !== '') {
      const trueParamEmail = trueEmail
      const getMyPhotos = async () => {
        const getPhotos = await fetch(`http://localhost:4000/photos/get/user/photos`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, trueParamEmail })
      })
      const resultPhotos = await getPhotos.json()
      setMyPhotos(resultPhotos.photos.map((el: any) => {
        return {
          ...el,
          photoIndex: 0,
          bonuce: false,
        }
      }))
      }
      getMyPhotos()
    }
  }, [email, trueEmail]);


  useEffect(() => {
    if (email !== '') {
      const getMySubs = async () => {
        const getAllSubs = await fetch(`http://localhost:4000/users-controller/all/subs/and/country/${email}`)
        const resultSubs = await getAllSubs.json()
        const result = resultSubs.subscribes.slice(1, resultSubs.length)
        setSubs(result)
      }

      const getMyVisits = async () => {
        const myVisits = await fetch(`http://localhost:4000/users-controller/get/visits/${email}`)
        const resultVisits = await myVisits.json()
        setVisitsCount(resultVisits)
      }
      getMySubs()
      getMyVisits()
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
        <span>{trueEmail}</span>
        <div className={styles.visitsCount}>
          <img src='/images/118191.png' width={20} height={20}/>
          <span>{visitsCount}</span>
        </div>
        <h1 className={styles.title}>Мои фото</h1>
        <h3 
          className={styles.subsLink} 
          onClick={() => subs.length !== 0 && (window.location.href='/mysubs')}
        >
          Мои подписчики: <span className={styles.subsCount}>{subs.length}</span>
        </h3>
        <div className={styles.lockButton}>
          {open}
        </div>
        <button 
          className={styles.addButton}
          onClick={() => setIsModal(true)}
        >
          + Добавить фото
        </button>
      </header>
      
      {isModal && <CreatePhoto setIsModal={setIsModal} email={email}/>}
      <div className={styles.photosContainer}>
        {photosList}
      </div>
      <div 
        className={`${styles.exitPanel}`} 
        onMouseEnter={() => setWidth(200)} 
        onMouseLeave={() => setWidth(20)}
      >
        <ExitBtn email={email}/>
        <span 
          className={styles.exitButton} 
          onClick={() => {
            localStorage.removeItem('photogram-enter')
            window.location.reload()
          }}
        >
          Выйти
        </span>
      </div>
    </div>
  );
}