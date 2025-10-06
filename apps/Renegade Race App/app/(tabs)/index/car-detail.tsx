import { useFocusEffect } from '@react-navigation/native';
import { useQuery } from 'convex/react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Calendar,
  Heart,
  MapPin,
  MessageCircle,
  Phone,
  Star,
  User,
  X,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Dimensions,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';
import PaymentModal from '../../../components/PaymentModal';
import StarRating from '../../../components/StarRating';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { useAvailability } from '../../../hooks/useAvailability';
import { useConversations } from '../../../hooks/useConversations';
import { useConvexAuth } from '../../../hooks/useConvexAuth';
import { useFavorites } from '../../../hooks/useFavorites';
import { useReservations } from '../../../hooks/useReservations';
import { useVehicleReviews } from '../../../hooks/useReviews';

// Mock data - replace with Convex queries later
const mockVehicle = {
  id: '1',
  make: 'Porsche',
  model: '911 GT3',
  year: 2023,
  daily_rate: 450,
  horsepower: 502,
  transmission: 'PDK',
  drivetrain: 'RWD',
  description:
    'This Porsche 911 GT3 is the perfect track weapon. Equipped with the latest PDK transmission and track-focused suspension, it delivers an incredible driving experience. The car has been meticulously maintained and is ready for your next track day adventure.',
  mileage: 8500,
  fuel_type: 'Premium Gasoline',
  color: 'GT Silver Metallic',
  tracks: { name: 'Laguna Seca' },
  profiles: {
    first_name: 'John',
    last_name: 'Smith',
    rating_as_owner: 4.8,
    total_rentals: 47,
    member_since: '2021',
    phone: '+1 (555) 123-4567',
    email: 'john.smith@email.com',
  },
  vehicle_images: [
    {
      image_url:
        'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=800',
      is_primary: true,
    },
    {
      image_url:
        'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=800',
      is_primary: false,
    },
    {
      image_url:
        'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=800',
      is_primary: false,
    },
  ],
  amenities: [
    'Racing Helmet',
    'HANS Device',
    'Racing Suit',
    'Track Insurance',
    'Tire Pressure Monitoring',
    'Data Logger',
    'GoPro Mount',
  ],
  availability: [
    { date: '2024-01-15', available: true },
    { date: '2024-01-16', available: true },
    { date: '2024-01-17', available: false },
    { date: '2024-01-18', available: true },
  ],
};

const { width } = Dimensions.get('window');

// Calendar component for date selection
const CalendarView = ({
  selectedDates,
  onDateSelect,
  availability,
  reservations,
  minDate = new Date(),
}: {
  selectedDates: { start: Date | null; end: Date | null };
  onDateSelect: (date: Date) => void;
  availability: any[];
  reservations: any[];
  minDate?: Date;
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const isDateAvailable = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];

    // Check availability
    const availabilityRecord = availability.find((a) => a.date === dateStr);
    if (availabilityRecord && !availabilityRecord.isAvailable) {
      return false;
    }

    // Check reservations
    const hasConflictingReservation = reservations.some((reservation) => {
      const start = new Date(reservation.startDate);
      const end = new Date(reservation.endDate);
      return (
        date >= start &&
        date <= end &&
        (reservation.status === 'pending' || reservation.status === 'confirmed')
      );
    });

    return !hasConflictingReservation;
  };

  const isDateSelected = (date: Date) => {
    if (!selectedDates.start) return false;
    if (selectedDates.end) {
      return date >= selectedDates.start && date <= selectedDates.end;
    }
    return date.getTime() === selectedDates.start.getTime();
  };

  const isDateInRange = (date: Date) => {
    if (!selectedDates.start || !selectedDates.end) return false;
    return date > selectedDates.start && date < selectedDates.end;
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <View style={styles.calendarContainer}>
      <View style={styles.calendarHeader}>
        <Pressable
          onPress={() =>
            setCurrentMonth(
              new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1),
            )
          }
          style={styles.calendarNavButton}
        >
          <Text style={styles.calendarNavText}>‹</Text>
        </Pressable>
        <Text style={styles.calendarTitle}>
          {currentMonth.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          })}
        </Text>
        <Pressable
          onPress={() =>
            setCurrentMonth(
              new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1),
            )
          }
          style={styles.calendarNavButton}
        >
          <Text style={styles.calendarNavText}>›</Text>
        </Pressable>
      </View>

      <View style={styles.calendarGrid}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <Text key={day} style={styles.calendarDayHeader}>
            {day}
          </Text>
        ))}

        {days.map((day, index) => {
          if (!day) {
            return <View key={index} style={styles.calendarDay} />;
          }

          const isAvailable = isDateAvailable(day);
          const isSelected = isDateSelected(day);
          const isInRange = isDateInRange(day);
          const isPast = day < minDate;

          return (
            <Pressable
              key={index}
              style={[
                styles.calendarDay,
                isSelected && styles.calendarDaySelected,
                isInRange && styles.calendarDayInRange,
                !isAvailable && styles.calendarDayUnavailable,
                isPast && styles.calendarDayPast,
              ]}
              onPress={() => !isPast && isAvailable && onDateSelect(day)}
              disabled={isPast || !isAvailable}
            >
              <Text
                style={[
                  styles.calendarDayText,
                  isSelected && styles.calendarDayTextSelected,
                  !isAvailable && styles.calendarDayTextUnavailable,
                  isPast && styles.calendarDayTextPast,
                ]}
              >
                {day.getDate()}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

// Booking modal component
const BookingModal = ({
  visible,
  onClose,
  vehicle,
  onBook,
}: {
  visible: boolean;
  onClose: () => void;
  vehicle: any;
  onBook: (
    startDate: string,
    endDate: string,
    message?: string,
    selectedAddOns?: Set<string>,
  ) => void;
}) => {
  const [selectedDates, setSelectedDates] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: null,
    end: null,
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(new Set());

  const { availability, calendarData } = useAvailability(vehicle?._id || null);

  const { vehicleReviews, vehicleStats } = useVehicleReviews(
    vehicle?._id || null,
  );

  // Provide default values for vehicleStats to prevent undefined errors
  const safeVehicleStats = vehicleStats || {
    averageRating: 0,
    totalReviews: 0,
    ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  };

  const totalDays = useMemo(() => {
    if (!selectedDates.start || !selectedDates.end) return 0;
    const diffTime = Math.abs(
      selectedDates.end.getTime() - selectedDates.start.getTime(),
    );
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }, [selectedDates]);

  const totalAmount = useMemo(() => {
    const baseAmount = totalDays * (vehicle?.dailyRate || 0);
    const addOnAmount = Array.from(selectedAddOns).reduce(
      (total, addOnName) => {
        const addOn = vehicle?.addOns?.find((a: any) => a.name === addOnName);
        return total + (addOn?.price || 0) * totalDays;
      },
      0,
    );
    return baseAmount + addOnAmount;
  }, [totalDays, vehicle?.dailyRate, selectedAddOns, vehicle?.addOns]);

  const handleDateSelect = (date: Date) => {
    if (!selectedDates.start || (selectedDates.start && selectedDates.end)) {
      setSelectedDates({ start: date, end: null });
    } else {
      if (date < selectedDates.start) {
        setSelectedDates({ start: date, end: selectedDates.start });
      } else {
        setSelectedDates({ start: selectedDates.start, end: date });
      }
    }
  };

  const handleBook = async () => {
    if (!selectedDates.start || !selectedDates.end) {
      toast.error('Please select start and end dates');
      return;
    }

    setLoading(true);
    try {
      await onBook(
        selectedDates.start.toISOString().split('T')[0],
        selectedDates.end.toISOString().split('T')[0],
        message.trim() || undefined,
        selectedAddOns,
      );
      onClose();
      setSelectedDates({ start: null, end: null });
      setMessage('');
      setSelectedAddOns(new Set());
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setLoading(false);
    }
  };

  const resetSelection = () => {
    setSelectedDates({ start: null, end: null });
    setMessage('');
    setSelectedAddOns(new Set());
  };

  const toggleAddOn = (addOnName: string) => {
    const newSelectedAddOns = new Set(selectedAddOns);
    if (newSelectedAddOns.has(addOnName)) {
      newSelectedAddOns.delete(addOnName);
    } else {
      newSelectedAddOns.add(addOnName);
    }
    setSelectedAddOns(newSelectedAddOns);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <View style={styles.modalHeaderLeft}>
            <Text style={styles.modalTitle}>Book Your Track Day</Text>
            <Text style={styles.modalSubtitle}>
              Select your dates and complete your booking
            </Text>
          </View>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#6b7280" />
          </Pressable>
        </View>

        <ScrollView
          style={styles.modalContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.vehicleSummary}>
            <View style={styles.vehicleSummaryHeader}>
              <View style={styles.vehicleSummaryInfo}>
                <Text style={styles.vehicleSummaryTitle}>
                  {vehicle?.year} {vehicle?.make} {vehicle?.model}
                </Text>
                <View style={styles.vehicleSummaryMeta}>
                  <View style={styles.vehicleSummaryRating}>
                    <Star size={16} color="#fbbf24" fill="#fbbf24" />
                    <Text style={styles.vehicleSummaryRatingText}>
                      {safeVehicleStats.averageRating.toFixed(1)}
                    </Text>
                    <Text style={styles.vehicleSummaryReviews}>
                      ({safeVehicleStats.totalReviews} reviews)
                    </Text>
                  </View>
                  <Text style={styles.vehicleSummaryLocation}>
                    {vehicle?.track?.name}
                  </Text>
                </View>
              </View>
              <View style={styles.vehicleSummaryPrice}>
                <Text style={styles.vehicleSummaryPriceAmount}>
                  ${vehicle?.dailyRate}
                </Text>
                <Text style={styles.vehicleSummaryPriceUnit}>/day</Text>
              </View>
            </View>
          </View>

          <CalendarView
            selectedDates={selectedDates}
            onDateSelect={handleDateSelect}
            availability={availability || []}
            reservations={calendarData?.reservations || []}
          />

          {selectedDates.start && selectedDates.end && (
            <View style={styles.bookingSummary}>
              <View style={styles.bookingSummaryHeader}>
                <Text style={styles.bookingSummaryTitle}>Booking Summary</Text>
                <View style={styles.bookingSummaryBadge}>
                  <Text style={styles.bookingSummaryBadgeText}>
                    {totalDays} day{totalDays !== 1 ? 's' : ''}
                  </Text>
                </View>
              </View>

              <View style={styles.bookingSummaryCard}>
                <View style={styles.bookingSummaryRow}>
                  <View style={styles.bookingSummaryIcon}>
                    <Calendar size={20} color="#6b7280" />
                  </View>
                  <View style={styles.bookingSummaryContent}>
                    <Text style={styles.bookingSummaryLabel}>Check-in</Text>
                    <Text style={styles.bookingSummaryValue}>
                      {selectedDates.start.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                </View>

                <View style={styles.bookingSummaryRow}>
                  <View style={styles.bookingSummaryIcon}>
                    <Calendar size={20} color="#6b7280" />
                  </View>
                  <View style={styles.bookingSummaryContent}>
                    <Text style={styles.bookingSummaryLabel}>Check-out</Text>
                    <Text style={styles.bookingSummaryValue}>
                      {selectedDates.end.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                </View>

                <View style={styles.bookingSummaryDivider} />

                <View style={styles.bookingSummaryRow}>
                  <View style={styles.bookingSummaryIcon}>
                    <Star size={20} color="#fbbf24" />
                  </View>
                  <View style={styles.bookingSummaryContent}>
                    <Text style={styles.bookingSummaryLabel}>Daily Rate</Text>
                    <Text style={styles.bookingSummaryValue}>
                      ${vehicle?.dailyRate}/day
                    </Text>
                  </View>
                </View>

                <View style={styles.bookingSummaryRow}>
                  <View style={styles.bookingSummaryIcon}>
                    <Calendar size={20} color="#6b7280" />
                  </View>
                  <View style={styles.bookingSummaryContent}>
                    <Text style={styles.bookingSummaryLabel}>Duration</Text>
                    <Text style={styles.bookingSummaryValue}>
                      {totalDays} day{totalDays !== 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>

                <View style={styles.bookingSummaryDivider} />

                <View style={styles.bookingSummaryTotalRow}>
                  <Text style={styles.bookingSummaryTotalLabel}>
                    Total Amount
                  </Text>
                  <Text style={styles.bookingSummaryTotal}>${totalAmount}</Text>
                </View>
              </View>

              {/* Add-ons Section */}
              {vehicle?.addOns && vehicle.addOns.length > 0 && (
                <View style={styles.addOnsSection}>
                  <Text style={styles.addOnsTitle}>Available Add-ons</Text>
                  <View style={styles.addOnsList}>
                    {vehicle.addOns.map((addOn: any, index: number) => (
                      <Pressable
                        key={index}
                        onPress={() => toggleAddOn(addOn.name)}
                        style={[
                          styles.addOnItem,
                          selectedAddOns.has(addOn.name) &&
                            styles.addOnItemSelected,
                          addOn.isRequired && styles.addOnItemRequired,
                        ]}
                      >
                        <View style={styles.addOnItemLeft}>
                          <View style={styles.addOnItemHeader}>
                            <Text style={styles.addOnItemName}>
                              {addOn.name}
                            </Text>
                            {addOn.isRequired && (
                              <View style={styles.requiredBadge}>
                                <Text style={styles.requiredBadgeText}>
                                  Required
                                </Text>
                              </View>
                            )}
                          </View>
                          {addOn.description && (
                            <Text style={styles.addOnItemDescription}>
                              {addOn.description}
                            </Text>
                          )}
                        </View>
                        <View style={styles.addOnItemRight}>
                          <Text style={styles.addOnItemPrice}>
                            ${addOn.price}/day
                          </Text>
                          <View
                            style={[
                              styles.addOnCheckbox,
                              selectedAddOns.has(addOn.name) &&
                                styles.addOnCheckboxSelected,
                            ]}
                          >
                            {selectedAddOns.has(addOn.name) && (
                              <Text style={styles.addOnCheckmark}>✓</Text>
                            )}
                          </View>
                        </View>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.messageContainer}>
                <Text style={styles.messageLabel}>
                  Message to owner (optional)
                </Text>
                <TextInput
                  style={styles.messageInput}
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Tell the owner about your track day plans, experience level, or any special requests..."
                  multiline
                  numberOfLines={3}
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>
          )}

          {selectedDates.start && selectedDates.end && (
            <View style={styles.resetButtonContainer}>
              <Pressable onPress={resetSelection} style={styles.resetButton}>
                <Text style={styles.resetButtonText}>Reset Selection</Text>
              </Pressable>
            </View>
          )}

          <View style={styles.modalActions}>
            <Pressable
              onPress={handleBook}
              disabled={!selectedDates.start || !selectedDates.end || loading}
              style={[
                styles.bookButton,
                (!selectedDates.start || !selectedDates.end || loading) &&
                  styles.bookButtonDisabled,
              ]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <View style={styles.bookButtonContent}>
                  <Text style={styles.bookButtonText}>Continue to Payment</Text>
                  <Text style={styles.bookButtonSubtext}>
                    ${totalAmount} • Secure checkout
                  </Text>
                </View>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

export default function CarDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [pendingReservation, setPendingReservation] = useState<{
    id: Id<'reservations'>;
    amount: number;
  } | null>(null);

  const { createReservation } = useReservations();
  const { toggleFavorite, isVehicleFavorited } = useFavorites();
  const { getOrCreateConversation } = useConversations();

  // Safely get auth context with fallback
  const auth = useConvexAuth();
  const userId = auth?.userId || null;

  // Fetch vehicle data from Convex
  const vehicle = useQuery(
    api.vehicles.getById,
    id ? { id: id as Id<'vehicles'> } : 'skip',
  );

  // Fetch vehicle reviews and stats
  const { vehicleReviews, vehicleStats } = useVehicleReviews(
    vehicle?._id || null,
  );

  // Provide default values for vehicleStats to prevent undefined errors
  const safeVehicleStats = vehicleStats || {
    averageRating: 0,
    totalReviews: 0,
    ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  };

  // Check if current user is the vehicle owner
  const isOwner = vehicle?.ownerId === userId;

  const handleBack = () => {
    router.back();
  };

  // Handle Android hardware back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (Platform.OS === 'android') {
          handleBack();
          return true; // Prevent default behavior
        }
        return false;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => subscription?.remove();
    }, []),
  );

  const handleToggleFavorite = () => {
    if (!vehicle) return;
    const vehicleName = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
    toggleFavorite(vehicle._id, vehicleName);
  };

  const handleContactOwner = () => {
    if (!vehicle?.owner) return;

    Alert.alert('Contact Owner', `Call ${vehicle.owner.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call', onPress: () => console.log('Call owner') },
    ]);
  };

  const handleMessageOwner = async () => {
    if (!vehicle || !userId) {
      toast.error('Please log in to message the owner');
      return;
    }

    try {
      // Get or create conversation
      const conversationId = await getOrCreateConversation({
        vehicleId: vehicle._id,
        renterId: userId,
        ownerId: vehicle.ownerId,
      });

      // Navigate directly to chat
      router.push(`/(tabs)/messages/chat?id=${conversationId}`);
    } catch (error) {
      console.error('Failed to start conversation:', error);
      toast.error('Failed to start conversation');
    }
  };

  const handleManageAvailability = () => {
    if (!vehicle) return;
    router.push(`/vehicle-availability?id=${vehicle._id}`);
  };

  const handleViewBookingRequests = () => {
    router.push('/(tabs)/profile/booking-requests');
  };

  const handleBookNow = () => {
    setBookingModalVisible(true);
  };

  const handleBook = async (
    startDate: string,
    endDate: string,
    message?: string,
    selectedAddOns?: Set<string>,
  ) => {
    if (!vehicle) return;

    try {
      // Create reservation
      const reservationId = await createReservation({
        vehicleId: vehicle._id,
        startDate,
        endDate,
        renterMessage: message,
      });

      // Calculate total amount (in cents)
      const start = new Date(startDate);
      const end = new Date(endDate);
      const totalDays =
        Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) +
        1;

      const baseAmount = totalDays * vehicle.dailyRate * 100; // Convert to cents
      const addOnAmount = Array.from(selectedAddOns || new Set()).reduce(
        (total, addOnName) => {
          const addOn = vehicle.addOns?.find((a: any) => a.name === addOnName);
          return total + (addOn?.price || 0) * totalDays * 100; // Convert to cents
        },
        0,
      );

      const totalAmount = baseAmount + addOnAmount;

      // Set pending reservation and show payment modal
      setPendingReservation({
        id: reservationId,
        amount: totalAmount,
      });
      setPaymentModalVisible(true);
    } catch (error) {
      console.error('Failed to create reservation:', error);
      toast.error('Failed to create reservation');
    }
  };

  const handlePaymentSuccess = () => {
    setPaymentModalVisible(false);
    setPendingReservation(null);
    toast.success('Payment completed! Your booking is confirmed.');
    // Optionally navigate to a success page or back to the main screen
  };

  const handlePaymentClose = () => {
    setPaymentModalVisible(false);
    setPendingReservation(null);
    // Keep the reservation as pending - user can retry payment later
  };

  useEffect(() => {
    if (isOwner) {
      setBookingModalVisible(false);
    }
  }, [isOwner]);

  if (!vehicle) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF5A5F" />
          <Text style={styles.loadingText}>Loading vehicle details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const primaryImage =
    vehicle.images?.find((img) => img.isPrimary) || vehicle.images?.[0];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with back button and favorite */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={handleBack}>
            <ArrowLeft size={24} color="#111827" />
          </Pressable>
          <Pressable
            style={styles.favoriteButton}
            onPress={handleToggleFavorite}
          >
            <Heart
              size={24}
              color="#FF5A5F"
              fill={isVehicleFavorited(vehicle._id) ? '#FF5A5F' : 'transparent'}
            />
          </Pressable>
        </View>

        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri:
                primaryImage?.imageUrl || 'https://via.placeholder.com/400x300',
            }}
            style={styles.mainImage}
            resizeMode="cover"
          />
          {vehicle.images && vehicle.images.length > 1 && (
            <View style={styles.imageIndicators}>
              {vehicle.images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    selectedImageIndex === index && styles.indicatorActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Vehicle Title and Rating */}
        <View style={styles.titleSection}>
          <Text style={styles.vehicleTitle}>
            {vehicle.year} {vehicle.make} {vehicle.model}
          </Text>
          <View style={styles.ratingContainer}>
            <Star size={16} color="#fbbf24" fill="#fbbf24" />
            <Text style={styles.ratingText}>
              {vehicle.owner?.rating?.toFixed(1) || '4.8'} (
              {vehicle.owner?.totalRentals || '47'} rentals)
            </Text>
          </View>
        </View>

        {/* Location */}
        <View style={styles.locationSection}>
          <MapPin size={16} color="#6b7280" />
          <Text style={styles.locationText}>
            {vehicle.track?.name || 'Track Location'}
          </Text>
        </View>

        {/* Price Section */}
        <View style={styles.priceSection}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>${vehicle.dailyRate}</Text>
            <Text style={styles.priceUnit}>/day</Text>
          </View>
          <Text style={styles.priceNote}>Track insurance included</Text>
        </View>

        {/* Owner Management Section (if user is owner) */}
        {isOwner && (
          <View style={styles.ownerManagementSection}>
            <Text style={styles.sectionTitle}>Manage Your Vehicle</Text>
            <View style={styles.ownerManagementCard}>
              <Pressable
                style={styles.managementButton}
                onPress={handleManageAvailability}
              >
                <Calendar size={20} color="#FF5A5F" />
                <Text style={styles.managementButtonText}>
                  Manage Availability
                </Text>
              </Pressable>
              <Pressable
                style={styles.managementButton}
                onPress={handleViewBookingRequests}
              >
                <MessageCircle size={20} color="#FF5A5F" />
                <Text style={styles.managementButtonText}>
                  View Booking Requests
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Owner Information */}
        <View style={styles.ownerSection}>
          <Text style={styles.sectionTitle}>About the Owner</Text>
          <View style={styles.ownerCard}>
            <View style={styles.ownerInfo}>
              <View style={styles.ownerAvatar}>
                <User size={24} color="#6b7280" />
              </View>
              <View style={styles.ownerDetails}>
                <Text style={styles.ownerName}>
                  {vehicle.owner?.name || 'Owner Name'}
                </Text>
                <Text style={styles.ownerStats}>
                  Member since {vehicle.owner?.memberSince || '2021'} •{' '}
                  {vehicle.owner?.totalRentals || '47'} rentals
                </Text>
              </View>
            </View>
            {!isOwner && (
              <View style={styles.ownerActions}>
                <Pressable
                  style={styles.contactButton}
                  onPress={handleContactOwner}
                >
                  <Phone size={16} color="#FF5A5F" />
                  <Text style={styles.contactButtonText}>Call</Text>
                </Pressable>
                <Pressable
                  style={styles.messageButton}
                  onPress={handleMessageOwner}
                >
                  <MessageCircle size={16} color="#6b7280" />
                  <Text style={styles.messageButtonText}>Message</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>

        {/* Vehicle Details */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Vehicle Details</Text>
          <View style={styles.detailsGrid}>
            {vehicle.horsepower && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Horsepower</Text>
                <Text style={styles.detailValue}>{vehicle.horsepower} hp</Text>
              </View>
            )}
            {vehicle.transmission && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Transmission</Text>
                <Text style={styles.detailValue}>{vehicle.transmission}</Text>
              </View>
            )}
            {vehicle.drivetrain && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Drivetrain</Text>
                <Text style={styles.detailValue}>{vehicle.drivetrain}</Text>
              </View>
            )}
            {vehicle.mileage && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Mileage</Text>
                <Text style={styles.detailValue}>
                  {vehicle.mileage.toLocaleString()} mi
                </Text>
              </View>
            )}
            {vehicle.fuelType && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Fuel Type</Text>
                <Text style={styles.detailValue}>{vehicle.fuelType}</Text>
              </View>
            )}
            {vehicle.color && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Color</Text>
                <Text style={styles.detailValue}>{vehicle.color}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Description */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{vehicle.description}</Text>
        </View>

        {/* Amenities */}
        {vehicle.amenities && vehicle.amenities.length > 0 && (
          <View style={styles.amenitiesSection}>
            <Text style={styles.sectionTitle}>Included Amenities</Text>
            <View style={styles.amenitiesList}>
              {vehicle.amenities.map((amenity, index) => (
                <View key={index} style={styles.amenityItem}>
                  <Text style={styles.amenityText}>• {amenity}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Reviews */}
        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>Reviews</Text>
          {safeVehicleStats.totalReviews > 0 ? (
            <View style={styles.reviewsHeader}>
              <View style={styles.ratingDisplay}>
                <StarRating
                  rating={Math.round(safeVehicleStats.averageRating)}
                  readonly
                  size={20}
                />
                <Text style={styles.ratingText}>
                  {safeVehicleStats.averageRating.toFixed(1)}
                </Text>
                <Text style={styles.reviewsCount}>
                  ({safeVehicleStats.totalReviews} reviews)
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.noReviewsText}>No reviews yet</Text>
          )}

          {vehicleReviews && vehicleReviews.length > 0 && (
            <View style={styles.reviewsList}>
              {vehicleReviews.slice(0, 3).map((review) => (
                <View key={review._id} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewerName}>
                      {review.reviewer?.name || 'Anonymous'}
                    </Text>
                    <StarRating rating={review.rating} readonly size={16} />
                  </View>
                  <Text style={styles.reviewTitle}>{review.title}</Text>
                  <Text style={styles.reviewText} numberOfLines={2}>
                    {review.review}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Bottom spacing for CTA button */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Book Now Button */}
      {isOwner ? (
        <SafeAreaView style={styles.ctaContainer} edges={['bottom']}>
          <View style={styles.ownerMessageContainer}>
            <Text style={styles.ownerMessageText}>
              This is your vehicle. You cannot book your own car.
            </Text>
          </View>
        </SafeAreaView>
      ) : (
        <SafeAreaView style={styles.ctaContainer} edges={['bottom']}>
          <Pressable style={styles.bookButton} onPress={handleBookNow}>
            <Calendar size={20} color="#ffffff" />
            <Text style={styles.bookButtonText}>Book Now</Text>
          </Pressable>
        </SafeAreaView>
      )}

      {/* Booking Modal */}
      <BookingModal
        visible={bookingModalVisible}
        onClose={() => setBookingModalVisible(false)}
        vehicle={vehicle}
        onBook={handleBook}
      />

      {/* Payment Modal */}
      {pendingReservation && (
        <PaymentModal
          visible={paymentModalVisible}
          onClose={handlePaymentClose}
          reservationId={pendingReservation.id}
          amount={pendingReservation.amount}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  favoriteButton: {
    width: 40,
    height: 40,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  mainImage: {
    width: '100%',
    height: 300,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  indicatorActive: {
    backgroundColor: '#ffffff',
  },
  titleSection: {
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  vehicleTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 16,
    color: '#374151',
  },
  locationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#6b7280',
  },
  priceSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  priceText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
  },
  priceUnit: {
    fontSize: 18,
    color: '#6b7280',
    marginLeft: 4,
  },
  priceNote: {
    fontSize: 14,
    color: '#6b7280',
  },
  ownerSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  ownerCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 20,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ownerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  ownerDetails: {
    flex: 1,
  },
  ownerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  ownerStats: {
    fontSize: 14,
    color: '#6b7280',
  },
  ownerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF5A5F',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  contactButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  messageButtonText: {
    color: '#374151',
    fontWeight: '600',
  },
  detailsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  detailItem: {
    width: (width - 64) / 2 - 8,
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  descriptionSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
  },
  amenitiesSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  amenitiesList: {
    gap: 8,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amenityText: {
    fontSize: 16,
    color: '#374151',
  },
  bottomSpacing: {
    height: 100,
  },
  ctaContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  bookButton: {
    backgroundColor: '#FF5A5F',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    shadowColor: '#FF5A5F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  bookButtonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0.1,
  },
  bookButtonContent: {
    alignItems: 'center',
  },
  bookButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  bookButtonSubtext: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
    opacity: 0.9,
  },
  calendarContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  calendarNavButton: {
    width: 40,
    height: 40,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  calendarNavText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
  },
  calendarDayHeader: {
    width: '14.28%',
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  calendarDay: {
    width: '14.28%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDaySelected: {
    backgroundColor: '#FF5A5F',
  },
  calendarDayInRange: {
    backgroundColor: '#FF5A5F',
    opacity: 0.5,
  },
  calendarDayUnavailable: {
    backgroundColor: '#fee2e2',
  },
  calendarDayPast: {
    backgroundColor: '#f3f4f6',
  },
  calendarDayText: {
    fontSize: 16,
    color: '#111827',
  },
  calendarDayTextSelected: {
    fontWeight: '600',
    color: '#ffffff',
  },
  calendarDayTextUnavailable: {
    color: '#dc2626',
  },
  calendarDayTextPast: {
    color: '#6b7280',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalHeaderLeft: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 22,
  },
  closeButton: {
    width: 40,
    height: 40,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalContent: {
    flex: 1,
  },
  vehicleSummary: {
    padding: 20,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  vehicleSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  vehicleSummaryInfo: {
    flex: 1,
    marginRight: 16,
  },
  vehicleSummaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  vehicleSummaryMeta: {
    gap: 4,
  },
  vehicleSummaryRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  vehicleSummaryRatingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  vehicleSummaryReviews: {
    fontSize: 14,
    color: '#6b7280',
  },
  vehicleSummaryLocation: {
    fontSize: 14,
    color: '#6b7280',
  },
  vehicleSummaryPrice: {
    alignItems: 'flex-end',
  },
  vehicleSummaryPriceAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  vehicleSummaryPriceUnit: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  bookingSummary: {
    padding: 20,
    backgroundColor: '#ffffff',
  },
  bookingSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  bookingSummaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  bookingSummaryBadge: {
    backgroundColor: '#FF5A5F',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  bookingSummaryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  bookingSummaryCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  bookingSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  bookingSummaryIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  bookingSummaryContent: {
    flex: 1,
  },
  bookingSummaryLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 2,
  },
  bookingSummaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  bookingSummaryDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 16,
  },
  bookingSummaryTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#e5e7eb',
  },
  bookingSummaryTotalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  bookingSummaryTotal: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF5A5F',
  },
  messageContainer: {
    marginBottom: 16,
  },
  messageLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  messageInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    lineHeight: 22,
    textAlignVertical: 'top',
  },
  resetButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
  },
  resetButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  modalActions: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  ownerManagementSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  ownerManagementCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 20,
  },
  managementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 8,
  },
  managementButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  ownerMessageContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerMessageText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  reviewsSection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  reviewsHeader: {
    marginBottom: 16,
  },
  ratingDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  reviewsCount: {
    fontSize: 16,
    color: '#6b7280',
  },
  noReviewsText: {
    fontSize: 16,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  reviewsList: {
    gap: 16,
  },
  reviewItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  reviewText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  addOnsSection: {
    marginBottom: 24,
  },
  addOnsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  addOnsList: {
    gap: 12,
  },
  addOnItem: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addOnItemSelected: {
    borderColor: '#FF5A5F',
    backgroundColor: '#fef2f2',
  },
  addOnItemRequired: {
    borderColor: '#f59e0b',
    backgroundColor: '#fffbeb',
  },
  addOnItemLeft: {
    flex: 1,
    marginRight: 16,
  },
  addOnItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  addOnItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginRight: 8,
  },
  requiredBadge: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  requiredBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  addOnItemDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  addOnItemRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  addOnItemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  addOnCheckbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  addOnCheckboxSelected: {
    borderColor: '#FF5A5F',
    backgroundColor: '#FF5A5F',
  },
  addOnCheckmark: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});
