import Link from "next/link"
import styles from './HomeBtn.module.css';

const HomeBtn = () => {
    
    return (
        <button className={styles.butt} onClick={() => {
            if (localStorage.getItem('photogram-enter')) {
                window.location.href='/home'
            } else {
                window.location.href='/home'
            }
        }}>На домашнюю</button>
    )
}

export default HomeBtn