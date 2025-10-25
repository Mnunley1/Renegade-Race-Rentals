import { api } from '@/lib/convex';
import { useUser } from '@clerk/clerk-react';
import { Id } from '@renegade/backend/convex/_generated/dataModel';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
} from '@renegade/ui';
import { useMutation, useQuery } from 'convex/react';
import { MessageSquare, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function MessagesPage() {
  const { user, isSignedIn } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Bulk operations states
  const [selectedConversations, setSelectedConversations] = useState<string[]>(
    []
  );
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false);

  // Handle query parameters - redirect to chat page if needed
  useEffect(() => {
    const conversationId = searchParams.get('conversationId');
    const vehicleId = searchParams.get('vehicleId');
    const renterId = searchParams.get('renterId');
    const ownerId = searchParams.get('ownerId');

    if (conversationId) {
      // If there's a conversationId, navigate to the chat page
      navigate(`/chat/${conversationId}`, { replace: true });
    } else if (vehicleId && renterId && ownerId) {
      // If there are pending conversation parameters, navigate to chat page
      navigate(
        `/chat?vehicleId=${vehicleId}&renterId=${renterId}&ownerId=${ownerId}`,
        { replace: true }
      );
    }
  }, [searchParams, navigate]);

  // Fetch user's conversations
  const renterConversations = useQuery(api.conversations.getByUser, {
    userId: user?.id || '',
    role: 'renter',
  });

  const ownerConversations = useQuery(api.conversations.getByUser, {
    userId: user?.id || '',
    role: 'owner',
  });

  // Combine conversations
  const conversations = [
    ...(renterConversations || []),
    ...(ownerConversations || []),
  ].sort((a, b) => b.lastMessageAt - a.lastMessageAt);

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conversation => {
    if (!searchQuery.trim()) return true;

    const otherUser =
      user?.id === conversation.renterId
        ? conversation.owner
        : conversation.renter;

    const searchLower = searchQuery.toLowerCase();
    return (
      otherUser?.name?.toLowerCase().includes(searchLower) ||
      conversation.vehicle?.make?.toLowerCase().includes(searchLower) ||
      conversation.vehicle?.model?.toLowerCase().includes(searchLower) ||
      conversation.lastMessageText?.toLowerCase().includes(searchLower)
    );
  });

  // Mutations
  const bulkConversationActions = useMutation(
    api.conversations.bulkHostConversationActions
  );

  if (!isSignedIn || !user) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <Card className='w-full max-w-md'>
          <CardContent className='p-6'>
            <div className='text-center'>
              <MessageSquare className='h-12 w-12 text-gray-400 mx-auto mb-4' />
              <h2 className='text-xl font-semibold text-gray-900 mb-2'>
                Please sign in
              </h2>
              <p className='text-gray-600'>
                You need to be signed in to view conversations.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Bulk operations handlers
  const handleBulkSelect = (conversationId: string) => {
    setSelectedConversations(prev =>
      prev.includes(conversationId)
        ? prev.filter(id => id !== conversationId)
        : [...prev, conversationId]
    );
  };

  const handleSelectAll = () => {
    if (selectedConversations.length === conversations.length) {
      setSelectedConversations([]);
    } else {
      setSelectedConversations(conversations.map(c => c._id));
    }
  };

  const handleBulkArchive = async () => {
    if (selectedConversations.length === 0) return;

    setIsPerformingBulkAction(true);
    try {
      await bulkConversationActions({
        hostId: user?.id || '',
        conversationIds: selectedConversations.map(
          id => id as Id<'conversations'>
        ),
        action: 'archive',
      });
      setSelectedConversations([]);
      setIsBulkMode(false);
    } catch (error) {
      console.error('Failed to archive conversations:', error);
    } finally {
      setIsPerformingBulkAction(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedConversations.length === 0) return;

    setIsPerformingBulkAction(true);
    try {
      await bulkConversationActions({
        hostId: user?.id || '',
        conversationIds: selectedConversations.map(
          id => id as Id<'conversations'>
        ),
        action: 'delete',
      });
      setSelectedConversations([]);
      setIsBulkMode(false);
    } catch (error) {
      console.error('Failed to delete conversations:', error);
    } finally {
      setIsPerformingBulkAction(false);
    }
  };

  const handleBulkMarkRead = async () => {
    if (selectedConversations.length === 0) return;

    setIsPerformingBulkAction(true);
    try {
      await bulkConversationActions({
        hostId: user?.id || '',
        conversationIds: selectedConversations.map(
          id => id as Id<'conversations'>
        ),
        action: 'mark_read',
      });
      setSelectedConversations([]);
      setIsBulkMode(false);
    } catch (error) {
      console.error('Failed to mark conversations as read:', error);
    } finally {
      setIsPerformingBulkAction(false);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60)
      );
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-6xl mx-auto p-6'>
        <div className='mb-6'>
          <h1 className='text-3xl font-bold text-gray-900'>Messages</h1>
          <p className='text-gray-600 mt-2'>
            Manage your conversations and stay connected with other users.
          </p>
        </div>

        <Card className='h-[calc(100vh-200px)]'>
          <CardHeader>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <CardTitle>Conversations</CardTitle>
                <div className='flex gap-2'>
                  {isBulkMode ? (
                    <>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => {
                          setIsBulkMode(false);
                          setSelectedConversations([]);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button size='sm' onClick={handleSelectAll}>
                        {selectedConversations.length === conversations.length
                          ? 'Deselect All'
                          : 'Select All'}
                      </Button>
                    </>
                  ) : (
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => setIsBulkMode(true)}
                    >
                      Select
                    </Button>
                  )}
                </div>
              </div>

              {/* Bulk actions bar */}
              {isBulkMode && selectedConversations.length > 0 && (
                <div className='flex items-center gap-2 p-3 bg-gray-100 rounded-lg'>
                  <span className='text-sm text-gray-600'>
                    {selectedConversations.length} selected
                  </span>
                  <div className='flex gap-1'>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={handleBulkMarkRead}
                      disabled={isPerformingBulkAction}
                    >
                      Mark Read
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={handleBulkArchive}
                      disabled={isPerformingBulkAction}
                    >
                      Archive
                    </Button>
                    <Button
                      size='sm'
                      variant='destructive'
                      onClick={handleBulkDelete}
                      disabled={isPerformingBulkAction}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              )}

              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                <Input
                  placeholder='Search conversations...'
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchQuery(e.target.value)
                  }
                  className='pl-10'
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className='p-0'>
            {conversations === undefined ? (
              // Loading state
              <div className='space-y-3 p-4'>
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className='flex items-center space-x-3 p-3 rounded-lg bg-gray-100 animate-pulse'
                  >
                    <div className='w-12 h-12 rounded-full bg-gray-200'></div>
                    <div className='flex-1 space-y-2'>
                      <div className='h-4 bg-gray-200 rounded w-3/4'></div>
                      <div className='h-3 bg-gray-200 rounded w-1/2'></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              // Empty state
              <div className='flex items-center justify-center h-64'>
                <div className='text-center'>
                  <MessageSquare className='h-16 w-16 text-gray-400 mx-auto mb-4' />
                  <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                    {searchQuery
                      ? 'No conversations found'
                      : 'No conversations yet'}
                  </h3>
                  <p className='text-gray-600 text-sm'>
                    {searchQuery
                      ? 'Try a different search term.'
                      : 'Start a conversation by booking a vehicle or listing one.'}
                  </p>
                </div>
              </div>
            ) : (
              // Conversations list
              <div className='space-y-1'>
                {filteredConversations.map(conversation => {
                  // Determine the other user (if current user is renter, show owner; if owner, show renter)
                  const otherUser =
                    user?.id === conversation.renterId
                      ? conversation.owner
                      : conversation.renter;

                  return (
                    <div
                      key={conversation._id}
                      className={`w-full text-left hover:bg-gray-50 transition-colors ${
                        isBulkMode ? 'flex items-center space-x-3 p-4' : 'p-4'
                      }`}
                    >
                      {isBulkMode && (
                        <input
                          type='checkbox'
                          checked={selectedConversations.includes(
                            conversation._id
                          )}
                          onChange={() => handleBulkSelect(conversation._id)}
                          className='w-4 h-4 text-[#EF1C25] border-gray-300 rounded focus:ring-[#EF1C25] flex-shrink-0'
                        />
                      )}
                      <button
                        onClick={() =>
                          !isBulkMode && navigate(`/chat/${conversation._id}`)
                        }
                        className={`w-full text-left ${isBulkMode ? 'pointer-events-none' : ''}`}
                      >
                        <div className='flex items-start space-x-3'>
                          <div className='w-12 h-12 rounded-full bg-[#EF1C25] flex items-center justify-center text-white font-medium flex-shrink-0'>
                            {otherUser?.name?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div className='flex-1 min-w-0'>
                            <div className='flex items-start justify-between mb-1'>
                              <h4 className='font-semibold text-gray-900 truncate text-sm'>
                                {otherUser?.name || 'Unknown User'}
                              </h4>
                              <div className='flex items-center space-x-2 flex-shrink-0 ml-2'>
                                <span className='text-xs text-gray-500'>
                                  {formatTime(conversation.lastMessageAt)}
                                </span>
                                {(user?.id === conversation.renterId
                                  ? conversation.unreadCountRenter
                                  : conversation.unreadCountOwner) > 0 && (
                                  <Badge className='bg-[#EF1C25] text-white text-xs px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center'>
                                    {user?.id === conversation.renterId
                                      ? conversation.unreadCountRenter
                                      : conversation.unreadCountOwner}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <p className='text-xs text-gray-600 truncate mb-1'>
                              {conversation.vehicle
                                ? `${conversation.vehicle.year} ${conversation.vehicle.make} ${conversation.vehicle.model}`
                                : 'Vehicle conversation'}
                            </p>
                            <p
                              className={`text-xs truncate ${
                                (user?.id === conversation.renterId
                                  ? conversation.unreadCountRenter
                                  : conversation.unreadCountOwner) > 0
                                  ? 'text-gray-900 font-medium'
                                  : 'text-gray-500'
                              }`}
                            >
                              {conversation.lastMessageText ||
                                'No messages yet'}
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
