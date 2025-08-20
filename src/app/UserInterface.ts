import Notif from "./NotifInterface"
import Chat from "./Chat"

interface UserInterface {
    code?: string,
    email: string,
    password: string,
    name: string,
    permUsers: string[],
    open: boolean,
    usersBan: string[],
    socket: string,
    notifs: Notif[],
    subscribes: string[],
    reports: string[],
    avatar: string,
    visits: string[],
    messages?: Chat[],
    banMess: string[],
    permMess: string,
    birthday: string,
    savePosts: string[],
}

export default UserInterface