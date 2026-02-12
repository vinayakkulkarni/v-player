import { ref, onMounted, onBeforeUnmount, type Ref } from 'vue';
import { clamp } from '../utils/format';

export function useVolumeControl(
  videoRef: Ref<HTMLVideoElement | null>,
  initialVolume: number,
) {
  const volume = ref(clamp(initialVolume, 0, 1));
  const isMuted = ref(false);
  const isDragging = ref(false);
  let lastVolume = volume.value;

  const applyVolume = () => {
    if (!videoRef.value) return;
    videoRef.value.volume = isMuted.value ? 0 : volume.value;
  };

  const setVolume = (val: number) => {
    volume.value = clamp(val, 0, 1);
    if (volume.value > 0) {
      isMuted.value = false;
      lastVolume = volume.value;
    }
    applyVolume();
  };

  const toggleMute = () => {
    if (isMuted.value || volume.value === 0) {
      isMuted.value = false;
      volume.value = lastVolume > 0 ? lastVolume : 1;
    } else {
      lastVolume = volume.value;
      isMuted.value = true;
    }
    applyVolume();
  };

  const getVolumeFromMouse = (
    e: MouseEvent,
    barContainer: HTMLElement,
  ): number => {
    const rect = barContainer.getBoundingClientRect();
    const fromBottom = rect.bottom - e.clientY;
    return clamp(fromBottom / rect.height, 0, 1);
  };

  const startDrag = (e: MouseEvent, barContainer: HTMLElement) => {
    isDragging.value = true;
    const val = getVolumeFromMouse(e, barContainer);
    setVolume(val);
  };

  const onDocumentMouseMove = (e: MouseEvent) => {
    if (!isDragging.value) return;
    const barEl = document.querySelector(
      '.v-player-volume-bar-container',
    ) as HTMLElement | null;
    if (!barEl) return;
    const val = getVolumeFromMouse(e, barEl);
    setVolume(val);
  };

  const onDocumentMouseUp = () => {
    if (!isDragging.value) return;
    isDragging.value = false;
  };

  onMounted(() => {
    applyVolume();
    document.addEventListener('mousemove', onDocumentMouseMove);
    document.addEventListener('mouseup', onDocumentMouseUp);
  });

  onBeforeUnmount(() => {
    document.removeEventListener('mousemove', onDocumentMouseMove);
    document.removeEventListener('mouseup', onDocumentMouseUp);
  });

  return {
    volume,
    isMuted,
    isDragging,
    setVolume,
    toggleMute,
    startDrag,
  };
}
