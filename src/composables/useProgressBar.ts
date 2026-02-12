import { ref, computed, onMounted, onBeforeUnmount, type Ref } from 'vue';
import { clamp } from '../utils/format';

export function useProgressBar(
  progressRef: Ref<HTMLElement | null>,
  videoRef: Ref<HTMLVideoElement | null>,
  currentTime: Ref<number>,
  duration: Ref<number>,
  playFn: () => Promise<void>,
  pauseFn: () => void,
  isPlaying: Ref<boolean>,
) {
  const isHovering = ref(false);
  const isSeeking = ref(false);
  const hoverRatio = ref(0);
  const seekRatio = ref(0);
  const wasPlayingBeforeSeek = ref(false);
  let pendingSeekTime: number | null = null;

  const progressPercent = computed(() => {
    if (duration.value <= 0) return 0;
    return (currentTime.value / duration.value) * 100;
  });

  const hoverTime = computed(() => {
    return hoverRatio.value * duration.value;
  });

  const getRatioFromEvent = (e: MouseEvent): number => {
    if (!progressRef.value) return 0;
    const rect = progressRef.value.getBoundingClientRect();
    return clamp((e.clientX - rect.left) / rect.width, 0, 1);
  };

  const onMouseMove = (e: MouseEvent) => {
    isHovering.value = true;
    const ratio = getRatioFromEvent(e);
    hoverRatio.value = ratio;
  };

  const onMouseLeave = () => {
    isHovering.value = false;
  };

  const updateSeekPosition = (e: MouseEvent) => {
    const ratio = getRatioFromEvent(e);
    seekRatio.value = ratio;
    hoverRatio.value = ratio;
    pendingSeekTime = ratio * duration.value;
  };

  const onMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    isSeeking.value = true;
    wasPlayingBeforeSeek.value = isPlaying.value;
    if (isPlaying.value) pauseFn();
    updateSeekPosition(e);
  };

  const onDocumentMouseMove = (e: MouseEvent) => {
    if (!isSeeking.value) return;
    updateSeekPosition(e);
  };

  const onDocumentMouseUp = () => {
    if (!isSeeking.value) return;
    isSeeking.value = false;

    if (pendingSeekTime !== null && videoRef.value) {
      videoRef.value.currentTime = pendingSeekTime;
      pendingSeekTime = null;
    }

    if (wasPlayingBeforeSeek.value) {
      playFn();
    }
  };

  onMounted(() => {
    document.addEventListener('mousemove', onDocumentMouseMove);
    document.addEventListener('mouseup', onDocumentMouseUp);
  });

  onBeforeUnmount(() => {
    document.removeEventListener('mousemove', onDocumentMouseMove);
    document.removeEventListener('mouseup', onDocumentMouseUp);
  });

  return {
    isHovering,
    isSeeking,
    hoverRatio,
    seekRatio,
    hoverTime,
    progressPercent,
    onMouseMove,
    onMouseLeave,
    onMouseDown,
  };
}
