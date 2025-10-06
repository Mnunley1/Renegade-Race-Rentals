import { useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import { Filter, Heart, MapPin, Search, Star } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../../convex/_generated/api';
import { useConvexAuth } from '../../../hooks/useConvexAuth';
import { useFavorites } from '../../../hooks/useFavorites';

export default function ExploreScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);

  // Get current user ID
  const { userId } = useConvexAuth();

  // Use the favorites hook
  const { toggleFavorite, isVehicleFavorited } = useFavorites();

  // Fetch real data from Convex
  const vehicles = useQuery(api.vehicles.getAll, {}) || [];
  const tracks = useQuery(api.tracks.getAll, {}) || [];
  const vehiclesLoading = vehicles === undefined;
  const tracksLoading = tracks === undefined;

  // Debug logging
  console.log('Vehicles loaded:', vehicles.length);
  console.log('Tracks loaded:', tracks.length);
  console.log('Current user ID:', userId);

  const filteredVehicles = vehicles.filter((vehicle) => {
    // First filter: exclude vehicles owned by the current user
    if (userId && vehicle.ownerId === userId) {
      return false;
    }

    // Second filter: apply search query if provided
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      vehicle.make.toLowerCase().includes(query) ||
      vehicle.model.toLowerCase().includes(query) ||
      vehicle.track?.name?.toLowerCase().includes(query)
    );
  });

  // Debug logging for filtering results
  console.log('Filtered vehicles (excluding owned):', filteredVehicles.length);

  const handleCarPress = (carId: string) => {
    router.push({
      pathname: '/car-detail',
      params: { id: carId },
    });
  };

  const handleToggleFavorite = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v._id === vehicleId);
    const vehicleName = vehicle
      ? `${vehicle.year} ${vehicle.make} ${vehicle.model}`
      : undefined;
    toggleFavorite(vehicleId as any, vehicleName);
  };

  if (vehiclesLoading || tracksLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF5A5F" />
          <Text style={styles.loadingText}>Loading vehicles...</Text>
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
          <Text style={styles.title}>Find Your Perfect Track Car</Text>
          <Text style={styles.subtitle}>
            Rent high-performance cars for your next track day
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#6b7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by make, model, or track"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        {/* Track Filter */}
        <View style={styles.filterContainer}>
          <Text style={styles.filterTitle}>Popular Tracks</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.trackFilters}>
              <Pressable
                style={[
                  styles.trackButton,
                  selectedTrack === null && styles.trackButtonActive,
                ]}
                onPress={() => setSelectedTrack(null)}
              >
                <Text
                  style={[
                    styles.trackButtonText,
                    selectedTrack === null && styles.trackButtonTextActive,
                  ]}
                >
                  All Tracks
                </Text>
              </Pressable>
              {tracks.map((track) => (
                <Pressable
                  key={track._id}
                  style={[
                    styles.trackButton,
                    selectedTrack === track._id && styles.trackButtonActive,
                  ]}
                  onPress={() => setSelectedTrack(track._id)}
                >
                  <Text
                    style={[
                      styles.trackButtonText,
                      selectedTrack === track._id &&
                        styles.trackButtonTextActive,
                    ]}
                  >
                    {track.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Featured Cars */}
        <View style={styles.carsContainer}>
          <View style={styles.carsHeader}>
            <Text style={styles.carsTitle}>
              {selectedTrack ? 'Available Cars' : 'Featured Cars'}
            </Text>
            <Pressable style={styles.filterButton}>
              <Filter size={16} color="#6b7280" />
              <Text style={styles.filterButtonText}>Filter</Text>
            </Pressable>
          </View>

          {filteredVehicles.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No vehicles found</Text>
              <Text style={styles.emptyText}>
                Try adjusting your search or filter criteria
              </Text>
            </View>
          ) : (
            <View style={styles.carsList}>
              {filteredVehicles.map((vehicle) => {
                const primaryImage =
                  vehicle.images.find((img) => img.isPrimary) ||
                  vehicle.images[0];
                const imageUrl =
                  primaryImage?.imageUrl ||
                  'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=800';

                return (
                  <Pressable
                    key={vehicle._id}
                    style={styles.carCard}
                    onPress={() => handleCarPress(vehicle._id)}
                  >
                    <View style={styles.imageContainer}>
                      <Image
                        source={{ uri: imageUrl }}
                        style={styles.carImage}
                        resizeMode="cover"
                      />
                      <Pressable
                        style={styles.favoriteButton}
                        onPress={() => handleToggleFavorite(vehicle._id)}
                      >
                        <Heart
                          size={20}
                          color="#FF5A5F"
                          fill={
                            isVehicleFavorited(vehicle._id)
                              ? '#FF5A5F'
                              : 'transparent'
                          }
                        />
                      </Pressable>
                    </View>

                    <View style={styles.carContent}>
                      <View style={styles.carHeader}>
                        <Text style={styles.carTitle}>
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </Text>
                        <View style={styles.ratingContainer}>
                          <Star size={16} color="#fbbf24" fill="#fbbf24" />
                          <Text style={styles.ratingText}>
                            {vehicle.owner?.rating?.toFixed(1) || '5.0'}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.locationContainer}>
                        <MapPin size={14} color="#6b7280" />
                        <Text style={styles.locationText}>
                          {vehicle.track?.name || 'Track Location'}
                        </Text>
                        <Text style={styles.ownerText}>
                          • Hosted by {vehicle.owner?.name || 'Owner'}
                        </Text>
                      </View>

                      <View style={styles.priceContainer}>
                        <Text style={styles.priceText}>
                          ${vehicle.dailyRate}
                        </Text>
                        <Text style={styles.priceUnit}>/day</Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
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
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#111827',
  },
  filterContainer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  trackFilters: {
    flexDirection: 'row',
    gap: 12,
  },
  trackButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  trackButtonActive: {
    backgroundColor: '#FF5A5F',
    borderColor: '#FF5A5F',
  },
  trackButtonText: {
    fontWeight: '500',
    color: '#374151',
  },
  trackButtonTextActive: {
    color: '#ffffff',
  },
  carsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  carsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  carsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButtonText: {
    marginLeft: 4,
    color: '#6b7280',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
  },
  carsList: {
    gap: 24,
  },
  carCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  imageContainer: {
    position: 'relative',
  },
  carImage: {
    width: '100%',
    height: 256,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  carContent: {
    padding: 16,
  },
  carHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  carTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#6b7280',
  },
  ownerText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6b7280',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  priceUnit: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#6b7280',
  },
});
