// analysisSwitch.js

import { AgentforceAnalysis, MiaAnalysis } from '../../EnergyForecast';
import { AI_TYPES } from './constants';

/**
 * Determines and returns the appropriate analysis component based on the environment configuration.
 *
 * This function checks the `VITE_AI_TYPE` environment variable to decide which analysis
 * component to render. Supported types are "mia" and "agentforce".
 * If not set, the default is "mia".
 *
 * @returns {React.Component|null} The analysis component to be rendered, or null if the type is unrecognized.
 */
export function getAnalysisComponent() {
  const chatbotType = import.meta.env.VITE_AI_TYPE;

  if (chatbotType === AI_TYPES.SALESFORCE) {
    return AgentforceAnalysis;
  }

  return MiaAnalysis;
}
