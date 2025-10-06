import { useRouter } from 'expo-router';
import { ArrowLeft, User } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDriverProfiles } from '../../../hooks/useDriverProfiles';

export default function CreateDriverProfileScreen() {
  const router = useRouter();
  const { createProfile } = useDriverProfiles();

  const [formData, setFormData] = useState({
    bio: '',
    achievements: '',
    experience: 'beginner' as
      | 'beginner'
      | 'intermediate'
      | 'advanced'
      | 'professional',
    licenses: '',
    preferredCategories: '',
    availability: '',
    location: '',
    phone: '',
    email: '',
    socialLinks: {
      instagram: '',
      twitter: '',
      linkedin: '',
      website: '',
    },
  });

  const handleSubmit = async () => {
    if (!formData.bio.trim() || !formData.location.trim()) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    try {
      await createProfile({
        bio: formData.bio.trim(),
        achievements: formData.achievements.trim() || undefined,
        experience: formData.experience,
        licenses: formData.licenses
          .split(',')
          .map((l) => l.trim())
          .filter(Boolean),
        preferredCategories: formData.preferredCategories
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean),
        availability: formData.availability
          .split(',')
          .map((a) => a.trim())
          .filter(Boolean),
        location: formData.location.trim(),
        contactInfo: {
          phone: formData.phone.trim() || undefined,
          email: formData.email.trim() || undefined,
        },
        socialLinks: {
          instagram: formData.socialLinks.instagram?.trim() || undefined,
          twitter: formData.socialLinks.twitter?.trim() || undefined,
          linkedin: formData.socialLinks.linkedin?.trim() || undefined,
          website: formData.socialLinks.website?.trim() || undefined,
        },
      });

      Alert.alert('Success', 'Driver profile created successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create profile. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Profile</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <User size={64} color="#FF5A5F" />
          </View>

          <Text style={styles.title}>Create Your Driver Profile</Text>
          <Text style={styles.subtitle}>
            Fill out the information below to create your driver profile
          </Text>

          {/* Bio */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>About You *</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Tell teams about yourself, your racing experience, and what you're looking for..."
              value={formData.bio}
              onChangeText={(text) => setFormData({ ...formData, bio: text })}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Notable Wins & Achievements */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Notable Wins & Achievements</Text>
            <TextInput
              style={styles.textArea}
              placeholder="List your racing achievements, wins, championships, lap records, or other notable accomplishments..."
              value={formData.achievements}
              onChangeText={(text) =>
                setFormData({ ...formData, achievements: text })
              }
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Experience Level */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Experience Level</Text>
            <View style={styles.experienceButtons}>
              {(
                [
                  'beginner',
                  'intermediate',
                  'advanced',
                  'professional',
                ] as const
              ).map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.experienceButton,
                    formData.experience === level &&
                      styles.experienceButtonActive,
                  ]}
                  onPress={() =>
                    setFormData({ ...formData, experience: level })
                  }
                >
                  <Text
                    style={[
                      styles.experienceButtonText,
                      formData.experience === level &&
                        styles.experienceButtonTextActive,
                    ]}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Licenses */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Licenses & Certifications</Text>
            <TextInput
              style={styles.textInput}
              placeholder="FIA, NASA, SCCA, etc. (comma separated)"
              value={formData.licenses}
              onChangeText={(text) =>
                setFormData({ ...formData, licenses: text })
              }
            />
          </View>

          {/* Preferred Categories */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Preferred Racing Categories</Text>
            <TextInput
              style={styles.textInput}
              placeholder="GT3, Formula, Endurance, Rally (comma separated)"
              value={formData.preferredCategories}
              onChangeText={(text) =>
                setFormData({ ...formData, preferredCategories: text })
              }
            />
          </View>

          {/* Availability */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Availability</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Weekends, weekdays, evenings (comma separated)"
              value={formData.availability}
              onChangeText={(text) =>
                setFormData({ ...formData, availability: text })
              }
            />
          </View>

          {/* Location */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Location *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="City, State or Country"
              value={formData.location}
              onChangeText={(text) =>
                setFormData({ ...formData, location: text })
              }
            />
          </View>

          {/* Social Links */}
          <Text style={styles.sectionTitle}>Social Links</Text>
          <Text style={styles.sectionSubtitle}>
            Add your social media profiles and website (optional)
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Instagram</Text>
            <TextInput
              style={styles.textInput}
              placeholder="@username or full URL"
              value={formData.socialLinks.instagram}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  socialLinks: { ...formData.socialLinks, instagram: text },
                })
              }
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Twitter/X</Text>
            <TextInput
              style={styles.textInput}
              placeholder="@username or full URL"
              value={formData.socialLinks.twitter}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  socialLinks: { ...formData.socialLinks, twitter: text },
                })
              }
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>LinkedIn</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Full LinkedIn profile URL"
              value={formData.socialLinks.linkedin}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  socialLinks: { ...formData.socialLinks, linkedin: text },
                })
              }
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Website</Text>
            <TextInput
              style={styles.textInput}
              placeholder="https://yourwebsite.com"
              value={formData.socialLinks.website}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  socialLinks: { ...formData.socialLinks, website: text },
                })
              }
              autoCapitalize="none"
            />
          </View>

          {/* Contact Information */}
          <Text style={styles.sectionTitle}>Contact Information</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Optional"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Optional"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Create Profile</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
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
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 24,
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  textArea: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    height: 100,
    textAlignVertical: 'top',
  },
  experienceButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  experienceButton: {
    width: '48%',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
  },
  experienceButtonActive: {
    backgroundColor: '#FF5A5F',
    borderColor: '#FF5A5F',
  },
  experienceButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
  },
  experienceButtonTextActive: {
    color: '#ffffff',
  },
  submitButton: {
    backgroundColor: '#FF5A5F',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
