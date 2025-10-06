import { useRouter } from 'expo-router';
import {
  Archive,
  ArchiveRestore,
  CheckCircle,
  Clock,
  MessageCircle,
  MoreVertical,
  Search,
  Trash2,
  TrendingUp,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Id } from '../convex/_generated/dataModel';
import { useHostMessages } from '../hooks/useHostMessages';

interface HostMessageManagerProps {
  onConversationSelect?: (conversationId: Id<'conversations'>) => void;
  showArchived?: boolean;
}

export default function HostMessageManager({
  onConversationSelect,
  showArchived = false,
}: HostMessageManagerProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversations, setSelectedConversations] = useState<
    Id<'conversations'>[]
  >([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showSystemMessageModal, setShowSystemMessageModal] = useState(false);
  const [systemMessageContent, setSystemMessageContent] = useState('');
  const [
    selectedConversationForSystemMessage,
    setSelectedConversationForSystemMessage,
  ] = useState<Id<'conversations'> | null>(null);

  const {
    hostConversations,
    hostConversationsWithArchived,
    hostMessageStats,
    hostConversationAnalytics,
    activeConversations,
    archivedConversations,
    unreadConversations,
    bulkMarkAsRead,
    bulkArchive,
    sendSystemMessage,
    bulkConversationActions,
    getResponseRate,
    getAverageResponseTime,
  } = useHostMessages();

  // Filter conversations based on props and search
  const getFilteredConversations = () => {
    const conversations = showArchived
      ? hostConversationsWithArchived
      : hostConversations;

    if (!searchQuery) return conversations;

    return conversations.filter(
      (conv) =>
        conv.renter?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.vehicle?.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.vehicle?.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.lastMessageText?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  };

  const filteredConversations = getFilteredConversations();

  const handleConversationPress = (conversationId: Id<'conversations'>) => {
    if (onConversationSelect) {
      onConversationSelect(conversationId);
    } else {
      router.push(`/messages/chat?id=${conversationId}`);
    }
  };

  const handleConversationLongPress = (conversationId: Id<'conversations'>) => {
    if (selectedConversations.includes(conversationId)) {
      setSelectedConversations((prev) =>
        prev.filter((id) => id !== conversationId),
      );
    } else {
      setSelectedConversations((prev) => [...prev, conversationId]);
    }
    setShowBulkActions(selectedConversations.length > 0);
  };

  const handleBulkAction = async (
    action: 'archive' | 'unarchive' | 'mark_read' | 'delete',
  ) => {
    if (selectedConversations.length === 0) return;

    const actionMessages = {
      archive: 'archive',
      unarchive: 'unarchive',
      mark_read: 'mark as read',
      delete: 'delete',
    };

    Alert.alert(
      `Bulk ${actionMessages[action]}`,
      `Are you sure you want to ${actionMessages[action]} ${selectedConversations.length} conversation(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: action === 'delete' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              await bulkConversationActions({
                conversationIds: selectedConversations,
                action,
              });
              setSelectedConversations([]);
              setShowBulkActions(false);
            } catch (error) {
              console.error(`Failed to ${action} conversations:`, error);
            }
          },
        },
      ],
    );
  };

  const handleSendSystemMessage = async () => {
    if (!selectedConversationForSystemMessage || !systemMessageContent.trim())
      return;

    try {
      await sendSystemMessage({
        conversationId: selectedConversationForSystemMessage,
        content: systemMessageContent.trim(),
      });
      setShowSystemMessageModal(false);
      setSystemMessageContent('');
      setSelectedConversationForSystemMessage(null);
    } catch (error) {
      console.error('Failed to send system message:', error);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (diffInHours < 168) {
      // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const renderConversationItem = ({ item }: { item: any }) => {
    const isSelected = selectedConversations.includes(item._id);
    const hasUnread = item.unreadCountOwner > 0;

    return (
      <Pressable
        style={[
          styles.conversationItem,
          isSelected && styles.selectedConversation,
          hasUnread && styles.unreadConversation,
        ]}
        onPress={() => handleConversationPress(item._id)}
        onLongPress={() => handleConversationLongPress(item._id)}
      >
        <View style={styles.conversationContent}>
          <Image
            source={{
              uri:
                item.renter?.profileImage ||
                'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100',
            }}
            style={styles.avatar}
          />

          <View style={styles.conversationDetails}>
            <View style={styles.conversationHeader}>
              <Text style={[styles.renterName, hasUnread && styles.unreadText]}>
                {item.renter?.name || 'Unknown User'}
              </Text>
              <Text style={styles.timeText}>
                {formatTime(item.lastMessageAt)}
              </Text>
            </View>

            <Text style={[styles.vehicleInfo, hasUnread && styles.unreadText]}>
              {item.vehicle?.make} {item.vehicle?.model}
            </Text>

            <Text
              style={[styles.lastMessage, hasUnread && styles.unreadText]}
              numberOfLines={1}
            >
              {item.lastMessageText || 'No messages yet'}
            </Text>
          </View>

          <View style={styles.conversationActions}>
            {hasUnread && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
                  {item.unreadCountOwner}
                </Text>
              </View>
            )}

            <Pressable
              style={styles.moreButton}
              onPress={() => {
                setSelectedConversationForSystemMessage(item._id);
                setShowSystemMessageModal(true);
              }}
            >
              <MoreVertical size={16} color="#6b7280" />
            </Pressable>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderStatsCard = (
    title: string,
    value: string | number,
    icon: React.ReactNode,
    color: string,
  ) => (
    <View style={[styles.statsCard, { borderLeftColor: color }]}>
      <View style={styles.statsIcon}>{icon}</View>
      <View style={styles.statsContent}>
        <Text style={styles.statsValue}>{value}</Text>
        <Text style={styles.statsTitle}>{title}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Message Management</Text>
          <View style={styles.headerActions}>
            <Pressable
              style={styles.headerButton}
              onPress={() => setShowAnalytics(!showAnalytics)}
            >
              <TrendingUp size={20} color="#6b7280" />
            </Pressable>
            <Pressable
              style={styles.headerButton}
              onPress={() => setShowBulkActions(!showBulkActions)}
            >
              <CheckCircle size={20} color="#6b7280" />
            </Pressable>
          </View>
        </View>

        <Text style={styles.subtitle}>Manage conversations with renters</Text>
      </View>

      {/* Analytics */}
      {showAnalytics && (
        <View style={styles.analyticsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.statsRow}>
              {renderStatsCard(
                'Total Conversations',
                hostMessageStats.totalConversations,
                <MessageCircle size={20} color="#3b82f6" />,
                '#3b82f6',
              )}
              {renderStatsCard(
                'Unread Messages',
                hostMessageStats.unreadMessages,
                <MessageCircle size={20} color="#ef4444" />,
                '#ef4444',
              )}
              {renderStatsCard(
                'Response Rate',
                `${getResponseRate()}%`,
                <TrendingUp size={20} color="#10b981" />,
                '#10b981',
              )}
              {renderStatsCard(
                'Avg Response Time',
                getAverageResponseTime(),
                <Clock size={20} color="#f59e0b" />,
                '#f59e0b',
              )}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Bulk Actions */}
      {showBulkActions && selectedConversations.length > 0 && (
        <View style={styles.bulkActionsContainer}>
          <Text style={styles.bulkActionsText}>
            {selectedConversations.length} selected
          </Text>
          <View style={styles.bulkActionsRow}>
            <Pressable
              style={[styles.bulkActionButton, styles.markReadButton]}
              onPress={() => handleBulkAction('mark_read')}
            >
              <CheckCircle size={16} color="#ffffff" />
              <Text style={styles.bulkActionText}>Mark Read</Text>
            </Pressable>

            <Pressable
              style={[styles.bulkActionButton, styles.archiveButton]}
              onPress={() =>
                handleBulkAction(showArchived ? 'unarchive' : 'archive')
              }
            >
              {showArchived ? (
                <ArchiveRestore size={16} color="#ffffff" />
              ) : (
                <Archive size={16} color="#ffffff" />
              )}
              <Text style={styles.bulkActionText}>
                {showArchived ? 'Unarchive' : 'Archive'}
              </Text>
            </Pressable>

            <Pressable
              style={[styles.bulkActionButton, styles.deleteButton]}
              onPress={() => handleBulkAction('delete')}
            >
              <Trash2 size={16} color="#ffffff" />
              <Text style={styles.bulkActionText}>Delete</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>

      {/* Conversations List */}
      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item._id}
        renderItem={renderConversationItem}
        style={styles.conversationsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MessageCircle size={48} color="#d1d5db" />
            <Text style={styles.emptyStateTitle}>No conversations found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'Start by listing a vehicle to receive messages'}
            </Text>
          </View>
        }
      />

      {/* System Message Modal */}
      <Modal
        visible={showSystemMessageModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Pressable
              style={styles.modalCloseButton}
              onPress={() => setShowSystemMessageModal(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </Pressable>
            <Text style={styles.modalTitle}>Send System Message</Text>
            <Pressable
              style={styles.modalSendButton}
              onPress={handleSendSystemMessage}
              disabled={!systemMessageContent.trim()}
            >
              <Text
                style={[
                  styles.modalSendText,
                  !systemMessageContent.trim() && styles.modalSendTextDisabled,
                ]}
              >
                Send
              </Text>
            </Pressable>
          </View>

          <View style={styles.modalContent}>
            <TextInput
              style={styles.systemMessageInput}
              placeholder="Enter your system message..."
              value={systemMessageContent}
              onChangeText={setSystemMessageContent}
              multiline
              placeholderTextColor="#9ca3af"
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  analyticsContainer: {
    paddingVertical: 16,
    backgroundColor: '#f9fafb',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statsIcon: {
    marginRight: 12,
  },
  statsContent: {
    flex: 1,
  },
  statsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  statsTitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  bulkActionsContainer: {
    backgroundColor: '#fef3c7',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  bulkActionsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 12,
  },
  bulkActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  bulkActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  markReadButton: {
    backgroundColor: '#3b82f6',
  },
  archiveButton: {
    backgroundColor: '#6b7280',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },
  bulkActionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  conversationsList: {
    flex: 1,
  },
  conversationItem: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  selectedConversation: {
    backgroundColor: '#eff6ff',
  },
  unreadConversation: {
    backgroundColor: '#fef2f2',
  },
  conversationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  conversationDetails: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  renterName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  unreadText: {
    fontWeight: '700',
  },
  timeText: {
    fontSize: 12,
    color: '#6b7280',
  },
  vehicleInfo: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  lastMessage: {
    fontSize: 14,
    color: '#6b7280',
  },
  conversationActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unreadBadge: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  moreButton: {
    padding: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalCloseText: {
    fontSize: 16,
    color: '#6b7280',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modalSendButton: {
    padding: 8,
  },
  modalSendText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
  },
  modalSendTextDisabled: {
    color: '#9ca3af',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  systemMessageInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
  },
});
