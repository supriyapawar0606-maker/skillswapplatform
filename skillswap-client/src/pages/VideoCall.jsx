import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  FiMic,
  FiMicOff,
  FiVideo,
  FiVideoOff,
  FiPhoneOff,
  FiUsers,
  FiWifi,
} from "react-icons/fi";

import socket from "../socket/socket";

import "./VideoCall.css";

// ======================================================
// WebRTC ICE Servers
// ======================================================

const ICE_SERVERS = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
    {
      urls: "stun:stun1.l.google.com:19302",
    },
  ],
};

// ======================================================
// Video Call Component
// ======================================================

export default function VideoCall() {
  const { sessionId } = useParams();

  const navigate = useNavigate();

  // ====================================================
  // Refs
  // ====================================================

  const socketRef = useRef(null);

  const peerConnectionRef = useRef(null);

  const localVideoRef = useRef(null);

  const remoteVideoRef = useRef(null);

  const localStreamRef = useRef(null);

  const remoteStreamRef = useRef(null);

  const pendingCandidatesRef = useRef([]);

  const mountedRef = useRef(false);

  const joinedRoomRef = useRef(false);

  const makingOfferRef = useRef(false);

  const handlingOfferRef = useRef(false);

  const handlingAnswerRef = useRef(false);

  const remoteSocketIdRef = useRef(null);

  // Prevent duplicate ICE candidates
  const receivedCandidatesRef = useRef(new Set());

  // ====================================================
  // State
  // ====================================================

  const [micEnabled, setMicEnabled] = useState(true);

  const [cameraEnabled, setCameraEnabled] =
    useState(true);

  const [connected, setConnected] =
    useState(false);

  const [remoteConnected, setRemoteConnected] =
    useState(false);

  const [error, setError] = useState("");

  // ====================================================
  // Attach Local Stream
  // ====================================================

  const attachLocalStream = () => {
    if (
      !localVideoRef.current ||
      !localStreamRef.current
    ) {
      return;
    }

    localVideoRef.current.srcObject =
      localStreamRef.current;

    localVideoRef.current
      .play()
      .catch(() => {});
  };

  // ====================================================
  // Attach Remote Stream
  // ====================================================

  const attachRemoteStream = () => {
    if (
      !remoteVideoRef.current ||
      !remoteStreamRef.current
    ) {
      return;
    }

    remoteVideoRef.current.srcObject =
      remoteStreamRef.current;

    remoteVideoRef.current
      .play()
      .catch(() => {
        console.log(
          "Remote video autoplay waiting"
        );
      });
  };

  // ====================================================
  // Close Peer Connection
  // ====================================================

  const closePeerConnection = () => {
    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.ontrack =
          null;

        peerConnectionRef.current.onicecandidate =
          null;

        peerConnectionRef.current.onconnectionstatechange =
          null;

        peerConnectionRef.current.oniceconnectionstatechange =
          null;

        peerConnectionRef.current.close();
      } catch (error) {
        console.warn(
          "Peer close warning:",
          error
        );
      }

      peerConnectionRef.current = null;
    }

    remoteStreamRef.current = null;

    pendingCandidatesRef.current = [];

    receivedCandidatesRef.current.clear();

    remoteSocketIdRef.current = null;

    makingOfferRef.current = false;

    handlingOfferRef.current = false;

    handlingAnswerRef.current = false;

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    setRemoteConnected(false);
  };

  // ====================================================
  // Create Peer Connection
  // ====================================================

  const createPeerConnection = () => {
    if (peerConnectionRef.current) {
      return peerConnectionRef.current;
    }

    console.log(
      "🔗 Creating RTCPeerConnection"
    );

    const peerConnection =
      new RTCPeerConnection(
        ICE_SERVERS
      );

    peerConnectionRef.current =
      peerConnection;

    // ==================================================
    // Add Local Tracks
    // ==================================================

    if (localStreamRef.current) {
      localStreamRef.current
        .getTracks()
        .forEach((track) => {
          console.log(
            "🎥 Adding local track:",
            track.kind
          );

          peerConnection.addTrack(
            track,
            localStreamRef.current
          );
        });
    }

    // ==================================================
    // Remote Track
    // ==================================================

    peerConnection.ontrack = (event) => {
      console.log(
        "📹 Remote track received:",
        event.track.kind
      );

      let remoteStream =
        remoteStreamRef.current;

      if (!remoteStream) {
        remoteStream =
          new MediaStream();

        remoteStreamRef.current =
          remoteStream;
      }

      const alreadyExists =
        remoteStream
          .getTracks()
          .some(
            (track) =>
              track.id ===
              event.track.id
          );

      if (!alreadyExists) {
        remoteStream.addTrack(
          event.track
        );
      }

      setRemoteConnected(true);

      attachRemoteStream();

      setTimeout(() => {
        attachRemoteStream();
      }, 100);
    };

    // ==================================================
    // ICE Candidate
    // ==================================================

    peerConnection.onicecandidate =
      (event) => {
        if (
          !event.candidate ||
          !socketRef.current?.connected
        ) {
          return;
        }

        console.log(
          "🧊 Sending ICE candidate"
        );

        socketRef.current.emit(
          "webrtc-ice-candidate",
          {
            roomId: sessionId,

            candidate:
              event.candidate,

            targetSocketId:
              remoteSocketIdRef.current ||
              undefined,
          }
        );
      };

    // ==================================================
    // Connection State
    // ==================================================

    peerConnection.onconnectionstatechange =
      () => {
        const state =
          peerConnection.connectionState;

        console.log(
          "🌐 WebRTC connection state:",
          state
        );

        switch (state) {
          case "connected":
            console.log(
              "✅ WebRTC connected"
            );

            setRemoteConnected(true);

            attachRemoteStream();

            break;

          case "disconnected":
            console.log(
              "⚠️ WebRTC disconnected"
            );

            setRemoteConnected(false);

            break;

          case "failed":
            console.error(
              "❌ WebRTC connection failed"
            );

            setRemoteConnected(false);

            break;

          case "closed":
            setRemoteConnected(false);

            break;

          default:
            break;
        }
      };

    // ==================================================
    // ICE Connection State
    // ==================================================

    peerConnection.oniceconnectionstatechange =
      () => {
        const state =
          peerConnection.iceConnectionState;

        console.log(
          "🧊 ICE state:",
          state
        );

        if (
          state === "connected" ||
          state === "completed"
        ) {
          console.log(
            "✅ ICE connection established"
          );

          setRemoteConnected(true);

          attachRemoteStream();
        }

        if (state === "failed") {
          console.error(
            "❌ ICE connection failed"
          );
        }
      };

    return peerConnection;
  };

  // ====================================================
  // Flush Pending ICE Candidates
  // ====================================================

  const flushPendingCandidates =
    async () => {
      const peerConnection =
        peerConnectionRef.current;

      if (!peerConnection) {
        return;
      }

      if (
        !peerConnection.remoteDescription
      ) {
        return;
      }

      const candidates =
        pendingCandidatesRef.current;

      pendingCandidatesRef.current = [];

      for (
        const candidate of candidates
      ) {
        try {
          await peerConnection.addIceCandidate(
            new RTCIceCandidate(
              candidate
            )
          );

          console.log(
            "🧊 Pending ICE candidate added"
          );
        } catch (error) {
          console.error(
            "❌ Pending ICE candidate error:",
            error
          );
        }
      }
    };

  // ====================================================
  // Create Offer
  // ====================================================

  const createOffer = async () => {
    const peerConnection =
      createPeerConnection();

    if (!peerConnection) {
      return;
    }

    // IMPORTANT:
    // Never create multiple offers simultaneously.
    if (makingOfferRef.current) {
      console.log(
        "⚠️ Offer already being created"
      );

      return;
    }

    // IMPORTANT:
    // createOffer is only valid from stable state.
    if (
      peerConnection.signalingState !==
      "stable"
    ) {
      console.log(
        "⚠️ Cannot create offer. Current state:",
        peerConnection.signalingState
      );

      return;
    }

    try {
      makingOfferRef.current = true;

      console.log(
        "📤 Creating WebRTC offer"
      );

      const offer =
        await peerConnection.createOffer();

      // State may have changed while awaiting.
      if (
        peerConnection.signalingState !==
        "stable"
      ) {
        console.log(
          "⚠️ Offer cancelled because signaling state changed:",
          peerConnection.signalingState
        );

        return;
      }

      await peerConnection.setLocalDescription(
        offer
      );

      if (
        !socketRef.current?.connected
      ) {
        console.warn(
          "⚠️ Socket disconnected. Offer not sent."
        );

        return;
      }

      socketRef.current.emit(
        "webrtc-offer",
        {
          roomId: sessionId,

          offer:
            peerConnection.localDescription,

          targetSocketId:
            remoteSocketIdRef.current ||
            undefined,
        }
      );

      console.log(
        "📤 WebRTC offer sent"
      );
    } catch (error) {
      console.error(
        "❌ Create offer error:",
        error
      );
    } finally {
      makingOfferRef.current = false;
    }
  };

  // ====================================================
  // Handle Offer
  // ====================================================

  const handleOffer = async (
    offer,
    sender
  ) => {
    if (!offer) {
      return;
    }

    // ==================================================
    // DUPLICATE OFFER PROTECTION
    // ==================================================

    if (handlingOfferRef.current) {
      console.log(
        "⚠️ Offer already being processed. Ignoring duplicate."
      );

      return;
    }

    const peerConnection =
      createPeerConnection();

    if (!peerConnection) {
      return;
    }

    // ==================================================
    // CRITICAL FIX
    // ==================================================
    //
    // createAnswer() is only allowed when:
    //
    // have-remote-offer
    //
    // If the duplicate offer arrives after the
    // first offer has already been answered, the
    // state becomes "stable".
    //
    // We MUST ignore it.
    // ==================================================

    if (
      peerConnection.signalingState !==
      "stable"
    ) {
      console.log(
        "⚠️ Ignoring offer because signaling state is:",
        peerConnection.signalingState
      );

      return;
    }

    try {
      handlingOfferRef.current = true;

      console.log(
        "📥 WebRTC offer received"
      );

      if (sender) {
        remoteSocketIdRef.current =
          sender;
      }

      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(
          offer
        )
      );

      console.log(
        "✅ Remote offer description set"
      );

      // ==================================================
      // IMPORTANT SECOND STATE CHECK
      // ==================================================

      if (
        peerConnection.signalingState !==
        "have-remote-offer"
      ) {
        console.log(
          "⚠️ Cannot create answer. Current state:",
          peerConnection.signalingState
        );

        return;
      }

      await flushPendingCandidates();

      const answer =
        await peerConnection.createAnswer();

      await peerConnection.setLocalDescription(
        answer
      );

      if (
        socketRef.current?.connected
      ) {
        socketRef.current.emit(
          "webrtc-answer",
          {
            roomId: sessionId,

            answer:
              peerConnection.localDescription,

            targetSocketId:
              remoteSocketIdRef.current ||
              sender ||
              undefined,
          }
        );

        console.log(
          "📤 WebRTC answer sent"
        );
      }
    } catch (error) {
      console.error(
        "❌ Handle offer error:",
        error
      );
    } finally {
      handlingOfferRef.current = false;
    }
  };

  // ====================================================
  // Handle Answer
  // ====================================================

  const handleAnswer = async (
    answer,
    sender
  ) => {
    if (!answer) {
      return;
    }

    if (handlingAnswerRef.current) {
      console.log(
        "⚠️ Answer already being processed"
      );

      return;
    }

    const peerConnection =
      peerConnectionRef.current;

    if (!peerConnection) {
      console.warn(
        "⚠️ No peer connection for answer"
      );

      return;
    }

    // ==================================================
    // CRITICAL STATE CHECK
    // ==================================================

    if (
      peerConnection.signalingState !==
      "have-local-offer"
    ) {
      console.log(
        "⚠️ Ignoring answer. Current state:",
        peerConnection.signalingState
      );

      return;
    }

    try {
      handlingAnswerRef.current = true;

      console.log(
        "📥 WebRTC answer received"
      );

      if (sender) {
        remoteSocketIdRef.current =
          sender;
      }

      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(
          answer
        )
      );

      console.log(
        "✅ Remote answer description set"
      );

      await flushPendingCandidates();
    } catch (error) {
      console.error(
        "❌ Handle answer error:",
        error
      );
    } finally {
      handlingAnswerRef.current = false;
    }
  };

  // ====================================================
  // Handle ICE Candidate
  // ====================================================

  const handleIceCandidate =
    async (candidate) => {
      if (!candidate) {
        return;
      }

      try {
        const candidateKey =
          JSON.stringify(candidate);

        // Ignore duplicate ICE candidate.
        if (
          receivedCandidatesRef.current.has(
            candidateKey
          )
        ) {
          console.log(
            "⚠️ Duplicate ICE candidate ignored"
          );

          return;
        }

        receivedCandidatesRef.current.add(
          candidateKey
        );

        const peerConnection =
          peerConnectionRef.current;

        // ==================================================
        // Peer connection doesn't exist yet
        // ==================================================

        if (!peerConnection) {
          console.log(
            "🧊 Storing ICE candidate - peer not ready"
          );

          pendingCandidatesRef.current.push(
            candidate
          );

          return;
        }

        // ==================================================
        // Remote description not ready
        // ==================================================

        if (
          !peerConnection.remoteDescription
        ) {
          console.log(
            "🧊 Storing ICE candidate - remote description not ready"
          );

          pendingCandidatesRef.current.push(
            candidate
          );

          return;
        }

        await peerConnection.addIceCandidate(
          new RTCIceCandidate(
            candidate
          )
        );

        console.log(
          "🧊 ICE candidate added"
        );
      } catch (error) {
        console.error(
          "❌ ICE candidate error:",
          error
        );
      }
    };

  // ====================================================
  // Join Video Room
  // ====================================================

  const joinVideoRoom = () => {
    if (
      !socketRef.current?.connected
    ) {
      console.log(
        "⚠️ Cannot join room. Socket not connected."
      );

      return;
    }

    if (!sessionId) {
      return;
    }

    if (joinedRoomRef.current) {
      console.log(
        "⚠️ Already joined video room:",
        sessionId
      );

      return;
    }

    joinedRoomRef.current = true;

    console.log(
      "🚪 Joining video room:",
      sessionId
    );

    socketRef.current.emit(
      "join-video-room",
      {
        roomId: sessionId,
      }
    );
  };

  // ====================================================
  // Initialize Video Call
  // ====================================================

  useEffect(() => {
    mountedRef.current = true;

    socketRef.current = socket;

    const initializeCall =
      async () => {
        try {
          setError("");

          // ==========================================
          // Validate Session
          // ==========================================

          if (!sessionId) {
            setError(
              "Invalid video call session."
            );

            return;
          }

          // ==========================================
          // Browser Support
          // ==========================================

          if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices
              .getUserMedia
          ) {
            setError(
              "Your browser does not support camera and microphone access."
            );

            return;
          }

          // ==========================================
          // Camera + Microphone
          // ==========================================

          console.log(
            "🎥 Requesting camera and microphone..."
          );

          const stream =
            await navigator.mediaDevices.getUserMedia(
              {
                video: true,
                audio: true,
              }
            );

          if (!mountedRef.current) {
            stream
              .getTracks()
              .forEach((track) =>
                track.stop()
              );

            return;
          }

          localStreamRef.current =
            stream;

          attachLocalStream();

          console.log(
            "✅ Camera and microphone ready"
          );

          // ==========================================
          // Socket Events
          // ==========================================

          const handleConnect =
            () => {
              if (
                !mountedRef.current
              ) {
                return;
              }

              console.log(
                "🟢 VideoCall Socket connected:",
                socket.id
              );

              setConnected(true);

              // Socket reconnect means we may need
              // to join the room again.
              joinedRoomRef.current =
                false;

              joinVideoRoom();
            };

          const handleConnectError =
            (socketError) => {
              console.error(
                "❌ Socket connection error:",
                socketError?.message ||
                  socketError
              );

              if (
                mountedRef.current
              ) {
                setConnected(false);

                setError(
                  "Unable to connect to the video call server."
                );
              }
            };

          const handleDisconnect =
            (reason) => {
              console.log(
                "🔴 VideoCall Socket disconnected:",
                reason
              );

              if (
                mountedRef.current
              ) {
                setConnected(false);
              }
            };

          // ==========================================
          // Video Room Role
          // ==========================================

          const handleVideoRoomRole =
            ({
              role,
              otherSocketId,
            } = {}) => {
              if (
                !mountedRef.current
              ) {
                return;
              }

              console.log(
                "🎯 Video room role:",
                role,
                otherSocketId
              );

              if (otherSocketId) {
                remoteSocketIdRef.current =
                  otherSocketId;
              }

              // ========================================
              // Waiting
              // ========================================

              if (role === "waiting") {
                console.log(
                  "⏳ Waiting for participant..."
                );

                return;
              }

              // ========================================
              // Receiver
              // ========================================

              if (role === "receiver") {
                console.log(
                  "📥 You are the receiver"
                );

                return;
              }

              // ========================================
              // Initiator
              // ========================================

              if (role === "initiator") {
                console.log(
                  "📤 You are the initiator"
                );

                setTimeout(() => {
                  if (
                    !mountedRef.current
                  ) {
                    return;
                  }

                  createOffer();
                }, 300);
              }
            };

          // ==========================================
          // Offer
          // ==========================================

          const handleOfferEvent =
            async ({
              offer,
              sender,
            } = {}) => {
              if (!offer) {
                return;
              }

              await handleOffer(
                offer,
                sender
              );
            };

          // ==========================================
          // Answer
          // ==========================================

          const handleAnswerEvent =
            async ({
              answer,
              sender,
            } = {}) => {
              if (!answer) {
                return;
              }

              await handleAnswer(
                answer,
                sender
              );
            };

          // ==========================================
          // ICE
          // ==========================================

          const handleIceEvent =
            async ({
              candidate,
              sender,
            } = {}) => {
              if (!candidate) {
                return;
              }

              if (sender) {
                remoteSocketIdRef.current =
                  sender;
              }

              await handleIceCandidate(
                candidate
              );
            };

          // ==========================================
          // User Left
          // ==========================================

          const handleUserLeft =
            ({
              socketId,
            } = {}) => {
              console.log(
                "👋 Other participant left:",
                socketId
              );

              closePeerConnection();

              console.log(
                "⏳ Waiting for another participant..."
              );
            };

          // ==========================================
          // Room Full
          // ==========================================

          const handleRoomFull =
            () => {
              console.warn(
                "🚫 Video room is full"
              );

              setError(
                "This video call already has two participants."
              );
            };

          // ==========================================
          // Register Events
          // ==========================================

          socket.on(
            "connect",
            handleConnect
          );

          socket.on(
            "connect_error",
            handleConnectError
          );

          socket.on(
            "disconnect",
            handleDisconnect
          );

          socket.on(
            "video-room-role",
            handleVideoRoomRole
          );

          socket.on(
            "webrtc-offer",
            handleOfferEvent
          );

          socket.on(
            "webrtc-answer",
            handleAnswerEvent
          );

          socket.on(
            "webrtc-ice-candidate",
            handleIceEvent
          );

          socket.on(
            "user-left",
            handleUserLeft
          );

          socket.on(
            "video-room-full",
            handleRoomFull
          );

          // ==========================================
          // Connect Socket
          // ==========================================

          if (!socket.connected) {
            console.log(
              "🔌 Connecting global Socket.IO..."
            );

            socket.connect();
          } else {
            console.log(
              "🟢 Global Socket.IO already connected:",
              socket.id
            );

            setConnected(true);

            joinVideoRoom();
          }

          // ==========================================
          // Cleanup Event Listeners
          // ==========================================

          return () => {
            socket.off(
              "connect",
              handleConnect
            );

            socket.off(
              "connect_error",
              handleConnectError
            );

            socket.off(
              "disconnect",
              handleDisconnect
            );

            socket.off(
              "video-room-role",
              handleVideoRoomRole
            );

            socket.off(
              "webrtc-offer",
              handleOfferEvent
            );

            socket.off(
              "webrtc-answer",
              handleAnswerEvent
            );

            socket.off(
              "webrtc-ice-candidate",
              handleIceEvent
            );

            socket.off(
              "user-left",
              handleUserLeft
            );

            socket.off(
              "video-room-full",
              handleRoomFull
            );
          };
        } catch (error) {
          console.error(
            "❌ Video call initialization error:",
            error
          );

          if (
            !mountedRef.current
          ) {
            return;
          }

          if (
            error.name ===
            "NotAllowedError"
          ) {
            setError(
              "Camera or microphone permission was denied. Please allow access and try again."
            );
          } else if (
            error.name ===
            "NotFoundError"
          ) {
            setError(
              "No camera or microphone was found."
            );
          } else if (
            error.name ===
            "NotReadableError"
          ) {
            setError(
              "Camera or microphone is already being used by another application."
            );
          } else {
            setError(
              "Unable to start the video call."
            );
          }
        }
      };

    initializeCall();

    // ==================================================
    // Main Cleanup
    // ==================================================

    return () => {
      mountedRef.current = false;

      console.log(
        "🧹 Cleaning up video call"
      );

      // ================================================
      // Leave Video Room
      // ================================================

      if (
        socketRef.current?.connected &&
        sessionId
      ) {
        socketRef.current.emit(
          "leave-video-room",
          {
            roomId: sessionId,
          }
        );
      }

      // ================================================
      // IMPORTANT:
      // Do NOT disconnect global Socket.IO.
      // ================================================

      // socket.disconnect();

      // ================================================
      // Close WebRTC
      // ================================================

      if (
        peerConnectionRef.current
      ) {
        try {
          peerConnectionRef.current.close();
        } catch (error) {
          console.warn(
            "Peer close warning:",
            error
          );
        }

        peerConnectionRef.current =
          null;
      }

      // ================================================
      // Stop Camera + Microphone
      // ================================================

      if (
        localStreamRef.current
      ) {
        localStreamRef.current
          .getTracks()
          .forEach((track) => {
            track.stop();
          });

        localStreamRef.current =
          null;
      }

      // ================================================
      // Clear Videos
      // ================================================

      if (
        localVideoRef.current
      ) {
        localVideoRef.current.srcObject =
          null;
      }

      if (
        remoteVideoRef.current
      ) {
        remoteVideoRef.current.srcObject =
          null;
      }

      // ================================================
      // Reset Refs
      // ================================================

      remoteStreamRef.current =
        null;

      pendingCandidatesRef.current =
        [];

      receivedCandidatesRef.current.clear();

      makingOfferRef.current =
        false;

      handlingOfferRef.current =
        false;

      handlingAnswerRef.current =
        false;

      joinedRoomRef.current =
        false;

      remoteSocketIdRef.current =
        null;
    };
  }, [sessionId]);

  // ====================================================
  // Reattach Remote Video
  // ====================================================

  useEffect(() => {
    if (remoteConnected) {
      attachRemoteStream();
    }
  }, [remoteConnected]);

  // ====================================================
  // Toggle Microphone
  // ====================================================

  const toggleMicrophone = () => {
    if (!localStreamRef.current) {
      return;
    }

    const audioTracks =
      localStreamRef.current.getAudioTracks();

    const newState =
      !micEnabled;

    audioTracks.forEach(
      (track) => {
        track.enabled = newState;
      }
    );

    setMicEnabled(newState);
  };

  // ====================================================
  // Toggle Camera
  // ====================================================

  const toggleCamera = () => {
    if (!localStreamRef.current) {
      return;
    }

    const videoTracks =
      localStreamRef.current.getVideoTracks();

    const newState =
      !cameraEnabled;

    videoTracks.forEach(
      (track) => {
        track.enabled = newState;
      }
    );

    setCameraEnabled(newState);
  };

  // ====================================================
  // Leave Call
  // ====================================================

  const leaveCall = () => {
    console.log(
      "📞 Leaving video call"
    );

    // ================================================
    // Tell server
    // ================================================

    if (
      socketRef.current?.connected
    ) {
      socketRef.current.emit(
        "leave-video-room",
        {
          roomId: sessionId,
        }
      );
    }

    // ================================================
    // Close Peer
    // ================================================

    if (
      peerConnectionRef.current
    ) {
      try {
        peerConnectionRef.current.close();
      } catch (error) {
        console.warn(
          "Peer close warning:",
          error
        );
      }

      peerConnectionRef.current =
        null;
    }

    // ================================================
    // Stop Camera + Microphone
    // ================================================

    if (
      localStreamRef.current
    ) {
      localStreamRef.current
        .getTracks()
        .forEach((track) => {
          track.stop();
        });

      localStreamRef.current =
        null;
    }

    // ================================================
    // Clear Videos
    // ================================================

    if (
      localVideoRef.current
    ) {
      localVideoRef.current.srcObject =
        null;
    }

    if (
      remoteVideoRef.current
    ) {
      remoteVideoRef.current.srcObject =
        null;
    }

    // ================================================
    // Reset
    // ================================================

    remoteStreamRef.current =
      null;

    pendingCandidatesRef.current =
      [];

    receivedCandidatesRef.current.clear();

    joinedRoomRef.current =
      false;

    remoteSocketIdRef.current =
      null;

    // ================================================
    // Do NOT disconnect global Socket.IO
    // ================================================

    navigate(
      "/dashboard/schedule"
    );
  };

  // ====================================================
  // Error Screen
  // ====================================================

  if (error) {
    return (
      <div className="video-call-page">
        <div className="video-error-screen">
          <div className="video-error-card">
            <div className="error-icon">
              <FiVideoOff size={42} />
            </div>

            <h1>
              Unable to start video call
            </h1>

            <p>{error}</p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/dashboard/schedule"
                )
              }
              className="back-button"
            >
              Back to Schedule
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ====================================================
  // Render
  // ====================================================

  return (
    <div className="video-call-page">

      {/* ==========================================
          Header
      ========================================== */}

      <div className="video-call-header">

        <div>
          <h1>
            SkillSwap Video Call
          </h1>

          <div className="connection-status">

            <span
              className={
                connected
                  ? "status-dot online"
                  : "status-dot"
              }
            />

            {connected
              ? "Connected"
              : "Connecting..."}
          </div>
        </div>

        <div className="session-info">

          <FiWifi size={16} />

          <span>
            Session: {sessionId}
          </span>

        </div>

      </div>

      {/* ==========================================
          Video Area
      ========================================== */}

      <div className="video-area">

        {/* ========================================
            Remote Video
        ======================================== */}

        <div className="remote-video-container">

          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="remote-video"
          />

          {!remoteConnected && (
            <div className="waiting-screen">

              <div className="waiting-icon">
                <FiUsers size={34} />
              </div>

              <h2>
                Waiting for participant
              </h2>

              <p>
                Ask the other participant
                to join the session.
              </p>

            </div>
          )}

          <div className="participant-label">

            <FiUsers size={14} />

            <span>
              {remoteConnected
                ? "Participant"
                : "Waiting..."}
            </span>

          </div>

        </div>

        {/* ========================================
            Local Video
        ======================================== */}

        <div className="local-video-container">

          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="local-video"
          />

          {!cameraEnabled && (
            <div className="camera-off">

              <FiVideoOff size={22} />

              <span>
                Camera Off
              </span>

            </div>
          )}

          <div className="local-label">
            You
          </div>

        </div>

      </div>

      {/* ==========================================
          Controls
      ========================================== */}

      <div className="video-controls">

        {/* Microphone */}

        <button
          type="button"
          onClick={
            toggleMicrophone
          }
          className={`control-button ${
            !micEnabled
              ? "disabled-control"
              : ""
          }`}
        >
          {micEnabled ? (
            <FiMic size={22} />
          ) : (
            <FiMicOff size={22} />
          )}

          <span>
            {micEnabled
              ? "Mute"
              : "Unmute"}
          </span>
        </button>

        {/* Camera */}

        <button
          type="button"
          onClick={
            toggleCamera
          }
          className={`control-button ${
            !cameraEnabled
              ? "disabled-control"
              : ""
          }`}
        >
          {cameraEnabled ? (
            <FiVideo size={22} />
          ) : (
            <FiVideoOff size={22} />
          )}

          <span>
            {cameraEnabled
              ? "Camera"
              : "Camera Off"}
          </span>
        </button>

        {/* Leave */}

        <button
          type="button"
          onClick={leaveCall}
          className="leave-button"
        >
          <FiPhoneOff size={22} />

          <span>
            Leave
          </span>
        </button>

      </div>

    </div>
  );
}