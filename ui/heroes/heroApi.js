// heroApi.js
import { getToken } from '../auth/utils.js';
const API_URL = 'https://api-superheroes-production.up.railway.app/api/heroes';

export async function getHeroes() {
  const res = await fetch(API_URL, { headers: { 'Authorization': 'Bearer ' + getToken() } });
  if (!res.ok) throw new Error('Error al obtener héroes');
  return res.json();
}

export async function getHeroById(id) {
  const res = await fetch(`${API_URL}/${id}`, { headers: { 'Authorization': 'Bearer ' + getToken() } });
  if (!res.ok) throw new Error('No se encontró el héroe');
  return res.json();
}

export async function getHeroesByCity(city) {
  const res = await fetch(`${API_URL}/city/${encodeURIComponent(city)}`, { headers: { 'Authorization': 'Bearer ' + getToken() } });
  if (!res.ok) throw new Error('No se encontraron héroes en esa ciudad');
  return res.json();
}

export async function createHero(data) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error al crear héroe');
  return res.json();
}

export async function updateHero(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error al actualizar héroe');
  return res.json();
}

export async function deleteHero(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + getToken() }
  });
  if (!res.ok) throw new Error('Error al eliminar héroe');
  return res.json();
}
