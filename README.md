# SMTP Server

A basic SMTP server implementation in TypeScript for Node.js.

## Current Behavior

- Starts a TCP SMTP server on port `2525`
- Sends `220` greeting on connection
- Supports a basic command flow: `HELO`/`EHLO` -> `MAIL FROM` -> `RCPT TO` -> `DATA`
- Returns simple SMTP responses (`250`, `354`, `221`)

## Requirements

- Node.js 18+

## Setup

```bash
npm install
```

## Run

```bash
npm start
```

## Quick Manual Test

```bash
nc localhost 2525
HELO localhost
MAIL FROM:<from@example.com>
RCPT TO:<to@example.com>
DATA
```

## Scripts

- `npm start` - Run the server with `tsx`
- `npm test` - Run Jest
- `npm run lint` - Lint with XO
- `npm run format` - Format with Prettier

## Project Structure

- `src/index.ts` - Server bootstrap
- `src/modules/state.ts` - SMTP connection state handler

## Notes

- This is a work in progress and not production-ready.
- Import aliases are defined in `package.json#imports`.
