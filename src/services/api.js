const API_BASE_URL = 'https://localhost:7294/api';

function getAuthHeaders() {
  const token = localStorage.getItem('chitospare_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

function joinUrl(base, endpoint) {
  const b = base.endsWith('/') ? base.slice(0, -1) : base;
  const e = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
  return b + e;
}

export const api = {
  async get(endpoint) {
    const response = await fetch(joinUrl(API_BASE_URL, endpoint), {
      headers: { ...getAuthHeaders() }
    });
    if (!response.ok) {
      let errorMessage = 'API error';
      try {
        const errData = await response.json();
        errorMessage = errData.message || errData.Message || errorMessage;
      } catch {
        const textError = await response.text().catch(() => '');
        errorMessage = textError || `API error (${response.status})`;
      }
      throw new Error(errorMessage);
    }
    return response.json();
  },

  async post(endpoint, data) {
    const response = await fetch(joinUrl(API_BASE_URL, endpoint), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      let errorMessage = 'API error';
      try {
        const errData = await response.json();
        errorMessage = errData.message || errData.Message || errorMessage;
      } catch {
        const textError = await response.text().catch(() => '');
        errorMessage = textError || `API error (${response.status})`;
      }
      throw new Error(errorMessage);
    }
    return response.json();
  },

  async put(endpoint, data) {
    const response = await fetch(joinUrl(API_BASE_URL, endpoint), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      let errorMessage = 'API error';
      try {
        const errData = await response.json();
        errorMessage = errData.message || errData.Message || errorMessage;
      } catch {
        const textError = await response.text().catch(() => '');
        errorMessage = textError || `API error (${response.status})`;
      }
      throw new Error(errorMessage);
    }
    return response.json();
  },

  async delete(endpoint) {
    const response = await fetch(joinUrl(API_BASE_URL, endpoint), {
      method: 'DELETE'
    });
    if (!response.ok) {
      let errorMessage = 'API error';
      try {
        const errData = await response.json();
        errorMessage = errData.message || errData.Message || errorMessage;
      } catch {
        const textError = await response.text().catch(() => '');
        errorMessage = textError || `API error (${response.status})`;
      }
      throw new Error(errorMessage);
    }
    return response.json();
  }
};
