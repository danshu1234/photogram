import nacl from "tweetnacl"
import { decodeBase64, encodeBase64 } from "tweetnacl-util"

const encryptMess = (publicKeys: any, messageBytes: any, decodePrivateKey: any, encPublicKey: string) => {
    const resultText = publicKeys.map((el: string) => {
        const recipientPublicKey = decodeBase64(el)
        const nonce = nacl.randomBytes(nacl.box.nonceLength)
        const resultMessage = encodeBase64(nacl.box(messageBytes, nonce, recipientPublicKey, decodePrivateKey))
        const resultNonce = encodeBase64(nonce)
        return {
            message: resultMessage,
            nonce: resultNonce,
            encPublicKey: encPublicKey,
        }
    })
    return resultText
}

export default encryptMess