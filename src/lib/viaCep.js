/**
 * viaCep — Busca endereço a partir do CEP usando a API pública do ViaCEP
 * https://viacep.com.br
 */
export async function fetchAddressByCep(cep) {
  const cleanCep = cep.replace(/\D/g, '');

  if (cleanCep.length !== 8) {
    throw new Error('CEP inválido. Digite os 8 números.');
  }

  const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);

  if (!response.ok) {
    throw new Error('Não foi possível consultar o CEP agora. Tente novamente.');
  }

  const data = await response.json();

  if (data.erro) {
    throw new Error('CEP não encontrado.');
  }

  return {
    street: data.logradouro || '',
    neighborhood: data.bairro || '',
    city: data.localidade || '',
    state: data.uf || '',
  };
}

/** Máscara simples de CEP: 00000-000 */
export function maskCep(value) {
  return value
    .replace(/\D/g, '')
    .slice(0, 8)
    .replace(/^(\d{5})(\d)/, '$1-$2');
}
