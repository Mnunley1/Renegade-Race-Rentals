import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Camera,
  Check,
  Mail,
  MapPin,
  Phone,
  User,
  UserCircle,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Image,
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
import { useUserProfile } from '../../../hooks/useUserProfile';

// Zod schema for form validation
const profileFormSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  location: z.string().min(2, 'Location must be at least 2 characters'),
  bio: z.string().max(200, 'Bio cannot exceed 200 characters').optional(),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

export default function EditProfileScreen() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingImage, setIsUpdatingImage] = useState(false);

  const { currentUser, pickAndUpdateProfileImage, updateUserProfile } =
    useUserProfile();

  // Mock user data - in real app, this would come from your backend
  const [profileData, setProfileData] = useState({
    firstName: currentUser?.name?.split(' ')[0] || 'John',
    lastName: currentUser?.name?.split(' ').slice(1).join(' ') || 'Driver',
    email: currentUser?.email || 'john.driver@email.com',
    phone: currentUser?.phone || '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    bio: 'Car enthusiast and experienced driver. Always looking for new adventures on the road.',
    avatar:
      currentUser?.profileImage ||
      'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200',
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      email: profileData.email,
      phone: profileData.phone,
      location: profileData.location,
      bio: profileData.bio,
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    try {
      // Update user profile in Convex
      await updateUserProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
      });

      // Update local state
      setProfileData({ ...profileData, ...data });

      toast.success('Profile updated successfully!');
      router.back();
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangeAvatar = async () => {
    if (isUpdatingImage) return;

    setIsUpdatingImage(true);
    try {
      await pickAndUpdateProfileImage();
      toast.success('Profile photo updated successfully!');
    } catch (error) {
      console.error('Failed to update profile photo:', error);

      // Provide more specific error messages
      let errorMessage = 'Failed to update profile photo. Please try again.';

      if (error instanceof Error) {
        if (error.message.includes('Permission')) {
          errorMessage =
            Platform.OS === 'ios'
              ? 'Permission denied. Please go to Settings > Privacy & Security > Photos and allow access for this app.'
              : 'Permission denied. Please allow access to your photo library.';
        } else if (error.message.includes('Failed to upload')) {
          errorMessage =
            'Failed to upload image. Please check your internet connection.';
        } else if (error.message.includes('Failed to get image')) {
          errorMessage =
            'Failed to process image. Please try selecting a different photo.';
        } else if (error.message.includes('too large')) {
          errorMessage = 'Image is too large. Please select a smaller image.';
        } else {
          errorMessage = error.message;
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsUpdatingImage(false);
    }
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'left', 'right', 'bottom']}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#111827" />
        </Pressable>
        <Text style={styles.title}>Edit Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {currentUser?.profileImage || profileData.avatar ? (
              <Image
                source={{
                  uri: currentUser?.profileImage || profileData.avatar,
                }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <UserCircle size={60} color="#9ca3af" />
              </View>
            )}
            <Pressable
              style={[
                styles.cameraButton,
                isUpdatingImage && styles.cameraButtonDisabled,
              ]}
              onPress={handleChangeAvatar}
              disabled={isUpdatingImage}
            >
              {isUpdatingImage ? (
                <ActivityIndicator size={16} color="#fff" />
              ) : (
                <Camera size={16} color="#fff" />
              )}
            </Pressable>
          </View>
          <Text style={styles.avatarText}>
            {isUpdatingImage ? 'Updating photo...' : 'Tap to change photo'}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <View style={styles.formRow}>
            <Controller
              control={control}
              name="firstName"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>First Name *</Text>
                  <TextInput
                    style={[
                      styles.input,
                      errors.firstName && styles.inputError,
                    ]}
                    placeholder="John"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="words"
                  />
                  {errors.firstName && (
                    <Text style={styles.errorText}>
                      {errors.firstName.message}
                    </Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="lastName"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>Last Name *</Text>
                  <TextInput
                    style={[styles.input, errors.lastName && styles.inputError]}
                    placeholder="Driver"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="words"
                  />
                  {errors.lastName && (
                    <Text style={styles.errorText}>
                      {errors.lastName.message}
                    </Text>
                  )}
                </View>
              )}
            />
          </View>

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email *</Text>
                <View style={styles.inputWithIcon}>
                  <Mail size={20} color="#6b7280" style={styles.inputIcon} />
                  <TextInput
                    style={[
                      styles.inputWithIconText,
                      errors.email && styles.inputError,
                    ]}
                    placeholder="john.driver@email.com"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email.message}</Text>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Phone Number *</Text>
                <View style={styles.inputWithIcon}>
                  <Phone size={20} color="#6b7280" style={styles.inputIcon} />
                  <TextInput
                    style={[
                      styles.inputWithIconText,
                      errors.phone && styles.inputError,
                    ]}
                    placeholder="+1 (555) 123-4567"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="phone-pad"
                  />
                </View>
                {errors.phone && (
                  <Text style={styles.errorText}>{errors.phone.message}</Text>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="location"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Location *</Text>
                <View style={styles.inputWithIcon}>
                  <MapPin size={20} color="#6b7280" style={styles.inputIcon} />
                  <TextInput
                    style={[
                      styles.inputWithIconText,
                      errors.location && styles.inputError,
                    ]}
                    placeholder="San Francisco, CA"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="words"
                  />
                </View>
                {errors.location && (
                  <Text style={styles.errorText}>
                    {errors.location.message}
                  </Text>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="bio"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Bio</Text>
                <View style={styles.inputWithIcon}>
                  <User size={20} color="#6b7280" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textArea, errors.bio && styles.inputError]}
                    placeholder="Tell us a bit about yourself..."
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
                <Text style={styles.characterCount}>
                  {value?.length || 0}/200 characters
                </Text>
                {errors.bio && (
                  <Text style={styles.errorText}>{errors.bio.message}</Text>
                )}
              </View>
            )}
          />
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.saveButtonContainer}>
        <Pressable
          style={[
            styles.saveButton,
            (!isDirty || isSubmitting) && styles.saveButtonDisabled,
          ]}
          onPress={handleSubmit(onSubmit)}
          disabled={!isDirty || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size={20} color="#fff" />
          ) : (
            <>
              <Check size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
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
  headerSpacer: {
    width: 40, // Same width as back button to center the title
  },
  saveButtonContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  saveButton: {
    backgroundColor: '#FF5A5F',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF5A5F',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  cameraButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  avatarText: {
    fontSize: 14,
    color: '#6b7280',
  },
  formContainer: {
    paddingHorizontal: 24,
    gap: 20,
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
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  inputIcon: {
    marginLeft: 12,
    marginRight: 8,
  },
  inputWithIconText: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 12,
    fontSize: 16,
  },
  textArea: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
    marginTop: 4,
  },
  inputError: {
    borderColor: '#dc2626',
  },
  errorText: {
    fontSize: 12,
    color: '#dc2626',
    marginTop: 4,
  },
});
