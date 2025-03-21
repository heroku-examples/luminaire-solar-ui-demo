// analysisSwitch.js

import { AgentforceAnalysis, MiaAnalysis } from '../../EnergyForecast';
import { AI_TYPES } from './constants';

/**
 * Determines and returns the appropriate analysis component based on the environment configuration.
 *
 * This function checks the `VITE_AI_TYPE` environment variable to decide which analysis
 * component to render. Supported types are "heroku-ai" and "salesforce-ai".
 * If the type is unrecognized or unset, a warning is logged and null is returned.
 *
 * @returns {React.Component|null} The analysis component to be rendered, or null if the type is unrecognized.
 */
export function getAnalysisComponent() {
  const chatbotType = import.meta.env.VITE_AI_TYPE;

  if (chatbotType === AI_TYPES.HEROKU) {
    return MiaAnalysis;
  } else if (chatbotType === AI_TYPES.SALESFORCE) {
    return AgentforceAnalysis;
  }

  console.warn('Unknown/unrecognized chat integration type, returning null');
  return null;
}
