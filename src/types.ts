export interface VPlayerProps {
  /** Video source URL */
  src: string;
  /** Poster image URL */
  poster?: string;
  /** Video title displayed on overlay */
  title?: string;
  /** Subtitle text (e.g. "by variant") */
  subtitle?: string;
  /** Auto-play on mount */
  autoplay?: boolean;
  /** Start muted */
  muted?: boolean;
  /** Loop playback */
  loop?: boolean;
  /** Preload strategy */
  preload?: 'auto' | 'metadata' | 'none';
  /** Player width (CSS value) */
  width?: string;
  /** Player height (CSS value) */
  height?: string;
  /** Aspect ratio (e.g. '16/9') */
  aspectRatio?: string;
  /** Show custom controls */
  controls?: boolean;
  /** Enable keyboard shortcuts */
  keyboard?: boolean;
  /** Initial volume (0 to 1) */
  volume?: number;
  /** Cross-origin attribute for the video element */
  crossorigin?: '' | 'anonymous' | 'use-credentials';
  /** Number of timeline marker bars */
  barCount?: number;
}

export interface VPlayerEmits {
  (e: 'play'): void;
  (e: 'pause'): void;
  (e: 'ended'): void;
  (e: 'timeupdate', payload: { currentTime: number; duration: number }): void;
  (e: 'volumechange', volume: number): void;
  (e: 'fullscreenchange', isFullscreen: boolean): void;
  (e: 'seeking'): void;
  (e: 'seeked'): void;
  (e: 'error', error: MediaError | null): void;
  (e: 'loadedmetadata', payload: { duration: number }): void;
}

export interface VPlayerExpose {
  /** Play the video */
  play: () => Promise<void>;
  /** Pause the video */
  pause: () => void;
  /** Toggle play/pause */
  togglePlay: () => void;
  /** Seek to a specific time in seconds */
  seek: (time: number) => void;
  /** Set volume (0 to 1) */
  setVolume: (volume: number) => void;
  /** Toggle mute */
  toggleMute: () => void;
  /** Enter fullscreen */
  enterFullscreen: () => Promise<void>;
  /** Exit fullscreen */
  exitFullscreen: () => Promise<void>;
  /** Toggle fullscreen */
  toggleFullscreen: () => void;
  /** The underlying video element */
  videoEl: HTMLVideoElement | null;
}

export interface TimelineMarker {
  time: number;
  label: string;
}
