import { Id } from '@renegade/convex/_generated/dataModel';
import { X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { toast } from 'sonner-native';

interface ResponseModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (params: {
    reviewId: Id<'rentalReviews'>;
    response: string;
  }) => Promise<void>;
  reviewId: Id<'rentalReviews'>;
  reviewerName?: string;
}

export default function ResponseModal({
  visible,
  onClose,
  onSubmit,
  reviewId,
  reviewerName,
}: ResponseModalProps) {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!response.trim()) {
      toast.error('Please provide a response');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        reviewId,
        response: response.trim(),
      });
      handleClose();
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setResponse('');
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
          <Text style={styles.title}>Respond to Review</Text>
          <Pressable style={styles.closeButton} onPress={handleClose}>
            <X size={24} color="#6b7280" />
          </Pressable>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {reviewerName && (
            <View style={styles.reviewerInfo}>
              <Text style={styles.reviewerLabel}>Review from:</Text>
              <Text style={styles.reviewerName}>{reviewerName}</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Response *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={response}
              onChangeText={setResponse}
              placeholder="Share your perspective on this review..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.charCount}>{response.length}/500</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Your response will be visible to the reviewer and other users.
              Keep it professional and constructive.
            </Text>
          </View>
        </View>

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
              {loading ? 'Submitting...' : 'Submit Response'}
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
    paddingTop: 20,
  },
  reviewerInfo: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  reviewerLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  reviewerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
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
  infoBox: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
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
