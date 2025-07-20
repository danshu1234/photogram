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
import PhotoSave from "../PhotoSave";
import ShareWindow from "../ShareWindow";
import { io } from "socket.io-client";
import registerServiceWorker from "../RegisterServiceWorker";
import Chat from "../Chat";
import getUserChats from "../getChats";

export default function Home() {

  interface User{
    email: string,
    name: string,
    subscribes: string[],
    avatar: string,
  }

  interface Notif{
    type: string,
    photoId?: string,
    user: string,
  }

  const {} = useCheckReg()
  const { email, trueEmail, setTrueEmail } = useGetEmail()

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
  const [popularList, setPopularList] = useState <User[]> ([])
  const [allUsers, setAllUsers] = useState <UserInterface[]> ([])
  const [nearFriends, setNearFriends] = useState <boolean> (false)
  const [allPhotos, setAllPhotos] = useState <Photo[] | null> ([])
  const [savePhotos, setSavePhotos] = useState <string[]> ([])
  const [datesArr, setDatesArr] = useState <string[]> ([])
  const [date, setDate] = useState <string> ('')
  const [photos, setPhotos] = useState <Photo[] | null> (null)
  let photosList;
  let notifsList;
  let subsListBtn;
  let feechWindow;
  let showPopular;
  let nearBtn;
  let datesList;
  let photoSave;
  let sharePostWindow;

  const getAllPhotosAndSort = async () => {
  const allPhotos = await fetch('http://localhost:4000/photos/all')
  const resultPhotosArr = await allPhotos.json()
  resultPhotosArr.sort((a: Photo, b: Photo) => Number(b.id) - Number(a.id))
  let resultArr = []
  for (let item of resultPhotosArr) {
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
  setPhotos(finalArr)
  setAllPhotos(finalArr)
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

  const getMessCount = async () => {
    const userChats = await fetch(`http://localhost:4000/users-controller/get/mess/count/${trueEmail}`)
    const resultUserChats = await userChats.json()
    if (resultUserChats.length !== 0) {
        const onlyCountArr = resultUserChats.map((el: Chat) => el.messCount)
        const resultCountSum = onlyCountArr.reduce((acuum: number, item: number) => acuum + item)
        setMessCount(resultCountSum)
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
    if (allUsers.length !== null && trueEmail !== '') {
      getAllPhotosAndSort()
      getMessCount()
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
        resultUsers.sort((a: any, b: any) => b.subscribes.length - a.subscribes.length)
        let resultArr = []
        for (let item of resultUsers) {
          if (!item.subscribes.includes(email)) {
            resultArr.push({email: item.email, name: item.name, subscribes: item.subscribes, avatar: item.avatar})
          }
        }
        if (resultArr.length >= 10) {
          setPopularList(resultArr)
        }
      }
      getAllUsers()
    }
  }, [email])

  useEffect(() => {
    if (email !== '') {
      const checkCoords = async () => {
        const coordsCheck = await fetch(`http://localhost:4000/users-controller/check/coords/${email}`)
        const resultCheck = await coordsCheck.text()
        if (resultCheck === 'OK') {
          setNearFriends(true)
        }
      }
      checkCoords()
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
        setTrueEmail(prev => {
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
          const email = trueEmail
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

  if (sharePost !== '') {
    sharePostWindow = <ShareWindow sharePost={sharePost} setSharePost={setSharePost}/>
  }

  if (subs.length !== 0) {
    subsListBtn = <p style={{cursor: 'pointer', opacity: opacity.sub}} onClick={() => {
      setPhotos(subs)
      setOpacity({all: 0.6, sub: 1})
    }}>Мои подписки</p>
  }

  if (isNotifs) {
    notifsList = <NotifsList notifs={notifs} setIsNotifs={setIsNotifs} email={email} setNotifs={setNotifs}/>
  }

  if (savePhotos.length !== 0) {
    photoSave = <PhotoSave savePhotos={savePhotos} setSavePhotos={setSavePhotos}/>
  }

  if (photos === null) {
    photosList = <RingLoader/>
    } else {
      if (photos.length !== 0 && email !== '' && trueEmail !== '') {
      photosList = <List photos={photos} setPhotos={setPhotos} email={email} setSavePhotos={setSavePhotos} setSharePost={setSharePost} trueEmail={trueEmail}/>
    } else {
      photosList = <h2>Фото не найдены</h2>
    }
  }

  if (nearFriends) {
    nearBtn = <h3 onClick={() => window.location.href='/near-friends'}>Друзья поблизости</h3>
  }

  if (datesArr.length !== 0) {
    datesList = <select onChange={(event: ChangeEvent<HTMLSelectElement>) => setDate(event.target.value)}>
      <option value='Все'>Все</option>
      {datesArr.map((item, index) => <option value={item} key={index}>{item}</option>)}
    </select>
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <img src='https://cdn3.iconfinder.com/data/icons/unicons-vector-icons-pack/32/messages-512.png' width={50} height={50} onClick={() => window.location.href='/chats'}/>
        {messCount !== 0 ? <p>{messCount}</p> : null}
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
        <p style={{cursor: 'pointer', opacity: opacity.all}} onClick={() => {
          getAllPhotosAndSort()
          setOpacity({all: 1, sub: 0.6})
          }}>Все фото</p>
        {subsListBtn}
        {nearBtn}
        <Search/>
        <NameSearch allUsers={allUsers}/>
        <h3>Сортировать по дате</h3>
        {datesList}
        {feechWindow}
        {photosList}
        {sharePostWindow}
        {showPopular}
        {photoSave}
      </main>
    </div>
  );
}
