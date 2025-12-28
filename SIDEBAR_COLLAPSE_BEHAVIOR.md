# Sidebar Collapse Behavior

## Overview
Implemented smart dropdown behavior when the sidebar is collapsed or expanded.

## Behavior

### When Sidebar is Collapsed
- **All dropdowns close automatically**
- The sidebar shows only icons
- Clean, minimal view

### When Sidebar is Expanded
- **The active dropdown opens automatically**
- Shows the dropdown that contains the current route
- User can see where they are in the navigation

### When Hovering Over Collapsed Sidebar
- **The active dropdown opens on hover**
- Allows quick access to navigation
- **Closes when hover ends**

## Implementation

### Watch for Collapse State
```javascript
watch(isCollapsed, (newValue) => {
    if (newValue) {
        // When collapsed, close all dropdowns
        openGroups.value = [];
    } else {
        // When expanded, open the active group
        const activeGroup = getActiveGroupName();
        if (activeGroup) {
            openGroups.value = [activeGroup];
        }
    }
});
```

### Watch for Hover State
```javascript
watch(isDrawerHovered, (newValue) => {
    if (isCollapsed.value && newValue) {
        // When hovering over collapsed sidebar, open the active group
        const activeGroup = getActiveGroupName();
        if (activeGroup) {
            openGroups.value = [activeGroup];
        }
    } else if (isCollapsed.value && !newValue) {
        // When leaving hover, close all groups
        openGroups.value = [];
    }
});
```

## User Experience Flow

### Scenario 1: User Collapses Sidebar
1. User clicks collapse button
2. `isCollapsed` becomes `true`
3. Watcher detects change
4. All dropdowns close (`openGroups = []`)
5. Sidebar shows only icons

### Scenario 2: User Expands Sidebar
1. User clicks expand button
2. `isCollapsed` becomes `false`
3. Watcher detects change
4. System finds active group (e.g., "services")
5. Opens the active dropdown automatically
6. User sees their current location

### Scenario 3: User Hovers Over Collapsed Sidebar
1. User hovers over collapsed sidebar
2. `isDrawerHovered` becomes `true`
3. Sidebar expands temporarily (Vuetify's expand-on-hover)
4. Watcher detects hover
5. Opens the active dropdown
6. User can navigate easily
7. When hover ends, dropdown closes

## Benefits

1. **Clean UI**: Collapsed sidebar doesn't show messy open dropdowns
2. **Context Awareness**: Expanded sidebar shows where you are
3. **Better UX**: Hover behavior provides quick access
4. **Automatic**: No manual intervention needed
5. **Consistent**: Works the same way every time

## Technical Details

### State Variables
- `isCollapsed`: Boolean tracking if sidebar is collapsed
- `isDrawerHovered`: Boolean tracking if user is hovering
- `openGroups`: Array of open dropdown group names

### Helper Function
- `getActiveGroupName()`: Returns the name of the group containing the current route

### Watchers
- Watch `isCollapsed` for collapse/expand events
- Watch `isDrawerHovered` for hover events (only when collapsed)

## Example

```
User on: /services/create

Sidebar Collapsed:
┌─────┐
│ 🏠  │
│ 📦  │
│ 🔧  │ <- Services icon (no dropdown shown)
│ 💰  │
└─────┘

Sidebar Expanded:
┌──────────────────┐
│ 🏠  الرئيسية     │
│ 📦  المنتجات     │
│ 🔧  الخدمات ▼    │ <- Dropdown open
│   ├ إدارة الخدمات │ <- Active (bold yellow)
│   ├ الاشتراكات   │
│   └ قوائم الاسعار │
│ 💰  المبيعات     │
└──────────────────┘
```

## Notes

- The behavior is smooth and doesn't cause layout shifts
- Prevents scroll reset when navigating within the same dropdown
- Works seamlessly with the dynamic active state system
