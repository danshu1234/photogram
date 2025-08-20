
const getUserEmail = async () => {
    const storageCode = localStorage.getItem('photogram-enter')
    if (storageCode) {
        const userEmail = await fetch(`http://localhost:4000/users-controller/get/email/${storageCode}`)
        const resultEmail = await userEmail.text()
        return resultEmail
    }
}

export default getUserEmail