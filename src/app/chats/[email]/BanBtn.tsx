'use client'

import { ChangeEvent, FC, useEffect, useRef, useState } from "react"

interface BanBtnProps{
    trueParamEmail: string;
    banStatus: boolean;
    myBanArr: string[];
    setMyBanArr: Function;
}


const BanBtn: FC <BanBtnProps> = (props) => {

    return (
        <div> 
            <button className="ban-btn" onClick={async() => {
                const trueParamEmail = props.trueParamEmail
                const banStatus = props.banStatus
                console.log('Ban status: ')
                console.log(props.banStatus)
                if (props.banStatus === true) {
                    props.setMyBanArr([...props.myBanArr, trueParamEmail])
                } else {
                    props.setMyBanArr(props.myBanArr.filter(el => el !== trueParamEmail))
                }
                await fetch('http://localhost:4000/users-controller/ban/unban/user', {
                    method: "PATCH",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ trueParamEmail, banStatus }),
                    credentials: 'include',
                })
            }}>{props.banStatus === true ? 'Заблокировать' : 'Разблокировать'}</button>
        </div>
    )
}

export default BanBtn