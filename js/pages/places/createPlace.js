import Sightbox from '../../components/ui/Sightbox.mjs';
import { createPlace, editPlaceForm, updatePlace, displayPlace, deletePlace, createPlaceForm, fetchPlaces, displayPlaces } from '../../services/place/placeService.js';

function CreatePlace(contentContainer) {
    console.log("dfgrhg");
    contentContainer.innerHTML = '';
    createPlaceForm(contentContainer)
}

export { CreatePlace };
