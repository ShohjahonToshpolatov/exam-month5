# frontend-angular

Angular 20 standalone frontend for the TOPILDI backend assignment.

## Run

1. Start backend on http://localhost:3000.
2. In this folder run `npm install`.
3. Run `npm start`.
4. Open http://localhost:4200.

The proxy sends `/api` and `/uploads` to the backend.

## Backend routes used
Auth: register, verify, resend-code, login, forgot-password, reset-password, me.
Categories: GET, POST, PUT, DELETE.
Items: GET list, GET detail, GET my, POST create, PATCH update, DELETE, POST report.
Claims: POST item claims, GET item claims, GET my claims, PATCH approve, PATCH reject.
Admin: GET stats.

This project intentionally follows the current Angular standalone file naming: `app.ts`, `login.ts`, `auth-interceptor.ts`, etc.
