import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRouteContext } from '/:core.jsx';
import { title } from '@/theme.js';
import { toolSettingsApi } from '../api/toolSettings';
import { ToggleSwitch } from '../components/ui/ToggleSwitch';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Toast } from '../components/ui/Toast';
import {
  IconRobot,
  IconBolt,
  IconLink,
  IconDatabase,
  IconFileText,
  IconWorldWww,
  IconFileTypePdf,
  IconChartBar,
  IconTrash,
  IconRefresh,
  IconAlertTriangle,
} from '@tabler/icons-react';

export function getMeta(ctx) {
  return {
    title: `${title} - Settings`,
  };
}

export default function Settings() {
  const { state } = useRouteContext();
  const navigate = useNavigate();

  // State
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toggleLoading, setToggleLoading] = useState({});
  const [toasts, setToasts] = useState([]);
  const [resetLoading, setResetLoading] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!state.user) {
      navigate('/');
    }
  }, [state.user, navigate]);

  // Load settings on mount
  useEffect(() => {
    if (state.user && state.authorization) {
      loadSettings();
    }
  }, [state.user, state.authorization]);

  // Toast management
  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, duration: 4000 }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await toolSettingsApi.getSettings(
        state.apiUrl,
        state.authorization
      );
      setSettings(data);
    } catch (err) {
      setError(err.message);
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTool = async (key, value) => {
    if (!settings) return;

    // Optimistic update
    const previousSettings = settings;
    const isCacheKey = key === 'schema_cache';
    if (isCacheKey) {
      setSettings({
        ...settings,
        cache: { ...settings.cache, [key]: value },
      });
    } else {
      setSettings({
        ...settings,
        tools: { ...settings.tools, [key]: value },
      });
    }

    try {
      setToggleLoading({ ...toggleLoading, [key]: true });
      const data = await toolSettingsApi.updateSettings(
        state.apiUrl,
        state.authorization,
        { [key]: value }
      );
      setSettings(data);
      addToast('Settings updated successfully', 'success');
    } catch (err) {
      // Revert on error
      setSettings(previousSettings);
      addToast(err.message, 'error');
    } finally {
      setToggleLoading({ ...toggleLoading, [key]: false });
    }
  };

  const handleResetDemo = async () => {
    try {
      setResetLoading(true);
      const response = await fetch(`${state.apiUrl}/api/admin/reset-demo`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${state.authorization}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to reset demo data');
      }

      const result = await response.json();

      addToast('Demo data reset successfully! Please log in again.', 'success');
      setShowResetDialog(false);

      // Log out user after reset (since demo user was recreated)
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err) {
      addToast(err.message, 'error');
      setResetLoading(false);
    }
  };

  // Don't render if no user
  if (!state.user) {
    return null;
  }

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error && !settings) {
    return <ErrorState message={error} onRetry={loadSettings} />;
  }

  return (
    <div className="pb-28 max-w-7xl mx-auto">
      {/* Page Header */}
      <header className="py-6">
        <h1 className="text-h3 font-semibold text-gray-900">
          AI Assistant Settings
        </h1>
        <p className="text-base text-gray-600 mt-2">
          Configure AI capabilities and manage resource access
        </p>
        {settings && (
          <p className="text-sm text-gray-500 mt-2">
            Last updated: {formatDate(settings.updated_at)}
          </p>
        )}
      </header>

      {settings && (
        <>
          {/* AI Tools Configuration Section */}
          <AIToolsSection
            tools={settings.tools}
            whitelists={settings.whitelists}
            toggleLoading={toggleLoading}
            onToggle={handleToggleTool}
          />

          {/* Performance Settings Section */}
          <PerformanceSection
            cache={settings.cache}
            toggleLoading={toggleLoading}
            onToggle={handleToggleTool}
          />

          {/* Resource Whitelists Section */}
          <WhitelistsSection
            whitelists={settings.whitelists}
            apiUrl={state.apiUrl}
            authorization={state.authorization}
            onUpdate={loadSettings}
            addToast={addToast}
          />

          {/* Demo Management Section */}
          <DemoManagementSection onResetDemo={() => setShowResetDialog(true)} />
        </>
      )}

      {/* Reset Demo Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showResetDialog}
        onClose={() => setShowResetDialog(false)}
        onConfirm={handleResetDemo}
        title="Reset Demo Data?"
        message="This will delete all data and reseed with fresh demo data."
        confirmText="Reset Demo"
        cancelText="Cancel"
        loading={resetLoading}
      />

      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
            duration={toast.duration}
          />
        ))}
      </div>
    </div>
  );
}

// AI Tools Configuration Section
function AIToolsSection({ tools, whitelists, toggleLoading, onToggle }) {
  const toolConfigs = [
    {
      key: 'postgres_query',
      label: 'Database Queries',
      description:
        'Allow the AI to query the database for solar system metrics and analytics',
      Icon: IconDatabase,
    },
    {
      key: 'postgres_schema',
      label: 'Database Schema',
      description: 'Allow the AI to fetch database schema information',
      Icon: IconFileText,
    },
    {
      key: 'html_to_markdown',
      label: 'Web Browsing',
      description:
        'Allow the AI to browse whitelisted websites for information',
      Icon: IconWorldWww,
      warning:
        tools.html_to_markdown && whitelists.urls.length === 0
          ? 'No URLs whitelisted. Add URLs below to enable web browsing.'
          : null,
    },
    {
      key: 'pdf_to_markdown',
      label: 'PDF Document Reading',
      description: 'Allow the AI to read whitelisted PDF documents',
      Icon: IconFileTypePdf,
      warning:
        tools.pdf_to_markdown && whitelists.pdfs.length === 0
          ? 'No PDFs whitelisted. Add PDFs below to enable document reading.'
          : null,
    },
    {
      key: 'code_exec_python',
      label: 'Data Visualization',
      description:
        'Allow the AI to generate charts and visualizations using Python',
      Icon: IconChartBar,
    },
  ];

  return (
    <section className="mb-8">
      <div className="bg-white border-2 border-gray-200 rounded-xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <IconRobot size={28} className="text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-900">AI Tools</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {toolConfigs.map((config) => (
            <ToolToggleCard
              key={config.key}
              config={config}
              checked={tools[config.key]}
              loading={toggleLoading[config.key]}
              onToggle={(value) => onToggle(config.key, value)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// Tool Toggle Card
function ToolToggleCard({ config, checked, loading, onToggle }) {
  const Icon = config.Icon;
  return (
    <div className="p-4 border border-gray-200 rounded-lg hover:border-purple-40 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Icon size={24} className="text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">
              {config.label}
            </h3>
          </div>
          <p className="text-sm text-gray-600">{config.description}</p>
          {config.warning && (
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 flex items-start gap-2">
              <IconAlertTriangle
                size={16}
                className="text-amber-600 flex-shrink-0 mt-0.5"
              />
              <p className="text-sm text-amber-800">{config.warning}</p>
            </div>
          )}
        </div>
        <ToggleSwitch
          id={`toggle-${config.key}`}
          label={config.label}
          checked={checked}
          loading={loading}
          onChange={onToggle}
        />
      </div>
    </div>
  );
}

// Performance Settings Section
function PerformanceSection({ cache, toggleLoading, onToggle }) {
  return (
    <section className="mb-8">
      <div className="bg-white border-2 border-gray-200 rounded-xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <IconBolt size={28} className="text-yellow-500" />
          <h2 className="text-xl font-semibold text-gray-900">
            Performance Settings
          </h2>
        </div>
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Database Schema Cache
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Cache database schema in memory for faster responses. Disable if
                schema changes frequently.
              </p>
              <details className="text-sm text-gray-500">
                <summary className="cursor-pointer hover:text-gray-700">
                  Additional Information
                </summary>
                <p className="mt-2 pl-4 border-l-2 border-gray-300">
                  When enabled, the database schema is cached in memory,
                  reducing query time by approximately 200ms. Disable this
                  setting in development environments where the database schema
                  changes frequently.
                </p>
              </details>
            </div>
            <ToggleSwitch
              id="toggle-schema-cache"
              label="Database Schema Cache"
              checked={cache.schema_cache}
              loading={toggleLoading.schema_cache}
              onChange={(value) => onToggle('schema_cache', value)}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// Whitelists Section (URLs and PDFs)
function WhitelistsSection({
  whitelists,
  apiUrl,
  authorization,
  onUpdate,
  addToast,
}) {
  return (
    <section className="mb-8">
      <div className="bg-white border-2 border-gray-200 rounded-xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <IconLink size={28} className="text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Resource Whitelists
          </h2>
        </div>

        {/* URL Whitelist */}
        <URLWhitelistSection
          urls={whitelists.urls}
          apiUrl={apiUrl}
          authorization={authorization}
          onUpdate={onUpdate}
          addToast={addToast}
        />

        {/* PDF Whitelist */}
        <PDFWhitelistSection
          pdfs={whitelists.pdfs}
          apiUrl={apiUrl}
          authorization={authorization}
          onUpdate={onUpdate}
          addToast={addToast}
        />
      </div>
    </section>
  );
}

// URL Whitelist Section
function URLWhitelistSection({
  urls,
  apiUrl,
  authorization,
  onUpdate,
  addToast,
}) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ url: '', description: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validation
    if (!formData.url) {
      setFormError('URL is required');
      return;
    }

    try {
      new URL(formData.url);
    } catch {
      setFormError('Please enter a valid URL');
      return;
    }

    try {
      setFormLoading(true);
      await toolSettingsApi.addUrl(apiUrl, authorization, formData);
      setFormData({ url: '', description: '' });
      setShowForm(false);
      addToast('URL added to whitelist', 'success');
      onUpdate();
    } catch (err) {
      setFormError(err.message);
      addToast(err.message, 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;
    try {
      setDeleteLoading(true);
      await toolSettingsApi.deleteUrl(apiUrl, authorization, deleteDialog.id);
      addToast('URL removed from whitelist', 'success');
      setDeleteDialog(null);
      onUpdate();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Whitelisted URLs
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Websites the AI assistant can access
      </p>

      {/* URL List */}
      {urls.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <IconLink size={48} className="text-gray-400 mx-auto" />
          <p className="text-gray-600 mt-2">No URLs whitelisted yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Add URLs below to enable web browsing
          </p>
        </div>
      ) : (
        <div className="space-y-3 mb-4">
          {urls.map((item) => (
            <WhitelistItem
              key={item.id}
              Icon={IconWorldWww}
              primaryText={item.url}
              secondaryText={item.description}
              createdAt={item.created_at}
              onDelete={() => setDeleteDialog(item)}
            />
          ))}
        </div>
      )}

      {/* Add URL Button/Form */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full px-4 py-3 bg-purple-40 text-white rounded-lg font-medium hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-40 focus:ring-offset-2 transition-colors"
        >
          + Add URL
        </button>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="border border-gray-300 rounded-lg p-4 bg-gray-50"
        >
          <h4 className="font-semibold text-gray-900 mb-4">Add New URL</h4>
          <div className="mb-4">
            <label
              htmlFor="url"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              URL *
            </label>
            <input
              type="url"
              id="url"
              required
              value={formData.url}
              onChange={(e) =>
                setFormData({ ...formData, url: e.target.value })
              }
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-40 focus:border-transparent"
              disabled={formLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Example: https://example.com
            </p>
          </div>
          <div className="mb-4">
            <label
              htmlFor="url-description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Description (optional)
            </label>
            <input
              type="text"
              id="url-description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Company website"
              maxLength={255}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-40 focus:border-transparent"
              disabled={formLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length}/255
            </p>
          </div>
          {formError && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              <p className="text-sm text-red-800">{formError}</p>
            </div>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setFormData({ url: '', description: '' });
                setFormError('');
              }}
              disabled={formLoading}
              className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="flex-1 px-4 py-2 bg-purple-40 text-white rounded-lg font-medium hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-40 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {formLoading && <Spinner />}
              Add URL
            </button>
          </div>
        </form>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteDialog}
        onClose={() => setDeleteDialog(null)}
        onConfirm={handleDelete}
        title="Remove URL from whitelist?"
        message="The AI assistant will no longer be able to access:"
        displayValue={deleteDialog?.url}
        loading={deleteLoading}
      />
    </div>
  );
}

// PDF Whitelist Section
function PDFWhitelistSection({
  pdfs,
  apiUrl,
  authorization,
  onUpdate,
  addToast,
}) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ pdf_url: '', description: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validation
    if (!formData.pdf_url) {
      setFormError('PDF URL is required');
      return;
    }

    try {
      new URL(formData.pdf_url);
    } catch {
      setFormError('Please enter a valid URL');
      return;
    }

    try {
      setFormLoading(true);
      await toolSettingsApi.addPdf(apiUrl, authorization, formData);
      setFormData({ pdf_url: '', description: '' });
      setShowForm(false);
      addToast('PDF added to whitelist', 'success');
      onUpdate();
    } catch (err) {
      setFormError(err.message);
      addToast(err.message, 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;
    try {
      setDeleteLoading(true);
      await toolSettingsApi.deletePdf(apiUrl, authorization, deleteDialog.id);
      addToast('PDF removed from whitelist', 'success');
      setDeleteDialog(null);
      onUpdate();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Whitelisted PDFs
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        PDF documents the AI assistant can read
      </p>

      {/* PDF List */}
      {pdfs.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <IconFileTypePdf size={48} className="text-gray-400 mx-auto" />
          <p className="text-gray-600 mt-2">No PDFs whitelisted yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Add PDFs below to enable document reading
          </p>
        </div>
      ) : (
        <div className="space-y-3 mb-4">
          {pdfs.map((item) => (
            <WhitelistItem
              key={item.id}
              Icon={IconFileTypePdf}
              primaryText={getFilenameFromUrl(item.pdf_url)}
              secondaryText={item.pdf_url}
              tertiaryText={item.description}
              createdAt={item.created_at}
              onDelete={() => setDeleteDialog(item)}
            />
          ))}
        </div>
      )}

      {/* Add PDF Button/Form */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full px-4 py-3 bg-purple-40 text-white rounded-lg font-medium hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-40 focus:ring-offset-2 transition-colors"
        >
          + Add PDF
        </button>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="border border-gray-300 rounded-lg p-4 bg-gray-50"
        >
          <h4 className="font-semibold text-gray-900 mb-4">Add New PDF</h4>
          <div className="mb-4">
            <label
              htmlFor="pdf-url"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              PDF URL *
            </label>
            <input
              type="url"
              id="pdf-url"
              required
              value={formData.pdf_url}
              onChange={(e) =>
                setFormData({ ...formData, pdf_url: e.target.value })
              }
              placeholder="https://example.com/document.pdf"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-40 focus:border-transparent"
              disabled={formLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Example: https://example.com/document.pdf
            </p>
          </div>
          <div className="mb-4">
            <label
              htmlFor="pdf-description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Description (optional)
            </label>
            <input
              type="text"
              id="pdf-description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Technical specifications document"
              maxLength={255}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-40 focus:border-transparent"
              disabled={formLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length}/255
            </p>
          </div>
          {formError && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              <p className="text-sm text-red-800">{formError}</p>
            </div>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setFormData({ pdf_url: '', description: '' });
                setFormError('');
              }}
              disabled={formLoading}
              className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="flex-1 px-4 py-2 bg-purple-40 text-white rounded-lg font-medium hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-40 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {formLoading && <Spinner />}
              Add PDF
            </button>
          </div>
        </form>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteDialog}
        onClose={() => setDeleteDialog(null)}
        onConfirm={handleDelete}
        title="Remove PDF from whitelist?"
        message="The AI assistant will no longer be able to read:"
        displayValue={deleteDialog?.pdf_url}
        loading={deleteLoading}
      />
    </div>
  );
}

// Whitelist Item Component
function WhitelistItem({
  Icon,
  primaryText,
  secondaryText,
  tertiaryText,
  createdAt,
  onDelete,
}) {
  return (
    <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:border-purple-40 transition-colors bg-white">
      <Icon size={24} className="text-gray-600 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <a
          href={primaryText.startsWith('http') ? primaryText : secondaryText}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-blue-600 hover:text-blue-800 break-all"
        >
          {primaryText}
        </a>
        {secondaryText && (
          <p className="text-xs text-gray-500 mt-1 break-all">
            {secondaryText}
          </p>
        )}
        {tertiaryText && (
          <p className="text-xs text-gray-600 mt-1">{tertiaryText}</p>
        )}
        <p className="text-xs text-gray-400 mt-2">
          Added: {formatDate(createdAt)}
        </p>
      </div>
      <button
        onClick={onDelete}
        className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        aria-label={`Remove ${primaryText}`}
      >
        <IconTrash size={20} />
      </button>
    </div>
  );
}

// Demo Management Section
function DemoManagementSection({ onResetDemo }) {
  return (
    <section className="mb-8">
      <div className="bg-white border-2 border-red-200 rounded-xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <IconRefresh size={28} className="text-red-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Demo Management
          </h2>
        </div>
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Reset Demo Data
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Clear all data and reseed with fresh demo data. This will reset
                all systems, metrics, tool settings, and whitelists to their
                default state.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-md px-3 py-2 flex items-start gap-2">
                <IconAlertTriangle
                  size={16}
                  className="text-amber-600 flex-shrink-0 mt-0.5"
                />
                <p className="text-sm text-amber-800">
                  This action is destructive and cannot be undone. You will need
                  to log in again after the reset.
                </p>
              </div>
            </div>
            <button
              onClick={onResetDemo}
              className="flex-shrink-0 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
            >
              <IconRefresh size={20} />
              Reset Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// Loading Skeleton
function LoadingSkeleton() {
  return (
    <div className="pb-28 max-w-7xl mx-auto animate-pulse">
      <div className="py-6">
        <div className="h-8 bg-gray-300 rounded w-1/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
      </div>
      <div className="space-y-8">
        <div className="bg-gray-200 rounded-xl h-96"></div>
        <div className="bg-gray-200 rounded-xl h-48"></div>
        <div className="bg-gray-200 rounded-xl h-64"></div>
      </div>
    </div>
  );
}

// Error State
function ErrorState({ message, onRetry }) {
  return (
    <div className="pb-28 max-w-7xl mx-auto">
      <div className="text-center py-16">
        <IconAlertTriangle size={64} className="text-red-600 mx-auto" />
        <h2 className="text-2xl font-semibold text-gray-900 mt-4">
          Failed to load settings
        </h2>
        <p className="text-gray-600 mt-2">{message}</p>
        <button
          onClick={onRetry}
          className="mt-6 px-6 py-3 bg-purple-40 text-white rounded-lg font-medium hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-40 focus:ring-offset-2 transition-colors flex items-center gap-2 mx-auto"
        >
          <IconRefresh size={20} />
          Try Again
        </button>
      </div>
    </div>
  );
}

// Utility Components
function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

// Utility Functions
function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

function getFilenameFromUrl(url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
    return filename || url;
  } catch {
    return url;
  }
}
