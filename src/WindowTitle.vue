<template>
    <nav role="toolbar" aria-label="Window controls" class="titlebar border-b" data-tauri-drag-region v-if="isTauriApp">
        <div class="titlebar-text">
            <span v-for="(char, index) in animatedText" :key="index" class="titlebar-char"
                :style="{ animationDelay: `${index * 0.1}s` }">
                {{ char }}
            </span>
        </div>
        <div class="titlebar-controls">
            <button class="titlebar-button" @click="minimizeWindow" :title="$t('window.minimize')">
                —
            </button>
            <button class="titlebar-button" @click="toggleMaximize"
                :title="isMaximized ? $t('window.restore') : $t('window.maximize')">
                ☐
            </button>
            <button class="titlebar-button titlebar-close" @click="closeWindow" :title="$t('window.close')">
                ✕
            </button>
        </div>
    </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { isTauri } from '@tauri-apps/api/core';
import { Window } from '@tauri-apps/api/window';

const isTauriApp = ref(false);

const appWindow = ref<Window | null>(null);
const isMaximized = ref(false);

const titleText = '-=[TunA]=-';
const animatedText = computed(() => titleText.split(''));

const minimizeWindow = () => appWindow.value?.minimize();
const closeWindow = () => appWindow.value?.close();
const toggleMaximize = async () => {
    if (!appWindow.value) return;
    isMaximized.value = await appWindow.value.isMaximized();
    if (isMaximized.value) {
        await appWindow.value.unmaximize();
    } else {
        await appWindow.value.maximize();
    }
    isMaximized.value = !isMaximized.value;
};

onMounted(async () => {
    isTauriApp.value = await isTauri();
    if (isTauriApp.value) {
        const { getCurrentWindow } = await import('@tauri-apps/api/window');
        appWindow.value = await getCurrentWindow();
        isMaximized.value = await appWindow.value.isMaximized();
    }
});
</script>

<style scoped>
.titlebar {
    z-index: 10000;
    height: 32px;
    background-color: var(--card);
    display: flex;
    user-select: none;
    -webkit-app-region: drag;
    position: relative;
}

.titlebar-text {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    font-size: 14px;
    font-weight: 500;
    color: var(--foreground);
    -webkit-app-region: no-drag;
}

.titlebar-char {
    opacity: 0;
    animation: typeEffect 0.3s ease-out forwards;
}

@keyframes typeEffect {
    0% {
        opacity: 0;
        transform: translateY(10px);
    }

    100% {
        opacity: 1;
        transform: translateY(0);
    }
}

.titlebar-controls {
    font-size: 14px;
    margin-left: auto;
    display: flex;
    height: 100%;
    -webkit-app-region: no-drag;
}

.titlebar-button {
    width: 46px;
    height: 100%;
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: background-color 0.2s ease;
}

.titlebar-button:hover {
    background-color: #e5e5e5;
}

.titlebar-button:active {
    background-color: #cccccc;
}

.titlebar-close:hover {
    background-color: #e81123;
    color: white;
}

.titlebar-close:active {
    background-color: #bf0f1d;
}

.titlebar-button svg {
    pointer-events: none;
}

@media (max-width: 600px) {
    .titlebar-text {
        font-size: 12px;
    }
}
</style>