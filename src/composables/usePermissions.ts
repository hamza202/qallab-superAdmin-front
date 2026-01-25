/**
 * Composable for handling user permissions
 * Checks permissions stored in localStorage from login response
 */

import { computed } from 'vue';

// Permission structure from API response
export interface PermissionItem {
    can_view_any?: boolean;
    can_view?: boolean;
    can_create?: boolean;
    can_update?: boolean;
    can_delete?: boolean;
}

export interface PermissionsGroup {
    [key: string]: PermissionItem;
}

export interface Permissions {
    products?: PermissionsGroup;
    services?: PermissionsGroup;
    sales?: PermissionsGroup;
    purchases?: PermissionsGroup;
    users?: PermissionsGroup;
    settings?: PermissionsGroup;
    [key: string]: PermissionsGroup | undefined;
}

const AUTH_PERMISSIONS_KEY = 'auth_permissions';

/**
 * Route to permission mapping
 * Maps route paths to their corresponding permission keys
 */
const routePermissionMap: Record<string, { group: string; key: string }> = {
    // Products
    '/simple-products': { group: 'products', key: 'items' },
    '/group-products': { group: 'products', key: 'grouped-items' },
    '/products/general-products-prices': { group: 'products', key: 'general-product-price-lists' },
    '/products/building-material-products-prices': { group: 'products', key: 'building-material-price-lists' },
    '/products/production-capacity': { group: 'products', key: 'production-capacity-lists' },
    '/product-variables': { group: 'products', key: 'aspects' },

    // Services
    '/services': { group: 'services', key: 'services' },

    // Sales
    '/customers': { group: 'sales', key: 'customers' },

    // Purchases
    '/suppliers': { group: 'purchases', key: 'suppliers' },

    // Users
    '/users': { group: 'users', key: 'users' },
    '/roles': { group: 'users', key: 'roles' },
    '/crushers': { group: 'users', key: 'crushers' },
    '/contractors': { group: 'users', key: 'contractors' },
    '/logistics': { group: 'users', key: 'logistics-companies' },

    // Settings
    '/settings/units': { group: 'settings', key: 'units' },
    '/settings/test-methodology': { group: 'settings', key: 'test-methodologies' },
    '/settings/tests': { group: 'settings', key: 'tests' },
    '/settings/test-group': { group: 'settings', key: 'test-groups' },
    '/settings/taxes': { group: 'settings', key: 'taxes' },
    '/settings/countries': { group: 'settings', key: 'countries' },
    '/settings/cities': { group: 'settings', key: 'cities' },
    '/settings/sample-types': { group: 'settings', key: 'sample-types' },
    '/settings/brands': { group: 'settings', key: 'brands' },
    '/settings/factories': { group: 'settings', key: 'manufacturers' },
    '/settings/products-categories/list': { group: 'settings', key: 'categories' },
    '/settings/products-categories/create': { group: 'settings', key: 'categories' },
    '/settings/products-categories/edit': { group: 'settings', key: 'categories' },
    '/settings/products-categories/view': { group: 'settings', key: 'categories' },
    '/settings/products-categories/tree': { group: 'settings', key: 'tree-categories' },
    '/settings/services-categories/list': { group: 'settings', key: 'service-categories' },
    '/settings/services-categories/create': { group: 'settings', key: 'service-categories' },
    '/settings/services-categories/edit': { group: 'settings', key: 'service-categories' },
    '/settings/services-categories/view': { group: 'settings', key: 'service-categories' },
    '/settings/services-categories/tree': { group: 'settings', key: 'tree-service-categories' },
};

export function usePermissions() {
    /**
     * Get permissions from localStorage
     */
    const getPermissions = (): Permissions | null => {
        const stored = localStorage.getItem(AUTH_PERMISSIONS_KEY);
        if (!stored) return null;
        try {
            return JSON.parse(stored);
        } catch {
            return null;
        }
    };

    /**
     * Save permissions to localStorage
     */
    const setPermissions = (permissions: Permissions): void => {
        localStorage.setItem(AUTH_PERMISSIONS_KEY, JSON.stringify(permissions));
    };

    /**
     * Clear permissions from localStorage
     */
    const clearPermissions = (): void => {
        localStorage.removeItem(AUTH_PERMISSIONS_KEY);
    };

    /**
     * Check if user has permission for a specific group and key
     */
    const hasPermission = (group: string, key: string): boolean => {
        const permissions = getPermissions();
        if (!permissions) return false;

        const groupPermissions = permissions[group];
        if (!groupPermissions) return false;

        const permission = groupPermissions[key];
        if (!permission) return false;

        return permission.can_view_any === true;
    };

    /**
     * Check if user has permission for a specific route path
     */
    const hasRoutePermission = (path: string): boolean => {
        // Always allow home/dashboard
        if (path === '/' || path === '/dashboard') return true;

        // Find matching permission for the route
        for (const [routePath, permissionInfo] of Object.entries(routePermissionMap)) {
            if (path.startsWith(routePath)) {
                return hasPermission(permissionInfo.group, permissionInfo.key);
            }
        }

        // If route is not in permission map, allow access (for routes like finance, projects, reports, etc.)
        return true;
    };

    /**
     * Check if user can view any items in products
     */
    const canViewProducts = computed(() => hasPermission('products', 'items'));
    const canViewGroupedProducts = computed(() => hasPermission('products', 'grouped-items'));
    const canViewGeneralPriceLists = computed(() => hasPermission('products', 'general-product-price-lists'));
    const canViewBuildingMaterialPriceLists = computed(() => hasPermission('products', 'building-material-price-lists'));
    const canViewProductionCapacity = computed(() => hasPermission('products', 'production-capacity-lists'));
    const canViewProductVariables = computed(() => hasPermission('products', 'aspects'));

    /**
     * Check if user can view services
     */
    const canViewServices = computed(() => hasPermission('services', 'services'));

    /**
     * Check if user can view sales related items
     */
    const canViewCustomers = computed(() => hasPermission('sales', 'customers'));

    /**
     * Check if user can view purchases related items
     */
    const canViewSuppliers = computed(() => hasPermission('purchases', 'suppliers'));

    /**
     * Check if user can view users related items
     */
    const canViewUsers = computed(() => hasPermission('users', 'users'));
    const canViewRoles = computed(() => hasPermission('users', 'roles'));
    const canViewCrushers = computed(() => hasPermission('users', 'crushers'));
    const canViewContractors = computed(() => hasPermission('users', 'contractors'));
    const canViewLogistics = computed(() => hasPermission('users', 'logistics-companies'));

    /**
     * Check if user can view settings related items
     */
    const canViewUnits = computed(() => hasPermission('settings', 'units'));
    const canViewTestMethodologies = computed(() => hasPermission('settings', 'test-methodologies'));
    const canViewTests = computed(() => hasPermission('settings', 'tests'));
    const canViewTestGroups = computed(() => hasPermission('settings', 'test-groups'));
    const canViewTaxes = computed(() => hasPermission('settings', 'taxes'));
    const canViewCountries = computed(() => hasPermission('settings', 'countries'));
    const canViewCities = computed(() => hasPermission('settings', 'cities'));
    const canViewSampleTypes = computed(() => hasPermission('settings', 'sample-types'));
    const canViewBrands = computed(() => hasPermission('settings', 'brands'));
    const canViewManufacturers = computed(() => hasPermission('settings', 'manufacturers'));
    const canViewCategories = computed(() => hasPermission('settings', 'categories'));
    const canViewTreeCategories = computed(() => hasPermission('settings', 'tree-categories'));
    const canViewServiceCategories = computed(() => hasPermission('settings', 'service-categories'));
    const canViewTreeServiceCategories = computed(() => hasPermission('settings', 'tree-service-categories'));

    /**
     * Check if any product permission is available
     */
    const hasAnyProductPermission = computed(() =>
        canViewProducts.value ||
        canViewGroupedProducts.value ||
        canViewGeneralPriceLists.value ||
        canViewBuildingMaterialPriceLists.value ||
        canViewProductionCapacity.value ||
        canViewProductVariables.value
    );

    /**
     * Check if any service permission is available
     */
    const hasAnyServicePermission = computed(() => canViewServices.value);

    /**
     * Check if any sales permission is available
     */
    const hasAnySalesPermission = computed(() => canViewCustomers.value);

    /**
     * Check if any purchases permission is available
     */
    const hasAnyPurchasesPermission = computed(() => canViewSuppliers.value);

    /**
     * Check if any users permission is available
     */
    const hasAnyUsersPermission = computed(() =>
        canViewUsers.value ||
        canViewRoles.value ||
        canViewCrushers.value ||
        canViewContractors.value ||
        canViewLogistics.value
    );

    /**
     * Check if any settings permission is available
     */
    const hasAnySettingsPermission = computed(() =>
        canViewUnits.value ||
        canViewTestMethodologies.value ||
        canViewTests.value ||
        canViewTestGroups.value ||
        canViewTaxes.value ||
        canViewCountries.value ||
        canViewCities.value ||
        canViewSampleTypes.value ||
        canViewBrands.value ||
        canViewManufacturers.value ||
        canViewCategories.value ||
        canViewTreeCategories.value ||
        canViewServiceCategories.value ||
        canViewTreeServiceCategories.value
    );

    return {
        // Core functions
        getPermissions,
        setPermissions,
        clearPermissions,
        hasPermission,
        hasRoutePermission,

        // Products permissions
        canViewProducts,
        canViewGroupedProducts,
        canViewGeneralPriceLists,
        canViewBuildingMaterialPriceLists,
        canViewProductionCapacity,
        canViewProductVariables,
        hasAnyProductPermission,

        // Services permissions
        canViewServices,
        hasAnyServicePermission,

        // Sales permissions
        canViewCustomers,
        hasAnySalesPermission,

        // Purchases permissions
        canViewSuppliers,
        hasAnyPurchasesPermission,

        // Users permissions
        canViewUsers,
        canViewRoles,
        canViewCrushers,
        canViewContractors,
        canViewLogistics,
        hasAnyUsersPermission,

        // Settings permissions
        canViewUnits,
        canViewTestMethodologies,
        canViewTests,
        canViewTestGroups,
        canViewTaxes,
        canViewCountries,
        canViewCities,
        canViewSampleTypes,
        canViewBrands,
        canViewManufacturers,
        canViewCategories,
        canViewTreeCategories,
        canViewServiceCategories,
        canViewTreeServiceCategories,
        hasAnySettingsPermission,
    };
}
