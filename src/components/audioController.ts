// usePersistentAudio.ts
import { useRef, useEffect } from "react";

export function usePersistentAudio(src: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (audioRef.current === null) {
    audioRef.current = new Audio(src);
    audioRef.current.loop = true;
  }

  useEffect(() => {
    // Clean up when the component unmounts
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  return audioRef.current;
}
