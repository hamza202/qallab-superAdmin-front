# Sidebar Active State Logic - Implementation

## Problem
When navigating to child routes like `/services/form`, `/services/create`, or `/services/edit/:id`, the parent menu item "الخدمات" (Services) in the sidebar was not staying active/highlighted.

## Solution
Updated the sidebar logic to check if the current route **starts with** the base path, which includes all child routes.

## Changes Made

### File: `src/components/layout/AppSidebar.vue`

#### 1. Added Helper Function
```javascript
// Helper function to check if route matches (including child routes like /form, /create, /edit/:id, /view/:id)
const isRouteActive = (basePath) => {
    const currentPath = route.path;
    // Check if current path starts with the base path
    if (currentPath.startsWith(basePath)) {
        return true;
    }
    return false;
};
```

#### 2. Updated Group Active Check
```javascript
// Check if current route is active for a group
const isGroupActive = (routes) => {
    return routes.some(r => isRouteActive(r));
};
```

## How It Works

### Before
The sidebar only checked for exact path matches or used `.includes()` which could match unintended routes.

### After
The sidebar now uses `.startsWith()` to check if the current path begins with any of the base paths defined for each menu group.

### Example
For the Services menu with base path `/services`:

| Route | Active? | Reason |
|-------|---------|--------|
| `/services/list` | ✅ Yes | Starts with `/services` |
| `/services/form` | ✅ Yes | Starts with `/services` |
| `/services/create` | ✅ Yes | Starts with `/services` |
| `/services/edit/123` | ✅ Yes | Starts with `/services` |
| `/services/prices-list` | ✅ Yes | Starts with `/services` |
| `/services/prices-list/form` | ✅ Yes | Starts with `/services` |
| `/products/list` | ❌ No | Does not start with `/services` |

## Route Groups

The following route groups are defined:

```javascript
const productsRoutes = ['/simple-products', '/group-products', '/products'];
const servicesRoutes = ['/services'];
const salesRoutes = ['/sales'];
const projectsRoutes = ['/projects'];
const purchasesRoutes = ['/suppliers'];
const financeRoutes = ['/finance'];
const usersRoutes = ['/users'];
const logisticsRoutes = ['/logistics'];
const reportsRoutes = ['/reports'];
const settingsRoutes = ['/products-categories', '/services-categories', '/units', '/factories', '/brands', '/geo-areas', '/geo-segments', '/tax-rules', '/taxes', '/cities', '/codes', '/account-types'];
```

## Benefits

1. **Consistent UX**: Users always know which section they're in
2. **Better Navigation**: The parent menu stays highlighted when editing/creating/viewing items
3. **Automatic**: Works for any child route without additional configuration
4. **Maintainable**: Simple logic that's easy to understand and extend

## Testing

To test, navigate to:
- `/services/list` → Services menu should be active
- `/services/form` → Services menu should be active
- `/services/edit/1` → Services menu should be active
- `/services/prices-list/form` → Services menu should be active

The same logic applies to all other menu groups (Products, Sales, etc.)
