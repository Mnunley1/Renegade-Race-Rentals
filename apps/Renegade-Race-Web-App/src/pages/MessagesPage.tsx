import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useUser } from '@clerk/clerk-react';
import { api } from '@/lib/convex';
import { useMutation, useQuery } from 'convex/react';
import {
  ArrowLeft,
  MessageSquare,
  MoreVertical,
  Search,
  Send,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

export default function MessagesPage() {
  const { user, isSignedIn } = useUser();
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams] = useSearchParams();

  // Handle conversationId query parameter
  useEffect(() => {
    const conversationId = searchParams.get('conversationId');
    if (conversationId) {
      setSelectedConversation(conversationId);
    }
  }, [searchParams]);

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

  // Fetch messages for selected conversation
  const messages = useQuery(
    api.messages.getByConversation,
    selectedConversation
      ? { conversationId: selectedConversation as any }
      : 'skip'
  );

  // Send message mutation
  const sendMessage = useMutation(api.messages.send);

  if (!isSignedIn || !user) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <Card className='w-full max-w-md'>
          <CardContent className='p-8 text-center'>
            <MessageSquare className='h-16 w-16 text-gray-400 mx-auto mb-4' />
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>
              Sign In Required
            </h2>
            <p className='text-gray-600 mb-6'>
              Please sign in to view your messages.
            </p>
            <div className='space-y-3'>
              <Button asChild className='w-full'>
                <Link to='/sign-in'>Sign In</Link>
              </Button>
              <Button asChild variant='outline' className='w-full'>
                <Link to='/sign-up'>Create Account</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await sendMessage({
        conversationId: selectedConversation as any,
        content: newMessage.trim(),
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
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

  const selectedConversationData = conversations?.find(
    conv => conv._id === selectedConversation
  );

  // Filter conversations based on search
  const filteredConversations =
    conversations?.filter(conversation => {
      if (!searchQuery) return true;
      const searchLower = searchQuery.toLowerCase();

      // Determine the other user (if current user is renter, show owner; if owner, show renter)
      const otherUser =
        user?.id === conversation.renterId
          ? conversation.owner
          : conversation.renter;

      return (
        otherUser?.name?.toLowerCase().includes(searchLower) ||
        conversation.vehicle?.make?.toLowerCase().includes(searchLower) ||
        conversation.vehicle?.model?.toLowerCase().includes(searchLower) ||
        conversation.lastMessageText?.toLowerCase().includes(searchLower)
      );
    }) || [];

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container px-4 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center space-x-4 mb-6'>
            <Button asChild variant='ghost' size='sm'>
              <Link to='/dashboard' className='flex items-center'>
                <ArrowLeft className='h-4 w-4 mr-2' />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          <div className='flex items-center space-x-3'>
            <MessageSquare className='h-8 w-8 text-[#EF1C25]' />
            <h1 className='text-3xl font-bold text-gray-900'>Messages</h1>
          </div>
          <p className='text-gray-600 mt-2'>
            Communicate with vehicle owners and renters.
          </p>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]'>
          {/* Conversations List */}
          <div className='lg:col-span-1'>
            <Card className='h-full'>
              <CardHeader>
                <div className='space-y-4'>
                  <CardTitle>Conversations</CardTitle>
                  <div className='relative'>
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                    <Input
                      placeholder='Search conversations...'
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
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
                  <div className='p-8 text-center'>
                    <MessageSquare className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                    <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                      {searchQuery
                        ? 'No conversations found'
                        : 'No messages yet'}
                    </h3>
                    <p className='text-gray-600 text-sm'>
                      {searchQuery
                        ? 'Try a different search term.'
                        : 'Start a conversation by booking a vehicle or listing one.'}
                    </p>
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
                        <button
                          key={conversation._id}
                          onClick={() =>
                            setSelectedConversation(conversation._id)
                          }
                          className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                            selectedConversation === conversation._id
                              ? 'bg-[#EF1C25]/5 border-r-2 border-[#EF1C25]'
                              : ''
                          }`}
                        >
                          <div className='flex items-center space-x-3'>
                            <div className='w-12 h-12 rounded-full bg-[#EF1C25] flex items-center justify-center text-white font-medium'>
                              {otherUser?.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className='flex-1 min-w-0'>
                              <div className='flex items-center justify-between'>
                                <h4 className='font-semibold text-gray-900 truncate'>
                                  {otherUser?.name || 'Unknown User'}
                                </h4>
                                <span className='text-xs text-gray-500'>
                                  {formatTime(conversation.lastMessageAt)}
                                </span>
                              </div>
                              <p className='text-sm text-gray-600 truncate'>
                                {conversation.vehicle
                                  ? `${conversation.vehicle.year} ${conversation.vehicle.make} ${conversation.vehicle.model}`
                                  : 'Vehicle conversation'}
                              </p>
                              <p className='text-xs text-gray-500 truncate'>
                                {conversation.lastMessageText ||
                                  'No messages yet'}
                              </p>
                            </div>
                            {(user?.id === conversation.renterId
                              ? conversation.unreadCountRenter
                              : conversation.unreadCountOwner) > 0 && (
                              <Badge className='bg-[#EF1C25] text-white text-xs'>
                                {user?.id === conversation.renterId
                                  ? conversation.unreadCountRenter
                                  : conversation.unreadCountOwner}
                              </Badge>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Messages Area */}
          <div className='lg:col-span-2'>
            <Card className='h-full flex flex-col'>
              {selectedConversation ? (
                <>
                  {/* Messages Header */}
                  <CardHeader className='border-b'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center space-x-3'>
                        <div className='w-10 h-10 rounded-full bg-[#EF1C25] flex items-center justify-center text-white font-medium'>
                          {(() => {
                            const otherUser =
                              user?.id === selectedConversationData?.renterId
                                ? selectedConversationData?.owner
                                : selectedConversationData?.renter;
                            return otherUser?.name?.[0]?.toUpperCase() || 'U';
                          })()}
                        </div>
                        <div>
                          <h3 className='font-semibold text-gray-900'>
                            {(() => {
                              const otherUser =
                                user?.id === selectedConversationData?.renterId
                                  ? selectedConversationData?.owner
                                  : selectedConversationData?.renter;
                              return otherUser?.name || 'Unknown User';
                            })()}
                          </h3>
                          <p className='text-sm text-gray-600'>
                            {selectedConversationData?.vehicle
                              ? `${selectedConversationData.vehicle.year} ${selectedConversationData.vehicle.make} ${selectedConversationData.vehicle.model}`
                              : 'Vehicle conversation'}
                          </p>
                        </div>
                      </div>
                      <Button variant='ghost' size='sm'>
                        <MoreVertical className='h-4 w-4' />
                      </Button>
                    </div>
                  </CardHeader>

                  {/* Messages List */}
                  <CardContent className='flex-1 overflow-y-auto p-4'>
                    {messages === undefined ? (
                      // Loading state
                      <div className='space-y-4'>
                        {Array.from({ length: 3 }).map((_, index) => (
                          <div
                            key={index}
                            className={`flex ${index % 2 === 0 ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className='max-w-xs lg:max-w-md'>
                              <div className='bg-gray-200 rounded-lg p-3 animate-pulse'>
                                <div className='h-4 bg-gray-300 rounded w-3/4 mb-2'></div>
                                <div className='h-3 bg-gray-300 rounded w-1/2'></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : messages.length === 0 ? (
                      // Empty state
                      <div className='flex items-center justify-center h-full'>
                        <div className='text-center'>
                          <MessageSquare className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                          <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                            No messages yet
                          </h3>
                          <p className='text-gray-600 text-sm'>
                            Start the conversation by sending a message.
                          </p>
                        </div>
                      </div>
                    ) : (
                      // Messages
                      <div className='space-y-4'>
                        {messages.map(message => (
                          <div
                            key={message._id}
                            className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className='max-w-xs lg:max-w-md'>
                              <div
                                className={`rounded-lg p-3 ${
                                  message.senderId === user.id
                                    ? 'bg-[#EF1C25] text-white'
                                    : 'bg-gray-200 text-gray-900'
                                }`}
                              >
                                <p className='text-sm'>{message.content}</p>
                              </div>
                              <p className='text-xs text-gray-500 mt-1 px-1'>
                                {formatTime(message.createdAt)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>

                  {/* Message Input */}
                  <div className='border-t p-4'>
                    <div className='flex space-x-2'>
                      <Input
                        placeholder='Type a message...'
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        onKeyPress={e => {
                          if (e.key === 'Enter') {
                            handleSendMessage();
                          }
                        }}
                        className='flex-1'
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        size='sm'
                      >
                        <Send className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                // No conversation selected
                <div className='flex items-center justify-center h-full'>
                  <div className='text-center'>
                    <MessageSquare className='h-16 w-16 text-gray-400 mx-auto mb-4' />
                    <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                      Select a conversation
                    </h3>
                    <p className='text-gray-600'>
                      Choose a conversation from the list to start messaging.
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
