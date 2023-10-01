import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import PixabayApi from './pixabay-api.js';
import LoadMoreBtn from './components/LoadMoreBtn.js';

const form = document.getElementById('search-form');
const galleryDiv = document.querySelector('.gallery');
form.addEventListener('submit', onSubmit);
const loadMoreBtn = new LoadMoreBtn({
  selector: '#loadMoreBtn',
  isHidden: true,
});
loadMoreBtn.button.addEventListener('click', fetchImages);

const api = new PixabayApi();
let totalHits = 0;

async function onSubmit(e) {
  e.preventDefault();
  const inputValue = form.elements.searchQuery.value.trim();
  api.searchBy = inputValue;
  clearImagesList();
  api.resetPage();

  await fetchImages();
}

async function fetchImages() {
  loadMoreBtn.hide();
  await api
    .getImages()
    .then(res => {
      totalHits = res.totalHits;
      if (res.hits?.length === 0) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        return '';
      }
      console.log(res);
      api.queryPage === 2 &&
        Notiflix.Notify.success(`Hooray! We found ${res.totalHits} images.`);
      return res.hits.reduce(
        (markup, image) => markup + createGalleryMarkup(image),
        ''
      );
    })
    .then(markup => {
      updateGallery(markup);
      if (totalHits === 0) {
        return;
      }

      if ((api.queryPage - 1) * 40 < totalHits) {
        loadMoreBtn.show();
        loadMoreBtn.enable();
      } else {
        Notiflix.Notify.info(
          "We're sorry, but you've reached the end of search results."
        );
      }
    })
    .catch(onError)
    .finally(() => form.reset());
}

function updateGallery(markup) {
  galleryDiv.insertAdjacentHTML('beforeend', markup);
}

function createGalleryMarkup(image) {
  const {
    webformatURL,
    largeImageURL,
    tags,
    likes,
    views,
    comments,
    downloads,
  } = image;

  return `<a class="gallery__link" href="${largeImageURL}">
  <div class="photo-card">
  <img class = "photo-card__image" src=${webformatURL} alt=${tags} loading="lazy" />
  <div class="info">
    <p class="info-item">
      <b>${likes}</b>
    </p>
    <p class="info-item">
      <b>${views}</b>
    </p>
    <p class="info-item">
      <b>${comments}</b>
    </p>
    <p class="info-item">
      <b>${downloads}</b>
    </p>
  </div>
</div></a>`;
}

function onError(err) {
  Notiflix.Notify.failure('Oops! Something went wrong! Try researching!');
  clearImagesList();
  console.error(err);
}

function clearImagesList() {
  galleryDiv.innerHTML = '';
}

var lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: 250,
}).refresh();
