<template>
  <Toaster :expand="true" :visible-toasts="2" position="top-right" class="pointer-events-auto" />
  <div class="h-screen flex flex-col">
    <WindowTitle />
    <div class="flex-1 min-h-0 grid grid-rows-[1fr_auto] overflow-hidden">
      <main id="main" class="min-h-0 overflow-x-hidden overflow-y-scroll p-4">
        <RouterView />
      </main>
      <MainHeader />
    </div>
  </div>
</template>

<script setup lang="ts">
import WindowTitle from './WindowTitle.vue'
import MainHeader from '@/components/header/MainHeader.vue';
import { useColorMode } from '@vueuse/core';
import { Toaster } from './components/ui/sonner';

useColorMode();
</script>