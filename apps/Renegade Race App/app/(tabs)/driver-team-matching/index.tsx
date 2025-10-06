import { useRouter } from 'expo-router';
import {
  Filter,
  MapPin,
  MessageCircle,
  Plus,
  Search,
  User,
  Users,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDriverProfilesList } from '../../../hooks/useDriverProfiles';
import { useTeamApplications } from '../../../hooks/useTeamApplications';
import { useTeamsList } from '../../../hooks/useTeams';

type ViewMode = 'teams' | 'drivers';

export default function DriverTeamMatchingScreen() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('teams');
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  const { applyToTeam } = useTeamApplications();
  const teams = useTeamsList({
    location: locationFilter || undefined,
    experience: (experienceFilter as any) || undefined,
  });
  const drivers = useDriverProfilesList({
    location: locationFilter || undefined,
    experience: (experienceFilter as any) || undefined,
  });

  const handleTeamPress = (teamId: string) => {
    router.push(`/driver-team-matching/team-detail?id=${teamId}`);
  };

  const handleDriverPress = (driverId: string) => {
    router.push(`/driver-team-matching/driver-detail?id=${driverId}`);
  };

  const handleApplyToTeam = async (teamId: string) => {
    try {
      await applyToTeam({
        teamId,
        message: 'I am interested in joining your team!',
        driverExperience:
          'I have experience in racing and would love to contribute.',
        preferredDates: ['2024-03-15', '2024-03-16'],
      });
    } catch (error) {
      console.error('Error applying to team:', error);
    }
  };

  const filteredTeams =
    teams?.filter(
      (team) =>
        team.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.description?.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  const filteredDrivers =
    drivers?.filter((driver) =>
      driver.bio?.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  const renderTeamCard = (team: any) => (
    <Pressable
      key={team._id}
      style={styles.card}
      onPress={() => handleTeamPress(team._id)}
    >
      <View style={styles.cardHeader}>
        {team.logoUrl ? (
          <Image source={{ uri: team.logoUrl }} style={styles.logo} />
        ) : (
          <View style={styles.logoPlaceholder}>
            <Users size={24} color="#6b7280" />
          </View>
        )}
        <View style={styles.cardHeaderContent}>
          <Text style={styles.cardTitle}>{team.name}</Text>
          <View style={styles.locationContainer}>
            <MapPin size={14} color="#6b7280" />
            <Text style={styles.locationText}>{team.location}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {team.description}
      </Text>

      <View style={styles.specialtiesContainer}>
        {team.specialties
          .slice(0, 3)
          .map((specialty: string, index: number) => (
            <View key={index} style={styles.specialtyTag}>
              <Text style={styles.specialtyText}>{specialty}</Text>
            </View>
          ))}
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.seatsInfo}>
          <Text style={styles.seatsText}>
            {team.availableSeats} seat{team.availableSeats !== 1 ? 's' : ''}{' '}
            available
          </Text>
        </View>
        <TouchableOpacity
          style={styles.applyButton}
          onPress={() => handleApplyToTeam(team._id)}
        >
          <Text style={styles.applyButtonText}>Apply</Text>
        </TouchableOpacity>
      </View>
    </Pressable>
  );

  const renderDriverCard = (driver: any) => (
    <Pressable
      key={driver._id}
      style={styles.card}
      onPress={() => handleDriverPress(driver._id)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.logoPlaceholder}>
          <User size={24} color="#6b7280" />
        </View>
        <View style={styles.cardHeaderContent}>
          <Text style={styles.cardTitle}>Driver Profile</Text>
          <View style={styles.locationContainer}>
            <MapPin size={14} color="#6b7280" />
            <Text style={styles.locationText}>{driver.location}</Text>
          </View>
        </View>
        <View style={styles.experienceBadge}>
          <Text style={styles.experienceText}>{driver.experience}</Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {driver.bio}
      </Text>

      <View style={styles.specialtiesContainer}>
        {driver.preferredCategories
          .slice(0, 3)
          .map((category: string, index: number) => (
            <View key={index} style={styles.specialtyTag}>
              <Text style={styles.specialtyText}>{category}</Text>
            </View>
          ))}
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.licensesInfo}>
          <Text style={styles.licensesText}>
            {driver.licenses.length} license
            {driver.licenses.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => router.push(`/messages?driverId=${driver._id}`)}
        >
          <MessageCircle size={16} color="#FF5A5F" />
          <Text style={styles.contactButtonText}>Contact</Text>
        </TouchableOpacity>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Driver-Team Matching</Text>
          <Text style={styles.subtitle}>
            Find your perfect racing partnership
          </Text>
        </View>

        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === 'teams' && styles.toggleButtonActive,
            ]}
            onPress={() => setViewMode('teams')}
          >
            <Users
              size={20}
              color={viewMode === 'teams' ? '#ffffff' : '#6b7280'}
            />
            <Text
              style={[
                styles.toggleButtonText,
                viewMode === 'teams' && styles.toggleButtonTextActive,
              ]}
            >
              Find Teams
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === 'drivers' && styles.toggleButtonActive,
            ]}
            onPress={() => setViewMode('drivers')}
          >
            <User
              size={20}
              color={viewMode === 'drivers' ? '#ffffff' : '#6b7280'}
            />
            <Text
              style={[
                styles.toggleButtonText,
                viewMode === 'drivers' && styles.toggleButtonTextActive,
              ]}
            >
              Find Drivers
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color="#6b7280" />
            <TextInput
              style={styles.searchInput}
              placeholder={
                viewMode === 'teams' ? 'Search teams...' : 'Search drivers...'
              }
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {showFilters && (
          <View style={styles.filtersContainer}>
            <TextInput
              style={styles.filterInput}
              placeholder="Location"
              value={locationFilter}
              onChangeText={setLocationFilter}
            />
            <View style={styles.experienceFilterContainer}>
              <Text style={styles.filterLabel}>Experience Level:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {['beginner', 'intermediate', 'advanced', 'professional'].map(
                  (level) => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.experienceFilterButton,
                        experienceFilter === level &&
                          styles.experienceFilterButtonActive,
                      ]}
                      onPress={() =>
                        setExperienceFilter(
                          experienceFilter === level ? '' : level,
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.experienceFilterButtonText,
                          experienceFilter === level &&
                            styles.experienceFilterButtonTextActive,
                        ]}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ),
                )}
              </ScrollView>
            </View>
          </View>
        )}

        <View style={styles.contentContainer}>
          {viewMode === 'teams' ? (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Available Teams</Text>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={() =>
                    router.push('/driver-team-matching/create-team')
                  }
                >
                  <Plus size={16} color="#ffffff" />
                  <Text style={styles.createButtonText}>Create Team</Text>
                </TouchableOpacity>
              </View>
              {filteredTeams.length === 0 ? (
                <View style={styles.emptyState}>
                  <Users size={64} color="#e5e7eb" />
                  <Text style={styles.emptyTitle}>No teams found</Text>
                  <Text style={styles.emptyText}>
                    Try adjusting your search criteria or create a new team
                  </Text>
                </View>
              ) : (
                <View style={styles.cardsContainer}>
                  {filteredTeams.map(renderTeamCard)}
                </View>
              )}
            </>
          ) : (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Available Drivers</Text>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={() =>
                    router.push('/driver-team-matching/create-driver-profile')
                  }
                >
                  <Plus size={16} color="#ffffff" />
                  <Text style={styles.createButtonText}>Create Profile</Text>
                </TouchableOpacity>
              </View>
              {filteredDrivers.length === 0 ? (
                <View style={styles.emptyState}>
                  <User size={64} color="#e5e7eb" />
                  <Text style={styles.emptyTitle}>No drivers found</Text>
                  <Text style={styles.emptyText}>
                    Try adjusting your search criteria or create a new driver
                    profile
                  </Text>
                </View>
              ) : (
                <View style={styles.cardsContainer}>
                  {filteredDrivers.map(renderDriverCard)}
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  scrollView: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: { fontSize: 18, color: '#6b7280' },
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  toggleButtonActive: { backgroundColor: '#FF5A5F' },
  toggleButtonText: { fontSize: 16, fontWeight: '600', color: '#6b7280' },
  toggleButtonTextActive: { color: '#ffffff' },
  searchContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 16,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: { flex: 1, fontSize: 16, color: '#111827' },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersContainer: {
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    gap: 16,
  },
  filterInput: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  experienceFilterContainer: { gap: 8 },
  filterLabel: { fontSize: 14, fontWeight: '600', color: '#374151' },
  experienceFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 8,
  },
  experienceFilterButtonActive: {
    backgroundColor: '#FF5A5F',
    borderColor: '#FF5A5F',
  },
  experienceFilterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  experienceFilterButtonTextActive: { color: '#ffffff' },
  contentContainer: { paddingHorizontal: 24, paddingBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: '#111827' },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF5A5F',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  createButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: { textAlign: 'center', color: '#6b7280', lineHeight: 24 },
  cardsContainer: { gap: 16 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  logo: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  logoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardHeaderContent: { flex: 1 },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  locationContainer: { flexDirection: 'row', alignItems: 'center' },
  locationText: { marginLeft: 4, fontSize: 14, color: '#6b7280' },
  experienceBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  experienceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400e',
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  specialtyTag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  specialtyText: { fontSize: 12, fontWeight: '500', color: '#374151' },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  seatsInfo: { flex: 1 },
  seatsText: { fontSize: 14, fontWeight: '500', color: '#059669' },
  licensesInfo: { flex: 1 },
  licensesText: { fontSize: 14, fontWeight: '500', color: '#059669' },
  applyButton: {
    backgroundColor: '#FF5A5F',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  applyButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  contactButtonText: { color: '#FF5A5F', fontSize: 14, fontWeight: '600' },
});
