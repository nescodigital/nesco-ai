export const PLAN_CONFIG = {
  ro: {
    starter: {
      price: 45,
      currency: "RON",
      label: "lei",
      priceId: process.env.STRIPE_PRICE_STARTER_RO,
    },
    pro: {
      price: 99,
      currency: "RON",
      label: "lei",
      priceId: process.env.STRIPE_PRICE_PRO_RO,
    },
    "multi-brand": {
      price: 199,
      currency: "RON",
      label: "lei",
      priceId: process.env.STRIPE_PRICE_MULTI_BRAND_RO,
    },
  },
  en: {
    starter: {
      price: 9,
      currency: "EUR",
      label: "EUR",
      priceId: process.env.STRIPE_PRICE_STARTER_EN,
    },
    pro: {
      price: 19,
      currency: "EUR",
      label: "EUR",
      priceId: process.env.STRIPE_PRICE_PRO_EN,
    },
    "multi-brand": {
      price: 39,
      currency: "EUR",
      label: "EUR",
      priceId: process.env.STRIPE_PRICE_MULTI_BRAND_EN,
    },
  },
} as const;

export type Locale = keyof typeof PLAN_CONFIG;
export type PlanId = keyof (typeof PLAN_CONFIG)["ro"];
