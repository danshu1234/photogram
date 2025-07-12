
const getMessIdAndDate = () => {
    const date = new Date();
    const day = date.getDate().toString().padStart(2, '0'); 
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); 
    const year = date.getFullYear().toString().slice(-2); 
    const formattedDate = `${day}.${month}.${year}`;
    const messId = date.getTime().toString()
    return { formattedDate, messId }
}

export default getMessIdAndDate