import { SendPhoto } from "./page"

const buildFormData = (imageBase64: SendPhoto[], videoFile: {file: File, type: string} | null, trueEmail: string, files: File[], inputMess: string, formattedDate: string, type: string, messId: string, trueParamEmail: string, answMess: string, videoId: string, file?: File, fileName?: string,) => {
    const formData = new FormData()
    if (imageBase64.length !== 0) {
        for (let item of imageBase64) {
            formData.append('photo', item.file)
        }
    } else if (imageBase64.length === 0 && videoFile && !file) {
        formData.append('photo', videoFile.file)
    } else if (imageBase64.length === 0 && !videoFile && file) {
        formData.append('photo', file)
    }
    formData.append('user', trueEmail)
    if (videoFile === null) {
        if (files.length === 0) {
            if (fileName) {
                formData.append('text', fileName)
            } else {
                formData.append('text', inputMess)
            }
        } else if (files.length !== 0 && fileName) {
            formData.append('text', fileName)
        }
    } else {
        if (type === 'video' && videoFile) {
            formData.append('text', videoFile.file.name)
        }
    }
    formData.append('date', formattedDate)
    formData.append('id', messId)
    formData.append('ans', answMess)
    formData.append('trueParamEmail', trueParamEmail)
    formData.append('per', '')
    formData.append('type', type)
    formData.append('videoId', videoId)
    return formData
}

export default buildFormData