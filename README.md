# Renegade Monorepo

A comprehensive race track vehicle rental platform built with React and Convex.

## 🏗️ Architecture

This monorepo contains:

- **Web App** (`apps/renegade-web-app/`) - React/Vite public-facing web application
- **Admin App** (`apps/renegade-admin-app/`) - React/Vite administrative interface
- **Shared Convex Backend** (`packages/backend/convex/`) - Centralized database and API functions

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+

### Installation

```bash
# Install all dependencies
pnpm install

# Start Convex backend
pnpm convex:dev

# Start all apps in development mode
pnpm dev

# Or start individual apps:
pnpm web:dev       # Web app
pnpm admin:dev     # Admin app
```

## 📱 Apps

### Web App (React/Vite)

- **Location**: `apps/renegade-web-app/`
- **Tech Stack**: React, Vite, TypeScript, Tailwind CSS
- **Features**: Public vehicle listings, booking interface

### Admin App (React/Vite)

- **Location**: `apps/renegade-admin-app/`
- **Tech Stack**: React, Vite, TypeScript, Tailwind CSS
- **Features**: Vehicle management, user management, analytics

## 🗄️ Shared Backend (Convex)

- **Location**: `packages/backend/convex/`
- **Tech Stack**: Convex, TypeScript
- **Features**: Real-time database, authentication, payments, messaging

## 🛠️ Development

### Available Scripts

```bash
# Development
pnpm dev                    # Start all apps
pnpm web:dev               # Start web app only
pnpm admin:dev             # Start admin app only
pnpm convex:dev            # Start Convex backend

# Building
pnpm build                 # Build all apps
pnpm web:build            # Build web app
pnpm admin:build          # Build admin app

# Code Quality
pnpm lint                 # Lint all apps
pnpm lint:fix            # Fix linting issues
pnpm type-check          # Type check all apps

# Convex
pnpm convex:dev          # Start Convex development
pnpm convex:deploy       # Deploy Convex functions
```

### Environment Setup

Each app manages its own environment variables:

**Web & Admin Apps (Vite):**

- `VITE_CONVEX_URL` - Convex deployment URL
- `VITE_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key

**Backend (Convex):**

- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `CLERK_SECRET_KEY` - Clerk secret key
- `CLERK_FRONTEND_API_URL` - Clerk frontend API URL

Set these variables in your `.env.local` file or deployment environment.

### Code Style

- **ESLint**: Configured for TypeScript and React
- **Prettier**: Consistent code formatting
- **TypeScript**: Strict mode enabled

## 📦 Package Management

This monorepo uses pnpm workspaces:

- **Root**: Contains shared dev dependencies and workspace scripts
- **Apps**: Individual applications with their own dependencies
- **Packages**: Shared code (currently just Convex backend)

## 🔧 Configuration Files

- `pnpm-workspace.yaml` - Workspace configuration
- `eslint.config.js` - Shared ESLint configuration
- `.prettierrc` - Prettier formatting rules
- `tsconfig.json` - Shared TypeScript configuration
- `.gitignore` - Git ignore patterns

## 🚀 Deployment

### Convex Backend

```bash
pnpm convex:deploy
```

### Mobile App

```bash
cd "apps/Renegade Race App"
eas build --platform all
```

### Web Apps

```bash
pnpm web:build
pnpm admin:build
# Deploy dist/ folders to your hosting platform
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run `pnpm lint` and `pnpm type-check`
4. Test your changes across all apps
5. Submit a pull request

## 📄 License

ISC License - see LICENSE file for details

# Renegade-Race-Rentals
# Renegade-Race-Rentals
