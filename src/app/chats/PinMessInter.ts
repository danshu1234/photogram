import { Message } from "../Chat";

export default interface PinMessInter{
    pinMessages: Message[];
    messIndex: number;
    direction: string;
}