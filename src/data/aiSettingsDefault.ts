/**
 * AI Settings Default
 * Default configuration for Glimmora AI Assistant
 */

export const defaultAISettings = {
  voiceEnabled: true,
  autoSuggestionsEnabled: true,
  executeActions: false,
  replyStyle: 'professional', // 'professional' | 'friendly' | 'short' | 'detailed'
  modules: {
    housekeeping: true,
    crm: true,
    revenue: true,
    reputation: true,
    bookings: true
  },
  permissions: {
    viewData: true,
    executeCommands: false,
    modifySettings: false
  }
};

export const replyStyleOptions = [
  {
    value: 'professional',
    label: 'Professional',
    description: 'Formal and detailed responses'
  },
  {
    value: 'friendly',
    label: 'Friendly',
    description: 'Casual and approachable tone'
  },
  {
    value: 'short',
    label: 'Short',
    description: 'Brief and concise answers'
  },
  {
    value: 'detailed',
    label: 'Detailed',
    description: 'Comprehensive explanations'
  }
];
