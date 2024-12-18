import { state } from "../../state/state.js";
import { apiFetch } from "../../api/api.js";
import Snackbar from '../../components/ui/Snackbar.mjs';
import { navigate } from "../../routes/index.js";
import BookingForm from '../../components/ui/BookingForm.mjs';
import Gallery from '../../components/ui/Gallery.mjs';

async function createPlace() {
    if (!state.token) {

        Snackbar("Please log in to create a place.", 3000);
        navigate('/login');
        return;
    }

    // Get form values
    const name = document.getElementById("place-name").value.trim();
    const address = document.getElementById("place-address").value.trim();
    const description = document.getElementById("place-description").value.trim();
    const capacity = document.getElementById("capacity").value.trim();
    const category = document.getElementById("category").value.trim();
    const bannerFile = document.getElementById("place-banner").files[0];

    // Validate input fields
    if (!name || !address || !description || !category || !capacity) {

        Snackbar("Please fill in all required fields.", 3000);
        return;
    }
    if (isNaN(capacity) || capacity <= 0) {

        Snackbar("Please enter a valid capacity.", 3000);
        return;
    }

    // Prepare FormData
    const formData = new FormData();
    formData.append('name', name);
    formData.append('address', address);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('capacity', capacity);
    if (bannerFile) {
        formData.append('banner', bannerFile);
    }

    try {
        // Send API request
        const result = await apiFetch('/place', 'POST', formData);

        // Show success message and navigate

        Snackbar(`Place created successfully: ${result.name}`, 3000);
        navigate('/place/' + result.placeid);
    } catch (error) {
        // Handle errors
        // 
        Snackbar(`Error creating place: ${error.message || error}`, 3000);
    }
}


async function updatePlace(placeId) {
    if (!state.token) {

        Snackbar("Please log in to update place.", 3000);
        return;
    }

    const name = document.getElementById("place-name").value.trim();
    const address = document.getElementById("place-address").value.trim();
    const description = document.getElementById("place-description").value.trim();
    const bannerFile = document.getElementById("place-banner").files[0];

    if (!name || !address || !description) {

        Snackbar("Please fill in all fields.", 3000);
        return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('address', address);
    formData.append('description', description);
    if (bannerFile) {
        formData.append('banner', bannerFile);
    }

    try {
        const result = await apiFetch(`/place/${placeId}`, 'PUT', formData);

        Snackbar(`Place updated successfully: ${result.name}`, 3000);
        navigate('/place/' + result.placeid);
    } catch (error) {

        Snackbar(`Error updating place: ${error.message || error}`, 3000);
    }
}


async function deletePlace(placeId) {
    if (!state.token) {

        Snackbar("Please log in to delete your place.", 3000);
        return;
    }
    if (confirm("Are you sure you want to delete this place?")) {
        try {
            await apiFetch(`/place/${placeId}`, 'DELETE');

            Snackbar("Place deleted successfully.", 3000);
            navigate('/'); // Redirect to home or another page
        } catch (error) {

            Snackbar(`Error deleting place: ${error.message || 'Unknown error'}`, 3000);
        }
    }
}


async function editPlaceForm(placeId, createSection) {
    // const createSection = document.getElementById("editplace");
    // createSection.innerHTML = ""; // Clear existing content

    if (state.token) {
        try {
            const place = await apiFetch(`/place/${placeId}`);

            const form = document.createElement("form");
            form.id = "edit-place-form";

            const formFields = [
                { label: "Place Name", id: "place-name", type: "text", value: place.name, required: true },
                { label: "Address", id: "place-address", type: "text", value: place.address, required: true },
                { label: "Capacity", id: "capacity", type: "number", value: place.capacity, required: true },
                { label: "Category", id: "category", type: "text", value: place.category, required: true },
                { label: "Description", id: "place-description", type: "textarea", value: place.description, required: true },
                { label: "Place Banner", id: "place-banner", type: "file", accept: "image/*" }
            ];

            // Add fields to the form
            formFields.forEach(field => {
                const fieldGroup = document.createElement("div");
                fieldGroup.classList.add("form-group");

                const label = document.createElement("label");
                label.setAttribute("for", field.id);
                label.textContent = field.label;

                let input;
                if (field.type === "textarea") {
                    input = document.createElement("textarea");
                    input.textContent = field.value || "";
                } else {
                    input = document.createElement("input");
                    input.type = field.type;
                    if (field.value) input.value = field.value;
                    if (field.accept) input.accept = field.accept;
                }

                input.id = field.id;
                if (field.required) input.required = true;

                fieldGroup.appendChild(label);
                fieldGroup.appendChild(input);
                form.appendChild(fieldGroup);
            });

            // Add submit button
            const submitButton = document.createElement("button");
            submitButton.type = "submit";
            submitButton.textContent = "Update Place";
            form.appendChild(submitButton);

            // Add form submit event listener
            form.addEventListener("submit", async (event) => {
                event.preventDefault();
                await updatePlace(placeId);
            });

            // Add the form to the section
            createSection.appendChild(document.createElement("h2").appendChild(document.createTextNode("Edit Place")));
            createSection.appendChild(form);
        } catch (error) {

            Snackbar(`Error fetching place details: ${error.message}`, 3000);
        }
    } else {
        navigate('/login');
    }
}


let abortController; // Keep this scoped to the function if it’s needed only for `fetchEvents`

async function fetchPlaces() {
    // Abort the previous fetch if it's still ongoing
    if (abortController) {
        abortController.abort();
    }

    abortController = new AbortController(); // Create a new instance
    const signal = abortController.signal; // Get the signal to pass to apiFetch

    try {
        // Use apiFetch with the 'GET' method and pass the signal for aborting
        const places = await apiFetch('/places', 'GET', null, { signal });
        return places;
    } catch (error) {
        // If error is due to abort, return null
        if (error.name === 'AbortError') {
            console.log('Fetch aborted');
            return null;
        }
        console.error(error);

        Snackbar(`Error fetching places: ${error.message || 'Unknown error'}`, 3000);
        return null; // Return null for other errors
    }
}


// Function to dynamically create HTML content
function createElement(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);
    Object.entries(attributes).forEach(([key, value]) => {
        if (key.startsWith('on') && typeof value === 'function') {
            element.addEventListener(key.slice(2).toLowerCase(), value);
        } else {
            element.setAttribute(key, value);
        }
    });
    children.forEach(child => {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else {
            element.appendChild(child);
        }
    });
    return element;
}

// Function to display the list of places
async function displayPlaces(content) {
    // const content = document.getElementById("places");
    // content.innerHTML = ""; // Clear existing content

    try {
        const places = await fetchPlaces();

        if (!places || places.length === 0) {
            content.appendChild(createElement('h2', {}, ["No places available."]));
            return;
        }

        places.forEach(place => {
            const placeCard = createPlaceCard(place);
            content.appendChild(placeCard);
        });
    } catch (error) {

        Snackbar("Error fetching places. Please try again later.", 3000);
    }
}


// Function to create a card for each place
function createPlaceCard(place) {
    return createElement('div', { class: 'place' }, [
        createElement('a', { href: `/place/${place.placeid}` }, [
            createElement('h1', {}, [place.name]),
            createElement('img', {
                src: `/placepic/${place.banner}`,
                alt: `${place.name} Banner`,
                style: "width: 100%; max-height: 300px; object-fit: cover;"
            }),
            createElement('p', {}, [createElement('strong', {}, ["Address: "]), place.address]),
            createElement('p', {}, [createElement('strong', {}, ["Description: "]), place.description])]),
    ]);
}

async function displayPlace(placeId, content) {
    // const content = document.getElementById("content");
    // content.innerHTML = ""; // Clear existing content

    try {
        const place = await apiFetch(`/place/${placeId}`);
        // Format created and updated timestamps
        const createdDate = new Date(place.created).toLocaleString();
        const updatedDate = new Date(place.updated).toLocaleString();

        // Extract coordinates if available
        const latitude = place.coordinates?.lat || "N/A";
        const longitude = place.coordinates?.lng || "N/A";

        const placeDetails = [
            createElement('h1', {}, [place.name]),
            createElement('img', {
                src: `/placepic/${place.banner}`,
                alt: `${place.name} Banner`,
                style: "width: 100%; max-height: 300px; object-fit: cover;"
            }),
            createElement('p', {}, [createElement('strong', {}, ["Place ID: "]), place.placeid]),
            createElement('p', {}, [createElement('strong', {}, ["Description: "]), place.description || "N/A"]),
            createElement('p', {}, [createElement('strong', {}, ["Address: "]), place.address || "N/A"]),
            createElement('p', {}, [createElement('strong', {}, ["Created On: "]), createdDate || "N/A"]),
            createElement('p', {}, [createElement('strong', {}, ["Last Updated: "]), updatedDate || "N/A"]),
            createElement('button', { id: 'edit-place-btn', onclick: () => editPlaceForm(place.placeid, content) }, ["Edit Place"]),
            createElement('button', { id: 'delete-place-btn', onclick: () => deletePlace(place.placeid) }, ["Delete Place"]),
            createElement('p', {}, [createElement('strong', {}, ["Coordinates: "]), `Lat: ${latitude}, Lng: ${longitude}`]),
            createElement('p', {}, [createElement('strong', {}, ["Capacity: "]), String(place.capacity || "N/A")]),
            createElement('p', {}, [createElement('strong', {}, ["Category: "]), place.category || "N/A"]),
            createElement('p', {}, [createElement('strong', {}, ["Created By: "]), place.createdBy || "Unknown"]),
        ];

        console.log(placeDetails);
        placeDetails.forEach(detail => content.appendChild(detail));


        const bookingform = BookingForm((details) => {
            alert(`Booking Confirmed!\nName: ${details.name}\nDate: ${details.date}\nSeats: ${details.seats}`);
        });

        content.appendChild(bookingform);

        const imagis = [
          { src: 'https://i.pinimg.com/236x/f7/9c/2b/f79c2b4b90096d455f9f27ab1a71b183.jpg', alt: 'Image 1' },
          { src: 'https://i.pinimg.com/236x/d4/62/37/d46237930038f95ccf843491b2bf852b.jpg', alt: 'Image 2' },
          { src: 'https://i.pinimg.com/236x/2f/c0/9a/2fc09a9ed65bdc71400c1779bf5029da.jpg', alt: 'Image 3' },
          { src: 'https://i.pinimg.com/736x/5b/59/ba/5b59ba56144cf6790fc3ad8305df1c07.jpg', alt: 'Image 4' },
        ];
      
        const gallery = Gallery(imagis);
        content.appendChild(gallery);
      
      

    } catch (error) {
        content.appendChild(createElement('h2', {}, [`Error fetching place details: ${error.message || 'Unknown error'}`]));

        Snackbar("Failed to load place details.", 3000);
    }
}



function createForm(fields, onSubmit) {
    const form = createElement('form', { onsubmit: handleFormSubmit });
    function handleFormSubmit(event) {
        event.preventDefault();
        onSubmit(new FormData(form)); // Support file inputs
    }

    fields.forEach(field => {
        const formGroup = createElement('div', { class: 'form-group' }, [
            createElement('label', { for: field.id }, [field.label]),
            createElement(field.type === 'textarea' ? 'textarea' : 'input', {
                id: field.id,
                type: field.type || 'text',
                placeholder: field.placeholder,
                value: field.value || '',
                ...(field.required ? { required: true } : {}),
                ...(field.type === 'file' && field.accept ? { accept: field.accept } : {}),
            })
        ]);
        form.appendChild(formGroup);
    });

    form.appendChild(createElement('button', { type: 'submit' }, ["Submit"]));
    return form;
}

async function createPlaceForm(createSection) {
    // const createSection = document.getElementById("create-place-section");
    // createSection.innerHTML = "";

    if (state.token) {
        const formFields = [
            { id: "place-name", label: "Place Name", placeholder: "Enter the place name", required: true },
            { id: "place-address", label: "Address", placeholder: "Enter the address", required: true },
            { id: "place-city", label: "City", placeholder: "Enter the city", required: true },
            { id: "place-country", label: "Country", placeholder: "Enter the country", required: true },
            { id: "place-zipcode", label: "Zip Code", placeholder: "Enter the zip code", required: true },
            { id: "place-description", label: "Description", type: "textarea", placeholder: "Provide a description", required: true },
            { id: "capacity", label: "Capacity", type: "number", placeholder: "Enter the capacity", required: true, min: 1 },
            { id: "phone", label: "Phone Number", placeholder: "Enter the phone number" },
            // { id: "website", label: "Website URL", type: "url", placeholder: "Enter website URL" },
            { id: "category", label: "Category", placeholder: "Enter the category" },
            { id: "place-banner", label: "Place Banner", type: "file", accept: "image/*" }
        ];

        const form = createForm(formFields, createPlace);
        createSection.appendChild(createElement('h2', {}, ["Create Place"]));
        createSection.appendChild(form);
    } else {

        Snackbar("You must be logged in to create a place.", 3000);
        navigate('/login');
    }
}



export { createPlace, editPlaceForm, updatePlace, displayPlace, deletePlace, createPlaceForm, fetchPlaces, displayPlaces };