/**
 * SalesforceAgentConnector
 *
 * Provides a connector between the chat UI and the Salesforce Agent API
 * using the AgentApiClient.
 */

import AgentApiClient from '../../../../src/services/AgentApiClient';
import {
  getAgentApiConfig,
  validateAgentApiConfig,
} from '../../../../src/services/AgentApiConfig';

// Keep track of the active session
let activeSessionId = null;
let activeEventSource = null;
let keepAliveTimeout = null;
const KEEP_ALIVE_TIMEOUT = 60000; // 60 seconds

/**
 * Initialize the Agent API client
 * @returns {Promise<AgentApiClient>} The initialized client
 */
export const initializeAgentApiClient = async () => {
  const config = getAgentApiConfig();

  try {
    validateAgentApiConfig(config);
  } catch (error) {
    console.error('Agent API configuration error:', error);
    throw new Error(
      `Salesforce Agent API configuration error: ${error.message}`
    );
  }

  const client = new AgentApiClient(config);

  try {
    await client.authenticate();
    return client;
  } catch (error) {
    console.error('Agent API authentication error:', error);
    throw new Error('Failed to authenticate with Salesforce Agent API');
  }
};

/**
 * Send a message to the agent
 * @param {string} message The message text
 * @param {function} onChunk Callback for message chunks
 * @param {function} onComplete Callback when streaming is complete
 * @param {function} onError Callback for errors
 */
export const sendMessage = async (message, onChunk, onComplete, onError) => {
  try {
    const client = await initializeAgentApiClient();

    // Create a new session if we don't have one
    if (!activeSessionId) {
      activeSessionId = await client.createSession();
    }

    // Clear any existing timeout
    if (keepAliveTimeout) {
      clearTimeout(keepAliveTimeout);
    }

    // Close any existing event source
    if (activeEventSource) {
      activeEventSource.close();
    }

    // Define the "done" handler to clean up resources
    const onDone = async () => {
      if (activeEventSource) {
        activeEventSource.close();
      }

      if (onComplete) {
        onComplete();
      }
    };

    // Send the message as a streaming request
    activeEventSource = await client.sendStreamingMessage(
      activeSessionId,
      message,
      [], // No variables needed for basic chat
      ({ data, event }) => {
        try {
          const eventData = JSON.parse(data);

          // Handle different event types
          if (event === 'message') {
            // Parse the content from the agent response
            const contentValue = extractContentFromAgentResponse(eventData);
            if (contentValue) {
              onChunk(contentValue);
            }
          }
        } catch (error) {
          console.error('Error processing event:', error);
          // For non-JSON data, treat it as plain text
          onChunk(data);
        }
      },
      onDone
    );

    // Set a timeout to close the connection after inactivity
    keepAliveTimeout = setTimeout(async () => {
      console.log('Closing SSE after timeout');
      if (activeEventSource) {
        activeEventSource.close();
      }

      // Close the session
      try {
        await client.closeSession(activeSessionId);
        activeSessionId = null;
      } catch (closeError) {
        console.error('Error closing session:', closeError);
      }
    }, KEEP_ALIVE_TIMEOUT);
  } catch (error) {
    console.error('Error sending message:', error);
    if (onError) {
      onError(error);
    }
  }
};

/**
 * Extract content from agent response based on the structure
 * @param {Object} eventData The parsed event data
 * @returns {string|null} The extracted content or null
 */
const extractContentFromAgentResponse = (eventData) => {
  // Handle different response formats
  if (eventData.content) {
    return eventData.content;
  }

  if (eventData.chunks && Array.isArray(eventData.chunks)) {
    // If chunks exist, extract text from them
    const textChunks = eventData.chunks
      .filter((chunk) => chunk.type === 'Text')
      .map((chunk) => chunk.text);

    if (textChunks.length > 0) {
      return textChunks.join('');
    }
  }

  // If we can't find content, return the stringified data
  return JSON.stringify(eventData);
};

/**
 * Close the current session
 */
export const closeSession = async () => {
  if (activeSessionId) {
    try {
      const client = await initializeAgentApiClient();
      await client.closeSession(activeSessionId);
      activeSessionId = null;

      if (keepAliveTimeout) {
        clearTimeout(keepAliveTimeout);
      }

      if (activeEventSource) {
        activeEventSource.close();
      }
    } catch (error) {
      console.error('Error closing session:', error);
    }
  }
};
