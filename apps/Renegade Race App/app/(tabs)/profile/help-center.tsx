import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  Send,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
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
import { z } from 'zod';

// Zod schema for form validation
const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(500, 'Message cannot exceed 500 characters'),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

// FAQ data
const faqData = [
  {
    question: 'How do I rent a car?',
    answer:
      "Browse available cars on the Explore tab, select your desired vehicle, choose your dates, and complete the booking process. You'll need to provide your driver's license and payment information.",
  },
  {
    question: 'What happens if I damage the car?',
    answer:
      'All rentals include basic insurance coverage. For additional protection, you can purchase extra coverage during the booking process. Any damages should be reported immediately.',
  },
  {
    question: 'Can I cancel my reservation?',
    answer:
      'Yes, you can cancel your reservation up to 24 hours before the pickup time for a full refund. Cancellations within 24 hours may incur a cancellation fee.',
  },
  {
    question: 'What documents do I need to rent?',
    answer:
      "You'll need a valid driver's license, proof of insurance, and a credit card for the security deposit. International renters may need additional documentation.",
  },
  {
    question: 'How does the rating system work?',
    answer:
      'After each rental, both the renter and car owner can rate each other on a 5-star scale. This helps maintain quality and trust within our community.',
  },
  {
    question: 'What if the car breaks down?',
    answer:
      "In case of a breakdown, contact our 24/7 support team immediately. We'll help arrange alternative transportation and handle the situation according to our policies.",
  },
];

export default function HelpCenterScreen() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Message sent successfully! We'll get back to you soon.");
      reset();
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <SafeAreaView
        style={styles.container}
        edges={['top', 'left', 'right', 'bottom']}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#111827" />
          </Pressable>
          <Text style={styles.title}>Help Center</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Contact Methods */}
          <View style={styles.contactMethods}>
            <Text style={styles.sectionTitle}>Get in Touch</Text>
            <View style={styles.contactCards}>
              <View style={styles.contactCard}>
                <View style={styles.contactIcon}>
                  <Phone size={20} color="#FF5A5F" />
                </View>
                <Text style={styles.contactLabel}>Call Us</Text>
                <Text style={styles.contactValue}>1-800-RENTAL</Text>
                <Text style={styles.contactSubtext}>24/7 Support</Text>
              </View>
              <View style={styles.contactCard}>
                <View style={styles.contactIcon}>
                  <Mail size={20} color="#FF5A5F" />
                </View>
                <Text style={styles.contactLabel}>Email Us</Text>
                <Text style={styles.contactValue}>support@rental.com</Text>
                <Text style={styles.contactSubtext}>Response within 24h</Text>
              </View>
            </View>
          </View>

          {/* FAQ Section */}
          <View style={styles.faqSection}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            <View style={styles.faqList}>
              {faqData.map((faq, index) => (
                <View key={index} style={styles.faqItem}>
                  <Pressable
                    style={styles.faqQuestion}
                    onPress={() => toggleFaq(index)}
                  >
                    <Text style={styles.faqQuestionText}>{faq.question}</Text>
                    {expandedFaq === index ? (
                      <ChevronUp size={20} color="#6b7280" />
                    ) : (
                      <ChevronDown size={20} color="#6b7280" />
                    )}
                  </Pressable>
                  {expandedFaq === index && (
                    <View style={styles.faqAnswer}>
                      <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Contact Form */}
          <View style={styles.contactFormSection}>
            <View style={styles.formHeader}>
              <Text style={styles.sectionTitle}>Send us a Message</Text>
              <Text style={styles.formSubtitle}>
                We're here to help! Fill out the form below and we'll get back
                to you as soon as possible.
              </Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.formRow}>
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={[styles.inputContainer, styles.halfWidth]}>
                      <Text style={styles.inputLabel}>First Name *</Text>
                      <TextInput
                        style={[styles.input, errors.name && styles.inputError]}
                        placeholder="John"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        autoCapitalize="words"
                      />
                      {errors.name && (
                        <Text style={styles.errorText}>
                          {errors.name.message}
                        </Text>
                      )}
                    </View>
                  )}
                />

                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={[styles.inputContainer, styles.halfWidth]}>
                      <Text style={styles.inputLabel}>Email *</Text>
                      <TextInput
                        style={[
                          styles.input,
                          errors.email && styles.inputError,
                        ]}
                        placeholder="john@example.com"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                      {errors.email && (
                        <Text style={styles.errorText}>
                          {errors.email.message}
                        </Text>
                      )}
                    </View>
                  )}
                />
              </View>

              <Controller
                control={control}
                name="subject"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Subject *</Text>
                    <TextInput
                      style={[
                        styles.input,
                        errors.subject && styles.inputError,
                      ]}
                      placeholder="What can we help you with?"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                    {errors.subject && (
                      <Text style={styles.errorText}>
                        {errors.subject.message}
                      </Text>
                    )}
                  </View>
                )}
              />

              <Controller
                control={control}
                name="message"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Message *</Text>
                    <View style={styles.textAreaContainer}>
                      <TextInput
                        style={[
                          styles.textArea,
                          errors.message && styles.inputError,
                        ]}
                        placeholder="Please provide details about your question or concern. The more information you can provide, the better we can assist you."
                        value={value}
                        onChangeText={(text) => {
                          if (text.length <= 500) {
                            onChange(text);
                          }
                        }}
                        onBlur={onBlur}
                        multiline
                        numberOfLines={6}
                        textAlignVertical="top"
                        maxLength={500}
                      />
                      <Text style={styles.characterCount}>
                        {value?.length || 0}/500
                      </Text>
                    </View>
                    {errors.message && (
                      <Text style={styles.errorText}>
                        {errors.message.message}
                      </Text>
                    )}
                  </View>
                )}
              />

              <View style={styles.formFooter}>
                <Pressable
                  style={[
                    styles.submitButton,
                    isSubmitting && styles.submitButtonDisabled,
                  ]}
                  onPress={handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                >
                  <Send size={20} color="#fff" />
                  <Text style={styles.submitButtonText}>
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Text>
                </Pressable>
                <Text style={styles.requiredText}>* Required fields</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
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
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  contactMethods: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  contactCards: {
    flexDirection: 'row',
    gap: 12,
  },
  contactCard: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  contactIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF5A5F',
    marginBottom: 2,
  },
  contactSubtext: {
    fontSize: 12,
    color: '#6b7280',
  },
  faqSection: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  faqList: {
    gap: 8,
  },
  faqItem: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginRight: 12,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  contactFormSection: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 16,
  },
  formHeader: {
    marginBottom: 20,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginTop: 4,
  },
  formContainer: {
    gap: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingRight: 60,
    fontSize: 16,
    backgroundColor: '#ffffff',
    minHeight: 100,
  },
  textAreaContainer: {
    position: 'relative',
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  characterCount: {
    position: 'absolute',
    top: 12,
    right: 12,
    fontSize: 12,
    color: '#6b7280',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  inputError: {
    borderColor: '#dc2626',
  },
  errorText: {
    fontSize: 12,
    color: '#dc2626',
    marginTop: 4,
  },
  formFooter: {
    marginTop: 4,
    gap: 8,
  },
  requiredText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF5A5F',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
