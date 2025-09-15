import { useRef, useState } from "react";

export default function RealtimeVoice() {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const [connected, setConnected] = useState(false);

  async function start() {
    // 1) Get ephemeral client_secret (+ optional session_id) from your server
    const r = await fetch("/realtime/session", { method: "POST" });
    if (!r.ok) throw new Error("Failed to fetch client_secret");
    const { client_secret, session_id } = await r.json();

    // 2) Create WebRTC peer connection
    const pc = new RTCPeerConnection();
    pcRef.current = pc;

    // Play remote audio as soon as a track arrives
    pc.ontrack = (e) => {
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = e.streams[0];
        // user gesture from clicking "Start" satisfies autoplay policy
        remoteAudioRef.current.play().catch(() => {});
      }
    };

    // Add microphone
    const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
    mic.getTracks().forEach((t) => pc.addTrack(t, mic));

    // Optional: data channel if you want to send control/events later
    pc.createDataChannel("oai-events");

    // 3) Create SDP offer and set as local description
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    // 4) POST the SDP to OpenAI Realtime (identified by the client_secret)
    // If your server didn't pre-create a session with model/voice,
    // add ?model=gpt-realtime to the URL. If it *did*, the token is enough.
    const base = "https://api.openai.com/v1/realtime";
    const url = session_id ? `${base}?session_id=${encodeURIComponent(session_id)}` : base;

    const resp = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${client_secret}`,
        "Content-Type": "application/sdp",
        Accept: "application/sdp",
      },
      body: offer.sdp,
    });
    const answer = await resp.text();
    await pc.setRemoteDescription({ type: "answer", sdp: answer });

    setConnected(true);
  }

  function stop() {
    setConnected(false);
    if (pcRef.current) {
      pcRef.current.getSenders().forEach((s) => s.track?.stop());
      pcRef.current.close();
      pcRef.current = null;
    }
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
  }

  return (
    <div className="p-4 space-y-3">
      <audio ref={remoteAudioRef} autoPlay />
      <div className="flex gap-2">
        {!connected ? (
          <button onClick={start} className="px-3 py-2 rounded bg-black text-white">
            Start voice
          </button>
        ) : (
          <button onClick={stop} className="px-3 py-2 rounded bg-gray-200">
            Stop
          </button>
        )}
      </div>
    </div>
  );
}
