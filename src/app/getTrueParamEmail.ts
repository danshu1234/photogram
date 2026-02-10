
const getTrueParamEmail = (paramEmail: string) => {
    const paramArr = Array.from(paramEmail)
    const newParamArr = paramArr.map(el => {
        if (el !== '4' && el !== '0') {
            return el
        }
    })
    const resultParamArr = newParamArr.map(el => {
        if (el !== '%') {
            return el
        } else {
            return '@'
        }
    })
    const resultParamEmail = resultParamArr.join('')
    return resultParamEmail
}

export default getTrueParamEmail