// Test IDs for the admin dashboard (overview, users, services, bookings tabs).
export const ADMIN_DASHBOARD = {
        overviewTab: 'admin-dashboard-overview-tab',
        usersTab: 'admin-dashboard-users-tab',
        servicesTab: 'admin-dashboard-services-tab',
        bookingsTab: 'admin-dashboard-bookings-tab',
        userSearchInput: 'admin-user-search-input',
        roleFilter: 'admin-role-filter',
};

export const ADMIN_USER_ROW = {
        blockButton: (id) => `admin-user-block-button-${id}`,
        verifyButton: (id) => `admin-user-verify-button-${id}`,
        deleteButton: (id) => `admin-user-delete-button-${id}`,
};

export const ADMIN_SERVICE_ROW = {
        toggleButton: (id) => `admin-service-toggle-button-${id}`,
        deleteButton: (id) => `admin-service-delete-button-${id}`,
};
