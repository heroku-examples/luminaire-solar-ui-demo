'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import {
  toolSettingsApi,
  type ToolSettings,
  type ToolsConfig,
  type CacheConfig,
  type Whitelists,
  type WhitelistUrl,
  type WhitelistPdf,
  type UpdateToolSettingsRequest,
  type ToastItem,
} from '@/lib/tool-settings';
import { ToggleSwitch } from '@/components/ui/toggle-switch';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Toast } from '@/components/ui/toast';
import {
  Database,
  FileText,
  Globe,
  FileType,
  BarChart3,
  Zap,
  Link as LinkIcon,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Bot,
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { user, authorization } = useStore();

  // State
  const [settings, setSettings] = useState<ToolSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggleLoading, setToggleLoading] = useState<Record<string, boolean>>(
    {}
  );
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [resetLoading, setResetLoading] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  // Toast management
  const addToast = useCallback(
    (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type, duration: 4000 }]);
    },
    []
  );

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const loadSettings = useCallback(async () => {
    if (!authorization) return;

    try {
      setLoading(true);
      setError(null);
      const data = await toolSettingsApi.getSettings(authorization);
      setSettings(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load settings';
      setError(message);
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }, [authorization, addToast]);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  // Load settings on mount
  useEffect(() => {
    if (user && authorization) {
      loadSettings();
    }
  }, [user, authorization, loadSettings]);

  const handleToggleTool = async (key: string, value: boolean) => {
    if (!settings || !authorization) return;

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
      const data = await toolSettingsApi.updateSettings(authorization, {
        [key]: value,
      } as UpdateToolSettingsRequest);
      setSettings(data);
      addToast('Settings updated successfully', 'success');
    } catch (err) {
      // Revert on error
      setSettings(previousSettings);
      const message =
        err instanceof Error ? err.message : 'Failed to update settings';
      addToast(message, 'error');
    } finally {
      setToggleLoading({ ...toggleLoading, [key]: false });
    }
  };

  const handleResetDemo = async () => {
    if (!authorization) return;

    try {
      setResetLoading(true);
      const response = await fetch('/api/admin/reset-demo', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authorization}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to reset demo data');
      }

      await response.json();

      addToast('Demo data reset successfully! Please log in again.', 'success');
      setShowResetDialog(false);

      // Log out user after reset (since demo user was recreated)
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to reset demo';
      addToast(message, 'error');
      setResetLoading(false);
    }
  };

  // Don't render if no user
  if (!user) {
    return null;
  }

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error && !settings) {
    return <ErrorState message={error} onRetry={loadSettings} />;
  }

  return (
    <div className="pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <header className="py-6">
        <h1 className="text-3xl font-semibold text-gray-900">
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
            authorization={authorization || ''}
            onUpdate={loadSettings}
            addToast={addToast}
          />

          {/* Demo Management Section - Only show if user is logged in */}
          {user && (
            <DemoManagementSection
              onResetDemo={() => setShowResetDialog(true)}
            />
          )}
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
function AIToolsSection({
  tools,
  whitelists,
  toggleLoading,
  onToggle,
}: {
  tools: ToolsConfig;
  whitelists: Whitelists;
  toggleLoading: Record<string, boolean>;
  onToggle: (key: string, value: boolean) => void;
}) {
  const toolConfigs: ToolConfig[] = [
    {
      key: 'postgres_query',
      label: 'Database Queries',
      description:
        'Allow the AI to query the database for solar system metrics and analytics',
      Icon: Database,
    },
    {
      key: 'postgres_schema',
      label: 'Database Schema',
      description: 'Allow the AI to fetch database schema information',
      Icon: FileText,
    },
    {
      key: 'html_to_markdown',
      label: 'Web Browsing',
      description:
        'Allow the AI to browse whitelisted websites for information',
      Icon: Globe,
      warning:
        tools.html_to_markdown && whitelists.urls.length === 0
          ? 'No URLs whitelisted. Add URLs below to enable web browsing.'
          : null,
    },
    {
      key: 'pdf_to_markdown',
      label: 'PDF Document Reading',
      description: 'Allow the AI to read whitelisted PDF documents',
      Icon: FileType,
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
      Icon: BarChart3,
    },
  ];

  return (
    <section className="mb-8">
      <div className="bg-white border-2 border-gray-200 rounded-xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bot size={28} className="text-purple-600" />
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

interface ToolConfig {
  key: keyof ToolsConfig;
  label: string;
  description: string;
  Icon: React.ComponentType<{ className?: string; size?: number }>;
  warning?: string | null;
}

// Tool Toggle Card
function ToolToggleCard({
  config,
  checked,
  loading,
  onToggle,
}: {
  config: ToolConfig;
  checked: boolean;
  loading: boolean;
  onToggle: (value: boolean) => void;
}) {
  const Icon = config.Icon;
  return (
    <div className="p-4 border border-gray-200 rounded-lg hover:border-purple-600 transition-colors">
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
              <AlertTriangle
                size={16}
                className="text-amber-600 shrink-0 mt-0.5"
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
function PerformanceSection({
  cache,
  toggleLoading,
  onToggle,
}: {
  cache: CacheConfig;
  toggleLoading: Record<string, boolean>;
  onToggle: (key: string, value: boolean) => void;
}) {
  return (
    <section className="mb-8">
      <div className="bg-white border-2 border-gray-200 rounded-xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <Zap size={28} className="text-yellow-500" />
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
  authorization,
  onUpdate,
  addToast,
}: {
  whitelists: Whitelists;
  authorization: string;
  onUpdate: () => void;
  addToast: (message: string, type?: 'success' | 'error' | 'warning') => void;
}) {
  return (
    <section className="mb-8">
      <div className="bg-white border-2 border-gray-200 rounded-xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <LinkIcon size={28} className="text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Resource Whitelists
          </h2>
        </div>

        {/* URL Whitelist */}
        <URLWhitelistSection
          urls={whitelists.urls}
          authorization={authorization}
          onUpdate={onUpdate}
          addToast={addToast}
        />

        {/* PDF Whitelist */}
        <PDFWhitelistSection
          pdfs={whitelists.pdfs}
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
  authorization,
  onUpdate,
  addToast,
}: {
  urls: WhitelistUrl[];
  authorization: string;
  onUpdate: () => void;
  addToast: (message: string, type?: 'success' | 'error' | 'warning') => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ url: '', description: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<WhitelistUrl | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
      await toolSettingsApi.addUrl(authorization, formData);
      setFormData({ url: '', description: '' });
      setShowForm(false);
      addToast('URL added to whitelist', 'success');
      onUpdate();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add URL';
      setFormError(message);
      addToast(message, 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;
    try {
      setDeleteLoading(true);
      await toolSettingsApi.deleteUrl(authorization, deleteDialog.id);
      addToast('URL removed from whitelist', 'success');
      setDeleteDialog(null);
      onUpdate();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete URL';
      addToast(message, 'error');
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
          <LinkIcon size={48} className="text-gray-400 mx-auto" />
          <p className="text-gray-600 mt-2">No URLs whitelisted yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Add URLs below to enable web browsing
          </p>
        </div>
      ) : (
        <div className="space-y-3 mb-4">
          {urls.map((item: WhitelistUrl) => (
            <WhitelistItem
              key={item.id}
              Icon={Globe}
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
          className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 transition-colors"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
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
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
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

// PDF Whitelist Section (similar to URL section)
function PDFWhitelistSection({
  pdfs,
  authorization,
  onUpdate,
  addToast,
}: {
  pdfs: WhitelistPdf[];
  authorization: string;
  onUpdate: () => void;
  addToast: (message: string, type?: 'success' | 'error' | 'warning') => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ pdf_url: '', description: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<WhitelistPdf | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
      await toolSettingsApi.addPdf(authorization, formData);
      setFormData({ pdf_url: '', description: '' });
      setShowForm(false);
      addToast('PDF added to whitelist', 'success');
      onUpdate();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add PDF';
      setFormError(message);
      addToast(message, 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;
    try {
      setDeleteLoading(true);
      await toolSettingsApi.deletePdf(authorization, deleteDialog.id);
      addToast('PDF removed from whitelist', 'success');
      setDeleteDialog(null);
      onUpdate();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete PDF';
      addToast(message, 'error');
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
          <FileType size={48} className="text-gray-400 mx-auto" />
          <p className="text-gray-600 mt-2">No PDFs whitelisted yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Add PDFs below to enable document reading
          </p>
        </div>
      ) : (
        <div className="space-y-3 mb-4">
          {pdfs.map((item: WhitelistPdf) => (
            <WhitelistItem
              key={item.id}
              Icon={FileType}
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
          className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 transition-colors"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
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
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
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
}: {
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  primaryText: string;
  secondaryText?: string | null;
  tertiaryText?: string | null;
  createdAt: string;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:border-purple-600 transition-colors bg-white">
      <Icon size={24} className="text-gray-600 shrink-0" />
      <div className="flex-1 min-w-0">
        <a
          href={
            primaryText.startsWith('http')
              ? primaryText
              : secondaryText || undefined
          }
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
        className="shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        aria-label={`Remove ${primaryText}`}
      >
        <Trash2 size={20} />
      </button>
    </div>
  );
}

// Demo Management Section
function DemoManagementSection({ onResetDemo }: { onResetDemo: () => void }) {
  return (
    <section className="mb-8">
      <div className="bg-white border-2 border-red-200 rounded-xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <RefreshCw size={28} className="text-red-600" />
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
                <AlertTriangle
                  size={16}
                  className="text-amber-600 shrink-0 mt-0.5"
                />
                <p className="text-sm text-amber-800">
                  This action is destructive and cannot be undone.
                </p>
              </div>
            </div>
            <button
              onClick={onResetDemo}
              className="shrink-0 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
            >
              <RefreshCw size={20} />
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
    <div className="pb-28 max-w-7xl mx-auto animate-pulse px-4 sm:px-6 lg:px-8">
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
function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center py-16">
        <AlertTriangle size={64} className="text-red-600 mx-auto" />
        <h2 className="text-2xl font-semibold text-gray-900 mt-4">
          Failed to load settings
        </h2>
        <p className="text-gray-600 mt-2">{message}</p>
        <button
          onClick={onRetry}
          className="mt-6 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 transition-colors flex items-center gap-2 mx-auto"
        >
          <RefreshCw size={20} />
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
function formatDate(dateString: string) {
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

function getFilenameFromUrl(url: string) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
    return filename || url;
  } catch {
    return url;
  }
}
