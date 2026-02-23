# SMTP Server

Minimal stateful SMTP server prototype built with TypeScript and Node.js.

## Features

- Starts a TCP SMTP server on port `2525`
- Sends a `220` greeting when a client connects
- Implements a simple command flow:
  - `HELO`/`EHLO` -> `MAIL FROM` -> `RCPT TO` (one or more) -> `DATA`
- Accepts email body lines until a single `.` line is received
- Supports `QUIT` outside DATA mode
- Returns SMTP-style responses (`250`, `221`, `503`)

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
Hello from local SMTP test
.
QUIT
```

## Scripts

- `npm start` - Run the server with `tsx`
- `npm test` - Run Jest
- `npm run lint` - Lint with XO
- `npm run format` - Format with Prettier

## Project Structure

- `src/index.ts` - Server bootstrap
- `tests/index.test.ts` - Jest tests for SMTP command/state flow

## Notes

- This is a learning-focused project and not production-ready.
- No TLS, authentication, message queueing, or mailbox delivery is implemented.
- Import aliases are defined in `package.json#imports`.
