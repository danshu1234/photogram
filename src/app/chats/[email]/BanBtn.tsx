'use client'

import { ChangeEvent, FC, useEffect, useRef, useState } from "react"

interface BanBtnProps{
    trueParamEmail: string;
    banStatus: boolean;
}


const BanBtn: FC <BanBtnProps> = (props) => {

    return (
        <div>
            {props.banStatus === true ? <button className="ban-btn" onClick={async() => {
                const trueParamEmail = props.trueParamEmail
                await fetch('http://localhost:4000/users-controller/ban/user', {
                    method: "PATCH",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ trueParamEmail }),
                    credentials: 'include',
                })
                window.location.reload()
            }}>Заблокировать</button> : <button className="unban-btn" onClick={async() => {
                const trueParamEmail = props.trueParamEmail
                await fetch('http://localhost:4000/users-controller/unban/user', {
                    method: "PATCH",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ trueParamEmail }),
                    credentials: 'include',
                })
                window.location.reload()
            }}>Разблокировать</button>}
        </div>
    )
}

export default BanBtn