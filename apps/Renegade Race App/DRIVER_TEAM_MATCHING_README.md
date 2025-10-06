# Driver-Team Matching System

This document describes the new driver-team matching system that replaces the favorites tab in the Renegade Race App.

## Overview

The driver-team matching system allows:

- **Race Teams** to find drivers interested in renting seats in their cars
- **Drivers** to search for teams and apply to join them
- **Both parties** to connect and form racing partnerships

## Features

### For Teams

- Create team profiles with details about racing specialties, experience level, and available seats
- Set requirements for potential drivers
- Receive and review driver applications
- Accept or decline driver applications
- Manage team information and contact details

### For Drivers

- Create driver profiles showcasing racing experience, licenses, and preferences
- Search for teams based on location, experience level, and specialties
- Apply to join teams with personalized messages
- View team details and requirements
- Contact teams directly

## Database Schema

### New Tables

#### `teams`

- `ownerId`: Team owner's user ID
- `name`: Team name
- `description`: Team description and philosophy
- `logoUrl`: Optional team logo
- `location`: Team location
- `experience`: Experience level (beginner, intermediate, advanced, professional)
- `specialties`: Array of racing specialties (GT3, Formula, Endurance, etc.)
- `availableSeats`: Number of available seats
- `requirements`: Array of driver requirements
- `contactInfo`: Phone, email, website
- `isActive`: Whether the team is currently active

#### `driverProfiles`

- `userId`: Driver's user ID
- `bio`: Driver biography and experience
- `experience`: Experience level
- `licenses`: Array of racing licenses and certifications
- `preferredCategories`: Preferred racing categories
- `availability`: Available time slots
- `location`: Driver location
- `contactInfo`: Phone and email
- `isActive`: Whether the profile is active

#### `teamApplications`

- `teamId`: Team being applied to
- `driverId`: Driver applying
- `status`: Application status (pending, accepted, declined, withdrawn)
- `message`: Driver's application message
- `driverExperience`: Driver's experience description
- `preferredDates`: Preferred racing dates
- `createdAt`, `updatedAt`: Timestamps

### Updated Tables

#### `users`

- Added `userType` field: 'driver', 'team', or 'both'

## API Functions

### Teams

- `create`: Create a new team
- `update`: Update team information
- `deleteTeam`: Delete a team
- `list`: List teams with filters
- `getById`: Get team by ID
- `getByOwner`: Get teams owned by current user

### Driver Profiles

- `create`: Create a new driver profile
- `update`: Update profile information
- `deleteProfile`: Delete a profile
- `list`: List driver profiles with filters
- `getById`: Get profile by ID
- `getByUser`: Get profile for current user

### Team Applications

- `apply`: Apply to join a team
- `updateStatus`: Update application status
- `getByTeam`: Get applications for a team
- `getByDriver`: Get applications by a driver
- `getByStatus`: Get applications by status

## Screens

### Main Matching Screen (`driver-team-matching.tsx`)

- Toggle between "Find Teams" and "Find Drivers" views
- Search and filter functionality
- Display teams/drivers in card format
- Quick apply/contact buttons

### Team Detail Screen (`team-detail.tsx`)

- Comprehensive team information
- Application form for drivers
- Team specialties and requirements
- Contact information

### Driver Detail Screen (`driver-detail.tsx`)

- Driver profile information
- Licenses and certifications
- Preferred categories and availability
- Contact button for teams

### Creation Screens

- `create-team.tsx`: Form for teams to create profiles
- `create-driver-profile.tsx`: Form for drivers to create profiles

## User Experience

### Team Owners

1. Navigate to the "Match" tab
2. Create a team profile with details and requirements
3. Receive driver applications
4. Review and accept/decline applications
5. Connect with accepted drivers

### Drivers

1. Navigate to the "Match" tab
2. Create a driver profile showcasing experience
3. Search for teams based on preferences
4. Apply to teams with personalized messages
5. Wait for team responses and connect

## Navigation

The system replaces the "Favorites" tab with a "Match" tab that provides:

- Easy access to both team and driver search
- Quick creation of profiles
- Seamless navigation between different views
- Integration with existing messaging system

## Future Enhancements

- Real-time notifications for applications
- Advanced matching algorithms
- Rating and review system
- Calendar integration for scheduling
- Payment processing for seat rentals
- Team and driver verification system
