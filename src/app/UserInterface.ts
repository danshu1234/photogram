import Notif from "./NotifInterface"
import Chat from "./Chat"
import { KeyWord } from "../../server-for-photogram/src/PhotoSchema"

interface UserInterface {
    code?: string,
    email: string,
    password: string,
    name: string,
    permUsers: string[],
    open: boolean,
    usersBan: string[],
    socket: string,
    peerId: string,
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
    userNotifs: string[],
    onlineStatus: {status: string, plat: string},
    keyWords: KeyWord[],
}

export default UserInterface