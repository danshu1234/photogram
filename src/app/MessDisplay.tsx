'use client'

import { FC, useState, memo } from "react"
import { Message } from "@/app/Chat"
import ImgList from "./ImgList"
import ShareBtn from "./ShareBtn"
import { Element } from 'react-scroll'

interface MessDisplayProps{
    messages: Message[] | null;
    email: string;
    trueParamEmail: string;
    setMessages: Function;
    setAnswMess: Function;
    setEditMess: Function;
    setInputMess: Function;
    setSucCopy: Function;
    setPinMess: Function;
    pinMess: string[];
}

const MessDisplay: FC <MessDisplayProps> = (props) => {

    const [imgArr, setImgArr] = useState <string[]> ([])
    const [startIndex, setStartIndex] = useState <number> (0)
    let imgList;

    if (imgArr.length !== 0) {
        imgList = <div>
            <p onClick={() => setImgArr([])}>X</p>
            <ImgList imgArr={imgArr} startIndex={startIndex} setStartIndex={setStartIndex}/>
        </div>
    }

    const openMessControls = (messId: string) => {
        if (props.messages) {
            const newMess = props.messages.map(el => {
                if (el.id === messId) {
                    return {
                        ...el,
                        controls: true,
                    }
                } else {
                    return {
                        ...el,
                        controls: false,
                    }
                }
            })
            props.setMessages(newMess)
        }
    }


    return (
        <div>
            {imgList}
                {props.messages?.map((item, index) => {
                    const email = props.email
                    const trueParamEmail = props.trueParamEmail
                    let dateShow;
                    if (props.messages) {
                        if (index === 0 || props.messages[index - 1].date !== item.date) {
                        dateShow = <p>{item.date}</p>
                    }
                    }

                    let showMess;

                    if (item.typeMess === 'text') {
                        showMess = <p>{item.text}</p>
                    } else if (item.typeMess === 'voice') {
                        showMess = <audio src={item.text} controls/>
                    } else if (item.typeMess === 'gif') {
                        showMess = <img src={item.text} width={100} height={100}/>
                    } else if (item.typeMess === 'post') {
                        showMess = <p style={{color: 'blue'}} onClick={() => window.location.href=`/showpost/${item.text}`}>Пересланный пост</p>
                    }

                    if (item.user === email) {
                        return <Element name={item.id} key={index} style={{marginLeft: 600, marginTop: 20}} onClick={(e) => {
                            if (item.controls === false) {
                                openMessControls(item.id)
                            } else {
                                e.stopPropagation()
                                if (props.messages) {
                                    const newMessages = props.messages.map(el => {
                                    return {
                                        ...el,
                                        controls: false,
                                    }
                                })
                                props.setMessages(newMessages)
                                }
                            }
                        }}>
                            <div>
                                {dateShow}
                                {item.per !== '' ? <p>Переслано от {item.per}</p> : null}
                                <p>{item.ans}</p>
                                {showMess}
                                {item.edit ? <p style={{scale: '70%'}}>Ред.</p> : null}
                                {item.photos.length !== 0 ? <ul style={{listStyle: 'none'}}>
                                {item.photos.map((el, index) => 
                                <li key={index}>
                                    {el.includes('image') ? <img src={el} width={150} height={150} onClick={() => {
                                    setImgArr(item.photos)
                                    setStartIndex(index)
                                    }}/> : <video src={el} width={200} height={200} controls/>}
                                </li>
                                )}
                                </ul> : null}
                                {item.controls ? <div><img src='https://avatars.mds.yandex.net/i?id=a6fcfdf2bd0a086ba7c6f917c6c7f317f1190054-10703429-images-thumbs&n=13' width={20} height={20} onClick={async() => {
                                    const messId = item.id
                                    const deleteMess = await fetch('http://localhost:4000/users-controller/delete/mess', {
                                        method: "PATCH",
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({ email, trueParamEmail, index, messId })
                                    })
                                    const resultMess = await deleteMess.json()
                                    props.setMessages(resultMess)
                                }}/>
                                <button onClick={() => {
                                    if (item.typeMess === 'text') {
                                        if (item.text !== '') {
                                            props.setAnswMess(item.text)
                                        } else {
                                            props.setAnswMess('Фото')
                                        }
                                    } else if (item.typeMess === 'voice') {
                                        props.setAnswMess('Голосовое сообщение')
                                    } else if (item.typeMess === 'gif') {
                                        props.setAnswMess('GIF')
                                    }
                                }}>Ответить</button>
                                {(item.typeMess === 'text' && item.text !== '') ? <button onClick={() => {
                                    props.setEditMess(item.id)
                                    props.setInputMess(item.text)
                                }}>Редактировать</button> : null}
                                <ShareBtn text={item.text} photos={item.photos} date={item.date} id={item.id} typeMess={item.typeMess} per={item.per} email={props.email} user={item.user}/>
                                {item.typeMess === 'text' ? <button onClick={async() => {
                                    navigator.clipboard.writeText(item.text)
                                    props.setSucCopy(true)
                                }}>Копировать</button> : null}
                                </div> : null}
                            </div>
                        </Element>
                    } else {
                        return <Element name={item.id} key={index} style={{marginTop: 20}} onClick={(e) => {
                            if (item.controls === false) {
                                openMessControls(item.id)
                            } else {
                                e.stopPropagation()
                                if (props.messages) {
                                    const newMessages = props.messages.map(el => {
                                    return {
                                        ...el,
                                        controls: false,
                                    }
                                })
                                props.setMessages(newMessages)
                                }
                            }
                        }}>
                            <div>
                                {dateShow}
                                {item.per !== '' ? <p>Переслано от {item.per}</p> : null}
                                <p>{item.ans}</p>
                                {showMess}
                                {item.edit ? <p style={{scale: '70%'}}>Ред.</p> : null}
                                {item.photos.length !== 0 ? <ul style={{listStyle: 'none'}}>
                                    {item.photos.map((el, index) => <li key={index}><img src={el} width={150} height={150} onClick={() => {
                                        setImgArr(item.photos)
                                        setStartIndex(index)
                                    }}/></li>)}
                                </ul> : null}
                                {item.controls ? <div>
                                    <ShareBtn text={item.text} photos={item.photos} date={item.date} id={item.id} typeMess={item.typeMess} per={item.per} email={props.email} user={item.user}/>
                                    <button onClick={() => {
                                    if (item.typeMess === 'text') {
                                        if (item.text !== '') {
                                            props.setAnswMess(item.text)
                                        } else {
                                            props.setAnswMess('Фото')
                                        }
                                    } else if (item.typeMess === 'voice') {
                                        props.setAnswMess('Голосовое сообщение')
                                    } else if (item.typeMess === 'gif') {
                                        props.setAnswMess('GIF')
                                    }
                                }}>Ответить</button>
                                {item.typeMess === 'text' ? <button onClick={async() => {
                                    navigator.clipboard.writeText(item.text)
                                    props.setSucCopy(true)
                                }}>Копировать</button> : null}
                                </div> : null}
                            </div>
                        </Element>
                    }
                })}
        </div>
    )
}

export default memo(MessDisplay)