
export interface PhotoMess{
    base64: string;
    id: string;
}

export interface Message{
    user: string;
    text: string;
    photos: PhotoMess[];
    date: string;
    id: string;
    ans: string;
    edit?: boolean;
    typeMess: string;
    controls: boolean;
    per: string;
    pin: boolean;
    read: boolean;
    sending: boolean;
}

interface Chat{
    id: string;
    user: string;
    messages: Message[];
    avatar: string;
    onlineStatus: {status: string, plat: string};
    messCount: number;
    pin: boolean;
    notifs: boolean;
}

export default Chat