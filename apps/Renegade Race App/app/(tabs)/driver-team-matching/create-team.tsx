import { useRouter } from 'expo-router';
import { ArrowLeft, Users } from 'lucide-react-native';
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
import { useTeams } from '../../../hooks/useTeams';

export default function CreateTeamScreen() {
  const router = useRouter();
  const { createTeam } = useTeams();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    specialties: '',
    availableSeats: '',
    requirements: '',
    phone: '',
    email: '',
    website: '',
    instagram: '',
    twitter: '',
    facebook: '',
    linkedin: '',
  });

  const handleSubmit = async () => {
    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      !formData.location.trim()
    ) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    try {
      await createTeam({
        name: formData.name.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        specialties: formData.specialties
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        availableSeats: parseInt(formData.availableSeats) || 1,
        requirements: formData.requirements
          .split(',')
          .map((r) => r.trim())
          .filter(Boolean),
        contactInfo: {
          phone: formData.phone.trim() || undefined,
          email: formData.email.trim() || undefined,
          website: formData.website.trim() || undefined,
        },
        socialLinks: {
          instagram: formData.instagram?.trim() || undefined,
          twitter: formData.twitter?.trim() || undefined,
          facebook: formData.facebook?.trim() || undefined,
          linkedin: formData.linkedin?.trim() || undefined,
        },
      });

      Alert.alert('Success', 'Team created successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create team. Please try again.');
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
          <Text style={styles.headerTitle}>Create Team</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Users size={64} color="#FF5A5F" />
          </View>

          <Text style={styles.title}>Create Your Racing Team</Text>
          <Text style={styles.subtitle}>
            Fill out the information below to create your team profile
          </Text>

          {/* Team Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Team Name *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your team name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
          </View>

          {/* Description */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Description *</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Describe your team, racing philosophy, and goals..."
              value={formData.description}
              onChangeText={(text) =>
                setFormData({ ...formData, description: text })
              }
              multiline
              numberOfLines={4}
              textAlignVertical="top"
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

          {/* Specialties */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Racing Specialties</Text>
            <TextInput
              style={styles.textInput}
              placeholder="GT3, Formula, Endurance, Rally (comma separated)"
              value={formData.specialties}
              onChangeText={(text) =>
                setFormData({ ...formData, specialties: text })
              }
            />
          </View>

          {/* Available Seats */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Available Seats</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Number of available seats"
              value={formData.availableSeats}
              onChangeText={(text) =>
                setFormData({ ...formData, availableSeats: text })
              }
              keyboardType="numeric"
            />
          </View>

          {/* Requirements */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Requirements for Drivers</Text>
            <TextInput
              style={styles.textInput}
              placeholder="License required, experience level, etc. (comma separated)"
              value={formData.requirements}
              onChangeText={(text) =>
                setFormData({ ...formData, requirements: text })
              }
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

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Website</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Optional"
              value={formData.website}
              onChangeText={(text) =>
                setFormData({ ...formData, website: text })
              }
              autoCapitalize="none"
            />
          </View>

          {/* Social Links */}
          <Text style={styles.sectionTitle}>Social Links</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Instagram</Text>
            <TextInput
              style={styles.textInput}
              placeholder="@username or full URL"
              value={formData.instagram}
              onChangeText={(text) =>
                setFormData({ ...formData, instagram: text })
              }
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Twitter/X</Text>
            <TextInput
              style={styles.textInput}
              placeholder="@username or full URL"
              value={formData.twitter}
              onChangeText={(text) =>
                setFormData({ ...formData, twitter: text })
              }
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Facebook</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Page name or full URL"
              value={formData.facebook}
              onChangeText={(text) =>
                setFormData({ ...formData, facebook: text })
              }
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>LinkedIn</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Company page or full URL"
              value={formData.linkedin}
              onChangeText={(text) =>
                setFormData({ ...formData, linkedin: text })
              }
              autoCapitalize="none"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Create Team</Text>
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
