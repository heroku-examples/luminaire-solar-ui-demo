import './textMessage.css';
import { useState, useEffect } from 'react';
import * as ConversationEntryUtil from '../helpers/conversationEntryUtil';
import { util } from '../helpers/common';

import VotingIcon from '../icons/VotingIcon';

import config from '../config';
import { AgentforceAvatar } from '../../../icons/AgentforceAvatar';
import UserAvatar from '@/assets/img/profile.jpg';

export default function TextMessage({ conversationEntry }) {
  // Initialize acknowledgement status.
  let [isSent, setIsSent] = useState(false);
  let [isDelivered, setIsDelivered] = useState(false);
  let [isRead, setIsRead] = useState(false);
  let [acknowledgementTimestamp, setAcknowledgementTimestamp] = useState('');
  let [votingState, setVotingState] = useState(0); // -1/0/1 for downvote, novote, upvote respectively

  useEffect(() => {
    if (conversationEntry.isRead) {
      setIsRead(conversationEntry.isRead);
      setAcknowledgementTimestamp(
        conversationEntry.readAcknowledgementTimestamp
      );
    } else if (conversationEntry.isDelivered) {
      setIsDelivered(conversationEntry.isDelivered);
      setAcknowledgementTimestamp(
        conversationEntry.deliveryAcknowledgementTimestamp
      );
    } else if (conversationEntry.isSent) {
      setIsSent(conversationEntry.isSent);
      setAcknowledgementTimestamp(conversationEntry.transcriptedTimestamp);
    }
  }, [conversationEntry]);

  /**
   * Generates a classname for Text Message content (i.e. actual text).
   * @returns {string}
   */
  function generateTextMessageContainerClassName() {
    const className = 'textMessageContainer';
    return className;
  }

  /**
   * Generates a classname for Text Message metadata such as sender text.
   * @returns {string}
   */
  function generateMessageSenderContentClassName() {
    const className = `textMessageSenderContent ${conversationEntry.isEndUserMessage ? `outgoing` : `incoming`}`;

    return className;
  }

  /**
   * Generates a classname for Text Message bubble container.
   * @returns {string}
   */
  function generateMessageBubbleContainerClassName() {
    const className = `textMessageBubbleContainer`;

    return className;
  }

  /**
   * Generates a classname for Text Message bubble ui.
   * @returns {string}
   */
  function generateMessageBubbleClassName() {
    const className = `textMessageBubble ${conversationEntry.isEndUserMessage ? `outgoing` : `incoming`}`;

    return className;
  }

  /**
   * Generates a classname for Text Message content (i.e. actual text).
   * @returns {string}
   */
  function generateMessageContentClassName() {
    const className = `textMessageContent ${conversationEntry.isEndUserMessage ? `outgoing` : `incoming`} whitespace-pre-wrap`;
    return className;
  }

  /**
   * Generates a text with the message sender infomation.
   * @returns {string}
   */
  function generateMessageSenderContentText() {
    const formattedTime = util.getFormattedTime(
      conversationEntry.transcriptedTimestamp
    );

    return `${conversationEntry.isEndUserMessage ? `You` : conversationEntry.actorName} at ${formattedTime}`;
  }

  /**
   * Generates text content with the message acknowledgement infomation.
   * @returns {string}
   */
  function generateMessageAcknowledgementContentText() {
    const formattedAcknowledgementTimestamp = util.getFormattedTime(
      acknowledgementTimestamp
    );

    if (conversationEntry.isEndUserMessage) {
      if (isRead) {
        return `Read at ${formattedAcknowledgementTimestamp} • `;
      } else if (isDelivered) {
        return `Delivered at ${formattedAcknowledgementTimestamp} • `;
      } else if (isSent) {
        return `Sent • `;
      } else {
        return ``;
      }
    }
  }

  /**
   * Generates a classname for Text Message content (i.e. actual text).
   * @returns {string}
   */
  function generateMessageAgentNameClassName() {
    const className = 'textMessageAgentName';
    return className;
  }

  /**
   * Generates a classname for Text Message content (i.e. actual text).
   * @returns {string}
   */
  function generateTextMessageRowClassName() {
    const className = `textMessageRow ${conversationEntry.isEndUserMessage ? 'outgoing' : 'incoming'}`;
    return className;
  }

  /**
   * Generates a classname for Text Message content (i.e. actual text).
   * @returns {string}
   */
  function generateTextMessageAvatarClassName() {
    const className = 'textMessageAvatar';
    return className;
  }

  /**
   * Generates a classname for Text Message content (i.e. actual text).
   * @returns {string}
   */
  function generateTextMessageVotingContainerClassName() {
    const className = 'textMessageVotingContainer';
    return className;
  }

  /**
   * Generates a classname for Text Message content (i.e. actual text).
   * @returns {string}
   */
  function generateTextMessageVotingIconClassName() {
    const className = 'textMessageVotingIcon';
    return className;
  }

  /**
   * Handles setting the voting state
   */
  function handleVoteCast(value) {
    if (votingState === value) {
      // active voting state will be set unactive
      setVotingState(0);
    } else {
      // inactive voting state will be set active to specified value
      setVotingState(value);
    }
  }

  function generateAvatar() {
    return conversationEntry.isEndUserMessage ? (
      <img src={UserAvatar} />
    ) : (
      <AgentforceAvatar />
    );
  }

  return (
    <div className={generateTextMessageContainerClassName()}>
      {' '}
      {/* One coversation entry (row), including Avatar, message body, misc info */}
      {!conversationEntry.isEndUserMessage && (
        <div className={generateMessageAgentNameClassName()}>
          {config.agentName}
        </div>
      )}{' '}
      {/* Agent name */}
      <div className={generateTextMessageRowClassName()}>
        {' '}
        {/* Avatar and message*/}
        <div className={generateTextMessageAvatarClassName()}>
          {generateAvatar()}
        </div>{' '}
        {/* Avatar */}
        <div className={generateMessageBubbleContainerClassName()}>
          {' '}
          {/* Message, and more */}
          <div className={generateMessageBubbleClassName()}>
            <p className={generateMessageContentClassName()}>
              {`${ConversationEntryUtil.getTextMessageContent(conversationEntry)}`}
            </p>
          </div>
        </div>
      </div>
      {!conversationEntry.isEndUserMessage && (
        <div className={generateTextMessageVotingContainerClassName()}>
          {' '}
          {/* Up/downvote */}
          {/* <div
            className={generateTextMessageVotingIconClassName()}
            onClick={() => handleVoteCast(1)}
          >
            <VotingIcon
              upvote={true}
              active={votingState === 1 ? true : false}
            />
          </div>
          <div
            className={generateTextMessageVotingIconClassName()}
            onClick={() => handleVoteCast(-1)}
          >
            <VotingIcon
              upvote={false}
              active={votingState === -1 ? true : false}
            />
          </div> */}
        </div>
      )}
      {/* <p className={generateMessageSenderContentClassName()}>{generateMessageAcknowledgementContentText()}{generateMessageSenderContentText()}</p> */}
    </div>
  );
}
