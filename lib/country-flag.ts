// Country name -> ISO 3166-1 alpha-2
const COUNTRY_TO_ISO: Record<string, string> = {
  "argentina": "AR",
  "uruguay": "UY",
  "brasil": "BR", "brazil": "BR",
  "chile": "CL",
  "paraguay": "PY",
  "peru": "PE", "perú": "PE",
  "bolivia": "BO",
  "colombia": "CO",
  "venezuela": "VE",
  "ecuador": "EC",
  "mexico": "MX", "méxico": "MX",
  "estados unidos": "US", "usa": "US", "united states": "US", "eeuu": "US", "ee.uu.": "US",
  "canada": "CA", "canadá": "CA",
  "espana": "ES", "españa": "ES", "spain": "ES",
  "francia": "FR", "france": "FR",
  "italia": "IT", "italy": "IT",
  "alemania": "DE", "germany": "DE",
  "inglaterra": "GB", "reino unido": "GB", "uk": "GB", "united kingdom": "GB",
  "portugal": "PT",
  "paises bajos": "NL", "países bajos": "NL", "holanda": "NL", "netherlands": "NL",
  "belgica": "BE", "bélgica": "BE",
  "suiza": "CH",
  "suecia": "SE",
  "noruega": "NO",
  "dinamarca": "DK",
  "finlandia": "FI",
  "irlanda": "IE",
  "polonia": "PL",
  "rusia": "RU",
  "ucrania": "UA",
  "turquia": "TR", "turquía": "TR",
  "grecia": "GR",
  "japon": "JP", "japón": "JP",
  "china": "CN",
  "india": "IN",
  "australia": "AU",
  "nueva zelanda": "NZ",
  "marruecos": "MA",
  "egipto": "EG",
  "sudafrica": "ZA", "sudáfrica": "ZA",
  "arabia saudita": "SA", "arabia saudí": "SA",
  "emiratos arabes unidos": "AE", "emiratos árabes unidos": "AE",
  "qatar": "QA", "catar": "QA",
  "israel": "IL",
  "corea del sur": "KR",
  "costa rica": "CR",
  "panama": "PA", "panamá": "PA",
  "cuba": "CU",
  "republica dominicana": "DO", "república dominicana": "DO",
  "guatemala": "GT",
  "honduras": "HN",
  "nicaragua": "NI",
  "el salvador": "SV",
  "puerto rico": "PR",
};

export function countryToFlag(country?: string | null): string | null {
  if (!country) return null;
  const key = country.trim().toLowerCase();
  let iso = COUNTRY_TO_ISO[key];
  if (!iso && key.length === 2) iso = key.toUpperCase();
  if (!iso) return null;
  const codePoints = iso
    .toUpperCase()
    .split("")
    .map((c) => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
