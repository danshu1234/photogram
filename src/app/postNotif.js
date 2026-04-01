
const postNotif = async (trueParamEmail, type) => {
    await fetch('http://localhost:4000/users-controller/new/user/notif', {
        method: "PATCH",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trueParamEmail, type }),
        credentials: 'include',                      
    })
}

export default postNotif