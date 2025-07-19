import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import useGetEmail from "./useGetEmail";
import registerServiceWorker from "./RegisterServiceWorker"
import getUserChats from "./getChats";


const useNotif = () => {

    const { trueEmail, setTrueEmail } = useGetEmail()
    
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

        socket.on('replyMessage', async(message) => {
            if (message.type === 'message' && document.visibilityState !== 'visible') {
                const user = message.user
                setTrueEmail(prev => {
                    let email = prev
                    if (document.visibilityState !== 'visible') {
                        getUserChats(email, user)
                    }
                    return prev
                })
            } else if (message.type === 'onlineStatus') {
                const userEmail = message.user
                await fetch('http://localhost:4000/users-controller/give/online/status', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userEmail })
                })
            }
        })
    }, [])

    return {}

}

export default useNotif