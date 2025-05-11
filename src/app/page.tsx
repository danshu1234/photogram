'use client'

import { useEffect, useState } from "react";
import useCheckReg from "./CheckReg";
import Photo from "./PhotoInterface";
import NotifsList from "./NotifsList";
import List from "./List";
import FeedbackBtn from "./FeedbackBtn";
import useGetEmail from "./useGetEmail";
import Link from "next/link";
import styles from './Home.module.css';
import { io } from "socket.io-client";
import ExitBtn from "./Exit";
import Search from "./Search";
import { ClimbingBoxLoader } from "react-spinners";

export default function Home() {

  interface Notif{
    notif: string,
    photoId: string,
  }

  const socket = io('http://localhost:4000')

  const {} = useCheckReg()
  const { email } = useGetEmail()

  const [socketId, setSocketId] = useState <string | undefined> (undefined)
  

  const getAllPhotosAndSort = async () => {
    const allPhotos = await fetch('http://localhost:4000/photos/all')
    const resultPhotosArr = await allPhotos.json()
    resultPhotosArr.sort((a: Photo, b: Photo) => Number(b.id) - Number(a.id))
    setPhotos(resultPhotosArr)
  }

  const goSocketToBase = async () => {
    await fetch('http://localhost:4000/users-controller/add/socket', {
      method: "PATCH",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, socketId })
    })
  }

  const clearSocket = async () => {
    await fetch('http://localhost:4000/users-controller/clear/socket', {
      method: "PATCH",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    })
  }

  const getMyNotifs = async () => {
    const getEmailFromStorage = localStorage.getItem('photogram-enter')
    if (getEmailFromStorage) {
      const myEmail = JSON.parse(getEmailFromStorage)
      const getNotifs = await fetch(`http://localhost:4000/users-controller/get/notifs/${myEmail}`)
      const resultNotifs = await getNotifs.json()
      setNotifs(resultNotifs)
    }
  }

  useEffect(() => {
    getAllPhotosAndSort()

    socket.on('connect', () => {
      setSocketId(socket.id)
    })

    socket.on('replyMessage', (message: {type: string}) => {
      if (message.type === 'checkNotifs') {
        getMyNotifs()
      }
    })

    socket.on('disconnect', () => {
      clearSocket()
    })

    return(() => {
      clearSocket()
    })
  }, [])

  useEffect(() => {
    if (socketId !== undefined) {
      goSocketToBase()
    }
  }, [socketId])

  useEffect(() => {
    if (email !== '') {
      getMyNotifs()
    }
  }, [email])
  
  const [isNotifs, setIsNotifs] = useState <boolean> (false)
  const [notifs, setNotifs] = useState <Notif[]> ([])
  const [photos, setPhotos] = useState <Photo[]> ([])
  let photosList;
  let notifsList;

  if (isNotifs) {
    notifsList = <NotifsList notifs={notifs} setIsNotifs={setIsNotifs} email={email} setNotifs={setNotifs}/>
  }

  if (photos.length !== 0 && email !== '') {
    photosList = <List photos={photos} setPhotos={setPhotos} email={email}/>
  } else {
    photosList = <ClimbingBoxLoader color="#ff4757"/>
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.logo}>Photogram</h1>
        <FeedbackBtn/>
        <div className={styles.controls}>
          <div 
            className={`${styles.notifs} ${notifs.length ? styles.hasNotifs : ''}`} 
            onClick={() => {
              if (notifs.length !== 0) {
                setIsNotifs(true)
              }
            }}
          >
            🔔 {Array.isArray(notifs) ? notifs.length : 0}
          </div>
          <Link href={'/myacc'} className={styles.myAccLink}>Мой аккаунт</Link>
          <ExitBtn/>
        </div>
      </header>
      
      {notifsList}
      <main className={styles.main}>
        <Search/>
        {photosList}
      </main>
    </div>
  );
}
