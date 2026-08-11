export interface NavCategoryLink {
  slug: string;
  label: string;
  description: string;
}

// Fixed top-level information architecture (section 5 of the plan). The
// category *content* (name/description shown on the page itself) still
// comes from the database — this is just the stable site navigation.
export const PRODUCT_CATEGORIES: NavCategoryLink[] = [
  {
    slug: 'bockmaskiner',
    label: 'Bockmaskiner',
    description: 'GMS armeringsbockmaskiner',
  },
  {
    slug: 'klippmaskiner',
    label: 'Klippmaskiner',
    description: 'GMS armeringsklippmaskiner',
  },
  {
    slug: 'handhallna',
    label: 'Handhållna maskiner',
    description: 'Batteridrivna verktyg från Ogura',
  },
  {
    slug: 'industrilosningar',
    label: 'Industrilösningar',
    description: 'GMS Matrix, Synclone och SLS 12',
  },
  {
    slug: 'stationer-forlager',
    label: 'Stationer & förlager',
    description: 'Armeringsstationer och förlager',
  },
];

export const DOCUMENTATION_BRANDS = [
  { slug: 'gms', label: 'GMS-dokumentation' },
  { slug: 'ogura', label: 'Ogura-dokumentation' },
] as const;

export const CONTACT = {
  name: 'Per Lindgren',
  company: 'Pär Bergman Armeringsmaskiner AB',
  address: 'Beckombergavägen 213, 168 63 Bromma',
  phone: '070-717 29 55',
  phoneHref: 'tel:+46707172955',
  email: 'per.lindgren@armeringsmaskiner.se',
};
