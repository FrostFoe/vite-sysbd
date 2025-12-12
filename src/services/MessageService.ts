import type { Conversation, Message } from '../types';
import { API_BASE_URL } from '../lib/constants';
import { setupApiInterceptors } from '../lib/apiInterceptors';
import axios, { type AxiosInstance } from 'axios';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class MessageServiceClass {
  private api: AxiosInstance;
  private ws: WebSocket | null = null;
  private newMessageCallbacks: ((message: Message) => void)[] = [];
  private messageStatusCallbacks: ((messageId: number, status: 'sent' | 'delivered' | 'read') => void)[] = [];
  private pollingInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
    });
    setupApiInterceptors(this.api);
  }

  init() {
    this.connectWebSocket();
  }

  private connectWebSocket() {
    try {
      // Attempt to connect to WebSocket if available, otherwise fallback to polling
      // In a production environment, this would connect to a real WebSocket server

      // Start polling as a fallback for real-time updates
      this.startPolling();
    } catch (error) {
      console.warn('WebSocket connection failed, falling back to polling:', error);
      this.startPolling();
    }
  }

  private startPolling() {
    // Poll for new conversations every 30 seconds
    // This would be implemented in the MessageContext
  }

  private stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  disconnect() {
    this.stopPolling();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // WebSocket event listeners
  onNewMessage(callback: (message: Message) => void) {
    this.newMessageCallbacks.push(callback);
    return () => {
      this.newMessageCallbacks = this.newMessageCallbacks.filter(cb => cb !== callback);
    };
  }

  onMessageStatusUpdate(callback: (messageId: number, status: 'sent' | 'delivered' | 'read') => void) {
    this.messageStatusCallbacks.push(callback);
    return () => {
      this.messageStatusCallbacks = this.messageStatusCallbacks.filter(cb => cb !== callback);
    };
  }

  // API methods
  async getConversations(sort: string = 'latest'): Promise<ApiResponse<{ conversations: Conversation[]; count?: number }>> {
    try {
      const response = await this.api.get('/get_conversations.php', {
        params: { sort },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get conversations',
      };
    }
  }

  async getMessages(userId: number): Promise<ApiResponse<{ messages: Message[]; count?: number }>> {
    try {
      const response = await this.api.get('/get_messages.php', {
        params: { user_id: userId },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get messages',
      };
    }
  }

  async sendMessage(recipientId: number, content: string, type: 'text' | 'image' | 'file' = 'text'): Promise<ApiResponse<{ message_id?: number; timestamp?: string }>> {
    try {
      const response = await this.api.post('/send_message.php', {
        recipient_id: recipientId,
        content,
        type,
      });

      // In a real implementation, the server would broadcast the message via WebSocket
      // For now, we'll return the response and the UI will handle adding the message
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send message',
      };
    }
  }

  async markMessagesAsRead(userId: number): Promise<ApiResponse<void>> {
    try {
      await this.api.post('/mark_messages_read.php', {
        user_id: userId,
      });

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to mark messages as read',
      };
    }
  }
}

export const MessageService = new MessageServiceClass();