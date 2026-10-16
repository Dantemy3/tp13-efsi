const FLAGS_API = 'https://countriesnow.space/api/v0.1/countries/flag/images';
const CAPITALS_API = 'https://countriesnow.space/api/v0.1/countries/capital';

/**
 * Trae todos los países con sus banderas.
 * Retorna array de { name, flag }
 */
export async function fetchFlags() {
  const response = await fetch(FLAGS_API);
  if (!response.ok) throw new Error('Error al obtener banderas');
  const json = await response.json();
  // La API devuelve { data: [{ name, flag }] }
  return json.data;
}

/**
 * Trae todos los países con sus capitales.
 * Retorna array de { name, capital }
 */
export async function fetchCapitals() {
  const response = await fetch(CAPITALS_API);
  if (!response.ok) throw new Error('Error al obtener capitales');
  const json = await response.json();
  return json.data;
}
