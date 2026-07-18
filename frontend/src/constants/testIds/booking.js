// Test IDs for the booking creation and review submission modals.
export const BOOKING_MODAL = {
        dateInput: 'booking-modal-date-input',
        timeInput: 'booking-modal-time-input',
        addressInput: 'booking-modal-address-input',
        notesInput: 'booking-modal-notes-input',
        submitButton: 'booking-modal-submit-button',
        cancelButton: 'booking-modal-cancel-button',
};

export const REVIEW_MODAL = {
        star: (n) => `review-modal-star-${n}`,
        commentInput: 'review-modal-comment-input',
        photosInput: 'review-modal-photos-input',
        removePhotoButton: (n) => `review-modal-remove-photo-button-${n}`,
        submitButton: 'review-modal-submit-button',
};

export const BOOKING_ROW = {
        cancelButton: (id) => `booking-row-cancel-button-${id}`,
        reviewButton: (id) => `booking-row-review-button-${id}`,
        statusBadge: (id) => `booking-row-status-badge-${id}`,
};
