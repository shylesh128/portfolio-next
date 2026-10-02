/**
 * Country code → name mapping and Vercel geo-header extraction.
 * IP-based location is approximate (city-level at best).
 */

import type { NextApiRequest } from "next";

const COUNTRY_NAMES: Record<string, string> = {
  AF: "Afghanistan",
  AL: "Albania",
  DZ: "Algeria",
  AD: "Andorra",
  AO: "Angola",
  AG: "Antigua and Barbuda",
  AR: "Argentina",
  AM: "Armenia",
  AU: "Australia",
  AT: "Austria",
  AZ: "Azerbaijan",
  BS: "Bahamas",
  BH: "Bahrain",
  BD: "Bangladesh",
  BB: "Barbados",
  BY: "Belarus",
  BE: "Belgium",
  BZ: "Belize",
  BJ: "Benin",
  BT: "Bhutan",
  BO: "Bolivia",
  BA: "Bosnia and Herzegovina",
  BW: "Botswana",
  BR: "Brazil",
  BN: "Brunei",
  BG: "Bulgaria",
  BF: "Burkina Faso",
  BI: "Burundi",
  KH: "Cambodia",
  CM: "Cameroon",
  CA: "Canada",
  CV: "Cape Verde",
  CF: "Central African Republic",
  TD: "Chad",
  CL: "Chile",
  CN: "China",
  CO: "Colombia",
  KM: "Comoros",
  CG: "Congo",
  CD: "DR Congo",
  CR: "Costa Rica",
  CI: "Côte d'Ivoire",
  HR: "Croatia",
  CU: "Cuba",
  CY: "Cyprus",
  CZ: "Czechia",
  DK: "Denmark",
  DJ: "Djibouti",
  DM: "Dominica",
  DO: "Dominican Republic",
  EC: "Ecuador",
  EG: "Egypt",
  SV: "El Salvador",
  GQ: "Equatorial Guinea",
  ER: "Eritrea",
  EE: "Estonia",
  SZ: "Eswatini",
  ET: "Ethiopia",
  FJ: "Fiji",
  FI: "Finland",
  FR: "France",
  GA: "Gabon",
  GM: "Gambia",
  GE: "Georgia",
  DE: "Germany",
  GH: "Ghana",
  GR: "Greece",
  GD: "Grenada",
  GT: "Guatemala",
  GN: "Guinea",
  GW: "Guinea-Bissau",
  GY: "Guyana",
  HT: "Haiti",
  HN: "Honduras",
  HK: "Hong Kong",
  HU: "Hungary",
  IS: "Iceland",
  IN: "India",
  ID: "Indonesia",
  IR: "Iran",
  IQ: "Iraq",
  IE: "Ireland",
  IL: "Israel",
  IT: "Italy",
  JM: "Jamaica",
  JP: "Japan",
  JO: "Jordan",
  KZ: "Kazakhstan",
  KE: "Kenya",
  KI: "Kiribati",
  KP: "North Korea",
  KR: "South Korea",
  KW: "Kuwait",
  KG: "Kyrgyzstan",
  LA: "Laos",
  LV: "Latvia",
  LB: "Lebanon",
  LS: "Lesotho",
  LR: "Liberia",
  LY: "Libya",
  LI: "Liechtenstein",
  LT: "Lithuania",
  LU: "Luxembourg",
  MO: "Macau",
  MG: "Madagascar",
  MW: "Malawi",
  MY: "Malaysia",
  MV: "Maldives",
  ML: "Mali",
  MT: "Malta",
  MH: "Marshall Islands",
  MR: "Mauritania",
  MU: "Mauritius",
  MX: "Mexico",
  FM: "Micronesia",
  MD: "Moldova",
  MC: "Monaco",
  MN: "Mongolia",
  ME: "Montenegro",
  MA: "Morocco",
  MZ: "Mozambique",
  MM: "Myanmar",
  NA: "Namibia",
  NR: "Nauru",
  NP: "Nepal",
  NL: "Netherlands",
  NZ: "New Zealand",
  NI: "Nicaragua",
  NE: "Niger",
  NG: "Nigeria",
  MK: "North Macedonia",
  NO: "Norway",
  OM: "Oman",
  PK: "Pakistan",
  PW: "Palau",
  PS: "Palestine",
  PA: "Panama",
  PG: "Papua New Guinea",
  PY: "Paraguay",
  PE: "Peru",
  PH: "Philippines",
  PL: "Poland",
  PT: "Portugal",
  QA: "Qatar",
  RO: "Romania",
  RU: "Russia",
  RW: "Rwanda",
  KN: "Saint Kitts and Nevis",
  LC: "Saint Lucia",
  VC: "Saint Vincent",
  WS: "Samoa",
  SM: "San Marino",
  ST: "São Tomé and Príncipe",
  SA: "Saudi Arabia",
  SN: "Senegal",
  RS: "Serbia",
  SC: "Seychelles",
  SL: "Sierra Leone",
  SG: "Singapore",
  SK: "Slovakia",
  SI: "Slovenia",
  SB: "Solomon Islands",
  SO: "Somalia",
  ZA: "South Africa",
  SS: "South Sudan",
  ES: "Spain",
  LK: "Sri Lanka",
  SD: "Sudan",
  SR: "Suriname",
  SE: "Sweden",
  CH: "Switzerland",
  SY: "Syria",
  TW: "Taiwan",
  TJ: "Tajikistan",
  TZ: "Tanzania",
  TH: "Thailand",
  TL: "Timor-Leste",
  TG: "Togo",
  TO: "Tonga",
  TT: "Trinidad and Tobago",
  TN: "Tunisia",
  TR: "Turkey",
  TM: "Turkmenistan",
  TV: "Tuvalu",
  UG: "Uganda",
  UA: "Ukraine",
  AE: "UAE",
  GB: "United Kingdom",
  US: "United States",
  UY: "Uruguay",
  UZ: "Uzbekistan",
  VU: "Vanuatu",
  VA: "Vatican City",
  VE: "Venezuela",
  VN: "Vietnam",
  YE: "Yemen",
  ZM: "Zambia",
  ZW: "Zimbabwe",
  PR: "Puerto Rico",
  GU: "Guam",
  VI: "U.S. Virgin Islands",
  AS: "American Samoa",
  MP: "Northern Mariana Islands",
  RE: "Réunion",
  GP: "Guadeloupe",
  MQ: "Martinique",
  GF: "French Guiana",
  YT: "Mayotte",
  NC: "New Caledonia",
  PF: "French Polynesia",
  AW: "Aruba",
  CW: "Curaçao",
  BM: "Bermuda",
  KY: "Cayman Islands",
  GI: "Gibraltar",
  IM: "Isle of Man",
  JE: "Jersey",
  GG: "Guernsey",
  FO: "Faroe Islands",
  GL: "Greenland",
};

export function countryName(code: string): string {
  if (!code || code === "unknown") return "Unknown";
  return COUNTRY_NAMES[code.toUpperCase()] || code;
}

export interface GeoLocation {
  /** ISO 3166-1 alpha-2 code, e.g. "IN" */
  country: string;
  /** Full name, e.g. "India" */
  countryName: string;
  /** Region/state from Vercel header (approximate) */
  region: string;
  /** City from Vercel header (approximate, IP-based) */
  city: string;
  /** IANA timezone, e.g. "Asia/Kolkata" */
  timezone: string;
}

function safeHeader(req: NextApiRequest, name: string): string {
  const value = req.headers[name];
  if (typeof value !== "string") return "";
  try {
    const decoded = decodeURIComponent(value).trim();
    return decoded.length > 0 && decoded.length <= 200 ? decoded : "";
  } catch {
    const trimmed = value.trim();
    return trimmed.length <= 200 ? trimmed : "";
  }
}

export function extractGeoLocation(req: NextApiRequest): GeoLocation {
  const raw = safeHeader(req, "x-vercel-ip-country");
  const country = /^[A-Za-z]{2,3}$/.test(raw) ? raw.toUpperCase() : "unknown";

  return {
    country,
    countryName: countryName(country),
    region: safeHeader(req, "x-vercel-ip-country-region") || "unknown",
    city: safeHeader(req, "x-vercel-ip-city") || "unknown",
    timezone: safeHeader(req, "x-vercel-ip-timezone") || "unknown",
  };
}

/** Format location as "City, Region, Country" — omitting unknown parts. */
export function formatLocation(geo: {
  city?: string;
  region?: string;
  countryName?: string;
  country?: string;
}): string {
  const parts: string[] = [];
  if (geo.city && geo.city !== "unknown") parts.push(geo.city);
  if (geo.region && geo.region !== "unknown") parts.push(geo.region);
  const name = geo.countryName && geo.countryName !== "Unknown" ? geo.countryName : undefined;
  if (name) parts.push(name);
  else if (geo.country && geo.country !== "unknown") parts.push(geo.country);
  return parts.length > 0 ? parts.join(", ") : "Unknown location";
}
