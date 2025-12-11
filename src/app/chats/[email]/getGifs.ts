
const getGifs = async (keyword?: string) => {
    const giphyKey: string = 'UXKa5L7bKIjiqGWzEhkkGjG3W3CMrK1B'
    if (!keyword) {
        const gifs = await fetch(`https://api.giphy.com/v1/gifs/trending?api_key=${giphyKey}&limit=${20}&rating=g`)
        const resultGifs = await gifs.json()
        const finalGifs = resultGifs.data.map((el: any) => el.images.original.url)
        return finalGifs
    } else {
        const gifs = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${giphyKey}&q=${encodeURIComponent(keyword)}&limit=${20}&offset=${0}&rating=g`)
        const resultGifs = await gifs.json()
        const finalGifs = resultGifs.data.map((el: any) => el.images.original.url)
        return finalGifs
    }
}

export default getGifs