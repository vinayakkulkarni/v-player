<script setup lang="ts">
import { VPlayer } from "v-player";

const onPlay = () => {
  console.log("play");
};

const onPause = () => {
  console.log("pause");
};

const onTimeUpdate = (payload: { currentTime: number; duration: number }) => {
  console.log("timeupdate", payload);
};

const onVolumeChange = (volume: number) => {
  console.log("volumechange", volume);
};

const onFullscreenChange = (isFullscreen: boolean) => {
  console.log("fullscreenchange", isFullscreen);
};

const onEnded = () => {
  console.log("ended");
};
</script>

<template>
  <main
    style="width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center"
  >
    <VPlayer
      src="https://download.samplelib.com/mp4/sample-30s.mp4"
      title="Sample Video"
      subtitle="by v-player"
      width="640px"
      aspect-ratio="16/9"
      :volume="0.8"
      preload="auto"
      @play="onPlay"
      @pause="onPause"
      @timeupdate="onTimeUpdate"
      @volumechange="onVolumeChange"
      @fullscreenchange="onFullscreenChange"
      @ended="onEnded"
    />
  </main>
</template>
