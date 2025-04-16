'use client';

import { useState, useEffect } from 'react';

// Import children components to render.
import MessagingWindow from './component/messagingWindow.jsx';

import './BootstrapMessaging.css';

import {
  storeOrganizationId,
  storeDeploymentDeveloperName,
  storeSalesforceMessagingUrl,
} from './services/dataProvider.js';
import {
  determineStorageType,
  initializeWebStorage,
  getItemInWebStorageByKey,
  getItemInPayloadByKey,
} from './helpers/webstorageUtils.js';
import { APP_CONSTANTS, STORAGE_KEYS } from './helpers/constants.js';

import ChatIcon from './icons/ChatIcon.jsx';

import config from './config.js';

export default function BootstrapMessaging() {
  let [orgId, setOrgId] = useState('');
  let [deploymentDevName, setDeploymentDevName] = useState('');
  let [messagingURL, setMessagingURL] = useState('');
  let [shouldShowMessagingWindow, setShouldShowMessagingWindow] =
    useState(false);
  let [isExistingConversation, setIsExistingConversation] = useState(false);

  useEffect(() => {
    const storage = determineStorageType();
    if (!storage) {
      console.error(
        'Cannot initialize the app. Web storage is required for the app to function.'
      );
      return;
    }

    const messaging_webstorage_key = Object.keys(storage).filter((item) =>
      item.startsWith(APP_CONSTANTS.WEB_STORAGE_KEY)
    )[0];

    if (messaging_webstorage_key) {
      const webStoragePayload = storage.getItem(messaging_webstorage_key);

      // Batch state updates together
      const newOrgId = getItemInPayloadByKey(
        webStoragePayload,
        STORAGE_KEYS.ORGANIZATION_ID
      );
      const newDeploymentDevName = getItemInPayloadByKey(
        webStoragePayload,
        STORAGE_KEYS.DEPLOYMENT_DEVELOPER_NAME
      );
      const newMessagingURL = getItemInPayloadByKey(
        webStoragePayload,
        STORAGE_KEYS.MESSAGING_URL
      );

      // Update all related states at once
      setOrgId(newOrgId);
      setDeploymentDevName(newDeploymentDevName);
      setMessagingURL(newMessagingURL);

      // Initialize after state updates using the new values directly
      initializeMessagingClient(
        newOrgId,
        newDeploymentDevName,
        newMessagingURL
      );

      const messagingJwt = getItemInWebStorageByKey(STORAGE_KEYS.JWT);

      // Batch these state updates together
      if (messagingJwt) {
        // Existing conversation.
        setIsExistingConversation(true);
        setShouldShowMessagingWindow(true);
      } else {
        // New conversation.
        setIsExistingConversation(false);
      }
    } else {
      // New conversation.
      setIsExistingConversation(false);
    }

    // Cleanup function
    return () => {
      showMessagingWindow(false);
    };
  }, []); // Keep empty if this should only run on mount

  /**
   * Initialize the messaging client by
   * 1. internally initializing the Embedded Service deployment paramaters in-memory.
   * 2. initializing Salesforce Organization Id in the browser web storage.
   */
  function initializeMessagingClient(orgId, deploymentDevName, messagingURL) {
    // Initialize helpers.
    initializeWebStorage(orgId);
    storeOrganizationId(orgId);
    storeDeploymentDeveloperName(deploymentDevName);
    storeSalesforceMessagingUrl(messagingURL);
  }

  /**
   * Handle a click action from the Deployment-Details-Form Submit Button. If the inputted parameters are valid, initialize the Messaging Client start the chat.
   * @param {object} evt - button click event
   */
  function handleDeploymentDetailsFormSubmit(evt) {
    // Initialize the Messaging Client.
    initializeMessagingClient(
      config.organizationId,
      config.developerName,
      config.url
    );
    // New conversation.
    setIsExistingConversation(false);
    showMessagingWindow(true);
  }

  /**
   * Determines whether to render the Messaging Window based on the supplied parameter.
   * @param {boolean} shouldShow - TRUE - render the Messaging WINDOW and FALSE - Do not render the Messaging Window & Messaging Button
   */
  function showMessagingWindow(shouldShow) {
    setShouldShowMessagingWindow(Boolean(shouldShow));
  }

  return (
    <div>
      {!shouldShowMessagingWindow && (
        <div
          className="messagingFloatingButton"
          onClick={handleDeploymentDetailsFormSubmit}
        >
          <ChatIcon />
        </div>
      )}
      {shouldShowMessagingWindow && (
        <MessagingWindow
          isExistingConversation={isExistingConversation}
          showMessagingWindow={showMessagingWindow}
        />
      )}
    </div>
  );
}
