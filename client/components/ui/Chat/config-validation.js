import { APP_CONSTANTS } from './helpers/constants';

/**
 * Validates whether the supplied string is a valid Salesforce Organization Id.
 * @returns {boolean}
 */
export function isValidOrganizationId(id) {
  return (
    typeof id === 'string' &&
    (id.length === 18 || id.length === 15) &&
    id.substring(0, 3) === APP_CONSTANTS.ORGANIZATION_ID_PREFIX
  );
}

/**
 * Validates whether the supplied string is a valid Salesforce Embedded Service Deployment Developer Name.
 * @returns {boolean}
 */
export function isValidDeploymentDeveloperName(name) {
  return typeof name === 'string' && name.length > 0;
}

/**
 * Determines whether the supplied url is a Salesforce Url.
 * @returns {boolean}
 */
function isSalesforceUrl(url) {
  try {
    return (
      typeof url === 'string' &&
      url.length > 0 &&
      url.slice(-19) === APP_CONSTANTS.SALESFORCE_MESSAGING_SCRT_URL
    );
  } catch (err) {
    console.error(
      `Something went wrong in validating whether the url is a Salesforce url: ${err}`
    );
    return false;
  }
}

/**
 * Validates whether the supplied string has a valid protocol and is a Salesforce Url.
 * @returns {boolean}
 */
export function isValidUrl(url) {
  try {
    const urlToValidate = new URL(url);
    return (
      isSalesforceUrl(url) &&
      urlToValidate.protocol === APP_CONSTANTS.HTTPS_PROTOCOL
    );
  } catch (err) {
    console.error(
      `Something went wrong in validating the url provided: ${err}`
    );
    return false;
  }
}
