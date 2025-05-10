'use client'

import { useParams } from 'next/navigation'; 
import { useEffect, useState } from 'react';
import { BeatLoader } from 'react-spinners';

const BigPhoto = () => {
    const params = useParams();
    const [url, setUrl] = useState<string>('');

    useEffect(() => {
        const findParamPhoto = async () => {
            const findPhotoByParam = await fetch(`http://localhost:4000/photos/big/photo/${params.photoId}`);
            const imageUrl = await findPhotoByParam.text();
            setUrl(imageUrl);
        };
        findParamPhoto();
    }, []);

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

    const imageStyles = {
        width: '100%',
        height: '100vh',
        objectFit: 'contain' as const,
        backgroundColor: '#000'
    };

    return (
        <div>
            {url ? (
                <img src={url} style={imageStyles} alt="Full-size photo" />
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