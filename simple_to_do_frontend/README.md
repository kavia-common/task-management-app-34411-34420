# Simple To-Do Frontend

A minimal, modern React app to add, view, and manage tasks. It features a clean single-column layout with a gradient header and persists tasks locally so your list survives page reloads.

## Overview

The app lets you quickly capture tasks with an optional note, toggle completion, edit inline, delete items, and filter the list by All, Active, or Completed. A lightweight mock API wraps localStorage so the UI behaves like it’s talking to a backend while remaining dependency-free.

## Features

- Add tasks with a title and optional notes
- Edit tasks inline with Save and Cancel
- Toggle complete via checkbox
- Delete tasks
- Filter views: All, Active, Completed
- Persistent storage via localStorage through a mock API
- Optimistic UI updates with rollback on error

## Tech Stack

- React 18 (Create React App tooling via react-scripts)
- Mock API with localStorage persistence (no external backend required)
- Vanilla CSS for styling

## Getting Started

A preview is managed automatically by the system when available. Locally, you can use the usual scripts:

- npm start or yarn start: Runs the app in development mode and opens http://localhost:3000.
- npm test or yarn test: Launches the test runner.
- npm run build or yarn build: Builds the app for production to the build folder.

Note: In the hosted environment, a preview is auto-started; you typically do not need to run start manually.

## Usage

1. Enter a task title (required) and optional notes, then click Add Task.
2. Use the filter buttons to switch between All, Active, and Completed.
3. Click Edit on a task to update the title or notes and Save or Cancel your changes.
4. Toggle the checkbox to mark a task complete or incomplete.
5. Click Delete to remove a task.

## Mock API and Persistence

The app uses a small mock API that mimics network behavior and persists to localStorage:
- Storage key: todo.tasks.v1
- Artificial delay: approximately 220 ms to simulate real requests
- Endpoints exposed by mockApi:
  - list(): returns all tasks
  - create(data): adds a new task after validation
  - update(id, patch): updates partial fields with validation for title
  - remove(id): deletes a task
- Validation: Title is required and trimmed; notes are trimmed.
- Implementation: see src/api/mockApi.js

This structure allows the UI to optimistically update and then commit or roll back based on the mock API response. It is intended to be swapped out later for real network calls.

## Project Structure

- src/App.js: App state, filtering logic, and handlers for add, edit, toggle, and delete.
- src/api/mockApi.js: In-memory API with localStorage persistence and a small artificial delay.
- src/components/
  - TodoInput.js: Form for adding new tasks (title required, notes optional).
  - TodoList.js: Renders the list and delegates to TodoItem.
  - TodoItem.js: Each task row with inline edit, toggle, and delete actions.
  - TodoHeader.js: Presentational header placeholder (header is rendered in App).
- src/App.css and src/index.css: Styling, theme tokens, layout, and components.

## Styling (Ocean Professional theme)

The UI follows the Ocean Professional palette and a modern, minimal aesthetic with rounded corners and subtle shadows. Key tokens are defined in src/App.css:
- Primary: #2563EB
- Secondary: #F59E0B
- Background: #f9fafb
- Surface: #ffffff
- Text: #111827

Design notes:
- Subtle box-shadows and rounded corners on cards and buttons
- Smooth focus rings on interactive elements
- Gradient header using a light blue-to-gray blend for depth
- Minimal borders and generous spacing for readability

## Testing

Basic tests are included in src/App.test.js:
- Adds a task and asserts it appears optimistically
- Asserts presence and interaction of filter buttons
- Verifies inline edit exposes Save and Cancel actions

Run tests with npm test or yarn test.

## Future Work

- Replace the mock API with a real backend integration
- Add user accounts and multi-device sync
- Add due dates, reminders, and sorting
- Enhance accessibility and keyboard shortcuts

## License

This project is provided as part of the task-management-app-34411-34420 workspace for demonstration and educational purposes.
