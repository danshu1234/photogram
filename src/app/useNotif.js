import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import useGetEmail from "./useGetEmail";
import registerServiceWorker from "./RegisterServiceWorker"
import showNotification from "./ShowNotif"


const useNotif = () => {

    const { trueEmail } = useGetEmail()
    
    const [socketId, setSocketId] = useState ('')

    useEffect(() => {   

    registerServiceWorker();

    }, []);

    useEffect(() => {
        if (socketId !== '' && trueEmail !== '') {
            console.log(socketId)
            const addSocket = async () => {
                const email = trueEmail
                await fetch('http://localhost:4000/users-controller/add/socket', {
                method: "PATCH",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                body: JSON.stringify({ email, socketId })
            })
            }
            addSocket()
        }
    }, [socketId, trueEmail])

    useEffect(() => {

        const socket = io('http://localhost:4000')

        socket.on('connect', () => {
            setSocketId(socket.id)
        })

        socket.on('replyMessage', (message) => {
            if (message.type === 'message' && document.visibilityState !== 'visible') {
                showNotification('Новое сообщение', `Новое сообщение от ${message.user}`)
            }
        })
    }, [])

    return {}

}

export default useNotif