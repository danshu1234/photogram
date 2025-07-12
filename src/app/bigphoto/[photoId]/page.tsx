'use client'

import { useParams } from 'next/navigation'; 
import { ChangeEvent, useEffect, useState } from 'react';
import { BeatLoader } from 'react-spinners';
import Comment from '@/app/CommentInterface';
import useGetEmail from '@/app/useGetEmail';
import Stickers from '@/app/Stickers';
import Photo from '@/app/PhotoInterface';

const BigPhoto = () => {

    const { email } = useGetEmail()

    const params = useParams();
    const [url, setUrl] = useState<string>('');

    const [photoInfo, setPhotoInfo] = useState <Photo | null> (null)
    const [rotateDeg, setRotateDeg] = useState <number> (0)
    const [commentInput, setCommentInput] = useState <string> ('')
    const [stickers, setStickers] = useState <boolean> (false)
    let showStickers;
    let permCommentsBtn;
    let showComments;

    const permComments = async (perm: boolean) => {
        const photoId = photoInfo?.id
        await fetch('http://localhost:4000/photos/perm/comments', {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ photoId, perm })
        })
        window.location.reload()
    }

    if (photoInfo?.email === email) {
        if (photoInfo.commentsPerm === true) {
            permCommentsBtn = <button onClick={() => permComments(false)}>Запретить комментарии</button>
        } else if (photoInfo.commentsPerm === false) {
            permCommentsBtn = <button onClick={() => permComments(true)}>Разрешить комментарии</button>
        }
    }

    if (stickers) {
        showStickers = <Stickers setCommentInput={setCommentInput}/>
    }

    const [comments, setComments] = useState <Comment[]> ([])
    let commentsShow;

    if (comments.length === 0) {
        commentsShow = <p>Комментариев пока нет</p>
    } else {
        commentsShow = <ul>
            {comments.map((item, index) => {
                if (item.comment === '/smiles/d8360921a1e6bb4b0a756338aac17019.jpg' || item.comment === '/smiles/915cdd65844283f1332800b5ca2a8582.jpg' || item.comment === '/smiles/png-clipart-human-skin-color-emoji-thumb-signal-fitzpatrick-scale-emoji-hand-orange.png') {
                    return <li key={index}><div><p onClick={() => window.location.href=`/${item.user}`} style={{cursor: 'pointer'}}>{item.user} ({item.userName})</p><img src={item.comment} style={{width: 50, height: 50}}/></div></li>
                } else {
                    return <li key={index}><div>
                            <p onClick={() => window.location.href=`/${item.user}`} style={{cursor: 'pointer'}}>{item.user} ({item.userName})</p><p>{item.comment}</p>
                            <button onClick={async() => {
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
                            }}>Перевести</button>
                        </div></li>
                }
            })}
        </ul>
    }

    if (photoInfo) {
        if (photoInfo?.commentsPerm === true) {
        showComments = <div>
                        <h3>Comments</h3>
                        <input placeholder='Comment' value={commentInput} onChange={(event: ChangeEvent<HTMLInputElement>) => setCommentInput(event.target.value)}/>
                        {showStickers}
                        <p onClick={() => setStickers(!stickers)}>Стикеры</p>
                        <button onClick={async() => {
                            if (commentInput !== '') {
                                const getUserName = await fetch(`http://localhost:4000/users-controller/get/user/name/${email}`)
                                const resultName = await getUserName.text()

                                const targetId = params.photoId
                                const resultComment: Comment = {
                                    user: email,
                                    comment: commentInput,
                                    userName: resultName,
                                }
                                const addComment = await fetch('http://localhost:4000/photos/new/comment', {
                                    method: "PATCH",
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({ targetId, resultComment })
                                })
                                const resultAdd = await addComment.text()
                                if (resultAdd === 'OK') {
                                    window.location.reload()
                                    setCommentInput('')
                                    setStickers(false)
                                }
                            }
                        }}>Отправить</button>
                        {commentsShow}
        </div>
    } else {
        showComments = <p>Комментирование этой записи ограничена</p>
    }
    }

    useEffect(() => {
        const findParamPhoto = async () => {
            const findPhotoByParam = await fetch(`http://localhost:4000/photos/big/photo/${params.photoId}`);
            const imageUrl = await findPhotoByParam.json();
            const getIndexFromStorage = localStorage.getItem('photoIndex')
            let resultIndex = 0
            if (getIndexFromStorage) {
                resultIndex = JSON.parse(getIndexFromStorage)
            }
            setUrl(imageUrl.url[resultIndex]);
            setPhotoInfo(imageUrl.info)
        };
        findParamPhoto();
    }, []);

    useEffect(() => {
        const getComments = async () => {
            const comments = await  fetch(`http://localhost:4000/photos/comments/${params.photoId}`)
            const resultComments = await comments.json()
            setComments(resultComments)
        }
        getComments()
    })

    const loadingStyles = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
        position: 'fixed' as const,
        top: 0,
        left: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)'
    };

    const containerStyles = {
        display: 'flex',
        height: '100vh',
        width: '100vw', 
        backgroundColor: '#000'
    };

    const sidebarStyles = {
        width: '400px', 
        height: '100%',
        backgroundColor: 'aqua'
    };

    return (
        <div style={containerStyles}>
            {url ? (
                <>
                    <img src={url} style={{width: 'calc(100% - 400px)', height: '100%', objectFit: 'contain' as const, rotate: `${rotateDeg}deg`}} alt="Full-size photo"/>
                    <img src='https://avatars.mds.yandex.net/i?id=4dee206df6b3bf78b5699f98e7a2235e7772ecc6-7732367-images-thumbs&n=13' width={40} height={40} onClick={() => setRotateDeg(rotateDeg + 90)}/>
                    <div style={sidebarStyles}>
                        {permCommentsBtn}
                        {showComments}
                    </div>
                </>
            ) : (
                <div style={loadingStyles}>
                    <BeatLoader 
                        color="#ff6b6b" 
                        size={30}
                        speedMultiplier={0.8}
                    />
                </div>
            )}
        </div>
    );
};

export default BigPhoto;