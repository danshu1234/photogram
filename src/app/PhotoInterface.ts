import Comment from "./CommentInterface"

interface Photo{
    photoIndex: number,
    id: string,
    url: string[],
    likes: string[],
    email: string,
    descript: string,
    comments: Comment[],
    date: string,
    commentsPerm: boolean,
}

export default Photo