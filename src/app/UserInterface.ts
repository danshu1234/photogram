import Notif from "./NotifInterface"
import Chat from "./Chat"

interface UserInterface {
    email: string,
    name: string,
    latitude: number | null,
    longitude: number | null,
    permUsers: string[],
    open: boolean,
    country: string,
    usersBan: string[],
    socket: string,
    notifs: Notif[],
    subscribes: string[],
    reports: string[],
    avatar: string,
    visits: string[],
    messages: Chat[],
    banMess: string[],
    permMess: string,
    birthday: string,
    savePosts: string[],
}

export default UserInterface