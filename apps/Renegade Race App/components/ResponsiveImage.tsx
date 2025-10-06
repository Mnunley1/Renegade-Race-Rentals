import { api } from '@renegade/convex/_generated/api';
import { Id } from '@renegade/convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  ImageProps,
  StyleSheet,
  View,
} from 'react-native';

interface ResponsiveImageProps extends Omit<ImageProps, 'source'> {
  storageId: Id<'vehicleImages'>;
  size?: 'thumbnail' | 'card' | 'detail' | 'hero';
  width?: number;
  height?: number;
  fallbackUrl?: string;
  showLoading?: boolean;
}

export default function ResponsiveImage({
  storageId,
  size = 'card',
  width,
  height,
  fallbackUrl,
  showLoading = true,
  ...props
}: ResponsiveImageProps) {
  const image = useQuery(api.vehicles.getVehicleImageById, { id: storageId });

  const getImageUrl = () => {
    if (!image) return fallbackUrl;

    switch (size) {
      case 'thumbnail':
        return image.thumbnailUrl || image.imageUrl;
      case 'card':
        return image.cardUrl || image.imageUrl;
      case 'detail':
        return image.detailUrl || image.imageUrl;
      case 'hero':
        return image.heroUrl || image.imageUrl;
      default:
        return image.imageUrl;
    }
  };

  const imageUrl = getImageUrl();

  if (!imageUrl) {
    if (showLoading) {
      return (
        <View style={[styles.loadingContainer, { width, height }]}>
          <ActivityIndicator size="small" color="#6b7280" />
        </View>
      );
    }
    return null;
  }

  return (
    <Image
      source={{ uri: imageUrl }}
      style={[{ width, height }, props.style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
});
