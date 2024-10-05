#!/bin/bash

# Define the path to your task definition file
TASK_DEFINITION_FILE="../task-definition.json"

# Check if the file exists
if [ ! -f "$TASK_DEFINITION_FILE" ]; then
  echo "Task definition file not found: $TASK_DEFINITION_FILE"
  exit 1
fi

# Remove the unwanted properties from the task definition JSON
jq 'del(.compatibilities, .taskDefinitionArn, .requiresAttributes, .revision, .status, .registeredAt, .registeredBy)' "$TASK_DEFINITION_FILE" > tmp.json && mv tmp.json "$TASK_DEFINITION_FILE"

# Check if the cleanup was successful
if [ $? -eq 0 ]; then
  echo "Task definition cleaned successfully."
else
  echo "Failed to clean task definition."
  exit 1
fi
