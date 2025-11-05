'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Check,
  Wrench,
  Database,
  FileText,
  Globe,
  FileType,
  Code,
  Terminal,
  Square,
  RefreshCw,
  Loader2,
  Send,
  X,
  MessageSquare,
  Bot,
} from 'lucide-react';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { useStore } from '@/lib/store';
import { api } from '@/lib/api';
import { flushSync } from 'react-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';

const palette = {
  primary: '#5D3EFF',
  primaryHover: '#4C36D1',
  assistantBackground: '#F4F6FF',
  assistantBorder: '#D8DDF8',
  userGradient:
    'linear-gradient(135deg, rgba(107, 70, 255, 0.96) 0%, rgba(165, 113, 255, 0.92) 100%)',
  userShadow: '0 12px 28px rgba(89, 62, 214, 0.28)',
  textDark: '#1B2033',
  agentText: '#5B6A91',
  errorBackground: '#FFECEE',
  errorText: '#D14343',
  inputBackground: 'rgba(255, 255, 255, 0.92)',
  inputBorder: 'rgba(182, 193, 237, 0.9)',
  inputShadow: '0 20px 36px rgba(16, 24, 64, 0.10)',
  suggestionBackground:
    'linear-gradient(135deg, rgba(117, 38, 227, 0.08) 0%, rgba(165, 113, 255, 0.12) 100%)',
  suggestionBorder: 'rgba(117, 38, 227, 0.35)',
  suggestionText: '#5D3EFF',
};

interface Message {
  role: 'user' | 'assistant' | 'agent' | 'tool' | 'error';
  content: string;
  timestamp: string;
  tool?: string;
}

const useChatStream = ({
  onError,
}: { onError?: (error: Error) => void } = {}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello, I'm Luminaire Agent, how can I help you today?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const abortRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      setMessages((prev) => {
        const filtered = prev.filter((msg) => msg.role !== 'agent');
        return [
          ...filtered,
          {
            role: 'assistant',
            content: 'Request cancelled.',
            timestamp: new Date().toISOString(),
          },
        ];
      });
    }
  };

  const sendMessage = async (
    message: string,
    authorization: string,
    context?: {
      systemId?: string;
    }
  ) => {
    if (!message.trim()) return;

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    const userMessage: Message = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };
    const agentMessage: Message = {
      role: 'agent',
      content: 'Luminaire Agent is processing your request...',
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage, agentMessage]);
    setIsLoading(true);

    try {
      const requestBody = {
        question: message,
        ...(sessionId && { sessionId }),
        ...(context?.systemId && { systemId: context.systemId }),
      };

      const response = await api.chatCompletion(requestBody, authorization);

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? 'Unauthorized'
            : `Request failed: ${response.status}`
        );
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await processStream(response.body!);
    } catch (error) {
      // Don't show error if request was aborted
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      console.error('Chat error:', error);
      setMessages((prev) => {
        const filtered = prev.filter((msg) => msg.role !== 'agent');
        return [
          ...filtered,
          {
            role: 'error',
            content:
              error instanceof Error && error.message === 'Unauthorized'
                ? 'Session expired. Please refresh the page.'
                : 'Sorry, there was an error processing your message',
            timestamp: new Date().toISOString(),
          },
        ];
      });
      if (error instanceof Error) {
        onError?.(error);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const processStream = async (stream: ReadableStream) => {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let agentBuffer = '';
    let isFirstAssistantMessage = true;
    const signal = abortControllerRef.current?.signal;

    const handleAgentMessage = (message: Message) => {
      const messageWithSession = message as Message & { sessionId?: string };
      if (messageWithSession.sessionId && !sessionId) {
        setSessionId(messageWithSession.sessionId);
      }
      flushSync(() => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { ...message, timestamp: new Date().toISOString() },
        ]);
      });
    };

    const handleAssistantMessage = (content: string) => {
      setMessages((prevMessages) => {
        if (!content.startsWith('\n') || !content.endsWith('\n')) {
          // Add newline if content ends with sentence punctuation, is a markdown heading,
          // code block, list item or sublist item (asterisk, number, or em-dash)
          if (
            /[.!:?]$/.test(content.trim()) ||
            /^(#{1,6}) /.test(content.trim()) ||
            /^`{3}.*`{3}$/.test(content.trim()) ||
            /^(\s*[*-]|\s*\d+\.|\s*-{3,})/.test(content.trim()) ||
            /^!\[[^\]]*\]\([^)]+\)\s*$/.test(content.trim()) ||
            /<img\b[^>]*>\s*$/i.test(content.trim())
          ) {
            // Ensure a clear block break after images and block endings
            content += '\n\n';
          } else {
            content += ' ';
          }
        }

        if (isFirstAssistantMessage) {
          isFirstAssistantMessage = false;
          return [
            ...prevMessages,
            { role: 'assistant' as const, content, timestamp: new Date().toISOString() },
          ];
        }
        
        const lastMessage = prevMessages[prevMessages.length - 1];
        if (lastMessage?.role === 'assistant') {
          // Create a new array with updated last message
          return [
            ...prevMessages.slice(0, -1),
            { ...lastMessage, content: lastMessage.content + content },
          ];
        }
        
        return prevMessages;
      });
    };

    const processAgentBuffer = () => {
      try {
        const message = JSON.parse(agentBuffer);
        if (message.role === 'agent' || message.role === 'tool') {
          handleAgentMessage(message);
        } else {
          buffer += agentBuffer;
        }
        agentBuffer = '';
      } catch (_e) {
        if (agentBuffer.length > 1000) {
          buffer += agentBuffer;
          agentBuffer = '';
        }
      }
    };

    const processChunk = (chunk: string) => {
      if (!chunk.trim()) return;

      try {
        const message = JSON.parse(chunk);
        if (message.sessionId && !sessionId) {
          setSessionId(message.sessionId);
        }
        if (message.role === 'assistant') {
          handleAssistantMessage(message.content || '');
        }
      } catch (_e) {
        handleAssistantMessage(chunk);
      }
    };

    try {
      while (true) {
        // Check if request was aborted
        if (signal?.aborted) {
          const error = new Error('Request aborted');
          error.name = 'AbortError';
          throw error;
        }

        const { value, done } = await reader.read();
        if (done) break;

        const decodedChunk = decoder.decode(value, { stream: true });

        for (const char of decodedChunk) {
          if (char === '{') {
            agentBuffer = char;
          } else if (agentBuffer) {
            agentBuffer += char;
            if (char === '}') {
              processAgentBuffer();
            }
          } else {
            buffer += char;
          }
        }

        const chunks = buffer.split(/(?<=\n)/);
        buffer = chunks.pop() || '';
        chunks.forEach(processChunk);
      }

      // Process any remaining buffer
      if (buffer.trim()) {
        processChunk(buffer);
      }
      if (agentBuffer.trim()) {
        processAgentBuffer();
      }

      // Remove agent messages after successful completion
      setMessages((prev) => prev.filter((msg) => msg.role !== 'agent'));
    } catch (error) {
      // Don't show error message if request was aborted
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }

      console.error('Stream error:', error);
      const errorMessage =
        error instanceof Error && error.message === 'Unauthorized'
          ? 'Session expired. Please refresh the page.'
          : 'Connection interrupted. Please try again.';

      setMessages((prev) => {
        const filtered = prev.filter((msg) => msg.role !== 'agent');
        return [
          ...filtered,
          {
            role: 'error',
            content: errorMessage,
            timestamp: new Date().toISOString(),
          },
        ];
      });
    } finally {
      try {
        await reader.cancel();
        reader.releaseLock();
      } catch (e) {
        console.error('Error cleaning up reader:', e);
      }
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    sendMessage,
    abortRequest,
  };
};

const IconWrapper = ({ isLast }: { isLast: boolean }) => {
  return (
    <div className="inline-block ml-2 align-middle">
      {isLast ? (
        <Loader2
          className="w-3 h-3 animate-spin"
          style={{ color: palette.primary }}
        />
      ) : (
        <Check className="w-3 h-3" style={{ color: palette.primary }} />
      )}
    </div>
  );
};

const getToolIcon = (toolName: string) => {
  const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
    html_to_markdown: Globe,
    pdf_to_markdown: FileType,
    code_exec_python: Code,
    code_exec_ruby: Code,
    code_exec_node: Code,
    code_exec_go: Code,
    postgres_get_schema: FileText,
    postgres_run_query: Database,
    dyno_run_command: Terminal,
    unknown: Wrench,
  };

  return iconMap[toolName] || Wrench;
};

interface MessageProps {
  role: string;
  content: string;
  isLast: boolean;
  onImageClick?: (src: string) => void;
  timestamp?: string;
  tool?: string;
}

const MessageComponent = ({
  role,
  content,
  isLast,
  onImageClick,
  timestamp,
  tool,
}: MessageProps) => {
  const formatTimestamp = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const messageStyles: Record<string, React.CSSProperties> = {
    base: {
      padding: '12px 10px',
      maxWidth: '80%',
      borderRadius: '16px',
      marginBottom: '16px',
      border: '1px solid transparent',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      backdropFilter: 'blur(8px)',
    },
    user: {
      marginLeft: 'auto',
      background: palette.userGradient,
      color: 'white',
      borderBottomRightRadius: '10px',
      boxShadow: palette.userShadow,
    },
    assistant: {
      background: palette.assistantBackground,
      border: `1px solid ${palette.assistantBorder}`,
      color: palette.textDark,
      borderBottomLeftRadius: '10px',
      boxShadow: '0 14px 32px rgba(15, 23, 42, 0.06)',
    },
    agent: {
      fontStyle: 'italic',
      color: palette.agentText,
      padding: '6px 10px',
      marginBottom: '4px',
      borderRadius: '4px',
      background: 'rgba(148, 163, 184, 0.05)',
      maxWidth: '100%',
      fontSize: '0.8125rem',
    },
    tool: {
      fontStyle: 'italic',
      color: palette.agentText,
      borderLeft: '3px solid #5D3EFF',
      background: 'rgba(93, 62, 255, 0.04)',
      padding: '6px 10px 6px 12px',
      marginBottom: '4px',
      borderRadius: '0 4px 4px 0',
      maxWidth: '100%',
      fontSize: '0.8125rem',
    },
    error: {
      background: palette.errorBackground,
      color: palette.errorText,
      padding: '12px 16px',
      borderRadius: '12px',
      border: '1px solid rgba(209, 67, 67, 0.2)',
    },
  };

  const style = {
    ...messageStyles.base,
    ...messageStyles[role],
  };

  if (role === 'tool') {
    const ToolIcon = getToolIcon(tool || 'unknown');
    return (
      <div style={style}>
        <div className="flex items-center gap-2">
          <ToolIcon className="w-3.5 h-3.5" style={{ color: palette.primary }} />
          <span className="text-xs flex-1 truncate">{content}</span>
          <IconWrapper isLast={isLast} />
        </div>
      </div>
    );
  }

  if (role === 'agent') {
    return (
      <div style={style}>
        <span className="text-xs">{content}</span>
        <IconWrapper isLast={isLast} />
      </div>
    );
  }

  return (
    <div style={style}>
      {role === 'user' && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs opacity-80">You</span>
          <span className="text-xs opacity-60">
            {formatTimestamp(timestamp)}
          </span>
        </div>
      )}
      {role === 'assistant' && (
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-sm font-medium"
            style={{ color: palette.primary }}
          >
            Luminaire Agent
          </span>
          <span className="text-xs text-gray-400">
            {formatTimestamp(timestamp)}
          </span>
        </div>
      )}
      {role === 'assistant' ? (
        <div className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              h1: ({ children }) => (
                <h1 className="text-2xl font-bold mt-6 mb-3 text-gray-900 border-b pb-2">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl font-bold mt-5 mb-2 text-gray-800">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-800">
                  {children}
                </h3>
              ),
              h4: ({ children }) => (
                <h4 className="text-base font-semibold mt-3 mb-1 text-gray-800">
                  {children}
                </h4>
              ),
              p: ({ children }) => (
                <p className="mb-3 leading-relaxed text-gray-700">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="mb-3 ml-4 space-y-1 list-disc text-gray-700">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="mb-3 ml-4 space-y-1 list-decimal text-gray-700">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="ml-1 leading-relaxed">
                  {children}
                </li>
              ),
              strong: ({ children }) => (
                <strong className="font-bold text-gray-900">
                  {children}
                </strong>
              ),
              em: ({ children }) => (
                <em className="italic text-gray-700">
                  {children}
                </em>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-purple-500 pl-4 py-2 my-3 bg-purple-50 text-gray-700 italic">
                  {children}
                </blockquote>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-700 underline"
                >
                  {children}
                </a>
              ),
              img: ({ src, alt }) => (
                <img
                  src={src}
                  alt={alt}
                  className="cursor-pointer rounded-lg max-w-full my-3 shadow-sm"
                  onClick={() => onImageClick?.(typeof src === 'string' ? src : '')}
                />
              ),
              pre: ({ children }) => (
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-3 shadow-sm">
                  {children}
                </pre>
              ),
              code: ({ className, children }) => {
                const isInline = !className;
                return isInline ? (
                  <code className="bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded text-sm font-mono">
                    {children}
                  </code>
                ) : (
                  <code className={className}>{children}</code>
                );
              },
              hr: () => (
                <hr className="my-4 border-gray-300" />
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto my-3">
                  <table className="min-w-full divide-y divide-gray-300 border border-gray-300 rounded-lg">
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-gray-50">
                  {children}
                </thead>
              ),
              tbody: ({ children }) => (
                <tbody className="divide-y divide-gray-200 bg-white">
                  {children}
                </tbody>
              ),
              tr: ({ children }) => (
                <tr>
                  {children}
                </tr>
              ),
              th: ({ children }) => (
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="px-4 py-2 text-sm text-gray-700">
                  {children}
                </td>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      ) : (
        <div className="whitespace-pre-wrap">{content}</div>
      )}
    </div>
  );
};

interface ToolSettings {
  tools: {
    postgres_query: boolean;
    html_to_markdown: boolean;
    pdf_to_markdown: boolean;
    code_exec_python: boolean;
  };
}

export function Assistant() {
  const { authorization, system } = useStore();
  const { messages, isLoading, sendMessage, abortRequest } = useChatStream();
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [toolSettings, setToolSettings] = useState<ToolSettings | null>(null);
  const [randomSeed, setRandomSeed] = useState(Date.now());
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch tool settings on mount
  useEffect(() => {
    const fetchToolSettings = async () => {
      try {
        if (!authorization) return;
        const response = await fetch('/api/tool-settings', {
          headers: {
            Authorization: authorization.startsWith('Bearer ')
              ? authorization
              : `Bearer ${authorization}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setToolSettings(data);
        }
      } catch (error) {
        console.error('Failed to fetch tool settings:', error);
        // Default to all tools enabled if fetch fails
        setToolSettings({
          tools: {
            postgres_query: true,
            html_to_markdown: true,
            pdf_to_markdown: true,
            code_exec_python: true,
          },
        });
      }
    };
    fetchToolSettings();
  }, [authorization]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]'
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      // Create context object with systemId
      const context = {
        systemId: system?.id,
      };
      sendMessage(input, authorization || '', context);
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const allSuggestions = useMemo(
    () => [
      {
        id: 'chart_hourly_production_today',
        label: 'Chart the hourly production for today',
        keywords: ['chart', 'hourly', 'today', 'production', 'generation'],
        requiredTools: ['database', 'code'],
      },
      {
        id: 'energy_produced_7d',
        label: 'How much energy did I produce in the past 7 days?',
        keywords: ['produce', 'production', 'past 7 days', 'last week', 'energy produced'],
        requiredTools: ['database'],
      },
      {
        id: 'worst_production_day',
        label: 'What was my lowest production day this month?',
        keywords: ['lowest', 'worst', 'minimum', 'production', 'day', 'this month'],
        requiredTools: ['database'],
      },
      {
        id: 'chart_prod_vs_cons_7d',
        label: 'Compare production vs consumption in the past 7 days',
        keywords: ['chart', 'comparison', 'production', 'consumption', 'past 7 days', 'compare'],
        requiredTools: ['database', 'code'],
      },
      {
        id: 'peak_production_7d',
        label: 'What was the peak production in the past 7 days?',
        keywords: ['peak', 'maximum', 'production', 'past 7 days', 'last week'],
        requiredTools: ['database'],
      },
      {
        id: 'energy_consumed_7d',
        label: 'How much energy did I consume in the past 7 days?',
        keywords: ['consume', 'consumption', 'past 7 days', 'last week', 'energy used'],
        requiredTools: ['database'],
      },
      {
        id: 'daily_production_trend',
        label: 'Show my daily production trend for the last 30 days',
        keywords: ['daily', 'trend', 'production', '30 days', 'month'],
        requiredTools: ['database', 'code'],
      },
      {
        id: 'best_production_hour',
        label: 'What time of day produces the most energy?',
        keywords: ['time', 'hour', 'best', 'most', 'production', 'peak'],
        requiredTools: ['database'],
      },
      {
        id: 'system_efficiency',
        label: 'What is my system efficiency this month?',
        keywords: ['efficiency', 'performance', 'system', 'this month', 'effective'],
        requiredTools: ['database'],
      },
      {
        id: 'explain_solar_panels',
        label: 'How do solar panels work?',
        keywords: ['solar', 'panels', 'work', 'explain', 'how'],
        requiredTools: [],
      },
      {
        id: 'weather_impact',
        label: 'How does weather affect my solar production?',
        keywords: ['weather', 'impact', 'affect', 'solar', 'production'],
        requiredTools: [],
      },
      {
        id: 'maintenance_tips',
        label: 'What maintenance does my solar system need?',
        keywords: ['maintenance', 'care', 'solar', 'system', 'tips'],
        requiredTools: [],
      },
      {
        id: 'savings_calculation',
        label: 'How are my energy savings calculated?',
        keywords: ['savings', 'calculate', 'calculation', 'how', 'energy'],
        requiredTools: [],
      },
      {
        id: 'compare_prod_month',
        label: "Compare this month's production to last month",
        keywords: ['compare', 'month', 'production', 'this month', 'last month'],
        requiredTools: ['database'],
      },
    ],
    []
  );

  const suggestedPrompts = useMemo(() => {
    if (!toolSettings) return [];

    // Filter suggestions based on enabled tools
    const isToolEnabled = (requiredTools: string[]) => {
      if (!requiredTools || requiredTools.length === 0) return true;

      const toolMap: Record<string, boolean> = {
        database: toolSettings.tools?.postgres_query,
        web: toolSettings.tools?.html_to_markdown,
        pdf: toolSettings.tools?.pdf_to_markdown,
        code: toolSettings.tools?.code_exec_python,
      };

      return requiredTools.every((tool) => toolMap[tool] === true);
    };

    const availableSuggestions = allSuggestions.filter((s) =>
      isToolEnabled(s.requiredTools)
    );

    if (availableSuggestions.length === 0) return [];

    // Get context from last few messages
    const lastFewMessages = messages.slice(-6);
    const contextText = lastFewMessages
      .map((m) => m.content.toLowerCase())
      .join(' ');

    // Score suggestions by relevance
    const withScores = availableSuggestions.map((s) => {
      const score = s.keywords.reduce((acc, kw) => {
        return acc + (contextText.includes(kw.toLowerCase()) ? 1 : 0);
      }, 0);
      return { suggestion: s, score };
    });

    // Get relevant suggestions
    const relevant = withScores
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.suggestion);

    // Random picker with seed
    const pickRandom = (pool: { id: string; label: string; keywords: string[]; requiredTools: string[] }[], count: number, excludeIds = new Set<string>()) => {
      const available = pool.filter((s) => !excludeIds.has(s.id));
      if (available.length === 0) return [];

      const seededRandom = (seed: number, i: number) => {
        const x = Math.sin(seed + i) * 10000;
        return x - Math.floor(x);
      };

      const shuffled = [...available];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom(randomSeed, i) * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled.slice(0, count);
    };

    // Pick 3 relevant or random suggestions
    if (relevant.length > 0) {
      const chosen = pickRandom(relevant, Math.min(3, relevant.length), new Set());
      if (chosen.length < 3) {
        const chosenIds = new Set(chosen.map((s) => s.id));
        const filler = pickRandom(availableSuggestions, 3 - chosen.length, chosenIds);
        return [...chosen, ...filler];
      }
      return chosen;
    }

    return pickRandom(availableSuggestions, 3, new Set());
  }, [messages, allSuggestions, toolSettings, randomSeed]);

  const randomizeSuggestions = () => {
    setRandomSeed(Date.now());
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all z-50"
          aria-label="Open Luminaire Agent"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}

      {/* Side Panel */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/20 z-40 transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="fixed top-0 right-0 h-full w-full md:w-[650px] bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Luminaire Agent</h3>
                  <p className="text-xs text-gray-500">AI-powered solar assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isLoading && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={abortRequest}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <Square className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-2">
          {messages.map((message, index) => (
            <MessageComponent
              key={index}
              role={message.role}
              content={message.content}
              timestamp={message.timestamp}
              tool={message.tool}
              isLast={index === messages.length - 1 && isLoading}
              onImageClick={setImagePreview}
            />
          ))}
        </div>
      </ScrollArea>

            {/* Suggested Prompts - Always visible */}
            <div className="px-4 pb-2 border-t pt-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-500">Try asking:</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={randomizeSuggestions}
                  className="h-6 px-2 text-xs"
                  disabled={isLoading}
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  More
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestedPrompts.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => setInput(suggestion.label)}
                    disabled={isLoading}
                    className="text-xs px-3 py-1.5 rounded-full border hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: palette.suggestionBackground,
                      borderColor: palette.suggestionBorder,
                      color: palette.suggestionText,
                    }}
                  >
                    {suggestion.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1"
            style={{
              background: palette.inputBackground,
              borderColor: palette.inputBorder,
            }}
          />
          {isLoading ? (
            <Button
              onClick={abortRequest}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <Square className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSend}
              disabled={!input.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </Button>
          )}
            </div>
            </div>
          </div>
        </>
      )}

      {/* Image Preview Modal */}
      {imagePreview && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setImagePreview(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={imagePreview}
              alt="Preview"
              className="max-w-full max-h-full rounded-lg"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-white hover:bg-white/20"
              onClick={() => setImagePreview(null)}
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
