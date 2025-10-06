import React from 'react';
import { View, Text, Image, Pressable, Platform, StyleSheet } from 'react-native';
import { Star, MapPin, Heart } from 'lucide-react-native';

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  track: string;
  owner: string;
  isFavorite?: boolean;
}

interface CarCardProps {
  car: Car;
  onPress: (carId: string) => void;
  onFavoritePress?: (carId: string) => void;
}

export default function CarCard({ car, onPress, onFavoritePress }: CarCardProps) {
  return (
    <Pressable
      style={styles.container}
      onPress={() => onPress(car.id)}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: car.image }}
          style={styles.image}
          resizeMode="cover"
        />
        {onFavoritePress && (
          <Pressable
            style={styles.favoriteButton}
            onPress={() => onFavoritePress(car.id)}
          >
            <Heart 
              size={20} 
              color="#FF5A5F" 
              fill={car.isFavorite ? "#FF5A5F" : "transparent"}
            />
          </Pressable>
        )}
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {car.year} {car.make} {car.model}
          </Text>
          <View style={styles.ratingContainer}>
            <Star size={16} color="#fbbf24" fill="#fbbf24" />
            <Text style={styles.ratingText}>
              {car.rating}
            </Text>
            <Text style={styles.reviewsText}>
              ({car.reviews})
            </Text>
          </View>
        </View>
        
        <View style={styles.locationContainer}>
          <MapPin size={14} color="#6b7280" />
          <Text style={styles.locationText}>
            {car.track}
          </Text>
          <Text style={styles.ownerText}>
            • Hosted by {car.owner}
          </Text>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>
            ${car.price}
            <Text style={styles.pricePeriod}>
              {' '}/ day
            </Text>
          </Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              Track Ready
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
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
    marginBottom: 24,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
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
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
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
  reviewsText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#6b7280',
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
  pricePeriod: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#6b7280',
  },
  statusBadge: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    color: '#dc2626',
    fontWeight: '500',
    fontSize: 14,
  },
});