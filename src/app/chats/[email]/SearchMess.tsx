'use client'

import { Message } from "@/app/Chat"
import { ChangeEvent, FC, useEffect, useRef, useState } from "react"

interface SearchMessProps{
    messages: Message[] | null;
    messFindInput: string;
    setMessFindInput: Function;
    setMessFind: Function;
}

const SearchMess: FC <SearchMessProps> = (props) => {

    return (
        <div>
            <input placeholder="Сообщение" onChange={((e: ChangeEvent<HTMLInputElement>) => props.setMessFindInput(e.target.value))}/>
            <p onClick={() => {
                const textIncludesMess = props.messages?.filter(el => el.typeMess === 'text' && el.text.includes(props.messFindInput))
                if (textIncludesMess && textIncludesMess?.length !== 0) {
                    const resultTextIncludesMess = textIncludesMess.map(el => {
                        if (el.text.length <= 4) {
                            return {id: el.id, text: el.text, date: el.date}
                        } else {
                            return {id: el.id, text: el.text.split('').slice(0, 4).join(''), date: el.date}
                        }
                    })
                    props.setMessFind(resultTextIncludesMess.reverse())
                } else {
                    props.setMessFind([])
                }
            }}>Найти</p>
        </div>
    )
}

export default SearchMess