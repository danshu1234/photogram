'use client'

import { ChangeEvent, useEffect, useState } from "react";
import useCheckReg from "../CheckReg";
import Photo from "../PhotoInterface";
import NotifsList from "../NotifsList";
import List from "../List";
import FeedbackBtn from "../FeedbackBtn";
import useGetEmail from "../useGetEmail";
import Link from "next/link";
import styles from './Home.module.css';
import Search from "../Search";
import { RingLoader } from "react-spinners";
import NameSearch from "../NameSearch";
import UserInterface from "../UserInterface";
import { io } from "socket.io-client";
import registerServiceWorker from "../RegisterServiceWorker";
import Chat from "../Chat";
import getUserChats from "../getChats";

export default function Home() {

  interface Notif{
    type: string,
    photoId?: string,
    user: string,
  }

  const {} = useCheckReg()
  const { email, setEmail, trueEmail, setTrueEmail } = useGetEmail()

  const getMyNotifs = async () => {
    const getEmailFromStorage = localStorage.getItem('photogram-enter')
    if (getEmailFromStorage) {
      const getNotifs = await fetch(`http://localhost:4000/users-controller/get/notifs/${getEmailFromStorage}`)
      const resultNotifs = await getNotifs.json()
      setNotifs(resultNotifs)
    }
  }

  useEffect(() => {
    if (email !== '') {
      getMyNotifs()
    }
  }, [email])

  const [socketId, setSocketId] = useState <string> ('')
  
  const [messCount, setMessCount] = useState <number> (0)
  const [sharePost, setSharePost] = useState <string> ('')
  const [isNotifs, setIsNotifs] = useState <boolean> (false)
  const [notifs, setNotifs] = useState <Notif[]> ([])

  const [subs, setSubs] = useState <Photo[]> ([])

  const [opacity, setOpacity] = useState <{all: number, sub: number}> ({all: 1, sub: 0.6})

  const [allUsers, setAllUsers] = useState <UserInterface[]> ([])

  const [allPhotos, setAllPhotos] = useState <Photo[] | null> ([])
  const [photoIndex, setPhotoIndex] = useState <{start: number, finish: number}> ({start: 0, finish: 6})
  const [moreBtn, setMoreBtn] = useState <boolean> (true)

  const [savePhotos, setSavePhotos] = useState <string[]> ([])

  const [datesArr, setDatesArr] = useState <string[]> ([])

  const [date, setDate] = useState <string> ('')

  const [photos, setPhotos] = useState <Photo[] | null> (null)

  let photosList;
  let notifsList;
  let subsListBtn;
  let feechWindow;
  let datesList;

  const getAllPhotosAndSort = async () => {
    const start = photoIndex.start
    const finish =photoIndex.finish
    const allPhotosRes = await fetch('http://localhost:4000/photos/all', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ start, finish })
    })
    const resultPhotosArr = await allPhotosRes.json()
    console.log(resultPhotosArr)
    resultPhotosArr.photos.sort((a: Photo, b: Photo) => Number(b.id) - Number(a.id))
    let resultArr = []
    for (let item of resultPhotosArr.photos) {
    const findUser = allUsers.find(el => el.email === item.email)
    if (findUser?.open === true) {
      resultArr.push(item)
    } else {
      if (findUser?.permUsers.includes(trueEmail) || item.email === trueEmail) {
        resultArr.push(item)
      }
    }
  }
  const finalArr = resultArr.map(el => {
    return {
      ...el,
      photoIndex: 0,
      bonuce: false,
    }
  })
  let resultPhotos = []
  if (photos && allPhotos) {
    setPhotos([...photos, ...finalArr])
    setAllPhotos([...allPhotos, ...finalArr])
    resultPhotos = [...photos, ...finalArr]
  } else {
    setPhotos(finalArr)
    setAllPhotos(finalArr)
    resultPhotos = [...finalArr]
  }
  if (resultPhotosArr.allLength - resultPhotos.length) {
      setPhotoIndex({start: photoIndex.start + 6, finish: photoIndex.finish + 6})
    } else if (resultPhotosArr.allLength - resultPhotos.length === 2) {
      setPhotoIndex({start: photoIndex.start + 6, finish: photoIndex.finish + 5})
    } else if (resultPhotosArr.allLength - resultPhotos.length === 1) {
      setPhotoIndex({start: photoIndex.start + 6, finish: photoIndex.finish + 4})
    } else if (resultPhotosArr.allLength - resultPhotos.length === 0) {
      setMoreBtn(false)
  }
  }

  
  const getMySubs = async () => {
    const getAllUsers = await fetch('http://localhost:4000/users-controller/get/all/users')
    const resultUsers = await getAllUsers.json()
    let resultSubs = []
    for (let item of resultUsers) {
      if (item.subscribes.includes(trueEmail)) {
        resultSubs.push(item.email)
      }
    }
    if (resultSubs.length !== 0) {
      if (photos !== null) {
        let resultArr = []
        for (let item of photos) {
          if (resultSubs.includes(item.email)) {
            resultArr.push(item)
          }
        }
        const finalSubs = resultArr.map(el => {
          return {
            ...el,
            photoIndex: 0,
          }
        })
        setSubs(finalSubs)
      }
    }
  }


  useEffect(() => {
    if (photos !== null) {
      if (photos.length !== 0) {
        getMySubs()
      }
    }
  }, [photos])

  useEffect(() => {
    if (allUsers.length !== 0 && trueEmail !== '') {
      getAllPhotosAndSort()
    }
  }, [allUsers, trueEmail])

  useEffect(() => {
    if (allPhotos !== null) {
      const resultDates = allPhotos.map(el => el.date)
      const setPhotos = new Set(resultDates)
      const resultArr = Array.from(setPhotos)
      setDatesArr(resultArr)
    }
  }, [allPhotos])

  useEffect(() => {
    if (email !== '') {
      const getAllUsers = async () => {
        const allUsers = await fetch('http://localhost:4000/users-controller/get/all/users')
        const resultUsers = await allUsers.json()
        setAllUsers(resultUsers)
      }
      getAllUsers()
    }
  }, [email])

  useEffect(() => {
    if (date === 'Все') {
      setPhotos(allPhotos)
    } else if (date !== 'Все' && date !== '') {
      const resultArr = allPhotos?.filter(el => el.date === date)
      if (resultArr){
        setPhotos(resultArr)
      } 
    }
  }, [date])


  useEffect(() => {
    registerServiceWorker()
  }, [])

  useEffect(() => {
    
  const socket = io('http://localhost:4000');

  socket.on('connect', () => {
    if (socket.id) {
      setSocketId(socket.id)
    }
  });

  socket.on('replyMessage', async(message) => {
      if (message.type === 'message') {
        const user = message.user
        setEmail(prev => {
            let email = prev
            if (document.visibilityState !== 'visible') {
              getUserChats(email, user)
            }
            return prev
        })
        setMessCount(prev => prev + 1)
      } else if (message.type === 'onlineStatus') {
        const userEmail = message.user
            await fetch('http://localhost:4000/users-controller/give/online/status', {
                method: "POST",
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userEmail })
            })
      } else if (message.type === 'delete') {
        setMessCount(prev => prev - 1)
      }
      })

  return () => {
    socket.disconnect(); 
  };
}, []);


  useEffect(() => {
    if (socketId !== '' && trueEmail !== '') {
      console.log(socketId)
      const addSocket = async () => {
          await fetch('http://localhost:4000/users-controller/add/socket', {
          method: "PATCH",
              headers: {
                'Content-Type': 'application/json',
              },
          body: JSON.stringify({ email, socketId })
      })
      }
      addSocket()
    }
  }, [socketId, trueEmail])

  if (subs.length !== 0) {
    subsListBtn = <p className={styles.subsListBtn} style={{cursor: 'pointer', opacity: opacity.sub}} onClick={() => {
      setPhotos(subs)
      setOpacity({all: 0.6, sub: 1})
    }}>Мои подписки</p>
  }

  if (isNotifs) {
    notifsList = <NotifsList notifs={notifs} setIsNotifs={setIsNotifs} email={email} setNotifs={setNotifs}/>
  }

  useEffect(() => {
    console.log(`Photos: ${photos}`)
    console.log(`Code: ${email}`)
    console.log(`Email: ${trueEmail}`)
  }, [photos, email, trueEmail])

  if (photos === null) {
    photosList = <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '200px',
      width: '100%'
    }}>
      <RingLoader/>
    </div>
    } else {
      if (photos.length !== 0 && email !== '' && trueEmail !== '') {
      photosList = <List photos={photos} setPhotos={setPhotos} email={email} setSavePhotos={setSavePhotos} setSharePost={setSharePost} trueEmail={trueEmail}/>
    } else {
      photosList = <h2 className={styles.noPhotos}>Фото не найдены</h2>
    }
  }

  if (datesArr.length !== 0) {
    datesList = <select className={styles.dateSelect} onChange={(event: ChangeEvent<HTMLSelectElement>) => setDate(event.target.value)}>
      <option value='Все'>Все</option>
      {datesArr.map((item, index) => <option value={item} key={index}>{item}</option>)}
    </select>
  }

  return (
    <div className={styles.home}>
      <header className={styles.header}>
        <img src='/images/Circle-icons-chat.svg.png' width={50} height={50} className={styles.messagesIcon} onClick={() => window.location.href='/chats'}/>
        <h1 className={styles.logo} onClick={() => window.location.reload()}>Photogram</h1>
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
        </div>
      </header>
      
      {notifsList}
      <main className={styles.main}>
        {subsListBtn}
        <Search/>
        <NameSearch allUsers={allUsers}/>
        <div className={styles.dateSelect}>
          <h3>Сортировать по дате</h3>
          {datesList}
        </div>
        {feechWindow}
        {photosList}
        {moreBtn && photos ? <p onClick={getAllPhotosAndSort} style={{marginTop: '15px', cursor: 'pointer', color: 'blue', opacity: '0.5'}}>Показать больше</p> : null}
      </main>
    </div>
  );
}
