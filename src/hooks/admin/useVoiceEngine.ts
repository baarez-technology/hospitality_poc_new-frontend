/**
 * Voice Engine Hook
 * Handles voice-to-text and text-to-voice using Web Speech API
 */

import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * useVoiceEngine Hook
 * Provides voice recognition and speech synthesis
 */
export function useVoiceEngine() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef(null);
  const synthesisRef = useRef(null);

  // Check for Web Speech API support
  useEffect(() => {
    const hasRecognition = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    const hasSynthesis = 'speechSynthesis' in window;

    setIsSupported(hasRecognition && hasSynthesis);

    if (hasRecognition) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
    }

    if (hasSynthesis) {
      synthesisRef.current = window.speechSynthesis;
    }
  }, []);

  /**
   * Start listening for voice input
   */
  const startListening = useCallback((onTranscript) => {
    if (!isSupported || !recognitionRef.current) {
      // Simulate voice recognition for demo/testing
      setIsListening(true);
      setError(null);
      setTranscript('');

      // Simulate recognition after 2-4 seconds
      const delay = 2000 + Math.random() * 2000;
      setTimeout(() => {
        const sampleTranscripts = [
          "Show me all dirty rooms",
          "List VIP guests",
          "What's today's revenue?",
          "Assign Maria to room 305",
          "Show negative reviews"
        ];
        const randomTranscript = sampleTranscripts[Math.floor(Math.random() * sampleTranscripts.length)];
        setTranscript(randomTranscript);

        if (onTranscript) {
          onTranscript(randomTranscript);
        }
      }, delay);

      return;
    }

    try {
      setIsListening(true);
      setError(null);
      setTranscript('');

      recognitionRef.current.onresult = (event) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(transcriptText);

        // If final result, call callback
        if (event.results[current].isFinal) {
          if (onTranscript) {
            onTranscript(transcriptText);
          }
        }
      };

      recognitionRef.current.onerror = (event) => {
        setError(event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.start();
    } catch (err) {
      setError(err.message);
      setIsListening(false);
    }
  }, [isSupported]);

  /**
   * Stop listening
   */
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error('Error stopping recognition:', err);
      }
    }

    setIsListening(false);
  }, [isListening]);

  /**
   * Speak text using text-to-speech
   */
  const speak = useCallback((text, options = {}) => {
    if (!isSupported || !synthesisRef.current) {
      // Voice not supported, skip
      return;
    }

    try {
      // Cancel any ongoing speech
      synthesisRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options.rate || 1.0;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 1.0;
      utterance.lang = options.lang || 'en-US';

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = (event) => {
        setError(event.error);
        setIsSpeaking(false);
      };

      synthesisRef.current.speak(utterance);
    } catch (err) {
      setError(err.message);
      setIsSpeaking(false);
    }
  }, [isSupported]);

  /**
   * Stop speaking
   */
  const stopSpeaking = useCallback(() => {
    if (synthesisRef.current && isSpeaking) {
      synthesisRef.current.cancel();
      setIsSpeaking(false);
    }
  }, [isSpeaking]);

  /**
   * Toggle listening on/off
   */
  const toggleListening = useCallback((onTranscript) => {
    if (isListening) {
      stopListening();
    } else {
      startListening(onTranscript);
    }
  }, [isListening, startListening, stopListening]);

  /**
   * Get available voices
   */
  const getVoices = useCallback(() => {
    if (synthesisRef.current) {
      return synthesisRef.current.getVoices();
    }
    return [];
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Clear transcript
   */
  const clearTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    // State
    isListening,
    isSpeaking,
    transcript,
    error,
    isSupported,

    // Voice-to-Text
    startListening,
    stopListening,
    toggleListening,

    // Text-to-Voice
    speak,
    stopSpeaking,

    // Utilities
    getVoices,
    clearError,
    clearTranscript
  };
}
