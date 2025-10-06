# Host Message Management System

This document outlines the comprehensive host message management functionality implemented using the existing Convex backend functions and logic.

## Overview

The host message management system provides vehicle owners (hosts) with powerful tools to manage their conversations with renters efficiently. It includes bulk operations, analytics, system messaging, and comprehensive conversation management.

## Backend Functions (Convex)

### New Message Functions (`messages.ts`)

#### `getHostConversations`

- **Purpose**: Get all conversations for a host with detailed information
- **Parameters**:
  - `hostId`: string - The host's user ID
  - `includeArchived`: boolean (optional) - Whether to include archived conversations
- **Returns**: Array of conversations with vehicle, renter, and latest message details

#### `getHostMessageStats`

- **Purpose**: Get comprehensive message statistics for a host
- **Parameters**: `hostId`: string
- **Returns**: Object with total messages, unread messages, active/archived conversation counts

#### `bulkMarkHostConversationsAsRead`

- **Purpose**: Mark multiple conversations as read for a host
- **Parameters**:
  - `hostId`: string
  - `conversationIds`: array of conversation IDs (optional - if not provided, marks all)
- **Returns**: Array of updated conversation IDs

#### `bulkArchiveHostConversations`

- **Purpose**: Archive multiple conversations for a host
- **Parameters**:
  - `hostId`: string
  - `conversationIds`: array of conversation IDs
- **Returns**: Array of archived conversation IDs

#### `sendHostSystemMessage`

- **Purpose**: Send system messages as a host (for automated responses)
- **Parameters**:
  - `conversationId`: conversation ID
  - `content`: message content
  - `hostId`: host user ID
- **Returns**: Message ID

### New Conversation Functions (`conversations.ts`)

#### `getHostConversationsByVehicle`

- **Purpose**: Get conversations for a specific vehicle
- **Parameters**:
  - `hostId`: string
  - `vehicleId`: vehicle ID
- **Returns**: Array of conversations for the specified vehicle

#### `getHostConversationAnalytics`

- **Purpose**: Get detailed analytics for host conversations
- **Parameters**:
  - `hostId`: string
  - `timeRange`: '7d' | '30d' | '90d' | '1y' (optional, defaults to '30d')
- **Returns**: Analytics object with response times, conversation counts, etc.

#### `bulkHostConversationActions`

- **Purpose**: Perform bulk actions on multiple conversations
- **Parameters**:
  - `hostId`: string
  - `conversationIds`: array of conversation IDs
  - `action`: 'archive' | 'unarchive' | 'mark_read' | 'delete'
- **Returns**: Result object with processed count and conversation IDs

## Frontend Implementation

### React Hook: `useHostMessages`

The `useHostMessages` hook provides a comprehensive interface for host message management:

```typescript
const {
  // Data
  hostConversations,
  hostMessageStats,
  hostConversationAnalytics,

  // Filtered data
  activeConversations,
  archivedConversations,
  unreadConversations,

  // Actions
  bulkMarkAsRead,
  bulkArchive,
  sendSystemMessage,
  bulkConversationActions,

  // Helper functions
  getVehicleConversations,
  getConversationById,
  getResponseRate,
  getAverageResponseTime,
} = useHostMessages();
```

### Mobile Component: `HostMessageManager`

A comprehensive React Native component for mobile host message management:

**Features:**

- Conversation list with search functionality
- Bulk selection and actions
- Analytics dashboard
- System message sending
- Archive/unarchive management
- Real-time unread counts

**Usage:**

```tsx
import HostMessageManager from '../components/HostMessageManager';

<HostMessageManager
  onConversationSelect={conversationId => {
    // Handle conversation selection
  }}
  showArchived={false}
/>;
```

### Web Component: `HostMessageManager`

A responsive web component for desktop host message management:

**Features:**

- Grid-based layout with analytics cards
- Tabbed interface for active/archived conversations
- Bulk operations with confirmation dialogs
- System message modal
- Quick actions sidebar
- Recent activity feed

**Usage:**

```tsx
import HostMessageManager from '@/components/HostMessageManager';

<HostMessageManager
  onConversationSelect={conversationId => {
    // Handle conversation selection
  }}
/>;
```

## Key Features

### 1. Bulk Operations

- **Mark as Read**: Mark multiple conversations as read
- **Archive/Unarchive**: Bulk archive or restore conversations
- **Delete**: Permanently delete conversations and all messages
- **Select All**: Quick selection of all visible conversations

### 2. Analytics Dashboard

- **Total Conversations**: Count of all conversations
- **Unread Messages**: Count of unread messages
- **Response Rate**: Percentage of messages responded to
- **Average Response Time**: Time taken to respond to messages

### 3. System Messaging

- Send automated system messages to renters
- Useful for booking confirmations, updates, etc.
- Messages are marked as 'system' type

### 4. Conversation Management

- **Search**: Search by renter name, vehicle, or message content
- **Filtering**: Filter by active/archived status
- **Sorting**: Sort by last message time
- **Unread Indicators**: Visual indicators for unread conversations

### 5. Real-time Updates

- All data updates in real-time using Convex subscriptions
- Unread counts update automatically
- New messages appear instantly

## Integration Examples

### Adding to Host Dashboard

```tsx
// In host dashboard component
import HostMessageManager from '../components/HostMessageManager';

export default function HostDashboard() {
  return (
    <View>
      {/* Other dashboard content */}
      <HostMessageManager
        onConversationSelect={conversationId => {
          // Navigate to chat screen
          router.push(`/messages/chat?id=${conversationId}`);
        }}
      />
    </View>
  );
}
```

### Custom Analytics Usage

```tsx
const { hostConversationAnalytics, getResponseRate } = useHostMessages();

// Display custom analytics
<div>
  <h3>Response Rate: {getResponseRate()}%</h3>
  <p>Total Conversations: {hostConversationAnalytics.totalConversations}</p>
</div>;
```

### Bulk Operations

```tsx
const { bulkConversationActions } = useHostMessages();

// Archive selected conversations
const handleArchive = async () => {
  await bulkConversationActions({
    conversationIds: selectedIds,
    action: 'archive',
  });
};
```

## Security & Authorization

All host-specific functions include proper authorization checks:

1. **Authentication Required**: All functions require user authentication
2. **Host Verification**: Functions verify the user is the owner of the conversations
3. **Permission Checks**: Users can only perform actions on their own conversations
4. **Data Validation**: All inputs are validated using Convex's validation system

## Performance Considerations

- **Indexed Queries**: All database queries use proper indexes for optimal performance
- **Pagination**: Large conversation lists can be paginated
- **Efficient Updates**: Bulk operations minimize database round trips
- **Real-time Subscriptions**: Only subscribe to necessary data

## Error Handling

The system includes comprehensive error handling:

- **Toast Notifications**: User-friendly error messages
- **Graceful Degradation**: Fallbacks for failed operations
- **Retry Logic**: Automatic retries for transient failures
- **Logging**: Detailed error logging for debugging

## Future Enhancements

Potential future improvements:

1. **Message Templates**: Pre-defined message templates for common responses
2. **Auto-responses**: Automated responses based on keywords
3. **Message Scheduling**: Schedule messages to be sent later
4. **Advanced Analytics**: More detailed conversation analytics
5. **Export Functionality**: Export conversation data
6. **Message Search**: Full-text search across all messages
7. **Notification Settings**: Customizable notification preferences

## Conclusion

The host message management system provides a comprehensive solution for vehicle owners to efficiently manage their conversations with renters. It leverages the existing Convex backend infrastructure while adding powerful new features specifically designed for host workflows.

The implementation follows the established patterns in the codebase and maintains consistency with the existing messaging system while providing enhanced functionality for hosts.
