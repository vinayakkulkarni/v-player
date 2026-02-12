import { ref, onMounted, onBeforeUnmount, type Ref } from 'vue';

export function useFullscreen(playerRef: Ref<HTMLElement | null>) {
  const isFullscreen = ref(false);

  const enterFullscreen = async (): Promise<void> => {
    if (!playerRef.value) return;
    try {
      await playerRef.value.requestFullscreen();
    } catch {
      // Fullscreen not supported or denied
    }
  };

  const exitFullscreen = async (): Promise<void> => {
    if (!document.fullscreenElement) return;
    try {
      await document.exitFullscreen();
    } catch {
      // Exit fullscreen failed
    }
  };

  const toggleFullscreen = (): void => {
    if (document.fullscreenElement) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  };

  const onFullscreenChange = () => {
    isFullscreen.value = !!document.fullscreenElement;
  };

  onMounted(() => {
    document.addEventListener('fullscreenchange', onFullscreenChange);
  });

  onBeforeUnmount(() => {
    document.removeEventListener('fullscreenchange', onFullscreenChange);
  });

  return {
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
  };
}
