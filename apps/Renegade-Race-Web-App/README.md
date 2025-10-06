# 🏁 Renegade Race - Track Vehicle Rental Platform

A comprehensive web application connecting racing enthusiasts with high-performance vehicle owners for track day rentals. Built with modern technologies to provide a seamless experience for browsing, booking, and managing vehicle rentals.

![React](https://img.shields.io/badge/React-18.3.1-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6.2-blue?style=flat-square&logo=typescript)
![Convex](https://img.shields.io/badge/Convex-Backend-green?style=flat-square)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4.15-blue?style=Flat-square&logo=tailwindcss)
![Vite](https://img.shields.io/badge/Vite-5.4.10-purple?style=flat-square&logo=vite)

## 🌟 Features

### 🚗 Vehicle Management

- **Browse Vehicles**: Discover high-performance cars with detailed specifications
- **Vehicle Listings**: Comprehensive listings with images, specs, and pricing
- **Advanced Search**: Filter by make, model, year, route location, and price range
- **Detailed Views**: Interactive vehicle detail pages with image galleries
- **Favorites System**: Save and manage favorite vehicles

### 📅 Booking System

- **Instant Booking**: Streamlined reservation process
- **Pricing Calculator**: Automatic rate calculation with add-ons
- **Availability Calendar**: Real-time vehicle availability
- **Booking Management**: Track reservations and rental history

### 👥 User Experience

- **Guest Browsing**: Full vehicle exploration without sign-up required
- **User Profiles**: Comprehensive driver profiles with ratings
- **Authentication**: Secure login with Clerk integration
- **Dashboard**: Personalized user destination with key insights

### 💬 Communication

- **Owner Messaging**: Direct communication with vehicle owners
- **Team Matching**: Find and apply to racing teams
- **Community Features**: Connect with fellow racing enthusiasts

### 🎯 Additional Features

- **Multi-track Support**: Rent vehicles from various racing tracks
- **Owner Verification**: Verified and trusted vehicle owners
- **Mobile Responsive**: Optimized for all device sizes
- **Real-time Updates**: Live data synchronization with Convex

## 🚀 Tech Stack

### Frontend

- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe JavaScript development
- **Vite** - Fast build tool and development server
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Lucide React** - Beautiful icon library

### Backend & Database

- **Convex** - Real-time database and backend-as-a-service
- **Real-time Sync** - Live data updates across clients

### Authentication

- **Clerk** - User authentication and management
- **SSO Support** - Single sign-on capabilities

### State Management

- **Zustand** - Lightweight state management
- **React Hook Form** - Form state management
- **Zod** - Schema validation

### Development Tools

- **ESLint** - Code linting and formatting
- **PostCSS** - CSS processing
- **Class Variance Authority** - Component variants
- **Vercel** - Deployment and hosting

## 📦 Installation

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager
- Clerk account for authentication
- Convex account for backend services

### Environment Setup

1. **Clone the repository**

```bash
git clone <repository-url>
cd Renegade-Race-Web-App
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:

```env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key_here

# Convex Backend
VITE_CONVEX_URL=https://your-convex-deployment-url.convex.cloud
```

4. **Set up Convex backend**

```bash
npx convex dev
```

5. **Start development server**

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Basic UI components (Button, Card, etc.)
│   ├── layout/          # Layout components (Header, Footer)
│   ├── providers/       # Context providers
│   └── vehicle/         # Vehicle-specific components
├── pages/               # Route components
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
└── assets/              # Static assets

convex/
├── schema.ts            # Database schema definition
├── vehicles.ts          # Vehicle-related queries/mutations
├── bookings.ts          # Booking system logic
├── users.ts             # User management
├── conversations.ts    # Messaging system
└── teams.ts             # Team matching features
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌐 Deployment

The application is configured for deployment on Vercel:

1. **Build the project**

```bash
npm run build
```

2. **Deploy to Vercel**

```bash
vercel deploy
```

The `vercel.json` configuration ensures proper routing for the single-page application.

## 🔐 Environment Variables

| Variable                     | Description                     | Required |
| ---------------------------- | ------------------------------- | -------- |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk authentication public key | Yes      |
| `VITE_CONVEX_URL`            | Convex backend deployment URL   | Yes      |

## 📱 Key Routes

- `/` - Home page with featured vehicles
- `/explore` - Browse all available vehicles
- `/vehicles/:id` - Vehicle detail page
- `/dashboard` - User dashboard
- `/favorites` - User's favorite vehicles
- `/list-vehicle` - Vehicle listing for owners
- `/match` - Team matching system
- `/messages` - User messaging
- `/profile` - User profile management
- `/rental-history` - Booking history
- `/billing` - Payment and subscription
- `/settings` - User preferences

## 🎨 Design System

The application uses a consistent design system with:

- **Primary Color**: `#EF1C25` (Renegade Red)
- **Component Variants**: Using Class Variance Authority (CVA)
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Accessibility**: ARIA compliant with Radix UI primitives
- **Typography**: Consistent font scaling and spacing

## 🤝 Contributing

1. Follow the established code style and patterns defined in `.cursorrules`
2. Ensure TypeScript types are properly defined
3. Use existing component patterns and utilities from `src/components/ui/`
4. Test all changes thoroughly
5. Follow the Convex schema patterns for database operations

## 📄 License

This project is private and proprietary. All rights reserved.

## 🎯 Future Enhancements

- [ ] Mobile application (React Native)
- [ ] Advanced analytics and reporting
- [ ] Multi-language support
- [ ] Advanced payment processing
- [ ] Vehicle inspection scheduling
- [ ] Racing event integration
- [ ] Insurance management system
- [ ] Advanced team collaboration tools
- [ ] Real-time notifications
- [ ] Advanced search filters
- [ ] Vehicle comparison tool
- [ ] Integration with racing event calendars

## 🛠️ Development Notes

- The application supports both authenticated and guest users
- Database schema is defined in `convex/schema.ts` with proper indexing
- Authentication is handled via Clerk with SSO callback support
- UI components follow compound component patterns
- Forms use React Hook Form with Zod validation
- State management uses Zustand for global state and local state otherwise

---

**Built with ❤️ for the racing community**

For support or questions, contact the development team.
