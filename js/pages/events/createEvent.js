import { createEventForm, createEvent, updateEvent, fetchEventData, displayEventDetails, editEventForm, deleteEvent, displayEvents, fetchEvents, generateEventHTML, displayEventVenue, displayEventTimeline, displayEventFAQ, displayEventReviews } from "../../services/event/eventService.js";

function Create(contentContainer) {
    contentContainer.innerHTML = '';
    createEventForm(contentContainer);
}

export { Create };
