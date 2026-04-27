import showNotification from "./ShowNotif"

const getUserChats = async (emailUser, user) => {
    const trueParamEmail = user.email
    const notifStatus = await fetch('http://localhost:4000/users-controller/get/notif/status', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trueParamEmail }),
        credentials: 'include',
    })
    const reusltNotifStatus = await notifStatus.json()
    if (reusltNotifStatus) {
        console.log('Новое сообщение')
        showNotification('Новое сообщение', `Новое сообщение от ${user.name}`)
    }
}

export default getUserChats