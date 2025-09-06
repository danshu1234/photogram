import showNotification from "./ShowNotif"

const getUserChats = async (email, user) => {
    const userChats = await fetch('http://localhost:4000/users-controller/get/chats', {
        method: "GET",
        headers: {
            'Authorization': `Bearer ${email}`,
            'Content-Type': 'application/json',
        },
    })
    const resultChats = await userChats.json()
    const findThisChat = resultChats.find(el => el.user === user)
    if (findThisChat.notifs === true) {
        console.log('Новое сообщение')
        showNotification('Новое сообщение', `Новое сообщение от ${user}`)
    }
}

export default getUserChats