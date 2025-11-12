
const backUpMess = (messages, messId) => {
    const resultBackUpMess = messages.filter(el => el.id !== messId)
    return resultBackUpMess
}

export default backUpMess