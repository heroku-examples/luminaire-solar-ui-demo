/**
 * API helper functions for tool settings management
 * @module api/toolSettings
 */

/**
 * Makes an authenticated fetch request
 * @param {string} url - API endpoint URL
 * @param {RequestInit} options - Fetch options
 * @param {string} token - JWT authorization token
 * @returns {Promise<Response>}
 * @throws {Error} If request fails or unauthorized
 */
async function fetchWithAuth(url, options = {}, token) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (response.status === 401) {
    // Redirect to login or refresh token
    window.location.href = '/';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'Request failed',
    }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}

/**
 * Tool Settings API
 */
export const toolSettingsApi = {
  /**
   * Get current tool settings
   * @param {string} apiUrl - Base API URL
   * @param {string} token - JWT token
   * @returns {Promise<import('../types/toolSettings').ToolSettings>}
   */
  getSettings: (apiUrl, token) =>
    fetchWithAuth(`${apiUrl}/api/tool-settings`, {}, token),

  /**
   * Update tool settings (partial updates supported)
   * @param {string} apiUrl - Base API URL
   * @param {string} token - JWT token
   * @param {import('../types/toolSettings').UpdateToolSettingsRequest} updates
   * @returns {Promise<import('../types/toolSettings').ToolSettings>}
   */
  updateSettings: (apiUrl, token, updates) =>
    fetchWithAuth(
      `${apiUrl}/api/tool-settings`,
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      },
      token
    ),

  /**
   * Add a URL to the whitelist
   * @param {string} apiUrl - Base API URL
   * @param {string} token - JWT token
   * @param {import('../types/toolSettings').AddWhitelistUrlRequest} data
   * @returns {Promise<import('../types/toolSettings').WhitelistUrl>}
   */
  addUrl: (apiUrl, token, data) =>
    fetchWithAuth(
      `${apiUrl}/api/tool-settings/whitelists/urls`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      token
    ),

  /**
   * Delete a URL from the whitelist
   * @param {string} apiUrl - Base API URL
   * @param {string} token - JWT token
   * @param {number} id - URL whitelist entry ID
   * @returns {Promise<import('../types/toolSettings').DeleteResponse>}
   */
  deleteUrl: (apiUrl, token, id) =>
    fetchWithAuth(
      `${apiUrl}/api/tool-settings/whitelists/urls/${id}`,
      {
        method: 'DELETE',
      },
      token
    ),

  /**
   * Add a PDF to the whitelist
   * @param {string} apiUrl - Base API URL
   * @param {string} token - JWT token
   * @param {import('../types/toolSettings').AddWhitelistPdfRequest} data
   * @returns {Promise<import('../types/toolSettings').WhitelistPdf>}
   */
  addPdf: (apiUrl, token, data) =>
    fetchWithAuth(
      `${apiUrl}/api/tool-settings/whitelists/pdfs`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      token
    ),

  /**
   * Delete a PDF from the whitelist
   * @param {string} apiUrl - Base API URL
   * @param {string} token - JWT token
   * @param {number} id - PDF whitelist entry ID
   * @returns {Promise<import('../types/toolSettings').DeleteResponse>}
   */
  deletePdf: (apiUrl, token, id) =>
    fetchWithAuth(
      `${apiUrl}/api/tool-settings/whitelists/pdfs/${id}`,
      {
        method: 'DELETE',
      },
      token
    ),
};
