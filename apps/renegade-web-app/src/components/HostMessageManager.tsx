import { api, Id } from '@/lib/convex';
import { useUser } from '@clerk/clerk-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@renegade/ui';
import { useMutation, useQuery } from 'convex/react';
import {
  Archive,
  ArchiveRestore,
  CheckCircle,
  Clock,
  MessageSquare,
  MoreVertical,
  Search,
  Send,
  Trash2,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useState } from 'react';

interface HostMessageManagerProps {
  onConversationSelect?: (conversationId: Id<'conversations'>) => void;
}

export default function HostMessageManager({
  onConversationSelect,
}: HostMessageManagerProps) {
  const { user, isSignedIn } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversations, setSelectedConversations] = useState<
    Id<'conversations'>[]
  >([]);
  const [showArchived, setShowArchived] = useState(false);
  const [showSystemMessageModal, setShowSystemMessageModal] = useState(false);
  const [systemMessageContent, setSystemMessageContent] = useState('');
  const [
    selectedConversationForSystemMessage,
    setSelectedConversationForSystemMessage,
  ] = useState<Id<'conversations'> | null>(null);

  // Queries
  const hostConversations = useQuery(
    api.messages.getHostConversations,
    user?.id ? { hostId: user.id } : 'skip'
  );

  const hostConversationsWithArchived = useQuery(
    api.messages.getHostConversations,
    user?.id ? { hostId: user.id, includeArchived: true } : 'skip'
  );

  const hostMessageStats = useQuery(
    api.messages.getHostMessageStats,
    user?.id ? { hostId: user.id } : 'skip'
  );

  const hostConversationAnalytics = useQuery(
    api.conversations.getHostConversationAnalytics,
    user?.id ? { hostId: user.id } : 'skip'
  );

  // Mutations
  const _bulkMarkAsRead = useMutation(
    api.messages.bulkMarkHostConversationsAsRead
  );
  const _bulkArchive = useMutation(api.messages.bulkArchiveHostConversations);
  const sendSystemMessage = useMutation(api.messages.sendHostSystemMessage);
  const bulkConversationActions = useMutation(
    api.conversations.bulkHostConversationActions
  );

  if (!isSignedIn || !user) {
    return (
      <div className='container px-4 py-8'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>
            Please sign in to manage messages
          </h1>
        </div>
      </div>
    );
  }

  // Filter conversations based on search and archive status
  const getFilteredConversations = () => {
    const conversations = showArchived
      ? hostConversationsWithArchived
      : hostConversations;

    if (!conversations) return [];
    if (!searchQuery) return conversations;

    return conversations.filter(
      conv =>
        conv.renter?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.vehicle?.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.vehicle?.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.lastMessageText?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredConversations = getFilteredConversations();

  const handleConversationSelect = (conversationId: Id<'conversations'>) => {
    if (onConversationSelect) {
      onConversationSelect(conversationId);
    }
  };

  const handleConversationCheckbox = (conversationId: Id<'conversations'>) => {
    if (selectedConversations.includes(conversationId)) {
      setSelectedConversations(prev =>
        prev.filter(id => id !== conversationId)
      );
    } else {
      setSelectedConversations(prev => [...prev, conversationId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedConversations.length === filteredConversations.length) {
      setSelectedConversations([]);
    } else {
      setSelectedConversations(filteredConversations.map(conv => conv._id));
    }
  };

  const handleBulkAction = async (
    action: 'archive' | 'unarchive' | 'mark_read' | 'delete'
  ) => {
    if (selectedConversations.length === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to ${action.replace('_', ' ')} ${selectedConversations.length} conversation(s)?`
    );

    if (!confirmed) return;

    try {
      await bulkConversationActions({
        hostId: user.id,
        conversationIds: selectedConversations,
        action,
      });
      setSelectedConversations([]);
    } catch (error) {
      console.error(`Failed to ${action} conversations:`, error);
    }
  };

  const handleSendSystemMessage = async () => {
    if (!selectedConversationForSystemMessage || !systemMessageContent.trim())
      return;

    try {
      await sendSystemMessage({
        conversationId: selectedConversationForSystemMessage,
        content: systemMessageContent.trim(),
        hostId: user.id,
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

  const getResponseRate = () => {
    if (!hostConversationAnalytics) return 0;

    const { responseCount, totalConversations } = hostConversationAnalytics;
    return totalConversations > 0
      ? Math.round((responseCount / totalConversations) * 100)
      : 0;
  };

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

  return (
    <div className='container px-4 py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>
          Message Management
        </h1>
        <p className='text-gray-600'>Manage conversations with renters</p>
      </div>

      {/* Analytics Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center'>
              <div className='p-2 bg-blue-100 rounded-lg mr-4'>
                <MessageSquare className='h-6 w-6 text-blue-600' />
              </div>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  Total Conversations
                </p>
                <p className='text-2xl font-bold text-gray-900'>
                  {hostMessageStats?.totalConversations || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center'>
              <div className='p-2 bg-red-100 rounded-lg mr-4'>
                <MessageSquare className='h-6 w-6 text-red-600' />
              </div>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  Unread Messages
                </p>
                <p className='text-2xl font-bold text-gray-900'>
                  {hostMessageStats?.unreadMessages || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center'>
              <div className='p-2 bg-green-100 rounded-lg mr-4'>
                <TrendingUp className='h-6 w-6 text-green-600' />
              </div>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  Response Rate
                </p>
                <p className='text-2xl font-bold text-gray-900'>
                  {getResponseRate()}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center'>
              <div className='p-2 bg-yellow-100 rounded-lg mr-4'>
                <Clock className='h-6 w-6 text-yellow-600' />
              </div>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  Avg Response Time
                </p>
                <p className='text-2xl font-bold text-gray-900'>
                  {getAverageResponseTime()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Conversations List */}
        <div className='lg:col-span-2'>
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle>Conversations</CardTitle>
                <Tabs
                  value={showArchived ? 'archived' : 'active'}
                  onValueChange={value => setShowArchived(value === 'archived')}
                >
                  <TabsList>
                    <TabsTrigger value='active'>Active</TabsTrigger>
                    <TabsTrigger value='archived'>Archived</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Search and Bulk Actions */}
              <div className='flex items-center gap-4 mt-4'>
                <div className='relative flex-1'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                  <Input
                    placeholder='Search conversations...'
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className='pl-10'
                  />
                </div>

                {selectedConversations.length > 0 && (
                  <div className='flex items-center gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleBulkAction('mark_read')}
                    >
                      <CheckCircle className='h-4 w-4 mr-2' />
                      Mark Read
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() =>
                        handleBulkAction(showArchived ? 'unarchive' : 'archive')
                      }
                    >
                      {showArchived ? (
                        <ArchiveRestore className='h-4 w-4 mr-2' />
                      ) : (
                        <Archive className='h-4 w-4 mr-2' />
                      )}
                      {showArchived ? 'Unarchive' : 'Archive'}
                    </Button>
                    <Button
                      variant='destructive'
                      size='sm'
                      onClick={() => handleBulkAction('delete')}
                    >
                      <Trash2 className='h-4 w-4 mr-2' />
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent>
              {filteredConversations.length === 0 ? (
                <div className='text-center py-12'>
                  <MessageSquare className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                  <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                    No conversations found
                  </h3>
                  <p className='text-gray-600 text-sm'>
                    {searchQuery
                      ? 'Try adjusting your search terms'
                      : 'Start by listing a vehicle to receive messages'}
                  </p>
                </div>
              ) : (
                <div className='space-y-2'>
                  {/* Select All */}
                  <div className='flex items-center p-3 border rounded-lg bg-gray-50'>
                    <input
                      type='checkbox'
                      checked={
                        selectedConversations.length ===
                          filteredConversations.length &&
                        filteredConversations.length > 0
                      }
                      onChange={handleSelectAll}
                      className='mr-3'
                    />
                    <span className='text-sm font-medium text-gray-700'>
                      Select All ({filteredConversations.length})
                    </span>
                  </div>

                  {/* Conversations */}
                  {filteredConversations.map(conversation => {
                    const hasUnread = conversation.unreadCountOwner > 0;
                    const isSelected = selectedConversations.includes(
                      conversation._id
                    );

                    return (
                      <div
                        key={conversation._id}
                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-blue-50 border-blue-200'
                            : 'hover:bg-gray-50'
                        } ${hasUnread ? 'border-l-4 border-l-red-500' : ''}`}
                        onClick={() =>
                          handleConversationSelect(conversation._id)
                        }
                      >
                        <input
                          type='checkbox'
                          checked={isSelected}
                          onChange={e => {
                            e.stopPropagation();
                            handleConversationCheckbox(conversation._id);
                          }}
                          className='mr-3'
                        />

                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center justify-between mb-1'>
                            <h4
                              className={`text-sm font-medium ${hasUnread ? 'font-bold' : ''}`}
                            >
                              {conversation.renter?.name || 'Unknown User'}
                            </h4>
                            <span className='text-xs text-gray-500'>
                              {formatTime(conversation.lastMessageAt)}
                            </span>
                          </div>

                          <p className='text-sm text-gray-600 mb-1'>
                            {conversation.vehicle?.make}{' '}
                            {conversation.vehicle?.model}
                          </p>

                          <p
                            className={`text-sm truncate ${hasUnread ? 'font-medium' : 'text-gray-500'}`}
                          >
                            {conversation.lastMessageText || 'No messages yet'}
                          </p>
                        </div>

                        <div className='flex items-center gap-2 ml-4'>
                          {hasUnread && (
                            <Badge variant='destructive' className='text-xs'>
                              {conversation.unreadCountOwner}
                            </Badge>
                          )}

                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={e => {
                              e.stopPropagation();
                              setSelectedConversationForSystemMessage(
                                conversation._id
                              );
                              setShowSystemMessageModal(true);
                            }}
                          >
                            <MoreVertical className='h-4 w-4' />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Sidebar */}
        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <Button
                className='w-full'
                onClick={() => handleBulkAction('mark_read')}
                disabled={selectedConversations.length === 0}
              >
                <CheckCircle className='h-4 w-4 mr-2' />
                Mark All as Read
              </Button>

              <Button
                variant='outline'
                className='w-full'
                onClick={() => setShowSystemMessageModal(true)}
              >
                <Send className='h-4 w-4 mr-2' />
                Send System Message
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {filteredConversations.slice(0, 5).map(conversation => (
                  <div
                    key={conversation._id}
                    className='flex items-center space-x-3'
                  >
                    <div className='w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center'>
                      <Users className='h-4 w-4 text-gray-600' />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-gray-900 truncate'>
                        {conversation.renter?.name}
                      </p>
                      <p className='text-xs text-gray-500'>
                        {formatTime(conversation.lastMessageAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* System Message Modal */}
      {showSystemMessageModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 w-full max-w-md mx-4'>
            <h3 className='text-lg font-semibold mb-4'>Send System Message</h3>

            <textarea
              className='w-full p-3 border border-gray-300 rounded-lg resize-none h-32'
              placeholder='Enter your system message...'
              value={systemMessageContent}
              onChange={e => setSystemMessageContent(e.target.value)}
            />

            <div className='flex justify-end gap-3 mt-4'>
              <Button
                variant='outline'
                onClick={() => {
                  setShowSystemMessageModal(false);
                  setSystemMessageContent('');
                  setSelectedConversationForSystemMessage(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendSystemMessage}
                disabled={!systemMessageContent.trim()}
              >
                Send Message
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
