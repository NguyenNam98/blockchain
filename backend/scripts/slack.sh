#!/bin/bash

SLACK_WEBHOOK_URL="$1"
SERVICE_NAME="$2"
ENVIRONMENT="$3"
STATUS="$4"

echo "Status: $STATUS"

if [ "$STATUS" = "success" ]; then
    MESSAGE=":tada: *Build Success* :tada:"
else
    MESSAGE=":boom: *Build Failure* :boom: <!here>"
fi

curl -X POST -H 'Content-type: application/json' --data '{
    "blocks": [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": " Git action build: '" ${MESSAGE}"'"
            },
            "fields": [
                {
                    "type": "mrkdwn",
                    "text": "*Service Name:*'" ${SERVICE_NAME}"'\n"
                },
                {
                    "type": "mrkdwn",
                    "text": "*Environment:*'" ${ENVIRONMENT}"'\n"
                }
            ]
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "*Error Message:* check git action"
            }
        }
    ]
}' "${SLACK_WEBHOOK_URL}"
