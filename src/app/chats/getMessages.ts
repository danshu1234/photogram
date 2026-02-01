import { decodeBase64 } from "tweetnacl-util"
import { Message } from "../Chat"
import nacl from "tweetnacl"
import decryptMess from "./decrpytMess"

const getMessages = async (trueParamEmail: string, setPinMess: Function, setMessages: Function, trueEmail: string) => {
    const getMess = await fetch('http://localhost:4000/users-controller/get/mess', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trueParamEmail }),
        credentials: 'include',
    })
    const resultMess = await getMess.json()
    const getMessCount = await fetch('http://localhost:4000/users-controller/get/friend/mess/count', {
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
        }
    })
    let resultMessages: any[] = []
    if (myMess.length !== resultFriendMessCount) {
        const readMess = myMess.slice(0, myMess.length - resultFriendMessCount).map((el: any) => {
            return {
                ...el, 
                read: true,
            }
        })
        const unreadMess = myMess.slice(readMess.length, myMess.length).map((el: any) => {
            return {
                ...el, 
                read: false,
            }
        })
        const resultMyMess = [...readMess, ...unreadMess]
        resultMessages = resultMyMess
    } else {
        const resultMyMess = myMess.map((el: any) => {
            return {
                ...el, 
                read: false,
            }
        })
        resultMessages = resultMyMess
    }
    const resultMyMessages = decryptMess(resultMessages, trueEmail)
    setMessages(resultMyMessages.filter((el: Message) => el.text !== undefined))
}

export default getMessages