import { createEventForm, createEvent, updateEvent, fetchEventData, displayEventDetails, editEventForm, deleteEvent, displayEvents, fetchEvents, generateEventHTML, displayEventVenue, displayEventTimeline, displayEventFAQ, displayEventReviews } from "../../services/event/eventService.js";

function Events(contentContainer) {
    contentContainer.innerHTML = '';

    const efventhead = document.createElement("h1");
    efventhead.textContent = "Events";
    contentContainer.appendChild(efventhead);
    
    const efventdiv = document.createElement("div");
    efventdiv.id = "events";
    contentContainer.appendChild(efventdiv);

    displayEvents(efventdiv, contentContainer, 1)
}

export { Events };
