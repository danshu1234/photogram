import Comment from "./CommentInterface"

interface Photo{
    photoIndex: number,
    id: string,
    url: string,
    likes: string[],
    email: string,
    descript: string,
    comments: Comment[],
    date: string,
    commentsPerm: boolean,
    bonuce: boolean,
    pin: boolean,
}

export default Photo