# Qallab Clients & Providers Portal

A Vue 3 Clients & Providers Portal built with TypeScript, supporting Arabic and English languages.

## Tech Stack

| Technology | Description |
|------------|-------------|
| **Vue 3** | Progressive JavaScript Framework with Composition API |
| **TypeScript** | Type-safe JavaScript |
| **Vite** | Fast build tool for development |
| **Pinia** | State Management |
| **Vue Router 4** | Routing and navigation |
| **Vue I18n** | Internationalization (Arabic/English) |
| **Vuetify 3** | Material Design Component Library |
| **Tailwind CSS 3** | Utility-first CSS framework |
| **Axios** | HTTP Client for API requests |

## Project Structure

```
qallab-clients-provider-front/
├── public/                    # Public static files
│   └── favicon.svg            # Site favicon
├── src/
│   ├── assets/                # Static assets (images, fonts)
│   │   
│   │
│   ├── components/            # Reusable components
│   │   ├── common/            # Common components (Loader, Dialog, DataTable)
│   │   │   └── index.ts
│   │   ├── layout/            # Layout components
│   │   │   ├── AppHeader.vue  # Top header bar
│   │   │   └── AppSidebar.vue # Side navigation
│   │   └── ui/                # UI components
│   │       └── index.ts
│   │
│   ├── composables/           # Vue Composables
│   │   ├── index.ts
│   │   ├── useApi.ts          # API request handling
│   │   └── useNotification.ts # Notification management
│   │
│   ├── layouts/               # Page layouts
│   │   ├── AuthLayout.vue     # Authentication pages layout
│   │   └── DefaultLayout.vue  # Default layout
│   │
│   ├── locales/               # Translation files
│   │   ├── ar.json            # Arabic translations
│   │   └── en.json            # English translations
│   │
│   ├── plugins/               # Plugin configurations
│   │   ├── i18n.ts            # Vue I18n setup
│   │   └── vuetify.ts         # Vuetify setup
│   │
│   ├── router/                # Router configuration
│   │   ├── routes/            # Route modules
│   │   │   └── index.ts
│   │   └── index.ts           # Vue Router setup
│   │
│   ├── services/              # API services
│   │   └── api/
│   │       ├── index.ts       # Axios client with Interceptors
│   │       └── auth.service.ts # Authentication service
│   │
│   ├── stores/                # Pinia stores
│   │   ├── index.ts           # Export all stores
│   │   ├── app.ts             # App state (sidebar, loading)
│   │   ├── auth.ts            # Auth state (user, token)
│   │   └── locale.ts          # Locale state (ar/en, RTL)
│   │
│   ├── styles/                # Global styles
│   │   ├── main.scss          # Main stylesheet (includes Tailwind directives)
│   │   └── outher.scss        # SCSS outher
│   │
│   ├── types/                 # TypeScript definitions
│   │   └── index.ts           # Shared types (User, ApiResponse, etc.)
│   │
│   ├── utils/                 # Utility functions
│   │   ├── index.ts
│   │   ├── helpers.ts         # Helper functions (debounce, deepClone, etc.)
│   │   ├── validators.ts      # Validation functions (required, email, etc.)
│   │   └── formatters.ts      # Formatting functions (formatDate, formatCurrency)
│   │
│   ├── views/                 # Application pages
│   │   ├── Dashboard.vue      # Dashboard page
│   │   ├── auth/
│   │   │   └── Login.vue      # Login page
│   │   └── errors/
│   │       └── NotFound.vue   # 404 page
│   │
│   ├── App.vue                # Root component
│   └── main.ts                # Application entry point
│
├── .env                       # Environment variables
├── .env.example               # Environment variables example
├── .gitignore                 # Git ignored files
├── env.d.ts                   # Environment type definitions
├── index.html                 # Main HTML file
├── package.json               # Project dependencies
├── tsconfig.json              # TypeScript configuration
├── tsconfig.app.json          # TS config for app
├── tsconfig.node.json         # TS config for Node
├── vite.config.ts             # Vite configuration
├── tailwind.config.js         # Tailwind CSS configuration
└── postcss.config.js          # PostCSS configuration
```

## Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

### 3. Build for Production

```bash
npm run build
```

### 4. Type Check

```bash
npm run type-check
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Application title
VITE_APP_TITLE=Qallab Clients & Providers Portal

# Development port
VITE_PORT=3001

# API base URL
VITE_API_BASE_URL=http://localhost:8000/api

# Default locale
VITE_DEFAULT_LOCALE=ar

# Fallback locale
VITE_FALLBACK_LOCALE=en
```

## Key Files

### `src/main.ts`
Application entry point - initializes Vue with Pinia, Router, I18n, and Vuetify.

### `src/App.vue`
Root component - watches locale changes and updates page direction (RTL/LTR).

### `src/plugins/vuetify.ts`
Vuetify setup with icons, colors, and bilingual support.

### `tailwind.config.js`
Tailwind CSS configuration with:
- Custom primary color palette
- Content paths for Vue files
- `important: '#app'` for Vuetify compatibility

### `src/plugins/i18n.ts`
Vue I18n setup with Arabic and English translation files.

### `src/services/api/index.ts`
Axios client with:
- Interceptor to automatically add auth token
- Interceptor to add locale in headers
- 401 error handling with automatic logout

### `src/stores/locale.ts`
Pinia store for locale management:
- `currentLocale` - Current locale
- `isRtl` - Is direction right-to-left
- `setLocale()` - Change locale
- `toggleLocale()` - Toggle between languages

### `src/stores/auth.ts`
Pinia store for authentication:
- `user` - User data
- `token` - Auth token
- `isAuthenticated` - Login status
- `login()` / `logout()` - Login and logout methods

## Features

- ✅ Bilingual support (Arabic RTL / English LTR)
- ✅ Responsive design with Tailwind CSS
- ✅ Modern UI with Vuetify 3 + Tailwind CSS
- ✅ API service with Interceptors
- ✅ Complete authentication system
- ✅ Input validation utilities
- ✅ Type-safe development with TypeScript
- ✅ Organized and scalable architecture
- ✅ Client & Provider user types

## License

MIT
