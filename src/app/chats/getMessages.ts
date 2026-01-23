import { Message } from "../Chat"

const getMessages = async (trueParamEmail: string, setPinMess: Function, setMessages: Function) => {
    const getMess = await fetch('http://localhost:4000/users-controller/get/mess', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trueParamEmail }),
        credentials: 'include',
    })
    const resultMess = await getMess.json()
    console.log(resultMess)
    const getMessCount = await fetch('http://localhost:4000/users-controller/get/friend/mess/count', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trueParamEmail }),
        credentials: 'include'
    })
    const resultFriendMessCount = await getMessCount.json()
    console.log(resultFriendMessCount)
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
        console.log(resultMyMess[resultMyMess.length - 1])
        console.log(resultMyMess[3])
        setMessages(resultMyMess)
    } else {
        const resultMyMess = myMess.map((el: any) => {
            return {
                ...el, 
                read: false,
            }
        })
        setMessages(resultMyMess)
    }
}

export default getMessages