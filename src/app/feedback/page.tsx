'use client'

import useCheckReg from "../CheckReg"
import { QRCodeSVG } from "qrcode.react"
import styles from '../Feedback.module.css'

const Feedback = () => {
    const {} = useCheckReg()

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <QRCodeSVG 
                    value="t.me/PhotoGramFeedBackBot"
                    size={280}
                    bgColor="#ffffff"
                    fgColor="#3b82f6"
                    level="Q"
                    className={styles.qrcode}
                />
                <h1 className={styles.title}>Оставьте отзыв о нашем приложении!</h1>
                <p className={styles.subtitle}>Отсканируйте QR-код, чтобы перейти в Telegram-бота</p>
            </div>
        </div>
    )
}

export default Feedback