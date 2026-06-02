import AnsMess from "./chats/[email]/Answ";

export interface PhotoMess{
    base64: string;
    id: string;
}

interface Reaction{
    reaction: string;
    users: string[];
}

interface Vote{
    id: string;
    option: string;
    users: string[];
}

interface ReadMess{
    user: string;
    read: boolean;
}

export interface Message{
    user: string;
    text: string;
    photos: PhotoMess[];
    date: string;
    id: string;
    ans: AnsMess | null;
    edit?: boolean;
    typeMess: string;
    controls: boolean;
    per: string;
    pin: boolean;
    read: ReadMess[];
    sending: boolean;
    users?: string[];
    reactions: Reaction[];
    emojies: boolean;
    votes?: Vote[];
    allUserVotes?: string[];
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
    name?: string;
    users: string[];
    admin?: string[];
}

export default Chat