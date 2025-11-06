/**
 * Tool Settings Types
 */
export interface ToolsConfig {
  postgres_query: boolean;
  postgres_schema: boolean;
  html_to_markdown: boolean;
  pdf_to_markdown: boolean;
  code_exec_python: boolean;
}

export interface CacheConfig {
  schema_cache: boolean;
}

export interface WhitelistUrl {
  id: number;
  url: string;
  description: string | null;
  created_at: string;
}

export interface WhitelistPdf {
  id: number;
  pdf_url: string;
  description: string | null;
  created_at: string;
}

export interface Whitelists {
  urls: WhitelistUrl[];
  pdfs: WhitelistPdf[];
}

export interface ToolSettings {
  tools: ToolsConfig;
  cache: CacheConfig;
  whitelists: Whitelists;
  updated_at: string;
}

export interface UpdateToolSettingsRequest {
  postgres_query?: boolean;
  postgres_schema?: boolean;
  html_to_markdown?: boolean;
  pdf_to_markdown?: boolean;
  code_exec_python?: boolean;
  schema_cache?: boolean;
}

export interface AddWhitelistUrlRequest {
  url: string;
  description?: string;
}

export interface AddWhitelistPdfRequest {
  pdf_url: string;
  description?: string;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

export interface ToastItem {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning';
  duration: number;
}

/**
 * Makes an authenticated fetch request
 */
async function fetchWithAuth(
  url: string,
  options: {
    method?: string;
    body?: string;
    headers?: Record<string, string>;
  } = {},
  token: string
) {
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
   */
  getSettings: (token: string): Promise<ToolSettings> =>
    fetchWithAuth('/api/tool-settings', {}, token),

  /**
   * Update tool settings (partial updates supported)
   */
  updateSettings: (
    token: string,
    updates: UpdateToolSettingsRequest
  ): Promise<ToolSettings> =>
    fetchWithAuth(
      '/api/tool-settings',
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      },
      token
    ),

  /**
   * Add a URL to the whitelist
   */
  addUrl: (
    token: string,
    data: AddWhitelistUrlRequest
  ): Promise<WhitelistUrl> =>
    fetchWithAuth(
      '/api/tool-settings/whitelists/urls',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      token
    ),

  /**
   * Delete a URL from the whitelist
   */
  deleteUrl: (token: string, id: number): Promise<DeleteResponse> =>
    fetchWithAuth(
      `/api/tool-settings/whitelists/urls/${id}`,
      {
        method: 'DELETE',
      },
      token
    ),

  /**
   * Add a PDF to the whitelist
   */
  addPdf: (
    token: string,
    data: AddWhitelistPdfRequest
  ): Promise<WhitelistPdf> =>
    fetchWithAuth(
      '/api/tool-settings/whitelists/pdfs',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      token
    ),

  /**
   * Delete a PDF from the whitelist
   */
  deletePdf: (token: string, id: number): Promise<DeleteResponse> =>
    fetchWithAuth(
      `/api/tool-settings/whitelists/pdfs/${id}`,
      {
        method: 'DELETE',
      },
      token
    ),
};
