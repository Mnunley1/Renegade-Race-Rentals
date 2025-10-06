import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, MapPin, Users } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTeamApplications } from '../../../hooks/useTeamApplications';
import { useTeamById } from '../../../hooks/useTeams';

export default function TeamDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [driverExperience, setDriverExperience] = useState('');
  const [preferredDates, setPreferredDates] = useState('');

  const team = useTeamById(id as string);
  const { applyToTeam } = useTeamApplications();

  const handleApply = async () => {
    if (!message.trim() || !driverExperience.trim() || !preferredDates.trim()) {
      Alert.alert(
        'Missing Information',
        'Please fill in all fields before applying.',
      );
      return;
    }

    try {
      await applyToTeam({
        teamId: id as any,
        message: message.trim(),
        driverExperience: driverExperience.trim(),
        preferredDates: preferredDates.split(',').map((date) => date.trim()),
      });

      Alert.alert('Success', 'Your application has been submitted!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit application. Please try again.');
    }
  };

  if (!team) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading team information...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
          <Text style={styles.headerTitle}>Team Details</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Team Image/Logo */}
        <View style={styles.imageContainer}>
          {team.logoUrl ? (
            <Image source={{ uri: team.logoUrl }} style={styles.teamLogo} />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Users size={64} color="#6b7280" />
            </View>
          )}
        </View>

        {/* Team Info */}
        <View style={styles.teamInfo}>
          <Text style={styles.teamName}>{team.name}</Text>

          <View style={styles.locationContainer}>
            <MapPin size={16} color="#6b7280" />
            <Text style={styles.locationText}>{team.location}</Text>
          </View>

          <Text style={styles.description}>{team.description}</Text>

          <View style={styles.seatsContainer}>
            <Text style={styles.seatsLabel}>Available Seats:</Text>
            <Text style={styles.seatsText}>{team.availableSeats}</Text>
          </View>

          {/* Specialties */}
          <View style={styles.specialtiesContainer}>
            <Text style={styles.sectionTitle}>Specialties</Text>
            <View style={styles.specialtiesList}>
              {team.specialties.map((specialty, index) => (
                <View key={index} style={styles.specialtyTag}>
                  <Text style={styles.specialtyText}>{specialty}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Requirements */}
          <View style={styles.requirementsContainer}>
            <Text style={styles.sectionTitle}>Requirements</Text>
            <View style={styles.requirementsList}>
              {team.requirements.map((requirement, index) => (
                <View key={index} style={styles.requirementItem}>
                  <Text style={styles.requirementText}>• {requirement}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Contact Info */}
          <View style={styles.contactContainer}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            {team.contactInfo.phone && (
              <Text style={styles.contactText}>
                Phone: {team.contactInfo.phone}
              </Text>
            )}
            {team.contactInfo.email && (
              <Text style={styles.contactText}>
                Email: {team.contactInfo.email}
              </Text>
            )}
            {team.contactInfo.website && (
              <Text style={styles.contactText}>
                Website: {team.contactInfo.website}
              </Text>
            )}
          </View>
        </View>

        {/* Application Form */}
        <View style={styles.applicationContainer}>
          <Text style={styles.applicationTitle}>Apply to Join This Team</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Your Message</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Tell the team about yourself and why you want to join..."
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Your Racing Experience</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Describe your racing background and experience..."
              value={driverExperience}
              onChangeText={setDriverExperience}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Preferred Dates</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter preferred dates (e.g., 2024-03-15, 2024-03-16)"
              value={preferredDates}
              onChangeText={setPreferredDates}
            />
          </View>

          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>Submit Application</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  imageContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  teamLogo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamInfo: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  teamName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#6b7280',
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  seatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  seatsLabel: {
    fontSize: 16,
    color: '#374151',
    marginRight: 8,
  },
  seatsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  specialtiesContainer: {
    marginBottom: 24,
  },
  specialtiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specialtyTag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  specialtyText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  requirementsContainer: {
    marginBottom: 24,
  },
  requirementsList: {
    gap: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  requirementText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    flex: 1,
  },
  contactContainer: {
    marginBottom: 32,
  },
  contactText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  applicationContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    backgroundColor: '#f9fafb',
    paddingTop: 24,
  },
  applicationTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
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
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  textArea: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    height: 100,
    textAlignVertical: 'top',
  },
  applyButton: {
    backgroundColor: '#FF5A5F',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
