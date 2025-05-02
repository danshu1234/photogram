
const getUserPhoto = async (email) => {
    const myPhotosResponse = await fetch(`http://localhost:4000/photos/get/user/photos/${email}`)
    const resultUserPhotos = await myPhotosResponse.json()
    return resultUserPhotos
}

export default getUserPhoto