# Track Car Rental App

A comprehensive React Native (Expo Router) app for renting track cars, built with Convex backend and Clerk authentication.

## 🚀 Features

### Core Functionality

- **Vehicle Listings**: Browse and search track cars
- **User Authentication**: Secure login/signup with Clerk
- **Favorites**: Save and manage favorite vehicles
- **User Profiles**: Complete user profile management

### 🗓️ **Reservation & Availability Management System**

#### For Renters:

- **Enhanced Car Detail Page**:
  - Interactive calendar for date selection
  - Real-time availability checking
  - Booking modal with price calculation
  - Message to owner functionality
- **My Bookings Screen**:
  - View all booking history
  - Filter by status (pending, confirmed, completed, cancelled)
  - Cancel bookings with reason
  - Contact owners

#### For Vehicle Owners:

- **Vehicle Availability Management**:
  - Calendar interface to block/unblock dates
  - Bulk date range operations
  - Set availability reasons
  - Visual indicators for different date states
- **Booking Requests Screen**:
  - View incoming booking requests
  - Approve/decline with optional messages
  - See renter details and booking information

#### Real-time Features:

- **Live Availability Updates**: Calendar reflects real-time changes
- **Instant Booking Status**: Real-time reservation status updates
- **Toast Notifications**: Success/error feedback for all actions
- **Error Handling**: Comprehensive error management

### 💬 **Messaging System**

#### Conversation Management:

- **Real-time Messaging**: Instant message delivery between renters and owners
- **Conversation List**: View all active conversations with unread message counts
- **Message Deletion**: Users can delete individual messages they sent
- **Conversation Deletion**: Users can delete entire conversations and all associated messages
- **Message Status**: Read/unread status tracking
- **System Messages**: Support for system-generated messages

#### User Experience:

- **Intuitive Interface**: Clean chat interface with message bubbles
- **Long Press to Delete**: Long press on messages to delete them
- **Options Menu**: Access conversation options via header menu
- **Confirmation Dialogs**: Safe deletion with confirmation prompts
- **Visual Feedback**: Toast notifications for all actions

## 🏗️ Architecture

### Frontend (React Native + Expo Router)

- **Navigation**: Tab-based navigation with modal screens
- **State Management**: Convex real-time queries and mutations
- **UI Components**: Custom components with consistent design system
- **Hooks**: Custom hooks for data management (`useReservations`, `useAvailability`)

### Backend (Convex)

- **Database Schema**:

  - `users`: User profiles and authentication
  - `tracks`: Track locations and information
  - `vehicles`: Vehicle listings with details
  - `vehicleImages`: Image management for vehicles
  - `availability`: Date-based availability management
  - `reservations`: Complete booking workflow
  - `favorites`: User favorite vehicles
  - `conversations`: Chat conversations between users
  - `messages`: Individual messages within conversations

- **Backend Functions**:
  - **Vehicles**: CRUD operations, image management, queries
  - **Availability**: Block/unblock dates, check availability, calendar data
  - **Reservations**: Create, approve, decline, cancel, complete, queries
  - **Users**: Profile management and authentication
  - **Conversations**: Create, archive, delete conversations
  - **Messages**: Send, delete, mark as read, queries

### Authentication (Clerk)

- Secure user authentication
- Profile management
- Session handling

## 📱 Screens

### Main Navigation

- **Explore**: Browse vehicles
- **Favorites**: Saved vehicles
- **List Car**: Add new vehicle (coming soon)
- **Messages**: In-app messaging (coming soon)
- **Profile**: User profile and settings

### Booking Management

- **Car Detail**: Enhanced with booking functionality
- **My Bookings**: Renter's booking history
- **Booking Requests**: Owner's incoming requests
- **Vehicle Availability**: Owner's calendar management

### Other Screens

- **Help Center**: Support and FAQ
- **Edit Profile**: Profile customization

## 🎨 Design System

- **Primary Color**: Coral (#FF5A5F)
- **Secondary Color**: Gray (#6b7280)
- **Typography**: Consistent font weights and sizes
- **Components**: Reusable UI components with consistent styling
- **Icons**: Lucide React Native icons

## 🚀 Getting Started

1. **Install Dependencies**:

   ```bash
   npm install
   ```

2. **Environment Setup**:

   - Configure Clerk authentication
   - Set up Convex backend
   - Add environment variables

3. **Run the App**:
   ```bash
   npx expo start
   ```

## 📋 Booking Workflow

1. **Renter selects vehicle** → Views enhanced car detail page
2. **Selects dates** → Calendar shows real-time availability
3. **Submits booking request** → Owner receives notification
4. **Owner reviews request** → Approves/declines with optional message
5. **Renter receives update** → Can view status in My Bookings
6. **Booking completion** → Both parties can mark as completed

## 🔧 Technical Highlights

- **Type Safety**: Full TypeScript implementation
- **Real-time Updates**: Convex real-time queries for live data
- **Error Handling**: Comprehensive error management with user feedback
- **Performance**: Optimized queries and efficient data loading
- **UX**: Smooth animations and intuitive user flows
- **Accessibility**: Proper accessibility labels and navigation

## 🎯 Next Steps

- Push notifications for booking updates
- In-app messaging system
- Payment integration
- Vehicle management for owners
- Advanced search and filtering
- Review and rating system

---

Built with ❤️ using React Native, Expo Router, Convex, and Clerk
