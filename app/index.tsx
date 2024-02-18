import { Stack, Link } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import {
  MediaStream,
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  mediaDevices,
  RTCView,
} from 'react-native-webrtc';

// const peerConstraints = {
//   iceServers: [
//     {
//       urls: 'stun:stun.l.google.com:19302',
//     },
//   ],
// };
// const peerConnection = new RTCPeerConnection(peerConstraints);
// const datachannel = peerConnection.createDataChannel('datachannel');
// peerConnection.addEventListener('datachannel', (event) => {
//   const datachannel = event.channel;

//   console.log('Got datachannel: ', datachannel);

//   // Now you've got the datachannel.
//   // You can hookup and use the same events as above ^
// });
// datachannel.addEventListener('message', (message) => {
//   console.log('Got message: ', message);
// });
export default function Page() {
  const [localMediaStream, setLocalMediaStream] = useState<MediaStream | null>(null);
  const [remoteMediaStream, setRemoteMediaStream] = useState<MediaStream | null>(null);
  const [gettingCall, setGettingCall] = useState(false);
  const pc = useRef<RTCPeerConnection | null>(null);

  const mediaConstraints = {
    audio: true,
    video: {
      frameRate: 30,
      facingMode: 'user',
    },
  };
  const sessionConstraints = {
    mandatory: {
      OfferToReceiveAudio: true,
      OfferToReceiveVideo: true,
      VoiceActivityDetection: true,
    },
  };

  const peerConstraints = {
    iceServers: [
      {
        urls: 'stun:stun.l.google.com:19302',
      },
    ],
  };

  const peerConnection = new RTCPeerConnection(peerConstraints);

  peerConnection.addEventListener('connectionstatechange', (event) => {
    switch (peerConnection.connectionState) {
      case 'closed':
        // You can handle the call being disconnected here.

        break;
    }
  });

  peerConnection.addEventListener('icecandidate', (event) => {
    // When you find a null candidate then there are no more candidates.
    // Gathering of candidates has finished.
    if (!event.candidate) {
    }

    // Send the event.candidate onto the person you're calling.
    // Keeping to Trickle ICE Standards, you should send the candidates immediately.
  });

  peerConnection.addEventListener('icecandidateerror', (event) => {
    // You can ignore some candidate errors.
    // Connections can still be made even when errors occur.
  });

  peerConnection.addEventListener('iceconnectionstatechange', (event) => {
    switch (peerConnection.iceConnectionState) {
      case 'connected':
      case 'completed':
        // You can handle the call being connected here.
        // Like setting the video streams to visible.

        break;
    }
  });

  peerConnection.addEventListener('negotiationneeded', (event) => {
    // You can start the offer stages here.
    // Be careful as this event can be called multiple times.
  });

  peerConnection.addEventListener('signalingstatechange', (event) => {
    switch (peerConnection.signalingState) {
      case 'closed':
        // You can handle the call being disconnected here.

        break;
    }
  });

  peerConnection.addEventListener('track', (event) => {
    // Grab the remote track from the connected participant.
    setRemoteMediaStream(remoteMediaStream || new MediaStream());
    if (remoteMediaStream) {
      remoteMediaStream.addTrack(event.track, remoteMediaStream);
    }
  });

  let remoteCandidates = [];

  function handleRemoteCandidate(iceCandidate) {
    iceCandidate = new RTCIceCandidate(iceCandidate);

    if (peerConnection.remoteDescription == null) {
      return remoteCandidates.push(iceCandidate);
    }

    return peerConnection.addIceCandidate(iceCandidate);
  }

  function processCandidates() {
    if (remoteCandidates.length < 1) {
      return;
    }

    remoteCandidates.map((candidate) => peerConnection.addIceCandidate(candidate));
    remoteCandidates = [];
  }

  const createOffer = async () => {
    try {
      const offerDescription = await peerConnection.createOffer(sessionConstraints);
      await peerConnection.setLocalDescription(offerDescription);

      console.log('offerDescription: ', offerDescription);
      // Send the offerDescription to the other participant.

      processCandidates();
    } catch (err) {
      console.log('Error: ', err);
    }
  };

  const createAnswer = async () => {
    try {
      const answerDescription = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answerDescription);

      // Send the answerDescription to the other participant.
      console.log('answerDescription: ', answerDescription);
    } catch (err) {
      // Handle Errors
    }
  };

  const setup = async () => {
    try {
      // Use the received offerDescription
      const offerDescription = new RTCSessionDescription(offerDescription);
      await peerConnection.setRemoteDescription(offerDescription);

      const answerDescription = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answerDescription);

      // Here is a good place to process candidates.
      processCandidates();

      // Send the answerDescription back as a response to the offerDescription.
    } catch (err) {
      // Handle Errors
    }
  };
  const countMediaDevices = async () => {
    let cameraCount = 0;

    try {
      const devices = await mediaDevices.enumerateDevices();

      console.log('devices: ', devices[0]);

      devices.map((device) => {
        if (device.kind !== 'videoinput') {
          return;
        }

        cameraCount = cameraCount + 1;
      });
    } catch (err) {
      console.log('Error: ', err);
    }
    console.log('cameraCount: ', cameraCount);

    return cameraCount;
  };

  const getMedia = async () => {
    const isVoiceOnly = false;

    try {
      const mediaStream = await mediaDevices.getUserMedia(mediaConstraints);

      if (isVoiceOnly) {
        const videoTrack = await mediaStream.getVideoTracks()[0];
        videoTrack.enabled = false;
      }

      setLocalMediaStream(mediaStream);
      console.log('localMediaStream: ', mediaStream);
      if (mediaStream) {
        addMediaStream();
        getDisplayMedia();
      }
    } catch (err) {
      // Handle Error
      console.log('Error: ', err);
    }
  };
  // const addMediaStream = () => {
  //   if (localMediaStream) {
  //     localMediaStream
  //       .getTracks()
  //       .forEach((track) => peerConnection.addTrack(track, localMediaStream));
  //   }
  // }

  const getDisplayMedia = async () => {
    try {
      const mediaStream = await mediaDevices.getDisplayMedia();

      console.log('mediaStream: ', mediaStream);
    } catch (err) {
      console.log('Error: ', err);
    }
  };

  const stopLocalStream = () => {
    if (localMediaStream) {
      localMediaStream.getTracks().forEach((track) => {
        track.stop();
      });
      setLocalMediaStream(null);

      // You can also remove the tracks from the peerConnection.
      peerConnection.getSenders().forEach((sender) => {
        peerConnection.removeTrack(sender);
      });

      // You can also close the peerConnection.
      peerConnection.close();
    }
  };

  const addMediaStream = () => {
    if (localMediaStream) {
      localMediaStream
        .getTracks()
        .forEach((track) => peerConnection.addTrack(track, localMediaStream));
    }
  };
  // const sendMessage = () => {
  //   datachannel.send('Hey There!');
  // };
  console.log('localMediaStream ', localMediaStream?.toURL() || 'No Stream');

  return (
    <View className={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'Web RTC',
          headerTitleAlign: 'center',
        }}
      />
      <View className={styles.main}>
        <RTCView
          mirror
          objectFit="cover"
          streamURL={localMediaStream ? localMediaStream.toURL() : ''}
          zOrder={0}
          style={{ width: 300, height: 300 }}
        />
        <TouchableOpacity className={`${styles.button} bg-green-500`} onPress={createOffer}>
          <Text className={styles.buttonText}>createOffer</Text>
        </TouchableOpacity>
        <TouchableOpacity className={`${styles.button} bg-blue-500`} onPress={createAnswer}>
          <Text className={styles.buttonText}>createAnswer</Text>
        </TouchableOpacity>
        <TouchableOpacity className={styles.button} onPress={getMedia}>
          <Text className={styles.buttonText}>Get Local Media</Text>
        </TouchableOpacity>
        <TouchableOpacity className={styles.button} onPress={addMediaStream}>
          <Text className={styles.buttonText}>Add Media to Stream</Text>
        </TouchableOpacity>
        <TouchableOpacity className={`${styles.button} bg-red-500`} onPress={stopLocalStream}>
          <Text className={styles.buttonText}>Stop</Text>
        </TouchableOpacity>
        <TouchableOpacity className={`${styles.button} bg-gray-600`} onPress={setup}>
          <Text className={styles.buttonText}>Setup</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = {
  button: 'items-center bg-indigo-500 rounded-[28px] shadow-md p-4 w-[200] m-4',
  buttonText: 'text-white text-lg font-semibold text-center',
  container: 'flex-1 p-6',
  main: 'flex-1 max-w-[960] mx-auto justify-center items-center ',
  title: 'text-[64px] font-bold',
  subtitle: 'text-4xl text-gray-700',
};
