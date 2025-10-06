import { useFocusEffect } from '@react-navigation/native';
import { useQuery } from 'convex/react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  X,
} from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
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
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { useAvailability } from '../../../hooks/useAvailability';

const { width } = Dimensions.get('window');

// Calendar component for availability management
const AvailabilityCalendar = ({
  selectedDates,
  onDateSelect,
  availability,
  reservations,
  onBlockDate,
  onUnblockDate,
  isOwner = false,
}: {
  selectedDates: { start: Date | null; end: Date | null };
  onDateSelect: (date: Date) => void;
  availability: any[];
  reservations: any[];
  onBlockDate?: (date: string, reason?: string) => void;
  onUnblockDate?: (date: string) => void;
  isOwner?: boolean;
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [blockModalVisible, setBlockModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [blockReason, setBlockReason] = useState('');

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

  const getDateStatus = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today) {
      return 'past';
    }

    // Check availability
    const availabilityRecord = availability.find((a) => a.date === dateStr);
    if (availabilityRecord && !availabilityRecord.isAvailable) {
      return 'blocked';
    }

    // Check reservations
    const hasReservation = reservations.some((reservation) => {
      const start = new Date(reservation.startDate);
      const end = new Date(reservation.endDate);
      return (
        date >= start &&
        date <= end &&
        (reservation.status === 'pending' || reservation.status === 'confirmed')
      );
    });

    if (hasReservation) {
      return 'reserved';
    }

    return 'available';
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

  const handleDatePress = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const status = getDateStatus(date);

    if (isOwner && status === 'blocked') {
      // Unblock date
      Alert.alert(
        'Unblock Date',
        'Are you sure you want to make this date available?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Unblock',
            onPress: () => onUnblockDate?.(dateStr),
            style: 'destructive',
          },
        ],
      );
    } else if (isOwner && status === 'available') {
      // Block date
      setSelectedDate(dateStr);
      setBlockModalVisible(true);
    } else if (!isOwner && status === 'available') {
      // Select date for booking
      onDateSelect(date);
    }
  };

  const handleBlockDate = () => {
    if (onBlockDate && selectedDate) {
      onBlockDate(selectedDate, blockReason.trim() || undefined);
      setBlockModalVisible(false);
      setSelectedDate('');
      setBlockReason('');
    }
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

          const status = getDateStatus(day);
          const isSelected = isDateSelected(day);
          const isInRange = isDateInRange(day);

          return (
            <Pressable
              key={index}
              style={[
                styles.calendarDay,
                isSelected && styles.calendarDaySelected,
                isInRange && styles.calendarDayInRange,
                status === 'blocked' && styles.calendarDayBlocked,
                status === 'reserved' && styles.calendarDayReserved,
                status === 'past' && styles.calendarDayPast,
              ]}
              onPress={() => handleDatePress(day)}
            >
              <Text
                style={[
                  styles.calendarDayText,
                  isSelected && styles.calendarDayTextSelected,
                  status === 'blocked' && styles.calendarDayTextBlocked,
                  status === 'reserved' && styles.calendarDayTextReserved,
                  status === 'past' && styles.calendarDayTextPast,
                ]}
              >
                {day.getDate()}
              </Text>
              {status === 'blocked' && (
                <X size={8} color="#dc2626" style={styles.calendarDayIcon} />
              )}
              {status === 'reserved' && (
                <Check
                  size={8}
                  color="#059669"
                  style={styles.calendarDayIcon}
                />
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.calendarLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.legendAvailable]} />
          <Text style={styles.legendText}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.legendBlocked]} />
          <Text style={styles.legendText}>Blocked</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.legendReserved]} />
          <Text style={styles.legendText}>Reserved</Text>
        </View>
      </View>

      {/* Block Date Modal */}
      <Modal
        visible={blockModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Block Date</Text>
            <Pressable
              onPress={() => setBlockModalVisible(false)}
              style={styles.closeButton}
            >
              <X size={24} color="#6b7280" />
            </Pressable>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.modalSubtitle}>
              Block {selectedDate} from bookings
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Reason (optional):</Text>
              <TextInput
                style={styles.textInput}
                value={blockReason}
                onChangeText={setBlockReason}
                placeholder="e.g., Maintenance, Personal use..."
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setBlockModalVisible(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>

              <Pressable onPress={handleBlockDate} style={styles.blockButton}>
                <Text style={styles.blockButtonText}>Block Date</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  vehicleSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  vehicleImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  vehiclePrice: {
    fontSize: 14,
    color: '#6b7280',
  },
  dateRangeActions: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  dateRangeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  dateRangeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  bulkBlockButton: {
    flex: 1,
    backgroundColor: '#FF5A5F',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  bulkBlockButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
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
    marginBottom: 8,
  },
  calendarDay: {
    width: '14.28%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  calendarDaySelected: {
    backgroundColor: '#FF5A5F',
    borderRadius: 20,
  },
  calendarDayInRange: {
    backgroundColor: '#FF5A5F',
    opacity: 0.5,
  },
  calendarDayBlocked: {
    backgroundColor: '#fee2e2',
    borderRadius: 20,
  },
  calendarDayReserved: {
    backgroundColor: '#dcfce7',
    borderRadius: 20,
  },
  calendarDayPast: {
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
  },
  calendarDayText: {
    fontSize: 16,
    color: '#111827',
  },
  calendarDayTextSelected: {
    fontWeight: '600',
    color: '#ffffff',
  },
  calendarDayTextBlocked: {
    color: '#dc2626',
  },
  calendarDayTextReserved: {
    color: '#059669',
  },
  calendarDayTextPast: {
    color: '#6b7280',
  },
  calendarDayIcon: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  calendarLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendAvailable: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  legendBlocked: {
    backgroundColor: '#fee2e2',
  },
  legendReserved: {
    backgroundColor: '#dcfce7',
  },
  legendText: {
    fontSize: 12,
    color: '#6b7280',
  },
  quickActions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
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
    padding: 16,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    minHeight: 80,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  blockButton: {
    flex: 1,
    backgroundColor: '#FF5A5F',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  blockButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default function VehicleAvailabilityScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [selectedDates, setSelectedDates] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: null,
    end: null,
  });
  const [bulkBlockModalVisible, setBulkBlockModalVisible] = useState(false);
  const [bulkBlockReason, setBulkBlockReason] = useState('');

  const vehicle = useQuery(
    api.vehicles.getById,
    id ? { id: id as Id<'vehicles'> } : 'skip',
  );

  const { availability, calendarData, blockDate, blockDateRange, unblockDate } =
    useAvailability(vehicle?._id || null);

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

  const handleBlockDate = async (date: string, reason?: string) => {
    try {
      await blockDate({ date, reason });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleUnblockDate = async (date: string) => {
    try {
      await unblockDate({ date });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleBulkBlock = async () => {
    if (!selectedDates.start || !selectedDates.end) {
      toast.error('Please select a date range');
      return;
    }

    try {
      await blockDateRange({
        startDate: selectedDates.start.toISOString().split('T')[0],
        endDate: selectedDates.end.toISOString().split('T')[0],
        reason: bulkBlockReason.trim() || undefined,
      });
      setBulkBlockModalVisible(false);
      setSelectedDates({ start: null, end: null });
      setBulkBlockReason('');
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const resetSelection = () => {
    setSelectedDates({ start: null, end: null });
  };

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
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color="#111827" />
        </Pressable>
        <Text style={styles.headerTitle}>Manage Availability</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Vehicle Summary */}
        <View style={styles.vehicleSummary}>
          <Image
            source={{
              uri:
                primaryImage?.imageUrl || 'https://via.placeholder.com/100x100',
            }}
            style={styles.vehicleImage}
            resizeMode="cover"
          />
          <View style={styles.vehicleInfo}>
            <Text style={styles.vehicleTitle}>
              {vehicle.year} {vehicle.make} {vehicle.model}
            </Text>
            <Text style={styles.vehiclePrice}>${vehicle.dailyRate}/day</Text>
          </View>
        </View>

        {/* Selected Date Range Actions */}
        {selectedDates.start && selectedDates.end && (
          <View style={styles.dateRangeActions}>
            <Text style={styles.dateRangeText}>
              {selectedDates.start.toLocaleDateString()} -{' '}
              {selectedDates.end.toLocaleDateString()}
            </Text>
            <View style={styles.dateRangeButtons}>
              <Pressable onPress={resetSelection} style={styles.resetButton}>
                <Text style={styles.resetButtonText}>Reset</Text>
              </Pressable>
              <Pressable
                onPress={() => setBulkBlockModalVisible(true)}
                style={styles.bulkBlockButton}
              >
                <Text style={styles.bulkBlockButtonText}>Block Range</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Calendar */}
        <AvailabilityCalendar
          selectedDates={selectedDates}
          onDateSelect={handleDateSelect}
          availability={availability || []}
          reservations={calendarData?.reservations || []}
          onBlockDate={handleBlockDate}
          onUnblockDate={handleUnblockDate}
          isOwner={true}
        />

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <View style={styles.actionButtons}>
            <Pressable style={styles.actionButton}>
              <Calendar size={20} color="#FF5A5F" />
              <Text style={styles.actionButtonText}>
                Set Default Availability
              </Text>
            </Pressable>

            <Pressable style={styles.actionButton}>
              <AlertCircle size={20} color="#FF5A5F" />
              <Text style={styles.actionButtonText}>Maintenance Schedule</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Bulk Block Modal */}
      <Modal
        visible={bulkBlockModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Block Date Range</Text>
            <Pressable
              onPress={() => setBulkBlockModalVisible(false)}
              style={styles.closeButton}
            >
              <X size={24} color="#6b7280" />
            </Pressable>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.modalSubtitle}>
              Block {selectedDates.start?.toLocaleDateString()} -{' '}
              {selectedDates.end?.toLocaleDateString()} from bookings
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Reason (optional):</Text>
              <TextInput
                style={styles.textInput}
                value={bulkBlockReason}
                onChangeText={setBulkBlockReason}
                placeholder="e.g., Maintenance, Personal use..."
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setBulkBlockModalVisible(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>

              <Pressable onPress={handleBulkBlock} style={styles.blockButton}>
                <Text style={styles.blockButtonText}>Block Range</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
