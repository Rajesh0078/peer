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
      host: 'peer-server-s7xw.onrender.com',  // Replace with your Render domain
      port: 443,                      // Use port 443 for HTTPS
      path: '/peerjs',                // Ensure this matches the path on the server
      secure: true,
    });

    peer.on('open', (id) => {
      setPeerId(id);
      console.log(`My peer ID is: ${id}`);
    });

    peer.on('call', (call) => {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
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
    // navigator.mediaDevices.getUserMedia()
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      localVideoRef.current.srcObject = stream;
      const call = peerInstance.current.call(remotePeerId, stream);

      call.on('stream', (remoteStream) => {
        remoteVideoRef.current.srcObject = remoteStream;
      });
    });
  };

  return (
    <div className='text-center p-5'>
      <div className='flex flex-col justify-start items-center gap-3 h-20 '>
        <h2>Your Peer ID: {peerId}</h2>
        <div className='flex justify-start items-center '>
          <input
            type="text"
            value={remotePeerIdValue}
            onChange={(e) => setRemotePeerIdValue(e.target.value)}
            placeholder="Enter remote peer ID"
            className='outline-none border rounded-l-md h-10 p-4'
          />
          <button onClick={() => callPeer(remotePeerIdValue)} className='bg-blue-400 h-10 px-4 rounded-r-md text-white'>Call Peer</button>
        </div>
      </div>

      <div className='mt-5'>
        <h3>Remote Screen Share</h3>
        <video ref={remoteVideoRef} autoPlay playsInline className='border h-[57vh] w-full mt-3 rounded-md' />
      </div>
      <div >
        <br />
        <video ref={localVideoRef} autoPlay playsInline muted className='border rounded-md h-[200px] w-[400px]' />
      </div>

    </div>
  );
};

export default ScreenShare;
