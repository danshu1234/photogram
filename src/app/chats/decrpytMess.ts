import nacl from "tweetnacl"
import { decodeBase64 } from "tweetnacl-util"

const decryptMess = (messages: any, trueEmail: string) => {
    const resultMyMessages = messages.map((el: any) => {
        if (typeof el.text === 'string') {
            return el
        } else {
            let privateKey: string = ''
            const myPrivateKey = localStorage.getItem(`${trueEmail}PrivateKey`)
            if (myPrivateKey) {
                privateKey = myPrivateKey
            }
            const decodePrivateKey = decodeBase64(privateKey)
            const decryptMessArr = el.text.map((element: any) => {
                const resultEncryptedMessage = decodeBase64(element.message)
                const decodePublicKey = decodeBase64(element.encPublicKey)
                const resultNonce = decodeBase64(element.nonce)
                const decryptedBytes = nacl.box.open(resultEncryptedMessage, resultNonce, decodePublicKey, decodePrivateKey)
                const decoder = new TextDecoder()
                if (decryptedBytes) {
                    const resultDecryptMess = decoder.decode(decryptedBytes)
                    return resultDecryptMess
                }
            })
            const resultMessage = decryptMessArr.filter((el: any) => el !== undefined)[0]
            return {
                ...el,
                text: resultMessage,
            }
        }
    })
    return resultMyMessages
}

export default decryptMess