import Link from "next/link";
import { FC } from "react";

const FeedbackBtn: FC = () => {
    return <Link href={'/feedback'} style={{opacity: 0.8}}>Оставить отзыв о приложении</Link>
}

export default FeedbackBtn