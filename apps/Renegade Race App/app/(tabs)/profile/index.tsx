import { useAuth } from '@clerk/clerk-expo';
import { useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import {
  Bell,
  Calendar,
  Car,
  CheckCircle,
  ChevronRight,
  CreditCard,
  Heart,
  CircleHelp as HelpCircle,
  LogOut,
  Settings,
  Star,
  Trash2,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';
import { api } from '../../../convex/_generated/api';
import { useConvexAuth } from '../../../hooks/useConvexAuth';
import { useFavorites } from '../../../hooks/useFavorites';
import { useReviews } from '../../../hooks/useReviews';
import { useToasts } from '../../../hooks/useToasts';
import { useVehicles } from '../../../hooks/useVehicles';

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { showComingSoon } = useToasts();
  const { favoriteCount } = useFavorites();
  const { userReviewStats } = useReviews();
  const { userId } = useConvexAuth();
  const { userVehicles } = useVehicles();
  const [notifications, setNotifications] = useState(true);
  const [trackMode, setTrackMode] = useState(false);

  // Get user data from Convex
  const user = useQuery(
    api.users.getByExternalId,
    userId ? { externalId: userId } : 'skip',
  );

  // Mock user data fallback
  const userData = user || {
    name: 'John Doe',
    email: 'john@example.com',
    profileImage:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    rating: 4.8,
    totalRentals: 12,
    memberSince: 'March 2023',
  };

  const stats = {
    trips: userData.totalRentals || 12,
    listings: userVehicles?.length || 0,
    favorites: favoriteCount,
    reviews: userReviewStats?.totalReviews || 0,
  };

  // Calculate approval status for vehicles
  const approvedVehicles =
    userVehicles?.filter((v) => v.isApproved).length || 0;
  const pendingVehicles =
    userVehicles?.filter((v) => !v.isApproved).length || 0;

  const menuSections = [
    {
      title: 'My Bookings',
      items: [
        {
          icon: Car,
          label: 'Host Dashboard',
          subtitle: 'Manage your vehicle rental business',
          action: () => router.push('/(tabs)/profile/host-dashboard'),
        },
        {
          icon: Calendar,
          label: 'Guest Dashboard',
          subtitle: 'Manage your vehicle rentals and returns',
          action: () => router.push('/(tabs)/profile/guest-dashboard'),
        },
      ],
    },
    {
      title: 'My Vehicles',
      items: [
        {
          icon: Car,
          label: 'My Vehicles',
          subtitle: `${stats.listings} listings (${approvedVehicles} approved, ${pendingVehicles} pending)`,
          action: () => toast.info('Vehicle management coming soon!'),
        },
        {
          icon: CheckCircle,
          label: 'Availability',
          subtitle: 'Manage calendar',
          action: () => toast.info('Select a vehicle to manage availability'),
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          icon: Heart,
          label: 'Favorites',
          subtitle: `${favoriteCount} saved`,
          action: () => toast.info('Favorites management coming soon!'),
        },
        {
          icon: Star,
          label: 'Reviews',
          subtitle: `${stats.reviews} reviews`,
          action: () => router.push('/(tabs)/profile/reviews'),
        },
      ],
    },
    {
      title: 'Settings',
      items: [
        {
          icon: Settings,
          label: 'Edit Profile',
          action: () => router.push('/(tabs)/profile/edit-profile'),
        },
        {
          icon: Bell,
          label: 'Notifications',
          toggle: notifications,
          onToggle: setNotifications,
        },
        {
          icon: CreditCard,
          label: 'Payment Methods',
          action: () => toast.info('Payment methods coming soon!'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: HelpCircle,
          label: 'Help Center',
          action: () => router.push('/(tabs)/profile/help-center'),
        },
      ],
    },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      router.replace('/(auth)/login');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>Profile</Text>
          </View>

          {/* User Info */}
          <View style={styles.userInfo}>
            <Image
              source={{ uri: userData.profileImage }}
              style={styles.avatar}
            />
            <Text style={styles.userName}>{userData.name}</Text>
            <Text style={styles.userEmail}>{userData.email}</Text>

            <View style={styles.ratingContainer}>
              <Star size={16} color="#fbbf24" fill="#fbbf24" />
              <Text style={styles.ratingText}>
                {userData.rating?.toFixed(1) || '4.8'}
              </Text>
              <Text style={styles.reviewsText}>• {stats.reviews} reviews</Text>
            </View>

            <Text style={styles.joinDate}>
              Member since {userData.memberSince}
            </Text>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.trips}</Text>
              <Text style={styles.statLabel}>Trips</Text>
            </View>
            <View style={[styles.statItem, styles.statItemBorder]}>
              <Text style={styles.statNumber}>{stats.listings}</Text>
              <Text style={styles.statLabel}>Listings</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.favorites}</Text>
              <Text style={styles.statLabel}>Favorites</Text>
            </View>
          </View>
        </View>

        {/* Menu Sections */}
        <View style={styles.menuContainer}>
          {menuSections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.menuSection}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.menuItems}>
                {section.items.map((item, itemIndex) => (
                  <Pressable
                    key={itemIndex}
                    style={[
                      styles.menuItem,
                      itemIndex < section.items.length - 1 &&
                        styles.menuItemBorder,
                    ]}
                    onPress={() => {
                      if (item.action) {
                        item.action();
                      }
                    }}
                  >
                    <View style={styles.menuItemIcon}>
                      <item.icon size={20} color="#6b7280" />
                    </View>
                    <View style={styles.menuItemContent}>
                      <Text style={styles.menuItemLabel}>{item.label}</Text>
                      {'subtitle' in item && item.subtitle && (
                        <Text style={styles.menuItemSubtitle}>
                          {item.subtitle}
                        </Text>
                      )}
                    </View>
                    {'toggle' in item && item.toggle !== undefined ? (
                      <Switch
                        value={item.toggle}
                        onValueChange={item.onToggle}
                        trackColor={{ false: '#d1d5db', true: '#FF5A5F' }}
                        thumbColor="white"
                      />
                    ) : (
                      <ChevronRight size={20} color="#d1d5db" />
                    )}
                  </Pressable>
                ))}
              </View>
            </View>
          ))}

          {/* Sign Out */}
          <View style={styles.signOutSection}>
            <Pressable
              style={({ pressed }) => [
                styles.signOutButton,
                pressed && styles.signOutButtonPressed,
              ]}
              onPress={handleSignOut}
            >
              <View style={styles.signOutIcon}>
                <LogOut size={20} color="#fff" />
              </View>
              <Text style={styles.signOutText}>Sign Out</Text>
            </Pressable>
          </View>

          {/* Delete Account */}
          <View style={styles.deleteAccountSection}>
            <Pressable
              style={({ pressed }) => [
                styles.deleteAccountButton,
                pressed && styles.deleteAccountButtonPressed,
              ]}
              onPress={() => {
                // TODO: Implement delete account logic
                console.log('Delete account pressed');
              }}
            >
              <View style={styles.deleteAccountIcon}>
                <Trash2 size={20} color="#fff" />
              </View>
              <Text style={styles.deleteAccountText}>Delete Account</Text>
            </Pressable>
          </View>
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
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
  },
  settingsButton: {
    padding: 8,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    color: '#6b7280',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingText: {
    marginLeft: 4,
    fontWeight: '600',
    color: '#111827',
  },
  reviewsText: {
    marginLeft: 4,
    color: '#6b7280',
  },
  joinDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statItemBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#e5e7eb',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  menuContainer: {
    paddingHorizontal: 24,
    gap: 20,
  },
  menuSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  menuItems: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemLabel: {
    fontWeight: '500',
    color: '#111827',
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  signOutSection: {
    marginTop: 16,
    width: '100%',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc2626',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    width: '100%',
  },
  signOutButtonPressed: {
    opacity: 0.7,
  },
  signOutIcon: {
    marginRight: 8,
  },
  signOutText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  deleteAccountSection: {
    marginTop: 12,
    width: '100%',
  },
  deleteAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc2626',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    width: '100%',
  },
  deleteAccountButtonPressed: {
    opacity: 0.7,
  },
  deleteAccountIcon: {
    marginRight: 8,
  },
  deleteAccountText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
