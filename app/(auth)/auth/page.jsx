"use client"
import { useEffect, useRef, useState } from "react";
import Peer from "peerjs";

export default function Home() {
    const [peerId, setPeerId] = useState("");
    const [otherPeerId, setOtherPeerId] = useState("");
    const [peerInstance, setPeerInstance] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [incomingCall, setIncomingCall] = useState(null);
    const videoRef = useRef(null);
    const otherVideoRef = useRef(null);

    useEffect(() => {
        // Initialize Peer
        const peer = new Peer(undefined, {
            host: 'peer-server-s7xw.onrender.com',  // Replace with your Render domain
            port: 443,                      // Use port 443 for HTTPS
            path: '/peerjs',                // Ensure this matches the path on the server
            secure: true,
        });

        setPeerInstance(peer);

        // Get Peer ID
        peer.on("open", (id) => {
            setPeerId(id);
            console.log("My peer ID is: " + id);
        });

        // Listen for incoming calls
        peer.on("call", (call) => {
            // Notify the teacher about the incoming call
            setIncomingCall(call);
        });

        return () => peer.destroy();
    }, []);

    const handleIncomingCall = () => {
        if (incomingCall) {
            navigator.mediaDevices
                .getUserMedia({ video: true, audio: true })
                .then((stream) => {
                    videoRef.current.srcObject = stream;
                    incomingCall.answer(stream); // Answer the call with your video stream
                    incomingCall.on("stream", (remoteStream) => {
                        otherVideoRef.current.srcObject = remoteStream; // Show the incoming stream
                    });
                    setIsConnected(true);
                    setIncomingCall(null); // Clear the incoming call state
                })
                .catch((err) => console.error("Failed to get local stream", err));
        }
    };

    const rejectIncomingCall = () => {
        if (incomingCall) {
            incomingCall.close(); // Reject the call
            setIncomingCall(null); // Clear the incoming call state
        }
    };

    const connectToPeer = () => {
        if (otherPeerId && peerInstance) {
            navigator.mediaDevices
                .getUserMedia({ video: true, audio: true })
                .then((stream) => {
                    videoRef.current.srcObject = stream;
                    const call = peerInstance.call(otherPeerId, stream);
                    call.on("stream", (remoteStream) => {
                        otherVideoRef.current.srcObject = remoteStream; // Show the incoming stream
                    });
                    setIsConnected(true);
                })
                .catch((err) => console.error("Failed to get local stream", err));
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            <h1 className="text-3xl font-bold mb-4">Online Classroom</h1>
            <div>
                <p>Your Peer ID: {peerId}</p>
                <input
                    type="text"
                    placeholder="Enter other peer ID"
                    value={otherPeerId}
                    onChange={(e) => setOtherPeerId(e.target.value)}
                    className="p-2 border border-gray-300 rounded mb-2"
                />
                <button onClick={connectToPeer} className="p-2 bg-blue-500 text-white rounded">
                    Connect
                </button>
            </div>
            <div className="mt-5">
                <video ref={videoRef} autoPlay muted className="w-1/2 h-auto mb-5" />
                <video ref={otherVideoRef} autoPlay className="w-1/2 h-auto" />
            </div>
            {/* Notification for incoming calls */}
            {incomingCall && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded shadow-lg">
                        <p className="mb-4">You have an incoming call request!</p>
                        <button
                            onClick={handleIncomingCall}
                            className="p-2 bg-green-500 text-white rounded mr-2"
                        >
                            Accept
                        </button>
                        <button
                            onClick={rejectIncomingCall}
                            className="p-2 bg-red-500 text-white rounded"
                        >
                            Reject
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
