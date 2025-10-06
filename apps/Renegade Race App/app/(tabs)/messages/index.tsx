import { useRouter } from 'expo-router';
import { MessageCircle, Search, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useConversations } from '../../../hooks/useConversations';
import { useConvexAuth } from '../../../hooks/useConvexAuth';

export default function MessagesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>();
  const { userId } = useConvexAuth();
  const {
    allConversations = [],
    unreadCount = 0,
    markConversationAsRead,
    deleteConversation,
  } = useConversations();

  const handleDeleteConversation = (conversationId: string) => {
    Alert.alert(
      'Delete Conversation',
      'Are you sure you want to delete this conversation? This action cannot be undone and will delete all messages.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteConversation(conversationId),
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>Messages</Text>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
                  {unreadCount.toString()}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.subtitle}>
            Stay connected with car owners and renters
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#6b7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search conversations"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        {/* Messages List */}
        {allConversations.length === 0 ? (
          <View style={styles.emptyState}>
            <MessageCircle size={64} color="#e5e7eb" />
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptyText}>
              Start a conversation by booking a car or listing your own vehicle.
            </Text>
          </View>
        ) : (
          <View style={styles.messagesListContainer}>
            <View style={styles.messagesList}>
              {allConversations.map((conversation) => {
                // Determine the other participant
                const otherParticipant =
                  conversation.renter?.externalId === userId
                    ? conversation.owner
                    : conversation.renter;
                // Vehicle name
                const vehicleName = conversation.vehicle
                  ? `${conversation.vehicle.year} ${conversation.vehicle.make} ${conversation.vehicle.model}`
                  : 'Vehicle';
                // Unread count for this user
                const unreadCount =
                  conversation.renter?.externalId === userId
                    ? conversation.unreadCountRenter
                    : conversation.unreadCountOwner;
                const isUnread = unreadCount > 0;
                return (
                  <View
                    key={conversation._id}
                    style={styles.messageItemContainer}
                  >
                    <Pressable
                      style={styles.messageItem}
                      onPress={async () => {
                        if (!userId) return;
                        await markConversationAsRead({
                          userId,
                          conversationId: conversation._id,
                        });
                        router.push(
                          `/(tabs)/messages/chat?id=${conversation._id}`,
                        );
                      }}
                    >
                      <View style={styles.messageContent}>
                        <View style={styles.messageHeader}>
                          <Text style={styles.userName}>
                            {otherParticipant?.name || 'Unknown User'}
                          </Text>
                          <Text style={styles.timestamp}>
                            {conversation.lastMessageAt
                              ? new Date(
                                  conversation.lastMessageAt,
                                ).toLocaleDateString()
                              : ''}
                          </Text>
                        </View>
                        <Text style={styles.carName}>{vehicleName}</Text>
                      </View>
                      {isUnread && (
                        <View style={styles.unreadIndicator}>
                          <Text style={styles.unreadCount}>
                            {unreadCount > 99 ? '99+' : unreadCount.toString()}
                          </Text>
                        </View>
                      )}
                    </Pressable>
                    <Pressable
                      style={styles.deleteButton}
                      onPress={() => handleDeleteConversation(conversation._id)}
                    >
                      <Trash2 size={16} color="#ef4444" />
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </View>
        )}
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
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
  },
  unreadBadge: {
    backgroundColor: '#FF5A5F',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  unreadBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    lineHeight: 24,
  },
  messagesListContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  messagesList: {
    gap: 4,
  },
  messageItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 4,
  },
  messageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    flex: 1,
  },
  deleteButton: {
    padding: 12,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  userName: {
    fontWeight: '600',
    color: '#111827',
    fontSize: 16,
  },
  timestamp: {
    fontSize: 14,
    color: '#6b7280',
  },
  carName: {
    fontSize: 14,
    color: '#FF5A5F',
    fontWeight: '500',
  },
  unreadIndicator: {
    backgroundColor: '#FF5A5F',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  unreadCount: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});
