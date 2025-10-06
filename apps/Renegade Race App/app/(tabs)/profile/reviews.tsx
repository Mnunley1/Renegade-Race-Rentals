import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Star } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  BackHandler,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ResponseModal from '../../../components/ResponseModal';
import ReviewCard from '../../../components/ReviewCard';
import StarRating from '../../../components/StarRating';
import { useConvexAuth } from '../../../hooks/useConvexAuth';
import { useReviews } from '../../../hooks/useReviews';

export default function ReviewsScreen() {
  const router = useRouter();
  const { userId } = useConvexAuth();
  const {
    userReviews,
    userReviewStats,
    pendingResponses,
    submitResponse,
    deleteReview,
  } = useReviews();

  const [responseModalVisible, setResponseModalVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any>(null);

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

  const handleRespondToReview = (reviewId: string) => {
    const review = userReviews?.find((r) => r._id === reviewId);
    if (review) {
      setSelectedReview(review);
      setResponseModalVisible(true);
    }
  };

  const handleDeleteReview = (reviewId: string) => {
    Alert.alert(
      'Delete Review',
      'Are you sure you want to delete this review? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteReview(reviewId as any);
            } catch (error) {
              console.error('Error deleting review:', error);
            }
          },
        },
      ],
    );
  };

  const handleSubmitResponse = async (params: {
    reviewId: any;
    response: string;
  }) => {
    try {
      await submitResponse(params);
    } catch (error) {
      console.error('Error submitting response:', error);
    }
  };

  const renderReviewStats = () => {
    if (!userReviewStats) return null;

    const { averageRating, totalReviews, ratingBreakdown } = userReviewStats;

    return (
      <View style={styles.statsContainer}>
        <View style={styles.mainStat}>
          <Text style={styles.ratingNumber}>{averageRating.toFixed(1)}</Text>
          <StarRating rating={Math.round(averageRating)} readonly size={20} />
          <Text style={styles.totalReviews}>{totalReviews} reviews</Text>
        </View>

        {totalReviews > 0 && (
          <View style={styles.breakdownContainer}>
            {[5, 4, 3, 2, 1].map((rating) => (
              <View key={rating} style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>{rating} stars</Text>
                <View style={styles.breakdownBar}>
                  <View
                    style={[
                      styles.breakdownFill,
                      {
                        width: `${(ratingBreakdown[rating as keyof typeof ratingBreakdown] / totalReviews) * 100}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.breakdownCount}>
                  {ratingBreakdown[rating as keyof typeof ratingBreakdown]}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderPendingResponses = () => {
    if (!pendingResponses || pendingResponses.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Reviews Needing Response</Text>
          <Text style={styles.sectionSubtitle}>
            {pendingResponses.length} review
            {pendingResponses.length !== 1 ? 's' : ''} waiting for your response
          </Text>
        </View>
        {pendingResponses.map((review) => (
          <ReviewCard
            key={review._id}
            review={review}
            onRespond={handleRespondToReview}
            showActions={true}
            isOwner={true}
          />
        ))}
      </View>
    );
  };

  const renderAllReviews = () => {
    if (!userReviews || userReviews.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Star size={48} color="#d1d5db" />
          <Text style={styles.emptyTitle}>No Reviews Yet</Text>
          <Text style={styles.emptySubtitle}>
            Reviews from your rentals will appear here once they're submitted.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>All Reviews</Text>
          <Text style={styles.sectionSubtitle}>
            {userReviews.length} review{userReviews.length !== 1 ? 's' : ''}{' '}
            total
          </Text>
        </View>
        {userReviews.map((review) => (
          <ReviewCard
            key={review._id}
            review={review}
            onRespond={handleRespondToReview}
            onDelete={handleDeleteReview}
            showActions={true}
            isOwner={review.reviewedId === userId}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color="#111827" />
        </Pressable>
        <Text style={styles.title}>Reviews</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        {renderReviewStats()}

        {/* Pending Responses */}
        {renderPendingResponses()}

        {/* All Reviews */}
        {renderAllReviews()}
      </ScrollView>

      {/* Response Modal */}
      <ResponseModal
        visible={responseModalVisible}
        onClose={() => {
          setResponseModalVisible(false);
          setSelectedReview(null);
        }}
        onSubmit={handleSubmitResponse}
        reviewId={selectedReview?._id}
        reviewerName={selectedReview?.reviewer?.name}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    padding: 20,
    backgroundColor: '#f9fafb',
    marginBottom: 20,
  },
  mainStat: {
    alignItems: 'center',
    marginBottom: 20,
  },
  ratingNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  totalReviews: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 8,
  },
  breakdownContainer: {
    gap: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#6b7280',
    width: 60,
  },
  breakdownBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  breakdownFill: {
    height: '100%',
    backgroundColor: '#fbbf24',
  },
  breakdownCount: {
    fontSize: 14,
    color: '#6b7280',
    width: 30,
    textAlign: 'right',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});
