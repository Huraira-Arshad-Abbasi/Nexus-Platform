import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { useWebRTC } from '../../context/useWebRTC';

const VideoCallPage: React.FC = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const {
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
  } = useWebRTC({
    meetingId: meetingId || '',
    userId: user?.id || '',
    userName: user?.name || '',
  });

  // Attach streams to video elements
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const handleEndCall = () => {
    endCall();
    navigate('/meetings');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white p-8">
          <div className="text-6xl mb-4">📷</div>
          <h2 className="text-xl font-semibold mb-2">Camera Access Required</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/meetings')}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Back to Meetings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-800">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-yellow-400'}`} />
          <span className="text-white text-sm font-medium">
            {isConnected ? 'Connected' : waitingForPeer ? 'Waiting for other person...' : 'Connecting...'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          {isConnected ? <Wifi size={16} className="text-green-400" /> : <WifiOff size={16} />}
          <span>Meeting ID: {meetingId?.slice(-6)}</span>
        </div>
      </div>

      {/* Video area */}
      <div className="flex-1 relative bg-gray-900 flex items-center justify-center p-4">

        {/* Remote video — main large view */}
        <div className="w-full max-w-4xl aspect-video bg-gray-800 rounded-xl overflow-hidden relative">
          {remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
              <div className="text-6xl mb-4">👤</div>
              <p className="text-lg">
                {waitingForPeer ? 'Waiting for other person to join...' : 'Connecting to peer...'}
              </p>
              <p className="text-sm mt-2 text-gray-600">
                Share the meeting link for them to join
              </p>
            </div>
          )}

          {/* Peer media status indicators */}
          {isConnected && (
            <div className="absolute top-3 left-3 flex gap-2">
              {!peerAudio && (
                <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <MicOff size={12} /> Muted
                </span>
              )}
              {!peerVideo && (
                <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <VideoOff size={12} /> Camera Off
                </span>
              )}
            </div>
          )}
        </div>

        {/* Local video — small overlay */}
        <div className="absolute bottom-8 right-8 w-48 aspect-video bg-gray-700 rounded-lg overflow-hidden border-2 border-gray-600 shadow-xl">
          {localStream && isVideoOn ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted // always mute local to prevent echo
              className="w-full h-full object-cover scale-x-[-1]" // mirror effect
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <VideoOff size={24} />
            </div>
          )}
          <div className="absolute bottom-1 left-2 text-white text-xs font-medium">
            You
          </div>
        </div>
      </div>

      {/* Controls bar */}
      <div className="bg-gray-800 px-6 py-4 flex items-center justify-center gap-4">

        {/* Toggle Audio */}
        <button
          onClick={toggleAudio}
          className={`p-4 rounded-full transition-colors ${
            isAudioOn
              ? 'bg-gray-600 hover:bg-gray-500 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
          title={isAudioOn ? 'Mute' : 'Unmute'}
        >
          {isAudioOn ? <Mic size={22} /> : <MicOff size={22} />}
        </button>

        {/* Toggle Video */}
        <button
          onClick={toggleVideo}
          className={`p-4 rounded-full transition-colors ${
            isVideoOn
              ? 'bg-gray-600 hover:bg-gray-500 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
          title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
        >
          {isVideoOn ? <Video size={22} /> : <VideoOff size={22} />}
        </button>

        {/* End Call */}
        <button
          onClick={handleEndCall}
          className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
          title="End call"
        >
          <PhoneOff size={22} />
        </button>
      </div>

    </div>
  );
};

export default VideoCallPage;