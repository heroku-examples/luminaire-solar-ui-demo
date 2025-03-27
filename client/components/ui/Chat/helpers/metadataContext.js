import { createContext } from 'react';

/**
 * Metadata to include in each conversation message sent to Agentforce.
 */
export const MetadataContext = createContext({
  systemId: null,
});
