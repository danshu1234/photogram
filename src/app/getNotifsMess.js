import showNotification from "./ShowNotif"

const getNotifsMess = async (user) => {
    const trueParamEmail = user
    const statusNotifs = await fetch('http://localhost:4000/users-controller/get/notif/mess', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trueParamEmail }),
        credentials: 'include',
    })
    const resultStatusNotifs = await statusNotifs.json()
    if (resultStatusNotifs === true) {
        console.log('Новое сообщение')
        showNotification('Новое сообщение', `Новое сообщение от ${user}`)
    }
}

export default getNotifsMess