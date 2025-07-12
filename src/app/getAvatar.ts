
const getAvatar = async (email: string) => {
    const avatar = await fetch(`http://localhost:4000/users-controller/get/avatar/${email}`)
    const resultAvatar = await avatar.text()
    return resultAvatar
}

export default getAvatar