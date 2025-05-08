<template>
    <section class="flex flex-col items-center h-full gap-4">
        <Dialog>
            <DialogTrigger
                class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                {{ currentInstrument.name }} - {{ currentTuning.name }}
            </DialogTrigger>
            <DialogContent class="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{{ $t('tuner.instrumentDialog.title') }}</DialogTitle>
                    <DialogDescription>{{ $t('tuner.instrumentDialog.description') }}</DialogDescription>

                </DialogHeader>

                <div class="grid gap-4 py-4">
                    <div class="grid gap-2">
                        <Label>{{ $t('tuner.selectInstrument') }}</Label>

                        <Select :model-value="currentInstrument"
                            @update:model-value="(value) => handleInstrumentChange(value as Instrument)">
                            <SelectTrigger>
                                <SelectValue :placeholder="$t('tuner.selectInstrument')" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem v-for="instrument in INSTRUMENTS" :key="instrument.id" :value="instrument">
                                    {{ instrument.name }}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div class="grid gap-2">
                        <Label>{{ $t('tuner.selectTuning') }}</Label>
                        <Select :model-value="currentTuning"
                            @update:model-value="(value) => handleTuningChange(value as Tuning)">
                            <SelectTrigger>
                                <SelectValue :placeholder="$t('tuner.selectTuning')" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem v-for="tuning in currentInstrument.tunings" :key="tuning.id"
                                    :value="tuning">
                                    {{ tuning.name }}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
        <div class="note-visualizer bg-card rounded-lg border-2 p-4 w-full max-w-[300px] ">
            <div class="flex flex-col items-center">
                <div class="tuner-gauge relative w-52 h-36 mb-4">
                    <div class="gauge-arc"></div>
                    <div class="gauge-zone"></div>
                    <div class="gauge-indicator" :style="{ transform: `rotate(${gaugeRotation}deg)` }"></div>
                    <div class="gauge-center"></div>
                    <div class="gauge-marks">
                        <div v-for="i in 11" :key="i" class="gauge-mark" :class="{ 'gauge-mark-center': i === 6 }"
                            :style="{ transform: `rotate(${-90 + (i - 1) * 18}deg)` }">
                        </div>
                    </div>
                    <div class="absolute left-3 top-2 transform text-2xl text-muted-foreground">♭</div>
                    <div class="absolute right-3 top-2 transform text-2xl text-muted-foreground">♯</div>
                </div>

                <div class="flex items-baseline justify-between w-full px-4 mb-4">
                    <div class="text-muted-foreground text-lg">
                        {{ prevNote }}<span class="text-xs ml-1">{{ noteParts.octave }}</span>
                    </div>
                    <div class="text-4xl font-bold text-foreground">
                        {{ noteParts.name }}<span class="text-xl ml-1">{{ noteParts.octave }}</span>
                    </div>
                    <div class="text-muted-foreground text-lg">
                        {{ nextNote }}<span class="text-xs ml-1">{{ noteParts.octave }}</span>
                    </div>
                </div>

                <div class="flex flex-col items-center gap-2 text-muted-foreground">
                    <span class="text-sm"> {{ $t('tuner.frequency', { frequency: formatFrequency }) }}</span>
                    <span role="status" aria-live="polite" class="text-sm font-medium" :class="accuracyTextColor">
                        {{ $t(`tuner.status.${accuracyStatus}`) }}
                        <template v-if="selectedString">
                            ({{ splitNote(selectedString).name }}{{ splitNote(selectedString).octave }})
                        </template>
                    </span>
                </div>
            </div>
        </div>

        <div class="flex items-center gap-4">
            <Button @click="isActive ? stop() : start()" :variant="isActive ? 'destructive' : 'default'">
                {{ isActive ? $t('tuner.stop') : $t('tuner.start') }}

            </Button>
        </div>

        <div class="standard-tuning" v-if="isActive">
            <div class="flex justify-center flex-wrap gap-4">
                <button :aria-pressed="isSelected"
                    v-for="({ note, displayName, isCurrent, isTuned, isSelected, displayOctave }, index) in memoizedTuningState"
                    :key="index" class="tuning-note px-4 py-2 rounded-lg transition-colors duration-200" :class="{
                        'bg-secondary text-secondary-foreground': isCurrent,
                        'bg-primary text-primary-foreground': isTuned,
                        'ring-2 ring-accent': isSelected
                    }" @keydown.enter.space="toggleStringSelection(note)">
                    {{ displayName }}

                    <span class="text-xs">{{ displayOctave }}</span>
                </button>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { useFrequencyAnalyzer } from '@/composables/useFrequencyAnalyzer';
import { ref, computed } from 'vue';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

import { INSTRUMENTS, type Instrument, type Tuning } from '@/data/tunings';
import { NoteWithOctave, TUNER_CONFIG } from '@/constants/tuner';
import { getPrevNote, getNextNote, splitNote } from '@/utils/noteUtils';

const {
    accuracy,
    isActive,
    start,
    stop,
    frequency,
    suggestedNote,
    currentTuning,
    setTuning,
    tunedStrings,
    selectedString,
    setSelectedString,
    resetTuning,
} = useFrequencyAnalyzer();

const currentInstrument = ref<Instrument>(INSTRUMENTS[0]);

const handleInstrumentChange = (instrument: Instrument) => {
    currentInstrument.value = instrument;
    handleTuningChange(instrument.tunings[0]);
};

const handleTuningChange = (tuning: Tuning | null): void => {
    if (tuning && tuning.id !== currentTuning.value.id) {
        setTuning(tuning);
        resetTuning();
        setSelectedString(null);
    }
};

const noteParts = computed(() => splitNote(suggestedNote.value));
const currentNote = computed(() => noteParts.value.name);
const prevNote = computed(() => getPrevNote(currentNote.value));
const nextNote = computed(() => getNextNote(currentNote.value));

const accuracyTextColor = computed(() => {
    const acc = Math.abs(accuracy.value);
    if (acc < 0.1) return 'text-primary';
    if (acc < 0.3) return 'text-yellow-500';
    return 'text-destructive';
});

// We return the status as strings for i18n
// exemple: tuneUp -> tuner.status.tuneUp = status in the required language
const accuracyStatus = computed(() => {
    if (!frequency.value) return 'default';

    if (selectedString.value) {
        if (suggestedNote.value !== selectedString.value) return 'wrongString';
        if (Math.abs(accuracy.value) < TUNER_CONFIG.TUNING_THRESHOLD) return 'inTune';
        return accuracy.value > 0 ? 'tuneDown' : 'tuneUp';
    }

    if (Math.abs(accuracy.value) < TUNER_CONFIG.TUNING_THRESHOLD) return 'inTune';
    return accuracy.value > 0 ? 'tooHigh' : 'tooLow';
});

const formatFrequency = computed(() =>
    frequency.value ? Math.round(frequency.value * 100) / 100 : '—'
);

const gaugeRotation = computed(() => {
    if (!frequency.value) return 0;
    return Math.round(accuracy.value * TUNER_CONFIG.GAUGE_MAX_ROTATION * 100) / 100;
});

const memoizedTuningState = computed(() =>
    currentTuning.value.notes.map(note => {
        const { name, octave } = splitNote(note);
        return {
            note,
            displayName: name,
            displayOctave: octave,
            isCurrent: isCurrentNote(note),
            isTuned: isNoteTuned(note),
            isSelected: selectedString.value === note
        };
    })
);

const isCurrentNote = (targetNote: NoteWithOctave) => {
    return suggestedNote.value === targetNote;
};

const isNoteTuned = (targetNote: NoteWithOctave) => {
    const stringState = tunedStrings.value.get(targetNote);
    return stringState?.tuned ?? false;
};

const toggleStringSelection = (note: NoteWithOctave) => {
    if (selectedString.value === note) {
        setSelectedString(null);
    } else {
        setSelectedString(note);
    }
};
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