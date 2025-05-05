<template>
    <div class="flex flex-col items-center h-full  gap-4">
        <Dialog>
            <DialogTrigger>
                Edit Profile
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit profile</DialogTitle>
                    <DialogDescription>
                        Make changes to your profile here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    Save changes
                </DialogFooter>
            </DialogContent>
        </Dialog>
        <Select :model-value="currentTuning"
            @update:model-value="(value) => handleTuningChange(value as Tuning | null)">
            <SelectTrigger class="w-[240px]">
                <SelectValue placeholder="Select a tuning">
                    {{ currentTuning.name }}
                </SelectValue>
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Guitar Tunings</SelectLabel>
                    <SelectItem v-for="tuning in GUITAR_TUNINGS" :key="tuning.id" :value="tuning">
                        {{ tuning.name }}
                    </SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
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
                    <span class="text-sm">{{ formatFrequency }} Hz</span>
                    <span class="text-sm font-medium" :class="accuracyTextColor">
                        {{ accuracyText }}
                        <template v-if="selectedString">
                            ({{ selectedString.slice(0, -1) }}{{ selectedString.slice(-1) }})
                        </template>
                    </span>
                </div>
            </div>
        </div>

        <div class="flex items-center gap-4">
            <Button @click="isActive ? stop() : start()" :variant="isActive ? 'destructive' : 'default'">
                {{ isActive ? 'Stop' : 'Start' }} Tuner
            </Button>
        </div>

        <div class="standard-tuning" v-if="isActive">
            <div class="flex gap-4">
                <button v-for="({ note, isCurrent, isTuned, isSelected }, index) in memoizedTuningState" :key="index"
                    class="tuning-note px-4 py-2 rounded-lg transition-colors duration-200" :class="{
                        'bg-secondary text-secondary-foreground': isCurrent,
                        'bg-primary text-primary-foreground': isTuned,
                        'ring-2 ring-accent': isSelected
                    }" @click="toggleStringSelection(note)">
                    {{ note.slice(0, -1) }}
                    <span class="text-xs">{{ note.slice(-1) }}</span>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useFrequencyAnalyzer } from '@/composables/useFrequencyAnalyzer';
import { computed } from 'vue';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'

import { GUITAR_TUNINGS, type Tuning } from '@/data/tunings';
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

const accuracyText = computed(() => {
    if (!frequency.value) return '—';

    if (selectedString.value) {
        if (suggestedNote.value !== selectedString.value) {
            return 'Wrong string';
        }

        if (Math.abs(accuracy.value) < TUNER_CONFIG.TUNING_THRESHOLD)
            return 'In tune';
        return accuracy.value > 0 ? 'Tune down' : 'Tune up';
    }

    if (Math.abs(accuracy.value) < TUNER_CONFIG.TUNING_THRESHOLD)
        return 'In tune';
    return accuracy.value > 0 ? 'Too high' : 'Too low';
});

const formatFrequency = computed(() =>
    frequency.value ? Math.round(frequency.value * 100) / 100 : '—'
);

const gaugeRotation = computed(() => {
    if (!frequency.value) return 0;
    return Math.round(accuracy.value * TUNER_CONFIG.GAUGE_MAX_ROTATION * 100) / 100;
});

const memoizedTuningState = computed(() =>
    currentTuning.value.notes.map(note => ({
        note,
        isCurrent: isCurrentNote(note),
        isTuned: isNoteTuned(note),
        isSelected: selectedString.value === note
    }))
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