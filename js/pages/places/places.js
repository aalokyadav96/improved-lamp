import Sightbox from '../../components/ui/Sightbox.mjs';
import { createPlace, editPlaceForm, updatePlace, displayPlace, deletePlace, createPlaceForm, fetchPlaces, displayPlaces } from '../../services/place/placeService.js';

function Places(contentContainer) {
    console.log("dfgrhg");
    contentContainer.innerHTML = '';
    displayPlaces(contentContainer)
}

export { Places };
