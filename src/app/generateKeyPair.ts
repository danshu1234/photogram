import nacl from "tweetnacl"

const generateKeyPair = () => {
    const keyPair = nacl.box.keyPair()
    const privateKey = Buffer.from(keyPair.secretKey).toString('base64')
    const publicKey = Buffer.from(keyPair.publicKey).toString('base64')
    return {
        privateKey: privateKey,
        publicKey: publicKey,
    }
}

export default generateKeyPair