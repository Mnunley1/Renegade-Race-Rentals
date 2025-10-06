# Vehicle Detail Pages

This document explains the implementation of vehicle detail pages in the Renegade Race Web App.

## Overview

The vehicle detail pages provide comprehensive information about individual vehicles available for track rental, including specifications, images, features, location details, and owner information.

## Implementation

### File Structure

```
src/
├── pages/
│   ├── VehicleDetailPage.tsx   # Vehicle detail page component
│   ├── ExplorePage.tsx         # Browse vehicles page
│   └── ...
├── components/
│   └── vehicle/
│       └── car-card.tsx       # Vehicle card component
└── App.tsx                    # Main router configuration
```

### Key Features

#### 1. Dynamic Routing

- Uses React Router dynamic routes: `/vehicles/:id`
- Automatically handles vehicle URLs like `/vehicles/abc123`
- Fetches vehicle data using the vehicle ID from URL parameters

#### 2. Comprehensive Vehicle Information

- **Image Gallery**: Multiple vehicle photos with thumbnail navigation
- **Specifications Tab**: Performance specs, drivetrain, transmission, fuel type
- **Features Tab**: Amenities, available add-ons, and special equipment
- **Location Tab**: Track information and location details
- **Reviews Tab**: Future reviews and ratings from renters

#### 3. Interactive Features

- **Favorites**: Users can add/remove vehicles from their favorites
- **Booking**: Direct booking functionality with authentication checks
- **Owner Contact**: Messaging system to contact vehicle owners
- **Image Navigation**: Click thumbnails to view different vehicle photos

#### 4. Owner & Safety Information

- **Owner Profile**: Host information including ratings and rental history
- **Safety Features**: Verified status, insurance coverage, assistance info
- **Trust Indicators**: Community ratings and verification badges

### Data Flow

1. **Vehicle Data**: Fetched from Convex database using `api.vehicles.getById`
2. **Related Data**: Includes owner and track information via joins
3. **Authentication**: Uses Clerk for user authentication and authorizations
4. **Favorites**: Real-time favorite status with optimistic updates

### Database Schema Integration

The detail page utilizes the following database tables:

- `vehicles`: Main vehicle information and specifications
- `users`: Owner/host information and ratings
- `tracks`: Track location and venue details
- `favorites`: User favorite vehicles relationship

### Authentication & Security

- **Public Access**: Vehicle details are viewable without authentication
- **Protected Actions**: Booking, favorites, and owner contact require user authentication
- **Guest Experience**: Non-logged-in users see clear call-to-action prompts to sign in
- **Smart UI**: Button text adapts based on authentication state ("Book This Car" vs "Sign In to Book")
- Real-time user state management with authentication guards

### Guest User Experience

- **Full Access**: View all vehicle details, specifications, images, and owner information
- **Call-to-Action Banner**: Eye-catching sign-up prompt at the top of the page
- **Contextual Buttons**: Clear indication of what requires sign-in (booking, favorites, contact)
- **Relevant Links**: Direct links to sign-up and sign-in pages
- **No Barriers**: No pop-up modals or blocked content for browsing

### Responsive Design

- Mobile-first responsive layout
- Optimized for all screen sizes
- Touch-friendly image navigation
- Accessible UI components

## Usage Examples

### Basic Vehicle Detail URL

```
/vehicles/abc123def456
```

### Integration with Browse Pages

The "View Details" buttons across all pages automatically link to detail pages without authentication:

```tsx
<Button asChild>
  <Link to={`/vehicles/${vehicle._id}`}>View Details</Link>
</Button>
```

**Important**: All "View Details" buttons now work as public links - no authentication required for viewing vehicle information.

### Programmatic Navigation

```tsx
import { useNavigate } from "react-router-dom";

const navigate = useNavigate();
navigate(`/vehicles/${vehicleId}`);
```

## Testing

### Seed Data

Run the seed mutations to populate test data:

```tsx
const seedVehicles = useMutation(api.seed.seedVehicles);
const seedUsers = useMutation(api.seed.seedTestUsers);
```

### Sample Vehicles

The seed creates three test vehicles:

1. **2023 Porsche 911 GT3** - Laguna Seca
2. **2022 McLaren 720S** - Willow Springs
3. **2024 Ferrari 488 GTB** - Sonoma Raceway

## Future Enhancements

- **Calendar Integration**: Availability calendar for booking dates
- **Real-time Reviews**: User reviews and ratings system
- **Advanced Filtering**: Date-based availability search
- **Messaging**: In-app communication with vehicle owners
- **Payment Integration**: Stripe/PayPal booking payments
- **Mobile App**: React Native companion app

## Troubleshooting

### Common Issues

1. **Vehicle Not Found**: Ensure vehicle ID exists in database
2. **Authentication Errors**: Check Clerk configuration and user state
3. **Image Loading**: Verify image URLs are accessible and HTTPS
4. **Database Connection**: Confirm Convex deployment and API access

### Development Tips

- Use Convex DevTools for database debugging
- Check browser developer tools for authentication state
- Verify image URLs in network tab for loading issues
- Test responsive design with different screen sizes
