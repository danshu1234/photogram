import sendMess from "./sendMess"

const exitChat = async (trueEmail: string, setMessages: Function | null, trueParamEmail: string, succesSend: Function | null, participantsChat: string[], messages: any) => {
    if (participantsChat.includes(trueEmail)) {
        await sendMess('text', `${trueEmail} вышел из чата`, [], null, messages, '', trueEmail, setMessages, null, null, null, null, null, null, null, [], succesSend, trueParamEmail, null, null, null, participantsChat, '')
    }
    const chatExit = await fetch('http://localhost:4000/chats-controller/chat/exit', {
        method: "PATCH",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trueParamEmail }),
        credentials: 'include',
    })
    const resultChatExit = await chatExit.text()
    if (resultChatExit === 'OK' && setMessages) {
        window.location.href='/chats'
    }
}

export default exitChat