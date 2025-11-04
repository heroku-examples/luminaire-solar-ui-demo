/**
 * @typedef {Object} ToolsConfig
 * @property {boolean} postgres_query - Allow AI to query the database
 * @property {boolean} postgres_schema - Allow AI to fetch database schema
 * @property {boolean} html_to_markdown - Allow AI to browse websites
 * @property {boolean} pdf_to_markdown - Allow AI to read PDF documents
 * @property {boolean} code_exec_python - Allow AI to execute Python code
 */

/**
 * @typedef {Object} CacheConfig
 * @property {boolean} schema_cache - Enable database schema caching
 */

/**
 * @typedef {Object} WhitelistUrl
 * @property {number} id - Unique identifier
 * @property {string} url - The whitelisted URL
 * @property {string|null} description - Optional description
 * @property {string} created_at - ISO timestamp
 */

/**
 * @typedef {Object} WhitelistPdf
 * @property {number} id - Unique identifier
 * @property {string} pdf_url - The whitelisted PDF URL
 * @property {string|null} description - Optional description
 * @property {string} created_at - ISO timestamp
 */

/**
 * @typedef {Object} Whitelists
 * @property {WhitelistUrl[]} urls - List of whitelisted URLs
 * @property {WhitelistPdf[]} pdfs - List of whitelisted PDFs
 */

/**
 * @typedef {Object} ToolSettings
 * @property {ToolsConfig} tools - Tool configuration
 * @property {CacheConfig} cache - Cache configuration
 * @property {Whitelists} whitelists - Resource whitelists
 * @property {string} updated_at - ISO timestamp of last update
 */

/**
 * @typedef {Object} UpdateToolSettingsRequest
 * @property {boolean} [postgres_query]
 * @property {boolean} [postgres_schema]
 * @property {boolean} [html_to_markdown]
 * @property {boolean} [pdf_to_markdown]
 * @property {boolean} [code_exec_python]
 * @property {boolean} [schema_cache]
 */

/**
 * @typedef {Object} AddWhitelistUrlRequest
 * @property {string} url - The URL to whitelist
 * @property {string} [description] - Optional description
 */

/**
 * @typedef {Object} AddWhitelistPdfRequest
 * @property {string} pdf_url - The PDF URL to whitelist
 * @property {string} [description] - Optional description
 */

/**
 * @typedef {Object} ApiError
 * @property {string} error - Error type
 * @property {string} message - Error message
 */

/**
 * @typedef {Object} DeleteResponse
 * @property {boolean} success - Success status
 * @property {string} message - Success message
 */

export {};
