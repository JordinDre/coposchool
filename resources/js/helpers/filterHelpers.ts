import { router } from '@inertiajs/react';

export interface FilterParams {
    [key: string]: string | number | undefined;
}

/**
 * Helper function to remove a specific filter and update the URL
 * @param filterKey - The key of the filter to remove
 * @param currentFilters - Current filter state
 * @param search - Current search value
 * @param routeName - The route name to navigate to
 * @param setFilters - Function to update filter state
 * @param setSearch - Function to update search state (optional)
 * @param searchField - Current search field value (optional)
 */
export const removeFilterHelper = (
    filterKey: string,
    currentFilters: FilterParams,
    search: string,
    routeName: string,
    setFilters: (updater: (prev: FilterParams) => FilterParams) => void,
    setSearch?: (value: string) => void,
    searchField?: string,
) => {
    if (filterKey === 'search') {
        // Update search state first
        if (setSearch) {
            setSearch('');
        }

        // Build URL parameters without search
        const params = new URLSearchParams();

        // Add other filters that are not undefined, empty, null, or 'all'
        Object.entries(currentFilters).forEach(([key, value]) => {
            if (
                key !== 'search' &&
                key !== 'search_field' &&
                key !== 'searchField' &&
                value !== undefined &&
                value !== '' &&
                value !== null &&
                value !== 'all'
            ) {
                params.set(key, value.toString());
            }
        });

        // Add a special parameter to indicate that we're removing the search filter
        params.set('_remove_filter', 'search');

        // Navigate with updated parameters
        router.get(route(routeName), Object.fromEntries(params), {
            preserveState: true,
            replace: true,
        });
    } else {
        // Update the filter state first
        setFilters((prev: FilterParams) => ({
            ...prev,
            [filterKey]: undefined,
        }));

        // Create new filters object with the filter removed
        const newFilters = {
            ...currentFilters,
            [filterKey]: undefined,
        };

        // Build URL parameters
        const params = new URLSearchParams();

        // Add search if it exists
        if (search) {
            params.set('search', search);
        }

        // Add search_field if it exists and is not 'all'
        if (searchField && searchField !== 'all') {
            params.set('search_field', searchField);
        }

        // Add other filters that are not undefined, empty, null, or 'all'
        Object.entries(newFilters).forEach(([key, value]) => {
            if (
                key !== 'search' &&
                key !== 'search_field' &&
                key !== 'searchField' &&
                value !== undefined &&
                value !== '' &&
                value !== null &&
                value !== 'all'
            ) {
                params.set(key, value.toString());
            }
        });

        // Add a special parameter to indicate that we're removing a filter
        // This helps the server-side PersistsFilters trait to update the session correctly
        params.set('_remove_filter', filterKey);

        // Navigate with updated parameters
        router.get(route(routeName), Object.fromEntries(params), {
            preserveState: true,
            replace: true,
        });
    }
};

/**
 * Helper function to build filter parameters for URL
 * @param filters - Current filter state
 * @param search - Current search value
 * @returns URLSearchParams object
 */
export const buildFilterParams = (filters: FilterParams, search: string): URLSearchParams => {
    const params = new URLSearchParams();

    if (search) {
        params.set('search', search);
    }

    Object.entries(filters).forEach(([key, value]) => {
        if (key !== 'search' && value !== undefined && value !== '' && value !== null && value !== 'all') {
            params.set(key, value.toString());
        }
    });

    return params;
};
