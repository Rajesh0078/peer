"use client"
import { useEffect, useRef, useState } from "react";
import Peer from "peerjs";

export default function Home() {
    const [peerId, setPeerId] = useState("");
    const [roomId, setRoomId] = useState(""); // Room ID for joining or creating
    const [peerInstance, setPeerInstance] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [role, setRole] = useState(""); // Role: 'teacher' or 'student'
    const [students, setStudents] = useState([]); // Track connected students
    const videoRef = useRef(null);
    const otherVideoRef = useRef(null);

    useEffect(() => {
        // Initialize Peer instance
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

        // Listen for incoming calls (for students joining)
        peer.on("call", (call) => {
            if (role === "teacher") {
                // Answer the call with teacher's stream
                navigator.mediaDevices
                    .getUserMedia({ video: true, audio: true })
                    .then((stream) => {
                        call.answer(stream); // Answer the call with your video stream
                        setStudents((prevStudents) => [...prevStudents, call.peer]); // Track students
                    })
                    .catch((err) => console.error("Failed to get local stream", err));
            } else if (role === "student") {
                // Answer the call without sending any stream (view-only)
                call.answer();
                call.on("stream", (remoteStream) => {
                    otherVideoRef.current.srcObject = remoteStream; // Show the teacher's stream
                });
            }
        });

        return () => peer.destroy();
    }, [role]);

    const handleRoleSelection = (selectedRole) => {
        setRole(selectedRole);

        if (selectedRole === "teacher") {
            // Teacher creates a new room (using their peer ID as room ID)
            setRoomId(peerId);
            // Automatically start video when creating a room
            startTeacherSession();
        }
    };

    const startTeacherSession = () => {
        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((stream) => {
                videoRef.current.srcObject = stream;
                setIsConnected(true);
            })
            .catch((err) => console.error("Failed to get local stream", err));
    };

    const joinRoom = () => {
        if (roomId && peerInstance && role === "student") {
            var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
            getUserMedia({ video: true, audio: true }, function (stream) {
                var call = peerInstance.call(roomId, stream);
                call.on('stream', function (remoteStream) {
                    // Show stream in some video/canvas element.
                    otherVideoRef.current.srcObject = remoteStream
                });
            }, function (err) {
                console.log('Failed to get local stream', err);
            });
            setIsConnected(true);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            {!role ? (
                <div>
                    <h1 className="text-3xl font-bold mb-4">Join or Create a Classroom</h1>
                    <button
                        onClick={() => handleRoleSelection("teacher")}
                        className="p-2 bg-green-500 text-white rounded mr-2"
                    >
                        Create Session (Teacher)
                    </button>
                    <button
                        onClick={() => handleRoleSelection("student")}
                        className="p-2 bg-blue-500 text-white rounded"
                    >
                        Join Session (Student)
                    </button>
                </div>
            ) : (
                <div>
                    <h1 className="text-3xl font-bold mb-4">Online Classroom - {role === "teacher" ? "Teacher" : "Student"}</h1>
                    {role === "teacher" ? (
                        <div>
                            <p>Your Room ID: {peerId}</p>
                            <div className="mt-5">
                                <video ref={videoRef} autoPlay muted className="w-1/2 h-auto mb-5" />
                            </div>
                            <p>Students Connected: {students.length}</p>
                        </div>
                    ) : (
                        <div>
                            <input
                                type="text"
                                placeholder="Enter Room ID to join"
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value)}
                                className="p-2 border border-gray-300 rounded mb-2"
                            />
                            <button onClick={joinRoom} className="p-2 bg-blue-500 text-white rounded">
                                Join Class
                            </button>
                            <div className="mt-5">
                                <video ref={otherVideoRef} autoPlay className="w-1/2 h-auto" />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
