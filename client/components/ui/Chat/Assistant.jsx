import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { IconCheck } from '@tabler/icons-react';
import ChatIcon from './icons/ChatIcon.jsx';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { useRouteContext } from '/:core.jsx';
import { Box, Text, Stack, Loader, useMantineTheme } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import SendIcon from './icons/SecondIcon.jsx';
import CloseIcon from './icons/CloseIcon.jsx';

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

const Message = ({ role, content, isLast }) => {
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
      padding: '2px',
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
      {role === 'agent' ? (
        <div style={{ display: 'flex', alignItems: 'center' }}>
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

const Chat = () => {
  const { state, actions } = useRouteContext();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello, I'm Luminaire Agent, how can I help you today?",
    },
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const viewportRef = useRef(null);

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

  const handleSend = async () => {
    if (!currentMessage.trim()) return;

    const userMessage = { role: 'user', content: currentMessage };
    const agentMessage = {
      role: 'agent',
      content: 'Luminaire Agent is thinking...',
    };
    setMessages((prev) => [...prev, userMessage, agentMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const requestBody = {
        question: currentMessage,
        ...(sessionId && { sessionId }),
      };

      const response = await actions.chatCompletion(state, requestBody);

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      await processStream(response.body);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'error',
          content: 'Sorry, there was an error processing your message',
        },
      ]);
    } finally {
      setIsLoading(false);
      focus();
    }
  };

  const processStream = async (stream) => {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let isFirstAssistantMessage = true;

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        // Split by newline but preserve them in the content
        const chunks = buffer.split(/(?<=\n)/);
        buffer = chunks.pop() || ''; // Save incomplete chunk

        for (const chunk of chunks) {
          if (!chunk.trim()) continue;

          try {
            const message = JSON.parse(chunk);

            if (message.sessionId && !sessionId) {
              setSessionId(message.sessionId);
            }

            setMessages((prevMessages) => {
              const updatedMessages = [...prevMessages];

              // If it's an agent message, add it as a new message
              if (message.role === 'agent') {
                return [...updatedMessages, message];
              }

              // Handle assistant message
              if (isFirstAssistantMessage) {
                isFirstAssistantMessage = false;
                return [
                  ...updatedMessages,
                  { role: 'assistant', content: message.content || '' },
                ];
              }

              // Append content to the last assistant message
              const lastMessage = updatedMessages[updatedMessages.length - 1];
              if (lastMessage && lastMessage.role === 'assistant') {
                lastMessage.content += message.content || '';
              }

              return updatedMessages;
            });
          } catch (e) {
            // If JSON parsing fails, treat it as a partial assistant message
            setMessages((prevMessages) => {
              const updatedMessages = [...prevMessages];
              const lastMessage = updatedMessages[updatedMessages.length - 1];

              if (lastMessage && lastMessage.role === 'assistant') {
                lastMessage.content += chunk;
              } else if (isFirstAssistantMessage) {
                isFirstAssistantMessage = false;
                updatedMessages.push({ role: 'assistant', content: chunk });
              }
              return updatedMessages;
            });
          }
        }
      }

      // Process any remaining data in buffer
      if (buffer) {
        try {
          const message = JSON.parse(buffer);

          if (message.sessionId && !sessionId) {
            setSessionId(message.sessionId);
          }

          setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages];

            if (message.role === 'agent') {
              return [...updatedMessages, message];
            }

            const lastMessage = updatedMessages[updatedMessages.length - 1];
            if (lastMessage && lastMessage.role === 'assistant') {
              lastMessage.content += message.content || '';
            }

            return updatedMessages;
          });
        } catch (e) {
          // Handle remaining partial content
          setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages];
            const lastMessage = updatedMessages[updatedMessages.length - 1];

            if (lastMessage && lastMessage.role === 'assistant') {
              lastMessage.content += buffer;
            }

            return updatedMessages;
          });
        }
      }
    } catch (error) {
      console.error('Stream error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'error',
          content: 'Sorry, there was an error processing the response',
        },
      ]);
    } finally {
      reader.releaseLock();
    }
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
              />
            ))}
          </Stack>
        </div>
        <div className="bg-lightest-grey rounded-b-3xl px-6 pt-4 pb-8">
          <div className="flex gap-4 bg-white border border-dark-grey rounded-3xl py-[2px] pl-2 pr-[2px]">
            <input
              className="bg-transparent focus:outline-none overflow-hidden overflow-ellipsis w-[440px]"
              placeholder="Type your message here..."
              value={currentMessage}
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

  const handleChatToggle = () => {
    setOpen(!open);
  };

  return (
    <>
      <div
        className={`flex flex-col w-[550px] h-[600px] z-[999999] bg-white shadow-xl border border-light-grey rounded-3xl ${open ? '' : 'hidden'}`}
      >
        <div className="flex justify-between items-center bg-light-grey py-4 px-6 rounded-t-3xl">
          <p className="font-semibold text-sm">Luminaire Agent Chat</p>
          <div onClick={handleChatToggle} className="hover:cursor-pointer">
            <CloseIcon />
          </div>
        </div>
        <Chat />
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
