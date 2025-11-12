
export interface Message{
    user: string;
    text: string;
    photos: string[];
    date: string;
    id: string;
    ans: string;
    edit?: boolean;
    typeMess: string;
    controls: boolean;
    per: string;
    pin: boolean;
    read: boolean;
}

interface Chat{
    user: string;
    messages: Message[];
    messCount: number;
    avatar: string;
    pin: boolean;
    notifs: boolean;
}

export default Chat