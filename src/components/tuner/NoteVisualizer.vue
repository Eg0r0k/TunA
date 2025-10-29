<template>
    <div class="note-visualizer bg-card rounded-lg border-2 p-4 w-full max-w-[300px] ">
        <div class="flex flex-col items-center">
            <div class="tuner-gauge relative w-52 h-36 mb-4">
                <div class="gauge-arc"></div>
                <div class="gauge-zone"></div>
                <div class="gauge-indicator" :style="{ transform: `rotate(${tunerStore.gaugeRotation}deg)` }"></div>
                <div class="gauge-center"></div>
                <div class="gauge-marks" v-once>
                    <div v-for="i in 11" :key="i" class="gauge-mark" :class="{ 'gauge-mark-center': i === 6 }"
                        :style="{ transform: `rotate(${-90 + (i - 1) * 18}deg)` }">
                    </div>
                </div>
                <div class="absolute left-3 top-2 transform text-2xl text-muted-foreground">♭</div>
                <div class="absolute right-3 top-2 transform text-2xl text-muted-foreground">♯</div>
            </div>

            <div class="flex items-baseline justify-between w-full px-4 mb-4">
                <div class="text-muted-foreground text-lg">
                    {{ tunerStore.prevNote }}<span class="text-xs ml-1">{{ tunerStore.noteParts.octave }}</span>
                </div>
                <div class="text-4xl font-bold text-foreground">
                    {{ tunerStore.noteParts.name }}<span class="text-xl ml-1">{{ tunerStore.noteParts.octave
                        }}</span>
                </div>
                <div class="text-muted-foreground text-lg">
                    {{ tunerStore.nextNote }}<span class="text-xs ml-1">{{ tunerStore.noteParts.octave }}</span>
                </div>
            </div>

            <div class="flex flex-col items-center gap-2 text-muted-foreground">
                <span class="text-sm"> {{ $t('tuner.frequency', { frequency: tunerStore.formatFrequency }) }}</span>
                <span role="status" aria-live="polite" class="text-sm font-medium"
                    :class="tunerStore.accuracyTextColor">
                    {{ $t(`tuner.status.${tunerStore.accuracyStatus}`) }}
                    <template v-if="tunerStore.selectedString">
                        ({{ splitNote(tunerStore.selectedString).name }}{{
                            splitNote(tunerStore.selectedString).octave }})
                    </template>
                </span>
            </div>
        </div>
    </div>

    <div class="flex items-center gap-4">
        <Button @click="tunerStore.toggleTuner" :variant="tunerStore.isActive ? 'destructive' : 'default'">
            {{ tunerStore.isActive ? $t('tuner.stop') : $t('tuner.start') }}
        </Button>
    </div>

    <div class="standard-tuning" v-if="tunerStore.isActive">
        <div class="flex justify-center flex-wrap gap-4">
            <button :aria-pressed="isSelected"
                v-for="({ note, displayName, isCurrent, isTuned, isSelected, displayOctave }, index) in tunerStore.memoizedTuningState"
                :key="`${index}-${note}`" :aria-labelledby="`note-${note}`"
                class="tuning-note px-4 py-2 rounded-lg transition-colors duration-200" :class="{
                    'bg-secondary text-secondary-foreground': isCurrent,
                    'bg-primary text-primary-foreground': isTuned,
                    'ring-2 ring-accent': isSelected
                }" @click="tunerStore.toggleStringSelection(note)"
                @keydown.enter.space="tunerStore.toggleStringSelection(note)">
                {{ displayName }}

                <span class="text-xs">{{ displayOctave }}</span>
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';

import { splitNote } from '@/utils/noteUtils';
import { useTunerStore } from '@/stores/tunerStore';

const tunerStore = useTunerStore()

</script>

<style scoped>
.tuner-gauge {
    position: relative;
    overflow: hidden;
}

.note-visualizer {
    user-select: none;
}

.gauge-arc {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100%;
    border-radius: var(--radius-lg);
    border: 2px solid var(--color-border);
    border-bottom: none;
}

.gauge-zone {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 90%;
    background: linear-gradient(to bottom, transparent 0%, var(--color-primary) 100%);
    clip-path: polygon(0 0, 100% 0, 50% 100%);
}

.gauge-indicator {
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 2px;
    height: 90%;
    background: var(--color-primary);
    border-radius: 1px;
    transform-origin: bottom center;
    transition: transform 0.3s ease;
}

.gauge-center {
    position: absolute;
    bottom: -4px;
    left: 50%;
    width: 8px;
    height: 8px;
    background: var(--color-primary);
    border-radius: 50%;
    transform: translateX(-50%);
}

.gauge-marks {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100%;
}

.gauge-mark {
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 1px;
    height: 8px;
    background: var(--color-muted-foreground);
    transform-origin: bottom center;
}

.gauge-mark-center {
    height: 10px;
    width: 2px;
    background: var(--color-primary);
}
</style>