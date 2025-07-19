
const sortPhotos = (photos) => {
    const pinnedPhotos = photos.filter(el => el.pin === true)
    const unpinnedPhotos = photos.filter(el => el.pin === false)
    return [...pinnedPhotos, ...unpinnedPhotos]
}

export default sortPhotos