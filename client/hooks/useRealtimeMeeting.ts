import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface Participant {
  id: string;
  name: string;
  joinedAt: number;
  isSpeaking: boolean;
}
interface TranscriptEntry {
  text: string;
  speaker: string;
  timestamp: number;
}
interface TimerState {
  elapsed: number;
  remaining: number;
  isRunning: boolean;
}

export function useRealtimeMeeting(meetingId: string, userName: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentSpeakerIndex, setCurrentSpeakerIndex] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [timerState, setTimerState] = useState<TimerState>({
    elapsed: 0,
    remaining: 900,
    isRunning: false
  });
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketInstance: Socket = io('http://localhost:8081', {
      withCredentials: true
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      socketInstance.emit('join-meeting', { meetingId, userName });
    });

    socketInstance.on('disconnect', () => setIsConnected(false));
    socketInstance.on('meeting-state', (data) => {
      setCurrentSpeakerIndex(data.currentSpeakerIndex);
      setTimerState(data.timerState);
      setParticipants(data.participants);
      setTranscript(data.transcript);
    });
    socketInstance.on('participants-updated', ({ participants }) => setParticipants(participants));
    socketInstance.on('speaker-changed', ({ currentSpeakerIndex }) => setCurrentSpeakerIndex(currentSpeakerIndex));
    socketInstance.on('transcript-received', (entry) => setTranscript(t => [...t, entry]));
    socketInstance.on('timer-synced', ({ elapsed, remaining, isRunning }) => setTimerState({ elapsed, remaining, isRunning }));

    setSocket(socketInstance);
    return () => { socketInstance.disconnect(); };
  }, [meetingId, userName]);

  const nextSpeaker = useCallback(() => {
    socket?.emit('next-speaker', { meetingId });
  }, [socket, meetingId]);

  const sendTranscript = useCallback((text: string, speaker: string) => {
    socket?.emit('transcript-update', { meetingId, text, speaker });
  }, [socket, meetingId]);

  const syncTimer = useCallback((elapsed: number, remaining: number, isRunning: boolean) => {
    socket?.emit('timer-update', { meetingId, elapsed, remaining, isRunning });
  }, [socket, meetingId]);

  const startMeeting = useCallback(() => {
    socket?.emit('start-meeting', { meetingId });
  }, [socket, meetingId]);

  const endMeeting = useCallback(() => {
    socket?.emit('end-meeting', { meetingId });
  }, [socket, meetingId]);

  return {
    participants,
    currentSpeakerIndex,
    transcript,
    timerState,
    isConnected,
    nextSpeaker,
    sendTranscript,
    syncTimer,
    startMeeting,
    endMeeting,
    socket
  };
}
