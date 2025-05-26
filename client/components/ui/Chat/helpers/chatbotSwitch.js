import { Assistant } from '../Assistant.jsx';
import BootstrapMessaging from '../BootstrapMessaging.jsx';
import { AI_TYPES } from './constants.js';

/**
 * Determines and returns the appropriate chatbot component based on the environment configuration.
 *
 * This function checks the `VITE_AI_TYPE` environment variable to decide which chatbot
 * component to render. Supported types are "mia" and "agentforce".
 * If the type is unrecognized or unset, the default is "mia".
 *
 * @returns {React.Component|null} The chatbot component to be rendered, or null if the type is unrecognized.
 */
export function getChatbotComponent() {
  const chatbotType = import.meta.env.VITE_AI_TYPE;

  if (chatbotType === AI_TYPES.SALESFORCE) {
    return BootstrapMessaging;
  }

  return Assistant;
}
