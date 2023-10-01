import axios from 'axios';

const ENDPOINT = 'https://pixabay.com/api/';
const API_KEY = '39748465-2f78ac3732af05ff79c228526';

export default class PixabayApi {
  constructor() {
    this.queryPage = 1;
    this.searchBy = '';
  }

  async getImages() {
    return await axios
      .get(
        `${ENDPOINT}?key=${API_KEY}&q=${encodeURIComponent(
          this.searchBy
        )}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${
          this.queryPage
        }`
      )
      .then(res => {
        this.incrementPage();
        return res.data;
      });
  }

  resetPage() {
    this.queryPage = 1;
  }

  incrementPage() {
    this.queryPage += 1;
  }
}
