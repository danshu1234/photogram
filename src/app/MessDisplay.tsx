'use client'

import { FC, useState, memo } from "react"
import { Message } from "@/app/Chat"
import ImgList from "./ImgList"
import ShareBtn from "./ShareBtn"
import { Element } from 'react-scroll'
import "./MessDisplay.css"

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
        imgList = <div className="image-modal-overlay" onClick={() => setImgArr([])}>
            <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="image-modal-close" onClick={() => setImgArr([])}>×</button>
                <ImgList imgArr={imgArr} startIndex={startIndex} setStartIndex={setStartIndex}/>
            </div>
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
        <div className="messages-display">
            {imgList}
            {props.messages?.map((item, index) => {
                const email = props.email
                const trueParamEmail = props.trueParamEmail
                let dateShow;
                if (props.messages) {
                    if (index === 0 || props.messages[index - 1].date !== item.date) {
                    dateShow = <div className="message-date-divider">{item.date}</div>
                }
                }

                let showMess;

                if (item.typeMess === 'text') {
                    showMess = <p className="message-text">{item.text}</p>
                } else if (item.typeMess === 'voice') {
                    showMess = <audio src={item.text} controls className="voice-message"/>
                } else if (item.typeMess === 'gif') {
                    showMess = <img src={item.text} className="gif-message"/>
                } else if (item.typeMess === 'post') {
                    showMess = <p className="post-message" onClick={() => window.location.href=`/showpost/${item.text}`}>Пересланный пост</p>
                }

                const messageClass = item.user === email ? "message my-message" : "message their-message"

                return (
                    <Element name={item.id} key={index} className={messageClass} onClick={(e) => {
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
                        <div className="message-content">
                            {dateShow}
                            {item.per !== '' && <div className="forwarded-from">Переслано от {item.per}</div>}
                            {item.ans && <div className="reply-preview">{item.ans}</div>}
                            
                            <div className="message-body">
                                {showMess}
                                {item.edit && <span className="edited-badge">Ред.</span>}
                            </div>

                            {item.photos.length !== 0 && (
                                <div className="message-photos">
                                    {item.photos.map((el, index) => (
                                        <div key={index} className="photo-thumbnail">
                                            {el.includes('image') ? (
                                                <img src={el} onClick={() => {
                                                    setImgArr(item.photos)
                                                    setStartIndex(index)
                                                }}/>
                                            ) : (
                                                <video src={el} controls/>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {item.controls && (
                                <div className="message-controls">
                                    {item.user === email && (
                                        <button className="control-btn delete-btn" onClick={async() => {
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
                                        }}>
                                            🗑️
                                        </button>
                                    )}
                                    
                                    <button className="control-btn reply-btn" onClick={() => {
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
                                    }}>
                                        ↩️
                                    </button>

                                    {item.user === email && item.typeMess === 'text' && item.text !== '' && (
                                        <button className="control-btn edit-btn" onClick={() => {
                                            props.setEditMess(item.id)
                                            props.setInputMess(item.text)
                                        }}>
                                            ✏️
                                        </button>
                                    )}

                                    {item.photos.length === 0 ? <ShareBtn text={item.text} photos={item.photos} date={item.date} id={item.id} typeMess={item.typeMess} per={item.per} email={props.email} user={item.user}/> : null}
                          
                                    {item.typeMess === 'text' && item.text !== '' && (
                                        <button className="control-btn copy-btn" onClick={async() => {
                                            navigator.clipboard.writeText(item.text)
                                            props.setSucCopy(true)
                                        }}>
                                            📋
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </Element>
                )
            })}
        </div>
    )
}

export default memo(MessDisplay)