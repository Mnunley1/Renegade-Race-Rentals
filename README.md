# Renegade Monorepo

A comprehensive race track vehicle rental platform built with React Native, React, and Convex.

## 🏗️ Architecture

This monorepo contains:

- **Mobile App** (`apps/Renegade Race App/`) - React Native/Expo app for end users
- **Web App** (`apps/Renegade-Race-Web-App/`) - React/Vite public-facing web application  
- **Admin App** (`apps/Renegade-Rentals-Admin-App/`) - React/Vite administrative interface
- **Shared Convex Backend** (`packages/convex/`) - Centralized database and API functions

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- iOS Simulator (for mobile development)
- Android Studio (for mobile development)

### Installation

```bash
# Install all dependencies
pnpm install

# Start Convex backend
pnpm convex:dev

# Start all apps in development mode
pnpm dev

# Or start individual apps:
pnpm mobile:dev    # Mobile app
pnpm web:dev       # Web app  
pnpm admin:dev     # Admin app
```

## 📱 Apps

### Mobile App (React Native/Expo)
- **Location**: `apps/Renegade Race App/`
- **Tech Stack**: React Native, Expo, TypeScript
- **Features**: Vehicle browsing, reservations, messaging, driver-team matching

### Web App (React/Vite)
- **Location**: `apps/Renegade-Race-Web-App/`
- **Tech Stack**: React, Vite, TypeScript, Tailwind CSS
- **Features**: Public vehicle listings, booking interface

### Admin App (React/Vite)
- **Location**: `apps/Renegade-Rentals-Admin-App/`
- **Tech Stack**: React, Vite, TypeScript, Tailwind CSS
- **Features**: Vehicle management, user management, analytics

## 🗄️ Shared Backend (Convex)

- **Location**: `packages/convex/`
- **Tech Stack**: Convex, TypeScript
- **Features**: Real-time database, authentication, payments, messaging

## 🛠️ Development

### Available Scripts

```bash
# Development
pnpm dev                    # Start all apps
pnpm mobile:dev            # Start mobile app only
pnpm web:dev               # Start web app only
pnpm admin:dev             # Start admin app only
pnpm convex:dev            # Start Convex backend

# Building
pnpm build                 # Build all apps
pnpm mobile:build         # Build mobile app
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

1. Copy `env.example` to `.env` in the root directory
2. Fill in your environment variables:
   - Convex deployment URL
   - Clerk authentication keys
   - Stripe payment keys

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
