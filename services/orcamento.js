const BASE_URL = '/api/orcamento';

async function fetchAndUnwrap(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  const json = await res.json();
  if (json && typeof json === 'object') {
    if ('success' in json) {
      if (json.success === false) {
        throw new Error(json.error || 'Ocorreu um erro ao processar a solicitação.');
      }
      return json.data;
    }
  }
  return json;
}

export async function getCentros() {
  return fetchAndUnwrap(`${BASE_URL}/centros`);
}

export async function getConvenios() {
  return fetchAndUnwrap(`${BASE_URL}/convenios`);
}

export async function getProcedimentosPreco(convenioId) {
  const url = convenioId 
    ? `${BASE_URL}/procedimentos-preco?convenio=${convenioId}` 
    : `${BASE_URL}/procedimentos-preco`;
  return fetchAndUnwrap(url);
}
