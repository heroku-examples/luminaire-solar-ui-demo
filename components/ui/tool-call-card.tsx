'use client';

import { useState } from 'react';
import {
  Database,
  FileText,
  Globe,
  FileType,
  Code,
  Terminal,
  Wrench,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ToolCallCardProps {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: string;
  timestamp?: string;
}

const getToolIcon = (toolName: string) => {
  const iconMap: Record<
    string,
    React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  > = {
    html_to_markdown: Globe,
    pdf_to_markdown: FileType,
    code_exec_python: Code,
    'mcp/code_exec_python': Code,
    code_exec_ruby: Code,
    code_exec_node: Code,
    code_exec_go: Code,
    postgres_get_schema: FileText,
    postgres_run_query: Database,
    dyno_run_command: Terminal,
  };

  return iconMap[toolName] || Wrench;
};

const getToolDisplayName = (toolName: string): string => {
  const nameMap: Record<string, string> = {
    postgres_run_query: 'Database Query',
    postgres_get_schema: 'Fetch Schema',
    code_exec_python: 'Python Execution',
    'mcp/code_exec_python': 'Python Execution',
    code_exec_ruby: 'Ruby Execution',
    code_exec_node: 'Node.js Execution',
    code_exec_go: 'Go Execution',
    html_to_markdown: 'Web Fetch',
    pdf_to_markdown: 'PDF Reader',
    dyno_run_command: 'Command Execution',
  };

  return nameMap[toolName] || toolName;
};

const formatArguments = (
  toolName: string,
  args: Record<string, unknown>
): React.ReactNode => {
  // Special formatting for SQL queries
  if (toolName === 'postgres_run_query' && (args.query || args.pg_query)) {
    const query = String(args.query || args.pg_query);
    return (
      <div className="space-y-2">
        <div className="text-xs font-medium text-gray-600">Query:</div>
        <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto break-words whitespace-pre-wrap">
          <code>{query}</code>
        </pre>
      </div>
    );
  }

  // Special formatting for code execution
  if (
    (toolName.startsWith('code_exec_') || toolName.includes('/code_exec_')) &&
    args.code
  ) {
    const code = String(args.code);
    // Extract language from tool name (e.g., "code_exec_python" or "mcp/code_exec_python" -> "python")
    const language = toolName.includes('/')
      ? toolName.split('/')[1].replace('code_exec_', '')
      : toolName.replace('code_exec_', '');
    return (
      <div className="space-y-2">
        <div className="text-xs font-medium text-gray-600">
          {language.charAt(0).toUpperCase() + language.slice(1)} Code:
        </div>
        <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto break-words whitespace-pre-wrap">
          <code>{code}</code>
        </pre>
      </div>
    );
  }

  // Check for pg_query or query fields in any tool and format as code
  if (args.pg_query || args.query) {
    const query = String(args.pg_query || args.query);
    const otherArgs = Object.entries(args).filter(
      ([key]) => key !== 'pg_query' && key !== 'query'
    );

    return (
      <div className="space-y-2">
        <div className="text-xs font-medium text-gray-600">Query:</div>
        <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto break-words whitespace-pre-wrap">
          <code>{query}</code>
        </pre>
        {otherArgs.length > 0 && (
          <div className="space-y-1">
            {otherArgs.map(([key, value]) => (
              <div key={key} className="text-xs break-words">
                <span className="font-medium text-gray-600">{key}:</span>{' '}
                <span className="text-gray-800 break-all">
                  {typeof value === 'string' || typeof value === 'number'
                    ? String(value)
                    : JSON.stringify(value, null, 2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Default key-value formatting
  return (
    <div className="space-y-1">
      {Object.entries(args).map(([key, value]) => (
        <div key={key} className="text-xs break-words">
          <span className="font-medium text-gray-600">{key}:</span>{' '}
          <span className="text-gray-800 break-all">
            {typeof value === 'string' || typeof value === 'number'
              ? String(value)
              : JSON.stringify(value, null, 2)}
          </span>
        </div>
      ))}
    </div>
  );
};

const formatResult = (result: string): React.ReactNode => {
  // Strip common prefixes from the result
  let cleanResult = result;
  const prefixPattern = /^Tool\s+'[^']+'\s+returned\s+result:\s*/i;
  if (prefixPattern.test(result)) {
    cleanResult = result.replace(prefixPattern, '').trim();
  }

  try {
    const parsed = JSON.parse(cleanResult);

    // Handle MCP tool result format: {content: [{type: "text", text: "..."}], isError: false}
    if (parsed.content && Array.isArray(parsed.content)) {
      const textContent = parsed.content.find(
        (item: { type: string; text: string }) => item.type === 'text'
      );
      if (textContent?.text) {
        try {
          // Try to parse the nested text content
          const nestedParsed = JSON.parse(textContent.text);

          // Handle code execution result format with stdout/stderr
          if (
            nestedParsed.stdout !== undefined ||
            nestedParsed.stderr !== undefined
          ) {
            return (
              <div className="space-y-2">
                {/* Return code */}
                {nestedParsed.returncode !== undefined && (
                  <div className="text-xs">
                    <span className="font-medium text-gray-600">
                      Return code:
                    </span>{' '}
                    <span
                      className={
                        nestedParsed.returncode === 0
                          ? 'text-green-600 font-semibold'
                          : 'text-red-600 font-semibold'
                      }
                    >
                      {nestedParsed.returncode}
                    </span>
                  </div>
                )}

                {/* Standard output */}
                {nestedParsed.stdout && (
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-gray-600">
                      Output:
                    </div>
                    <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto max-h-60 overflow-y-auto whitespace-pre-wrap word-break-word">
                      <code className="break-words">{nestedParsed.stdout}</code>
                    </pre>
                  </div>
                )}

                {/* Standard error */}
                {nestedParsed.stderr && (
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-red-600">
                      Error output:
                    </div>
                    <pre className="bg-red-50 text-red-900 p-3 rounded text-xs overflow-x-auto max-h-60 overflow-y-auto whitespace-pre-wrap word-break-word border border-red-200">
                      <code className="break-words">{nestedParsed.stderr}</code>
                    </pre>
                  </div>
                )}
              </div>
            );
          }

          // Otherwise display as formatted JSON
          return (
            <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto max-h-60 overflow-y-auto whitespace-pre-wrap word-break-word">
              <code className="break-words">
                {JSON.stringify(nestedParsed, null, 2)}
              </code>
            </pre>
          );
        } catch {
          // Nested text is not JSON, display as plain text
          return (
            <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto max-h-60 overflow-y-auto whitespace-pre-wrap word-break-word">
              <code className="break-words">{textContent.text}</code>
            </pre>
          );
        }
      }
    }

    // Standard JSON formatting
    return (
      <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto max-h-60 overflow-y-auto whitespace-pre-wrap word-break-word">
        <code className="break-words">{JSON.stringify(parsed, null, 2)}</code>
      </pre>
    );
  } catch {
    // Not JSON, display as plain text with wrapping
    return (
      <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto max-h-60 overflow-y-auto whitespace-pre-wrap word-break-word">
        <code className="text-gray-700 break-words">{cleanResult}</code>
      </pre>
    );
  }
};

export function ToolCallCard({
  id,
  name,
  arguments: args,
  result,
  timestamp,
}: ToolCallCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const ToolIcon = getToolIcon(name);
  const displayName = getToolDisplayName(name);

  const formatTimestamp = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="mb-3 border border-purple-200 rounded-lg overflow-hidden bg-white shadow-sm max-w-full">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-purple-50 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <ToolIcon className="w-4 h-4 text-purple-600 flex-shrink-0" />
          <span className="text-sm font-medium text-gray-800 truncate">
            {displayName}
          </span>
          {timestamp && (
            <span className="text-xs text-gray-400 flex-shrink-0">
              {formatTimestamp(timestamp)}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0 ml-2" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0 ml-2" />
        )}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-3 border-t border-purple-100 pt-3 overflow-hidden">
          {/* Tool ID */}
          <div className="text-xs text-gray-400 break-all">ID: {id}</div>

          {/* Arguments */}
          <div className="overflow-hidden">{formatArguments(name, args)}</div>

          {/* Result (if available) */}
          {result && (
            <div className="space-y-2 overflow-hidden">
              <div className="text-xs font-medium text-gray-600">Result:</div>
              <div className="overflow-hidden">{formatResult(result)}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
