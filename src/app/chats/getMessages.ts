import { decodeBase64 } from "tweetnacl-util"
import { Message } from "../Chat"
import nacl from "tweetnacl"
import decryptMess from "./decrpytMess"

const getMessages = async (trueParamEmail: string, setPinMess: Function, setMessages: Function, trueEmail: string) => {
    const getMess = await fetch('http://localhost:4000/chats-controller/get/mess', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trueParamEmail }),
        credentials: 'include',
    })
    const resultMess = await getMess.json()
    console.log(resultMess)
    const getMessCount = await fetch('http://localhost:4000/chats-controller/get/friend/mess/count', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trueParamEmail }),
        credentials: 'include'
    })
    const resultFriendMessCount = await getMessCount.json() 
    const pinnedMess = resultMess.filter((el: any) => el.pin === true)
    if (pinnedMess.length !== 0) {
        const resultPinnesMess = pinnedMess.map((el: Message) => {
            if (el.text.length > 5) {
                const newText = `${el.text.split('').slice(0, 5).join('')}...`
                return {...el, text: newText}
            } else {
                if (el.text !== '') {
                    return el
                } else {
                    return {...el, text: 'Фото'}
                }
            }
        })
        setPinMess({pinMessages: resultPinnesMess, messIndex: pinnedMess.length - 1, direction: 'down'})
    }
    const myMess = resultMess.map((el: any) => {
        return {
            ...el,
            controls: false,
            sending: false,
            emojies: false,
        }
    })
    let resultMessages: any[] = myMess.map((el: any) => {
        return {
            ...el,
            read: [],
        }
    })
    for (let item of resultFriendMessCount) {
        const unreadCount = myMess.length - item.countMess
        resultMessages = resultMessages.map((element, index) => {
            if (index < unreadCount) {
                return {
                    ...element,
                    read: [...element.read, {user: item.user, read: true}]
                }
            } else {
                return {
                    ...element,
                    read: [...element.read, {user: item.user, read: false}]
                }
            }
        })
    }
    const resultMyMessages = decryptMess(resultMessages, trueEmail)
    console.log('Messages: ')
    console.log(resultMyMessages)
    setMessages(resultMyMessages.filter((el: Message) => el.text !== undefined))
}

export default getMessages