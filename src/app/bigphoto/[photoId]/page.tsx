'use client'

import { useParams } from 'next/navigation'; 
import { ChangeEvent, useEffect, useState } from 'react';
import { BeatLoader } from 'react-spinners';
import Comment from '@/app/CommentInterface';
import useGetEmail from '@/app/useGetEmail';
import Photo from '@/app/PhotoInterface';
import useCheckReg from '@/app/CheckReg';
import useNotif from '@/app/useNotif';
import styles from '../BigPhoto.module.css'
import Call from '@/app/Call';
import useOnlineStatus from '@/app/useOnlineStatus';
import getGifs from '@/app/chats/[email]/getGifs';
import { v4 as uuidv4 } from 'uuid';

const BigPhoto = () => {
    const {} = useNotif()
    const { trueEmail } = useGetEmail()
    const {} = useCheckReg()
    const {} = useOnlineStatus()

    const params = useParams();

    const [sendStatus, setSendStatus] = useState <boolean> (false)
    const [showGifs, setShowGifs] = useState <boolean> (false)
    const [gifs, setGifs] = useState <string[]> ([])
    const [url, setUrl] = useState<string>('');
    const [photoInfo, setPhotoInfo] = useState<Photo | null>(null)
    const [rotateDeg, setRotateDeg] = useState<number>(0)
    const [commentInput, setCommentInput] = useState<string>('')
    const [comments, setComments] = useState<Comment[]>([])

    let permCommentsBtn;
    let showComments;
    let commentsShow;
    let gifsInter;

    const permComments = async (perm: boolean) => {
        const photoId = photoInfo?.id
        const changeCommentsPerm = await fetch('http://localhost:4000/photos/perm/comments', {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ photoId, perm }),
            credentials: 'include',
        })
        const resultChangePerm = await changeCommentsPerm.text()
        if (resultChangePerm === 'OK') {
            if (photoInfo) {
                setPhotoInfo({...photoInfo, commentsPerm: perm})
            }
        }
    }

    const newComment = async (type: string, gifUrl?: string) => {
        let comment: string = ''
        if (gifUrl) {
            comment = gifUrl
        } else {
            comment = commentInput
        }
        setSendStatus(true)
        const getUserName = await fetch(`http://localhost:4000/users-controller/get/user/name/${trueEmail}`)
        const resultName = await getUserName.text()
        const targetId = params.photoId
        const commentId: string = uuidv4()
        const addComment = await fetch('http://localhost:4000/photos/new/comment', {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ targetId, comment, type, commentId }),
            credentials: 'include',
        })
        const resultAdd = await addComment.text()
        if (resultAdd === 'OK') {
            if (photoInfo) {
                const newComment = {user: trueEmail, userName: resultName, comment: comment, type: type, id: commentId}
                setPhotoInfo({...photoInfo, comments: [...photoInfo.comments, newComment]})
                setComments([...comments, newComment])
                if (type === 'text') {
                    setCommentInput('')
                } else {
                    setShowGifs(false)
                }
                setSendStatus(false)
            }
        }
    }

    if (showGifs) {
        gifsInter = <ul>
            {gifs.map((item, index) => <li key={index}><img src={item} width={50} height={50} onClick={() => {
                newComment('gif', item)
            }}/></li>)}
        </ul>
    }

    if (photoInfo?.email === trueEmail) {
        if (photoInfo.commentsPerm === true) {
            permCommentsBtn = <button className={styles.permCommentsButton} onClick={() => permComments(false)}>Запретить комментарии</button>
        } else if (photoInfo.commentsPerm === false) {
            permCommentsBtn = <button className={styles.permCommentsButton} onClick={() => permComments(true)}>Разрешить комментарии</button>
        }
    }

    if (comments.length === 0) {
        commentsShow = <p>Комментариев пока нет</p>
    } else {
        commentsShow = <ul className={styles.commentsList}>
            {comments.map((item, index) => (
                <li key={index} className={styles.commentItem}>
                    <div>
                        <p className={styles.userLink} onClick={() => window.location.href=`/${item.user}`}>
                            {item.user} ({item.userName})
                        </p>
                        {item.type === 'text' ? <p className={styles.commentText}>{item.comment}</p> : <img src={item.comment} width={50} height={50}/>}
                        <div>
                        <button 
                            className={styles.translateButton}
                            onClick={async() => {
                                const translateComment = await fetch(`https://api.mymemory.translated.net/get?q=${item.comment}&langpair=en|ru`)
                                const result = await translateComment.json()
                                const resultComments = comments.map(el => {
                                    if (el.comment === item.comment) {
                                        return {...el, comment: result.responseData.translatedText}
                                    } else {
                                        return el
                                    }
                                })
                                setComments(resultComments)
                            }}
                        >
                            Перевести
                        </button>
                        {trueEmail === item.user ? <button className={styles.deleteButton} onClick={async() => {
                            const photoId = photoInfo?.id
                            const commentId = item.id
                            const deleteComment = await fetch('http://localhost:4000/photos/delete/comment', {
                                method: "PATCH",
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ photoId, commentId }),
                                credentials: 'include',
                            })
                            const resultDelete = await deleteComment.text()
                            if (resultDelete === 'OK') {
                                if (photoInfo) {
                                    const resultComments = photoInfo.comments.map(el => {
                                        if (el.id === commentId) {
                                            return false
                                        } else {
                                            return el
                                        }
                                    }).filter(el => el !== false)
                                    setPhotoInfo({...photoInfo, comments: resultComments})
                                    setComments(resultComments)
                                }
                            }
                        }}>Удалить</button> : null}
                        </div>
                    </div>
                </li>
            ))}
        </ul>
    }

    if (photoInfo) {
        if (photoInfo?.commentsPerm === true) {
            showComments = <div>
                <h3 className={styles.commentsHeader}>Комментарии</h3>
                <input 
                    className={styles.commentInput}
                    placeholder='Ваш комментарий' 
                    value={commentInput} 
                    onChange={(event: ChangeEvent<HTMLInputElement>) => setCommentInput(event.target.value)}
                />
                <button onClick={() => setShowGifs(!showGifs)}>GIF</button>
                {gifsInter}
                {sendStatus === false ? <button 
                    className={styles.sendButton}
                    onClick={async() => {
                        if (commentInput !== '') {
                            newComment('text')
                        }
                    }}
                >
                    Отправить
                </button> : <p>Отправка...</p>}
                {commentsShow}
            </div>
        } else {
            showComments = <p className={styles.commentsDisabled}>Комментирование этой записи ограничено</p>
        }
    }

    useEffect(() => {
        const findParamPhoto = async () => {
            const findPhotoByParam = await fetch(`http://localhost:4000/photos/big/photo/${params.photoId}`);
            const imageUrl = await findPhotoByParam.blob();
            setUrl(URL.createObjectURL(imageUrl));
        };
        const getPhotoInfo = async () => {
            const findPhotoByParam = await fetch(`http://localhost:4000/photos/big/photo/info/${params.photoId}`);
            const resultInfo = await findPhotoByParam.json()
            setPhotoInfo(resultInfo)
        }
        findParamPhoto()
        getPhotoInfo()
    }, []);

    useEffect(() => {
        const getComments = async () => {
            const comments = await fetch(`http://localhost:4000/photos/comments/${params.photoId}`)
            const resultComments = await comments.json()
            setComments(resultComments)
        }
        getComments()
    }, [])

    useEffect(() => {
        const getFifsForComment = async () => {
            const resultGifs = await getGifs()
            const finalGifs = resultGifs.slice(0, 5)
            setGifs(finalGifs)
        }
        getFifsForComment()
    }, [])

    return (
        <div className={styles.container}>
            <Call/>
            {url ? (
                <>
                    <div className={styles.photoContainer}>
                        <img 
                            src={url} 
                            className={styles.photo} 
                            style={{ transform: `rotate(${rotateDeg}deg)` }} 
                            alt="Full-size photo"
                        />
                        <img 
                            src='/images/png-clipart-computer-icons-button-internet-software-as-a-service-flip-over-angle-text-thumbnail.png' 
                            className={styles.rotateButton}
                            onClick={() => setRotateDeg(rotateDeg + 90)}
                            alt="Rotate"
                        />
                    </div>
                    <div className={styles.sidebar}>
                        {permCommentsBtn}
                        {showComments}
                    </div>
                </>
            ) : (
                <div className={styles.loadingOverlay}>
                    <BeatLoader 
                        color="#4CAF50" 
                        size={30}
                        speedMultiplier={0.8}
                    />
                </div>
            )}
        </div>
    );
};

export default BigPhoto;