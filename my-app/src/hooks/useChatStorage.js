import { useEffect, useCallback } from 'react';

const CHAT_STORAGE_KEY = 'ai_assistant_chat_history';
const MAX_CONVERSATIONS = 20; // Store up to 20 conversations

export const useChatStorage = () => {
  /**
   * Save messages to local storage
   * @param {Array} messages - Array of message objects
   * @param {string} conversationId - Unique ID for this conversation
   */
  const saveMessages = useCallback((messages, conversationId = 'current') => {
    try {
      const allConversations = getAllConversations();
      
      // Save current conversation
      allConversations[conversationId] = {
        id: conversationId,
        messages: messages,
        timestamp: new Date().toISOString(),
        messageCount: messages.length,
      };

      // Keep only the most recent MAX_CONVERSATIONS
      const sortedConversations = Object.entries(allConversations)
        .sort((a, b) => new Date(b[1].timestamp) - new Date(a[1].timestamp))
        .slice(0, MAX_CONVERSATIONS);

      const limitedConversations = Object.fromEntries(sortedConversations);
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(limitedConversations));
      
      return true;
    } catch (error) {
      console.error('Error saving chat to local storage:', error);
      return false;
    }
  }, []);

  /**
   * Load messages from local storage
   * @param {string} conversationId - Unique ID for the conversation to load
   * @returns {Array} Array of message objects or null if not found
   */
  const loadMessages = useCallback((conversationId = 'current') => {
    try {
      const allConversations = getAllConversations();
      const conversation = allConversations[conversationId];
      
      if (conversation && conversation.messages) {
        return conversation.messages;
      }
      return null;
    } catch (error) {
      console.error('Error loading chat from local storage:', error);
      return null;
    }
  }, []);

  /**
   * Get all saved conversations
   * @returns {Object} Object with conversation IDs as keys
   */
  const getAllConversations = useCallback(() => {
    try {
      const data = localStorage.getItem(CHAT_STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error reading conversations from local storage:', error);
      return {};
    }
  }, []);

  /**
   * Get list of all conversation summaries
   * @returns {Array} Array of conversation summaries
   */
  const getConversationList = useCallback(() => {
    try {
      const allConversations = getAllConversations();
      return Object.values(allConversations)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .map(conv => ({
          id: conv.id,
          timestamp: conv.timestamp,
          messageCount: conv.messageCount,
          preview: conv.messages?.[0]?.text?.substring(0, 50) || 'Empty conversation',
          date: new Date(conv.timestamp).toLocaleDateString(),
          time: new Date(conv.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
        }));
    } catch (error) {
      console.error('Error getting conversation list:', error);
      return [];
    }
  }, []);

  /**
   * Delete a specific conversation
   * @param {string} conversationId - ID of conversation to delete
   */
  const deleteConversation = useCallback((conversationId) => {
    try {
      const allConversations = getAllConversations();
      delete allConversations[conversationId];
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(allConversations));
      return true;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return false;
    }
  }, []);

  /**
   * Clear all conversations
   */
  const clearAllConversations = useCallback(() => {
    try {
      localStorage.removeItem(CHAT_STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing all conversations:', error);
      return false;
    }
  }, []);

  /**
   * Export conversations as JSON
   * @returns {string} JSON string of all conversations
   */
  const exportConversations = useCallback(() => {
    try {
      const allConversations = getAllConversations();
      return JSON.stringify(allConversations, null, 2);
    } catch (error) {
      console.error('Error exporting conversations:', error);
      return null;
    }
  }, []);

  /**
   * Import conversations from JSON
   * @param {string} jsonData - JSON string to import
   */
  const importConversations = useCallback((jsonData) => {
    try {
      const parsed = JSON.parse(jsonData);
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(parsed));
      return true;
    } catch (error) {
      console.error('Error importing conversations:', error);
      return false;
    }
  }, []);

  /**
   * Get storage size info
   * @returns {Object} Object with storage info
   */
  const getStorageInfo = useCallback(() => {
    try {
      const data = localStorage.getItem(CHAT_STORAGE_KEY);
      const dataSize = data ? new Blob([data]).size : 0;
      const allConversations = getAllConversations();
      
      return {
        totalConversations: Object.keys(allConversations).length,
        sizeInBytes: dataSize,
        sizeInKB: (dataSize / 1024).toFixed(2),
        maxConversations: MAX_CONVERSATIONS,
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return {
        totalConversations: 0,
        sizeInBytes: 0,
        sizeInKB: 0,
        maxConversations: MAX_CONVERSATIONS,
      };
    }
  }, []);

  return {
    saveMessages,
    loadMessages,
    getAllConversations,
    getConversationList,
    deleteConversation,
    clearAllConversations,
    exportConversations,
    importConversations,
    getStorageInfo,
  };
};

export default useChatStorage;
