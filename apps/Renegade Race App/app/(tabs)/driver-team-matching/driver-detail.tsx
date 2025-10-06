import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Award,
  Calendar,
  MapPin,
  MessageCircle,
  User,
} from 'lucide-react-native';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDriverProfileById } from '../../../hooks/useDriverProfiles';

export default function DriverDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const driverProfile = useDriverProfileById(id as string);

  if (!driverProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading driver profile...</Text>
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
          <Text style={styles.headerTitle}>Driver Profile</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Driver Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatarPlaceholder}>
            <User size={80} color="#6b7280" />
          </View>
        </View>

        {/* Driver Info */}
        <View style={styles.driverInfo}>
          <View style={styles.locationContainer}>
            <MapPin size={16} color="#6b7280" />
            <Text style={styles.locationText}>{driverProfile.location}</Text>
          </View>

          <View style={styles.experienceContainer}>
            <Text style={styles.experienceLabel}>Experience Level:</Text>
            <View style={styles.experienceBadge}>
              <Text style={styles.experienceText}>
                {driverProfile.experience}
              </Text>
            </View>
          </View>

          <Text style={styles.bio}>{driverProfile.bio}</Text>

          {/* Licenses */}
          <View style={styles.licensesContainer}>
            <Text style={styles.sectionTitle}>Licenses & Certifications</Text>
            <View style={styles.licensesList}>
              {driverProfile.licenses.map((license, index) => (
                <View key={index} style={styles.licenseTag}>
                  <Award size={16} color="#059669" />
                  <Text style={styles.licenseText}>{license}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Preferred Categories */}
          <View style={styles.categoriesContainer}>
            <Text style={styles.sectionTitle}>Preferred Racing Categories</Text>
            <View style={styles.categoriesList}>
              {driverProfile.preferredCategories.map((category, index) => (
                <View key={index} style={styles.categoryTag}>
                  <Text style={styles.categoryText}>{category}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Availability */}
          <View style={styles.availabilityContainer}>
            <Text style={styles.sectionTitle}>Availability</Text>
            <View style={styles.availabilityList}>
              {driverProfile.availability.map((avail, index) => (
                <View key={index} style={styles.availabilityItem}>
                  <Calendar size={16} color="#6b7280" />
                  <Text style={styles.availabilityText}>{avail}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Contact Info */}
          <View style={styles.contactContainer}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            {driverProfile.contactInfo.phone && (
              <Text style={styles.contactText}>
                Phone: {driverProfile.contactInfo.phone}
              </Text>
            )}
            {driverProfile.contactInfo.email && (
              <Text style={styles.contactText}>
                Email: {driverProfile.contactInfo.email}
              </Text>
            )}
          </View>
        </View>

        {/* Contact Button */}
        <View style={styles.contactButtonContainer}>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => router.push(`/messages?driverId=${id}`)}
          >
            <MessageCircle size={20} color="#ffffff" />
            <Text style={styles.contactButtonText}>Contact Driver</Text>
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
  avatarContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverInfo: {
    paddingHorizontal: 24,
    paddingBottom: 32,
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
  experienceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  experienceLabel: {
    fontSize: 16,
    color: '#374151',
    marginRight: 8,
  },
  experienceBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  experienceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
    textTransform: 'capitalize',
  },
  bio: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  licensesContainer: {
    marginBottom: 24,
  },
  licensesList: {
    gap: 12,
  },
  licenseTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 12,
  },
  licenseText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#059669',
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  categoriesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryTag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  availabilityContainer: {
    marginBottom: 24,
  },
  availabilityList: {
    gap: 12,
  },
  availabilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 12,
  },
  availabilityText: {
    fontSize: 14,
    color: '#6b7280',
  },
  contactContainer: {
    marginBottom: 32,
  },
  contactText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  contactButtonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  contactButton: {
    backgroundColor: '#FF5A5F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  contactButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
