'use client'

import { FC, useEffect, useState } from "react";
import useGetEmail from "../useGetEmail";
import { PacmanLoader } from "react-spinners";
import useCheckReg from "../CheckReg";
import styles from "./MySubsList.module.css";
import useNotif from "../useNotif";
import useOnlineStatus from "../useOnlineStatus";

const MySubsList: FC = () => {

    const {} = useNotif()
    const {} = useCheckReg()
    const { trueEmail } = useGetEmail()
    const {} = useOnlineStatus()

    const [subsList, setSubsList] = useState<string[]>([])
    let list;

    if (subsList.length === 0) {
        list = (
            <div className={styles.loaderContainer}>
                <PacmanLoader color="#ff7979" size={25} />
            </div>
        )
    } else {
        list = (
            <ul className={styles.subsList}>
                {subsList.map((item, index) => (
                    <li key={index} className={styles.subItem} onClick={() => window.location.href=`/${item}`}>
                        <span className={styles.subText}>{item}</span>
                    </li>
                ))}
            </ul>
        )
    }

    useEffect(() => {
        if (trueEmail !== '') {
            const getSubsList = async () => {
                const getAllSubs = await fetch('http://localhost:4000/users-controller/all/subs/and/country', {
                    method: "GET",
                    credentials: 'include',
                })
                const resultSubs = await getAllSubs.json()
                const result = resultSubs.subscribes.slice(1, resultSubs.length)
                setSubsList(result)
            }
            getSubsList()
        }
    }, [trueEmail])

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Мои подписчики</h1>
            {list}
        </div>
    )
}

export default MySubsList