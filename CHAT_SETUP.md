# Configuring and Deplying a Custom Client Deployment for Messaging for In-App and Web.

The broad steps for full authenticated user Agentforce integration includes:

1. [Configure a Custom Client Deployment for Messaging for In-App and Web](https://help.salesforce.com/s/articleView?id=service.miaw_deployment_custom.htm&type=5)
2. Copy over the chat component under @/components/ui/Chat
3. Set up user authentication

An outline of the steps is given below.

## 1) Enable and Configure Omni-Channel by:

1.1) From `Setup`, enter and select `Omni-Channel Settings` in the Quick Find box

1.2) Enable **Omni-Channel** and save

1.3) Enter and select `Service Channels` in the Quick Find box

1.4) Click **New** and ensure `Salesforce Object` has **Messaging Session**

1.5) Enter and select `Routing Configurations` in the Quick Find box

1.6) Click **New** and enter routing settings (e.g. **Routing Priority**: 1, **Routing Model**: Least Active, **Units of Capacity**: 5, **Capacity Type**: Inherited); we will call this **Agentforce Queue Routing**

1.7) From `Setup`, enter and select `Queues` in the Quick Find box

1.8) Click **New** and enter required fields; we will call this **Agentforce Messaging Queue**.

1.9) Under `Routing Configuration` select the previously created **Agentforce Queue Routing**.

1.10) Under `Supported Objects`, add **Messaging Session**

1.11) Under `Queue Members` add **EinsteinServiceAgent User** and save

## 2) Create a Service Channel by:

2.1) From `Setup`, enter and select **Service Channels** in the Quick Find box

2.2) Click **New** and ensure `Salesforce Object` has **Messaging Session**; we will call this **LiveMessage**

## 3) Create an Omni-Channel Flow by:

3.1) From `Setup`, enter and select **Flows** in the Quick Find box

3.2) Click **New**, and select under template **Omni-Channel Flow** with option **Route to Service Agent**

3.3) Set `Service Channel` to the previously created **LiveMessage**

3.4) Ensure `Route To` is set to **Agentforce Service Agent**

3.5) Set `Fallback Queue` by choosing **Select Queue** and selected the previously created **Agentforce Messaging Queue** (from step 1)

3.6) Save and activate the flow

## 4) Create Messaging Channel by:

4.1) From `Setup`, enter and select **Messaging Settings** in the Quick Find box

4.2) Click **New** and select **Messaging for In-App and Web**; we will call it **Agentforce Messaging**

4.3) Ensure `Type` is **Embedded Messaging**

4.4) Under `Omni-Channel Routing`, set `Routing Type` to **OmniFlow**, `Flow Definition` to **Route Conversations to Agentforce Service Agents**, and `Fallback Queue` to **Agentforce Messaging Queue**

4.5) Optionally, under `Automated Responses`, create customized messages for various events

4.6) Save and activate; ensure that the channel button says **Active**

## 5) Deploy by:

5.1) From `Setup` enter and select **Embedded Service Deployments**

5.2) Click **New Deployment**, select **Messaging for In-App and Web**, choose **Custom Client**, and set `Messaging Channel` to previously created **Agentforce Messaging** (from step 4); we will call this **Agentforce Messaging Deployment**

5.3) Optionally enable and configure pre-chat, and also jot down the fields from `Code Snippet`

5.4) Set to active, and publish the deployment; this takes a few minutes

# Copy over the chat component

## 1) Copy over the chat template by:

1.1) Navigate to `@/components/ui/Chat`, and copy the whole component over to your project

1.2) Under the chat component's `config.js` file, set the `organizationId`, `developerName`, and `url` to the previously saved values from `Code Snippet` (step 5)

# Set up user authentication

## 1) Create your own pair of public private keys

1.1) If you already have a set of certificates, skip this step. For testing purposes, [create a certificate](https://github.com/Salesforce-Async-Messaging/key-command-line-utility/blob/master/CreatingCertificates.md).

1.2) If you already have a method of generating a JWK and JWT, skip this step Otherwise, [generate a JWK and JWT](https://github.com/Salesforce-Async-Messaging/key-command-line-utility)

## 2) Enable User Verification

2.1) From `Setup`, enter and select **Messaging Settings**

2.2) On the column of your created channel (we previously named this **Agentforce Messaging**), click edit from the dropdown arrow on the right side

2.3) Under `User Verification`, check **Add User Verification**

## 3) Add JWK and JWKS to Salesforce

3.1) From `Setup`, enter and select **Messaging for In-App and Web User Verification**

3.2) Click **New Key** and upload your JWK

3.3) Click **New Keyset**, select `Type` of **Keys**, and select the previously uploaded JWK as the key to attach

Certain flows also require some extra setup.

# To enable case interactions:

## Add permission to create case:

1. Go to Setup, search and select “Permission Sets”
2. Click “New” and create permission set
3. Create and click into created permission set
4. Click “Object Settings”
5. Search and click into “Case”
6. Click “Edit Properties” and enable all access in all sections, except `View All` and `Modify All` under “Object Permissions” section
7. Go to Setup, search and select “Users”
8. Search and select `EinsteinServiceAgent User` user.
9. Under “Permission Set Assignments”, click “Edit Assignments”
10. Add the created permission set to the user

## Update org sharing settings for case:

1. Go to Setup, search and select “Sharing Settings”
2. Click edit
3. Find “Case” and set “Default Internal Access” to `Public Read Only`
4. Save

---

# Heroku App Integration

Setup of app and mesh layer; documentation can be found [here](https://devcenter.heroku.com/articles/getting-started-heroku-integration#deploy-your-heroku-app).

The relevant outlined steps are:

1. Create an App and Integration Project
2. Provision the Heroku Integration Add-on
3. Set the Heroku Integration Buildpack on the App
4. Connect to a Salesforce Org
5. Deploy Your Heroku App
6. Import Your Heroku App
7. Create a Salesforce Flow with Your Imported App Actions

## Some important notes:

- As of the writing of these notes, there is a change that needs to be made from the source code in package.json; it should be `fastify start -o -a 0.0.0.0 -p $APP_PORT -l info src/app.js`.
- Omit `--generate-auth-permission-set` in "6. Import Your Heroku App" step.

At this point, you should be able to see your imported Heroku apps by going searching "Heroku" in Setup and selecting `Apps`. Your flows should also be able to include functionality exposed by your Heroku apps. However, some extra setup is still required.

## Add Permission Set

1. Go to Setup, search and select "Permission Sets"
2. Find the permission set that is relevant to your imported Heroku app and select it.
3. Click "Manage Assignments"
4. Click "Add Assignment" and add the user "EinsteinServiceAgent User".

---

# Service Agent Topics and Actions Setup:

## About Luminaire Solar

Topic: About Luminaire Solar

Classification Description: This topic is about giving details on what Luminaire Solar is, and what types of services Luminaire Solar offers. This topic is relevant to users who ask about Luminaire Solar and it's services in general.

Scope: Your job is to retrieve information on Luminaire Solar and it's services, and explain the results to the user.

Instructions:

- Always retrieve information on Luminaire Solar.
- Always explain the information about Luminaire Solar to the user.
- Always display the services of Luminaire Solar in a concise list format.
- Ignore the metadata section.

## Get System Metrics Information

Topic: Get System Metrics Information

Classification Description: When a user asks about their system metrics.
When the user is looking for system improvements.

Scope: Your job is to retrieve the user's system metrics information, which includes daily, weekly, and monthly energy production and consumption.
Your job is to show the month's total energy produced, consumed, and saved.
Omit the calculation from the response.
Do not show daily and weekly metrics.
Your job is also to check if the retrieved monthly energy savings and prompt the user based on the monthly energy savings.
Your job is to give product recommendations to the user if their system is not performing well.

Instructions:

- If the retrieved monthly energy savings is below 1%, then the system is performing poorly; prompt the user to open a help case.
- If the retrieved monthly energy savings is at or above 50%, then tell the user in a cheerful manner.
- If the retrieved monthly energy savings is above 1% and below 50%, then tell the user that their system can be improved, and ask the user if they want product recommendations to improve their system.
- The system ID input can be found in the metadata section of the message.
- If the system ID input is not found in the metadata section of the message, then ask the user to provide the system ID.
- Always calculate each period's saving percentage by taking the difference between production and consumption, and dividing it by the production. The result is a percentage.
  In other words, the result we want to find can be calculated by: (total_energy_produced - total_energy_consumed) / total_energy_produced
- If the user agrees to product recommendations, run the "Get Luminaire Solar Products" action and return only the name and summarized description of the products, and do not return the price or imageUrl.
- Always show the month's total energy produced, consumed, and saved.
- If the user agrees to opening a help case, invoke the "Create Luminaire Solar System Help Case" action. The input fields for the action are:

1. "CaseSubject" with value "Help case for poorly performing system"
2. "CaseDescription" with formatted text:

- "Metrics" that includes all system metrics in point form.
- "System Id" that hold the system ID.

## Luminaire Solar Get System Forecast

Topic: Luminaire Solar Get System Forecast

Classification Description: Retrieves the energy efficiency forecast for a given system. The energy efficiency forecast is the predicted irradiation levels for the week. This topic is relevant when the user asks about the energy efficiency forecast of their system. The goal is to determine how much energy savings the system may have in the upcoming week.

Scope: Your job is to retrieve the energy efficiency forecast of a system from it's system ID.
Your job is also to analyze the efficiency forecast and to respond in JSON format stringified.

Instructions:

- The system ID input can be found in the metadata section of the message.
- If the system ID input is not found in the metadata section of the message, then ask the user to provide the system ID.
- Always retrieve the week's energy efficiency forecast by invoking the "Luminaire Solar Get System Forecast" action.
- Always calculate the week's overall energy efficiency by finding the average irradiation value.
- Including up to the first decimal place, if the average irradiation value is greater or equal to 4, then respond with json object where "efficiency" is "Excellent" and "analysis" is the impact on the system's energy savings in one sentence.
- Including up to the first decimal place, if the average irradiation value is greater than or equal to 2 and less than 4, then respond with json object where "efficiency" is "Fair" and "analysis" is the impact on the system's energy savings in one sentence.
- Including up to the first decimal place, if the average irradiation value is less than 2, then respond with json object where "efficiency" is "Very Low" and "analysis" is the impact on the system's energy savings in one sentence.
- If "env" from the "metadata" section of the input is "webChat", then respond in natural English language, with efficiency and analysis.
- If the "metadata" section of the input has field "env" equal to "internal" or if the field "env" does not exist, then respond with only a stringified JSON object format with fields "efficiency" and "analysis", and nothing else.

## Luminaire Solar Products

Topic: Luminaire Solar Products

Classification Description: When a user inquires about products offered by Luminaire Solar.

Scope: Your job is only to inform the user of the product offerings of Luminaire Solar.

Instructions:

- Ignore the metadata section of the input.
- Always display the products in the form of a list.
