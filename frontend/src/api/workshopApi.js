// API helper functions for communicating with the workshop microservice.
//
// The base URL can be configured via the REACT_APP_WORKSHOP_API_URL
// environment variable.  If not provided, it defaults to
// http://localhost:8001.  Each function returns a promise that
// resolves to the parsed JSON response or throws an error if the
// network request fails.

const API_URL = process.env.REACT_APP_WORKSHOP_API_URL || 'http://localhost:8001';

// Helper to handle fetch responses
async function handleResponse(res) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  // If no content (204), return null
  if (res.status === 204) return null;
  return res.json();
}

export async function getWorkshops() {
  const res = await fetch(`${API_URL}/workshops`);
  return handleResponse(res);
}

export async function getWorkshop(id) {
  const res = await fetch(`${API_URL}/workshops/${id}`);
  return handleResponse(res);
}

export async function createWorkshop(workshop) {
  const res = await fetch(`${API_URL}/workshops`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(workshop),
  });
  return handleResponse(res);
}

export async function updateWorkshop(id, data) {
  const res = await fetch(`${API_URL}/workshops/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteWorkshop(id) {
  const res = await fetch(`${API_URL}/workshops/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(res);
}

export async function createSection(workshopId, section) {
  const res = await fetch(`${API_URL}/workshops/${workshopId}/sections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(section),
  });
  return handleResponse(res);
}

export async function updateSection(sectionId, data) {
  const res = await fetch(`${API_URL}/workshops/sections/${sectionId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteSection(sectionId) {
  const res = await fetch(`${API_URL}/workshops/sections/${sectionId}`, {
    method: 'DELETE',
  });
  return handleResponse(res);
}

export async function createQuestion(sectionId, question) {
  const res = await fetch(`${API_URL}/workshops/sections/${sectionId}/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(question),
  });
  return handleResponse(res);
}

export async function updateQuestion(questionId, data) {
  const res = await fetch(`${API_URL}/workshops/questions/${questionId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteQuestion(questionId) {
  const res = await fetch(`${API_URL}/workshops/questions/${questionId}`, {
    method: 'DELETE',
  });
  return handleResponse(res);
}