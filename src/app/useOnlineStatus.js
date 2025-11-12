import { useEffect } from "react";

const useOnlineStatus = () => {

    useEffect(() => {
        console.log(window.history)
        const changeOnlineStatus = async () => {
            await fetch('http://localhost:4000/users-controller/online/status', {
                method: "PATCH",
                credentials: 'include',
            })
        }
        changeOnlineStatus()
    }, [])
    
    useEffect(() => {
        window.addEventListener('beforeunload', async() => {
            await fetch('http://localhost:4000/users-controller/user/close', {
                method: "GET",
                credentials: 'include',
            })
        })
    }, [])

    return {}

}

export default useOnlineStatus