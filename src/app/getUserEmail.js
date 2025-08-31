
const getUserEmail = async () => {
    const token = localStorage.getItem('photogram-enter')
    if (token) {
        const userEmail = await fetch(`http://localhost:4000/users-controller/get/email`, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        })
        const resultEmail = await userEmail.text()
        return resultEmail
    }
}

export default getUserEmail