'use client'

// components/ScreenShare.js
import React, { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';

const ScreenShare = () => {
  const [peerId, setPeerId] = useState('');
  const [remotePeerIdValue, setRemotePeerIdValue] = useState('');
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerInstance = useRef(null);

  useEffect(() => {
    // Initialize PeerJS with the Express server
    const peer = new Peer(undefined, {
      host: '192.168.1.36', // Replace with your server address
      port: '5000',
      path: '/peerjs',
    });

    peer.on('open', (id) => {
      setPeerId(id);
      console.log(`My peer ID is: ${id}`);
    });

    peer.on('call', (call) => {
      navigator.mediaDevices.getDisplayMedia({ video: true, audio: true }).then((stream) => {
        localVideoRef.current.srcObject = stream;
        call.answer(stream); // Answer the call with the local screen stream

        call.on('stream', (remoteStream) => {
          remoteVideoRef.current.srcObject = remoteStream;
        });
      });
    });

    peerInstance.current = peer;

    return () => {
      peer.destroy();
    };
  }, []);

  const callPeer = (remotePeerId) => {
    navigator.mediaDevices.getDisplayMedia({ video: true, audio: true }).then((stream) => {
      localVideoRef.current.srcObject = stream;
      const call = peerInstance.current.call(remotePeerId, stream);

      call.on('stream', (remoteStream) => {
        remoteVideoRef.current.srcObject = remoteStream;
      });
    });
  };

  return (
    <div>
      <h2>Your Peer ID: {peerId}</h2>
      <input
        type="text"
        value={remotePeerIdValue}
        onChange={(e) => setRemotePeerIdValue(e.target.value)}
        placeholder="Enter remote peer ID"
      />
      <button onClick={() => callPeer(remotePeerIdValue)}>Call Peer</button>

      <div>
        <h3>Local Screen Share</h3>
        <video ref={localVideoRef} autoPlay playsInline muted style={{ width: '400px' }} />
      </div>

      <div>
        <h3>Remote Screen Share</h3>
        <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '400px' }} />
      </div>
    </div>
  );
};

export default ScreenShare;
