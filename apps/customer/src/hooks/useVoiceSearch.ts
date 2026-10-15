import { useState } from 'react';
import { Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';

export function useVoiceSearch(onSpeechEnd?: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const router = useRouter();

  const startVoiceSearch = () => {
    if (Platform.OS === 'web') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
  
        let finalTranscript = '';
  
        recognition.onstart = () => {
          setIsListening(true);
          setSpokenText('');
        };
  
        recognition.onresult = (event: any) => {
          const current = event.resultIndex;
          finalTranscript = event.results[current][0].transcript;
          setSpokenText(finalTranscript);
        };
  
        recognition.onend = () => {
          setIsListening(false);
          if (finalTranscript.trim()) {
            setTimeout(() => {
              if (onSpeechEnd) {
                onSpeechEnd(finalTranscript.trim());
              } else {
                router.push(`/search?q=${encodeURIComponent(finalTranscript.trim())}`);
              }
            }, 500);
          }
        };
        
        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };
  
        try {
          recognition.start();
        } catch (e) {
          console.error(e);
        }
      } else {
        alert("Voice search is not supported in this browser. Try Chrome or Safari.");
      }
    } else {
      Alert.alert(
        "Microphone Permission",
        "Voice search requires microphone permissions. We will request this in the final production app.",
        [{ text: "OK" }]
      );
    }
  };

  const stopVoiceSearch = () => {
    setIsListening(false);
  };

  return {
    isListening,
    spokenText,
    startVoiceSearch,
    stopVoiceSearch,
  };
}
