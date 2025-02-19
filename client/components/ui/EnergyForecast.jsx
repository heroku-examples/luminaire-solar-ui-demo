import { useState, useEffect, useContext } from 'react';

import { useRouteContext } from '/:core.jsx';
import { setJwt, storeOrganizationId } from './Chat/services/dataProvider.js';
import { util } from './Chat/helpers/common.js';
import {
  CONVERSATION_CONSTANTS,
  APP_CONSTANTS,
} from './Chat/helpers/constants.js';
import { createEventSource } from './Chat/services/eventSourceService';
import config from './Chat/config.js';
import {
  createConversationEntry,
  parseServerSentEventData,
} from './Chat/helpers/conversationEntryUtil.js';
import { MetadataContext } from './Chat/helpers/metadataContext.js';
import { AgentforceAvatar } from '../icons/AgentforceAvatar.jsx';

/*
  Energy forecast component that includes 7-day efficiency forecast, and
  Agentforce agent analysis of system performance with respect to the 7-day
  efficiency forecast.
*/
export function EnergyForecast({ systemId, forecast, className }) {
  return (
    <div className={className}>
      <div className="grid grid-flow-col grid-cols-2 gap-4">
        <AgentforceAnalysis forecast={forecast} systemId={systemId} />
        <EfficiencyForecast forecast={forecast} />
      </div>
    </div>
  );
}

function AgentforceAnalysis({ forecast, className, systemId }) {
  if (!forecast) return <div></div>;

  const { metadata } = useContext(MetadataContext);

  // construct message for Agentforce; follow the metadata convention for systemId awareness
  const message = JSON.stringify({
    message: `Can you get my system's energy efficiency forecast?`,
    metadata: { ...metadata, env: 'internal' },
  });

  const {
    state: { authorization },
  } = useRouteContext();

  // Initialize the conversation status.
  const [conversationStatus, setConversationStatus] = useState(
    CONVERSATION_CONSTANTS.ConversationStatus.NOT_STARTED_CONVERSATION
  );
  const [agentJoined, setAgentJoined] = useState(false);
  const [agentResponses, setAgentResponses] = useState([]);
  const [agentAnalysis, setAgentAnalysis] = useState(null); // shape {efficiency: string, analysis: string}
  const [authenticatedAccessToken, setAuthenticatedAccessToken] =
    useState(null);
  const [conversationId, setConversationId] = useState(null);

  const esDeveloperName = config.developerName;

  async function handleFetchAnalysis() {
    let token = authenticatedAccessToken;
    try {
      // authenticatedAccessToken = await getAuthenticatedAccessToken(authorization);
      if (authenticatedAccessToken === null) {
        const getAuthenticatedAccessTokenRes = await fetch(
          `${config.url}/iamessage/api/v2/authorization/authenticated/access-token`,
          {
            method: 'POST',
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              esDeveloperName: config.developerName,
              orgId: config.organizationId,
              capabilitiesVersion: APP_CONSTANTS.APP_CAPABILITIES_VERSION,
              platform: APP_CONSTANTS.APP_PLATFORM,
              authorizationType: 'JWT',
              customerIdentityToken: authorization,
            }),
          }
        );
        token = (await getAuthenticatedAccessTokenRes.json()).accessToken;
        setAuthenticatedAccessToken(token);
      }
    } catch (e) {
      throw new Error('Failed to fetch an Authenticated access token.');
    }

    const conversationId = util.generateUUID();
    setConversationId(conversationId);

    await fetch(`${config.url}/iamessage/api/v2/conversation`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        esDeveloperName,
        conversationId,
      }),
    });

    const handleParseAgentMessage = async (event) => {
      const parsedEventData = parseServerSentEventData(event);
      const conversationEntry =
        parsedEventData.conversationId === conversationId
          ? createConversationEntry(parsedEventData)
          : undefined;
      if (!conversationEntry) return;
      if (
        conversationEntry.actorType ===
        CONVERSATION_CONSTANTS.ParticipantRoles.CHATBOT
      ) {
        setAgentJoined(true);
        setAgentResponses((prev) => [...prev, conversationEntry]);
      }
    };

    setJwt(token);
    storeOrganizationId(config.organizationId);

    try {
      await createEventSource(
        config.url.concat(`/eventrouter/v1/sse?_ts=${Date.now()}`),
        {
          [CONVERSATION_CONSTANTS.EventTypes.CONVERSATION_MESSAGE]:
            handleParseAgentMessage,
        }
      );
    } catch (e) {
      console.log('Event Source Creation Error: ', e);
    }
  }

  async function handleInitialQuery() {
    await fetch(
      `${config.url}/iamessage/api/v2/conversation/${conversationId}/message`,
      {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authenticatedAccessToken}`,
        },
        body: JSON.stringify({
          esDeveloperName: config.developerName,
          isNewMessagingSession: false,
          language: '',
          message: {
            inReplyToMessageId: '',
            id: util.generateUUID(),
            messageType:
              CONVERSATION_CONSTANTS.MessageTypes.STATIC_CONTENT_MESSAGE,
            staticContent: {
              formatType: CONVERSATION_CONSTANTS.FormatTypes.TEXT,
              text: message,
            },
          },
        }),
      }
    );
  }

  // handle ending conversation
  function handleEndConversation() {
    // end conversation
    fetch(
      `${config.url}/iamessage/api/v2/conversation/${conversationId}?esDeveloperName=${config.developerName}`,
      {
        method: 'DELETE',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authenticatedAccessToken}`,
        },
        body: JSON.stringify({
          esDeveloperName,
          conversationId,
        }),
      }
    );
  }

  function generateAnalysisColor(efficiency, opacity) {
    let color = 'white';
    const lcEfficiency = efficiency.toLowerCase();
    if (lcEfficiency === 'excellent') {
      color = `rgba(3, 182, 101, ${opacity ?? 1})`;
    } else if (lcEfficiency === 'fair') {
      color = `rgba(250, 159, 71, ${opacity ?? 1})`;
    } else if (lcEfficiency === 'very low') {
      color = `rgba(214, 65, 65, ${opacity ?? 1})`;
    }
    return color;
  }

  useEffect(() => {
    try {
      setAgentJoined(false);
      setAgentResponses([]);
      setAgentAnalysis(null);
      handleFetchAnalysis();
    } catch (e) {
      console.log(e);
    }
  }, [systemId]);

  useEffect(() => {
    if (agentJoined) {
      handleInitialQuery();
    }
  }, [agentJoined]);

  useEffect(() => {
    // set analysis
    const text =
      agentResponses[agentResponses.length - 1]?.content?.staticContent?.text;
    try {
      const parsedText = JSON.parse(text);
      setAgentAnalysis(parsedText);
    } catch (e) {
      console.log(e);
    }
  }, [agentResponses]);

  return (
    <div className="col-span-1 border rounded-lg border-[#e5e7eb] p-4">
      <div className="w-full flex justify-between">
        <p className="uppercase text-xs text-[#596981] font-bold">
          7 day predicted energy savings
        </p>
        <p className="text-xs text-[#596981] italic">
          powered by Agentforce AI
        </p>
      </div>
      {!agentAnalysis ? (
        <div className="mt-6 flex items-center px-2 py-1.5 animate-pulse">
          <AgentforceAvatar />
          <p className="pl-2 text-sm text-[#4F5359]">
            Predicting your system's efficiency...
          </p>
        </div>
      ) : (
        <div
          className="mt-6 flex items-center px-2 py-1.5 rounded-md"
          style={{
            background: generateAnalysisColor(agentAnalysis.efficiency, 0.1),
          }}
        >
          <AgentforceAvatar
            color={generateAnalysisColor(agentAnalysis.efficiency, 1)}
          />
          <p className="text-2xl font-bold pl-2">{agentAnalysis.efficiency}</p>
          <p className="pl-8 text-sm text-[#4F5359]">
            {agentAnalysis.analysis}
          </p>
        </div>
      )}
    </div>
  );
}

function EfficiencyForecast({ forecast, className }) {
  if (!forecast) return;
  const dayOfWeek = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  return (
    <div className="col-span-1 border rounded-lg border-[#e5e7eb] p-4">
      <p className="uppercase text-xs text-[#596981] font-bold">
        7 day solar production forecast
      </p>
      <div className="grid grid-flow-col grid-cols-[auto-fill] pt-4 overflow-x-auto">
        {forecast.map((day, index) => {
          const date = new Date(day.date);
          const dayOfWeekNumber = date.getDay();

          // calculate the height of the progress bar
          const cappedIrradiation = Math.min(day.irradiation, 6); // cap irradiation value for calculating bar percentage
          const efficiencyPercentage = cappedIrradiation / 6;
          const barHeight = 2; // height of the full bar in rem
          const fillHeight = Math.max(barHeight * efficiencyPercentage, 0.2); // height of the filled portion in rem; prevent empty bar
          let color;
          if (cappedIrradiation >= 4) {
            color = '#03B665';
          } else if (cappedIrradiation >= 2) {
            color = '#FA9F47';
          } else {
            color = '#D64141';
          }
          return (
            <div
              key={`forecast-${day.date}`}
              className="flex justify-center border-r border-[#e5e7eb] px-5 last:border-none"
            >
              <div className="w-2/5" style={{ minWidth: `${barHeight}rem` }}>
                <div
                  className={`bg-[#F7F8FB] relative rounded-md`}
                  style={{ height: `${barHeight}rem` }}
                >
                  <div
                    className={`w-full bg-black absolute bottom-0 left-0 right-0 ${cappedIrradiation === 6 ? 'rounded-md' : 'rounded-b-md'}`}
                    style={{
                      height: `${fillHeight}rem`,
                      background: color,
                    }}
                  ></div>
                </div>
                <p className="uppercase text-xs text-[#596981] text-center pt-1">
                  {dayOfWeek[dayOfWeekNumber]}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
