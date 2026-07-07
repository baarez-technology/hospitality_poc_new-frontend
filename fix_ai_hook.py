import re

# Read the file
with open('E:/Glimmora_Updated/Frontend/src/hooks/admin/useAIAssistant.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: Update addUserMessage to capture pending action
old_add_user = '''  // Add user message to conversation
  const addUserMessage = useCallback(async (text: string) => {
    if (!text || text.trim().length === 0) return;

    const userMessage: AIMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'user',
      text: text.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);

    // Clear any pending action when user sends a new message
    setPendingAction(null);

    // Trigger AI response
    setIsTyping(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Use backend AI or local AI based on toggle
    if (useBackendAI) {
      await generateBackendAIResponse(text.trim());
    } else {
      typingTimeoutRef.current = setTimeout(async () => {
        await generateAIResponse(text.trim());
      }, 800 + Math.random() * 400);
    }
  }, [useBackendAI]);'''

new_add_user = '''  // Add user message to conversation
  const addUserMessage = useCallback(async (text: string) => {
    if (!text || text.trim().length === 0) return;

    const userMessage: AIMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'user',
      text: text.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);

    // Capture the current pending action BEFORE clearing it
    // This allows the backend to know what action we're potentially confirming
    const currentPendingAction = pendingAction;

    // Clear pending action state (backend will tell us if there's a new one)
    setPendingAction(null);

    // Trigger AI response
    setIsTyping(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Use backend AI or local AI based on toggle
    if (useBackendAI) {
      await generateBackendAIResponse(text.trim(), currentPendingAction);
    } else {
      typingTimeoutRef.current = setTimeout(async () => {
        await generateAIResponse(text.trim());
      }, 800 + Math.random() * 400);
    }
  }, [useBackendAI, pendingAction]);'''

content = content.replace(old_add_user, new_add_user)

# Fix 2: Update generateBackendAIResponse to accept pending action
old_generate = '''  // Generate AI response using Backend Admin AI
  const generateBackendAIResponse = useCallback(async (userText: string) => {
    try {
      const response = await adminAIService.chat({
        message: userText,
        session_id: sessionId,
        context: {
          previousMessages: messages.slice(-5).map(m => ({
            role: m.type === 'user' ? 'user' : 'assistant',
            content: m.text
          }))
        }
      });'''

new_generate = '''  // Generate AI response using Backend Admin AI
  const generateBackendAIResponse = useCallback(async (userText: string, currentPendingAction?: PendingAction | null) => {
    try {
      const response = await adminAIService.chat({
        message: userText,
        session_id: sessionId,
        context: {
          previousMessages: messages.slice(-5).map(m => ({
            role: m.type === 'user' ? 'user' : 'assistant',
            content: m.text
          })),
          // Include pending action so backend can handle confirmations
          pendingAction: currentPendingAction ? {
            action_id: currentPendingAction.action_id,
            action_type: currentPendingAction.action_type,
            description: currentPendingAction.description,
            params: currentPendingAction.params
          } : undefined
        }
      });'''

content = content.replace(old_generate, new_generate)

# Write back
with open('E:/Glimmora_Updated/Frontend/src/hooks/admin/useAIAssistant.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("File updated successfully!")
