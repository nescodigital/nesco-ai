// Maps DB values to translation keys used in messages/ro.json and messages/en.json
// under dashboard.contentTypes and dashboard.objectives

export const CONTENT_TYPE_KEY_MAP: Record<string, string> = {
  "Post Facebook": "facebookPost",
  "Post Instagram": "instagramPost",
  "Post LinkedIn": "linkedinPost",
  "Email newsletter": "emailNewsletter",
  "Reclamă Meta Ads": "metaAd",
};

export const OBJECTIVE_KEY_MAP: Record<string, string> = {
  "Vânzare": "sale",
  "Awareness": "awareness",
  "Engagement": "engagement",
  "Promovare ofertă specială": "specialOffer",
};
