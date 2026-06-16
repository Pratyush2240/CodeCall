import { useEffect, useRef, useState, useCallback } from "react";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

/**
 * useWebRTC — peer-to-peer audio/video over Socket.IO signaling.
 *
 * Manages:
 *   - Local media stream (camera + mic)
 *   - RTCPeerConnection per remote peer
 *   - SDP offer/answer + ICE candidate exchange
 *   - Mic/cam toggle
 *   - Clean disconnect
 *
 * @param {import("socket.io-client").Socket | null} socket
 * @param {string} roomId
 * @param {string | null} currentUserId
 */
export function useWebRTC(socket, roomId, currentUserId) {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({}); // userId → MediaStream
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isInCall, setIsInCall] = useState(false);

  const peerConnections = useRef({}); // userId → RTCPeerConnection
  const localStreamRef = useRef(null);

  // ── Create a peer connection for a remote user ───────────
  const createPeer = useCallback(
    (remoteUserId) => {
      if (peerConnections.current[remoteUserId]) return peerConnections.current[remoteUserId];

      const pc = new RTCPeerConnection(ICE_SERVERS);

      // Add local tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current);
        });
      }

      // ICE candidates → send to remote
      pc.onicecandidate = (e) => {
        if (e.candidate && socket?.connected) {
          socket.emit("webrtc-ice-candidate", {
            roomId,
            target: remoteUserId,
            candidate: e.candidate,
          });
        }
      };

      // Remote tracks → store stream
      pc.ontrack = (e) => {
        setRemoteStreams((prev) => ({
          ...prev,
          [remoteUserId]: e.streams[0],
        }));
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
          cleanupPeer(remoteUserId);
        }
      };

      peerConnections.current[remoteUserId] = pc;
      return pc;
    },
    [socket, roomId]
  );

  const cleanupPeer = useCallback((userId) => {
    const pc = peerConnections.current[userId];
    if (pc) {
      pc.close();
      delete peerConnections.current[userId];
    }
    setRemoteStreams((prev) => {
      const next = { ...prev };
      delete next[userId];
      return next;
    });
  }, []);

  // ── Socket signaling listeners ───────────────────────────
  useEffect(() => {
    if (!socket || !isInCall) return;

    const onOffer = async ({ offer, target, from }) => {
      if (from === currentUserId || target !== currentUserId) return;
      const pc = createPeer(from);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("webrtc-answer", { roomId, target: from, answer });
    };

    const onAnswer = async ({ answer, target, from }) => {
      if (target !== currentUserId) return;
      const pc = peerConnections.current[from];
      if (pc && pc.signalingState === "have-local-offer") {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    };

    const onIceCandidate = async ({ candidate, target, from }) => {
      if (target !== currentUserId) return;
      const pc = peerConnections.current[from];
      if (pc && candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.warn("[webrtc] ICE candidate error:", err.message);
        }
      }
    };

    const onPeerLeft = ({ userId }) => {
      cleanupPeer(userId);
    };

    const onPeerJoined = async ({ userId }) => {
      if (userId === currentUserId || !isInCall) return;
      const pc = createPeer(userId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("webrtc-offer", { roomId, target: userId, offer });
    };

    socket.on("webrtc-offer", onOffer);
    socket.on("webrtc-answer", onAnswer);
    socket.on("webrtc-ice-candidate", onIceCandidate);
    socket.on("webrtc-peer-left", onPeerLeft);
    socket.on("webrtc-peer-joined", onPeerJoined);

    return () => {
      socket.off("webrtc-offer", onOffer);
      socket.off("webrtc-answer", onAnswer);
      socket.off("webrtc-ice-candidate", onIceCandidate);
      socket.off("webrtc-peer-left", onPeerLeft);
      socket.off("webrtc-peer-joined", onPeerJoined);
    };
  }, [socket, isInCall, roomId, currentUserId, createPeer, cleanupPeer]);

  // ── Join call — acquire media + signal ───────────────────
  const joinCall = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
      setIsInCall(true);
      setIsMicOn(true);
      setIsCamOn(true);
      if (socket?.connected) {
        socket.emit("webrtc-join", { roomId });
      }
    } catch (err) {
      console.error("[webrtc] Failed to get media:", err.message);
      // Try audio-only fallback
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true,
        });
        localStreamRef.current = stream;
        setLocalStream(stream);
        setIsInCall(true);
        setIsMicOn(true);
        setIsCamOn(false);
        if (socket?.connected) {
          socket.emit("webrtc-join", { roomId });
        }
      } catch (audioErr) {
        console.error("[webrtc] No media available:", audioErr.message);
      }
    }
  }, [socket, roomId]);

  // ── Leave call — cleanup everything ──────────────────────
  const leaveCall = useCallback(() => {
    // Stop all local tracks
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    setLocalStream(null);

    // Close all peer connections
    Object.keys(peerConnections.current).forEach(cleanupPeer);

    // Notify room
    if (socket?.connected) {
      socket.emit("webrtc-leave", { roomId });
    }

    setRemoteStreams({});
    setIsInCall(false);
  }, [socket, roomId, cleanupPeer]);

  // ── Toggle mic ───────────────────────────────────────────
  const toggleMic = useCallback(() => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getAudioTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setIsMicOn((prev) => !prev);
  }, []);

  // ── Toggle camera ────────────────────────────────────────
  const toggleCam = useCallback(() => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getVideoTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setIsCamOn((prev) => !prev);
  }, []);

  // ── Cleanup on unmount ───────────────────────────────────
  useEffect(() => {
    return () => {
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      Object.values(peerConnections.current).forEach((pc) => pc.close());
    };
  }, []);

  return {
    localStream,
    remoteStreams,
    isInCall,
    isMicOn,
    isCamOn,
    joinCall,
    leaveCall,
    toggleMic,
    toggleCam,
  };
}
