<script setup lang="ts">
  import { ref, computed, toRef, watch } from 'vue';
  import { useVideoPlayer } from '../composables/useVideoPlayer';
  import { useProgressBar } from '../composables/useProgressBar';
  import { useVolumeControl } from '../composables/useVolumeControl';
  import { useFullscreen } from '../composables/useFullscreen';
  import { useKeyboard } from '../composables/useKeyboard';
  import { formatTime } from '../utils/format';
  import type { TimelineMarker } from '../types';

  const props = withDefaults(
    defineProps<{
      src: string;
      poster?: string;
      title?: string;
      subtitle?: string;
      autoplay?: boolean;
      muted?: boolean;
      loop?: boolean;
      preload?: 'auto' | 'metadata' | 'none';
      width?: string;
      height?: string;
      aspectRatio?: string;
      controls?: boolean;
      keyboard?: boolean;
      volume?: number;
      crossorigin?: '' | 'anonymous' | 'use-credentials';
      barCount?: number;
    }>(),
    {
      poster: undefined,
      title: undefined,
      subtitle: undefined,
      autoplay: false,
      muted: false,
      loop: false,
      preload: 'auto',
      width: '100%',
      height: undefined,
      aspectRatio: '16/9',
      controls: true,
      keyboard: true,
      volume: 1,
      crossorigin: undefined,
      barCount: 40,
    },
  );

  const emit = defineEmits<{
    play: [];
    pause: [];
    ended: [];
    timeupdate: [payload: { currentTime: number; duration: number }];
    volumechange: [volume: number];
    fullscreenchange: [isFullscreen: boolean];
    seeking: [];
    seeked: [];
    error: [error: MediaError | null];
    loadedmetadata: [payload: { duration: number }];
  }>();

  const playerRef = ref<HTMLElement | null>(null);
  const videoRef = ref<HTMLVideoElement | null>(null);
  const progressRef = ref<HTMLElement | null>(null);
  const volumeBarRef = ref<HTMLElement | null>(null);

  const {
    isPlaying,
    currentTime,
    duration,
    isBuffering,
    play,
    pause,
    togglePlay,
    seek,
  } = useVideoPlayer(videoRef);

  const {
    isHovering: progressHovering,
    isSeeking,
    hoverRatio,
    seekRatio,
    hoverTime,
    progressPercent,
    onMouseMove: onProgressMouseMove,
    onMouseLeave: onProgressMouseLeave,
    onMouseDown: onProgressMouseDown,
  } = useProgressBar(
    progressRef,
    videoRef,
    currentTime,
    duration,
    play,
    pause,
    isPlaying,
  );

  const {
    volume: currentVolume,
    isMuted,
    isDragging: volumeDragging,
    setVolume,
    toggleMute,
    startDrag: startVolumeDrag,
  } = useVolumeControl(videoRef, props.volume);

  const { isFullscreen, enterFullscreen, exitFullscreen, toggleFullscreen } =
    useFullscreen(playerRef);

  const keyboardEnabled = toRef(props, 'keyboard');
  useKeyboard(keyboardEnabled, {
    togglePlay,
    seek,
    toggleMute,
    toggleFullscreen,
    videoRef,
  });

  const progressActive = computed(
    () => progressHovering.value || isSeeking.value,
  );

  const displayPercent = computed(() => {
    if (isSeeking.value) return seekRatio.value * 100;
    return progressPercent.value;
  });

  const displayHoverWidth = computed(() => {
    return `${hoverRatio.value * 100}%`;
  });

  const displayHoverRatio = computed(() => {
    return `${hoverRatio.value}`;
  });

  const formattedCurrentTime = computed(() => formatTime(currentTime.value));
  const formattedDuration = computed(() => formatTime(duration.value));
  const formattedHoverTime = computed(() => formatTime(hoverTime.value));

  const volumePercent = computed(() => {
    if (isMuted.value) return '0%';
    return `${currentVolume.value * 100}%`;
  });

  const timelineMarkers = computed((): TimelineMarker[] => {
    const d = duration.value;
    if (d <= 20) return [];

    const markers: TimelineMarker[] = [];
    const startPad = 10;
    const endPad = d - 10;
    const innerSpace = endPad - startPad;

    markers.push({ time: startPad, label: formatTime(startPad) });

    if (innerSpace > 30) {
      const interval = innerSpace / 3;
      for (let i = 1; i <= 2; i++) {
        const t = startPad + interval * i;
        markers.push({ time: t, label: formatTime(t) });
      }
    }

    markers.push({ time: endPad, label: formatTime(endPad) });
    return markers;
  });

  const barSegments = computed(() => {
    const totalBars = props.barCount;
    const markers = timelineMarkers.value;
    const d = duration.value;

    if (d <= 0 || markers.length === 0) {
      return [{ bars: totalBars, marker: null }];
    }

    const positions = [0, ...markers.map((m) => m.time / d), 1];
    const segments: Array<{ bars: number; marker: TimelineMarker | null }> = [];

    for (let i = 0; i < positions.length - 1; i++) {
      const width = positions[i + 1] - positions[i];
      const barCount = Math.max(1, Math.round(width * totalBars));
      segments.push({
        bars: barCount,
        marker: i < markers.length ? markers[i] : null,
      });
    }

    return segments;
  });

  const playerStyle = computed(() => ({
    width: props.width,
    height: props.height,
    aspectRatio: props.height ? undefined : props.aspectRatio,
  }));

  watch(isPlaying, (playing) => {
    if (playing) {
      emit('play');
    } else {
      emit('pause');
    }
  });

  watch(currentTime, (time) => {
    emit('timeupdate', { currentTime: time, duration: duration.value });
  });

  watch(currentVolume, (vol) => {
    emit('volumechange', vol);
  });

  watch(isFullscreen, (fs) => {
    emit('fullscreenchange', fs);
  });

  watch(isSeeking, (seeking) => {
    if (seeking) {
      emit('seeking');
    } else {
      emit('seeked');
    }
  });

  watch(duration, (d) => {
    if (d > 0) emit('loadedmetadata', { duration: d });
  });

  const onVolumeBarMouseDown = (e: MouseEvent) => {
    if (!volumeBarRef.value) return;
    startVolumeDrag(e, volumeBarRef.value);
  };

  const onVideoClick = () => {
    togglePlay();
  };

  const onVideoEnded = () => {
    emit('ended');
  };

  const onVideoError = () => {
    if (videoRef.value) {
      emit('error', videoRef.value.error);
    }
  };

  defineExpose({
    play,
    pause,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
    videoEl: videoRef,
  });
</script>

<template>
  <div
    ref="playerRef"
    class="video-player"
    :class="{ 'video-player--fullscreen': isFullscreen }"
    :style="playerStyle"
  >
    <video
      ref="videoRef"
      :src="src"
      :poster="poster"
      :autoplay="autoplay"
      :muted="muted"
      :loop="loop"
      :preload="preload"
      :crossorigin="crossorigin"
      @click="onVideoClick"
      @ended="onVideoEnded"
      @error="onVideoError"
    />

    <div v-if="controls" class="overlay">
      <div class="infos">
        <p v-if="title" class="title">{{ title }}</p>
        <p v-if="subtitle" class="by">{{ subtitle }}</p>
      </div>

      <div class="controls">
        <button
          class="play-pause-button"
          type="button"
          :aria-label="isPlaying ? 'Pause' : 'Play'"
          @click="togglePlay"
        >
          <svg
            v-if="isPlaying"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="4" y="3" width="4" height="14" rx="1" fill="white" />
            <rect x="12" y="3" width="4" height="14" rx="1" fill="white" />
          </svg>
          <svg
            v-else
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6.35 3.23C5.33 2.6 4 3.34 4 4.54v10.92c0 1.2 1.33 1.94 2.35 1.3L10 14.54V5.46L6.35 3.23Z"
              fill="white"
            />
            <path
              d="M10 5.46l4 2.45 1.26.78c.98.6.98 2.02 0 2.62L14 12.09l-4 2.45V5.46Z"
              fill="white"
            />
          </svg>
        </button>

        <div
          ref="progressRef"
          class="progress-container"
          :class="{ active: progressActive }"
          :style="{
            '--progress-hover-width': displayHoverWidth,
            '--progress-hover-ratio': displayHoverRatio,
          }"
          @mousemove="onProgressMouseMove"
          @mouseleave="onProgressMouseLeave"
          @mousedown="onProgressMouseDown"
        >
          <div class="progress-hover-container">
            <div class="progress-hover" />
          </div>

          <div class="indicator-container">
            <div class="indicator-top-container">
              <div class="indicator" />
            </div>
            <div class="indicator-bottom-container">
              <div class="indicator" />
            </div>
          </div>

          <div class="tooltip-container">
            <p class="tooltip">
              {{ formattedHoverTime }}
              <svg
                class="tooltip-thing"
                width="10"
                height="6"
                viewBox="0 0 10 6"
                fill="none"
              >
                <path d="M5 6L0 0h10L5 6Z" fill="white" />
              </svg>
            </p>
          </div>

          <div class="progress-bar-container">
            <div
              class="progress-bar"
              :style="{ width: `${displayPercent}%` }"
            />
          </div>

          <div class="bars">
            <template v-for="(segment, sIdx) in barSegments" :key="sIdx">
              <div
                v-for="bIdx in segment.bars"
                :key="`${sIdx}-${bIdx}`"
                class="bar"
              />
              <p v-if="segment.marker" class="timecode">
                {{ segment.marker.label }}
              </p>
            </template>
          </div>
        </div>

        <div class="time-duration">
          {{ formattedCurrentTime }} / {{ formattedDuration }}
        </div>

        <div class="volume-full-screen-container">
          <div class="volume-container" :class="{ dragging: volumeDragging }">
            <button
              class="volume-button"
              type="button"
              aria-label="Toggle mute"
              @click="toggleMute"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <template v-if="isMuted || currentVolume === 0">
                  <path d="M11 5L6 9H2v6h4l5 4V5Z" fill="white" />
                  <line
                    x1="23"
                    y1="9"
                    x2="17"
                    y2="15"
                    stroke="white"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                  <line
                    x1="17"
                    y1="9"
                    x2="23"
                    y2="15"
                    stroke="white"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                </template>
                <template v-else-if="currentVolume < 0.5">
                  <path d="M11 5L6 9H2v6h4l5 4V5Z" fill="white" />
                  <path
                    d="M15.54 8.46a5 5 0 0 1 0 7.07"
                    stroke="white"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                </template>
                <template v-else>
                  <path d="M11 5L6 9H2v6h4l5 4V5Z" fill="white" />
                  <path
                    d="M15.54 8.46a5 5 0 0 1 0 7.07"
                    stroke="white"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                  <path
                    d="M19.07 4.93a10 10 0 0 1 0 14.14"
                    stroke="white"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                </template>
              </svg>
            </button>

            <div
              ref="volumeBarRef"
              class="volume-bar-container v-player-volume-bar-container"
              @mousedown="onVolumeBarMouseDown"
            >
              <div class="volume-bars">
                <div v-for="n in 10" :key="n" />
              </div>
              <div
                class="volume-bar-progress"
                :style="{ height: volumePercent }"
              />
            </div>
          </div>

          <button
            class="full-screen-button"
            type="button"
            aria-label="Toggle fullscreen"
            @click="toggleFullscreen"
          >
            <svg
              v-if="!isFullscreen"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 7V4a1 1 0 0 1 1-1h3"
                stroke="white"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M13 3h3a1 1 0 0 1 1 1v3"
                stroke="white"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M17 13v3a1 1 0 0 1-1 1h-3"
                stroke="white"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M7 17H4a1 1 0 0 1-1-1v-3"
                stroke="white"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <svg
              v-else
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7 3v3a1 1 0 0 1-1 1H3"
                stroke="white"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M17 7h-3a1 1 0 0 1-1-1V3"
                stroke="white"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M13 17v-3a1 1 0 0 1 1-1h3"
                stroke="white"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M3 13h3a1 1 0 0 1 1 1v3"
                stroke="white"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div v-if="isBuffering" class="buffering-indicator">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="white"
          stroke-width="2"
          stroke-dasharray="31.4 31.4"
          stroke-linecap="round"
        />
      </svg>
    </div>
  </div>
</template>

<style scoped>
  .video-player *,
  .video-player *::before,
  .video-player *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  .video-player {
    position: relative;
    border-radius: 0;
    overflow: hidden;
    background-color: #000;
    font-family:
      Inter,
      system-ui,
      -apple-system,
      sans-serif;
    color: #fff;
    user-select: none;
    box-sizing: border-box;
  }

  .video-player video {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }

  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 100%;
    height: 100%;
    padding: 1rem;
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.5),
      transparent 25% 75%,
      rgba(0, 0, 0, 0.5)
    );
    pointer-events: none;
  }

  .overlay > * {
    pointer-events: auto;
  }

  .infos {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .title {
    font-size: 1.375rem;
    font-weight: 500;
    letter-spacing: -0.01em;
    line-height: 1.2;
    background: linear-gradient(90deg, #fff, rgba(255, 255, 255, 0.6));
    width: fit-content;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .by {
    font-size: 1.25rem;
    font-weight: 400;
    line-height: 1.2;
    color: rgba(255, 255, 255, 0.65);
    letter-spacing: -0.01em;
  }

  .controls {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    min-height: 2.5rem;
  }

  .play-pause-button {
    position: relative;
    height: 2.5rem;
    min-width: 2.5rem;
    padding: 0.625rem 1rem;
    background-color: transparent;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 0.625rem;
    cursor: pointer;
    transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border: none;
    outline: none;
    flex-shrink: 0;
  }

  .play-pause-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.05);
  }

  .play-pause-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .progress-container {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex: 1 1 0;
    min-width: 0;
    height: 2.5rem;
    background-color: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 0.625rem;
    cursor: pointer;
  }

  .progress-hover-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 0.625rem;
    pointer-events: none;
    overflow: hidden;
  }

  .progress-hover {
    position: relative;
    width: var(--progress-hover-width, 0);
    height: 100%;
    pointer-events: none;
    background-color: transparent;
    transition: background-color 0.15s ease-in-out;
  }

  .progress-container.active .progress-hover {
    background-color: rgba(255, 255, 255, 0.05);
  }

  .indicator-container {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2.75rem;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s ease-in-out;
  }

  .progress-container.active .indicator-container {
    opacity: 1;
  }

  .indicator-top-container {
    position: absolute;
    bottom: 1.25rem;
    left: 0;
    width: 100%;
    height: 1.6875rem;
    pointer-events: none;
  }

  .indicator-top-container .indicator {
    position: absolute;
    bottom: 0;
    left: calc(
      var(--progress-hover-width, 0) +
        (1px - (var(--progress-hover-ratio, 0) * 1px))
    );
    width: 2px;
    height: 100%;
    background-color: #fff;
    transform: translateX(-50%);
  }

  .indicator-top-container .indicator::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 0.375rem;
    height: 0.375rem;
    background-color: #fff;
    border-radius: 999px;
  }

  .indicator-bottom-container {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 1.25rem;
    border-bottom-left-radius: 0.625rem;
    border-bottom-right-radius: 0.625rem;
    overflow: hidden;
    pointer-events: none;
  }

  .indicator-bottom-container .indicator {
    position: absolute;
    bottom: 0;
    left: calc(
      var(--progress-hover-width, 0) +
        (1px - (var(--progress-hover-ratio, 0) * 1px))
    );
    width: 2px;
    height: 100%;
    background-color: #fff;
    transform: translateX(-50%);
  }

  .tooltip-container {
    position: absolute;
    bottom: 100%;
    left: 0;
    width: 100%;
    height: auto;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s ease-in-out;
  }

  .progress-container.active .tooltip-container {
    opacity: 1;
  }

  .tooltip {
    position: absolute;
    bottom: 1rem;
    left: calc(
      var(--progress-hover-width, 0) +
        (1px - (var(--progress-hover-ratio, 0) * 1px))
    );
    transform: translateX(-50%);
    font-size: 0.75rem;
    line-height: 0.9375rem;
    font-weight: 500;
    color: #000;
    background-color: #fff;
    border-radius: 0.5rem;
    padding: 0.25rem 0.5rem;
    white-space: nowrap;
  }

  .tooltip-thing {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translate(-50%, 50%);
    width: calc(100% / 3);
    height: auto;
    pointer-events: none;
  }

  .progress-bar-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 0.625rem;
    pointer-events: none;
    overflow: hidden;
  }

  .progress-bar {
    width: 0;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.1);
    pointer-events: none;
  }

  .bars {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 0 0.75rem;
  }

  .bar {
    width: 1px;
    height: 1rem;
    background-color: rgba(255, 255, 255, 0.1);
    flex-shrink: 0;
  }

  .bar:first-of-type,
  .bar:last-of-type {
    width: 0;
    background-color: transparent;
  }

  .timecode {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.65);
    width: 1.25rem;
    user-select: none;
  }

  .time-duration {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.65);
    background-color: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 0.625rem;
    height: 2.5rem;
    padding: 0 1rem;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .volume-full-screen-container {
    display: flex;
    flex-direction: row;
    gap: 1px;
    justify-content: flex-end;
    flex-shrink: 0;
  }

  .volume-container {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }

  .volume-button {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    box-sizing: content-box !important;
    width: 1.25rem;
    height: 2.5rem;
    padding: 0 1rem !important;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    cursor: pointer;
    border-top-left-radius: 0.625rem;
    border-bottom-left-radius: 0.625rem;
    background-color: transparent;
    transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);
    border: none;
    outline: none;
  }

  .volume-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.05);
    border-top-left-radius: 0.625rem;
    border-bottom-left-radius: 0.625rem;
    transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .volume-container:hover .volume-button::before,
  .volume-container.dragging .volume-button::before {
    border-top-left-radius: 0;
  }

  .volume-container:hover .volume-button,
  .volume-container.dragging .volume-button {
    border-top-left-radius: 0;
    background-color: rgba(255, 255, 255, 0.1);
  }

  .volume-bar-container {
    position: absolute;
    bottom: 100%;
    left: 0;
    width: 100%;
    height: 2.75rem;
    opacity: 0;
    background-color: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-top-right-radius: 0.625rem;
    border-top-left-radius: 0.625rem;
    transform-origin: bottom;
    transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);
    overflow: hidden;
    cursor: grab;
  }

  .volume-container:hover .volume-bar-container,
  .volume-container.dragging .volume-bar-container {
    height: 7.75rem;
    opacity: 1;
  }

  .volume-bars {
    position: absolute;
    bottom: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-evenly;
    height: 7.75rem;
    width: 100%;
    pointer-events: none;
  }

  .volume-bars > div {
    width: 1rem;
    height: 0.0625rem;
    background-color: rgba(255, 255, 255, 0.1);
  }

  .volume-bar-progress {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: rgba(255, 255, 255, 0.1);
    pointer-events: none;
  }

  .full-screen-button {
    height: 2.5rem;
    padding: 0 1rem;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    cursor: pointer;
    transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    border-top-right-radius: 0.625rem;
    border-bottom-right-radius: 0.625rem;
    background-color: rgba(255, 255, 255, 0.05);
    border: none;
    outline: none;
  }

  .full-screen-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .buffering-indicator {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }

  .buffering-indicator svg {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .video-player--fullscreen {
    width: 100vw !important;
    height: 100vh !important;
    aspect-ratio: unset !important;
  }

  button {
    cursor: pointer;
    border: none;
    background: none;
    outline: none;
    padding: 0;
    margin: 0;
  }
</style>
