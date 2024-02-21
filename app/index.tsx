import { Stack, Link } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, Text, TextInput, TouchableOpacity, View } from 'react-native';
import {
  MediaStream,
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  mediaDevices,
  RTCView,
} from 'react-native-webrtc';

const peerConstraints = {
  iceServers: [
    {
      urls: ['stun:stun1.1.google.com:19302', 'stun:stun2.1.google.com:19302'],
    },
  ],
};
const peerConnection = new RTCPeerConnection(peerConstraints);
export default function Page() {
  const [localMediaStream, setLocalMediaStream] = useState<MediaStream | null>(null);
  const [remoteMediaStream, setRemoteMediaStream] = useState<MediaStream | null>(null);
  const [offerDescriptionText, setOfferDescriptionText] = useState<string>('');
  const [answerDescription, setAnswerDescription] = useState<string>('');
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

  const createOffer = async () => {
    try {
      const remoteMediaStream = new MediaStream();
      setRemoteMediaStream(remoteMediaStream);
      if (!localMediaStream) return;
      localMediaStream
        .getTracks()
        .forEach((track) => peerConnection.addTrack(track, localMediaStream));

      peerConnection.addEventListener('track', (event) => {
        event.streams[0].getTracks().forEach((track) => {
          remoteMediaStream.addTrack(track);
        });
      });

      peerConnection.addEventListener('icecandidate', (event) => {
        if (event.candidate) {
          console.log('event.candidate: ', event.candidate);
        }
      });

      const offerDescription = await peerConnection.createOffer(sessionConstraints);
      await peerConnection.setLocalDescription(offerDescription);
      setOfferDescriptionText(JSON.stringify(offerDescription));
      console.log('offerDescription: ', JSON.stringify(offerDescription));
      // Alert.alert('offerDescription', JSON.stringify(offerDescription));
      // processCandidates();
    } catch (err) {
      console.log('Error: ', err);
    }
  };

  const createAnswer = async () => {
    try {
      const remoteMediaStream = new MediaStream();
      setRemoteMediaStream(remoteMediaStream);
      if (!localMediaStream) return;
      localMediaStream
        .getTracks()
        .forEach((track) => peerConnection.addTrack(track, localMediaStream));

      peerConnection.addEventListener('track', (event) => {
        event.streams[0].getTracks().forEach((track) => {
          remoteMediaStream.addTrack(track);
        });
      });

      peerConnection.addEventListener('icecandidate', (event) => {
        if (event.candidate) {
          console.log('event.candidate: ', event.candidate);
          setOfferDescriptionText(JSON.stringify(peerConnection.localDescription));
        }
      });

      const answerDescription = await peerConnection.createAnswer();
      await peerConnection.setRemoteDescription(answerDescription);
      setAnswerDescription(answerDescription);
      setOfferDescriptionText(JSON.stringify(answerDescription));
      console.log('answerDescription: ', answerDescription);
      // Alert.alert('answerDescription', JSON.stringify(answerDescription));
      // processCandidates();
    } catch (err) {
      console.log('Error createAnswer: ', err);
    }
  };
  const addAnswer = async () => {
    try {
      const answeradd = JSON.parse(answerDescription);
      peerConnection.setRemoteDescription(answeradd);

      console.log('answeradd: ', answeradd);

      console.log(remoteMediaStream);
    } catch (err) {
      // Handle Errors
    }
  };

  const closeConnection = () => {
    peerConnection.close();
    setLocalMediaStream(null);
    setRemoteMediaStream(null);
  };

  console.log('localMediaStream ', localMediaStream?.toURL() || 'No Stream');
  const { height, width } = Dimensions.get('window');

  useEffect(() => {
    async function getMedia() {
      const mediaStream = await mediaDevices.getUserMedia(mediaConstraints);
      setLocalMediaStream(mediaStream);
    }
    getMedia();
  }, []);
  console.log('remoteMediaStream', remoteMediaStream?.toURL());

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
          streamURL={remoteMediaStream?.toURL()}
          zOrder={0}
          style={{
            width: 90,
            height: 140,
            alignSelf: 'flex-end',
            // left: 20,
            // top: 0,
            // position: 'absolute',
            // bottom: 90,
            // right: 15,
            // zIndex: 1,
          }}
        />
        <RTCView
          mirror
          objectFit="cover"
          streamURL={localMediaStream ? localMediaStream.toURL() : ''}
          zOrder={0}
          style={{ width, height: height - 460 }}
        />

        <TouchableOpacity className={`${styles.button} bg-green-500`} onPress={createOffer}>
          <Text className={styles.buttonText}>Offer</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`${styles.button} bg-blue-500 bottom-20`}
          onPress={createAnswer}>
          <Text className={styles.buttonText}>Answer</Text>
        </TouchableOpacity>

        <TouchableOpacity className={`${styles.button} bg-red-500 bottom-40`} onPress={addAnswer}>
          <Text className={styles.buttonText}>Add Answer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`${styles.button} bg-red-500 left-56`}
          onPress={closeConnection}>
          <Text className={styles.buttonText}>Close</Text>
        </TouchableOpacity>

        <TextInput
          placeholder="Offer Description"
          value={offerDescriptionText}
          onChangeText={setOfferDescriptionText}
          className="absolute top-0 left-0 w-[200px] h-14 bg-white z-10"
        />
        <TextInput
          placeholder="Answer Description"
          value={answerDescription}
          onChangeText={setAnswerDescription}
          className="absolute top-20 left-0 w-[200px] h-14 bg-white z-10"
        />
      </View>
    </View>
  );
}

const styles = {
  button: 'items-center rounded-[28px] shadow-md p-4 w-[200] m-4 absolute bottom-0 left-0',
  buttonText: 'text-white text-lg font-semibold text-center',
  container: 'flex-1',
  main: 'flex-1 max-w-[960] mx-auto justify-center items-center ',
  title: 'text-[64px] font-bold',
  subtitle: 'text-4xl text-gray-700',
};
