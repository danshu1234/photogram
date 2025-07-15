import { ChangeEvent, FC, useState } from "react";
import useGetEmail from "./useGetEmail";
import './CreatePhoto.css'; 
import getUserEmail from "./getUserEmail";

interface CreateProps {
    setIsModal: (value: boolean) => void;
}

const CreatePhoto: FC<CreateProps> = ({ setIsModal }) => {
    const { email } = useGetEmail();
    const [imageBase64, setImageBase64] = useState<string[]>([]);
    const [descript, setDescript] = useState<string>('');

    let photosShow;

    if (imageBase64.length !== 0) {
        photosShow = <div>
            <ul>
                {imageBase64.map((item, index) => <li key={index}><img src={item} style={{width: 100, height: 100}}/></li>)}
            </ul>
        </div>
    }

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImageBase64([...imageBase64, event.target?.result as string]);
            };
            reader.readAsDataURL(file);
        }
    };

    const createNewPhoto = async () => {
        if (imageBase64.length === 0 || !email) return;

        const date = new Date(); 
        const day = date.getDate()
        const month = String(date.getMonth() + 1).padStart(2, '0'); 
        const year = date.getFullYear();
        const result = `${day}.${month}.${year}`;

        const resultEmail = await getUserEmail()

        await fetch('http://localhost:4000/photos/create', {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                id: Date.now().toString(),
                resultEmail,
                img: imageBase64,
                date: result,
                descript: descript, 
            })
        });
        setIsModal(false);
        window.location.reload();
    };

    return (
        <div className="container">
            <button className="close-button" onClick={() => setIsModal(false)}>Закрыть</button>
            
            {photosShow}

            <label className="file-upload-button">
                Выберите файл
                <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="input-file"
                />
            </label>

            <textarea 
                placeholder="Описание" 
                onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setDescript(event.target.value)}
                className="description-textarea"
            />

            <button className="publish-button" onClick={createNewPhoto} disabled={!imageBase64}>
                Опубликовать
            </button>
        </div>
    );
};

export default CreatePhoto;