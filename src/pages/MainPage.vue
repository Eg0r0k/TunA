<template>
    <section class="flex flex-col items-center h-full gap-4">
        <div role="radiogroup" :aria-label="$t('tuner.mode.title')"
            class="inline-flex rounded-lg border bg-card p-1 gap-1">
            <button v-for="m in MODES" :key="m" role="radio" :aria-checked="tunerStore.mode === m"
                class="px-3 py-1 text-sm rounded-md transition-colors"
                :class="tunerStore.mode === m ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'"
                @click="tunerStore.setMode(m)">
                {{ $t(`tuner.mode.${m}`) }}
            </button>
        </div>
        <InstrumentDialog v-if="tunerStore.mode === 'instrument'" />
        <NoteVisualizer />
    </section>
</template>

<script lang="ts" setup>
import InstrumentDialog from '@/components/tuner/InstrumentDialog.vue';
import NoteVisualizer from '@/components/tuner/NoteVisualizer.vue';
import { useTunerStore, type TunerMode } from '@/stores/tunerStore';
import { onUnmounted } from 'vue';

const MODES: TunerMode[] = ['instrument', 'chromatic'];

const tunerStore = useTunerStore();

// The tuner store outlives the page, so release the microphone when leaving it
onUnmounted(() => tunerStore.stop());
</script>
