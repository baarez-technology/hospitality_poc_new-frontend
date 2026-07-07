import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import initialInsights from '../data/aiInsights.json';

const AIInsightsContext = createContext(null);

// Helper to generate random timestamp
const getRandomTimestamp = () => {
  const options = ['Just now', '1 min ago', '2 min ago', '5 min ago', '10 min ago', '15 min ago', '30 min ago', '45 min ago', '1 hour ago'];
  return options[Math.floor(Math.random() * options.length)];
};

// Helper to regenerate insights with new timestamps
const regenerateInsights = (insights) => {
  return insights.map(insight => ({
    ...insight,
    timestamp: getRandomTimestamp(),
  }));
};

export function AIInsightsProvider({ children }) {
  const [insights, setInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial insights on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setInsights(initialInsights);
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Refresh insights with new timestamps
  const refreshInsights = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setInsights(prev => regenerateInsights(prev));
      setIsLoading(false);
    }, 800);
  }, []);

  // Add a new insight
  const addInsight = useCallback((insight) => {
    const newInsight = {
      ...insight,
      id: `i${Date.now()}`,
      timestamp: 'Just now',
    };
    setInsights(prev => [newInsight, ...prev]);
  }, []);

  // Remove an insight by ID
  const removeInsight = useCallback((id) => {
    setInsights(prev => prev.filter(insight => insight.id !== id));
  }, []);

  // Mark insight as read (could add a 'read' property)
  const markAsRead = useCallback((id) => {
    setInsights(prev =>
      prev.map(insight =>
        insight.id === id ? { ...insight, read: true } : insight
      )
    );
  }, []);

  const value = {
    insights,
    isLoading,
    refreshInsights,
    addInsight,
    removeInsight,
    markAsRead,
  };

  return (
    <AIInsightsContext.Provider value={value}>
      {children}
    </AIInsightsContext.Provider>
  );
}

export function useAIInsights() {
  const context = useContext(AIInsightsContext);
  if (!context) {
    throw new Error('useAIInsights must be used within an AIInsightsProvider');
  }
  return context;
}

export default AIInsightsContext;
