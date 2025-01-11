import {
  isValidOrganizationId,
  isValidDeploymentDeveloperName,
  isValidUrl,
} from './config-validation';

const config = {
  organizationId: '00DKd000008woId',
  developerName: 'Agentforce_Messaging_Deployment',
  url: 'https://storm-60d6dff0128a02.my.salesforce-scrt.com',
  agentName: 'Luminaire Agent',
};

assert(isValidOrganizationId(config.organizationId), 'Invalid Organization ID');
assert(
  isValidDeploymentDeveloperName(config.developerName),
  'Invalid Developer Name'
);
assert(isValidUrl(config.url), 'Invalid Salesforce URL');
function assert(condition, message) {
  if (!condition) throw new Error(message);
}

export default config;
