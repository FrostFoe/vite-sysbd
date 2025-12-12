import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { Message, Conversation } from '../../types';
import { MessageService } from '../../services/MessageService';

interface MessageState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Record<number, Message[]>; // userId -> messages
  loading: {
    conversations: boolean;
    messages: Record<number, boolean>; // userId -> loading state
  };
  error: string | null;
  lastPoll: {
    conversations: number;
    messages: Record<number, number>; // userId -> timestamp
  };
}

type MessageAction =
  | { type: 'SET_CONVERSATIONS'; payload: Conversation[] }
  | { type: 'SET_ACTIVE_CONVERSATION'; payload: Conversation }
  | { type: 'SET_MESSAGES'; payload: { userId: number; messages: Message[] } }
  | { type: 'ADD_MESSAGE'; payload: { userId: number; message: Message } }
  | { type: 'UPDATE_MESSAGE_STATUS'; payload: { messageId: number; status: 'sent' | 'delivered' | 'read' } }
  | { type: 'SET_LOADING_CONVERSATIONS'; payload: boolean }
  | { type: 'SET_LOADING_MESSAGES'; payload: { userId: number; loading: boolean } }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: MessageState = {
  conversations: [],
  activeConversation: null,
  messages: {},
  loading: {
    conversations: false,
    messages: {},
  },
  error: null,
  lastPoll: {
    conversations: 0,
    messages: {},
  },
};

const messageReducer = (state: MessageState, action: MessageAction): MessageState => {
  switch (action.type) {
    case 'SET_CONVERSATIONS':
      return {
        ...state,
        conversations: action.payload,
        loading: { ...state.loading, conversations: false },
        lastPoll: {
          ...state.lastPoll,
          conversations: Date.now(),
        },
      };
    case 'SET_ACTIVE_CONVERSATION':
      return {
        ...state,
        activeConversation: action.payload,
      };
    case 'SET_MESSAGES':
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.userId]: action.payload.messages,
        },
        loading: {
          ...state.loading,
          messages: {
            ...state.loading.messages,
            [action.payload.userId]: false,
          },
        },
        lastPoll: {
          ...state.lastPoll,
          messages: {
            ...state.lastPoll.messages,
            [action.payload.userId]: Date.now(),
          },
        },
      };
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.userId]: [
            ...(state.messages[action.payload.userId] || []),
            action.payload.message,
          ],
        },
        conversations: state.conversations.map(conv =>
          conv.user_id === action.payload.userId
            ? {
                ...conv,
                last_message: action.payload.message.content,
                last_message_time: action.payload.message.created_at,
              }
            : conv
        ),
      };
    case 'UPDATE_MESSAGE_STATUS':
      return {
        ...state,
        messages: Object.fromEntries(
          Object.entries(state.messages).map(([userId, userMessages]) => [
            userId,
            userMessages.map(msg =>
              msg.id === action.payload.messageId
                ? { ...msg, status: action.payload.status }
                : msg
            )
          ])
        ),
      };
    case 'SET_LOADING_CONVERSATIONS':
      return {
        ...state,
        loading: { ...state.loading, conversations: action.payload },
      };
    case 'SET_LOADING_MESSAGES':
      return {
        ...state,
        loading: {
          ...state.loading,
          messages: {
            ...state.loading.messages,
            [action.payload.userId]: action.payload.loading,
          },
        },
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
};

interface MessageContextType {
  state: MessageState;
  loadConversations: (sort?: string) => Promise<void>;
  loadMessages: (userId: number) => Promise<void>;
  sendMessage: (recipientId: number, content: string, type?: 'text' | 'image' | 'file') => Promise<void>;
  setActiveConversation: (conversation: Conversation) => void;
  markMessagesAsRead: (userId: number) => Promise<void>;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(messageReducer, initialState);

  // Initialize MessageService and polling
  useEffect(() => {
    MessageService.init();

    // Set up WebSocket event listeners
    MessageService.onNewMessage((message) => {
      dispatch({
        type: 'ADD_MESSAGE',
        payload: { userId: message.sender_id === state.activeConversation?.user_id ? message.sender_id : message.recipient_id, message },
      });
    });

    MessageService.onMessageStatusUpdate((messageId, status) => {
      dispatch({
        type: 'UPDATE_MESSAGE_STATUS',
        payload: { messageId, status },
      });
    });

    return () => {
      MessageService.disconnect();
    };
  }, [state.activeConversation?.user_id]);

  const loadConversations = useCallback(async (sort: string = 'latest') => {
    dispatch({ type: 'SET_LOADING_CONVERSATIONS', payload: true });

    try {
      const response = await MessageService.getConversations(sort);
      if (response.success && response.data?.conversations) {
        dispatch({ type: 'SET_CONVERSATIONS', payload: response.data.conversations });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load conversations';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  }, []);

  const loadMessages = useCallback(async (userId: number) => {
    dispatch({ type: 'SET_LOADING_MESSAGES', payload: { userId, loading: true } });

    try {
      const response = await MessageService.getMessages(userId);
      if (response.success && response.data?.messages) {
        dispatch({ type: 'SET_MESSAGES', payload: { userId, messages: response.data.messages } });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load messages';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  }, []);

  const sendMessage = useCallback(async (recipientId: number, content: string, type: 'text' | 'image' | 'file' = 'text') => {
    try {
      const response = await MessageService.sendMessage(recipientId, content, type);
      if (response.success) {
        // The message will be added via WebSocket event
        return; // Return void to match interface
      }
      throw new Error(response.error || 'Failed to send message');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, []);

  const markMessagesAsRead = useCallback(async (userId: number) => {
    try {
      await MessageService.markMessagesAsRead(userId);
      // Update conversation unread count
      dispatch({
        type: 'SET_CONVERSATIONS',
        payload: state.conversations.map(conv =>
          conv.user_id === userId
            ? { ...conv, unread_count: 0 }
            : conv
        ),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to mark messages as read';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  }, [state.conversations]);

  const setActiveConversation = useCallback((conversation: Conversation) => {
    dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: conversation });
  }, []);

  // Poll for new conversations periodically
  useEffect(() => {
    const pollConversations = async () => {
      // Only poll if it's been at least 30 seconds since last poll
      if (Date.now() - state.lastPoll.conversations >= 30000) {
        await loadConversations();
      }
    };

    const conversationsInterval = setInterval(pollConversations, 30000);
    return () => clearInterval(conversationsInterval);
  }, [loadConversations, state.lastPoll.conversations]);

  // Poll for new messages for active conversation
  useEffect(() => {
    if (!state.activeConversation?.user_id) return;

    const pollMessages = async () => {
      const userId = state.activeConversation!.user_id;
      const lastPollTime = state.lastPoll.messages[userId] || 0;

      // Only poll if it's been at least 5 seconds since last poll
      if (Date.now() - lastPollTime >= 5000) {
        await loadMessages(userId);
      }
    };

    const messagesInterval = setInterval(pollMessages, 5000);
    return () => clearInterval(messagesInterval);
  }, [state.activeConversation?.user_id, state.lastPoll.messages, loadMessages]);

  const value = {
    state,
    loadConversations,
    loadMessages,
    sendMessage,
    setActiveConversation,
    markMessagesAsRead,
  };

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessage = (): MessageContextType => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
};