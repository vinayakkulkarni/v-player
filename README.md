# V-Player 🎥

<!-- Badges -->

[![Pipeline](https://img.shields.io/github/actions/workflow/status/vinayakkulkarni/v-player/pipeline.yml?branch=main&logo=github-actions&label=pipeline)](https://github.com/vinayakkulkarni/v-player/actions/workflows/pipeline.yml)
[![Doctor](https://img.shields.io/badge/doctor-audited-2ea043?logo=vuedotjs&label=doctor)](https://github.com/geoql/doctor)
[![GitHub release](https://img.shields.io/github/v/release/vinayakkulkarni/v-player?sort=semver&logo=github&label=release)](https://github.com/vinayakkulkarni/v-player/releases)
[![npm](https://img.shields.io/npm/v/v-player?logo=npm&label=npm)](https://www.npmjs.com/package/v-player)
[![JSR](https://img.shields.io/jsr/v/@vinayakkulkarni/v-player?logo=jsr&label=jsr)](https://jsr.io/@vinayakkulkarni/v-player)
[![npm downloads](https://img.shields.io/npm/dm/v-player?logo=npm&label=downloads)](http://npm-stat.com/charts.html?package=v-player)
[![bundle size](https://img.shields.io/bundlephobia/minzip/v-player?label=size)](https://bundlephobia.com/package/v-player@latest)
[![types](https://img.shields.io/npm/types/v-player?logo=typescript&label=types)](https://github.com/vinayakkulkarni/v-player/blob/main/package.json)
[![License](https://img.shields.io/github/license/vinayakkulkarni/v-player?logo=github&label=license)](./LICENSE)

[![vite-plus](https://img.shields.io/github/package-json/dependency-version/vinayakkulkarni/v-player/dev/vite-plus?logo=vite&label=vite-plus)](https://github.com/voidzero-dev/vite-plus)
[![typescript](https://img.shields.io/github/package-json/dependency-version/vinayakkulkarni/v-player/dev/typescript?logo=TypeScript&label=typescript)](https://www.typescriptlang.org/)
[![pnpm](https://img.shields.io/github/package-json/packageManager/vinayakkulkarni/v-player?label=pnpm&logo=pnpm)](https://pnpm.io/)
[![node](https://img.shields.io/node/v/v-player?logo=node.js&label=node)](https://nodejs.org/)

<!-- End Badges -->

---

Vue 3 HTML5 video player with glassmorphism UI, custom controls, keyboard shortcuts, and TypeScript-native ESM exports.

## Features

- 💪 Built with [TypeScript](https://www.typescriptlang.org/)
- 🌠 Built for [Vue 3](https://vuejs.org/) (Composition API + `<script setup>`)
- 🎨 Glassmorphism UI with customisable controls
- ⌨️ Keyboard shortcuts (play/pause, seek, volume, fullscreen)
- 📦 Tree-shakable ESM only — no CommonJS bundle
- 🎯 Full TypeScript types via `rolldown-plugin-dts`

## Installation

```bash
pnpm add v-player
```

## Usage

Global component:

```ts
// main.ts
import { VPlayer } from 'v-player';
import { createApp } from 'vue';

const app = createApp({});
app.component('VPlayer', VPlayer);
```

Or use locally:

```vue
<script setup lang="ts">
  import { VPlayer } from 'v-player';
</script>

<template>
  <VPlayer src="/path/to/video.mp4" />
</template>
```

## Build Setup

```bash
# install dependencies
pnpm install --frozen-lockfile

# package the library
pnpm run build
```

## Contributing

1. Fork it ([https://github.com/vinayakkulkarni/v-player/fork](https://github.com/vinayakkulkarni/v-player/fork))
2. Create your feature branch (`git checkout -b feat/new-feature`)
3. Commit your changes (`git commit -Sam 'feat: add feature'`)
4. Push to the branch (`git push origin feat/new-feature`)
5. Create a new Pull Request

## Author

**Vinayak Kulkarni**, **\@\_vk\_**

- [Twitter](https://twitter.com/_vk_)
- [GitHub](https://github.com/vinayakkulkarni)
- [Email](mailto:inbox.vinayak@gmail.com)

## License

[MIT](LICENSE) © [Vinayak Kulkarni](https://twitter.com/_vk_)
