
const getUserEmail = async () => {
    const storageCode = localStorage.getItem('photogram-enter')
    if (storageCode) {
        const resultCode = JSON.parse(storageCode)
        const userEmail = await fetch(`http://localhost:4000/users-controller/get/email/${resultCode}`)
        const resultEmail = await userEmail.text()
        return resultEmail
    }
}

export default getUserEmail