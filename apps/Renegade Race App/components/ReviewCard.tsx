import { MessageCircle, Trash2 } from 'lucide-react-native';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import StarRating from './StarRating';

interface ReviewCardProps {
  review: any;
  onRespond?: (reviewId: string) => void;
  onDelete?: (reviewId: string) => void;
  showActions?: boolean;
  isOwner?: boolean;
}

export default function ReviewCard({
  review,
  onRespond,
  onDelete,
  showActions = false,
  isOwner = false,
}: ReviewCardProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.reviewerInfo}>
          <Image
            source={{
              uri:
                review.reviewer?.profileImage ||
                'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            }}
            style={styles.avatar}
          />
          <View style={styles.reviewerDetails}>
            <Text style={styles.reviewerName}>
              {review.reviewer?.name || 'Anonymous'}
            </Text>
            <Text style={styles.reviewDate}>
              {formatDate(review.createdAt)}
            </Text>
          </View>
        </View>
        <View style={styles.ratingContainer}>
          <StarRating rating={review.rating} readonly size={16} />
          <Text style={styles.ratingText}>{review.rating}.0</Text>
        </View>
      </View>

      {/* Review Content */}
      <View style={styles.content}>
        <Text style={styles.title}>{review.title}</Text>
        <Text style={styles.reviewText}>{review.review}</Text>
      </View>

      {/* Category Ratings */}
      {review.communication ||
      review.vehicleCondition ||
      review.professionalism ||
      review.overallExperience ? (
        <View style={styles.categoryRatings}>
          {review.communication && (
            <View style={styles.categoryItem}>
              <Text style={styles.categoryLabel}>Communication</Text>
              <StarRating rating={review.communication} readonly size={12} />
            </View>
          )}
          {review.vehicleCondition && (
            <View style={styles.categoryItem}>
              <Text style={styles.categoryLabel}>Vehicle Condition</Text>
              <StarRating rating={review.vehicleCondition} readonly size={12} />
            </View>
          )}
          {review.professionalism && (
            <View style={styles.categoryItem}>
              <Text style={styles.categoryLabel}>Professionalism</Text>
              <StarRating rating={review.professionalism} readonly size={12} />
            </View>
          )}
          {review.overallExperience && (
            <View style={styles.categoryItem}>
              <Text style={styles.categoryLabel}>Overall Experience</Text>
              <StarRating
                rating={review.overallExperience}
                readonly
                size={12}
              />
            </View>
          )}
        </View>
      ) : null}

      {/* Response */}
      {review.response && (
        <View style={styles.responseContainer}>
          <Text style={styles.responseLabel}>
            Response from {review.reviewed?.name || 'Owner'}:
          </Text>
          <Text style={styles.responseText}>{review.response.text}</Text>
          <Text style={styles.responseDate}>
            {formatDate(review.response.respondedAt)}
          </Text>
        </View>
      )}

      {/* Actions */}
      {showActions && (
        <View style={styles.actions}>
          {!review.response && isOwner && (
            <Pressable
              style={styles.actionButton}
              onPress={() => onRespond?.(review._id)}
            >
              <MessageCircle size={16} color="#6b7280" />
              <Text style={styles.actionText}>Respond</Text>
            </Pressable>
          )}
          {!isOwner && (
            <Pressable
              style={styles.actionButton}
              onPress={() => onDelete?.(review._id)}
            >
              <Trash2 size={16} color="#dc2626" />
              <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  reviewerDetails: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  ratingContainer: {
    alignItems: 'flex-end',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginTop: 4,
  },
  content: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  reviewText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  categoryRatings: {
    marginBottom: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  responseContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  responseLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  responseText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 4,
  },
  responseDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 14,
    color: '#6b7280',
  },
  deleteText: {
    color: '#dc2626',
  },
});
