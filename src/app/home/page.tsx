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
import getUserChats from "../getChats";
import exitAcc from "../exitAcc";
import Call from "../Call";
import useOnlineStatus from "../useOnlineStatus"
import useCheckPrivateKey from "../useCheckPrivateKey";

export default function Home() {

  interface KeyWord{
    label: string;
    word: string;
  }

  interface Notif{
    type: string,
    photoId?: string,
    user: string,
    photoCount?: number,
  }

  const { isCheck } = useCheckReg()
  const { trueEmail } = useGetEmail()

  const {} = useOnlineStatus()  
  const {} = useCheckPrivateKey()

  const getMyNotifs = async () => {
    const getNotifs = await fetch(`http://localhost:4000/users-controller/get/notifs`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
    if (getNotifs.ok) {
      const resultNotifs = await getNotifs.json()
      setNotifs(resultNotifs)
    } else {
      exitAcc()
    }
  }

  useEffect(() => {
    getMyNotifs()
  }, [])

  const [socketId, setSocketId] = useState <string> ('')
  
  const [activeKeyWord, setActiveKeyWord] = useState <string> ('rec')
  const [keyWords, setKeyWords] = useState <KeyWord[] | null> (null)
  const [messCount, setMessCount] = useState <number> (0)
  const [sharePost, setSharePost] = useState <string> ('')
  const [isNotifs, setIsNotifs] = useState <boolean> (false)
  const [notifs, setNotifs] = useState <Notif[]> ([])

  const [subs, setSubs] = useState <Photo[]> ([])

  const [opacity, setOpacity] = useState <{all: number, sub: number}> ({all: 1, sub: 0.6})

  const [allUsers, setAllUsers] = useState <UserInterface[]> ([])

  const [keyWordPhotos, setKeyWordPhotos] = useState <{label: string, photos: Photo[]}[] | null> (null)
  const [allPhotos, setAllPhotos] = useState <Photo[] | null> ([])
  const [photoIndex, setPhotoIndex] = useState <{start: number, finish: number}> ({start: 0, finish: 6})
  const [moreBtn, setMoreBtn] = useState <boolean> (true)

  const [savePhotos, setSavePhotos] = useState <string[]> ([])

  const [date, setDate] = useState <string> ('')

  const [photos, setPhotos] = useState <Photo[] | null> (null)

  let photosList;
  let notifsList;
  let subsListBtn;
  let feechWindow;
  let showKeyWords;

  const getAllPhotosAndSort = async () => {
    const start = photoIndex.start
    const finish = photoIndex.finish
    const allPhotosRes = await fetch('http://localhost:4000/photos/all', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ start, finish }),
      credentials: 'include',
    })
    const resultPhotosArr = await allPhotosRes.json()
    console.log(resultPhotosArr)
    let resultArr = []
    for (let item of resultPhotosArr.resultPhotos) {
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
    if (resultPhotosArr.newRecPhoto === true) {
      setPhotoIndex({start: 0, finish: 6})
    }
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

  const getUserLabels = async () => {
    const keyWords = await fetch('http://localhost:4000/users-controller/get/key/words', {
      method: "GET",
      credentials: 'include',
    })
    const resultKeyWords = await keyWords.json()
    let keyWordsUser: KeyWord[] = [{label: 'rec', word: 'Рекомендации'}]
    if (resultKeyWords.length !== 0) {
      for (let item of resultKeyWords.keyWords) {
        const label = item.label.split(', ')[0]
        keyWordsUser = [...keyWordsUser, {label: item.label, word: label}]
      }
      setKeyWordPhotos(resultKeyWords.labelPhoto)
      setKeyWords(keyWordsUser)
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
    const getAllUsers = async () => {
      const allUsers = await fetch('http://localhost:4000/users-controller/get/all/users')
      const resultUsers = await allUsers.json()
      setAllUsers(resultUsers)
    }
    getAllUsers()
    getUserLabels()
  }, [])

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
          if (document.visibilityState !== 'visible') {
            getUserChats(user)
          }
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
      } else if (message.type === 'notif') {
        setNotifs(prevNotifs => {
          const newNotifs = [...prevNotifs, {type: message.typeNotif, user: message.user}]
          return newNotifs
        })
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
          body: JSON.stringify({ socketId }),
          credentials: 'include',
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
    notifsList = <NotifsList notifs={notifs} setIsNotifs={setIsNotifs} setNotifs={setNotifs}/>
  }

  if (keyWords) {
    if (keyWords.length !== 0) {
      showKeyWords = <ul style={{listStyle: 'none'}}>
        {keyWords.map((item, index) => {
          if (item.label === activeKeyWord) {
            return <li key={index} style={{color: 'black'}}>{item.word}</li>
          } else {
            return <li key={index} style={{color: 'gray'}} onClick={() => {
              if (item.label === 'rec') {
                if (allPhotos) {
                  setPhotos([...allPhotos])
                  setActiveKeyWord(item.label)
                }
              } else {
                if (keyWordPhotos) {
                  const photoKeyWord = keyWordPhotos.find(el => el.label === item.label)
                  if (photoKeyWord) {
                    setPhotos(photoKeyWord.photos)
                    setActiveKeyWord(item.label)
                  }
                }
              }
            }}>{item.word}</li>
          }
        })}
      </ul>
    }
  }

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
      if (photos.length !== 0 && trueEmail !== '') {
      photosList = <List photos={photos} setPhotos={setPhotos} setSavePhotos={setSavePhotos} setSharePost={setSharePost} trueEmail={trueEmail}/>
    } else {
      photosList = <h2 className={styles.noPhotos}>Фото не найдены</h2>
    }
  }

  return (
    <div className={styles.home}>
      {isCheck ? <div>
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
        <Call/>
        {subsListBtn}
        <Search/>
        <NameSearch allUsers={allUsers} type="users"/>
        {showKeyWords}
        {feechWindow}
        {photosList}
        {(moreBtn && photos && activeKeyWord === 'rec') ? <p onClick={getAllPhotosAndSort} style={{marginTop: '15px', cursor: 'pointer', color: 'blue', opacity: '0.5'}}>Показать больше</p> : null}
      </main>
      </div> : <RingLoader/>}
    </div>
  );
}
