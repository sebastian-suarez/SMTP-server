# 📬 SMTP Server

A small, stateful SMTP server prototype built with **TypeScript + Node.js**.
Great for learning how SMTP command flow works in practice.

## ✨ Features

- Starts a TCP SMTP server on port `2525`
- Sends a `220` greeting when a client connects
- Follows a simple SMTP flow:
  - `HELO`/`EHLO` -> `MAIL FROM` -> `RCPT TO` (one or more) -> `DATA`
- Accepts message body lines until a single `.` line is received
- Supports `QUIT` outside DATA mode
- Returns SMTP-style responses like `250`, `221`, and `503`

## ✅ Requirements

- Node.js 18+

## 🚀 Setup

```bash
npm install
```

## ▶️ Run the Server

```bash
npm start
```

## 🧪 Quick Manual Test

Use `nc` (netcat) to talk directly to the server:

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

## 🛠️ Scripts

- `npm start` - Run the server with `tsx`
- `npm test` - Run Jest tests
- `npm run lint` - Lint with XO
- `npm run format` - Format with Prettier

## 📁 Project Structure

- `src/index.ts` - Server bootstrap
- `tests/index.test.ts` - Tests for SMTP command/state flow

## 📝 Notes

- This project is learning-focused and not production-ready.
- TLS, authentication, queueing, and mailbox delivery are not implemented.
- Import aliases are defined in `package.json#imports`.
