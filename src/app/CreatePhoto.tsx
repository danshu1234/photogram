import { ChangeEvent, FC, useState } from "react";
import useGetEmail from "./useGetEmail";
import './CreatePhoto.css'; 

interface CreateProps {
    setIsModal: (value: boolean) => void;
    email: string;
}

const CreatePhoto: FC<CreateProps> = (props) => {
    const { email } = useGetEmail();
    const [photo, setPhoto] = useState <{file: File, base64: string} | null> (null)

    let photosShow;

    if (photo !== null) {
        photosShow = <div>
            <img src={photo.base64} width={150} height={150}/>
        </div>
    }

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setPhoto({file: file, base64: event.target?.result as string})
            };
            reader.readAsDataURL(file);
        }
    };

    const createNewPhoto = async () => {
        if (photo === null || !email) return;

        const date = new Date(); 
        const day = date.getDate()
        const month = String(date.getMonth() + 1).padStart(2, '0'); 
        const year = date.getFullYear();
        const result = `${day}.${month}.${year}`;

        const resultEmail = props.email

        const formData = new FormData()

        if (photo !== null && resultEmail) {
            formData.append('photo', photo.file)
            formData.append('id', Date.now().toString())
            formData.append('date', result)
            formData.append('email', resultEmail)
        }

        const createPhoto = await fetch('http://localhost:4000/photos/create', {
            method: "POST",
            body: formData,
        });

        if (createPhoto.ok) {
            props.setIsModal(false);
            window.location.reload();
        }
    };

    return (
        <div className="container">
            <button className="close-button" onClick={() => props.setIsModal(false)}>Закрыть</button>
            
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

            <button className="publish-button" onClick={createNewPhoto} disabled={!photo}>
                Опубликовать
            </button>
        </div>
    );
};

export default CreatePhoto;