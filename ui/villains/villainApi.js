import { logout } from '../auth/utils.js';
document.getElementById('logoutBtn')?.addEventListener('click', logout);
// villainApi.js
import { getToken } from '../auth/utils.js';
const API_URL = 'https://api-superheroes-production.up.railway.app/api/villains';

export async function getVillains() {
  console.log('[API][getVillains] Request:', API_URL);
  const res = await fetch(API_URL, { headers: { 'Authorization': 'Bearer ' + getToken() } });
  const data = await res.json();
  console.log('[API][getVillains] Response:', data);
  if (!res.ok) throw new Error('Error al obtener villanos');
  return data;
}

export async function getVillainById(id) {
  console.log('[API][getVillainById] Request:', `${API_URL}/${id}`);
  const res = await fetch(`${API_URL}/${id}`, { headers: { 'Authorization': 'Bearer ' + getToken() } });
  const data = await res.json();
  console.log('[API][getVillainById] Response:', data);
  if (!res.ok) throw new Error('No se encontró el villano');
  return data;
}

export async function getVillainsByCity(city) {
  console.log('[API][getVillainsByCity] Request:', `${API_URL}/city/${encodeURIComponent(city)}`);
  const res = await fetch(`${API_URL}/city/${encodeURIComponent(city)}`, { headers: { 'Authorization': 'Bearer ' + getToken() } });
  const data = await res.json();
  console.log('[API][getVillainsByCity] Response:', data);
  if (!res.ok) throw new Error('No se encontraron villanos en esa ciudad');
  return data;
}

export async function createVillain(data) {
  console.log('[API][createVillain] Request:', data);
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() },
    body: JSON.stringify(data)
  });
  const respData = await res.json();
  console.log('[API][createVillain] Response:', respData);
  if (!res.ok) throw new Error('Error al crear villano');
  return respData;
}

export async function updateVillain(id, data) {
  console.log('[API][updateVillain] Request:', id, data);
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() },
    body: JSON.stringify(data)
  });
  const respData = await res.json();
  console.log('[API][updateVillain] Response:', respData);
  if (!res.ok) throw new Error('Error al actualizar villano');
  return respData;
}

export async function deleteVillain(id) {
  console.log('[API][deleteVillain] Request:', id);
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + getToken() }
  });
  const respData = await res.json();
  console.log('[API][deleteVillain] Response:', respData);
  if (!res.ok) throw new Error('Error al eliminar villano');
  return respData;
}
