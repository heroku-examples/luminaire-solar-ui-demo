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
import { getAnalysisComponent } from './Chat/helpers/analysisAgentSwitch.js';
import { AgentforceAvatar } from '../icons/AgentforceAvatar.jsx';

/*
  Energy forecast component that includes 7-day efficiency forecast, and
  Agentforce agent analysis of system performance with respect to the 7-day
  efficiency forecast.
*/
export function EnergyForecast({ systemId, forecast, className }) {
  const AnalysisComponent = getAnalysisComponent();

  return (
    <div className={className}>
      <div className="grid grid-flow-col grid-cols-2 gap-4">
        {AnalysisComponent && (
          <AnalysisComponent forecast={forecast} systemId={systemId} />
        )}
        <EfficiencyForecast forecast={forecast} />
      </div>
    </div>
  );
}

export function MiaAnalysis({ forecast, systemId }) {
  if (!forecast) return <div></div>;

  const { state, actions } = useRouteContext();
  const [analysisData, setAnalysisData] = useState(null);

  const message = JSON.stringify({
    message: `Please analyze the 7-day forecast for the given system`,
    metadata: { systemId: systemId, forecast: forecast, env: 'internal' },
  });

  const processStream = async (stream) => {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let result = '';
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        result += decoder.decode(value, { stream: true });
      }
      // Use a regex to match all complete JSON objects in the result.
      // This regex finds all substrings that start with { and end with }.
      const jsonMatches = result.match(/{[\s\S]*?}/g);
      let analysisObj = null;
      if (jsonMatches) {
        for (const jsonStr of jsonMatches) {
          try {
            const parsed = JSON.parse(jsonStr);
            // Look for the JSON object with the required keys.
            if (
              parsed.hasOwnProperty('efficiency') &&
              parsed.hasOwnProperty('analysis') &&
              parsed.hasOwnProperty('averageIrradiation')
            ) {
              analysisObj = parsed;
              break;
            }
          } catch (e) {
            console.error('Error parsing JSON object:', e);
          }
        }
      }
      if (analysisObj) {
        setAnalysisData(analysisObj);
      } else {
        console.warn('No valid analysis object found in the stream.');
      }
    } catch (error) {
      console.error('Error processing stream:', error);
    } finally {
      reader.releaseLock();
    }
  };

  async function fetchAnalysis() {
    //clear analysis data before fetching
    setAnalysisData(null);

    const requestBody = {
      question: message,
    };

    try {
      const response = await actions.chatCompletion(state, requestBody);
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }
      await processStream(response.body);
    } catch (error) {
      console.error('AI analysis error:', error);
    }
  }

  // Trigger the analysis when forecast changes.
  useEffect(() => {
    fetchAnalysis();
  }, [forecast]);

  return (
    <AnalysisDisplay
      analysis={{ source: 'Heroku AI', agentAnalysis: analysisData }}
    />
  );
}

export function AgentforceAnalysis({ forecast, systemId }) {
  if (!forecast) return <div></div>;

  // construct message for Agentforce; follow the metadata convention for systemId awareness
  const message = JSON.stringify({
    message: `Can you get my system's energy efficiency forecast?`,
    metadata: { systemId: systemId, env: 'internal' },
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
        if (!getAuthenticatedAccessTokenRes.ok) {
          const errorData = await getAuthenticatedAccessTokenRes.json();
          throw new Error(errorData.message);
        }
        const data = await getAuthenticatedAccessTokenRes.json();
        token = data.accessToken;
        setAuthenticatedAccessToken(token);
      }
    } catch (e) {
      throw new Error(
        'Failed to fetch an Authenticated access token.' + e.message
      );
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
    if (!text) return;
    try {
      const parsedText = JSON.parse(text);
      setAgentAnalysis(parsedText);
    } catch (e) {
      // console.log(e);
    }
  }, [agentResponses]);

  return (
    <AnalysisDisplay
      analysis={{ source: 'Agentforce AI', agentAnalysis: agentAnalysis }}
    />
  );
}

function AnalysisDisplay({ analysis }) {
  const { source, agentAnalysis } = analysis;

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

  return (
    <div className="col-span-1 bg-white border-solid border-2 border-gray-200 rounded-xl shadow-md p-4">
      <div className="w-full flex justify-between">
        <p className="uppercase text-xs text-[#596981] font-bold">
          7 day predicted energy savings
        </p>
        <p className="text-xs text-[#596981] italic">powered by {source}</p>
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
          <p className="flex-shrink-0 text-2xl font-bold pl-2">
            {agentAnalysis.efficiency}
          </p>
          <p className="pl-8 text-sm text-[#4F5359]">
            {agentAnalysis.analysis}
          </p>
        </div>
      )}
    </div>
  );
}

function EfficiencyForecast({ forecast }) {
  if (!forecast) return;
  const dayOfWeek = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  return (
    <div className="col-span-1 bg-white border-solid border-2 border-gray-200 rounded-xl shadow-md p-4">
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
