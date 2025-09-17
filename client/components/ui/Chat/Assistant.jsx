import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { IconCheck, IconTools } from '@tabler/icons-react';
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

const useChatStream = ({ onError } = {}) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello, I'm Luminaire Agent, how can I help you today?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  const sendMessage = async (message, actions, state) => {
    if (!message.trim()) return;

    const userMessage = { role: 'user', content: message };
    const agentMessage = {
      role: 'agent',
      content: 'Luminaire Agent is processing your request...',
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
          },
        ];
      });
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  const processStream = async (stream) => {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let agentBuffer = '';
    let isFirstAssistantMessage = true;

    const handleAgentMessage = (message) => {
      if (message.sessionId && !sessionId) {
        setSessionId(message.sessionId);
      }
      flushSync(() => {
        setMessages((prevMessages) => [...prevMessages, message]);
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
          return [...updatedMessages, { role: 'assistant', content }];
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
      console.error('Stream error:', error);
      const errorMessage =
        error.message === 'Unauthorized'
          ? 'Session expired. Please refresh the page.'
          : 'Connection interrupted. Please try again.';

      setMessages((prev) => [
        ...prev,
        { role: 'error', content: errorMessage },
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
        <Loader size="xs" color="blue" />
      ) : (
        <IconCheck size={14} color="green" />
      )}
    </div>
  );
};

const Message = ({ role, content, isLast, onImageClick }) => {
  const theme = useMantineTheme();
  const messageStyles = {
    base: {
      padding: '12px 10px',
      maxWidth: '80%',
      borderRadius: '16px',
      marginBottom: '16px',
    },
    user: {
      marginLeft: 'auto',
      background: '#7526E3',
      color: 'white',
      borderBottomRightRadius: '4px',
    },
    assistant: {
      background: '#F7F8FB',
      border: '1px solid #D0D7E5',
      color: '#333',
      borderBottomLeftRadius: '4px',
    },
    agent: {
      fontStyle: 'italic',
      color: '#666666',
      padding: 0,
      marginBottom: 0,
      borderRadius: 0,
    },
    tool: {
      fontStyle: 'italic',
      color: '#666666',
      padding: 0,
      marginBottom: 0,
      borderRadius: 0,
    },
    error: {
      background: '#ffebee',
      color: '#d32f2f',
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

  return (
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
            {role === 'tool' ? <IconTools size={14} color="#666666" /> : null}
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
  );
};

const Chat = ({ suggestions = [] }) => {
  const { state, actions } = useRouteContext();
  const [currentMessage, setCurrentMessage] = useState('');
  const viewportRef = useRef(null);
  const inputRef = useRef(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [zoomImageSrc, setZoomImageSrc] = useState('');
  const [zoomImageAlt, setZoomImageAlt] = useState('');

  const { messages, isLoading, sendMessage } = useChatStream({
    onError: () => focus(),
  });

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

  const handleImageClick = (src, alt) => {
    if (!src) return;
    setZoomImageSrc(src);
    setZoomImageAlt(alt || '');
    setIsImageModalOpen(true);
  };

  const selectedSuggestions = useMemo(() => {
    if (!Array.isArray(suggestions) || suggestions.length === 0) return [];

    const lastFewMessages = messages.slice(-6);
    const contextText = lastFewMessages
      .map((m) => (m?.content || '').toString().toLowerCase())
      .join(' \n ');

    const withScores = suggestions.map((s, idx) => {
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
      for (let i = available.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [available[i], available[j]] = [available[j], available[i]];
      }
      return available.slice(0, count);
    };

    const chosen = relevant.slice(0, 3);
    if (chosen.length < 3) {
      const chosenIds = new Set(chosen.map((s) => s.id));
      const filler = pickRandom(suggestions, 3 - chosen.length, chosenIds);
      return [...chosen, ...filler].slice(0, 3);
    }
    return chosen.slice(0, 3);
  }, [messages, suggestions]);

  const lastMessage = messages[messages.length - 1];
  const showSuggestions =
    !isLoading &&
    lastMessage?.role === 'assistant' &&
    selectedSuggestions.length > 0;

  const handleSuggestionClick = async (text) => {
    if (!text || isLoading) return;
    await sendMessage(text, actions, state);
    setCurrentMessage('');
    focus();
  };

  return (
    <>
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-y-auto pt-6 px-6" ref={viewportRef}>
          <Stack spacing="xs">
            {messages.map((msg, i) => (
              <Message
                key={i}
                role={msg.role}
                content={msg.content}
                isLast={i === messages.length - 1}
                onImageClick={handleImageClick}
              />
            ))}
          </Stack>
          {showSuggestions && (
            <div className="mt-2 mb-4">
              <div className="flex flex-wrap gap-2">
                {selectedSuggestions.map((s) => (
                  <button
                    key={s.id}
                    className="text-xs px-3 py-2 rounded-full border border-dark-grey bg-white hover:bg-light-grey transition-colors"
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
        <div className="bg-lightest-grey rounded-b-3xl px-6 pt-4 pb-8">
          <div className="flex gap-4 bg-white border border-dark-grey rounded-3xl py-[2px] pl-2 pr-[2px]">
            <input
              className="bg-transparent focus:outline-none overflow-hidden overflow-ellipsis w-[840px]"
              placeholder="Type your message here..."
              value={currentMessage}
              ref={inputRef}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              disabled={isLoading}
            />
            <button
              className="h-8 w-8 flex justify-center items-center ml-auto bg-purple-40 rounded-full text-white"
              onClick={handleSend}
            >
              <SendIcon />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export function Assistant() {
  const [open, setOpen] = useState(false);

  const suggestions = [
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
    },
    {
      id: 'energy_saved_7d',
      label: 'How much energy was saved in the past 7 days?',
      keywords: ['saved', 'savings', 'past 7 days', 'last week', 'reduced'],
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
    },
    {
      id: 'peak_production_7d',
      label: 'What was the peak production in the past 7 days?',
      keywords: ['peak', 'maximum', 'production', 'past 7 days', 'last week'],
    },
    {
      id: 'peak_consumption_7d',
      label: 'What was the peak consumption in the past 7 days?',
      keywords: ['peak', 'maximum', 'consumption', 'past 7 days', 'last week'],
    },
    {
      id: 'compare_prod_week_over_week',
      label: 'Compare this week’s production to last week',
      keywords: ['compare', 'week', 'production', 'this week', 'last week'],
    },
    {
      id: 'compare_prod_month_over_month',
      label: 'Compare this month’s production to last month',
      keywords: ['compare', 'month', 'production', 'this month', 'last month'],
    },
    {
      id: 'chart_hourly_production_today',
      label: 'Chart the hourly production for today',
      keywords: ['chart', 'hourly', 'today', 'production', 'generation'],
    },
    {
      id: 'grid_imports_7d',
      label: 'How much energy did I import from the grid in the past 7 days?',
      keywords: ['grid', 'import', 'imports', 'past 7 days', 'last week'],
    },
    {
      id: 'grid_exports_7d',
      label: 'How much energy did I export to the grid in the past 7 days?',
      keywords: ['grid', 'export', 'exports', 'past 7 days', 'last week'],
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
    },
    {
      id: 'top3_days_last_month',
      label: 'What were my top 3 production days last month?',
      keywords: ['top', 'best', 'production', 'days', 'last month'],
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
    },
  ];

  const handleChatToggle = () => {
    setOpen(!open);
  };

  return (
    <>
      <div
        className={`flex flex-col w-[900px] h-[800px] z-[999999] bg-white shadow-xl border border-light-grey rounded-3xl ${open ? '' : 'hidden'}`}
      >
        <div className="flex justify-between items-center bg-light-grey py-4 px-6 rounded-t-3xl">
          <p className="font-semibold text-sm">Luminaire Agent Chat</p>
          <div onClick={handleChatToggle} className="hover:cursor-pointer">
            <CloseIcon />
          </div>
        </div>
        <Chat suggestions={suggestions} />
      </div>
      <div
        className="w-fit ml-auto mt-8 cursor-pointer hover:opacity-95"
        onClick={handleChatToggle}
      >
        <ChatIcon />
      </div>
    </>
  );
}
