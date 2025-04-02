# Create web service app for staging
heroku create demo-luminaire-ui-staging --team luminaire-inc

# Configure its environment
heroku config:set API_URL=$(heroku info -a demo-luminaire-api --json | jq -r '.app.web_url' | sed 's:/*$::') VITE_AI_TYPE=heroku-ai

# Deploy the app and run it
git push heroku main

# Create web service app for production
heroku create demo-luminaire-ui-prod --team luminaire-inc --no-remote

# Configure its environment
heroku config:set API_URL=$(heroku info -a demo-luminaire-api --json | jq -r '.app.web_url' | sed 's:/*$::') VITE_AI_TYPE=heroku-ai
