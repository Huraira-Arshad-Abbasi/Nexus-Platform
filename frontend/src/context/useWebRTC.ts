import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ]
};

interface UseWebRTCProps {
  meetingId: string;
  userId: string;
  userName: string;
}

export const useWebRTC = ({ meetingId, userId, userName }: UseWebRTCProps) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [peerAudio, setPeerAudio] = useState(true);
  const [peerVideo, setPeerVideo] = useState(true);
  const [waitingForPeer, setWaitingForPeer] = useState(true);
  const [error, setError] = useState('');

  const socketRef = useRef<Socket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // ── Initialize media + socket ──────────────────
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        // Get camera and mic
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (!mounted) return;
        localStreamRef.current = stream;
        setLocalStream(stream);

        // Connect to signaling server
        const socket = io(SOCKET_URL, { transports: ['websocket'] });
        socketRef.current = socket;

        socket.on('connect', () => {
          console.log('Connected to signaling server');
          socket.emit('join-room', { meetingId, userId, userName });
        });

        // Another user joined — we initiate the call
        socket.on('user-joined', async ({ socketId }) => {
          console.log('Peer joined, creating offer...', socketId);
          setWaitingForPeer(false);
          await createOffer();
        });

        // We are ready (2 people in room)
        socket.on('ready-to-call', () => {
          setWaitingForPeer(false);
        });

        // Received offer — send answer
        socket.on('offer', async ({ offer }) => {
          console.log('Received offer');
          await handleOffer(offer);
        });

        // Received answer
        socket.on('answer', async ({ answer }) => {
          console.log('Received answer');
          if (peerConnectionRef.current) {
            await peerConnectionRef.current.setRemoteDescription(
              new RTCSessionDescription(answer)
            );
          }
        });

        // Received ICE candidate
        socket.on('ice-candidate', async ({ candidate }) => {
          if (peerConnectionRef.current && candidate) {
            try {
              await peerConnectionRef.current.addIceCandidate(
                new RTCIceCandidate(candidate)
              );
            } catch (e) {
              console.error('Error adding ICE candidate', e);
            }
          }
        });

        // Peer toggled audio/video
        socket.on('peer-toggle-media', ({ audio, video }) => {
          setPeerAudio(audio);
          setPeerVideo(video);
        });

        // Peer left
        socket.on('peer-left', () => {
          console.log('Peer left the call');
          setIsConnected(false);
          setRemoteStream(null);
          setWaitingForPeer(true);
          if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
          }
        });

      } catch (err: any) {
        console.error('Media error:', err);
        setError(
          err.name === 'NotAllowedError'
            ? 'Camera/microphone permission denied. Please allow access and reload.'
            : 'Could not access camera or microphone.'
        );
      }
    };

    init();

    return () => {
      mounted = false;
      cleanup();
    };
  }, [meetingId, userId]);

  // ── Create RTCPeerConnection ───────────────────
  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Add local tracks to connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    // Receive remote stream
    pc.ontrack = (event) => {
      console.log('Received remote track');
      setRemoteStream(event.streams[0]);
      setIsConnected(true);
    };

    // Send ICE candidates to peer via socket
    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('ice-candidate', {
          meetingId,
          candidate: event.candidate,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      if (pc.connectionState === 'connected') setIsConnected(true);
      if (pc.connectionState === 'disconnected') setIsConnected(false);
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [meetingId]);

  // ── Create and send offer ──────────────────────
  const createOffer = useCallback(async () => {
    const pc = createPeerConnection();
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socketRef.current?.emit('offer', { meetingId, offer });
  }, [createPeerConnection, meetingId]);

  // ── Handle received offer, send answer ────────
  const handleOffer = useCallback(async (offer: RTCSessionDescriptionInit) => {
    const pc = createPeerConnection();
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socketRef.current?.emit('answer', { meetingId, answer });
  }, [createPeerConnection, meetingId]);

  // ── Toggle audio ──────────────────────────────
  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
        socketRef.current?.emit('toggle-media', {
          meetingId,
          audio: audioTrack.enabled,
          video: isVideoOn,
        });
      }
    }
  }, [meetingId, isVideoOn]);

  // ── Toggle video ──────────────────────────────
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
        socketRef.current?.emit('toggle-media', {
          meetingId,
          audio: isAudioOn,
          video: videoTrack.enabled,
        });
      }
    }
  }, [meetingId, isAudioOn]);

  // ── End call ──────────────────────────────────
  const endCall = useCallback(() => {
    socketRef.current?.emit('leave-room', { meetingId });
    cleanup();
  }, [meetingId]);

  // ── Cleanup ───────────────────────────────────
  const cleanup = () => {
    localStreamRef.current?.getTracks().forEach(track => track.stop());
    peerConnectionRef.current?.close();
    socketRef.current?.disconnect();
    peerConnectionRef.current = null;
    socketRef.current = null;
  };

  return {
    localStream,
    remoteStream,
    isConnected,
    isAudioOn,
    isVideoOn,
    peerAudio,
    peerVideo,
    waitingForPeer,
    error,
    toggleAudio,
    toggleVideo,
    endCall,
  };
};