import { useState } from 'react';
import { Image, Modal, Tooltip } from '@mantine/core';
import { Link } from 'react-router-dom';
import { title } from '@/theme.js';
import architecture from '@/assets/img/architecture.png';
import {
  IconSettings,
  IconDatabase,
  IconFileText,
  IconWorldWww,
  IconFileTypePdf,
  IconCode,
  IconExternalLink,
} from '@tabler/icons-react';

export function getMeta(ctx) {
  return {
    title: `${title} - Demo`,
  };
}

export default function Demo() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const tools = [
    {
      name: 'postgres_get_schema',
      displayName: 'Database Schema',
      icon: IconDatabase,
      description:
        'Enables an LLM to query the schema of a Heroku Postgres database. Spins up a one-off dyno to examine the public schema, allowing the LLM to understand database structure.',
      docsUrl:
        'https://devcenter.heroku.com/articles/heroku-inference-tools#heroku-tool-postgres-get-schema',
    },
    {
      name: 'postgres_run_query',
      displayName: 'Database Query',
      icon: IconFileText,
      description:
        'Runs SQL queries against a specified Heroku Postgres database. Uses follower databases (read-only) to ensure the LLM cannot alter your data.',
      docsUrl:
        'https://devcenter.heroku.com/articles/heroku-inference-tools#heroku-tool-postgres-run-query',
    },
    {
      name: 'html_to_markdown',
      displayName: 'Web Browsing',
      icon: IconWorldWww,
      description:
        'Fetches HTML from a URL, converts it to markdown, and delivers it back to the LLM. Enables web scraping and content analysis.',
      docsUrl:
        'https://devcenter.heroku.com/articles/heroku-inference-tools#heroku-tool-html-to-markdown',
    },
    {
      name: 'pdf_to_markdown',
      displayName: 'PDF Reading',
      icon: IconFileTypePdf,
      description:
        'Fetches a PDF from a URL, converts it to markdown, and delivers it back to the LLM. Enables document analysis and information extraction.',
      docsUrl:
        'https://devcenter.heroku.com/articles/heroku-inference-tools#heroku-tool-pdf-to-markdown',
    },
    {
      name: 'code_exec_python',
      displayName: 'Python Code Execution',
      icon: IconCode,
      description:
        'Allows the agent to run Python code with automatic package installation. If errors occur, the agent automatically retries by adjusting code or dependencies.',
      docsUrl:
        'https://devcenter.heroku.com/articles/heroku-inference-tools#heroku-tool-code-exec',
    },
  ];

  return (
    <div className="pb-28 max-w-7xl mx-auto">
      {/* Page Header */}
      <header className="py-6">
        <h1 className="text-h3 font-semibold text-gray-900">
          Demo Architecture
        </h1>
        <p className="text-base text-gray-600 mt-2">
          Luminaire Solar AI Assistant powered by Heroku Managed Inference and
          Agents
        </p>
      </header>

      {/* Demo Configuration Link */}
      <div className="mb-6">
        <Link
          to="/settings"
          className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
        >
          <IconSettings size={20} />
          Demo Configuration
        </Link>
      </div>

      {/* Architecture Diagram */}
      <div className="mb-8">
        <div
          className="cursor-pointer bg-white border-2 border-gray-200 rounded-xl shadow-md p-6 hover:border-purple-400 transition-colors"
          onClick={() => setIsModalOpen(true)}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              System Architecture
            </h2>
            <p className="text-sm text-gray-500">Click to enlarge</p>
          </div>
          <Image
            src={architecture}
            alt="Luminaire Solar Architecture Diagram"
            className="w-full max-w-3xl mx-auto"
          />
        </div>
      </div>

      {/* AI Tools Section */}
      <div className="bg-white border-2 border-gray-200 rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Heroku AI Tools
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          The Luminaire Solar AI Assistant uses Heroku Managed Inference and
          Agents add-on with the following tools. Click on any tool to view
          detailed documentation.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Tooltip
                key={tool.name}
                label={tool.description}
                multiline
                width={300}
                withArrow
                position="top"
              >
                <a
                  href={tool.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:border-purple-400 hover:bg-purple-50/50 hover:shadow-md transition-all duration-200 group"
                >
                  <Icon
                    size={24}
                    className="text-gray-700 group-hover:text-purple-600 flex-shrink-0 mt-0.5 transition-colors"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                        {tool.displayName}
                      </h3>
                      <IconExternalLink
                        size={16}
                        className="text-gray-400 group-hover:text-purple-500 transition-colors"
                      />
                    </div>
                    <p className="text-xs text-gray-600 group-hover:text-gray-700 mt-1 font-mono transition-colors">
                      {tool.name}
                    </p>
                  </div>
                </a>
              </Tooltip>
            );
          })}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Learn more about{' '}
            <a
              href="https://devcenter.heroku.com/articles/heroku-inference-tools"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:text-purple-700 font-medium inline-flex items-center gap-1"
            >
              Heroku Inference Tools
              <IconExternalLink size={14} />
            </a>
          </p>
        </div>
      </div>

      {/* Zoom Modal */}
      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="auto"
        title="Architecture Diagram"
        centered
        fullScreen
        styles={{
          body: {
            padding: '2rem',
            overflow: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
          content: { background: '#ffffff' },
        }}
      >
        <div
          className="flex items-center justify-center p-4 bg-white"
          style={{ width: '100%', height: '100%' }}
        >
          <Image
            src={architecture}
            alt="Luminaire Solar Architecture Diagram - Full Size"
            style={{
              width: '80%',
              height: 'auto',
              maxHeight: '80vh',
              objectFit: 'contain',
              cursor: 'zoom-out',
            }}
            onClick={() => setIsModalOpen(false)}
          />
        </div>
      </Modal>
    </div>
  );
}
