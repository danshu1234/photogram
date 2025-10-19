import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import useGetEmail from "./useGetEmail";
import registerServiceWorker from "./RegisterServiceWorker"
import getUserChats from "./getChats";


const useNotif = () => {
    
    const [socketId, setSocketId] = useState ('')

    useEffect(() => {   

    registerServiceWorker();

    }, []);

    useEffect(() => {
        if (socketId !== '') {
            const addSocket = async () => {
                await fetch('http://localhost:4000/users-controller/add/socket', {
                method: "PATCH",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ socketId }),
                credentials: 'include',
            })
            }
            addSocket()
        }
    }, [socketId])

    useEffect(() => {

        const socket = io('http://localhost:4000')

        socket.on('connect', () => {
            setSocketId(socket.id)
        })

        socket.on('replyMessage', async(message) => {
            if (message.type === 'message' && document.visibilityState !== 'visible') {
                const user = message.user
                if (document.visibilityState !== 'visible') {
                    getUserChats(user)
                }
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