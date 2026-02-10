'use client'

import { FC, useState, memo, useEffect } from "react"
import { Message } from "@/app/Chat"
import ImgList from "./ImgList"
import ShareBtn from "./ShareBtn"
import { Element } from 'react-scroll'
import "./MessDisplay.css"
import backUpMess from "./backupMess"
import Download from "./Download"
import PinMessInter from "./chats/PinMessInter"
import { RingLoader } from "react-spinners"
import JSZip from "jszip"

interface MessDisplayProps{
    messages: Message[] | null;
    email: string;
    trueParamEmail: string;
    pinMess: PinMessInter | null;
    setPinMess: Function;
    setMessages: Function;
    setAnswMess: Function;
    setEditMess: Function;
    setInputMess: Function;
    setSucCopy: Function;
    setVideoMessId: Function;
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
                <Download downloadFile={imgArr[startIndex]}/>
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

    const pinMess = async (messId: string, pin: boolean) => {
        const trueParamEmail = props.trueParamEmail
        const messPin = await fetch('http://localhost:4000/users-controller/pin/mess', {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ messId, pin, trueParamEmail }),
            credentials: 'include',
        })
        const resultMessPin = await messPin.text()
        if (resultMessPin === 'OK') {
            if (props.messages) {
                const newMess = props.messages.map(el => {
                    if (el.id === messId) {
                        return {...el, pin: pin}
                    } else {
                        return el
                    }
                })
                props.setMessages(newMess)
            }
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
                
                const date = new Date(Number(item.id))
                const hours = date.getHours().toString().padStart(2, '0')
                const minutes = date.getMinutes().toString().padStart(2, '0')
                const resultTime = `${hours}:${minutes}`

                let showMess;

                if (item.typeMess === 'text') {
                    showMess = <p className="message-text">{item.text}</p>
                } else if (item.typeMess === 'voice') {
                    showMess = <audio src={item.text} controls className="voice-message"/>
                } else if (item.typeMess === 'gif') {
                    showMess = <img src={item.text} className="gif-message"/>
                } else if (item.typeMess === 'post') {
                    showMess = <p className="post-message" onClick={() => window.location.href=`/showpost/${item.text}`}>Пересланный пост</p>
                } else if (item.typeMess === 'video') {
                    showMess = <p onClick={() => {
                        if (item.sending === false) {
                            console.log('Here')
                            props.setVideoMessId(item.text)
                        }
                    }}>Видеозапись</p>
                } else if (item.typeMess === 'file') {
                    showMess = <p onClick={async() => {
                        const messId = item.id
                        const file = await fetch('http://localhost:4000/users-controller/get/file', {
                            method: "POST",
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ trueParamEmail, messId }),
                            credentials: 'include',
                        })
                        const resultFile = await file.blob()
                        const url = URL.createObjectURL(resultFile);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = item.text; 
                        a.click();
                        URL.revokeObjectURL(url);
                    }}>Файл</p>
                }

                let readStaus;
                
                if (item.user !== trueParamEmail) {
                    if (item.read === true) {
                        readStaus = <img src='https://img.icons8.com/?size=100&id=0H26EziLCAhq&format=png&color=000000' width={30} height={30}/>
                    } else {
                        readStaus = <img src='https://img.icons8.com/?size=100&id=82769&format=png&color=000000' width={30} height={30}/>
                    }
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
                                            {el.base64.includes('image') ? (
                                                <img src={el.base64} onClick={async() => {
                                                    const messId = item.id
                                                    const bigPhotos = await fetch('http://localhost:4000/users-controller/big/photos', {
                                                        method: "POST",
                                                        headers: {
                                                            'Content-Type': 'application/json', 
                                                        },
                                                        body: JSON.stringify({ messId, trueParamEmail }),
                                                        credentials: 'include',
                                                    })
                                                    const zipBlob = await bigPhotos.blob()
                                                    const zip = new JSZip();
                                                    const zipContent = await zip.loadAsync(zipBlob)
                                                    const photoPromises: Promise<{name: string, base64: string}>[] = []
                                                    const blobToBase64 = (blob: Blob): Promise<string | ArrayBuffer | null> => {
                                                        return new Promise((resolve, reject) => {
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => resolve(reader.result);
                                                            reader.onerror = reject;
                                                            reader.readAsDataURL(blob);
                                                        })
                                                    }
                                                    zipContent.forEach((relativePath, zipEntry) => {
                                                    if (!zipEntry.dir) { 
                                                            const promise = (async () => {
                                                                const fileBlob = await zipEntry.async('blob');
                                                                const base64 = await blobToBase64(fileBlob);
                                                                return {
                                                                    name: zipEntry.name,
                                                                    base64: base64 as string
                                                                }
                                                            })()
                                                            photoPromises.push(promise);
                                                        }
                                                    })
                                                    const photos = await Promise.all(photoPromises)
                                                    const resultPhotos = photos.map(el => el.base64)
                                                    setImgArr(resultPhotos)
                                                    setStartIndex(index)
                                                }}/>
                                            ) : (
                                                null
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <p>{resultTime}</p>

                            {item.controls && (
                                <div className="message-controls">
                                    {item.user === email && (
                                        <button className="control-btn delete-btn" onClick={async() => {
                                            const messId = [item.id]
                                            let unreadCount: number = 0
                                            if (item.read !== true) {
                                                unreadCount = 1
                                            }
                                            const deleteMess = await fetch('http://localhost:4000/users-controller/delete/mess', {
                                                method: "PATCH",
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                },
                                                body: JSON.stringify({ trueParamEmail, messId, unreadCount }),
                                                credentials: 'include',
                                            })
                                            const resultDelete = await deleteMess.text()
                                            if (resultDelete !== 'OK') {
                                                const resultBackupMess = backUpMess(props.messages, messId)
                                                props.setMessages(resultBackupMess)
                                            } else {
                                                const resultMessages = props.messages?.filter(el => el.id !== messId[0])
                                                props.setMessages(resultMessages)
                                            }
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

                                    {item.per === '' ? <ShareBtn text={item.text} date={item.date} id={item.id} typeMess={item.typeMess} per={item.per} email={props.email} user={item.user} trueParamEmail={trueParamEmail}/> : null}
                          
                                    {item.typeMess === 'text' && item.text !== '' && (
                                        <button className="control-btn copy-btn" onClick={async() => {
                                            navigator.clipboard.writeText(item.text)
                                            props.setSucCopy(true)
                                        }}>
                                            📋
                                        </button>
                                    )}

                                    {item.pin === false ? <button onClick={() => {
                                        pinMess(item.id, true)
                                        if (props.pinMess) {
                                            props.setPinMess({pinMessages: [...props.pinMess.pinMessages, item], messIndex: props.pinMess.pinMessages.length, direction: props.pinMess.direction})
                                        } else {
                                            props.setPinMess({pinMessages: [item], messIndex: 0, direction: 'down'})
                                        }
                                    }}>Закрепить</button> : <button onClick={() => {
                                        pinMess(item.id, false)
                                        const newPinMess = props.pinMess?.pinMessages.filter(el => el.id !== item.id)
                                        if (props.pinMess) {
                                            if (newPinMess?.length !== 0) {
                                                props.setPinMess({pinMessages: props.pinMess.pinMessages.filter(el => el.id !== item.id), messIndex: props.pinMess.messIndex - 1, direction: props.pinMess.direction})
                                            } else {
                                                props.setPinMess(null)
                                            }
                                        }
                                    }}>Открепить</button>}
                                </div>
                            )}
                        </div>
                        {readStaus}
                        {item.sending ? <RingLoader/> : null}
                    </Element>
                )
            })}
        </div>
    )
}

export default memo(MessDisplay)