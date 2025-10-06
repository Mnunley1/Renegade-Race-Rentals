# Vehicle Booking Implementation with Stripe Integration

This document describes the vehicle booking functionality implemented for the Renegade Race Web App, including full Stripe payment integration using the existing Convex backend functions.

## Overview

The booking system allows users to:

- View vehicle details and availability
- Select dates for rental
- Choose add-ons
- Send messages to hosts
- Complete secure payment processing with Stripe
- Receive booking confirmations

## Stripe Integration

### Payment Flow

1. User completes booking form and clicks "Continue to Payment"
2. PaymentModal opens with Stripe Elements for card input
3. Convex `createPaymentIntent` action creates Stripe Payment Intent
4. User enters card details using Stripe Elements
5. Stripe processes payment securely
6. Convex `confirmPayment` action confirms payment and updates reservation status
7. User is redirected to success page

### Security Features

- **PCI Compliance**: Card details never touch your servers
- **Secure Processing**: All payments processed by Stripe
- **Platform Fees**: Automatic calculation and distribution
- **Webhook Support**: Real-time payment status updates

## Implementation Details

### Components Created

#### 1. Hooks (`src/hooks/`)

- **`useReservations.ts`** - Manages reservation CRUD operations
- **`usePayments.ts`** - Handles payment processing with Stripe via Convex actions
- **`useAvailability.ts`** - Manages vehicle availability and calendar data

#### 2. UI Components (`src/components/`)

- **`BookingModal.tsx`** - Date selection, add-ons, and booking summary
- **`PaymentModal.tsx`** - Stripe Elements payment processing interface
- **`StripeProvider.tsx`** - Stripe Elements provider wrapper
- **`toast.tsx`** - Toast notification system for user feedback

#### 3. Pages (`src/pages/`)

- **`BookingSuccessPage.tsx`** - Confirmation page after successful booking
- **Updated `VehicleDetailPage.tsx`** - Integrated booking and payment functionality

#### 4. Configuration (`src/lib/`)

- **`stripe.ts`** - Stripe configuration and environment variables

### Key Features

#### Booking Flow

1. User clicks "Book Vehicle" button on vehicle detail page
2. Booking modal opens with calendar for date selection
3. User selects dates and optional add-ons
4. System calculates total cost including add-ons
5. User adds optional message to host
6. Reservation is created in Convex database
7. Payment modal opens with Stripe Elements
8. User enters card details securely
9. Payment is processed through Stripe
10. After successful payment, user is redirected to success page

#### Integration Points

- **Convex Backend**: Uses existing reservation and payment functions
- **Stripe API**: Secure payment processing with Elements
- **Clerk Authentication**: Ensures only authenticated users can book
- **Toast Notifications**: Provides user feedback throughout the process

### Data Flow

```
VehicleDetailPage → BookingModal → PaymentModal → BookingSuccessPage
       ↓                ↓              ↓              ↓
   Convex API      Reservation    Stripe API      Success UI
       ↓                ↓              ↓
   Database        Payment Intent  Confirmation
```

### Stripe Configuration

#### Environment Variables

Create a `.env.local` file in the web app root:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
VITE_CONVEX_URL=your_convex_url_here
```

#### Convex Functions Used

- `stripe:createPaymentIntent` - Creates Stripe Payment Intent
- `stripe:confirmPayment` - Confirms payment and updates reservation
- `stripe:calculatePlatformFee` - Calculates platform fees
- `stripe:createPaymentRecord` - Creates payment record in database

### Error Handling

- Toast notifications for booking failures
- Stripe error messages for payment issues
- Graceful fallbacks for network issues
- User-friendly error messages
- Payment retry functionality

### Security Considerations

- Authentication required for booking
- Payment processing through Stripe (PCI compliant)
- Server-side validation of dates and availability
- Secure reservation creation
- Platform fee calculation and distribution

## Usage

The booking functionality is automatically available on any vehicle detail page (`/vehicles/:id`). Users must be authenticated to access booking features.

### For Developers

To extend the booking functionality:

1. **Add new add-ons**: Modify the vehicle schema and update the BookingModal component
2. **Customize payment flow**: Update PaymentModal to integrate with different payment providers
3. **Add booking management**: Create pages for users to view and manage their bookings
4. **Enhance notifications**: Extend the toast system for more notification types
5. **Add webhook handling**: Implement Stripe webhooks for real-time payment updates

### Testing Payments

Use Stripe test cards for development:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

## Dependencies

- `@renegade/convex` - Backend API functions
- `@clerk/clerk-react` - Authentication
- `@stripe/stripe-js` - Stripe JavaScript SDK
- `@stripe/react-stripe-js` - Stripe React components
- `convex/react` - Real-time data management
- `lucide-react` - Icons
- `react-router-dom` - Navigation

## Future Enhancements

- Real-time availability updates
- Advanced calendar with blocked dates
- Booking modifications and cancellations
- Host approval workflow
- Email notifications
- Mobile-responsive improvements
- Stripe webhook integration for real-time updates
- Payment method management
- Refund processing
