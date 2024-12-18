import Sightbox from '../../components/ui/Sightbox.mjs';
import { createPlace, editPlaceForm, updatePlace, displayPlace, deletePlace, createPlaceForm, fetchPlaces, displayPlaces } from '../../services/place/placeService.js';

function Place(placeid, contentContainer) {
    console.log("dfgrhg");
    contentContainer.innerHTML = '';
    displayPlace(placeid, contentContainer)
}

export { Place };
