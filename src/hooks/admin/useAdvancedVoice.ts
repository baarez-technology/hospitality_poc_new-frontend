/**
 * Advanced Voice System Hook for Admin AI Assistant
 * Features:
 * - Real-time speech recognition using Web Speech API (like Siri/Google Assistant)
 * - Automatic fallback to Whisper for noisy environments or unsupported browsers
 * - Continuous listening mode with voice activity detection
 * - Noise level monitoring
 * - Auto-send when speech ends
 *
 * Uses adminAIService for Whisper transcription (admin-authenticated endpoint)
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { adminAIService } from '@/api/services/admin-ai.service';

// Types
export interface VoiceState {
  isListening: boolean;
  isProcessing: boolean;
  transcript: string;
  interimTranscript: string;
  confidence: number;
  noiseLevel: number;
  error: string | null;
  mode: 'idle' | 'listening' | 'processing' | 'speaking';
  useWhisper: boolean; // Whether using Whisper fallback
  isSpeechSupported: boolean;
}

export interface VoiceActions {
  startListening: () => Promise<void>;
  stopListening: () => void;
  toggleListening: () => Promise<void>;
  cancelListening: () => void;
  setUseWhisper: (use: boolean) => void;
  forceWhisperMode: () => void;
}

export interface UseAdvancedVoiceOptions {
  onTranscript?: (text: string, isFinal: boolean) => void;
  onSpeechEnd?: (finalText: string) => Promise<void>;
  autoSend?: boolean;
  silenceTimeout?: number; // ms of silence before auto-sending
  language?: string;
  continuous?: boolean;
  noiseThreshold?: number; // 0-1, above this uses Whisper
}

// Check if Web Speech API is supported
const isSpeechRecognitionSupported = (): boolean => {
  return !!(
    typeof window !== 'undefined' &&
    (window.SpeechRecognition || (window as any).webkitSpeechRecognition)
  );
};

// Get SpeechRecognition constructor
const getSpeechRecognition = (): typeof SpeechRecognition | null => {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || (window as any).webkitSpeechRecognition || null;
};

// Helper to convert blob to base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      // Remove data URL prefix
      const base64Data = base64.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export function useAdvancedVoice(options: UseAdvancedVoiceOptions = {}): [VoiceState, VoiceActions] {
  const {
    onTranscript,
    onSpeechEnd,
    autoSend = true,
    silenceTimeout = 2000,
    language = 'en-US',
    continuous = false,
    noiseThreshold = 0.7,
  } = options;

  const [state, setState] = useState<VoiceState>({
    isListening: false,
    isProcessing: false,
    transcript: '',
    interimTranscript: '',
    confidence: 0,
    noiseLevel: 0,
    error: null,
    mode: 'idle',
    useWhisper: !isSpeechRecognitionSupported(),
    isSpeechSupported: isSpeechRecognitionSupported(),
  });

  // Refs
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const finalTranscriptRef = useRef<string>('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isTogglingRef = useRef<boolean>(false); // Guard against rapid clicks

  // Clear silence timer
  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  // Start silence timer (auto-send after silence)
  const startSilenceTimer = useCallback(() => {
    clearSilenceTimer();
    if (autoSend && silenceTimeout > 0) {
      silenceTimerRef.current = setTimeout(async () => {
        if (finalTranscriptRef.current.trim()) {
          const text = finalTranscriptRef.current.trim();
          if (onSpeechEnd) {
            setState(prev => ({ ...prev, mode: 'processing', isProcessing: true }));
            await onSpeechEnd(text);
            setState(prev => ({ ...prev, mode: 'idle', isProcessing: false }));
          }
          finalTranscriptRef.current = '';
          setState(prev => ({ ...prev, transcript: '', interimTranscript: '' }));
        }
      }, silenceTimeout);
    }
  }, [autoSend, silenceTimeout, onSpeechEnd, clearSilenceTimer]);

  // Monitor audio levels for noise detection
  const startNoiseMonitoring = useCallback((stream: MediaStream) => {
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

      const checkNoiseLevel = () => {
        if (!analyserRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        const normalizedLevel = Math.min(average / 128, 1);

        setState(prev => ({ ...prev, noiseLevel: normalizedLevel }));

        // If noise is too high and we're using speech recognition, suggest Whisper
        if (normalizedLevel > noiseThreshold && state.isSpeechSupported && !state.useWhisper) {
          console.log('High noise detected, consider using Whisper mode');
        }

        animationFrameRef.current = requestAnimationFrame(checkNoiseLevel);
      };

      checkNoiseLevel();
    } catch (e) {
      console.warn('Could not start noise monitoring:', e);
    }
  }, [noiseThreshold, state.isSpeechSupported, state.useWhisper]);

  // Stop noise monitoring
  const stopNoiseMonitoring = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  }, []);

  // Web Speech API based listening
  const startSpeechRecognition = useCallback(async () => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setState(prev => ({ ...prev, useWhisper: true }));
      return false;
    }

    try {
      // Request microphone permission first
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;
      startNoiseMonitoring(stream);

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = continuous;
      recognition.interimResults = true;
      recognition.lang = language;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setState(prev => ({
          ...prev,
          isListening: true,
          mode: 'listening',
          error: null,
          transcript: '',
          interimTranscript: '',
        }));
        finalTranscriptRef.current = '';
      };

      recognition.onresult = (event) => {
        clearSilenceTimer();

        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const text = result[0].transcript;
          const confidence = result[0].confidence;

          if (result.isFinal) {
            final += text;
            finalTranscriptRef.current += text;
            setState(prev => ({ ...prev, confidence }));
          } else {
            interim += text;
          }
        }

        setState(prev => ({
          ...prev,
          transcript: finalTranscriptRef.current,
          interimTranscript: interim,
        }));

        if (onTranscript) {
          if (final) onTranscript(final, true);
          if (interim) onTranscript(interim, false);
        }

        // Start silence timer after receiving results
        startSilenceTimer();
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);

        // Handle specific errors
        if (event.error === 'no-speech') {
          // No speech detected, this is okay - just restart
          return;
        }

        if (event.error === 'network') {
          // Network error - fallback to Whisper
          setState(prev => ({
            ...prev,
            error: 'Network error. Switching to offline mode.',
            useWhisper: true,
          }));
        } else if (event.error === 'not-allowed') {
          setState(prev => ({
            ...prev,
            error: 'Microphone access denied. Please allow microphone access.',
          }));
        } else {
          setState(prev => ({
            ...prev,
            error: `Speech recognition error: ${event.error}`,
          }));
        }
      };

      recognition.onend = () => {
        // If we're supposed to be continuous and still listening, restart
        if (continuous && state.isListening) {
          try {
            recognition.start();
          } catch (e) {
            // Ignore errors on restart
          }
        } else {
          // Check if we have pending transcript to send
          if (finalTranscriptRef.current.trim() && autoSend && onSpeechEnd) {
            const text = finalTranscriptRef.current.trim();
            setState(prev => ({ ...prev, mode: 'processing', isProcessing: true }));
            onSpeechEnd(text).then(() => {
              setState(prev => ({ ...prev, mode: 'idle', isProcessing: false }));
            });
            finalTranscriptRef.current = '';
          }

          setState(prev => ({
            ...prev,
            isListening: false,
            mode: prev.isProcessing ? 'processing' : 'idle',
          }));
        }
      };

      recognition.start();
      return true;
    } catch (e) {
      console.error('Failed to start speech recognition:', e);
      setState(prev => ({
        ...prev,
        error: 'Failed to start speech recognition',
        useWhisper: true,
      }));
      return false;
    }
  }, [language, continuous, autoSend, onTranscript, onSpeechEnd, startSilenceTimer, clearSilenceTimer, startNoiseMonitoring, state.isListening]);

  // Whisper-based listening (fallback) - uses admin AI service
  const startWhisperRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          // Higher quality for better transcription in noisy environments
          sampleRate: 16000,
          channelCount: 1,
        },
      });
      streamRef.current = stream;
      startNoiseMonitoring(stream);

      // Get best supported format
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (audioChunksRef.current.length === 0) return;

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        audioChunksRef.current = [];

        // Process with Whisper using admin AI service
        setState(prev => ({ ...prev, mode: 'processing', isProcessing: true }));

        try {
          const base64Audio = await blobToBase64(audioBlob);
          const format = mimeType.includes('webm') ? 'webm' : 'mp4';

          const result = await adminAIService.transcribeAudio({
            audio_base64: base64Audio,
            audio_format: format,
          });

          if (result.success && result.text) {
            setState(prev => ({
              ...prev,
              transcript: result.text,
              confidence: result.confidence || 0.95,
            }));

            if (onTranscript) {
              onTranscript(result.text, true);
            }

            if (autoSend && onSpeechEnd) {
              await onSpeechEnd(result.text);
            }
          } else {
            setState(prev => ({
              ...prev,
              error: result.error || 'Failed to transcribe audio',
            }));
          }
        } catch (e) {
          console.error('Whisper transcription error:', e);
          setState(prev => ({
            ...prev,
            error: 'Failed to process audio. Please check your connection.',
          }));
        } finally {
          setState(prev => ({
            ...prev,
            isProcessing: false,
            mode: 'idle',
            isListening: false,
          }));
        }
      };

      mediaRecorder.start(100); // Collect data every 100ms

      setState(prev => ({
        ...prev,
        isListening: true,
        mode: 'listening',
        error: null,
      }));

      return true;
    } catch (e) {
      console.error('Failed to start Whisper recording:', e);
      setState(prev => ({
        ...prev,
        error: 'Failed to access microphone',
      }));
      return false;
    }
  }, [autoSend, onTranscript, onSpeechEnd, startNoiseMonitoring]);

  // Start listening (chooses method based on state)
  const startListening = useCallback(async () => {
    if (state.isListening || state.isProcessing) return;

    // Cancel any ongoing speech synthesis to prevent overlapping audio
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setState(prev => ({ ...prev, error: null }));

    if (state.useWhisper || !state.isSpeechSupported) {
      await startWhisperRecording();
    } else {
      const success = await startSpeechRecognition();
      // If speech recognition failed, fallback to Whisper
      if (!success) {
        await startWhisperRecording();
      }
    }
  }, [state.isListening, state.isProcessing, state.useWhisper, state.isSpeechSupported, startSpeechRecognition, startWhisperRecording]);

  // Stop listening
  const stopListening = useCallback(() => {
    clearSilenceTimer();

    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    // Stop media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    // Stop stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    stopNoiseMonitoring();

    setState(prev => ({
      ...prev,
      isListening: false,
      mode: prev.isProcessing ? 'processing' : 'idle',
    }));
  }, [clearSilenceTimer, stopNoiseMonitoring]);

  // Toggle listening (with debounce guard against rapid clicks)
  const toggleListening = useCallback(async () => {
    // Prevent rapid double-clicks
    if (isTogglingRef.current) return;
    isTogglingRef.current = true;

    // Cancel any ongoing speech synthesis to prevent overlapping audio
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    try {
      if (state.isListening) {
        stopListening();
      } else {
        await startListening();
      }
    } finally {
      // Release the guard after a short delay to prevent rapid re-triggering
      setTimeout(() => {
        isTogglingRef.current = false;
      }, 500);
    }
  }, [state.isListening, startListening, stopListening]);

  // Cancel listening (discard results)
  const cancelListening = useCallback(() => {
    clearSilenceTimer();
    finalTranscriptRef.current = '';
    audioChunksRef.current = [];

    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    stopNoiseMonitoring();

    setState(prev => ({
      ...prev,
      isListening: false,
      isProcessing: false,
      mode: 'idle',
      transcript: '',
      interimTranscript: '',
      error: null,
    }));
  }, [clearSilenceTimer, stopNoiseMonitoring]);

  // Set Whisper mode
  const setUseWhisper = useCallback((use: boolean) => {
    if (state.isListening) {
      stopListening();
    }
    setState(prev => ({ ...prev, useWhisper: use }));
  }, [state.isListening, stopListening]);

  // Force Whisper mode (for noisy environments)
  const forceWhisperMode = useCallback(() => {
    setUseWhisper(true);
  }, [setUseWhisper]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearSilenceTimer();
      stopNoiseMonitoring();

      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [clearSilenceTimer, stopNoiseMonitoring]);

  return [
    state,
    {
      startListening,
      stopListening,
      toggleListening,
      cancelListening,
      setUseWhisper,
      forceWhisperMode,
    },
  ];
}

export default useAdvancedVoice;
