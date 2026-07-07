/**
 * Voice Recorder Hook
 * Handles audio recording using MediaRecorder API
 */

import { useState, useRef, useCallback, useEffect } from 'react';

export interface VoiceRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  error: string | null;
}

export interface VoiceRecorderActions {
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  cancelRecording: () => void;
  clearRecording: () => void;
}

export interface UseVoiceRecorderOptions {
  maxDuration?: number; // Maximum recording duration in seconds
  onRecordingComplete?: (blob: Blob) => void;
  mimeType?: string;
}

export function useVoiceRecorder(options: UseVoiceRecorderOptions = {}): [
  VoiceRecorderState,
  VoiceRecorderActions
] {
  const { maxDuration = 60, onRecordingComplete, mimeType } = options;

  const [state, setState] = useState<VoiceRecorderState>({
    isRecording: false,
    isPaused: false,
    recordingTime: 0,
    audioBlob: null,
    audioUrl: null,
    error: null,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Get supported MIME type
  const getSupportedMimeType = useCallback((): string => {
    if (mimeType && MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType;
    }

    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
      'audio/mpeg',
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return 'audio/webm';
  }, [mimeType]);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      // Reset state
      setState((prev) => ({
        ...prev,
        isRecording: false,
        isPaused: false,
        recordingTime: 0,
        audioBlob: null,
        audioUrl: null,
        error: null,
      }));
      chunksRef.current = [];

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      // Create MediaRecorder
      const supportedMimeType = getSupportedMimeType();
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: supportedMimeType,
      });
      mediaRecorderRef.current = mediaRecorder;

      // Handle data
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Handle stop
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: supportedMimeType });
        const url = URL.createObjectURL(blob);

        setState((prev) => ({
          ...prev,
          isRecording: false,
          isPaused: false,
          audioBlob: blob,
          audioUrl: url,
        }));

        if (onRecordingComplete) {
          onRecordingComplete(blob);
        }

        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      // Handle error
      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setState((prev) => ({
          ...prev,
          error: 'Recording error occurred',
          isRecording: false,
        }));
      };

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms

      setState((prev) => ({
        ...prev,
        isRecording: true,
        isPaused: false,
        recordingTime: 0,
      }));

      // Start timer
      timerRef.current = setInterval(() => {
        setState((prev) => {
          const newTime = prev.recordingTime + 1;

          // Auto-stop at max duration
          if (newTime >= maxDuration) {
            if (mediaRecorderRef.current?.state === 'recording') {
              mediaRecorderRef.current.stop();
            }
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
          }

          return { ...prev, recordingTime: newTime };
        });
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to access microphone. Please check permissions.';
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isRecording: false,
      }));
    }
  }, [getSupportedMimeType, maxDuration, onRecordingComplete]);

  // Stop recording
  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      if (mediaRecorderRef.current?.state !== 'inactive') {
        const handleStop = () => {
          const blob = new Blob(chunksRef.current, {
            type: mediaRecorderRef.current?.mimeType || 'audio/webm',
          });
          resolve(blob);
        };

        mediaRecorderRef.current!.addEventListener('stop', handleStop, { once: true });
        mediaRecorderRef.current!.stop();
      } else {
        resolve(null);
      }
    });
  }, []);

  // Pause recording
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause();
      setState((prev) => ({ ...prev, isPaused: true }));

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, []);

  // Resume recording
  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume();
      setState((prev) => ({ ...prev, isPaused: false }));

      // Restart timer
      timerRef.current = setInterval(() => {
        setState((prev) => {
          const newTime = prev.recordingTime + 1;
          if (newTime >= maxDuration) {
            if (mediaRecorderRef.current?.state === 'recording') {
              mediaRecorderRef.current.stop();
            }
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
          }
          return { ...prev, recordingTime: newTime };
        });
      }, 1000);
    }
  }, [maxDuration]);

  // Cancel recording
  const cancelRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current!.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    chunksRef.current = [];
    setState({
      isRecording: false,
      isPaused: false,
      recordingTime: 0,
      audioBlob: null,
      audioUrl: null,
      error: null,
    });
  }, []);

  // Clear recording
  const clearRecording = useCallback(() => {
    if (state.audioUrl) {
      URL.revokeObjectURL(state.audioUrl);
    }

    setState((prev) => ({
      ...prev,
      audioBlob: null,
      audioUrl: null,
    }));
  }, [state.audioUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (state.audioUrl) {
        URL.revokeObjectURL(state.audioUrl);
      }
    };
  }, []);

  return [
    state,
    {
      startRecording,
      stopRecording,
      pauseRecording,
      resumeRecording,
      cancelRecording,
      clearRecording,
    },
  ];
}

export default useVoiceRecorder;
