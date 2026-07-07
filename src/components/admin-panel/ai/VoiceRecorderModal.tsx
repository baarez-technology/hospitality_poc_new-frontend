import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Mic, Square, AlertCircle, Trash2 } from 'lucide-react';
import { adminAIService } from '../../../api/services/admin-ai.service';

interface VoiceRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTranscriptReady: (transcript: string) => void;
}

/**
 * Voice Recorder Modal Component
 * Records audio and transcribes it using Whisper API
 */
export default function VoiceRecorderModal({
  isOpen,
  onClose,
  onTranscriptReady
}: VoiceRecorderModalProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [hasSpoken, setHasSpoken] = useState(false); // Track if user has spoken
  const [peakAudioLevel, setPeakAudioLevel] = useState(0); // Track peak audio level during recording
  const [isSending, setIsSending] = useState(false); // Guard against double-clicks on Send

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const durationRef = useRef(0); // Track duration in ref for callbacks
  const hasSpokenRef = useRef(false); // Track speech detection in ref

  // Constants for voice detection
  const MIN_RECORDING_DURATION = 1; // Minimum 1 second of recording
  const MIN_AUDIO_LEVEL_THRESHOLD = 0.15; // Minimum audio level to consider as speech
  const MAX_RECORDING_DURATION = 60; // Maximum recording duration in seconds
  const SILENCE_TIMEOUT = 10; // Auto-stop after 10 seconds of silence

  // Refs for silence detection
  const lastSpeechTimeRef = useRef<number>(Date.now());
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const maxDurationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (silenceTimerRef.current) {
        clearInterval(silenceTimerRef.current);
      }
      if (maxDurationTimerRef.current) {
        clearTimeout(maxDurationTimerRef.current);
      }
    };
  }, []);

  // Reset state when modal opens - DON'T auto-start recording
  useEffect(() => {
    if (isOpen) {
      setTranscript('');
      setDuration(0);
      setError(null);
      setIsTranscribing(false);
      setHasSpoken(false);
      setPeakAudioLevel(0);
      setIsSending(false);
      // Don't auto-start - user must click to start recording
    } else {
      stopRecording();
    }
  }, [isOpen]);

  // Duration timer - sync with ref for callback access
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setDuration(prev => {
          const newDuration = prev + 1;
          durationRef.current = newDuration;
          return newDuration;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Sync hasSpoken state with ref
  useEffect(() => {
    hasSpokenRef.current = hasSpoken;
  }, [hasSpoken]);

  // Audio level visualization and speech detection
  const updateAudioLevel = useCallback(() => {
    if (analyserRef.current && isRecording) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);

      // Calculate average level
      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      const normalizedLevel = average / 255; // Normalize to 0-1
      setAudioLevel(normalizedLevel);

      // Track peak audio level and detect if user has spoken
      if (normalizedLevel > MIN_AUDIO_LEVEL_THRESHOLD) {
        setHasSpoken(true);
        setPeakAudioLevel(prev => Math.max(prev, normalizedLevel));
        lastSpeechTimeRef.current = Date.now(); // Update last speech time
      }

      animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
    }
  }, [isRecording]);

  // Auto-stop after silence or max duration
  const checkAutoStop = useCallback(() => {
    if (!isRecording) return;

    const now = Date.now();
    const silenceDuration = (now - lastSpeechTimeRef.current) / 1000;

    // If user has spoken and then been silent for SILENCE_TIMEOUT seconds, auto-stop
    if (hasSpokenRef.current && silenceDuration >= SILENCE_TIMEOUT) {
      console.log('Auto-stopping due to silence');
      setError(`Recording stopped after ${SILENCE_TIMEOUT} seconds of silence.`);
      handleStopAndTranscribe();
    }
  }, [isRecording]);

  // Set up silence detection interval when recording starts
  useEffect(() => {
    if (isRecording) {
      lastSpeechTimeRef.current = Date.now();

      // Check for silence every second
      silenceTimerRef.current = setInterval(checkAutoStop, 1000);

      // Maximum recording duration timeout
      maxDurationTimerRef.current = setTimeout(() => {
        if (isRecording) {
          console.log('Auto-stopping due to max duration');
          setError(`Maximum recording time of ${MAX_RECORDING_DURATION} seconds reached.`);
          handleStopAndTranscribe();
        }
      }, MAX_RECORDING_DURATION * 1000);
    } else {
      // Clear timers when recording stops
      if (silenceTimerRef.current) {
        clearInterval(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      if (maxDurationTimerRef.current) {
        clearTimeout(maxDurationTimerRef.current);
        maxDurationTimerRef.current = null;
      }
    }

    return () => {
      if (silenceTimerRef.current) {
        clearInterval(silenceTimerRef.current);
      }
      if (maxDurationTimerRef.current) {
        clearTimeout(maxDurationTimerRef.current);
      }
    };
  }, [isRecording, checkAutoStop]);

  const startRecording = async () => {
    try {
      setError(null);
      audioChunksRef.current = [];
      setHasSpoken(false);
      hasSpokenRef.current = false;
      setPeakAudioLevel(0);
      setDuration(0);
      durationRef.current = 0;

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      streamRef.current = stream;

      // Set up audio analyzer for visualization
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Determine the best supported MIME type
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = '';
          }
        }
      }

      const options: MediaRecorderOptions = mimeType ? { mimeType } : {};
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mimeType || 'audio/webm'
        });
        await transcribeAudio(audioBlob);
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);

      // Start audio level visualization
      updateAudioLevel();

    } catch (err: any) {
      console.error('Error starting recording:', err);
      if (err.name === 'NotAllowedError') {
        setError('Microphone access denied. Please allow microphone access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('No microphone found. Please connect a microphone and try again.');
      } else {
        setError('Failed to start recording. Please try again.');
      }
    }
  };

  const stopRecording = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    setIsRecording(false);
    setAudioLevel(0);
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    setError(null);

    try {
      // Convert blob to base64
      const base64Audio = await adminAIService.blobToBase64(audioBlob);

      // Determine audio format from blob type
      let audioFormat = 'webm';
      if (audioBlob.type.includes('mp4')) {
        audioFormat = 'mp4';
      } else if (audioBlob.type.includes('ogg')) {
        audioFormat = 'ogg';
      }

      // Send to Whisper API
      const result = await adminAIService.transcribeAudio({
        audio_base64: base64Audio,
        audio_format: audioFormat
      });

      if (result.success && result.text) {
        setTranscript(result.text);
      } else {
        setError(result.message || result.error || 'Transcription failed');
      }
    } catch (err: any) {
      console.error('Transcription error:', err);
      setError('Failed to transcribe audio. Please try again.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleStopAndTranscribe = () => {
    if (isRecording) {
      // Check if recording is valid before transcribing
      if (durationRef.current < MIN_RECORDING_DURATION) {
        setError('Recording too short. Please speak for at least 1 second.');
        stopRecordingWithoutTranscribe();
        return;
      }

      if (!hasSpokenRef.current && peakAudioLevel < MIN_AUDIO_LEVEL_THRESHOLD) {
        setError('No speech detected. Please speak clearly into your microphone.');
        stopRecordingWithoutTranscribe();
        return;
      }

      stopRecording();
    }
  };

  // Stop recording without triggering transcription
  const stopRecordingWithoutTranscribe = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Stop media recorder without triggering onstop handler
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = null; // Remove the handler
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    setIsRecording(false);
    setAudioLevel(0);
    audioChunksRef.current = [];
  };

  const handleDone = () => {
    if (isSending || !transcript) return;
    setIsSending(true);
    onTranscriptReady(transcript);
    onClose();
  };

  const handleRetry = () => {
    setTranscript('');
    setError(null);
    setDuration(0);
    startRecording();
  };

  // Delete transcript without closing modal or re-recording
  const handleDelete = () => {
    setTranscript('');
    setError(null);
    setDuration(0);
    setHasSpoken(false);
    hasSpokenRef.current = false;
    setPeakAudioLevel(0);
    audioChunksRef.current = [];
  };

  // Format duration as MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Center Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-[10px] shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-5 border-b border-neutral-100">
            <h3 className="text-base sm:text-lg font-semibold text-neutral-900 tracking-tight">
              Voice Input
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-8">
            {/* Animated microphone */}
            <div className="flex flex-col items-center mb-4 sm:mb-6">
              <div className="relative">
                {/* Pulse rings based on audio level */}
                {isRecording && (
                  <>
                    <div
                      className="absolute inset-0 rounded-full bg-rose-500 opacity-20 animate-ping"
                      style={{
                        animationDuration: '1.5s',
                        transform: `scale(${1 + audioLevel * 0.5})`
                      }}
                    />
                    <div
                      className="absolute inset-0 rounded-full bg-rose-500 opacity-10 animate-ping"
                      style={{
                        animationDuration: '2s',
                        transform: `scale(${1 + audioLevel * 0.3})`
                      }}
                    />
                  </>
                )}

                {/* Microphone icon */}
                <button
                  onClick={isRecording ? handleStopAndTranscribe : handleRetry}
                  disabled={isTranscribing}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all ${
                    isRecording
                      ? 'bg-gradient-to-br from-rose-500 to-rose-600 shadow-xl hover:from-rose-600 hover:to-rose-700'
                      : isTranscribing
                      ? 'bg-gradient-to-br from-amber-400 to-amber-500 cursor-wait'
                      : 'bg-gradient-to-br from-neutral-400 to-neutral-500 hover:from-terra-500 hover:to-terra-600'
                  }`}
                >
                  {isRecording ? (
                    <Square className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  ) : (
                    <Mic className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  )}
                </button>
              </div>

              {/* Status text */}
              <p className="mt-3 sm:mt-4 text-[12px] sm:text-sm font-medium text-neutral-700 text-center">
                {isRecording
                  ? 'Recording... Click to stop'
                  : isTranscribing
                  ? 'Transcribing with Whisper AI...'
                  : transcript
                  ? 'Transcription complete'
                  : 'Click to start recording'}
              </p>

              {/* Duration */}
              <p className={`mt-1 text-xl sm:text-2xl font-bold tabular-nums ${
                isRecording ? 'text-rose-600' : 'text-neutral-400'
              }`}>
                {formatDuration(duration)}
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-rose-50 border border-rose-200 rounded-[10px] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                <p className="text-[12px] sm:text-sm text-rose-700">{error}</p>
              </div>
            )}

            {/* Transcript */}
            <div className="min-h-[80px] sm:min-h-[100px] p-3 sm:p-4 bg-neutral-50 border border-neutral-200 rounded-[10px]">
              {isTranscribing ? (
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-[12px] sm:text-sm text-neutral-600">Processing audio...</p>
                </div>
              ) : transcript ? (
                <p className="text-[12px] sm:text-sm text-neutral-800 leading-relaxed">
                  {transcript}
                </p>
              ) : (
                <p className="text-[12px] sm:text-sm text-neutral-400 italic">
                  {error
                    ? 'Click the microphone to try again'
                    : 'Start speaking... Your voice will be transcribed here using Whisper AI'}
                </p>
              )}
            </div>

            {/* Wave animation */}
            {isRecording && (
              <div className="flex items-center justify-center gap-1 mt-3 sm:mt-4 h-6 sm:h-8">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-gradient-to-t from-rose-500 to-rose-400 rounded-full transition-all duration-100"
                    style={{
                      height: `${8 + audioLevel * 20 * Math.sin((Date.now() / 100) + i)}px`,
                      minHeight: '8px',
                      maxHeight: '28px'
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 flex items-center gap-2 p-3 sm:p-4 bg-neutral-50/50 border-t border-neutral-100">
            <button
              onClick={onClose}
              className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-neutral-200 rounded-lg text-[12px] sm:text-[13px] font-medium text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300 transition-colors"
            >
              Cancel
            </button>
            {transcript && !isRecording && !isTranscribing && (
              <>
                <button
                  onClick={handleDelete}
                  className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-rose-200 rounded-lg text-[12px] sm:text-[13px] font-medium text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
                <button
                  onClick={handleRetry}
                  className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-neutral-200 rounded-lg text-[12px] sm:text-[13px] font-medium text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300 transition-colors"
                >
                  Re-record
                </button>
              </>
            )}
            <button
              onClick={handleDone}
              disabled={!transcript || isRecording || isTranscribing || isSending}
              className={`flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-[12px] sm:text-[13px] font-semibold transition-colors ${
                transcript && !isRecording && !isTranscribing && !isSending
                  ? 'bg-terra-500 hover:bg-terra-600 text-white'
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              }`}
            >
              {isSending ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
