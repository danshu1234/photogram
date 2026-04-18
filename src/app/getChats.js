import showNotification from "./ShowNotif"

const getUserChats = async (emailUser, user) => {
    const userChats = await fetch('http://localhost:4000/users-controller/get/chats', {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    })
    const resultChats = await userChats.json()
    console.log(resultChats)
    const findThisChat = resultChats[0]
    const myStatusNotifs = findThisChat.notifs
    if (myStatusNotifs === true) {
        console.log('Новое сообщение')
        showNotification('Новое сообщение', `Новое сообщение от ${user}`)
    }
}

export default getUserChats