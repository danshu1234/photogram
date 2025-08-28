'use client'

import { ChangeEvent, FC, useEffect, useRef, useState } from "react"

const Testing: FC = () => {

    const someText = 'Сразу отметим, что в статье собраны решения, которые в целом работают, но, судя по многочисленным комментариям пользователей на разных ресурсах, кому-то они помогают, а для кого-то оказываются бесполезными. И это не удивительно, ведь на самом деле есть только один вариант, который гарантирует 100%-ный результат – активация операционной системы одним из разрешенных Microsoft способов. https://web.telegram.org/k/ Существует по крайне два метода удалить водяной знак путем изменения параметров системного реестра. И первым рассмотрим тот, который мы смогли проверить на практике. https://dzen.ru/.'

    const [resultWords, setResultWords] = useState<string[]> ([])

    useEffect(() => {
        const newWordsArr = someText.split(' ')
        let resultWordsArr = []
        for (let item of newWordsArr) {
            if (item[item.length - 1] === '.' || item[item.length - 1] === ',') {
                resultWordsArr.push(item.slice(0, item.length - 1))
                resultWordsArr.push(item[item.length - 1])
            } else {
                resultWordsArr.push(item)
            }
        }
        setResultWords(resultWordsArr)
    }, [])

    return (
        <div>
            {resultWords.length !== 0 ? <p>
                {resultWords.map((item, index) => {
                    if (item.slice(0, 4) === 'http') {
                        if (resultWords[index + 1] === '.' || resultWords[index + 1] === ',') {
                            return <span style={{color: 'blue', cursor: 'pointer'}} onClick={() => window.location.href=`${item}`} key={index}>{item}</span>
                        } else {
                            return <span style={{color: 'blue', cursor: 'pointer'}} onClick={() => window.location.href=`${item}`} key={index}>{item} </span>
                        }
                    } else {
                        if (resultWords[index + 1] === '.' || resultWords[index + 1] === ',') {
                            return <span key={index}>{item}</span>
                        } else {
                            return <span key={index}>{item} </span>
                        }
                    }
                })}
            </p> : null}
        </div>
    )
}

export default Testing