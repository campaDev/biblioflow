export const siteInfo = {
  name: "Biblioflow",
  description:
    "Librería de alto rendimiento con la mejor selección de títulos y envíos a todo Paraguay.",
  url: "https://biblioflow.com.py",

  contact: {
    email: "hola@biblioflow.com.py",
    phone: "+595981123456",
    whatsapp: "595981123456",
    address: "Asunción, Paraguay",
    googleMapsLink: "https://maps.google.com/...", // Útil para el Footer
  },

  social: {
    instagram: "https://instagram.com/biblioflowpy",
    facebook: "https://facebook.com/biblioflowpy",
    twitter: "https://twitter.com/biblioflow",
  },

  // Configuración regional y de moneda
  localization: {
    locale: "es-PY",
    currency: "PYG",
    currencySymbol: "Gs.",
    timeZone: "America/Asuncion",
  },

  // Lógica de negocio (Centralizada para componentes)
  business: {
    shippingMinFree: 250000, // Envío gratis a partir de 250.000 Gs.
    standardShippingCost: 20000,
    allowPreOrders: true,
  },

  geo: {
    region: "PY",
    placename: "Asunción",
    latitude: -25.2867,
    longitude: -57.647,
  },

  // Horarios para JSON-LD y UI
  openingHours: [
    { day: "Mo-Fr", opens: "08:00", closes: "18:00" },
    { day: "Sa", opens: "09:00", closes: "13:00" },
  ],
};

export type SiteInfo = typeof siteInfo;
