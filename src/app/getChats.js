import showNotification from "./ShowNotif"

const getUserChats = async (email, user) => {
    const userChats = await fetch(`http://localhost:4000/users-controller/get/chats/${email}`)
    const resultChats = await userChats.json()
    const findThisChat = resultChats.find(el => el.user === user)
    if (findThisChat.notifs === true) {
        showNotification('Новое сообщение', `Новое сообщение от ${user}`)
    }
}

export default getUserChats