import { Star } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  color?: string;
  emptyColor?: string;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = 20,
  color = '#fbbf24',
  emptyColor = '#d1d5db',
  onRatingChange,
  readonly = false,
}: StarRatingProps) {
  const stars = Array.from({ length: maxRating }, (_, index) => index + 1);

  const handleStarPress = (starRating: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  return (
    <View style={styles.container}>
      {stars.map((star) => (
        <Pressable
          key={star}
          style={styles.starContainer}
          onPress={() => handleStarPress(star)}
          disabled={readonly}
        >
          <Star
            size={size}
            color={star <= rating ? color : emptyColor}
            fill={star <= rating ? color : 'transparent'}
          />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starContainer: {
    marginRight: 2,
  },
});
