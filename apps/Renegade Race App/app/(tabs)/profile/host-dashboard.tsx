import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Calendar,
  Car,
  CheckCircle,
  CheckCircle2,
  Clock,
  FileText,
  MessageCircle,
  X,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { toast } from 'sonner-native';
import { Id } from '../../../convex/_generated/dataModel';
import { useConversations } from '../../../hooks/useConversations';
import { useConvexAuth } from '../../../hooks/useConvexAuth';
import { useRentalCompletions } from '../../../hooks/useRentalCompletions';
import { useReservations } from '../../../hooks/useReservations';

export default function HostDashboard() {
  const router = useRouter();
  const { userId } = useConvexAuth();
  const {
    pendingReservations,
    confirmedOwnerReservations,
    ownerReservations,
    approveReservation,
    declineReservation,
    completeReservation,
  } = useReservations();
  const { pendingCompletions, createCompletion } = useRentalCompletions();
  const { getOrCreateConversation } = useConversations();

  // Helper function to check if a reservation has a pending completion
  const hasPendingCompletion = (reservation: any) => {
    if (!pendingCompletions) return false;
    return pendingCompletions.some(
      (completion) => completion.reservationId === reservation._id,
    );
  };

  const [responseModalVisible, setResponseModalVisible] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleApprove = async () => {
    if (!selectedReservation || !userId) return;

    setLoading(true);
    try {
      await approveReservation({
        reservationId: selectedReservation._id,
        ownerMessage: responseMessage,
      });
      toast.success('Request approved successfully!');
      setResponseModalVisible(false);
      setSelectedReservation(null);
      setResponseMessage('');
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request');
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!selectedReservation || !userId) return;

    setLoading(true);
    try {
      await declineReservation({
        reservationId: selectedReservation._id,
        ownerMessage: responseMessage,
      });
      toast.success('Request declined successfully!');
      setResponseModalVisible(false);
      setSelectedReservation(null);
      setResponseMessage('');
    } catch (error) {
      console.error('Error declining request:', error);
      toast.error('Failed to decline request');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteReservation = async () => {
    if (!selectedReservation || !userId) return;

    setLoading(true);
    try {
      await completeReservation({
        reservationId: selectedReservation._id,
      });
      toast.success('Rental marked as completed!');
      setResponseModalVisible(false);
      setSelectedReservation(null);
    } catch (error) {
      console.error('Error completing reservation:', error);
      toast.error('Failed to complete reservation');
    } finally {
      setLoading(false);
    }
  };

  const openResponseModal = (
    reservation: any,
    action: 'approve' | 'decline',
  ) => {
    setSelectedReservation({ ...reservation, action });
    setResponseModalVisible(true);
    setResponseMessage('');
  };

  const openCompletionModal = (reservation: any) => {
    setSelectedReservation({ ...reservation, action: 'complete' });
    setResponseModalVisible(true);
    setResponseMessage('');
  };

  const handleMessageUser = async (reservation: any) => {
    if (!userId) return;

    try {
      const conversationId = await getOrCreateConversation({
        vehicleId: reservation.vehicle._id,
        renterId: reservation.renterId,
        ownerId: userId,
      });
      // Navigate directly to chat
      router.push(`/(tabs)/messages/chat?id=${conversationId}`);
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to open chat');
    }
  };

  const handleStartCompletion = async (reservationId: Id<'reservations'>) => {
    if (!userId) return;

    // Check if completion process is already started
    const existingCompletion = pendingCompletions?.find(
      (c) => c.reservationId === reservationId,
    );
    if (existingCompletion) {
      toast.info('Completion process already started for this rental');
      return;
    }

    try {
      await createCompletion(reservationId);
      toast.success('Completion process started!');
    } catch (error) {
      console.error('Error starting completion:', error);
      toast.error('Failed to start completion process');
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
    const allReservations = [
      ...(pendingReservations || []),
      ...(confirmedOwnerReservations || []),
      ...(ownerReservations?.filter((r) => r.status === 'completed') || []),
    ];

    // Sort by status priority: pending > active > upcoming > overdue > completed
    const statusPriority = {
      pending: 1,
      active: 2,
      upcoming: 3,
      overdue: 4,
      completed: 5,
    };

    return allReservations.sort((a, b) => {
      const statusA =
        a.status === 'pending' ? 'pending' : getReservationStatus(a);
      const statusB =
        b.status === 'pending' ? 'pending' : getReservationStatus(b);
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
            <Text style={styles.headerTitle}>Host Dashboard</Text>
            <Text style={styles.headerSubtitle}>
              Manage your vehicle rental business
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {pendingReservations?.length || 0}
          </Text>
          <Text style={styles.statLabel}>Pending Requests</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {confirmedOwnerReservations?.filter((r) => !hasPendingCompletion(r))
              .length || 0}
          </Text>
          <Text style={styles.statLabel}>Active Rentals</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {pendingCompletions?.length || 0}
          </Text>
          <Text style={styles.statLabel}>Pending Returns</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {ownerReservations?.filter((r) => r.status === 'completed')
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
              When you receive rental requests, they'll appear here
            </Text>
          </View>
        ) : (
          <View style={styles.reservationsList}>
            {reservations.map((reservation) => {
              const reservationStatus = getReservationStatus(reservation);
              const isPending = reservation.status === 'pending';
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
                      <Text style={styles.renterName}>
                        Renter: {(reservation as any).renter?.name || 'Unknown'}
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
                        {isPending
                          ? 'Pending'
                          : getStatusText(reservationStatus)}
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
                      onPress={() => handleMessageUser(reservation)}
                      style={styles.messageButton}
                    >
                      <MessageCircle size={16} color="#6b7280" />
                      <Text style={styles.messageButtonText}>Message</Text>
                    </Pressable>

                    {/* Conditional Action Buttons */}
                    {isPending && (
                      <View style={styles.responseButtons}>
                        <Pressable
                          onPress={() =>
                            openResponseModal(reservation, 'decline')
                          }
                          style={[styles.actionButton, styles.declineButton]}
                        >
                          <X size={16} color="#ffffff" />
                          <Text style={styles.actionButtonText}>Decline</Text>
                        </Pressable>
                        <Pressable
                          onPress={() =>
                            openResponseModal(reservation, 'approve')
                          }
                          style={[styles.actionButton, styles.approveButton]}
                        >
                          <CheckCircle size={16} color="#ffffff" />
                          <Text style={styles.actionButtonText}>Approve</Text>
                        </Pressable>
                      </View>
                    )}

                    {isConfirmed && !hasPendingCompletion && (
                      <Pressable
                        onPress={() => handleStartCompletion(reservation._id)}
                        style={styles.completeButton}
                      >
                        <FileText size={16} color="#059669" />
                        <Text style={styles.completeButtonText}>
                          Start Completion
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
                              `/(tabs)/profile/owner-return-review?id=${completion._id}`,
                            );
                          }
                        }}
                        style={styles.completeButton}
                      >
                        <CheckCircle2 size={16} color="#059669" />
                        <Text style={styles.completeButtonText}>
                          Review Return
                        </Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Response Modal (Approve/Decline) */}
      <Modal
        visible={responseModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setResponseModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedReservation?.action === 'approve'
                  ? 'Approve'
                  : 'Decline'}{' '}
                Request
              </Text>
              <Pressable
                onPress={() => setResponseModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </Pressable>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.modalSubtitle}>
                {selectedReservation?.action === 'approve'
                  ? 'Send a message to the renter (optional):'
                  : "Let the renter know why you're declining (optional):"}
              </Text>

              <TextInput
                style={styles.textArea}
                value={responseMessage}
                onChangeText={setResponseMessage}
                placeholder={
                  selectedReservation?.action === 'approve'
                    ? 'e.g., Looking forward to hosting you!'
                    : 'e.g., Sorry, the vehicle is not available for those dates.'
                }
                multiline
                numberOfLines={4}
              />

              <View style={styles.modalActions}>
                <Pressable
                  onPress={() => setResponseModalVisible(false)}
                  style={styles.cancelButton}
                  disabled={loading}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>

                <Pressable
                  onPress={
                    selectedReservation?.action === 'approve'
                      ? handleApprove
                      : handleDecline
                  }
                  disabled={loading}
                  style={[
                    styles.confirmButton,
                    selectedReservation?.action === 'approve'
                      ? styles.approveButton
                      : styles.declineButton,
                    loading && styles.confirmButtonDisabled,
                  ]}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.confirmButtonText}>
                      {selectedReservation?.action === 'approve'
                        ? 'Approve'
                        : 'Decline'}
                    </Text>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
  headerRight: {
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
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  vehicleInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  vehicleImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  vehicleDetails: {
    flex: 1,
    justifyContent: 'center',
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
    marginBottom: 4,
  },
  vehicleDates: {
    fontSize: 14,
    color: '#6b7280',
  },
  userInfo: {
    marginBottom: 16,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
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
  },
  messageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  approveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#059669',
  },
  approveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  declineButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#dc2626',
  },
  declineButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
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
    backgroundColor: '#FF5A5F',
  },
  completeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
  },
  modalContent: {
    padding: 20,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
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
  renterName: {
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
  responseButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  declineButton: {
    backgroundColor: '#dc2626',
  },
  approveButton: {
    backgroundColor: '#059669',
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    margin: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6b7280',
  },
  modalContent: {
    marginBottom: 24,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#ffffff',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});
