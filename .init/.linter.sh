#!/bin/bash
cd /home/kavia/workspace/code-generation/task-management-app-34411-34420/simple_to_do_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

