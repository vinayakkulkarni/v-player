import { ref, onMounted, onBeforeUnmount, type Ref } from 'vue';

export function useVideoPlayer(videoRef: Ref<HTMLVideoElement | null>) {
  const isPlaying = ref(false);
  const currentTime = ref(0);
  const duration = ref(0);
  const isBuffering = ref(false);
  const hasError = ref(false);
  let playPromise: Promise<void> | null = null;

  const play = async (): Promise<void> => {
    if (!videoRef.value) return;
    try {
      playPromise = videoRef.value.play();
      await playPromise;
    } catch {
      // Intentionally empty: autoplay policies may reject play()
    } finally {
      playPromise = null;
    }
  };

  const pause = (): void => {
    if (!videoRef.value || playPromise) return;
    videoRef.value.pause();
  };

  const togglePlay = (): void => {
    if (!videoRef.value) return;
    if (videoRef.value.paused && !playPromise) {
      play();
    } else {
      pause();
    }
  };

  const seek = (time: number): void => {
    if (!videoRef.value) return;
    videoRef.value.currentTime = Math.max(
      0,
      Math.min(time, videoRef.value.duration || 0),
    );
  };

  const onPlay = () => {
    isPlaying.value = true;
  };

  const onPause = () => {
    isPlaying.value = false;
  };

  const onTimeUpdate = () => {
    if (!videoRef.value) return;
    currentTime.value = videoRef.value.currentTime;
  };

  const onLoadedMetadata = () => {
    if (!videoRef.value) return;
    duration.value = videoRef.value.duration;
  };

  const onDurationChange = () => {
    if (!videoRef.value) return;
    duration.value = videoRef.value.duration;
  };

  const onWaiting = () => {
    isBuffering.value = true;
  };

  const onCanPlay = () => {
    isBuffering.value = false;
  };

  const onError = () => {
    hasError.value = true;
  };

  const onEnded = () => {
    isPlaying.value = false;
  };

  onMounted(() => {
    const el = videoRef.value;
    if (!el) return;

    el.addEventListener('play', onPlay);
    el.addEventListener('pause', onPause);
    el.addEventListener('timeupdate', onTimeUpdate);
    el.addEventListener('loadedmetadata', onLoadedMetadata);
    el.addEventListener('durationchange', onDurationChange);
    el.addEventListener('waiting', onWaiting);
    el.addEventListener('canplay', onCanPlay);
    el.addEventListener('error', onError);
    el.addEventListener('ended', onEnded);
  });

  onBeforeUnmount(() => {
    const el = videoRef.value;
    if (!el) return;

    el.removeEventListener('play', onPlay);
    el.removeEventListener('pause', onPause);
    el.removeEventListener('timeupdate', onTimeUpdate);
    el.removeEventListener('loadedmetadata', onLoadedMetadata);
    el.removeEventListener('durationchange', onDurationChange);
    el.removeEventListener('waiting', onWaiting);
    el.removeEventListener('canplay', onCanPlay);
    el.removeEventListener('error', onError);
    el.removeEventListener('ended', onEnded);
  });

  return {
    isPlaying,
    currentTime,
    duration,
    isBuffering,
    hasError,
    play,
    pause,
    togglePlay,
    seek,
  };
}
