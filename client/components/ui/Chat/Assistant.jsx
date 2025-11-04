import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  IconCheck,
  IconTools,
  IconDatabase,
  IconFileText,
  IconWorldWww,
  IconFileTypePdf,
  IconCode,
  IconTerminal,
  IconPlayerStop,
  IconRefresh,
} from '@tabler/icons-react';
import ChatIcon from './icons/ChatIcon.jsx';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { useRouteContext } from '/:core.jsx';
import {
  Box,
  Text,
  Stack,
  Loader,
  useMantineTheme,
  Modal,
} from '@mantine/core';
import SendIcon from './icons/SendIcon.jsx';
import CloseIcon from './icons/CloseIcon.jsx';
import { flushSync } from 'react-dom';

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

const useChatStream = ({ onError } = {}) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello, I'm Luminaire Agent, how can I help you today?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const abortControllerRef = useRef(null);

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

  const sendMessage = async (message, actions, state) => {
    if (!message.trim()) return;

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };
    const agentMessage = {
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
      };

      const response = await actions.chatCompletion(state, requestBody);

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? 'Unauthorized'
            : `Request failed: ${response.status}`
        );
      }

      await processStream(response.body);
    } catch (error) {
      // Don't show error if request was aborted
      if (error.name === 'AbortError') {
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
              error.message === 'Unauthorized'
                ? 'Session expired. Please refresh the page.'
                : 'Sorry, there was an error processing your message',
            timestamp: new Date().toISOString(),
          },
        ];
      });
      onError?.(error);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const processStream = async (stream) => {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let agentBuffer = '';
    let isFirstAssistantMessage = true;
    const signal = abortControllerRef.current?.signal;

    const handleAgentMessage = (message) => {
      if (message.sessionId && !sessionId) {
        setSessionId(message.sessionId);
      }
      flushSync(() => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { ...message, timestamp: new Date().toISOString() },
        ]);
      });
    };

    const handleAssistantMessage = (content) => {
      setMessages((prevMessages) => {
        if (!content.startsWith('\n') || !content.endsWith('\n')) {
          // Add newline if content ends with sentence punctuation, is a markdown heading,
          // code block, list item or sublist item (asterisk, number, or em-dash)
          if (
            /[.!:?]$/.test(content.trim()) ||
            /^(#{1,6}) /.test(content.trim()) ||
            /^\`{3}.*\`{3}$/.test(content.trim()) ||
            /^(\s*[\*\-]|\s*\d+\.|\s*\-{3,})/.test(content.trim()) ||
            /^!\[[^\]]*\]\([^\)]+\)\s*$/.test(content.trim()) ||
            /<img\b[^>]*>\s*$/i.test(content.trim())
          ) {
            // Ensure a clear block break after images and block endings
            content += '\n\n';
          } else {
            content += ' ';
          }
        }

        const updatedMessages = [...prevMessages];
        if (isFirstAssistantMessage) {
          isFirstAssistantMessage = false;
          return [
            ...updatedMessages,
            { role: 'assistant', content, timestamp: new Date().toISOString() },
          ];
        }
        const lastMessage = updatedMessages[updatedMessages.length - 1];
        if (lastMessage?.role === 'assistant') {
          lastMessage.content += content;
        }
        return updatedMessages;
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
      } catch (e) {
        if (agentBuffer.length > 1000) {
          buffer += agentBuffer;
          agentBuffer = '';
        }
      }
    };

    const processChunk = (chunk) => {
      if (!chunk.trim()) return;

      try {
        const message = JSON.parse(chunk);
        if (message.sessionId && !sessionId) {
          setSessionId(message.sessionId);
        }
        if (message.role === 'assistant') {
          handleAssistantMessage(message.content || '');
        }
      } catch (e) {
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
    } catch (error) {
      // Don't show error message if request was aborted
      if (error.name === 'AbortError') {
        return;
      }

      console.error('Stream error:', error);
      const errorMessage =
        error.message === 'Unauthorized'
          ? 'Session expired. Please refresh the page.'
          : 'Connection interrupted. Please try again.';

      setMessages((prev) => [
        ...prev,
        {
          role: 'error',
          content: errorMessage,
          timestamp: new Date().toISOString(),
        },
      ]);
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

const IconWrapper = ({ isLast }) => {
  return (
    <div
      style={{
        display: 'inline-block',
        marginLeft: '8px',
        verticalAlign: 'middle',
      }}
    >
      {isLast ? (
        <Loader size="xs" color={palette.primary} />
      ) : (
        <IconCheck size={14} color={palette.primary} />
      )}
    </div>
  );
};

const getToolIcon = (toolName) => {
  const iconMap = {
    html_to_markdown: IconWorldWww,
    pdf_to_markdown: IconFileTypePdf,
    code_exec_python: IconCode,
    code_exec_ruby: IconCode,
    code_exec_node: IconCode,
    code_exec_go: IconCode,
    postgres_get_schema: IconFileText,
    postgres_run_query: IconDatabase,
    dyno_run_command: IconTerminal,
    unknown: IconTools, // Explicit fallback for unknown tools
  };

  return iconMap[toolName] || IconTools; // Default fallback
};

const Message = ({ role, content, isLast, onImageClick, timestamp, tool }) => {
  const theme = useMantineTheme();

  const formatTimestamp = (isoString) => {
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

  const messageStyles = {
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
      padding: '4px 8px',
      marginBottom: '1px',
      borderRadius: '4px',
      background: 'rgba(148, 163, 184, 0.05)', // Very subtle grey background
    },
    tool: {
      fontStyle: 'italic',
      color: palette.agentText,
      padding: '4px 8px',
      marginBottom: '1px',
      borderRadius: '4px',
      background: 'rgba(148, 163, 184, 0.05)', // Very subtle grey background
    },
    error: {
      background: palette.errorBackground,
      color: palette.errorText,
      border: '1px solid rgba(209, 67, 67, 0.22)',
      boxShadow: '0 10px 20px rgba(209, 67, 67, 0.12)',
    },
  };

  const style = {
    ...messageStyles.base,
    ...(role === 'user' ? messageStyles.user : {}),
    ...(role === 'assistant' ? messageStyles.assistant : {}),
    ...(role === 'tool' ? messageStyles.tool : {}),
    ...(role === 'agent' ? messageStyles.agent : {}),
    ...(role === 'error' ? messageStyles.error : {}),
  };

  // For assistant messages, ensure proper newlines for markdown
  const processedContent =
    role === 'assistant'
      ? content.replace(/\\n/g, '\n').replace(/\n\n+/g, '\n\n')
      : content;

  const ToolIcon = role === 'tool' && tool ? getToolIcon(tool) : IconTools;

  return (
    <div
      style={{
        marginBottom: role === 'agent' || role === 'tool' ? '1px' : '8px',
      }}
    >
      <Box style={style}>
        {role === 'agent' || role === 'tool' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                display: 'inline-flex',
                width: 16,
                justifyContent: 'center',
              }}
            >
              {role === 'tool' ? (
                <ToolIcon size={14} color={palette.agentText} />
              ) : null}
            </span>
            <Text size="xs" style={{ flex: 1 }}>
              {processedContent}
            </Text>
            <IconWrapper isLast={isLast} />
          </div>
        ) : role === 'assistant' ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              img: ({ src, alt }) => (
                <img
                  src={src}
                  alt={alt}
                  style={{
                    maxWidth: '100%',
                    borderRadius: '6px',
                    cursor: 'zoom-in',
                  }}
                  onClick={() => onImageClick?.(src, alt)}
                />
              ),
              a: ({ children, href, target }) => (
                <a
                  style={{
                    color: theme.colors.violet[4],
                    textDecoration: 'underline',
                  }}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              ),
              ul: ({ children }) => (
                <ul
                  style={{
                    paddingLeft: '2rem',
                    listStyle: 'disc',
                    marginBottom: '1rem',
                  }}
                >
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol
                  style={{
                    paddingLeft: '2rem',
                    listStyle: 'decimal',
                    marginBottom: '1rem',
                  }}
                >
                  {children}
                </ol>
              ),
              pre: ({ children }) => (
                <pre
                  style={{
                    background: '#eaecef',
                    padding: '12px',
                    borderRadius: '4px',
                  }}
                >
                  {children}
                </pre>
              ),
              code: ({ children }) => (
                <code style={{ background: '#eaecef', padding: '2px 4px' }}>
                  {children}
                </code>
              ),
              p: ({ children }) => (
                <p style={{ marginBottom: '4px' }}>{children}</p>
              ),
            }}
          >
            {processedContent}
          </ReactMarkdown>
        ) : (
          <div>{processedContent}</div>
        )}
      </Box>
      {timestamp && role !== 'agent' && role !== 'tool' && (
        <div
          style={{
            fontSize: '10px',
            color: '#9CA3AF',
            marginTop: '4px',
            textAlign: role === 'user' ? 'right' : 'left',
            paddingLeft: role === 'user' ? '0' : '10px',
            paddingRight: role === 'user' ? '10px' : '0',
          }}
        >
          {formatTimestamp(timestamp)}
        </div>
      )}
    </div>
  );
};

const Chat = ({ suggestions = [], isOpen = false }) => {
  const { state, actions } = useRouteContext();
  const [currentMessage, setCurrentMessage] = useState('');
  const viewportRef = useRef(null);
  const inputRef = useRef(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [zoomImageSrc, setZoomImageSrc] = useState('');
  const [zoomImageAlt, setZoomImageAlt] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [toolSettings, setToolSettings] = useState(null);
  const [randomSeed, setRandomSeed] = useState(Date.now());

  const { messages, isLoading, sendMessage, abortRequest } = useChatStream({
    onError: () => focus(),
  });

  // Fetch tool settings on mount
  useEffect(() => {
    const fetchToolSettings = async () => {
      try {
        if (!state.apiUrl || !state.authorization) return;
        const response = await fetch(`${state.apiUrl}/api/tool-settings`, {
          headers: {
            Authorization: `Bearer ${state.authorization}`,
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
  }, [state.apiUrl, state.authorization]);

  // Randomize suggestions when chat opens
  useEffect(() => {
    if (isOpen) {
      setRandomSeed(Date.now());
    }
  }, [isOpen]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (viewportRef.current) {
        viewportRef.current.scrollTo({
          top: viewportRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
    }, 100); // Small delay to ensure DOM update
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const focus = useCallback(() => {
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  }, []);

  const handleSend = async () => {
    await sendMessage(currentMessage, actions, state);
    setCurrentMessage('');
    focus();
  };

  const inputWrapperStyle = useMemo(
    () => ({
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      background: palette.inputBackground,
      border: `1px solid ${isInputFocused ? palette.primary : palette.inputBorder}`,
      borderRadius: '999px',
      padding: '10px 10px 10px 20px',
      boxShadow: isInputFocused
        ? '0 16px 38px rgba(93, 62, 255, 0.20)'
        : palette.inputShadow,
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      backdropFilter: 'blur(12px)',
    }),
    [isInputFocused]
  );

  const inputStyle = useMemo(
    () => ({
      background: 'transparent',
      border: 'none',
      outline: 'none',
      fontSize: '14px',
      color: palette.textDark,
      width: '100%',
    }),
    []
  );

  const sendButtonStyle = useMemo(
    () => ({
      height: '40px',
      width: '40px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: '50%',
      border: '1px solid rgba(255, 255, 255, 0.28)',
      background: isLoading
        ? `linear-gradient(135deg, #D64141 0%, #B83636 100%)`
        : `linear-gradient(135deg, ${palette.primary} 0%, ${palette.primaryHover} 100%)`,
      boxShadow: isLoading
        ? '0 18px 34px rgba(214, 65, 65, 0.26)'
        : '0 18px 34px rgba(93, 62, 255, 0.26)',
      color: '#FFFFFF',
      transition:
        'transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease, background 0.2s ease',
      cursor: !isLoading && !currentMessage.trim() ? 'not-allowed' : 'pointer',
      opacity: !isLoading && !currentMessage.trim() ? 0.65 : 1,
    }),
    [currentMessage, isLoading]
  );

  const handleImageClick = (src, alt) => {
    if (!src) return;
    setZoomImageSrc(src);
    setZoomImageAlt(alt || '');
    setIsImageModalOpen(true);
  };

  const selectedSuggestions = useMemo(() => {
    if (!Array.isArray(suggestions) || suggestions.length === 0) return [];
    if (!toolSettings) return []; // Wait for settings to load

    // Filter suggestions based on enabled tools
    const isToolEnabled = (requiredTools) => {
      if (!requiredTools || requiredTools.length === 0) return true; // No tools required

      const toolMap = {
        database: toolSettings.tools?.postgres_query,
        web: toolSettings.tools?.html_to_markdown,
        pdf: toolSettings.tools?.pdf_to_markdown,
        code: toolSettings.tools?.code_exec_python,
      };

      // All required tools must be enabled
      return requiredTools.every((tool) => toolMap[tool] === true);
    };

    const availableSuggestions = suggestions.filter((s) =>
      isToolEnabled(s.requiredTools)
    );

    if (availableSuggestions.length === 0) return [];

    const lastFewMessages = messages.slice(-6);
    const contextText = lastFewMessages
      .map((m) => (m?.content || '').toString().toLowerCase())
      .join(' \n ');

    const withScores = availableSuggestions.map((s, idx) => {
      const keywords = Array.isArray(s.keywords) ? s.keywords : [];
      const score = keywords.reduce((acc, kw) => {
        const needle = (kw || '').toString().toLowerCase();
        return acc + (needle && contextText.includes(needle) ? 1 : 0);
      }, 0);
      return { index: idx, suggestion: s, score };
    });

    const relevant = withScores
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.suggestion);

    const pickRandom = (pool, count, excludeIds = new Set()) => {
      const available = pool.filter((s) => !excludeIds.has(s.id));
      if (available.length === 0) return [];

      // Use randomSeed to ensure different order each time
      const seededRandom = (seed, i) => {
        const x = Math.sin(seed + i) * 10000;
        return x - Math.floor(x);
      };

      // Fisher-Yates shuffle with seeded random
      const shuffled = [...available];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom(randomSeed, i) * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled.slice(0, count);
    };

    // If we have relevant suggestions, prioritize them but still randomize
    if (relevant.length > 0) {
      // Pick randomly from relevant suggestions first
      const chosen = pickRandom(
        relevant,
        Math.min(3, relevant.length),
        new Set()
      );

      // If we need more to reach 3, pick from all available (excluding already chosen)
      if (chosen.length < 3) {
        const chosenIds = new Set(chosen.map((s) => s.id));
        const filler = pickRandom(
          availableSuggestions,
          3 - chosen.length,
          chosenIds
        );
        return [...chosen, ...filler];
      }
      return chosen;
    }

    // No relevant suggestions, just pick 3 random ones
    return pickRandom(availableSuggestions, 3, new Set());
  }, [messages, suggestions, toolSettings, randomSeed]);

  const lastMessage = messages[messages.length - 1];
  const showSuggestions =
    !isLoading &&
    lastMessage?.role === 'assistant' &&
    selectedSuggestions.length > 0;

  const suggestionButtonStyle = {
    background: palette.suggestionBackground,
    borderColor: palette.suggestionBorder,
    color: palette.suggestionText,
    boxShadow: '0 10px 24px rgba(24, 34, 78, 0.09)',
  };

  const handleSuggestionClick = async (text) => {
    if (!text || isLoading) return;
    await sendMessage(text, actions, state);
    setCurrentMessage('');
    focus();
  };

  const handleRefreshSuggestions = () => {
    setRandomSeed(Date.now());
  };

  return (
    <>
      <div className="h-full flex flex-col" style={{ minHeight: 0 }}>
        <div
          className="flex-1 overflow-y-auto pt-6 px-6"
          ref={viewportRef}
          style={{ minHeight: 0 }}
        >
          <Stack spacing="xs">
            {messages.map((msg, i) => (
              <Message
                key={i}
                role={msg.role}
                content={msg.content}
                isLast={i === messages.length - 1}
                onImageClick={handleImageClick}
                timestamp={msg.timestamp}
                tool={msg.tool}
              />
            ))}
          </Stack>
          {showSuggestions && (
            <div className="mt-2 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex flex-wrap gap-2 flex-1">
                  {selectedSuggestions.map((s) => (
                    <button
                      key={s.id}
                      className="text-xs px-3 py-2 rounded-2xl border transition-all duration-200 font-medium"
                      style={{
                        ...suggestionButtonStyle,
                        opacity: isLoading ? 0.6 : 1,
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow =
                          '0 12px 28px rgba(93, 62, 255, 0.25)';
                        e.currentTarget.style.borderColor =
                          'rgba(117, 38, 227, 0.5)';
                        e.currentTarget.style.background =
                          'linear-gradient(135deg, rgba(117, 38, 227, 0.12) 0%, rgba(165, 113, 255, 0.18) 100%)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow =
                          '0 10px 24px rgba(24, 34, 78, 0.09)';
                        e.currentTarget.style.borderColor =
                          suggestionButtonStyle.borderColor;
                        e.currentTarget.style.background =
                          suggestionButtonStyle.background;
                      }}
                      onClick={() =>
                        handleSuggestionClick(s.label || s.text || '')
                      }
                      disabled={isLoading}
                      aria-label={`Ask: ${s.label || s.text}`}
                    >
                      {s.label || s.text}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleRefreshSuggestions}
                  disabled={isLoading}
                  className="flex-shrink-0 p-2 rounded-full transition-all duration-200 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    color: palette.suggestionText,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                  }}
                  aria-label="Refresh suggestions"
                  title="Show different suggestions"
                >
                  <IconRefresh size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
        <Modal
          opened={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          closeOnClickOutside={false}
          closeOnEscape={false}
          centered
          size="auto"
          radius="md"
          overlayProps={{ opacity: 0.4, blur: 1 }}
          withCloseButton
          title={zoomImageAlt || 'Preview'}
          zIndex={1000000}
        >
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {zoomImageSrc ? (
              <img
                src={zoomImageSrc}
                alt={zoomImageAlt}
                style={{
                  maxWidth: '90vw',
                  maxHeight: '80vh',
                  objectFit: 'contain',
                  borderRadius: '8px',
                }}
              />
            ) : null}
          </div>
        </Modal>
        <div
          className="bg-lightest-grey rounded-b-3xl px-6 pt-4 pb-8"
          style={{ flexShrink: 0 }}
        >
          <div className="flex gap-3 w-full" style={inputWrapperStyle}>
            <input
              className="overflow-hidden overflow-ellipsis"
              placeholder="Type your message here..."
              value={currentMessage}
              ref={inputRef}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={isLoading}
              style={inputStyle}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
            />
            <button
              className="ml-auto"
              onClick={isLoading ? abortRequest : handleSend}
              style={sendButtonStyle}
              disabled={!isLoading && !currentMessage.trim()}
              onMouseDown={(e) => e.preventDefault()}
              onMouseOver={(e) => {
                if (!isLoading && !currentMessage.trim()) return;
                e.currentTarget.style.transform =
                  'translateY(-1px) scale(1.02)';
                e.currentTarget.style.boxShadow = isLoading
                  ? '0 20px 42px rgba(214, 65, 65, 0.32)'
                  : '0 20px 42px rgba(93, 62, 255, 0.32)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = isLoading
                  ? '0 18px 34px rgba(214, 65, 65, 0.26)'
                  : '0 18px 34px rgba(93, 62, 255, 0.26)';
              }}
              aria-label={isLoading ? 'Stop generation' : 'Send message'}
            >
              {isLoading ? <IconPlayerStop size={20} /> : <SendIcon />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export function Assistant() {
  const [open, setOpen] = useState(false);

  const panelShellStyle = useMemo(
    () => ({
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      zIndex: 999999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '16px',
    }),
    []
  );

  const panelStyle = useMemo(
    () => ({
      width: '600px',
      minWidth: '500px',
      maxWidth: '900px',
      height: '100%',
      background:
        'linear-gradient(180deg, rgba(255,255,255,0.96) 0%, #F6F7FF 100%)',
      borderRadius: '0',
      boxShadow: '0 34px 84px rgba(15, 23, 42, 0.28)',
      border: '1px solid rgba(99, 102, 241, 0.18)',
      resize: 'none',
      overflow: 'hidden',
      backdropFilter: 'blur(18px)',
      display: 'flex',
      flexDirection: 'column',
    }),
    []
  );

  const headerStyle = useMemo(
    () => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '22px 26px',
      background: `linear-gradient(130deg, ${palette.primary} 0%, #7B5CFF 62%, ${palette.primaryHover} 100%)`,
      borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
      color: '#FFFFFF',
    }),
    []
  );

  const headerInfoStyle = useMemo(
    () => ({
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
    }),
    []
  );

  const headerBadgeStyle = useMemo(
    () => ({
      height: '44px',
      width: '44px',
      borderRadius: '16px',
      background: 'rgba(255, 255, 255, 0.22)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 16px 24px rgba(15, 16, 64, 0.18)',
      overflow: 'hidden',
    }),
    []
  );

  const headerTitleStyle = useMemo(
    () => ({
      margin: 0,
      fontSize: '17px',
      fontWeight: 600,
      color: '#FFFFFF',
    }),
    []
  );

  const headerSubtitleStyle = useMemo(
    () => ({
      margin: '4px 0 0',
      fontSize: '12px',
      fontWeight: 400,
      color: 'rgba(255, 255, 255, 0.75)',
    }),
    []
  );

  const closeButtonStyle = useMemo(
    () => ({
      height: '38px',
      width: '38px',
      borderRadius: '14px',
      border: '1px solid rgba(255, 255, 255, 0.28)',
      background: 'rgba(255, 255, 255, 0.18)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#FFFFFF',
      cursor: 'pointer',
      transition: 'transform 0.15s ease, background 0.15s ease',
    }),
    []
  );

  const toggleButtonStyle = useMemo(
    () => ({
      position: 'fixed',
      bottom: '32px',
      right: '32px',
      zIndex: 999999,
      height: '56px',
      width: '56px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0',
      borderRadius: '50%',
      border: '1px solid rgba(93, 62, 255, 0.34)',
      background: `linear-gradient(135deg, ${palette.primary} 0%, ${palette.primaryHover} 100%)`,
      boxShadow: '0 22px 44px rgba(93, 62, 255, 0.32)',
      color: '#FFFFFF',
      cursor: 'pointer',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    }),
    []
  );

  const suggestions = useMemo(
    () => [
      {
        id: 'energy_produced_7d',
        label: 'How much energy did I produce in the past 7 days?',
        keywords: [
          'produce',
          'production',
          'past 7 days',
          'last week',
          'energy produced',
          'generation',
        ],
        requiredTools: ['database'], // postgres_query
      },
      {
        id: 'energy_saved_7d',
        label: 'How much energy was saved in the past 7 days?',
        keywords: ['saved', 'savings', 'past 7 days', 'last week', 'reduced'],
        requiredTools: ['database'], // postgres_query
      },
      {
        id: 'chart_prod_vs_cons_7d',
        label:
          'Chart the comparison between production and consumption in the past 7 days',
        keywords: [
          'chart',
          'comparison',
          'production',
          'consumption',
          'past 7 days',
          'last week',
          'compare',
        ],
        requiredTools: ['database', 'code'], // postgres_query + code_exec_python
      },
      {
        id: 'energy_consumed_7d',
        label: 'How much energy did I consume in the past 7 days?',
        keywords: [
          'consume',
          'consumption',
          'past 7 days',
          'last week',
          'energy used',
        ],
        requiredTools: ['database'], // postgres_query
      },
      {
        id: 'peak_production_7d',
        label: 'What was the peak production in the past 7 days?',
        keywords: ['peak', 'maximum', 'production', 'past 7 days', 'last week'],
        requiredTools: ['database'], // postgres_query
      },
      {
        id: 'peak_consumption_7d',
        label: 'What was the peak consumption in the past 7 days?',
        keywords: [
          'peak',
          'maximum',
          'consumption',
          'past 7 days',
          'last week',
        ],
        requiredTools: ['database'], // postgres_query
      },
      {
        id: 'compare_prod_week_over_week',
        label: "Compare this week's production to last week",
        keywords: ['compare', 'week', 'production', 'this week', 'last week'],
        requiredTools: ['database'], // postgres_query
      },
      {
        id: 'compare_prod_month_over_month',
        label: "Compare this month's production to last month",
        keywords: [
          'compare',
          'month',
          'production',
          'this month',
          'last month',
        ],
        requiredTools: ['database'], // postgres_query
      },
      {
        id: 'chart_hourly_production_today',
        label: 'Chart the hourly production for today',
        keywords: ['chart', 'hourly', 'today', 'production', 'generation'],
        requiredTools: ['database', 'code'], // postgres_query + code_exec_python
      },
      {
        id: 'grid_imports_7d',
        label: 'How much energy did I import from the grid in the past 7 days?',
        keywords: ['grid', 'import', 'imports', 'past 7 days', 'last week'],
        requiredTools: ['database'], // postgres_query
      },
      {
        id: 'grid_exports_7d',
        label: 'How much energy did I export to the grid in the past 7 days?',
        keywords: ['grid', 'export', 'exports', 'past 7 days', 'last week'],
        requiredTools: ['database'], // postgres_query
      },
      {
        id: 'co2_avoided_7d',
        label: 'How much CO₂ did I avoid in the past 7 days?',
        keywords: [
          'co2',
          'carbon',
          'emissions',
          'avoided',
          'past 7 days',
          'last week',
        ],
        requiredTools: ['database'], // postgres_query
      },
      {
        id: 'top3_days_last_month',
        label: 'What were my top 3 production days last month?',
        keywords: ['top', 'best', 'production', 'days', 'last month'],
        requiredTools: ['database'], // postgres_query
      },
      {
        id: 'overnight_consumption_7d',
        label: 'How much overnight energy did I consume in the past 7 days?',
        keywords: [
          'overnight',
          'night',
          'consumption',
          'past 7 days',
          'last week',
        ],
        requiredTools: ['database'], // postgres_query
      },
      {
        id: 'explain_solar_panels',
        label: 'How do solar panels work?',
        keywords: ['solar', 'panels', 'work', 'explain', 'how'],
        requiredTools: [], // No special tools needed
      },
      {
        id: 'weather_impact',
        label: 'How does weather affect my solar production?',
        keywords: ['weather', 'impact', 'affect', 'solar', 'production'],
        requiredTools: [], // No special tools needed
      },
      {
        id: 'maintenance_tips',
        label: 'What maintenance does my solar system need?',
        keywords: ['maintenance', 'care', 'solar', 'system', 'tips'],
        requiredTools: [], // No special tools needed
      },
      {
        id: 'savings_calculation',
        label: 'How are my energy savings calculated?',
        keywords: ['savings', 'calculate', 'calculation', 'how', 'energy'],
        requiredTools: [], // No special tools needed
      },
      {
        id: 'system_efficiency',
        label: 'What is my system efficiency this month?',
        keywords: [
          'efficiency',
          'performance',
          'system',
          'this month',
          'effective',
        ],
        requiredTools: ['database'], // postgres_query
      },
      {
        id: 'battery_storage_status',
        label: 'What is my current battery storage level?',
        keywords: ['battery', 'storage', 'level', 'current', 'charge'],
        requiredTools: ['database'], // postgres_query
      },
      {
        id: 'daily_production_trend',
        label: 'Show me my daily production trend for the last 30 days',
        keywords: ['daily', 'trend', 'production', '30 days', 'month'],
        requiredTools: ['database', 'code'], // postgres_query + code_exec_python
      },
      {
        id: 'best_production_hour',
        label: 'What time of day produces the most energy?',
        keywords: ['time', 'hour', 'best', 'most', 'production', 'peak'],
        requiredTools: ['database'], // postgres_query
      },
      {
        id: 'worst_production_day',
        label: 'What was my lowest production day this month?',
        keywords: [
          'lowest',
          'worst',
          'minimum',
          'production',
          'day',
          'this month',
        ],
        requiredTools: ['database'], // postgres_query
      },
      {
        id: 'net_energy',
        label: 'What is my net energy for the past month?',
        keywords: ['net', 'energy', 'balance', 'past month', 'total'],
        requiredTools: ['database'], // postgres_query
      },
      {
        id: 'luminaire_products',
        label: 'What products does Luminaire Solar offer?',
        keywords: ['products', 'offer', 'luminaire', 'available', 'catalog'],
        requiredTools: ['web'], // html_to_markdown
      },
      {
        id: 'about_luminaire',
        label: 'Tell me about Luminaire Solar company',
        keywords: ['about', 'company', 'luminaire', 'who', 'information'],
        requiredTools: ['web'], // html_to_markdown
      },
      {
        id: 'epa_solar_technology',
        label: 'What does the EPA say about solar cell technology?',
        keywords: ['epa', 'solar', 'technology', 'cell', 'guidelines'],
        requiredTools: ['pdf'], // pdf_to_markdown
      },
      {
        id: 'epa_environmental_claims',
        label: 'What are the EPA guidelines for solar environmental claims?',
        keywords: [
          'epa',
          'environmental',
          'claims',
          'guidelines',
          'regulations',
        ],
        requiredTools: ['pdf'], // pdf_to_markdown
      },
      {
        id: 'monthly_comparison',
        label: 'Compare my energy production for the last 3 months',
        keywords: ['compare', 'months', 'production', 'last', 'quarterly'],
        requiredTools: ['database'], // postgres_query
      },
      {
        id: 'chart_weekly_consumption',
        label: 'Chart my weekly consumption pattern',
        keywords: [
          'chart',
          'weekly',
          'consumption',
          'pattern',
          'visualization',
        ],
        requiredTools: ['database', 'code'], // postgres_query + code_exec_python
      },
      {
        id: 'grid_dependence',
        label: 'How dependent am I on the grid this month?',
        keywords: ['grid', 'dependent', 'dependence', 'reliance', 'this month'],
        requiredTools: ['database'], // postgres_query
      },
      {
        id: 'energy_independence',
        label: 'What percentage of my energy is self-generated?',
        keywords: ['self', 'generated', 'independent', 'percentage', 'own'],
        requiredTools: ['database'], // postgres_query
      },
      {
        id: 'cost_savings_estimate',
        label: 'Estimate my cost savings based on current production',
        keywords: ['cost', 'savings', 'money', 'estimate', 'financial'],
        requiredTools: ['database'], // postgres_query
      },
      {
        id: 'seasonal_comparison',
        label: 'How does my winter production compare to summer?',
        keywords: ['seasonal', 'winter', 'summer', 'compare', 'season'],
        requiredTools: ['database'], // postgres_query
      },
      {
        id: 'production_forecast',
        label: 'What is my production forecast for next week?',
        keywords: ['forecast', 'prediction', 'next', 'week', 'expected'],
        requiredTools: ['database'], // postgres_query
      },
      {
        id: 'system_health',
        label: 'Is my system performing normally?',
        keywords: ['health', 'normal', 'performing', 'status', 'check'],
        requiredTools: ['database'], // postgres_query
      },
      {
        id: 'carbon_offset',
        label: 'How much carbon have I offset this year?',
        keywords: ['carbon', 'offset', 'environmental', 'year', 'impact'],
        requiredTools: ['database'], // postgres_query
      },
      {
        id: 'chart_prod_cons_monthly',
        label: 'Chart my monthly production vs consumption',
        keywords: [
          'chart',
          'monthly',
          'production',
          'consumption',
          'comparison',
        ],
        requiredTools: ['database', 'code'], // postgres_query + code_exec_python
      },
      {
        id: 'peak_hours_analysis',
        label: 'Analyze my peak production hours today',
        keywords: ['analyze', 'peak', 'hours', 'today', 'production'],
        requiredTools: ['database', 'code'], // postgres_query + code_exec_python
      },
    ],
    []
  );

  const handleChatToggle = () => {
    setOpen((prev) => !prev);
  };

  return (
    <>
      {open ? (
        <div style={panelShellStyle}>
          <div className="chat-panel flex flex-col" style={panelStyle}>
            <div style={headerStyle}>
              <div style={headerInfoStyle}>
                <div style={headerBadgeStyle}>
                  <div style={{ width: '28px', height: '28px' }}>
                    <ChatIcon />
                  </div>
                </div>
                <div>
                  <p style={headerTitleStyle}>Luminaire Agent</p>
                  <p style={headerSubtitleStyle}>
                    Smart guidance for your solar data
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleChatToggle}
                style={closeButtonStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.04)';
                  e.currentTarget.style.background =
                    'rgba(255, 255, 255, 0.28)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.background =
                    'rgba(255, 255, 255, 0.18)';
                }}
                aria-label="Close chat"
              >
                <CloseIcon />
              </button>
            </div>
            <Chat suggestions={suggestions} isOpen={open} />
          </div>
        </div>
      ) : null}
      <button
        type="button"
        onClick={handleChatToggle}
        style={{
          ...toggleButtonStyle,
          display: open ? 'none' : 'flex',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.08)';
          e.currentTarget.style.boxShadow =
            '0 26px 48px rgba(93, 62, 255, 0.42)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow =
            '0 22px 44px rgba(93, 62, 255, 0.32)';
        }}
        aria-expanded={open}
        aria-label="Open chat"
      >
        <ChatIcon />
      </button>
    </>
  );
}
