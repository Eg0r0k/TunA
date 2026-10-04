<template>
    <div class="note-visualizer bg-card rounded-lg border-2 p-4 w-full max-w-[300px] ">
        <div class="flex flex-col items-center">
            <div class="tuner-gauge relative w-52 h-36 mb-4">
                <div class="gauge-arc"></div>
                <div class="gauge-zone"></div>
                <div class="gauge-indicator" :class="{ 'gauge-indicator-idle': !tunerStore.targetNote }"
                    :style="{ transform: `rotate(${tunerStore.gaugeRotation}deg)` }"></div>
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
                    {{ tunerStore.adjacentNotes.prev.name }}<span class="text-xs ml-1">{{
                        tunerStore.adjacentNotes.prev.octave }}</span>
                </div>
                <div class="text-4xl font-bold text-foreground">
                    {{ tunerStore.noteParts.name }}<span class="text-xl ml-1">{{ tunerStore.noteParts.octave
                        }}</span>
                </div>
                <div class="text-muted-foreground text-lg">
                    {{ tunerStore.adjacentNotes.next.name }}<span class="text-xs ml-1">{{
                        tunerStore.adjacentNotes.next.octave }}</span>
                </div>
            </div>

            <div class="flex flex-col items-center gap-2 text-muted-foreground w-full">
                <div class="flex gap-4 text-sm tabular-nums">
                    <span>{{ $t('tuner.frequency', { frequency: tunerStore.formatFrequency }) }}</span>
                    <span :class="tunerStore.accuracyTextColor">{{ $t('tuner.cents', { cents: tunerStore.formatCents })
                        }}</span>
                </div>
                <span role="status" aria-live="polite" class="text-sm font-medium"
                    :class="tunerStore.accuracyTextColor">
                    {{ $t(`tuner.status.${tunerStore.accuracyStatus}`) }}
                    <template v-if="tunerStore.selectedString">
                        ({{ splitNote(tunerStore.selectedString).name }}{{
                            splitNote(tunerStore.selectedString).octave }})
                    </template>
                </span>
                <div v-if="tunerStore.isActive" class="w-full h-1 rounded-full bg-muted overflow-hidden"
                    role="meter" :aria-label="$t('tuner.inputLevel')" aria-valuemin="0" aria-valuemax="100"
                    :aria-valuenow="Math.round(tunerStore.level * 100)">
                    <div class="h-full bg-primary/70 level-bar" :style="{ transform: `scaleX(${tunerStore.level})` }">
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="flex items-center gap-2">
        <Button @click="tunerStore.toggleTuner" :variant="tunerStore.isActive ? 'destructive' : 'default'">
            {{ tunerStore.isActive ? $t('tuner.stop') : $t('tuner.start') }}
        </Button>
        <Button variant="outline" @click="tunerStore.playReference()"
            :aria-pressed="!!tunerStore.playingReferenceNote"
            :title="$t('tuner.referenceTone', { note: tunerStore.referenceNote })">
            <component :is="tunerStore.playingReferenceNote ? VolumeX : Volume2" />
            {{ tunerStore.playingReferenceNote ?? tunerStore.referenceNote }}
        </Button>
    </div>

    <div class="standard-tuning" v-if="tunerStore.mode === 'instrument'">
        <div class="flex justify-center flex-wrap gap-4">
            <button :aria-pressed="isSelected"
                v-for="({ note, displayName, isCurrent, isTuned, isSelected, displayOctave }, index) in tunerStore.memoizedTuningState"
                :key="`${index}-${note}`" :aria-label="note"
                class="tuning-note px-4 py-2 rounded-lg transition-colors duration-200" :class="{
                    'bg-secondary text-secondary-foreground': isCurrent && !isTuned,
                    'bg-primary text-primary-foreground': isTuned,
                    'ring-2 ring-accent-foreground': isSelected
                }" @click="tunerStore.toggleStringSelection(note)">
                {{ displayName }}

                <span class="text-xs">{{ displayOctave }}</span>
            </button>
        </div>
        <p class="text-xs text-muted-foreground text-center mt-3">
            {{ tunerStore.selectedString ? $t('tuner.hintSelected') : $t('tuner.hintAuto') }}
        </p>
    </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-vue-next';

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
    transition: transform 0.15s ease-out;
}

.gauge-indicator-idle {
    opacity: 0.4;
}

.level-bar {
    transform-origin: left center;
    transition: transform 0.08s linear;
}

@media (prefers-reduced-motion: reduce) {

    .gauge-indicator,
    .level-bar {
        transition: none;
    }
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