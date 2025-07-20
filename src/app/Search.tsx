'use client'

import { ChangeEvent, FC, useState, memo } from "react"
import styles from './Search.module.css'

const Search: FC = () => {

    const [inputLogin, setInputLogin] = useState<string>('')

    const handleSearch = () => {
        if (inputLogin.trim() !== '') {
            window.location.href = `/${inputLogin}`
        }
    }

    return (
        <div className={styles.searchContainer}>
            <input
                className={styles.searchInput}
                placeholder="Найти пользователя по логину..."
                value={inputLogin}
                onChange={(event: ChangeEvent<HTMLInputElement>) => 
                    setInputLogin(event.target.value)
                }
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
                className={styles.searchButton}
                disabled={inputLogin.trim() === ''}
                onClick={handleSearch}
            >
                Найти
            </button>
        </div>
    )
}

export default memo(Search)