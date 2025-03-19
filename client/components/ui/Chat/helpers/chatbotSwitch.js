import { Assistant } from '../Assistant.jsx';
import BootstrapMessaging from '../BootstrapMessaging.jsx';
import { CHATBOT_TYPES } from './constants.js';

/**
 * Determines and returns the appropriate chatbot component based on the environment configuration.
 *
 * This function checks the `VITE_CHATBOT_TYPE` environment variable to decide which chatbot
 * component to render. Supported types are "heroku-ai" and "salesforce-ai".
 * If the type is unrecognized or unset, a warning is logged and null is returned.
 *
 * @returns {React.Component|null} The chatbot component to be rendered, or null if the type is unrecognized.
 */
export function getChatbotComponent() {
  const chatbotType = import.meta.env.VITE_CHATBOT_TYPE;

  if (!chatbotType) {
    console.warn('No specified chat integration, returning null');
    return null;
  }

  if (chatbotType === CHATBOT_TYPES.HEROKU) {
    return Assistant;
  } else if (chatbotType === CHATBOT_TYPES.SALESFORCE) {
    return BootstrapMessaging;
  }

  console.warn('Unknown/unrecognized chat integration type, returning null');
  return null;
}
