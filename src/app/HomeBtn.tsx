import Link from "next/link"
import styles from './HomeBtn.module.css';

const HomeBtn = () => {
    return (
        <Link href={'/'} className={styles.butt}>
            На домашнюю
        </Link>
    )
}

export default HomeBtn