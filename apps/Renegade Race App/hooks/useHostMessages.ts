import { api } from '@renegade/convex/_generated/api';
import { Id } from '@renegade/convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { toast } from 'sonner-native';
import { useConvexAuth } from './useConvexAuth';

export function useHostMessages() {
  const { userId } = useConvexAuth();

  // Queries
  const hostConversations = useQuery(
    api.messages.getHostConversations,
    userId ? { hostId: userId } : 'skip',
  );

  const hostConversationsWithArchived = useQuery(
    api.messages.getHostConversations,
    userId ? { hostId: userId, includeArchived: true } : 'skip',
  );

  const hostMessageStats = useQuery(
    api.messages.getHostMessageStats,
    userId ? { hostId: userId } : 'skip',
  );

  const hostConversationAnalytics = useQuery(
    api.conversations.getHostConversationAnalytics,
    userId ? { hostId: userId } : 'skip',
  );

  // Mutations
  const bulkMarkAsRead = useMutation(
    api.messages.bulkMarkHostConversationsAsRead,
  );
  const bulkArchive = useMutation(api.messages.bulkArchiveHostConversations);
  const sendSystemMessage = useMutation(api.messages.sendHostSystemMessage);
  const bulkConversationActions = useMutation(
    api.conversations.bulkHostConversationActions,
  );

  // Helper functions
  const getConversationsByVehicle = useQuery(
    api.conversations.getHostConversationsByVehicle,
    'skip',
  );

  // Mutation handlers with error handling
  const handleBulkMarkAsRead = async (
    conversationIds?: Id<'conversations'>[],
  ) => {
    if (!userId) return;

    try {
      const result = await bulkMarkAsRead({
        hostId: userId,
        conversationIds,
      });
      toast.success(`Marked ${result.length} conversations as read`);
      return result;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to mark conversations as read';
      toast.error(message);
      throw error;
    }
  };

  const handleBulkArchive = async (conversationIds: Id<'conversations'>[]) => {
    if (!userId) return;

    try {
      const result = await bulkArchive({
        hostId: userId,
        conversationIds,
      });
      toast.success(`Archived ${result.length} conversations`);
      return result;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to archive conversations';
      toast.error(message);
      throw error;
    }
  };

  const handleSendSystemMessage = async (params: {
    conversationId: Id<'conversations'>;
    content: string;
  }) => {
    if (!userId) return;

    try {
      const result = await sendSystemMessage({
        conversationId: params.conversationId,
        content: params.content,
        hostId: userId,
      });
      toast.success('System message sent');
      return result;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to send system message';
      toast.error(message);
      throw error;
    }
  };

  const handleBulkConversationActions = async (params: {
    conversationIds: Id<'conversations'>[];
    action: 'archive' | 'unarchive' | 'mark_read' | 'delete';
  }) => {
    if (!userId) return;

    try {
      const result = await bulkConversationActions({
        hostId: userId,
        conversationIds: params.conversationIds,
        action: params.action,
      });

      const actionMessages = {
        archive: 'archived',
        unarchive: 'unarchived',
        mark_read: 'marked as read',
        delete: 'deleted',
      };

      toast.success(
        `${result.processedCount} conversations ${actionMessages[params.action]}`,
      );
      return result;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : `Failed to ${params.action} conversations`;
      toast.error(message);
      throw error;
    }
  };

  // Get conversations for a specific vehicle
  const getVehicleConversations = async (vehicleId: Id<'vehicles'>) => {
    if (!userId) return [];

    try {
      // This would need to be implemented as a separate query call
      // For now, we'll filter from existing conversations
      return (
        hostConversations?.filter((conv) => conv.vehicleId === vehicleId) || []
      );
    } catch (error) {
      console.error('Failed to get vehicle conversations:', error);
      return [];
    }
  };

  // Filter conversations by status
  const getActiveConversations = () => {
    return hostConversations?.filter((conv) => conv.isActive) || [];
  };

  const getArchivedConversations = () => {
    return (
      hostConversationsWithArchived?.filter((conv) => !conv.isActive) || []
    );
  };

  const getUnreadConversations = () => {
    return hostConversations?.filter((conv) => conv.unreadCountOwner > 0) || [];
  };

  // Get conversation by ID
  const getConversationById = (conversationId: Id<'conversations'>) => {
    return hostConversationsWithArchived?.find(
      (conv) => conv._id === conversationId,
    );
  };

  // Get conversations with unread messages
  const getConversationsWithUnreadMessages = () => {
    return hostConversations?.filter((conv) => conv.unreadCountOwner > 0) || [];
  };

  // Calculate response rate
  const getResponseRate = () => {
    if (!hostConversationAnalytics) return 0;

    const { responseCount, totalConversations } = hostConversationAnalytics;
    return totalConversations > 0
      ? Math.round((responseCount / totalConversations) * 100)
      : 0;
  };

  // Get average response time in a readable format
  const getAverageResponseTime = () => {
    if (!hostConversationAnalytics) return 'N/A';

    const { averageResponseTimeMinutes } = hostConversationAnalytics;

    if (averageResponseTimeMinutes === 0) return 'N/A';

    if (averageResponseTimeMinutes < 60) {
      return `${averageResponseTimeMinutes}m`;
    } else if (averageResponseTimeMinutes < 1440) {
      return `${Math.round(averageResponseTimeMinutes / 60)}h`;
    } else {
      return `${Math.round(averageResponseTimeMinutes / 1440)}d`;
    }
  };

  return {
    // Data
    hostConversations: hostConversations || [],
    hostConversationsWithArchived: hostConversationsWithArchived || [],
    hostMessageStats: hostMessageStats || {
      totalMessages: 0,
      unreadMessages: 0,
      activeConversations: 0,
      archivedConversations: 0,
      totalConversations: 0,
    },
    hostConversationAnalytics: hostConversationAnalytics || {
      totalConversations: 0,
      activeConversations: 0,
      archivedConversations: 0,
      averageResponseTimeMinutes: 0,
      responseCount: 0,
      timeRange: '30d',
    },

    // Filtered data
    activeConversations: getActiveConversations(),
    archivedConversations: getArchivedConversations(),
    unreadConversations: getUnreadConversations(),
    conversationsWithUnreadMessages: getConversationsWithUnreadMessages(),

    // Actions
    bulkMarkAsRead: handleBulkMarkAsRead,
    bulkArchive: handleBulkArchive,
    sendSystemMessage: handleSendSystemMessage,
    bulkConversationActions: handleBulkConversationActions,

    // Helper functions
    getVehicleConversations,
    getConversationById,
    getResponseRate,
    getAverageResponseTime,

    // Raw queries for custom usage
    getConversationsByVehicle,
  };
}
