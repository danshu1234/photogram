'use client'

import { ChangeEvent, useEffect, useState } from "react";
import useCheckReg from "./CheckReg";
import Photo from "./PhotoInterface";
import NotifsList from "./NotifsList";
import List from "./List";
import FeedbackBtn from "./FeedbackBtn";
import useGetEmail from "./useGetEmail";
import Link from "next/link";
import styles from './Home.module.css';
import ExitBtn from "./Exit";
import Search from "./Search";
import { RingLoader } from "react-spinners";
import SearchPhoto from "./SearchPhoto";
import NameSearch from "./NameSearch";
import UserInterface from "./UserInterface";
import PhotoSave from "./PhotoSave";
import ShareWindow from "./ShareWindow";
import useGetSavePhotos from "./useGetSavePhotos";

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
  const { email } = useGetEmail()

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
  
  const { mySavePosts, setMySavePosts } = useGetSavePhotos()
  const [sharePost, setSharePost] = useState <string> ('')
  const [isNotifs, setIsNotifs] = useState <boolean> (false)
  const [newFeechModal, setNewFeechModal] = useState <boolean> (false)
  const [notifs, setNotifs] = useState <Notif[]> ([])
  const [subs, setSubs] = useState <Photo[]> ([])
  const [opacity, setOpacity] = useState <{all: number, sub: number}> ({all: 1, sub: 0.6})
  const [popularList, setPopularList] = useState <User[]> ([])
  const [allUsers, setAllUsers] = useState <UserInterface[]> ([])
  const [countOfPopular, setCountOfPopular] = useState <number> (1)
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
      if (findUser?.permUsers.includes(email) || item.email === email) {
        resultArr.push(item)
      }
    }
  }
  const finalArr = resultArr.map(el => {
    return {
      ...el,
      photoIndex: 0,
    }
  })
  setPhotos(finalArr)
  setAllPhotos(finalArr)
  }

  const getMySavePosts = async () => {
    const mySavePosts = await fetch(`http://localhost:4000/users-controller/get/save/posts/${email}`)
    const resultMySavePosts = await mySavePosts.json()
    setMySavePosts(resultMySavePosts)
  }
  
  const getMySubs = async () => {
    const getAllUsers = await fetch('http://localhost:4000/users-controller/get/all/users')
    const resultUsers = await getAllUsers.json()
    let resultSubs = []
    for (let item of resultUsers) {
      if (item.subscribes.includes(email)) {
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
    if (allUsers.length !== null && email !== '') {
      getAllPhotosAndSort()
    }
  }, [allUsers, email])

  useEffect(() => {
    if (allPhotos !== null) {
      const resultDates = allPhotos.map(el => el.date)
      const setPhotos = new Set(resultDates)
      const resultArr = Array.from(setPhotos)
      setDatesArr(resultArr)
    }
  }, [allPhotos])

  useEffect(() => {
    const getStorageFeech = localStorage.getItem('feech')
    if (!getStorageFeech) {
      setNewFeechModal(true)
    }
  }, [])

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

  const followPopular = async (targetEmail: string) => {
    await fetch('http://localhost:4000/users-controller/sub', {
      method: "PATCH",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, targetEmail })
    })
    const newArr = popularList.map(el => {
      if (el.email === targetEmail) {
        return {
          ...el,
          subscribes: [...el.subscribes, email]
        }
      } else {
        return el
      }
    })
    setPopularList(newArr)
  }

  const unFollowPopular = async (targetEmail: string) => {
    await fetch('http://localhost:4000/users-controller/unsub', {
      method: "PATCH",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, targetEmail })
    })
    const newArr = popularList.map(el => {
      if (targetEmail === el.email) {
        const filteredSubs = el.subscribes.filter(item => item !== email)
        return {
          ...el,
          subscribes: filteredSubs,
        }
      } else {
        return el
      }
    })
    setPopularList(newArr)
  }

  if (newFeechModal) {
    feechWindow = <div>
      <h3>Теперь вы можете сделать свой аккаунт закрытым, для этого нужно нажать на замочек в вашем профиле!</h3>
      <p onClick={() => {
        localStorage.setItem('feech', 'true')
        window.location.href='/myacc'
      }}>Перейти в профиль</p>
      <p onClick={() => {
        localStorage.setItem('feech', 'true')
        setNewFeechModal(false)
      }}>Ок</p>
    </div>
  }

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
      if (photos.length !== 0 && email !== '' && mySavePosts !== null) {
      photosList = <List photos={photos} setPhotos={setPhotos} email={email} setSavePhotos={setSavePhotos} setSharePost={setSharePost} mySavePosts={mySavePosts} setMySavePosts={setMySavePosts}/>
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

  if (popularList.length !== 0) {
    if (countOfPopular === 1) {
      showPopular = <div><ul style={{display: 'flex', flexDirection: 'row'}}>
        {popularList.map((item, index) => {
          if (index < 5) {
            return <li key={index} style={{marginLeft: 10}} onClick={() => window.location.href=`${item.email}`}>
              <div>
                {item.avatar === '' ? <div style={{width: 150, height: 200, backgroundColor: 'gray'}}></div> : <img src={item.avatar} style={{width: 150, height: 200}}/>}
                <p>{item.name}</p>
                {item.subscribes.includes(email) ? <button onClick={() => unFollowPopular(item.email)}>Отписаться</button> : <button onClick={() => followPopular(item.email)}>Подписаться</button>}
              </div>
            </li>
          }
        })}
      </ul>
      <p onClick={() => setCountOfPopular(countOfPopular + 1)}>Дальше</p>
      </div>
    } else {
      showPopular = <div><ul style={{display: 'flex', flexDirection: 'row'}}>
        {popularList.map((item, index) => {
          if (index >=5) {
            return <li key={index} style={{marginLeft: 10}} onClick={() => window.location.href=`${item.email}`}>
              <div>
                {item.avatar === '' ? <div style={{width: 150, height: 200, backgroundColor: 'gray'}}></div> : <img src={item.avatar} style={{width: 150, height: 200}}/>}
                <p>{item.name}</p>
                {item.subscribes.includes(email) ? <button onClick={() => unFollowPopular(item.email)}>Отписаться</button> : <button onClick={() => followPopular(item.email)}>Подписаться</button>}
              </div>
            </li>
          }
        })}
      </ul>
      <p onClick={() => setCountOfPopular(countOfPopular - 1)}>Назад</p>
      </div>
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h3 onClick={() => window.location.href='/chats'}>Сообщения</h3>
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
        <p style={{cursor: 'pointer', opacity: opacity.all}} onClick={() => {
          getAllPhotosAndSort()
          setOpacity({all: 1, sub: 0.6})
          }}>Все фото</p>
        {subsListBtn}
        {nearBtn}
        <Search/>
        <SearchPhoto photos={photos} setPhotos={setPhotos} allPhotos={allPhotos}/>
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
