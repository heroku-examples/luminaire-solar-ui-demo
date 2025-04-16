# Agentforce Chat Setup

The broad steps for full authenticated user Agentforce integration includes:

1. [Configure a Custom Client Deployment for Messaging for In-App and Web](https://help.salesforce.com/s/articleView?id=service.miaw_deployment_custom.htm&type=5)
2. Copy over the chat component under @/components/ui/Chat
3. Set up user authentication
   An outline of the steps is given below.

## Configuring and Deploying a Custom Client Deployment for Messaging for In-App and Web.

### 1. Enable and Configure Omni-Channel by:

1. From `Setup`, enter and select `Omni-Channel Settings` in the Quick Find box
2. Enable **Omni-Channel** and save
3. Enter and select `Service Channels` in the Quick Find box
4. Click **New** and ensure `Salesforce Object` has **Messaging Session**
5. Enter and select `Routing Configurations` in the Quick Find box
6. Click **New** and enter routing settings (e.g. **Routing Priority**: 1, **Routing Model**: Least Active, **Units of Capacity**: 5, **Capacity Type**: Inherited); we will call this **Agentforce Queue Routing**
7. From `Setup`, enter and select `Queues` in the Quick Find box
8. Click **New** and enter required fields; we will call this **Agentforce Messaging Queue**
9. Under `Routing Configuration` select the previously created **Agentforce Queue Routing**
10. Under `Supported Objects`, add **Messaging Session**
11. Under `Queue Members` add **EinsteinServiceAgent User** and save

### 2. Create a Service Channel by:

1. From `Setup`, enter and select **Service Channels** in the Quick Find box
2. Click **New** and ensure `Salesforce Object` has **Messaging Session**; we will call this **LiveMessage**

### 3. Create an Omni-Channel Flow by:

1. From `Setup`, enter and select **Flows** in the Quick Find box
2. Click **New**, and select under template **Omni-Channel Flow** with option **Route to Service Agent**
3. Set `Service Channel` to the previously created **LiveMessage**
4. Ensure `Route To` is set to **Agentforce Service Agent**
5. Set `Fallback Queue` by choosing **Select Queue** and selected the previously created **Agentforce Messaging Queue** (from step 1)
6. Save and activate the flow

### 4. Create Messaging Channel by:

1. From `Setup`, enter and select **Messaging Settings** in the Quick Find box
2. Click **New** and select **Messaging for In-App and Web**; we will call it **Agentforce Messaging**
3. Ensure `Type` is **Embedded Messaging**
4. Under `Omni-Channel Routing`, set `Routing Type` to **OmniFlow**, `Flow Definition` to **Route Conversations to Agentforce Service Agents**, and `Fallback Queue` to **Agentforce Messaging Queue**
5. Optionally, under `Automated Responses`, create customized messages for various events
6. Save and activate; ensure that the channel button says **Active**

### 5. Deploy by:

1. From `Setup` enter and select **Embedded Service Deployments**
2. Click **New Deployment**, select **Messaging for In-App and Web**, choose **Custom Client**, and set `Messaging Channel` to previously created **Agentforce Messaging** (from step 4); we will call this **Agentforce Messaging Deployment**
3. Optionally enable and configure pre-chat, and also jot down the fields from `Code Snippet`
4. Set to active, and publish the deployment; this takes a few minutes

## Copy over the chat component

1. Navigate to `@/components/ui/Chat`, and copy the whole component over to your project
2. Under the chat component's `config.js` file, set the `organizationId`, `developerName`, and `url` to the previously saved values from `Code Snippet` (step 5)

## Set up user authentication

### 1. Create your own pair of public private keys

1. If you already have a set of certificates, skip this step. For testing purposes, [create a certificate](https://github.com/Salesforce-Async-Messaging/key-command-line-utility/blob/master/CreatingCertificates.md).
2. If you already have a method of generating a JWK and JWT, skip this step Otherwise, [generate a JWK and JWT](https://github.com/Salesforce-Async-Messaging/key-command-line-utility)
3. Make sure to set the `issuer` to `luminaire` to match the API code.

### 2. Add JWK and JWKS to Salesforce

1. From `Setup`, enter and select **Messaging for In-App and Web User Verification**
2. Click **New Key** and upload your JWK
3. Click **New Keyset**, select `Type` of **Keys**, and select the previously uploaded JWK as the key to attach
4. Make sure to set the JSON Web Key Issuer as `luminaire`

### 3. Enable User Verification

1. From `Setup`, enter and select **Messaging Settings**
2. On the column of your created channel (we previously named this **Agentforce Messaging**), click edit from the dropdown arrow on the right side
3. Under `User Verification`, check **Add User Verification**
