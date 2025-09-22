import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { AuthenticatedSocket } from '../middleware/auth.js';
import { dbRun, dbGet, dbAll } from '../database/init.js';

interface WatchSession {
  id: string;
  participants: Map<string, { id: string; username: string; socket: AuthenticatedSocket }>;
  videoInfo: any;
  syncData: {
    currentTime: number;
    isPlaying: boolean;
    timestamp: number;
  };
  countdown?: NodeJS.Timeout;
}

const activeSessions = new Map<string, WatchSession>();

export const handleSocketConnection = (socket: AuthenticatedSocket, io: Server) => {
  console.log(`User ${socket.user?.username} connected`);

  socket.on('join-session', async (sessionId: string) => {
    try {
      let session = activeSessions.get(sessionId);

      if (!session) {
        const sessionData = await dbGet('SELECT * FROM watch_sessions WHERE id = ?', [sessionId]);
        if (!sessionData) {
          socket.emit('error', 'Session not found');
          return;
        }

        session = {
          id: sessionId,
          participants: new Map(),
          videoInfo: {
            id: sessionData.video_id,
            title: sessionData.video_title,
            thumbnail: sessionData.video_thumbnail,
            duration: sessionData.video_duration,
            url: sessionData.video_url,
          },
          syncData: {
            currentTime: 0,
            isPlaying: false,
            timestamp: Date.now(),
          },
        };
        activeSessions.set(sessionId, session);
      }

      socket.join(sessionId);
      session.participants.set(socket.user!.id, {
        id: socket.user!.id,
        username: socket.user!.username,
        socket,
      });

      socket.to(sessionId).emit('user-joined', socket.user!.id, socket.user!.username);

      socket.emit('session-joined', {
        sessionId,
        videoInfo: session.videoInfo,
        participants: Array.from(session.participants.values()).map(p => ({
          id: p.id,
          username: p.username,
        })),
        syncData: session.syncData,
      });

      console.log(`User ${socket.user?.username} joined session ${sessionId}`);
    } catch (error) {
      console.error('Error joining session:', error);
      socket.emit('error', 'Failed to join session');
    }
  });

  socket.on('leave-session', (sessionId: string) => {
    leaveSession(socket, sessionId);
  });

  socket.on('sync-data', (data: { sessionId: string; currentTime: number; isPlaying: boolean }) => {
    const session = activeSessions.get(data.sessionId);
    if (!session || !session.participants.has(socket.user!.id)) {
      return;
    }

    session.syncData = {
      currentTime: data.currentTime,
      isPlaying: data.isPlaying,
      timestamp: Date.now(),
    };

    socket.to(data.sessionId).emit('sync-data', session.syncData);
  });

  socket.on('request-sync', (sessionId: string) => {
    const session = activeSessions.get(sessionId);
    if (!session || !session.participants.has(socket.user!.id)) {
      return;
    }

    socket.emit('sync-data', session.syncData);
  });

  socket.on('chat-message', (data: { sessionId: string; message: string }) => {
    const session = activeSessions.get(data.sessionId);
    if (!session || !session.participants.has(socket.user!.id)) {
      return;
    }

    const message = {
      id: uuidv4(),
      userId: socket.user!.id,
      username: socket.user!.username,
      message: data.message,
      timestamp: Date.now(),
    };

    io.to(data.sessionId).emit('chat-message', message);
  });

  socket.on('emoji-reaction', (data: { sessionId: string; emoji: string; x: number; y: number }) => {
    const session = activeSessions.get(data.sessionId);
    if (!session || !session.participants.has(socket.user!.id)) {
      return;
    }

    const reaction = {
      id: uuidv4(),
      userId: socket.user!.id,
      emoji: data.emoji,
      x: data.x,
      y: data.y,
      timestamp: Date.now(),
    };

    socket.to(data.sessionId).emit('emoji-reaction', reaction);
  });

  socket.on('send-video-invite', async (data: { friendId: string; videoInfo: any }) => {
    try {
      const sessionId = uuidv4();

      await dbRun(
        'INSERT INTO watch_sessions (id, video_id, video_title, video_thumbnail, video_duration, video_url, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [sessionId, data.videoInfo.id, data.videoInfo.title, data.videoInfo.thumbnail, data.videoInfo.duration, data.videoInfo.url, socket.user!.id]
      );

      const friendSockets = Array.from(io.sockets.sockets.values()).filter(
        s => (s as AuthenticatedSocket).user?.id === data.friendId
      );

      friendSockets.forEach(friendSocket => {
        friendSocket.emit('video-invite', sessionId, data.videoInfo, socket.user!.username);
      });

      socket.emit('video-invite-sent', sessionId);
    } catch (error) {
      console.error('Error sending video invite:', error);
      socket.emit('error', 'Failed to send video invite');
    }
  });

  socket.on('start-countdown', (sessionId: string) => {
    const session = activeSessions.get(sessionId);
    if (!session || !session.participants.has(socket.user!.id)) {
      return;
    }

    if (session.countdown) {
      clearInterval(session.countdown);
    }

    let count = 3;
    io.to(sessionId).emit('countdown-start', count);

    session.countdown = setInterval(() => {
      count--;
      if (count > 0) {
        io.to(sessionId).emit('countdown-start', count);
      } else {
        clearInterval(session.countdown!);
        session.countdown = undefined;
        io.to(sessionId).emit('countdown-end');

        session.syncData = {
          currentTime: 0,
          isPlaying: true,
          timestamp: Date.now(),
        };
        io.to(sessionId).emit('sync-data', session.syncData);
      }
    }, 1000);
  });

  socket.on('disconnect', () => {
    console.log(`User ${socket.user?.username} disconnected`);

    activeSessions.forEach((session, sessionId) => {
      if (session.participants.has(socket.user!.id)) {
        leaveSession(socket, sessionId);
      }
    });
  });

  const leaveSession = (socket: AuthenticatedSocket, sessionId: string) => {
    const session = activeSessions.get(sessionId);
    if (!session || !session.participants.has(socket.user!.id)) {
      return;
    }

    socket.leave(sessionId);
    session.participants.delete(socket.user!.id);
    socket.to(sessionId).emit('user-left', socket.user!.id);

    if (session.participants.size === 0) {
      if (session.countdown) {
        clearInterval(session.countdown);
      }
      activeSessions.delete(sessionId);
    }

    console.log(`User ${socket.user?.username} left session ${sessionId}`);
  };
};