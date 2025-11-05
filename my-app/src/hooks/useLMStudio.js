import { useState, useCallback } from 'react';

export const useLMStudio = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);

  const getLMStudioResponse = useCallback(
    async (userMessage, apiUrl, model, options = {}) => {
      if (!apiUrl) {
        setError('LM Studio API URL is not configured');
        throw new Error('LM Studio API URL is not configured. Please set REACT_APP_LMSTUDIO_API_URL in .env');
      }

      if (!model) {
        setError('LM Studio model is not configured');
        throw new Error('LM Studio model is not configured. Please set REACT_APP_LMSTUDIO_MODEL in .env');
      }

      setIsLoading(true);
      setError(null);

      try {
        // LM Studio uses OpenAI-compatible API
        const requestBody = {
          model: model,
          messages: [
            {
              role: 'user',
              content: userMessage,
            },
          ],
          temperature: options.temperature || 0.7,
          top_p: options.topP || 0.95,
          max_tokens: options.maxTokens || 1024,
          stream: false,
        };

        const response = await fetch(`${apiUrl}/v1/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMessage = data.error?.message || data.message || `API Error: ${response.status}`;
          throw new Error(errorMessage);
        }

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
          console.error('Unexpected API response format:', data);
          throw new Error('Unexpected response format from LM Studio');
        }

        const aiMessage = data.choices[0].message.content;

        // Add to conversation history
        setConversationHistory((prev) => [
          ...prev,
          { user: userMessage, ai: aiMessage },
        ]);

        setIsLoading(false);
        return aiMessage;
      } catch (err) {
        setError(err.message);
        setIsLoading(false);

        if (err instanceof TypeError) {
          throw new Error(`Cannot connect to LM Studio on ${apiUrl}. Make sure LM Studio is running and the URL is correct.`);
        } else if (err.message.includes('API URL')) {
          throw new Error('LM Studio API URL error: Please verify your configuration.');
        } else {
          throw err;
        }
      }
    },
    []
  );

  return {
    getLMStudioResponse,
    isLoading,
    error,
    conversationHistory,
  };
};

export default useLMStudio;
