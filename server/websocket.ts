import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';

interface Participant {
  id: string;
  name: string;
  joinedAt: number;
  isSpeaking: boolean;
}

interface MeetingRoom {
  meetingId: string;
  participants: Map<string, Participant>;
  currentSpeakerIndex: number;
  timerState: {
    elapsed: number;
    remaining: number;
    isRunning: boolean;
  };
  transcript: Array<{ text: string; speaker: string; timestamp: number }>;
}

export function setupWebSocket(server: HTTPServer) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:8082",  // must match your frontend port IN THE BROWSER!
      credentials: true
    }
  
  });

  const meetingRooms = new Map<string, MeetingRoom>();

  io.on('connection', (socket) => {
    console.log('✅ User connected:', socket.id);

    socket.on('join-meeting', ({ meetingId, userName }) => {
      socket.join(meetingId);

      if (!meetingRooms.has(meetingId)) {
        meetingRooms.set(meetingId, {
          meetingId,
          participants: new Map(),
          currentSpeakerIndex: 0,
          timerState: { elapsed: 0, remaining: 900, isRunning: false },
          transcript: []
        });
      }

      const room = meetingRooms.get(meetingId)!;
      room.participants.set(socket.id, {
        id: socket.id,
        name: userName,
        joinedAt: Date.now(),
        isSpeaking: room.participants.size === 0
      });

      socket.emit('meeting-state', {
        currentSpeakerIndex: room.currentSpeakerIndex,
        timerState: room.timerState,
        participants: Array.from(room.participants.values()),
        transcript: room.transcript
      });

      io.to(meetingId).emit('participants-updated', {
        participants: Array.from(room.participants.values())
      });
    });

    socket.on('timer-update', ({ meetingId, elapsed, remaining, isRunning }) => {
      const room = meetingRooms.get(meetingId);
      if (room) {
        room.timerState = { elapsed, remaining, isRunning };
        socket.to(meetingId).emit('timer-synced', { elapsed, remaining, isRunning });
      }
    });

    socket.on('next-speaker', ({ meetingId }) => {
      const room = meetingRooms.get(meetingId);
      if (room && room.participants.size > 0) {
        const participantsArray = Array.from(room.participants.values());
        room.currentSpeakerIndex = (room.currentSpeakerIndex + 1) % participantsArray.length;
        participantsArray.forEach((p, idx) => {
          p.isSpeaking = idx === room.currentSpeakerIndex;
        });
        io.to(meetingId).emit('speaker-changed', {
          currentSpeakerIndex: room.currentSpeakerIndex
        });
      }
    });

    socket.on('transcript-update', ({ meetingId, text, speaker }) => {
      const room = meetingRooms.get(meetingId);
      if (room) {
        const entry = { text, speaker, timestamp: Date.now() };
        room.transcript.push(entry);
        io.to(meetingId).emit('transcript-received', entry);
      }
    });

    socket.on('start-meeting', ({ meetingId }) => {
      const room = meetingRooms.get(meetingId);
      if (room) {
        room.timerState.isRunning = true;
        io.to(meetingId).emit('meeting-started');
      }
    });

    socket.on('end-meeting', ({ meetingId }) => {
      const room = meetingRooms.get(meetingId);
      if (room) {
        room.timerState.isRunning = false;
        io.to(meetingId).emit('meeting-ended');
      }
    });

    socket.on('disconnect', () => {
      meetingRooms.forEach((room, meetingId) => {
        if (room.participants.has(socket.id)) {
          room.participants.delete(socket.id);
          io.to(meetingId).emit('participants-updated', {
            participants: Array.from(room.participants.values())
          });
          if (room.participants.size === 0) {
            meetingRooms.delete(meetingId);
          }
        }
      });
    });
  });

  return io;
}
