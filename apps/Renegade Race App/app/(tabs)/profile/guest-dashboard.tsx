import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Calendar,
  Car,
  CheckCircle,
  Clock,
  FileText,
  MessageCircle,
  X,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { toast } from 'sonner-native';
import { useConversations } from '../../../hooks/useConversations';
import { useConvexAuth } from '../../../hooks/useConvexAuth';
import { useRentalCompletions } from '../../../hooks/useRentalCompletions';
import { useReservations } from '../../../hooks/useReservations';

export default function GuestDashboard() {
  const router = useRouter();
  const { userId } = useConvexAuth();
  const { renterReservations, cancelReservation } = useReservations();
  const { pendingCompletions, createCompletion } = useRentalCompletions();
  const { getOrCreateConversation } = useConversations();

  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleCancelBooking = (reservation: any) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await cancelReservation({
                reservationId: reservation._id,
                cancellationReason: 'Cancelled by user',
              });
              toast.success('Booking cancelled successfully');
            } catch (error) {
              console.error('Error cancelling booking:', error);
              toast.error('Failed to cancel booking');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleMessageOwner = async (reservation: any) => {
    if (!userId) return;

    try {
      const conversationId = await getOrCreateConversation({
        vehicleId: reservation.vehicle._id,
        renterId: userId,
        ownerId: reservation.ownerId,
      });
      router.push(`/(tabs)/messages/chat?id=${conversationId}`);
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to open chat');
    }
  };

  const handleStartReturn = async (reservationId: any) => {
    if (!userId) return;

    // Check if completion process is already started
    const existingCompletion = pendingCompletions?.find(
      (c) => c.reservationId === reservationId,
    );
    if (existingCompletion) {
      toast.info('Return process already started for this rental');
      return;
    }

    try {
      await createCompletion(reservationId);
      toast.success('Return process started!');
    } catch (error) {
      console.error('Error starting return:', error);
      toast.error('Failed to start return process');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getReservationStatus = (reservation: any) => {
    // If the reservation is marked as completed in the database, respect that status
    if (reservation.status === 'completed') {
      return 'completed';
    }

    const startDate = new Date(reservation.startDate);
    const endDate = new Date(reservation.endDate);
    const now = new Date();

    if (now < startDate) return 'upcoming';
    if (now >= startDate && now <= endDate) return 'active';
    if (now > endDate) return 'overdue';
    return 'completed';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return '#3b82f6';
      case 'active':
        return '#10b981';
      case 'overdue':
        return '#ef4444';
      case 'completed':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'Upcoming';
      case 'active':
        return 'Active';
      case 'overdue':
        return 'Overdue';
      case 'completed':
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Calendar size={14} color="#3b82f6" />;
      case 'active':
        return <Car size={14} color="#10b981" />;
      case 'overdue':
        return <Clock size={14} color="#ef4444" />;
      case 'completed':
        return <CheckCircle size={14} color="#6b7280" />;
      default:
        return <Clock size={14} color="#6b7280" />;
    }
  };

  // Get all reservations and sort them by status priority
  const getAllReservations = () => {
    if (!renterReservations) return [];

    // Sort by status priority: upcoming > active > overdue > completed
    const statusPriority = { upcoming: 1, active: 2, overdue: 3, completed: 4 };

    return renterReservations.sort((a, b) => {
      const statusA = getReservationStatus(a);
      const statusB = getReservationStatus(b);
      return statusPriority[statusA] - statusPriority[statusB];
    });
  };

  const reservations = getAllReservations();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable style={styles.backButton} onPress={handleBack}>
            <ArrowLeft size={20} color="#6b7280" />
          </Pressable>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Guest Dashboard</Text>
            <Text style={styles.headerSubtitle}>
              Manage your vehicle rentals
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {renterReservations?.filter(
              (r) => getReservationStatus(r) === 'upcoming',
            ).length || 0}
          </Text>
          <Text style={styles.statLabel}>Upcoming</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {renterReservations?.filter(
              (r) => getReservationStatus(r) === 'active',
            ).length || 0}
          </Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {pendingCompletions?.length || 0}
          </Text>
          <Text style={styles.statLabel}>Pending Returns</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {renterReservations?.filter((r) => r.status === 'completed')
              .length || 0}
          </Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      {/* Reservations List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {reservations.length === 0 ? (
          <View style={styles.emptyState}>
            <Car size={48} color="#9ca3af" />
            <Text style={styles.emptyStateTitle}>No rentals yet</Text>
            <Text style={styles.emptyStateSubtitle}>
              When you book vehicles, they'll appear here
            </Text>
          </View>
        ) : (
          <View style={styles.reservationsList}>
            {reservations.map((reservation) => {
              const reservationStatus = getReservationStatus(reservation);
              const isConfirmed = reservation.status === 'confirmed';
              const isCompleted = reservation.status === 'completed';
              const hasPendingCompletion = pendingCompletions?.some(
                (c) => c.reservationId === reservation._id,
              );

              return (
                <View key={reservation._id} style={styles.reservationCard}>
                  {/* Vehicle Info */}
                  <View style={styles.vehicleSection}>
                    <Image
                      source={{
                        uri:
                          (reservation.vehicle as any)?.images?.[0] ||
                          'https://via.placeholder.com/80x60',
                      }}
                      style={styles.vehicleImage}
                    />
                    <View style={styles.vehicleInfo}>
                      <Text style={styles.vehicleName}>
                        {(reservation.vehicle as any)?.make}{' '}
                        {(reservation.vehicle as any)?.model}
                      </Text>
                      <Text style={styles.vehicleYear}>
                        {(reservation.vehicle as any)?.year}
                      </Text>
                      <Text style={styles.ownerName}>
                        Owner: {(reservation as any).owner?.name || 'Unknown'}
                      </Text>
                    </View>
                  </View>

                  {/* Status Badge */}
                  <View style={styles.statusSection}>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            getStatusColor(reservationStatus) + '20',
                        },
                      ]}
                    >
                      {getStatusIcon(reservationStatus)}
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(reservationStatus) },
                        ]}
                      >
                        {getStatusText(reservationStatus)}
                      </Text>
                    </View>
                  </View>

                  {/* Dates */}
                  <View style={styles.datesSection}>
                    <View style={styles.dateItem}>
                      <Text style={styles.dateLabel}>Start Date</Text>
                      <Text style={styles.dateValue}>
                        {formatDate(reservation.startDate)}
                      </Text>
                    </View>
                    <View style={styles.dateItem}>
                      <Text style={styles.dateLabel}>End Date</Text>
                      <Text style={styles.dateValue}>
                        {formatDate(reservation.endDate)}
                      </Text>
                    </View>
                  </View>

                  {/* Actions */}
                  <View style={styles.actionsSection}>
                    {/* Message Button */}
                    <Pressable
                      onPress={() => handleMessageOwner(reservation)}
                      style={styles.messageButton}
                    >
                      <MessageCircle size={16} color="#6b7280" />
                      <Text style={styles.messageButtonText}>Message</Text>
                    </Pressable>

                    {/* Conditional Action Buttons */}
                    {isConfirmed && !hasPendingCompletion && (
                      <Pressable
                        onPress={() => handleStartReturn(reservation._id)}
                        style={styles.completeButton}
                      >
                        <FileText size={16} color="#059669" />
                        <Text style={styles.completeButtonText}>
                          Start Return
                        </Text>
                      </Pressable>
                    )}

                    {isConfirmed && hasPendingCompletion && (
                      <Pressable
                        onPress={() => {
                          // Find the completion record for this reservation
                          const completion = pendingCompletions?.find(
                            (c) => c.reservationId === reservation._id,
                          );
                          if (completion) {
                            router.push(
                              `/(tabs)/profile/rental-completion-form?id=${completion._id}`,
                            );
                          }
                        }}
                        style={styles.completeButton}
                      >
                        <FileText size={16} color="#059669" />
                        <Text style={styles.completeButtonText}>
                          Complete Return
                        </Text>
                      </Pressable>
                    )}

                    {/* Cancel Button for upcoming rentals */}
                    {reservationStatus === 'upcoming' && (
                      <Pressable
                        onPress={() => handleCancelBooking(reservation)}
                        style={styles.cancelButton}
                        disabled={loading}
                      >
                        <X size={16} color="#ffffff" />
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTextContainer: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Stats container
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  // Content
  content: {
    flex: 1,
  },
  // Vehicle section
  vehicleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  vehicleImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
  },
  vehicleInfo: {
    flex: 1,
    marginLeft: 12,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  vehicleYear: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  ownerName: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  // Status section
  statusSection: {
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Dates section
  datesSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateItem: {
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  // Actions section
  actionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  messageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  completeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#059669',
    marginLeft: 8,
  },
  completeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#dc2626',
    marginLeft: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  // Empty state
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Reservations list
  reservationsList: {
    padding: 20,
  },
  reservationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
});
