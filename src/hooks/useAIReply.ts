import { useCallback } from 'react';

/**
 * AI Auto-Reply Hook
 * Generate AI-powered review responses
 */
export function useAIReply() {
  /**
   * Generate reply based on review sentiment
   */
  const generateReply = useCallback((review) => {
    const guestFirstName = review.guestName.split(' ')[0];
    const sentiment = review.computedSentiment?.label || review.sentiment || 'Neutral';
    const rating = review.rating;
    const platform = review.platform;

    // Extract key topics from keywords
    const topics = review.keywords || [];
    const mainTopic = topics.length > 0 ? topics[0] : 'your stay';

    let reply = '';

    // Positive reviews (4-5 stars)
    if (rating >= 4 || sentiment.toLowerCase() === 'positive') {
      const positiveTemplates = [
        `Dear ${guestFirstName},\n\nThank you so much for your wonderful ${rating}-star review! We're absolutely delighted to hear that you enjoyed ${mainTopic} at Terra Suites.\n\nYour kind words truly make our day and inspire our team to continue delivering exceptional experiences. We can't wait to welcome you back for another memorable stay!\n\nWarm regards,\nTerra Suites Management Team`,

        `Dear ${guestFirstName},\n\nWhat a joy to read your fantastic review! We're thrilled that ${mainTopic} exceeded your expectations during your recent visit.\n\nThank you for taking the time to share your experience. We look forward to the pleasure of hosting you again soon!\n\nBest wishes,\nTerra Suites Management`,

        `Dear ${guestFirstName},\n\nThank you for the glowing ${rating}-star review! We're so pleased that you had a wonderful experience with us, especially regarding ${mainTopic}.\n\nWe truly appreciate your kind feedback and hope to see you again very soon!\n\nSincerely,\nTerra Suites Team`
      ];

      reply = positiveTemplates[Math.floor(Math.random() * positiveTemplates.length)];
    }
    // Negative reviews (1-2 stars)
    else if (rating <= 2 || sentiment.toLowerCase() === 'negative') {
      const negativeTemplates = [
        `Dear ${guestFirstName},\n\nThank you for taking the time to share your candid feedback. We sincerely apologize that your experience did not meet your expectations, particularly regarding ${mainTopic}.\n\nYour concerns are being addressed immediately with our team, and we're committed to making the necessary improvements. We would appreciate the opportunity to make this right and discuss how we can enhance your next visit.\n\nPlease don't hesitate to contact me directly at manager@terrasuites.com.\n\nSincerely,\nTerra Suites Management`,

        `Dear ${guestFirstName},\n\nWe genuinely appreciate your honest feedback and deeply regret that we fell short of providing the exceptional experience you deserved, especially with ${mainTopic}.\n\nYour comments have been shared with our entire team, and we're taking immediate action to address these issues. We would be grateful for the chance to regain your trust on a future stay.\n\nPlease reach out to us directly so we can discuss this further.\n\nWith sincere apologies,\nTerra Suites Team`,

        `Dear ${guestFirstName},\n\nThank you for bringing these concerns to our attention. We're truly sorry that ${mainTopic} did not meet your standards during your stay.\n\nWe take your feedback very seriously and are implementing changes to ensure this doesn't happen again. We hope you'll give us another opportunity to provide you with the outstanding service Terra Suites is known for.\n\nPlease contact our management team directly at your convenience.\n\nBest regards,\nTerra Suites Management`
      ];

      reply = negativeTemplates[Math.floor(Math.random() * negativeTemplates.length)];
    }
    // Neutral reviews (3 stars)
    else {
      const neutralTemplates = [
        `Dear ${guestFirstName},\n\nThank you for your ${rating}-star review and for choosing Terra Suites for your stay. We appreciate your feedback regarding ${mainTopic}.\n\nWe're constantly working to improve our services, and your input helps us identify areas where we can do better. We hope to have the opportunity to exceed your expectations on your next visit.\n\nThank you again for staying with us.\n\nBest regards,\nTerra Suites Team`,

        `Dear ${guestFirstName},\n\nWe appreciate you taking the time to review your recent stay with us. Your comments about ${mainTopic} have been noted and will help us enhance our guest experience.\n\nWe value your business and would welcome the chance to provide you with an even better stay in the future.\n\nWarm regards,\nTerra Suites Management`,

        `Dear ${guestFirstName},\n\nThank you for your feedback on your recent visit. We're glad we could serve you, and we've taken note of your comments regarding ${mainTopic}.\n\nWe're always striving to improve, and we hope to impress you even more on your next stay with Terra Suites.\n\nSincerely,\nTerra Suites Team`
      ];

      reply = neutralTemplates[Math.floor(Math.random() * neutralTemplates.length)];
    }

    return reply;
  }, []);

  /**
   * Generate reply with custom tone
   */
  const generateCustomReply = useCallback((review, tone = 'professional') => {
    const baseReply = generateReply(review);

    // Tone variations
    switch (tone) {
      case 'friendly':
        return baseReply.replace('Dear', 'Hello').replace('Sincerely', 'Cheers');

      case 'formal':
        return baseReply.replace('Thank you', 'We thank you');

      case 'apologetic':
        if (review.rating <= 3) {
          return baseReply.replace('We apologize', 'We deeply apologize');
        }
        return baseReply;

      default:
        return baseReply;
    }
  }, [generateReply]);

  /**
   * Generate quick reply (short version)
   */
  const generateQuickReply = useCallback((review) => {
    const guestFirstName = review.guestName.split(' ')[0];
    const rating = review.rating;

    if (rating >= 4) {
      return `Thank you for the wonderful review, ${guestFirstName}! We're so glad you enjoyed your stay and look forward to welcoming you back!`;
    } else if (rating <= 2) {
      return `We sincerely apologize for not meeting your expectations, ${guestFirstName}. Please contact us directly so we can make this right. Thank you for your feedback.`;
    } else {
      return `Thank you for your feedback, ${guestFirstName}. We appreciate your input and hope to serve you better next time!`;
    }
  }, []);

  return {
    generateReply,
    generateCustomReply,
    generateQuickReply
  };
}
