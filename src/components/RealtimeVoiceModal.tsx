import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PhoneOff, Mic, MicOff, Volume2, X,
  Loader2, CheckCircle, AlertCircle
} from "lucide-react";
import { getApiEndpoint, API_ENDPOINTS } from "../config/api.config";

interface RealtimeVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  persona: {
    lead_id: string;
    full_name?: string;
    profile_image_url?: string;
  };
  language?: 'en-US' | 'ja';
}

export default function RealtimeVoiceModal({ isOpen, onClose, persona, language = 'en-US' }: RealtimeVoiceModalProps) {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const callTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (connected && !callTimerRef.current) {
      callTimerRef.current = window.setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else if (!connected && callTimerRef.current) {
      window.clearInterval(callTimerRef.current);
      callTimerRef.current = null;
      setCallDuration(0);
    }

    return () => {
      if (callTimerRef.current) {
        window.clearInterval(callTimerRef.current);
      }
    };
  }, [connected]);

  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

  async function start() {
    try {
      setConnecting(true);
      setError(null);

      // 1) Get ephemeral client_secret (+ optional session_id) from your server
      const response = await fetch(getApiEndpoint(API_ENDPOINTS.REALTIME_SESSION), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          persona_id: persona.lead_id,
          language: language,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch client_secret");
      }

      const { client_secret, session_id } = await response.json();

      // 2) Create WebRTC peer connection
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
        ],
      });
      pcRef.current = pc;

      // Play remote audio as soon as a track arrives
      pc.ontrack = (e) => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = e.streams[0];
          // user gesture from clicking "Start" satisfies autoplay policy
          remoteAudioRef.current.play().catch(() => {});
        }
      };

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
          setError("Connection lost");
          stop();
        }
      };

      // Add microphone
      const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = mic;
      mic.getTracks().forEach((t) => pc.addTrack(t, mic));

      // Optional: data channel if you want to send control/events later
      const dataChannel = pc.createDataChannel("oai-events");

      dataChannel.onopen = () => {
        console.log("Data channel opened");
      };

      dataChannel.onmessage = (event) => {
        console.log("Data channel message:", event.data);
      };

      // 3) Create SDP offer and set as local description
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // 4) POST the SDP to OpenAI Realtime (identified by the client_secret)
      const base = "https://api.openai.com/v1/realtime";
      const url = session_id
        ? `${base}?session_id=${encodeURIComponent(session_id)}`
        : `${base}?model=gpt-4o-realtime-preview-2024-12-17`;

      const resp = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${client_secret}`,
          "Content-Type": "application/sdp",
          Accept: "application/sdp",
        },
        body: offer.sdp,
      });

      if (!resp.ok) {
        throw new Error(`Failed to connect: ${resp.statusText}`);
      }

      const answer = await resp.text();
      await pc.setRemoteDescription({ type: "answer", sdp: answer });

      setConnected(true);
      setConnecting(false);
    } catch (err) {
      console.error("Failed to start voice call:", err);
      setError(err instanceof Error ? err.message : "Failed to start voice call");
      setConnecting(false);
      stop();
    }
  }

  function stop() {
    setConnected(false);
    setConnecting(false);

    if (pcRef.current) {
      pcRef.current.getSenders().forEach((s) => s.track?.stop());
      pcRef.current.close();
      pcRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }

    if (callTimerRef.current) {
      window.clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }

    setCallDuration(0);
  }

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const handleClose = () => {
    stop();
    onClose();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (isOpen && !connected && !connecting) {
      start();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-md glass border border-border rounded-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <audio ref={remoteAudioRef} autoPlay />

            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={24} />
            </button>

            <div className="text-center mb-6">
              <div className="relative inline-block mb-4">
                <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-1">
                  <img
                    src={getApiEndpoint(API_ENDPOINTS.PERSONA_IMAGE_MEDIUM(persona.lead_id))}
                    alt={persona.full_name || "Persona"}
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        persona.full_name || "Person"
                      )}&background=random&size=200`;
                    }}
                  />
                </div>
                {connected && (
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    {formatDuration(callDuration)}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-2 mb-1">
                <h3 className="text-xl font-semibold">{persona.full_name || "Unknown"}</h3>
                <span className="bg-yellow-500 text-black text-xs px-1.5 py-0.5 rounded font-semibold">
                  BETA
                </span>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm">
                {connecting && (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span className="text-yellow-500">Connecting...</span>
                  </>
                )}
                {connected && (
                  <>
                    <CheckCircle size={20} className="text-green-500" />
                    <span className="text-green-500">Connected</span>
                  </>
                )}
                {error && (
                  <>
                    <AlertCircle size={20} className="text-red-500" />
                    <span className="text-red-500">{error}</span>
                  </>
                )}
                {!connecting && !connected && !error && (
                  <span className="text-gray-500">Initializing...</span>
                )}
              </div>
            </div>

            {/* Call Status Message */}
            <div className="mb-6 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-center text-muted-foreground">
                {connecting && "Setting up secure voice connection..."}
                {connected && `Speaking with ${persona.full_name || "persona"}`}
                {error && "Please try again or check your microphone permissions"}
                {!connecting && !connected && !error && "Preparing voice call..."}
              </p>
              {connected && (
                <p className="text-xs text-center text-muted-foreground mt-2">
                  This is a beta feature powered by OpenAI Realtime API
                </p>
              )}
            </div>

            {/* Call Controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={toggleMute}
                disabled={!connected}
                className={`p-4 rounded-full transition-all ${
                  isMuted
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-muted hover:bg-muted/80"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
              </button>

              <button
                onClick={handleClose}
                className="p-4 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <PhoneOff size={24} />
              </button>

              <button
                disabled={!connected}
                className="p-4 bg-muted rounded-full hover:bg-muted/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Volume2 size={24} />
              </button>
            </div>

            {/* Retry Button */}
            {error && !connecting && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    stop();
                    start();
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}