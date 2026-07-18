// Test IDs for the provider dashboard (overview, services, bookings tabs).
export const PROVIDER_DASHBOARD = {
        overviewTab: 'provider-dashboard-overview-tab',
        servicesTab: 'provider-dashboard-services-tab',
        bookingsTab: 'provider-dashboard-bookings-tab',
        addServiceButton: 'provider-add-service-button',
};

export const SERVICE_FORM = {
        titleInput: 'service-form-title-input',
        descriptionInput: 'service-form-description-input',
        categorySelect: 'service-form-category-select',
        priceInput: 'service-form-price-input',
        priceUnitSelect: 'service-form-price-unit-select',
        cityInput: 'service-form-city-input',
        imagesInput: 'service-form-images-input',
        saveButton: 'service-form-save-button',
};

export const PROVIDER_SERVICE_ROW = {
        editButton: (id) => `provider-service-edit-button-${id}`,
        deleteButton: (id) => `provider-service-delete-button-${id}`,
};

export const PROVIDER_BOOKING_ROW = {
        confirmButton: (id) => `provider-booking-confirm-button-${id}`,
        rejectButton: (id) => `provider-booking-reject-button-${id}`,
        completeButton: (id) => `provider-booking-complete-button-${id}`,
};
