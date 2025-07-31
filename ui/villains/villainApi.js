import { logout } from '../auth/utils.js';
document.getElementById('logoutBtn')?.addEventListener('click', logout);
// villainApi.js
import { getToken } from '../auth/utils.js';
const API_URL = 'https://api-superheroes-production.up.railway.app/api/villains';

export async function getVillains() {
  const res = await fetch(API_URL, { headers: { 'Authorization': 'Bearer ' + getToken() } });
  if (!res.ok) throw new Error('Error al obtener villanos');
  return res.json();
}

export async function getVillainById(id) {
  const res = await fetch(`${API_URL}/${id}`, { headers: { 'Authorization': 'Bearer ' + getToken() } });
  if (!res.ok) throw new Error('No se encontró el villano');
  return res.json();
}

export async function getVillainsByCity(city) {
  const res = await fetch(`${API_URL}/city/${encodeURIComponent(city)}`, { headers: { 'Authorization': 'Bearer ' + getToken() } });
  if (!res.ok) throw new Error('No se encontraron villanos en esa ciudad');
  return res.json();
}

export async function createVillain(data) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error al crear villano');
  return res.json();
}

export async function updateVillain(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error al actualizar villano');
  return res.json();
}

export async function deleteVillain(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + getToken() }
  });
  if (!res.ok) throw new Error('Error al eliminar villano');
  return res.json();
}
