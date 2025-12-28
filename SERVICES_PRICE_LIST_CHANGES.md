# Services Price List Form - Changes Summary

## Overview
Updated the services price list form to work with the new API structure that fetches all supplier services with their current prices and allows editing them.

## API Integration

### Endpoint Used
```
GET /api/suppliers/{supplierId}/price-list/services
```

### Response Structure
```json
{
  "success": true,
  "message": "item::app.price_list.messages.services_list_success",
  "data": [
    {
      "id": 1,
      "service_id": 1,
      "service_code": "SRV-TRANS-001",
      "name": "Material Transport",
      "description": "Transportation of construction materials",
      "service_domain": "transport",
      "service_type": "external",
      "unit_price": "50.00",
      "category": {
        "id": null,
        "name": null,
        "is_building_material": false
      },
      "unit": {
        "id": null,
        "name": null
      },
      "is_active": true,
      "is_available": true,
      "prices": null
    }
  ],
  "count": 3
}
```

## Key Changes

### 1. Data Fetching
- **Before**: Fetched available services from `/api/items/list` and allowed manual selection
- **After**: Automatically fetches all supplier services with their current prices from `/api/suppliers/{supplierId}/price-list/services`

### 2. Form Behavior
- **Before**: User manually added rows and selected services from dropdown
- **After**: All services are automatically displayed in the table, user only edits prices

### 3. Table Structure
Updated table headers to show:
- Row number (#)
- Service name (with description)
- Service code
- Base unit price (read-only)
- Minimum price (editable)
- Maximum price (editable)

### 4. Filtering Features
Added two filter options:
- **Search**: Filter by service name, code, or description
- **Category Filter**: Filter by service domain (transport, analysis, other, or all)

### 5. Save Logic
- **Before**: Created new price list items or updated existing ones
- **After**: Updates only services that have price changes (min or max price set)
- Validates that max price >= min price for each service
- Shows success message with count of updated services

### 6. Delete Behavior
- **Before**: Removed rows from the table
- **After**: Clears the prices (sets min and max to null) since services cannot be deleted

## New Features

### Filtering System
```typescript
const applyFilters = () => {
  let filtered = [...allRows.value]
  
  // Filter by category
  if (selectedCategory.value && selectedCategory.value !== 'all') {
    filtered = filtered.filter(row => row.serviceDomain === selectedCategory.value)
  }
  
  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(row => 
      row.serviceName.toLowerCase().includes(query) ||
      row.serviceCode.toLowerCase().includes(query) ||
      row.description.toLowerCase().includes(query)
    )
  }
  
  rows.value = filtered
}
```

### Bulk Edit
The bulk edit functionality remains the same:
- Edit by percentage or value
- Increase or decrease prices
- Applies to all visible (filtered) services

## UI Improvements

1. **Search Bar**: Added search input with magnify icon
2. **Category Dropdown**: Filter services by domain
3. **Service Count**: Shows number of services currently displayed
4. **Service Details**: Service name and description shown in table
5. **Base Price Display**: Shows the original unit price (read-only)
6. **Loading State**: Shows loading indicator while fetching data

## Data Flow

```
1. Component mounts
   ↓
2. Fetch all supplier services from API
   ↓
3. Transform API data to internal format
   ↓
4. Apply initial filters (show all)
   ↓
5. User edits prices in table
   ↓
6. User clicks save
   ↓
7. Validate all rows
   ↓
8. Update only services with price changes
   ↓
9. Refresh data from API
```

## Validation Rules

1. If both min and max prices are set, max must be >= min
2. At least one service must have a price change to save
3. Prices must be valid numbers

## Notes

- The `supplierId` is obtained from route params (defaults to 1 if not provided)
- All services are displayed by default, user filters as needed
- The form no longer has "add service" functionality - all services are pre-loaded
- Delete button now clears prices instead of removing rows
