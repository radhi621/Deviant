import { useState, useCallback } from 'react';

export const useGeminiAPI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);

  const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
  const GEMINI_MODEL = process.env.REACT_APP_GEMINI_MODEL || 'gemini-2.5-flash';
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const getAIResponse = useCallback(
    async (userMessage) => {
      if (!GEMINI_API_KEY) {
        setError('API Key is not configured');
        throw new Error('API Key is not configured. Please set REACT_APP_GEMINI_API_KEY in .env');
      }

      setIsLoading(true);
      setError(null);

      try {
        const requestBody = {
          contents: [
            {
              parts: [
                {
                  text: userMessage,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        };

        const response = await fetch(GEMINI_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMessage = data.error?.message || `API Error: ${response.status}`;
          throw new Error(errorMessage);
        }

        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
          throw new Error('Unexpected response format from API');
        }

        const aiMessage = data.candidates[0].content.parts[0].text;

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

        if (err.message.includes('fetch')) {
          throw new Error('Network error: Unable to reach the API. Please check your internet connection.');
        } else if (err.message.includes('API_KEY')) {
          throw new Error('API Key error: Please verify your API key is correct.');
        } else {
          throw err;
        }
      }
    },
    [GEMINI_API_KEY, GEMINI_API_URL]
  );

  return {
    getAIResponse,
    isLoading,
    error,
    conversationHistory,
  };
};
