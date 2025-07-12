import Link from "next/link"
import styles from './HomeBtn.module.css';

const HomeBtn = () => {
    
    return (
        <button className={styles.butt} onClick={() => {
            if (localStorage.getItem('photogram-enter')) {
                window.location.href='/'
            } else {
                window.location.href='/'
            }
        }}>На домашнюю</button>
    )
}

export default HomeBtn