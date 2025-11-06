import { ReactNode } from 'react';

interface CodeBlockProps {
  children: ReactNode;
  language?: string;
  className?: string;
}

export function CodeBlock({
  children,
  language,
  className = '',
}: CodeBlockProps) {
  // Don't show the language label for "formula" or if not specified
  const showLanguageLabel = language && language !== 'formula';

  return (
    <div className={`relative ${className}`}>
      {showLanguageLabel && (
        <div className="absolute -top-2 -right-2 px-2.5 py-1 text-xs font-semibold text-white bg-purple-600 rounded-md shadow-sm z-10">
          {language}
        </div>
      )}
      <pre className="bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 rounded-lg p-4 overflow-x-auto shadow-lg border border-purple-700/30">
        <code className="text-purple-100 text-sm font-mono leading-relaxed">
          {children}
        </code>
      </pre>
    </div>
  );
}

interface InlineCodeProps {
  children: ReactNode;
  className?: string;
}

export function InlineCode({ children, className = '' }: InlineCodeProps) {
  return (
    <code
      className={`px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-sm font-mono border border-purple-200 ${className}`}
    >
      {children}
    </code>
  );
}

interface FormulaBlockProps {
  title?: string;
  formulas: string[];
  className?: string;
}

export function FormulaBlock({
  title,
  formulas,
  className = '',
}: FormulaBlockProps) {
  return (
    <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>
      {title && (
        <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <div className="space-y-3">
        {formulas.map((formula, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 rounded-lg p-4 shadow-lg border border-purple-700/30"
          >
            <code className="text-purple-50 text-sm font-mono block leading-relaxed">
              {formula}
            </code>
          </div>
        ))}
      </div>
    </div>
  );
}
