import { api } from '@/lib/convex';
import { useUser } from '@clerk/clerk-react';
import { Id } from '@renegade/backend/convex/_generated/dataModel';
import { Button, Card, CardContent, CardHeader, Input } from '@renegade/ui';
import { useMutation, useQuery } from 'convex/react';
import {
  Archive,
  ArrowLeft,
  Copy,
  Edit,
  MessageSquare,
  MoreVertical,
  Reply,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

export default function ChatPage() {
  const { user, isSignedIn } = useUser();
  const { conversationId } = useParams<{ conversationId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [newMessage, setNewMessage] = useState('');
  const [hoveredMessage, setHoveredMessage] = useState<string | null>(null);

  // Edit message states
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editMessageContent, setEditMessageContent] = useState('');
  const [isEditingMessage, setIsEditingMessage] = useState(false);

  // Reply message states
  const [replyingToMessage, setReplyingToMessage] = useState<
    Id<'messages'> | undefined
  >(undefined);

  // Dialog states
  const [showDeleteMessageDialog, setShowDeleteMessageDialog] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [isDeletingMessage, setIsDeletingMessage] = useState(false);

  const [showDeleteConversationDialog, setShowDeleteConversationDialog] =
    useState(false);
  const [showArchiveConversationDialog, setShowArchiveConversationDialog] =
    useState(false);
  const [isDeletingConversation, setIsDeletingConversation] = useState(false);
  const [isArchivingConversation, setIsArchivingConversation] = useState(false);
  const [showConversationMenu, setShowConversationMenu] = useState(false);

  // Handle pending conversation from URL parameters
  const [pendingConversation, setPendingConversation] = useState<{
    vehicleId: string;
    renterId: string;
    ownerId: string;
  } | null>(null);

  useEffect(() => {
    const vehicleId = searchParams.get('vehicleId');
    const renterId = searchParams.get('renterId');
    const ownerId = searchParams.get('ownerId');

    if (vehicleId && renterId && ownerId && !conversationId) {
      setPendingConversation({ vehicleId, renterId, ownerId });
    }
  }, [searchParams, conversationId]);

  // Fetch conversation details
  const conversation = useQuery(
    api.conversations.getById,
    conversationId
      ? { conversationId: conversationId as Id<'conversations'> }
      : 'skip'
  );

  // Fetch messages for the conversation
  const messages = useQuery(
    api.messages.getByConversation,
    conversationId
      ? { conversationId: conversationId as Id<'conversations'> }
      : 'skip'
  );

  // Fetch participant details
  const otherUser = useQuery(
    api.users.getByExternalId,
    conversation && user?.id === conversation.renterId
      ? { externalId: conversation.ownerId }
      : conversation && user?.id === conversation.ownerId
        ? { externalId: conversation.renterId }
        : 'skip'
  );

  // Fetch vehicle details
  const vehicle = useQuery(
    api.vehicles.getById,
    conversation ? { id: conversation.vehicleId as Id<'vehicles'> } : 'skip'
  );

  // Fetch recipient user data for pending conversations
  const recipientUser = useQuery(
    api.users.getByExternalId,
    pendingConversation && user?.id === pendingConversation.renterId
      ? { externalId: pendingConversation.ownerId }
      : pendingConversation && user?.id === pendingConversation.ownerId
        ? { externalId: pendingConversation.renterId }
        : 'skip'
  );

  // Fetch vehicle data for pending conversations
  const pendingVehicle = useQuery(
    api.vehicles.getById,
    pendingConversation
      ? { id: pendingConversation.vehicleId as Id<'vehicles'> }
      : 'skip'
  );

  // Mutations
  const sendMessage = useMutation(api.messages.send);
  const deleteMessage = useMutation(api.messages.deleteMessage);
  const editMessage = useMutation(api.messages.editMessage);
  const deleteConversation = useMutation(api.conversations.deleteConversation);
  const archiveConversation = useMutation(api.conversations.archive);

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

  if (!conversationId) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <Card className='w-full max-w-md'>
          <CardContent className='p-6'>
            <div className='text-center'>
              <MessageSquare className='h-12 w-12 text-gray-400 mx-auto mb-4' />
              <h2 className='text-xl font-semibold text-gray-900 mb-2'>
                No conversation selected
              </h2>
              <p className='text-gray-600'>
                Please select a conversation to view messages.
              </p>
              <Button onClick={() => navigate('/messages')} className='mt-4'>
                Back to Messages
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (conversation === undefined || messages === undefined) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <Card className='w-full max-w-md'>
          <CardContent className='p-6'>
            <div className='text-center'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#EF1C25] mx-auto mb-4'></div>
              <p className='text-gray-600'>Loading conversation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <Card className='w-full max-w-md'>
          <CardContent className='p-6'>
            <div className='text-center'>
              <MessageSquare className='h-12 w-12 text-gray-400 mx-auto mb-4' />
              <h2 className='text-xl font-semibold text-gray-900 mb-2'>
                Conversation not found
              </h2>
              <p className='text-gray-600'>
                This conversation may have been deleted or you don't have access
                to it.
              </p>
              <Button onClick={() => navigate('/messages')} className='mt-4'>
                Back to Messages
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      if (conversationId) {
        // Send message to existing conversation
        await sendMessage({
          conversationId: conversationId as Id<'conversations'>,
          content: newMessage.trim(),
        });
      } else if (pendingConversation) {
        // Create conversation and send first message
        const result = await sendMessage({
          vehicleId: pendingConversation.vehicleId as Id<'vehicles'>,
          renterId: pendingConversation.renterId,
          ownerId: pendingConversation.ownerId,
          content: newMessage.trim(),
        });

        // Transition from pending to actual conversation
        if (result && result.conversationId) {
          setPendingConversation(null);
          // Update URL to reflect the new conversation
          navigate(`/chat/${result.conversationId}`, { replace: true });
        }
      } else {
        console.error('No conversation selected and no pending conversation');
        return;
      }
      setNewMessage('');
      setReplyingToMessage(undefined);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessageToDelete(messageId);
    setShowDeleteMessageDialog(true);
  };

  const confirmDeleteMessage = async () => {
    if (!messageToDelete) return;

    setIsDeletingMessage(true);
    try {
      await deleteMessage({ messageId: messageToDelete as Id<'messages'> });
      setShowDeleteMessageDialog(false);
      setMessageToDelete(null);
    } catch (error) {
      console.error('Failed to delete message:', error);
    } finally {
      setIsDeletingMessage(false);
    }
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleEditMessage = (messageId: string, currentContent: string) => {
    setEditingMessage(messageId);
    setEditMessageContent(currentContent);
  };

  const handleSaveEdit = async () => {
    if (!editingMessage || !editMessageContent.trim()) return;

    setIsEditingMessage(true);
    try {
      await editMessage({
        messageId: editingMessage as Id<'messages'>,
        content: editMessageContent.trim(),
      });
      setEditingMessage(null);
      setEditMessageContent('');
    } catch (error) {
      console.error('Failed to edit message:', error);
    } finally {
      setIsEditingMessage(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setEditMessageContent('');
  };

  const canEditMessage = (message: { senderId: string; createdAt: number }) => {
    if (message.senderId !== user?.id) return false;
    const editWindow = 15 * 60 * 1000; // 15 minutes
    const now = Date.now();
    return now - message.createdAt <= editWindow;
  };

  const handleReplyToMessage = (message: {
    _id: Id<'messages'>;
    content: string;
  }) => {
    setReplyingToMessage(message._id);
  };

  const handleCancelReply = () => {
    setReplyingToMessage(undefined);
  };

  const handleDeleteConversation = () => {
    setShowDeleteConversationDialog(true);
  };

  const confirmDeleteConversation = async () => {
    if (!conversationId) return;

    setIsDeletingConversation(true);
    try {
      await deleteConversation({
        conversationId: conversationId as Id<'conversations'>,
      });
      setShowDeleteConversationDialog(false);
      navigate('/messages');
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    } finally {
      setIsDeletingConversation(false);
    }
  };

  const handleArchiveConversation = () => {
    setShowArchiveConversationDialog(true);
  };

  const confirmArchiveConversation = async () => {
    if (!conversationId) return;

    setIsArchivingConversation(true);
    try {
      await archiveConversation({
        conversationId: conversationId as Id<'conversations'>,
      });
      setShowArchiveConversationDialog(false);
      navigate('/messages');
    } catch (error) {
      console.error('Failed to archive conversation:', error);
    } finally {
      setIsArchivingConversation(false);
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
      <div className='max-w-4xl mx-auto p-6'>
        <Card className='h-[calc(100vh-3rem)] flex flex-col'>
          {/* Header */}
          <CardHeader className='border-b'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-4'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => navigate('/messages')}
                >
                  <ArrowLeft className='h-4 w-4' />
                </Button>
                <div className='flex items-center space-x-3'>
                  <div className='w-10 h-10 rounded-full bg-[#EF1C25] flex items-center justify-center text-white font-medium'>
                    {(pendingConversation
                      ? recipientUser
                      : otherUser
                    )?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h2 className='font-semibold text-gray-900'>
                      {(pendingConversation ? recipientUser : otherUser)
                        ?.name || 'Unknown User'}
                    </h2>
                    <p className='text-sm text-gray-600'>
                      {(pendingConversation ? pendingVehicle : vehicle)
                        ? `${(pendingConversation ? pendingVehicle : vehicle)?.year} ${(pendingConversation ? pendingVehicle : vehicle)?.make} ${(pendingConversation ? pendingVehicle : vehicle)?.model}`
                        : 'Vehicle conversation'}
                    </p>
                  </div>
                </div>
              </div>
              <div className='relative'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setShowConversationMenu(!showConversationMenu)}
                >
                  <MoreVertical className='h-4 w-4' />
                </Button>

                {showConversationMenu && (
                  <div className='absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[160px]'>
                    <div className='py-1'>
                      <button
                        className='w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center'
                        onClick={handleArchiveConversation}
                      >
                        <Archive className='h-4 w-4 mr-2' />
                        Archive Conversation
                      </button>
                      <button
                        className='w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center'
                        onClick={handleDeleteConversation}
                      >
                        <Trash2 className='h-4 w-4 mr-2' />
                        Delete Conversation
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>

          {/* Messages */}
          <CardContent className='flex-1 overflow-y-auto p-4'>
            {pendingConversation ? (
              // Pending conversation - show recipient info
              <div className='flex items-center justify-center h-full'>
                <div className='text-center'>
                  <MessageSquare className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                  <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                    Start a conversation
                  </h3>
                  <p className='text-gray-600 text-sm mb-4'>
                    Send your first message to{' '}
                    {recipientUser?.name || 'this user'} about the{' '}
                    {pendingVehicle
                      ? `${pendingVehicle.year} ${pendingVehicle.make} ${pendingVehicle.model}`
                      : 'vehicle'}
                    .
                  </p>
                </div>
              </div>
            ) : messages && messages.length > 0 ? (
              <div className='space-y-4'>
                {messages.map(message => (
                  <div
                    key={message._id}
                    className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className='max-w-xs lg:max-w-md relative group'
                      onMouseEnter={() => setHoveredMessage(message._id)}
                      onMouseLeave={() => setHoveredMessage(null)}
                    >
                      {editingMessage === message._id ? (
                        <div
                          className={`rounded-lg p-3 ${
                            message.senderId === user.id
                              ? 'bg-[#EF1C25] text-white'
                              : 'bg-gray-200 text-gray-900'
                          }`}
                        >
                          <Input
                            value={editMessageContent}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) => setEditMessageContent(e.target.value)}
                            className='mb-2'
                            placeholder='Edit your message...'
                          />
                          <div className='flex gap-2'>
                            <Button
                              size='sm'
                              onClick={handleSaveEdit}
                              disabled={
                                isEditingMessage || !editMessageContent.trim()
                              }
                            >
                              {isEditingMessage ? 'Saving...' : 'Save'}
                            </Button>
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={handleCancelEdit}
                              disabled={isEditingMessage}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
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
                        </>
                      )}

                      {/* Message action menu */}
                      {message.senderId === user.id &&
                        hoveredMessage === message._id &&
                        editingMessage !== message._id && (
                          <div className='absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity'>
                            <div className='flex gap-1 bg-white border border-gray-200 rounded-lg shadow-lg p-1'>
                              <Button
                                size='sm'
                                variant='ghost'
                                className='h-6 w-6 p-0'
                                onClick={() =>
                                  handleCopyMessage(message.content)
                                }
                                title='Copy message'
                              >
                                <Copy className='h-3 w-3' />
                              </Button>
                              <Button
                                size='sm'
                                variant='ghost'
                                className='h-6 w-6 p-0'
                                onClick={() => handleReplyToMessage(message)}
                                title='Reply to message'
                              >
                                <Reply className='h-3 w-3' />
                              </Button>
                              {canEditMessage(message) && (
                                <Button
                                  size='sm'
                                  variant='ghost'
                                  className='h-6 w-6 p-0'
                                  onClick={() =>
                                    handleEditMessage(
                                      message._id,
                                      message.content
                                    )
                                  }
                                  title='Edit message'
                                >
                                  <Edit className='h-3 w-3' />
                                </Button>
                              )}
                              <Button
                                size='sm'
                                variant='destructive'
                                className='h-6 w-6 p-0'
                                onClick={() => handleDeleteMessage(message._id)}
                                title='Delete message'
                              >
                                <Trash2 className='h-3 w-3' />
                              </Button>
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
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
            )}
          </CardContent>

          {/* Message Input */}
          <div className='border-t p-4'>
            {/* Reply indicator */}
            {replyingToMessage && (
              <div className='mb-3 p-3 bg-gray-100 rounded-lg border-l-4 border-[#EF1C25]'>
                <div className='flex items-center justify-between'>
                  <div className='flex-1'>
                    <p className='text-xs text-gray-500 mb-1'>Replying to:</p>
                    <p className='text-sm text-gray-700 truncate'>
                      {messages.find(m => m._id === replyingToMessage)?.content}
                    </p>
                  </div>
                  <Button
                    size='sm'
                    variant='ghost'
                    onClick={handleCancelReply}
                    className='ml-2 h-6 w-6 p-0'
                  >
                    <X className='h-3 w-3' />
                  </Button>
                </div>
              </div>
            )}

            <div className='flex space-x-2'>
              <Input
                placeholder={
                  replyingToMessage ? 'Type your reply...' : 'Type a message...'
                }
                value={newMessage}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewMessage(e.target.value)
                }
                onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
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
        </Card>
      </div>

      {/* Confirmation Dialogs */}
      {showDeleteMessageDialog && (
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
          <div
            className='fixed inset-0 bg-black/80'
            onClick={() => setShowDeleteMessageDialog(false)}
          />
          <div className='relative bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg'>
            <h3 className='text-lg font-semibold mb-2'>Delete Message</h3>
            <p className='text-sm text-gray-600 mb-6'>
              Are you sure you want to delete this message? This action cannot
              be undone.
            </p>
            <div className='flex justify-end space-x-2'>
              <Button
                variant='outline'
                onClick={() => setShowDeleteMessageDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDeleteMessage}
                disabled={isDeletingMessage}
                className='bg-red-600 hover:bg-red-700'
              >
                {isDeletingMessage ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConversationDialog && (
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
          <div
            className='fixed inset-0 bg-black/80'
            onClick={() => setShowDeleteConversationDialog(false)}
          />
          <div className='relative bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg'>
            <h3 className='text-lg font-semibold mb-2'>Delete Conversation</h3>
            <p className='text-sm text-gray-600 mb-6'>
              Are you sure you want to delete this entire conversation? This
              action cannot be undone and will delete all messages for both
              participants.
            </p>
            <div className='flex justify-end space-x-2'>
              <Button
                variant='outline'
                onClick={() => setShowDeleteConversationDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDeleteConversation}
                disabled={isDeletingConversation}
                className='bg-red-600 hover:bg-red-700'
              >
                {isDeletingConversation ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showArchiveConversationDialog && (
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
          <div
            className='fixed inset-0 bg-black/80'
            onClick={() => setShowArchiveConversationDialog(false)}
          />
          <div className='relative bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg'>
            <h3 className='text-lg font-semibold mb-2'>Archive Conversation</h3>
            <p className='text-sm text-gray-600 mb-6'>
              Are you sure you want to archive this conversation? You can
              unarchive it later from your archived conversations.
            </p>
            <div className='flex justify-end space-x-2'>
              <Button
                variant='outline'
                onClick={() => setShowArchiveConversationDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmArchiveConversation}
                disabled={isArchivingConversation}
              >
                {isArchivingConversation ? 'Archiving...' : 'Archive'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
