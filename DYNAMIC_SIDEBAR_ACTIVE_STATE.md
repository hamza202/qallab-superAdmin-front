# Dynamic Sidebar Active State Solution

## Overview
Implemented a fully dynamic solution that automatically detects parent paths and keeps menu items active for any child routes without needing individual computed properties for each menu item.

## The Dynamic Function

```javascript
const isMenuItemActive = (menuLinkPath) => {
    const currentPath = route.path;
    
    // Extract the base path from the menu link (e.g., '/services/list' -> '/services')
    const pathParts = menuLinkPath.split('/').filter(p => p);
    if (pathParts.length === 0) return false;
    
    // For paths like '/services/list', we want to check if current path starts with '/services/'
    const basePath = '/' + pathParts[0];
    
    // Check if we're in the same parent route
    if (currentPath.startsWith(basePath + '/') || currentPath === basePath) {
        // For specific sub-routes like 'prices-list', we need more specific matching
        if (pathParts.length > 1 && pathParts[1].includes('price')) {
            // Special handling for price-related routes
            return currentPath.includes('price');
        }
        
        // For main management routes (list, create, edit)
        if (pathParts[1] === 'list') {
            // This is a main management route, active for list/create/edit but not for other sub-routes
            return currentPath === menuLinkPath || 
                   currentPath === basePath + '/create' || 
                   currentPath.includes(basePath + '/edit/') ||
                   currentPath === basePath + '/form' ||
                   currentPath.includes(basePath + '/view/');
        }
        
        // Default: if it's under the same parent, it's active
        return true;
    }
    
    return false;
};
```

## How It Works

### Automatic Parent Detection
The function automatically extracts the parent path from the menu link:
- `/services/list` → parent: `/services`
- `/products/prices-list` → parent: `/products`
- `/simple-products/list` → parent: `/simple-products`

### Smart Child Route Detection
The function recognizes common child route patterns:
- `create` - Create new item
- `edit/:id` - Edit existing item
- `view/:id` - View item details
- `form` - Generic form route

### Special Cases Handling

#### Main Management Routes
For links ending with `/list`, the function knows these are main management routes and should be active for:
- The list page itself
- Create page
- Edit pages
- View pages
- But NOT for other sub-features like prices-list

#### Price-Related Routes
Special handling for price-related routes to keep them separate from main management:
- `/services/prices-list` stays active for price-related child routes
- But doesn't activate for `/services/list` or `/services/create`

## Usage in Template

Simply use the function in any menu item's class binding:

```html
<router-link to="/services/list"
    :class="[isMenuItemActive('/services/list') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">
    إدارة الخدمات
</router-link>
```

## Examples

### Services Menu
| Current Route | إدارة الخدمات | إدارة قوائم الاسعار |
|--------------|---------------|-------------------|
| `/services/list` | ✅ Active | ❌ Not Active |
| `/services/create` | ✅ Active | ❌ Not Active |
| `/services/edit/123` | ✅ Active | ❌ Not Active |
| `/services/prices-list` | ❌ Not Active | ✅ Active |
| `/services/price-list-create` | ❌ Not Active | ✅ Active |
| `/services/price-list-edit/456` | ❌ Not Active | ✅ Active |

### Products Menu
| Current Route | منتجات بسيطة | قوائم الاسعار |
|--------------|-------------|--------------|
| `/simple-products/list` | ✅ Active | ❌ Not Active |
| `/simple-products/create` | ✅ Active | ❌ Not Active |
| `/simple-products/edit/789` | ✅ Active | ❌ Not Active |
| `/products/prices-list` | ❌ Not Active | ✅ Active |

## Benefits

1. **No Manual Configuration**: Works automatically for any menu item
2. **No Computed Properties**: No need to create individual computed properties for each menu item
3. **Scalable**: Add new menu items and they work immediately
4. **Intelligent**: Understands the relationship between parent and child routes
5. **Maintainable**: Single function to maintain instead of multiple computed properties

## Adding New Menu Items

To add a new menu item, simply use the dynamic function:

```html
<router-link to="/your-feature/list"
    :class="[isMenuItemActive('/your-feature/list') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">
    Your Feature Name
</router-link>
```

The function will automatically:
- Keep it active when on `/your-feature/list`
- Keep it active when on `/your-feature/create`
- Keep it active when on `/your-feature/edit/:id`
- Keep it active when on `/your-feature/view/:id`

## Customization

If you need special behavior for certain routes, you can extend the function by adding more conditions:

```javascript
// Example: Add special handling for settings routes
if (pathParts[0] === 'settings') {
    // Custom logic for settings
}
```

## Migration from Old Approach

### Before (Manual Computed Properties)
```javascript
const isServiceManagementActive = computed(() => {
    const path = route.path;
    return path === '/services/list' || 
           path === '/services/create' || 
           path.startsWith('/services/edit/');
});
```

```html
:class="[isServiceManagementActive ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']"
```

### After (Dynamic Function)
```html
:class="[isMenuItemActive('/services/list') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']"
```

No computed property needed! 🎉
