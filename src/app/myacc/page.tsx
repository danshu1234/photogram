'use client'

import { useEffect, useState } from "react";
import useCheckReg from "../CheckReg";
import useGetEmail from "../useGetEmail";
import CreatePhoto from "../CreatePhoto";
import styles from './MyPage.module.css';
import Avatar from "../Avatar";
import Photo from "../PhotoInterface";
import List from "../List";
import useNotif from "../useNotif"
import exitAcc from '../exitAcc'

export default function MyPage() {
  const {} = useNotif()
  const {} = useCheckReg();
  const { email, trueEmail } = useGetEmail();

  const [openAcc, setOpenAcc] = useState<boolean>(false) 
  const [subs, setSubs] = useState<string[]>([])
  const [isModal, setIsModal] = useState<boolean>(false)
  const [myPhotos, setMyPhotos] = useState<Photo[] | null>(null)

  let photosList;
  let showAva;
  let open;

  const closeAcc = async () => {
    const close = await fetch('http://localhost:4000/users-controller/close/acc', {
      method: "PATCH",
      headers: {
        'Authorization': `Bearer ${email}`,
        'Content-Type': 'application/json',
      },
    })
    if (close.ok) {
      const resultClose = await close.text()
      if (resultClose === 'OK') {
        setOpenAcc(false)
      }
    } else {
      exitAcc()
    }
  }

  const openAccaunt = async () => {
    const opAcc = await fetch('http://localhost:4000/users-controller/open/acc', {
      method: "PATCH",
      headers: {
        'Authorization': `Bearer ${email}`,
        'Content-Type': 'application/json',
      },
    })
    if (opAcc.ok) {
      const resultOpen = await opAcc.text()
      if (resultOpen === 'OK') {
        setOpenAcc(true)
      }
    } else {
      exitAcc()
    }
  }

  if (openAcc) {
    open = <img 
      src='/images/OOjs_UI_icon_unLock-ltr.svg.png' 
      width={30} 
      height={30} 
      onClick={closeAcc}
      alt="Открытый аккаунт"
    />
  } else {
    open = <img 
      src='/images/OOjs_UI_icon_secure-link.svg.png' 
      width={30} 
      height={30} 
      onClick={openAccaunt}
      alt="Закрытый аккаунт"
    />
  }

  if (email !== '') {
    showAva = <Avatar email={email} type='edit'/>
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
            'Authorization': `Bearer ${email}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ trueParamEmail })
        })
        if (getPhotos.ok) {
          const resultPhotos = await getPhotos.json()
          setMyPhotos(resultPhotos.photos.map((el: any) => {
            return {
              ...el,
              photoIndex: 0,
              bonuce: false,
            }
          }))
        } else {
          exitAcc()
        }
      }
      getMyPhotos()
    }
  }, [email, trueEmail]);

  useEffect(() => {
    if (email !== '') {
      const getMySubs = async () => {
        const getAllSubs = await fetch('http://localhost:4000/users-controller/all/subs/and/country', {
          method: "GET",
          headers: {
            'Authorization': `Bearer ${email}`,
            'Content-Type': 'application/json',
          },
        })
        if (getAllSubs.ok) {
          const resultSubs = await getAllSubs.json()
          const result = resultSubs.subscribes.slice(1, resultSubs.length)
          setSubs(result)
        } else {
          exitAcc()
        }
      }
      getMySubs()
    }
  }, [email])
  
  useEffect(() => {
    if (email !== '') {
      const checkOpenStatus = async () => {
        const checkStatus = await fetch('http://localhost:4000/users-controller/check/open', {
          method: "GET",
          headers: {
            'Authorization': `Bearer ${email}`,
            'Content-Type': 'application/json',
          },
        })
        if (checkStatus) {
          const resultStatus = await checkStatus.json()
          setOpenAcc(resultStatus)
        } else {
          exitAcc()
        }
      }
      checkOpenStatus()
    }
  }, [email])

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        {showAva}
        <span className={styles.email}>{trueEmail}</span>
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
      <div className={styles.exitPanel}>
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