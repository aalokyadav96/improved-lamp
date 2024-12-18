import { createEventForm, createEvent, updateEvent, fetchEventData, displayEventDetails, editEventForm, deleteEvent, displayEvents, fetchEvents, generateEventHTML, displayEventVenue, displayEventTimeline, displayEventFAQ, displayEventReviews } from "../../services/event/eventService.js";
import { displayTickets, addTicketForm } from "../../services/tickets/ticketService.js";
import { displayEventMedia, addMediaEventListeners, showMediaUploadForm } from "../../services/media/mediaService.js";
import { displayMerchandise, addMerchForm } from "../../services/merch/merchService.js";
import SnackBar from "../../components/ui/Snackbar.mjs";
import { state } from "../../state/state.js";

function Event(eventid, contentContainer) {
    displayEvent(eventid, contentContainer)
}


async function displayEvent(eventId, contentContainer) {
    console.log(eventId);
    try {
        // Fetch event data from API (assuming you have a function for this)
        const eventData = await fetchEventData(eventId);
        const isLoggedIn = !!state.token;
        const isCreator = isLoggedIn && state.user === eventData.creatorid;
        // fetchEventData(eventId);
        // const eventData = {};
        // Clear previous content
        console.log(eventData);
        // Display event details, tickets, merchandise, and media
        displayEventDetails(contentContainer, eventData, isCreator, isLoggedIn);
        await displayTickets(eventData.tickets, eventId, isCreator, isLoggedIn);
        await displayMerchandise(eventData.merch, eventId, isCreator, isLoggedIn);
        await displayEventMedia(eventData.media, eventId, isCreator);  // Display event media
        await displayEventVenue(eventData.place, isLoggedIn);  // Display event venue
        await displayEventTimeline(isCreator, isLoggedIn);  // Display event venue
        await displayEventFAQ(isCreator, isLoggedIn);  // Display event venue
        await displayEventReviews(isCreator, isLoggedIn);  // Display event venue
        // addMediaEventListeners();
    } catch (error) {
        // Clear previous content and show error message
        const errorMessage = document.createElement("h1");
        errorMessage.textContent = `Error loading eventdetails: ${error.message}`;
        contentContainer.appendChild(errorMessage);
        SnackBar("Failed to load event details. Please try again later.", 3000);
    }
}

export { Event };
