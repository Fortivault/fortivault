# AGENTS.md

This document provides instructions and guidelines for agents working on the BIGGEST-FARGO-STUNTS project.

## Tech Stack

- **Framework:** Next.js
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn UI, Radix UI
- **Error Monitoring:** Sentry
- **Database:** Supabase
- **Package Manager:** pnpm

## Project Structure

- `app/`: Contains the application's routes and pages.
- `components/`: Contains reusable React components.
- `hooks/`: Contains custom React hooks.
- `lib/`: Contains utility functions and libraries.
- `public/`: Contains static assets.
- `scripts/`: Contains scripts for various tasks.
- `styles/`: Contains global styles.
- `tests/`: Contains tests.

## Getting Started

1.  **Install dependencies:**
    ```bash
    pnpm install
    ```
2.  **Run the development server:**
    ```bash
    pnpm run dev
    ```

## Testing

- **Integration tests:**
  ```bash
  pnpm test:integration
  ```
- **Linting:**
  ```bash
  pnpm lint
  ```
