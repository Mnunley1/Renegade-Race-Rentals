import { Id } from '@renegade/convex/_generated/dataModel';
import { X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { toast } from 'sonner-native';
import StarRating from './StarRating';

interface ReviewModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (review: {
    completionId: Id<'rentalCompletions'>;
    rating: number;
    communication?: number;
    vehicleCondition?: number;
    professionalism?: number;
    overallExperience?: number;
    title: string;
    review: string;
    photos?: string[];
  }) => Promise<void>;
  completionId: Id<'rentalCompletions'>;
  vehicleName?: string;
}

export default function ReviewModal({
  visible,
  onClose,
  onSubmit,
  completionId,
  vehicleName,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [communication, setCommunication] = useState(0);
  const [vehicleCondition, setVehicleCondition] = useState(0);
  const [professionalism, setProfessionalism] = useState(0);
  const [overallExperience, setOverallExperience] = useState(0);
  const [title, setTitle] = useState('');
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please provide an overall rating');
      return;
    }

    if (!title.trim()) {
      toast.error('Please provide a review title');
      return;
    }

    if (!review.trim()) {
      toast.error('Please provide a review');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        completionId,
        rating,
        communication: communication > 0 ? communication : undefined,
        vehicleCondition: vehicleCondition > 0 ? vehicleCondition : undefined,
        professionalism: professionalism > 0 ? professionalism : undefined,
        overallExperience:
          overallExperience > 0 ? overallExperience : undefined,
        title: title.trim(),
        review: review.trim(),
      });
      handleClose();
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setCommunication(0);
    setVehicleCondition(0);
    setProfessionalism(0);
    setOverallExperience(0);
    setTitle('');
    setReview('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Write a Review</Text>
          <Pressable style={styles.closeButton} onPress={handleClose}>
            <X size={24} color="#6b7280" />
          </Pressable>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Vehicle Info */}
          {vehicleName && (
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleName}>{vehicleName}</Text>
            </View>
          )}

          {/* Overall Rating */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overall Rating *</Text>
            <View style={styles.ratingContainer}>
              <StarRating
                rating={rating}
                onRatingChange={setRating}
                size={32}
              />
              <Text style={styles.ratingText}>
                {rating > 0 ? `${rating}.0 stars` : 'Select rating'}
              </Text>
            </View>
          </View>

          {/* Category Ratings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category Ratings (Optional)</Text>

            <View style={styles.categoryRating}>
              <Text style={styles.categoryLabel}>Communication</Text>
              <StarRating
                rating={communication}
                onRatingChange={setCommunication}
                size={24}
              />
            </View>

            <View style={styles.categoryRating}>
              <Text style={styles.categoryLabel}>Vehicle Condition</Text>
              <StarRating
                rating={vehicleCondition}
                onRatingChange={setVehicleCondition}
                size={24}
              />
            </View>

            <View style={styles.categoryRating}>
              <Text style={styles.categoryLabel}>Professionalism</Text>
              <StarRating
                rating={professionalism}
                onRatingChange={setProfessionalism}
                size={24}
              />
            </View>

            <View style={styles.categoryRating}>
              <Text style={styles.categoryLabel}>Overall Experience</Text>
              <StarRating
                rating={overallExperience}
                onRatingChange={setOverallExperience}
                size={24}
              />
            </View>
          </View>

          {/* Review Title */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Review Title *</Text>
            <TextInput
              style={styles.textInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Summarize your experience"
              placeholderTextColor="#9ca3af"
              maxLength={100}
            />
            <Text style={styles.charCount}>{title.length}/100</Text>
          </View>

          {/* Review Text */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Review *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={review}
              onChangeText={setReview}
              placeholder="Share your experience with this rental..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={1000}
            />
            <Text style={styles.charCount}>{review.length}/1000</Text>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Pressable
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Submitting...' : 'Submit Review'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  vehicleInfo: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  section: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  ratingContainer: {
    alignItems: 'center',
    gap: 8,
  },
  ratingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  categoryRating: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryLabel: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
    marginTop: 4,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  submitButton: {
    backgroundColor: '#FF5A5F',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
