// heroApi.js
import { getToken } from '../auth/utils.js';
const API_URL = 'https://api-superheroes-production.up.railway.app/api/heroes';

export async function getHeroes() {
  console.log('[API][getHeroes] Request:', API_URL);
  const res = await fetch(API_URL, { headers: { 'Authorization': 'Bearer ' + getToken() } });
  const data = await res.json();
  console.log('[API][getHeroes] Response:', data);
  if (!res.ok) throw new Error('Error al obtener héroes');
  return data;
}

export async function getHeroById(id) {
  console.log('[API][getHeroById] Request:', `${API_URL}/${id}`);
  const res = await fetch(`${API_URL}/${id}`, { headers: { 'Authorization': 'Bearer ' + getToken() } });
  const data = await res.json();
  console.log('[API][getHeroById] Response:', data);
  if (!res.ok) throw new Error('No se encontró el héroe');
  return data;
}

export async function getHeroesByCity(city) {
  console.log('[API][getHeroesByCity] Request:', `${API_URL}/city/${encodeURIComponent(city)}`);
  const res = await fetch(`${API_URL}/city/${encodeURIComponent(city)}`, { headers: { 'Authorization': 'Bearer ' + getToken() } });
  const data = await res.json();
  console.log('[API][getHeroesByCity] Response:', data);
  if (!res.ok) throw new Error('No se encontraron héroes en esa ciudad');
  return data;
}

export async function createHero(data) {
  console.log('[API][createHero] Request:', data);
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() },
    body: JSON.stringify(data)
  });
  const respData = await res.json();
  console.log('[API][createHero] Response:', respData);
  if (!res.ok) throw new Error('Error al crear héroe');
  return respData;
}

export async function updateHero(id, data) {
  console.log('[API][updateHero] Request:', id, data);
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() },
    body: JSON.stringify(data)
  });
  const respData = await res.json();
  console.log('[API][updateHero] Response:', respData);
  if (!res.ok) throw new Error('Error al actualizar héroe');
  return respData;
}

export async function deleteHero(id) {
  console.log('[API][deleteHero] Request:', id);
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + getToken() }
  });
  const respData = await res.json();
  console.log('[API][deleteHero] Response:', respData);
  if (!res.ok) throw new Error('Error al eliminar héroe');
  return respData;
}
