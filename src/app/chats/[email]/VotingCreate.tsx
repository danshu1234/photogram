'use client'

import { ChangeEvent, FC, useEffect, useRef, useState } from "react"
import "./UserChat.css"
import { Message } from "@/app/Chat"
import getMessIdAndDate from "@/app/getMessIdAndDate"
import gifs from "@/app/gifs"
import getGifs from "./getGifs"
import AnsMess from "./Answ"
import { SendBtnProps } from "@/app/SendBtn"
import sendMess from "./sendMess"

interface CreateVotingProps extends SendBtnProps{
    setCreateVoting: Function;
}

const CreateVoting: FC <CreateVotingProps> = (props) => {

    const [nameInput, setNameInput] = useState <string> ('')
    const [options, setOptions] = useState <string[]> ([''])

    useEffect(() => {
        console.log('Options: ')
        console.log(options)
    }, [options])

    return (
        <div>
            <input placeholder="Вопрос" onChange={((event: ChangeEvent<HTMLInputElement>) => setNameInput(event.target.value))}/>
            <ul>
                {options.map((item, index) => <li key={index}>
                    <input placeholder="Option" value={item} onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        const newOptions = options.map((el, indexOpt) => {
                            if (indexOpt === index) {
                                return event.target.value
                            } else {
                                return el
                            }
                        })
                        setOptions(newOptions)
                    }}/>
                </li>)}
            </ul>
            <p onClick={() => {
                const newOpt = [...options, '']
                setOptions(newOpt)
            }}>+</p>
            <button onClick={async() => {
                if (nameInput !== '') {
                    const resultOptions = options.filter(el => el !== '')
                    if (resultOptions.length !== 0) {
                        await sendMess('vote', nameInput, [], props.videoFile, props.messages, props.editMess, props.trueEmail, props.setMessages, props.answMess, props.setAnswMess, props.setImageBase64, props.setVideoFile, props.setInputMess, props.setOverStatus, props.setFiles, props.files, props.succesSend, props.trueParamEmail, props.backUpMess, props.setEditMess, props.setProcessSendMess, props.usersChat, undefined, undefined, undefined, options)
                        props.setCreateVoting(false)
                    }
                }
            }}>Создать опрос</button>
        </div>
    )
}

export default CreateVoting