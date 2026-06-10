'use client'

import React, { FC, useState, memo, useEffect } from "react"
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
    setGeoLocation: Function;
    trueEmail: string;
    chatId: string;
    scrollToMessage: Function;
    deleteMess: string[] | null;
    setDeleteMess: Function;
}

const MessDisplay: FC <MessDisplayProps> = (props) => {

    const emoji: string[] = ['😂', '❤️', '🤣', '👍', '😭', '🙏', '😘', '🥰', '😍', '😊']

    const [photos, setPhotos] = useState <{id: string, photo: string}[]> ([])
    const [imgBig, setImgBig] = useState <string | null> (null)
    const [startIndex, setStartIndex] = useState <number> (0)
    let imgBigShow;

    if (imgBig !== null) {
        if (imgBig === '') {
            imgBigShow = <p>Загрузка...</p>
        } else {
            imgBigShow = <div>
                <p onClick={() => setImgBig(null)}>X</p>
                <img src={imgBig} width={300} height={300}/>
            </div>
        }
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

    const reaction = async (messId: string, emoji: string, type: string) => {
        let reactionsMess: any[] = []
        let messEmojies: string = ''
        const trueParamEmail = props.trueParamEmail
        if (props.messages) {
            const newMessages = props.messages.map(el => {
                if (el.id === messId) {
                    messEmojies = el.id
                    let resultReactions: any[] = []
                    if (type === 'reactionNew') {
                        resultReactions = [...el.reactions, {reaction: emoji, users: [props.trueEmail]}]
                        reactionsMess = resultReactions
                    } else if (type === 'addReaction') {
                        const emojiesMess = el.reactions.map(element => {
                            if (element.reaction === emoji) {
                                return {
                                    reaction: element.reaction,
                                    users: [...element.users, props.trueEmail]
                                }
                            } else {
                                return el
                            }
                        })
                        resultReactions = emojiesMess
                        reactionsMess = resultReactions
                    } else if (type === 'reactionDel') {
                        const emojiesMess = el.reactions.map(element => {
                            if (element.reaction === emoji) {
                                const reactionUsers = element.users.filter(user => user !== props.trueEmail)
                                if (reactionUsers.length !== 0) {
                                    return {
                                        reaction: element.reaction,
                                        users: reactionUsers,
                                    }
                                } else {
                                    return false
                                }
                            } else {
                                return element
                            }
                        })
                        const reusultMessEmojies = emojiesMess.filter(reaction => reaction !== false)
                        resultReactions = reusultMessEmojies
                        reactionsMess = resultReactions
                    }
                    return {
                        ...el,
                        reactions: resultReactions,
                    }
                } else {
                    return el
                }
            })
            props.setMessages(newMessages)
        }
        await fetch('http://localhost:4000/users-controller/new/reactions', {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json', 
            },
            body: JSON.stringify({ reactionsMess, messEmojies, trueParamEmail }),
            credentials: 'include',
        })
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
            {imgBigShow}
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
                    let resultSrc: string = ''
                    if (item.text.endsWith('.docx')) {
                        resultSrc = '/images/7271005.png'
                    } else if (item.text.endsWith('.xlsx')) {
                        resultSrc = '/images/9496502.png'
                    } else if (item.text.endsWith('.pdf')) {
                        resultSrc = '/images/0xpj6n9hwyvcgr2cbtz4smr9l128iht4.png'
                    }
                    showMess = <div onClick={async() => {
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
                    }}>
                        <img src={resultSrc} width={90} height={80}/>
                        <p>{item.text}</p>
                    </div>
                } else if (item.typeMess === 'geopos') {
                    showMess = <p onClick={() => {
                        const location = item.text.split(' ')
                        const latitude = Number(location[0])
                        const longitude = Number(location[1])
                        props.setGeoLocation({latitude: latitude, longitude: longitude})
                    }}>Геолокация</p>
                } else if (item.typeMess === 'vote') {
                    showMess = <div>
                        <p>{item.text}</p>
                        <ul>
                            {item.votes?.map((element, index) => {
                                let persentageUsers = 0
                                if (item.allUserVotes) {
                                    persentageUsers = (100 * element.users.length) / item.allUserVotes.length
                                }
                                return <li key={index}>
                                    <div>
                                        <p onClick={(async(event: React.MouseEvent) => {
                                            event.stopPropagation()
                                            if (!item.allUserVotes?.includes(props.trueEmail)) {
                                                const newMessages = props.messages?.map(message => {
                                                    if (message.id === item.id) {
                                                        const newVotes = message.votes?.map(vote => {
                                                            if (vote.id === element.id) {
                                                                return {
                                                                    id: element.id,
                                                                    option: vote.option,
                                                                    users: [...vote.users, props.trueEmail],
                                                                }
                                                            } else {
                                                                return vote
                                                            }
                                                        })
                                                        if (message.allUserVotes) {
                                                            return {
                                                                ...message,
                                                                votes: newVotes,
                                                                allUserVotes: [...message.allUserVotes, props.trueEmail]
                                                            }
                                                        }
                                                    } else {
                                                        return message
                                                    }
                                                })
                                                console.log('MESS: ')
                                                console.log(newMessages)
                                                props.setMessages(newMessages)
                                                const messId = item.id
                                                const voteId = element.id
                                                await fetch('http://localhost:4000/users-controller/vote/user', {
                                                    method: "PATCH",
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                    },
                                                    body: JSON.stringify({ trueParamEmail, messId, voteId }),
                                                    credentials: 'include',
                                                })
                                            }
                                        })}>{element.option}</p>
                                        {item.allUserVotes?.includes(props.trueEmail) ? <div>
                                            <p>{element.users.length}</p>
                                            <div style={{backgroundColor: 'green', height: 4, width: persentageUsers}}></div>
                                            <p>{(100 * element.users.length) / item.allUserVotes.length}%</p>
                                        </div> : null}
                                    </div>
                                </li>
                            })}
                        </ul>
                    </div>
                }

                let readStaus;
                
                if (item.user === props.trueEmail) {
                    if (item.read.find(el => el.read === true && el.user !== props.trueEmail)) {
                        readStaus = <img src='https://img.icons8.com/?size=100&id=0H26EziLCAhq&format=png&color=000000' width={30} height={30}/>
                    } else {
                        readStaus = <img src='https://img.icons8.com/?size=100&id=82769&format=png&color=000000' width={30} height={30}/>
                    }
                }

                const messageClass = item.user === email ? "message my-message" : "message their-message"

                return (
                    <Element name={item.id} key={index} className={messageClass} onClick={(e) => {
                        if (props.deleteMess === null) {
                            e.stopPropagation()
                            if (item.controls === false) {
                                openMessControls(item.id)
                            } else {
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
                        }
                    }}
                    onContextMenu={(event: React.MouseEvent) => {
                        event.preventDefault()
                        if (props.messages) {
                            const newMessages = props.messages.map(el => {
                                if (el.id === item.id) {
                                    return {
                                        ...el,
                                        emojies: true,
                                    }
                                } else {
                                    return {
                                        ...el,
                                        emojies: false,
                                    }
                                }
                            })
                            props.setMessages(newMessages)
                        }
                    }}
                    >
                        <div className="message-content">
                            {dateShow}
                            {(item.typeMess === 'vote' && item.allUserVotes?.includes(props.trueEmail)) ? <p onClick={(async(event: React.MouseEvent) => {
                                event.stopPropagation()
                                const messId = item.id
                                const newMessages = props.messages?.map(message => {
                                    if (message.id === item.id) {
                                        const newVotes = message.votes?.map(vote => {
                                            if (vote.users.includes(props.trueEmail)) {
                                                return {
                                                    ...vote,
                                                    users: vote.users.filter(user => user !== props.trueEmail)
                                                }
                                            } else {
                                                return vote
                                            }
                                        })
                                        return {
                                            ...message,
                                            votes: newVotes,
                                            allUserVotes: message.allUserVotes?.filter(element => element !== props.trueEmail)
                                        }
                                    } else {
                                        return message
                                    }
                                })
                                props.setMessages(newMessages)
                                await fetch('http://localhost:4000/users-controller/voice/revoke', {
                                    method: "PATCH",
                                    headers: {
                                        'Content-Type': 'application/json', 
                                    },
                                    body: JSON.stringify({ trueParamEmail, messId }),
                                    credentials: 'include',
                                }) 
                            })}>Отменить голос</p> : null}
                            {(item.user !== email && !props.trueParamEmail.includes('@')) ? <p>{item.user}</p> : null}
                            {item.per !== '' && <div className="forwarded-from">Переслано от {item.per}</div>}
                            {item.ans && <div className="reply-preview" onClick={() => props.scrollToMessage(item.ans?.id)}>{item.ans.text}</div>}
                            
                            <div className="message-body">
                                {showMess}
                                {item.edit && <span className="edited-badge">Ред.</span>}
                            </div>

                            {item.photos.length !== 0 && (
                                <div className="message-photos">
                                    {item.photos.map((el, indexPhoto) => (
                                        <div key={indexPhoto} className="photo-thumbnail">
                                            {(el.base64 !== '' && el.base64.includes('image')) ? 
                                                <img src={el.base64} onClick={async() => {
                                                    const messId = item.id
                                                    const photoId = el.id
                                                    const findPhoto = photos.find(el => el.id === photoId)
                                                    if (findPhoto) {
                                                        console.log('HERE')
                                                        setImgBig(findPhoto.photo)
                                                    } else {
                                                        const bigPhoto = await fetch('http://localhost:4000/users-controller/big/photos', {
                                                            method: "POST",
                                                            headers: {
                                                                'Content-Type': 'application/json', 
                                                            },
                                                            body: JSON.stringify({ messId, trueParamEmail, photoId }),
                                                            credentials: 'include',
                                                        })
                                                        const resultBigPhoto = await bigPhoto.blob();
                                                        const metadataHeader = bigPhoto.headers.get('X-Metadata');
                                                        if (metadataHeader) {
                                                            const idResultPhoto = JSON.parse(metadataHeader)
                                                            const bigPhoto = URL.createObjectURL(resultBigPhoto)
                                                            const newPhotos = [...photos, {id: idResultPhoto, photo: bigPhoto}]
                                                            setPhotos(newPhotos)
                                                            setImgBig(bigPhoto);
                                                        }
                                                    }
                                                }}/>
                                             : 
                                                <img src='/images/free-icon-graduation-pictures-8924667.png' width={80} height={80} onClick={async(event: React.MouseEvent) => {
                                                    event.stopPropagation()
                                                    const messId = item.id
                                                    const previewPhoto = await fetch('http://localhost:4000/users-controller/preview/photo', {
                                                        method: "POST",
                                                        headers: {
                                                            'Content-Type': 'application/json', 
                                                        },
                                                        body: JSON.stringify({ messId, trueParamEmail, indexPhoto }),
                                                        credentials: 'include',
                                                    })
                                                    const resultPreviewPhoto = await previewPhoto.text()
                                                    if (props.messages) {
                                                        const newMessages = props.messages.map(el => {
                                                            if (el.id === item.id) {
                                                                const messPhotos = el.photos.map((element, photoIndex) => {
                                                                    if (photoIndex === indexPhoto) {
                                                                        return {
                                                                            base64: resultPreviewPhoto,
                                                                            id: element.id,
                                                                        }
                                                                    } else {
                                                                        return element
                                                                    }
                                                                })
                                                                return {
                                                                    ...el,
                                                                    photos: messPhotos,
                                                                }
                                                            } else {
                                                                return el
                                                            }
                                                        })
                                                        console.log('Messages: ')
                                                        console.log(newMessages)
                                                        props.setMessages(newMessages)
                                                    }
                                                }}/>
                                            }
                                        </div>
                                    ))}
                                </div>
                            )}

                            <p>{resultTime}</p>

                            {item.emojies === true ? <div>
                                <ul>
                                    {emoji.map((element, index) => {
                                        if (!item.reactions.find(el => el.reaction === element)) {
                                            return <li key={index} onClick={async(event: React.MouseEvent) => {
                                                event.stopPropagation()
                                                reaction(item.id, element, 'reactionNew')
                                            }}>{element}</li>
                                        }
                                    })}
                                </ul>
                            </div> : null}

                            {item.reactions.length !== 0 ? <div>
                                <ul>
                                    {item.reactions.map((element, index) => {
                                        return <li key={index}>
                                            {element.users.includes(props.trueEmail) ? <div>
                                                <p onClick={(event: React.MouseEvent) => {
                                                    event.stopPropagation()
                                                    reaction(item.id, element.reaction, 'reactionDel')
                                                }}>{element.reaction}</p>
                                                <p>{element.users.length}</p>
                                            </div> : <div>
                                                <p onClick={(event: React.MouseEvent) => {
                                                    event.stopPropagation()
                                                    reaction(item.id, element.reaction, 'addReaction')
                                                }}>{element.reaction}</p>
                                                <p>{element.users.length}</p>
                                            </div>}
                                        </li>
                                    })}
                                </ul>
                            </div> : null}

                            {props.deleteMess ? <input type="checkbox" onChange={() => {
                                if (props.deleteMess) {
                                    if (!props.deleteMess?.includes(item.id)) {
                                        const newDeleteMess = [...props.deleteMess, item.id]
                                        props.setDeleteMess(newDeleteMess)
                                    } else {
                                        const newDeleteMess = props.deleteMess?.filter(element => element !== item.id)
                                        props.setDeleteMess(newDeleteMess)
                                    }
                                }
                            }}/> : null}

                            {item.controls && (
                                <div className="message-controls">
                                    {item.user === email && (
                                        <button className="control-btn delete-btn" onClick={async() => {
                                            const messId = [item.id]
                                            const readStatus = item.read
                                            const deleteMess = await fetch('http://localhost:4000/users-controller/delete/mess', {
                                                method: "PATCH",
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                },
                                                body: JSON.stringify({ trueParamEmail, messId, readStatus }),
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
                                                props.setAnswMess({text: item.text, id: item.id})
                                            } else {
                                                props.setAnswMess({text: 'Фото', id: item.id})
                                            }
                                        } else if (item.typeMess === 'voice') {
                                            props.setAnswMess({text: 'Голосовое сообщение', id: item.id})
                                        } else if (item.typeMess === 'gif') {
                                            props.setAnswMess({text: 'GIF', id: item.id})
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

                                    {item.per === '' ? <ShareBtn text={item.text} date={item.date} id={item.id} typeMess={item.typeMess} per={item.per} email={props.email} user={item.user} trueParamEmail={trueParamEmail} chatId={props.chatId}/> : null}
                          
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