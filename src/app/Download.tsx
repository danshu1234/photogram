'use client'

import { ChangeEvent, FC, useEffect, useState } from "react";

interface Props{
    downloadFile: string
}

const Download: FC <Props> = (props) => {
    
    return (
        <div>
            <p onClick={() => {
                const link = document.createElement('a');
                link.href = props.downloadFile;
                link.download = 'media';
                link.click();
                URL.revokeObjectURL(props.downloadFile);
            }}>Скачать</p>
        </div>
    )

}

export default Download