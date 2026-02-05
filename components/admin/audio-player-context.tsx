"use client";

import { createContext, useContext, useState, useRef, useCallback, useEffect, type ReactNode } from "react";

interface AudioTrack {
  id: string;
  url: string;
  title: string;
  subtitle?: string;
}

interface AudioPlayerContextType {
  // Current track
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  
  // Player visibility
  isVisible: boolean;
  isMinimized: boolean;
  
  // Actions
  playTrack: (track: AudioTrack) => void;
  pause: () => void;
  resume: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  skipForward: (seconds?: number) => void;
  skipBackward: (seconds?: number) => void;
  stop: () => void;
  minimize: () => void;
  maximize: () => void;
  hide: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | null>(null);

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error("useAudioPlayer must be used within AudioPlayerProvider");
  }
  return context;
}

interface AudioPlayerProviderProps {
  children: ReactNode;
}

export function AudioPlayerProvider({ children }: AudioPlayerProviderProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    
    const audio = audioRef.current;
    
    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime);
    });
    
    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration);
    });
    
    audio.addEventListener("ended", () => {
      setIsPlaying(false);
    });
    
    audio.addEventListener("play", () => {
      setIsPlaying(true);
    });
    
    audio.addEventListener("pause", () => {
      setIsPlaying(false);
    });
    
    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  const playTrack = useCallback((track: AudioTrack) => {
    if (!audioRef.current) return;
    
    // If same track, just resume
    if (currentTrack?.id === track.id && currentTrack?.url === track.url) {
      audioRef.current.play();
      setIsVisible(true);
      setIsMinimized(false);
      return;
    }
    
    // New track
    setCurrentTrack(track);
    audioRef.current.src = track.url;
    audioRef.current.load();
    audioRef.current.play();
    setIsVisible(true);
    setIsMinimized(false);
  }, [currentTrack]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    audioRef.current?.play();
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  }, [isPlaying, pause, resume]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(time, duration));
    }
  }, [duration]);

  const skipForward = useCallback((seconds = 5) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(audioRef.current.currentTime + seconds, duration);
    }
  }, [duration]);

  const skipBackward = useCallback((seconds = 5) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(audioRef.current.currentTime - seconds, 0);
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setIsVisible(false);
    setCurrentTrack(null);
  }, []);

  const minimize = useCallback(() => {
    setIsMinimized(true);
  }, []);

  const maximize = useCallback(() => {
    setIsMinimized(false);
  }, []);

  const hide = useCallback(() => {
    pause();
    setIsVisible(false);
    setIsMinimized(false);
  }, [pause]);

  return (
    <AudioPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        isVisible,
        isMinimized,
        playTrack,
        pause,
        resume,
        togglePlay,
        seek,
        skipForward,
        skipBackward,
        stop,
        minimize,
        maximize,
        hide,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
}
