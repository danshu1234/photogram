
const getUserEmail = async () => {
    const userEmail = await fetch(`http://localhost:4000/users-controller/get/email`, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    })
    const resultEmail = await userEmail.text()
    return resultEmail
}

export default getUserEmail