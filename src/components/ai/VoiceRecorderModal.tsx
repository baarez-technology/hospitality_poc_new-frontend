import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, Trash2 } from 'lucide-react';

/**
 * Voice Recorder Modal Component
 * Modal for voice recording with visual feedback
 */
export default function VoiceRecorderModal({ isOpen, onClose, onTranscriptReady }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [duration, setDuration] = useState(0);
  const [isSending, setIsSending] = useState(false); // Guard against double-clicks
  const recordingKeyRef = useRef(0); // Key to track distinct recording sessions

  // Start recording when modal opens
  useEffect(() => {
    if (isOpen) {
      setTranscript('');
      setDuration(0);
      setIsSending(false);
      recordingKeyRef.current += 1;
      setIsRecording(true);
    } else {
      setIsRecording(false);
      setDuration(0);
    }
  }, [isOpen]);

  // Duration timer
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Simulated voice recognition (in production, use Web Speech API)
  useEffect(() => {
    if (isRecording) {
      const currentKey = recordingKeyRef.current;
      // Simulate transcription after 2-4 seconds
      const delay = 2000 + Math.random() * 2000;
      const timer = setTimeout(() => {
        // Only set transcript if this recording session is still active
        if (recordingKeyRef.current !== currentKey) return;
        const sampleTranscripts = [
          "Show me today's revenue breakdown",
          "What's our current occupancy rate?",
          "How are our recent guest reviews?",
          "Generate a performance report for this week",
          "Which rooms need attention today?",
          "Tell me about our VIP guests",
          "What are the key insights for today?"
        ];
        const randomTranscript = sampleTranscripts[Math.floor(Math.random() * sampleTranscripts.length)];
        setTranscript(randomTranscript);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [isRecording]);

  // Handle done (send transcript) — guarded against double-clicks
  const handleDone = () => {
    if (isSending || !transcript) return;
    setIsSending(true);
    onTranscriptReady(transcript);
    onClose();
  };

  // Start a new recording
  const startRecording = () => {
    setTranscript('');
    setDuration(0);
    recordingKeyRef.current += 1;
    setIsRecording(true);
  };

  // Delete transcript without closing modal
  const handleDelete = () => {
    setTranscript('');
    setIsRecording(false);
    setDuration(0);
  };

  // Format duration as MM:SS
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-200">
            <h3 className="text-lg font-bold text-neutral-800">
              Voice Input
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <X className="w-5 h-5 text-neutral-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Animated microphone */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                {/* Pulse rings */}
                {isRecording && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-rose-500 opacity-20 animate-ping" style={{ animationDuration: '1.5s' }}></div>
                    <div className="absolute inset-0 rounded-full bg-rose-500 opacity-10 animate-ping" style={{ animationDuration: '2s' }}></div>
                  </>
                )}

                {/* Microphone icon — clickable to start/stop recording */}
                <button
                  onClick={isRecording ? () => setIsRecording(false) : startRecording}
                  className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                    isRecording
                      ? 'bg-gradient-to-br from-rose-500 to-rose-600 shadow-xl hover:from-rose-600 hover:to-rose-700'
                      : 'bg-gradient-to-br from-neutral-400 to-neutral-500 hover:from-terra-500 hover:to-terra-600'
                  }`}
                >
                  <Mic className="w-10 h-10 text-white" />
                </button>
              </div>

              {/* Status text */}
              <p className="mt-4 text-sm font-medium text-neutral-700">
                {isRecording ? 'Listening... Click to stop' : transcript ? 'Transcription complete' : 'Click to start recording'}
              </p>

              {/* Duration */}
              <p className="mt-1 text-2xl font-bold text-rose-600 tabular-nums">
                {formatDuration(duration)}
              </p>
            </div>

            {/* Transcript */}
            <div className="min-h-[100px] p-4 bg-[#FAF8F6] border border-neutral-200 rounded-xl">
              {transcript ? (
                <p className="text-sm text-neutral-800 leading-relaxed">
                  {transcript}
                </p>
              ) : (
                <p className="text-sm text-neutral-400 italic">
                  Start speaking... Your voice will be transcribed here
                </p>
              )}
            </div>

            {/* Wave animation */}
            {isRecording && (
              <div className="flex items-center justify-center gap-1 mt-4 h-8">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-gradient-to-t from-rose-500 to-rose-400 rounded-full animate-pulse"
                    style={{
                      height: '20px',
                      animationDelay: `${i * 100}ms`,
                      animationDuration: '0.8s'
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-2 p-4 bg-[#FAF8F6] border-t border-neutral-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-sm font-medium text-neutral-700 hover:bg-[#FAF8F6] transition-colors"
            >
              Cancel
            </button>
            {transcript && !isRecording && (
              <>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2.5 bg-white border border-rose-300 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
                <button
                  onClick={startRecording}
                  className="px-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  Re-record
                </button>
              </>
            )}
            <button
              onClick={handleDone}
              disabled={!transcript}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                transcript
                  ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white hover:shadow'
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              }`}
            >
              Send Message
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
