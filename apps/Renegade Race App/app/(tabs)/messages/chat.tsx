import { useFocusEffect } from '@react-navigation/native';
import { useQuery } from 'convex/react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, MoreVertical, Send, Trash2 } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  BackHandler,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { useConversations } from '../../../hooks/useConversations';
import { useConvexAuth } from '../../../hooks/useConvexAuth';

interface Message {
  _id: Id<'messages'>;
  conversationId: Id<'conversations'>;
  senderId: string;
  content: string;
  messageType: 'text' | 'image' | 'system';
  isRead: boolean;
  readAt?: number;
  createdAt: number;
  sender?: {
    _id: Id<'users'>;
    name: string;
    profileImage?: string;
  };
}

export default function ChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const { userId } = useConvexAuth();
  const {
    sendMessage,
    markConversationAsRead,
    deleteMessage,
    deleteConversation,
  } = useConversations();

  // Get conversation details
  const conversation = useQuery(
    api.conversations.getById,
    id ? { conversationId: id as Id<'conversations'> } : 'skip',
  );

  // Get messages for this conversation
  const messages = useQuery(
    api.messages.getByConversation,
    id ? { conversationId: id as Id<'conversations'> } : 'skip',
  ) as Message[] | undefined;

  // Mark conversation as read when opened
  useEffect(() => {
    if (id && userId) {
      markConversationAsRead(id as Id<'conversations'>);
    }
  }, [id, userId, markConversationAsRead]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleBack = () => {
    router.back();
  };

  // Handle Android hardware back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (Platform.OS === 'android') {
          handleBack();
          return true; // Prevent default behavior
        }
        return false;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => subscription?.remove();
    }, []),
  );

  const handleSendMessage = async () => {
    if (!messageText.trim() || !id || isSending) return;

    setIsSending(true);
    try {
      await sendMessage({
        conversationId: id as Id<'conversations'>,
        content: messageText.trim(),
        messageType: 'text',
      });
      setMessageText('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteMessage = (messageId: Id<'messages'>) => {
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMessage(messageId),
        },
      ],
    );
  };

  const handleDeleteConversation = () => {
    if (!id) return;

    Alert.alert(
      'Delete Conversation',
      'Are you sure you want to delete this entire conversation? This action cannot be undone and will delete all messages.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteConversation(id as Id<'conversations'>);
              router.back();
            } catch (error) {
              console.error('Failed to delete conversation:', error);
            }
          },
        },
      ],
    );
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.senderId === userId;
    const isSystemMessage = item.messageType === 'system';

    if (isSystemMessage) {
      return (
        <View style={styles.systemMessageContainer}>
          <Text style={styles.systemMessageText}>{item.content}</Text>
        </View>
      );
    }

    return (
      <View
        style={[styles.messageRow, isOwnMessage && styles.messageRowReverse]}
      >
        {!isOwnMessage && (
          <Image
            source={{
              uri:
                item.sender?.profileImage ||
                'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100',
            }}
            style={styles.messageAvatar}
          />
        )}
        <Pressable
          onLongPress={() => handleDeleteMessage(item._id)}
          style={[
            styles.messageBubble,
            isOwnMessage ? styles.sentMessage : styles.receivedMessage,
          ]}
        >
          <Text
            style={[styles.messageText, isOwnMessage && styles.sentMessageText]}
          >
            {item.content}
          </Text>
          <Text
            style={[styles.messageTime, isOwnMessage && styles.sentMessageTime]}
          >
            {new Date(item.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </Pressable>
        {isOwnMessage && (
          <Pressable
            onPress={() => handleDeleteMessage(item._id)}
            style={styles.deleteButton}
          >
            <Trash2 size={14} color="#ef4444" />
          </Pressable>
        )}
      </View>
    );
  };

  if (!conversation) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading conversation...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const otherParticipant =
    conversation.renter?.externalId === userId
      ? conversation.owner
      : conversation.renter;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }}>
        {showOptions && (
          <Pressable
            style={styles.overlay}
            onPress={() => setShowOptions(false)}
          />
        )}
        {/* Chat Header */}
        <View style={styles.chatHeader}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color="#FF5A5F" />
          </Pressable>
          <Image
            source={{
              uri:
                otherParticipant?.profileImage ||
                'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100',
            }}
            style={styles.chatAvatar}
          />
          <View style={styles.chatHeaderInfo}>
            <Text style={styles.chatHeaderName}>
              {otherParticipant?.name || 'Unknown User'}
            </Text>
            <Text style={styles.chatHeaderCar}>
              {conversation.vehicle
                ? `${conversation.vehicle.year} ${conversation.vehicle.make} ${conversation.vehicle.model}`
                : 'Vehicle'}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => setShowOptions(!showOptions)}
              style={styles.moreButton}
            >
              <MoreVertical size={20} color="#6b7280" />
            </Pressable>
            {showOptions && (
              <View style={styles.optionsMenu}>
                <Pressable
                  style={styles.optionItem}
                  onPress={() => {
                    setShowOptions(false);
                    handleDeleteConversation();
                  }}
                >
                  <Trash2 size={16} color="#ef4444" />
                  <Text style={styles.optionText}>Delete Conversation</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>

        {/* Chat Messages */}
        <FlatList
          ref={flatListRef}
          data={messages || []}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id}
          style={styles.chatMessages}
          contentContainerStyle={{ paddingBottom: 0 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
        />

        {/* Message Input */}
        <View style={[styles.messageInput]}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              placeholderTextColor="#9ca3af"
              value={messageText}
              onChangeText={setMessageText}
              multiline
              maxLength={1000}
              onSubmitEditing={handleSendMessage}
            />
            <Pressable
              style={[
                styles.sendButton,
                (!messageText.trim() || isSending) && styles.sendButtonDisabled,
              ]}
              onPress={handleSendMessage}
              disabled={!messageText.trim() || isSending}
            >
              <Send size={16} color="white" />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
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
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  chatHeader: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  moreButton: {
    padding: 4,
  },
  headerActions: {
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 999,
  },
  optionsMenu: {
    position: 'absolute',
    top: 50,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
    minWidth: 180,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  optionText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '500',
  },
  chatAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatHeaderName: {
    fontWeight: '600',
    color: '#111827',
    fontSize: 16,
  },
  chatHeaderCar: {
    fontSize: 14,
    color: '#6b7280',
  },
  chatMessages: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  messagesContainer: {
    // paddingBottom: 16, // removed to avoid extra space
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  messageRowReverse: {
    flexDirection: 'row-reverse',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    maxWidth: '75%',
  },
  receivedMessage: {
    backgroundColor: '#f3f4f6',
  },
  sentMessage: {
    backgroundColor: '#FF5A5F',
  },
  messageText: {
    color: '#111827',
    fontSize: 16,
    lineHeight: 22,
  },
  sentMessageText: {
    color: '#ffffff',
  },
  messageTime: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  sentMessageTime: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  deleteButton: {
    marginLeft: 8,
    padding: 8,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    minWidth: 32,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  systemMessageText: {
    fontSize: 12,
    color: '#6b7280',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  messageInput: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    // paddingBottom: 0, // will be set inline
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 8,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 8,
    padding: 8,
    backgroundColor: '#FF5A5F',
    borderRadius: 20,
  },
  sendButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
});
