import { Assistant } from '../Assistant.jsx';
import BootstrapMessaging from '../BootstrapMessaging.jsx';
import { AI_TYPES } from './constants.js';

/**
 * Determines and returns the appropriate chatbot component based on the environment configuration.
 *
 * This function checks the `VITE_AI_TYPE` environment variable to decide which chatbot
 * component to render. Supported types are "heroku-ai" and "salesforce-ai".
 * If the type is unrecognized or unset, a warning is logged and null is returned.
 *
 * @returns {React.Component|null} The chatbot component to be rendered, or null if the type is unrecognized.
 */
export function getChatbotComponent() {
  const chatbotType = import.meta.env.VITE_AI_TYPE;

  if (!chatbotType) {
    console.warn('No specified chat integration, returning null');
    return null;
  }

  if (chatbotType === AI_TYPES.HEROKU) {
    return Assistant;
  } else if (chatbotType === AI_TYPES.SALESFORCE) {
    return BootstrapMessaging;
  }

  console.warn('Unknown/unrecognized chat integration type, returning null');
  return null;
}
