// API helper functions for communicating with the auth microservice.
//
// The base URL can be configured via the REACT_APP_AUTH_API_URL
// environment variable. If not provided, it defaults to
// http://localhost:8000. Each function returns a promise that
// resolves to the parsed JSON response or throws an error.

const API_URL = process.env.REACT_APP_AUTH_API_URL || 'http://localhost:8000';

async function handleResponse(res) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
}

export async function registerUser({ email, password }) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
}

export async function loginUser({ email, password }) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
}

export async function getCurrentUser(accessToken) {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return handleResponse(res);
}

export async function forgotPassword(email) {
  const res = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return handleResponse(res);
}

// ================== Admin-only user management calls ==================

// Get list of all users. Requires admin token.
export async function getUsers(accessToken) {
  const res = await fetch(`${API_URL}/auth/users`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return handleResponse(res);
}

// Get a single user by ID. Requires admin token.
export async function getUserById(id, accessToken) {
  const res = await fetch(`${API_URL}/auth/users/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return handleResponse(res);
}

// Update a user as admin. "data" is an object containing fields to update.
export async function adminUpdateUser(id, data, accessToken) {
  const res = await fetch(`${API_URL}/auth/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

// Soft delete a user by ID (marks inactive). Requires admin token.
export async function adminDeleteUser(id, accessToken) {
  const res = await fetch(`${API_URL}/auth/users/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return handleResponse(res);
}

// -------------------- Bulk operations --------------------

// Register multiple users then update their roles/status.
// Each item in "users" should have: email, password, username,
// role (admin|student) and optional status (active|inactive).
export async function bulkRegisterUsers(users, accessToken) {
  const results = [];
  for (const user of users) {
    // First create the user via the public register endpoint
    const created = await registerUser({
      email: user.email,
      password: user.password,
    });
    // Immediately update fields that register does not cover
    await adminUpdateUser(
      created.id,
      {
        username: user.username || created.email.split('@')[0],
        is_admin: user.role === 'admin',
        is_active: user.status !== 'inactive',
      },
      accessToken
    );
    results.push(created);
  }
  return results;
}

// Delete many users at once
export async function bulkDeleteUsers(ids, accessToken) {
  for (const id of ids) {
    await adminDeleteUser(id, accessToken);
  }
}