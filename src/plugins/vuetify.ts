// Note: vuetify/styles is imported in main.ts before main.scss for proper CSS order
import { createVuetify } from "vuetify";
import { aliases, mdi } from "vuetify/iconsets/mdi";
import { ar, en } from "vuetify/locale";

// Qallab Design System Colors
const qallabTheme = {
  dark: false,
  colors: {
    // Primary colors
    primary: "#1570EF",
    "primary-25": "#F5FAFF",
    "primary-50": "#EFF8FF",
    "primary-100": "#D1E9FF",
    "primary-300": "#84CAFF",
    "primary-600": "#1570EF",
    "primary-700": "#175CD3",
    // Gray colors
    "gray-300": "#CDD5DF",
    "gray-500": "#697586",
    "gray-700": "#364152",
    "gray-900": "#121926",
    "error-600": "#D92D20",
    // Semantic colors
    secondary: "#364152",
    error: "#F04438",
    warning: "#F79009",
    success: "#12B76A",
    info: "#0BA5EC",
    // Surface colors
    background: "#FFFFFF",
    surface: "#F9FAFB",
  },
  variables: {
    "border-color": "#CDD5DF",
    "border-opacity": 1,
    "border-radius-root": "8px",
    "field-border-opacity": 1,
  },
};

const vuetify = createVuetify({
  icons: {
    defaultSet: "mdi",
    aliases,
    sets: {
      mdi,
    },
  },
  locale: {
    locale: "ar",
    fallback: "en",
    messages: { ar, en },
  },
  theme: {
    defaultTheme: "qallabTheme",
    themes: {
      qallabTheme,
    },
  },
  defaults: {
    global: {
      ripple: false,
    },
    VBtn: {
      variant: "flat",
      rounded: "lg",
    },
    VTextField: {
      variant: "outlined",
      density: "comfortable",
      rounded: "lg",
      color: "primary-300",
      baseColor: "gray-300",
      bgColor: "background",
      hideDetails: true,
    },
    VTextarea: {
      variant: "outlined",
      density: "comfortable",
      rounded: "lg",
      color: "primary-300",
      baseColor: "gray-300",
      bgColor: "background",
      hideDetails: true,
    },
    VSelect: {
      variant: "outlined",
      density: "comfortable",
      rounded: "lg",
      color: "primary-300",
      baseColor: "gray-300",
      bgColor: "background",
      hideDetails: true,
    },
    VCheckbox: {
      color: "primary",
      density: "comfortable",
      hideDetails: true,
    },
  },
});

export default vuetify;
