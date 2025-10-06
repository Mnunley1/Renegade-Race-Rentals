import { api } from '@renegade/convex/_generated/api';
import { Id } from '@renegade/convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { toast } from 'sonner-native';
import { useConvexAuth } from './useConvexAuth';

export function useConversations() {
  const { userId } = useConvexAuth();

  // Queries
  const createConversation = useMutation(api.conversations.create);
  const markConversationAsRead = useMutation(api.conversations.markAsRead);
  const archiveConversation = useMutation(api.conversations.archive);
  const deleteConversation = useMutation(api.conversations.deleteConversation);
  const sendMessage = useMutation(api.messages.send);
  const markMessageAsRead = useMutation(api.messages.markAsRead);
  const markConversationMessagesAsRead = useMutation(
    api.messages.markConversationAsRead,
  );
  const deleteMessage = useMutation(api.messages.deleteMessage);

  // Get conversations for current user as renter
  const renterConversations = useQuery(
    api.conversations.getByUser,
    userId ? { userId, role: 'renter' as const } : 'skip',
  );

  // Get conversations for current user as owner
  const ownerConversations = useQuery(
    api.conversations.getByUser,
    userId ? { userId, role: 'owner' as const } : 'skip',
  );

  // Get unread message count
  const unreadCount = useQuery(
    api.messages.getUnreadCount,
    userId ? { userId } : 'skip',
  );

  // Get conversation by vehicle and participants
  const getConversationByVehicle = useQuery(
    api.conversations.getByVehicleAndParticipants,
    'skip',
  );

  // Get messages for a conversation
  const getMessages = useQuery(api.messages.getByConversation, 'skip');

  // Mutation handlers with error handling
  const handleCreateConversation = async (params: {
    vehicleId: Id<'vehicles'>;
    renterId: string;
    ownerId: string;
  }) => {
    try {
      const result = await createConversation(params);
      return result;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to create conversation';
      toast.error(message);
      throw error;
    }
  };

  const handleSendMessage = async (params: {
    conversationId: Id<'conversations'>;
    content: string;
    messageType?: 'text' | 'image' | 'system';
  }) => {
    try {
      const result = await sendMessage(params);
      return result;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to send message';
      toast.error(message);
      throw error;
    }
  };

  const handleMarkConversationAsRead = async (
    conversationId: Id<'conversations'>,
  ) => {
    if (!userId) return;

    try {
      await markConversationAsRead({ conversationId, userId });
    } catch (error) {
      console.error('Failed to mark conversation as read:', error);
    }
  };

  const handleMarkMessageAsRead = async (messageId: Id<'messages'>) => {
    try {
      await markMessageAsRead({ messageId });
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  };

  const handleArchiveConversation = async (
    conversationId: Id<'conversations'>,
  ) => {
    try {
      await archiveConversation({ conversationId });
      toast.success('Conversation archived');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to archive conversation';
      toast.error(message);
      throw error;
    }
  };

  const handleDeleteMessage = async (messageId: Id<'messages'>) => {
    try {
      await deleteMessage({ messageId });
      toast.success('Message deleted');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete message';
      toast.error(message);
      throw error;
    }
  };

  const handleDeleteConversation = async (
    conversationId: Id<'conversations'>,
  ) => {
    try {
      await deleteConversation({ conversationId });
      toast.success('Conversation deleted');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to delete conversation';
      toast.error(message);
      throw error;
    }
  };

  // Helper function to get or create conversation
  const getOrCreateConversation = async (params: {
    vehicleId: Id<'vehicles'>;
    renterId: string;
    ownerId: string;
  }) => {
    try {
      // For now, just create a new conversation
      // The backend will handle checking for existing conversations
      return await handleCreateConversation(params);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to get or create conversation';
      toast.error(message);
      throw error;
    }
  };

  // Get all conversations (both as renter and owner)
  const allConversations = [
    ...(renterConversations || []),
    ...(ownerConversations || []),
  ].sort((a, b) => b.lastMessageAt - a.lastMessageAt);

  return {
    renterConversations: renterConversations ?? [],
    ownerConversations: ownerConversations ?? [],
    allConversations,
    unreadCount: unreadCount ?? 0,
    createConversation,
    sendMessage,
    markConversationAsRead,
    markMessageAsRead,
    archiveConversation,
    deleteConversation: handleDeleteConversation,
    deleteMessage: handleDeleteMessage,
    getOrCreateConversation,
    getConversationByVehicle,
    getMessages,
  };
}
