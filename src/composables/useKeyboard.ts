import { onMounted, onBeforeUnmount, type Ref } from 'vue';

interface KeyboardActions {
  togglePlay: () => void;
  seek: (time: number) => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
  videoRef: Ref<HTMLVideoElement | null>;
}

export function useKeyboard(enabled: Ref<boolean>, actions: KeyboardActions) {
  const onKeyDown = (e: KeyboardEvent) => {
    if (!enabled.value) return;

    const target = e.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.isContentEditable
    ) {
      return;
    }

    switch (e.key) {
      case ' ':
        e.preventDefault();
        actions.togglePlay();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (actions.videoRef.value) {
          actions.seek(Math.max(0, actions.videoRef.value.currentTime - 5));
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (actions.videoRef.value) {
          actions.seek(
            Math.min(
              actions.videoRef.value.duration,
              actions.videoRef.value.currentTime + 5,
            ),
          );
        }
        break;
      case 'm':
      case 'M':
        e.preventDefault();
        actions.toggleMute();
        break;
      case 'f':
      case 'F':
        e.preventDefault();
        actions.toggleFullscreen();
        break;
    }
  };

  onMounted(() => {
    document.addEventListener('keydown', onKeyDown);
  });

  onBeforeUnmount(() => {
    document.removeEventListener('keydown', onKeyDown);
  });
}
