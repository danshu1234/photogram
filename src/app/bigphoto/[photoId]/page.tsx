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

const BigPhoto = () => {
    const {} = useNotif()
    const { trueEmail } = useGetEmail()
    const {} = useCheckReg()
    const params = useParams();
    const [url, setUrl] = useState<string>('');
    const [photoInfo, setPhotoInfo] = useState<Photo | null>(null)
    const [rotateDeg, setRotateDeg] = useState<number>(0)
    const [commentInput, setCommentInput] = useState<string>('')
    const [comments, setComments] = useState<Comment[]>([])

    let permCommentsBtn;
    let showComments;
    let commentsShow;

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
                        <p className={styles.commentText}>{item.comment}</p>
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
                            const comment = item.comment
                            const deleteComment = await fetch('http://localhost:4000/photos/delete/comment', {
                                method: "PATCH",
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ photoId, comment }),
                                credentials: 'include',
                            })
                            const resultDelete = await deleteComment.text()
                            if (resultDelete === 'OK') {
                                if (photoInfo) {
                                    const resultComments = photoInfo.comments.map(el => {
                                        if (el.user === trueEmail && el.comment === item.comment) {
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
                <button 
                    className={styles.sendButton}
                    onClick={async() => {
                        if (commentInput !== '') {
                            const getUserName = await fetch(`http://localhost:4000/users-controller/get/user/name/${trueEmail}`)
                            const resultName = await getUserName.text()
                            const targetId = params.photoId
                            const addComment = await fetch('http://localhost:4000/photos/new/comment', {
                                method: "PATCH",
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ targetId, commentInput }),
                                credentials: 'include',
                            })
                            const resultAdd = await addComment.text()
                            if (resultAdd === 'OK') {
                                if (photoInfo) {
                                    const newComment = {user: trueEmail, userName: resultName, comment: commentInput}
                                    setPhotoInfo({...photoInfo, comments: [...photoInfo.comments, newComment]})
                                    setComments([...comments, newComment])
                                    setCommentInput('')
                                }
                            }
                        }
                    }}
                >
                    Отправить
                </button>
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

    return (
        <div className={styles.container}>
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