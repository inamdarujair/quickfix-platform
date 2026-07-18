// Test IDs for browsing/searching services and the service detail page.
export const SERVICES_PAGE = {
        searchInput: 'services-search-input',
        categoryFilter: 'services-category-filter',
        cityInput: 'services-city-input',
        sortSelect: 'services-sort-select',
        minPriceInput: 'services-min-price-input',
        maxPriceInput: 'services-max-price-input',
        loadMoreButton: 'services-load-more-button',
        resultsGrid: 'services-results-grid',
        emptyState: 'services-empty-state',
};

export const SERVICE_CARD = {
        container: (id) => `service-card-${id}`,
        link: (id) => `service-card-link-${id}`,
};

export const SERVICE_DETAIL = {
        bookNowButton: 'service-detail-book-now-button',
        gallery: 'service-detail-gallery',
        reviewsSection: 'service-detail-reviews-section',
};
