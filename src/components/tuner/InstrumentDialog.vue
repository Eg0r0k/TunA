<template>
    <Dialog>
        <DialogTrigger class="dialog-trigger">
            <Button variant="outline">
                {{ tunerStore.currentInstrument.name }} - {{ tunerStore.currentTuning.name }}
            </Button>
        </DialogTrigger>
        <DialogContent class="sm:max-w-[425px] grid-rows-[auto_minmax(0,1fr)_auto] p-0 max-h-[90vh]">
            <DialogHeader class="p-6 pb-0">
                <DialogTitle v-if="mode === 'select'">{{ $t('tuner.instrumentDialog.title') }}</DialogTitle>
                <DialogTitle v-else>{{ $t('tuner.createCustomTuning.title') || 'Create Custom Tuning' }}</DialogTitle>
                <DialogDescription v-if="mode === 'select'">{{ $t('tuner.instrumentDialog.description') }}</DialogDescription>
                <DialogDescription v-else>{{ $t('tuner.createCustomTuning.description') || 'Customize a new tuning for the selected instrument.' }}</DialogDescription>
            </DialogHeader>

            <div v-if="mode === 'select'" class="grid gap-4 py-4 overflow-y-auto px-6">
                <div class="grid gap-2">
                    <Label>{{ $t('tuner.selectInstrument') }}</Label>
                    <Select :model-value="tunerStore.currentInstrument"
                        @update:model-value="(value) => tunerStore.handleInstrumentChange(value as Instrument)">
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
                    <Select :model-value="tunerStore.currentTuning"
                        @update:model-value="(value) => tunerStore.handleTuningChange(value as Tuning)">
                        <SelectTrigger>
                            <SelectValue :placeholder="$t('tuner.selectTuning')" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem v-for="tuning in tunerStore.currentInstrument.tunings" :key="tuning.id"
                                :value="tuning">
                                {{ tuning.name }}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div v-else class="grid gap-4 py-4 overflow-y-auto hide-scrollbar px-6">
                <div class="grid gap-2">
                    <Label>Tuning Name</Label>
                    <Input v-model="newName" placeholder="Enter tuning name" />
                </div>
                <div v-for="(note, index) in newTempNotes" :key="index" class="grid gap-2">
                    <div class="flex justify-between items-center">
                        <Label>String {{ index + 1 }}</Label>
                        <Button v-if="newTempNotes.length > 1" variant="destructive" size="sm" @click="removeString(index)">Remove</Button>
                    </div>
                    <div class="flex gap-2">
                        <Select v-model="newTempNotes[index].name">
                            <SelectTrigger>
                                <SelectValue placeholder="Note" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem v-for="n in noteNames" :key="n" :value="n">{{ n }}</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select v-model="newTempNotes[index].octave">
                            <SelectTrigger>
                                <SelectValue placeholder="Octave" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem v-for="o in octaves" :key="o" :value="o">{{ o }}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <Button v-if="newTempNotes.length < 12" variant="secondary" @click="addString">Add String</Button>
            </div>

            <DialogFooter v-if="mode === 'select'" class="p-6 pt-0 flex sm:justify-start justify-stretch">
                <Button variant="secondary" @click="startCreateMode">Create Custom Tuning</Button>
            </DialogFooter>

            <DialogFooter v-else class="p-6 pt-0 flex sm:justify-end justify-stretch gap-2">
                <Button variant="outline" @click="mode = 'select'">Cancel</Button>
                <Button @click="saveCustomTuning">Save</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>

<script setup lang="ts">
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { type Instrument, type Tuning } from '@/types/tuner/instruments';
import { type NoteName, type NoteWithOctave } from '@/types/tuner/notes';
import { useTunerStore } from '@/stores/tunerStore';
import Button from '../ui/button/Button.vue';
import { INSTRUMENTS } from '@/data/tunings';
import { ref } from 'vue';
import { addCustomTuning, getTuningsByInstrument } from '@/db/tuningService';

const tunerStore = useTunerStore();
const mode = ref<'select' | 'create'>('select');
const newName = ref<string>('');
const newTempNotes = ref<{ name: NoteName; octave: number }[]>([]);

const noteNames: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const octaves = [0, 1, 2, 3, 4, 5, 6, 7, 8];

const startCreateMode = () => {
    newTempNotes.value = [{ name: 'E', octave: 2 }];
    newName.value = '';
    mode.value = 'create';
};

const addString = () => {
    if (newTempNotes.value.length < 12) {
        newTempNotes.value.push({ name: 'E', octave: 2 });
    }
};

const removeString = (index: number) => {
    if (newTempNotes.value.length > 1) {
        newTempNotes.value.splice(index, 1);
    }
};

const saveCustomTuning = async () => {
    if (!newName.value || newTempNotes.value.length === 0 || newTempNotes.value.some(n => !n.name || n.octave === undefined)) {
        // Handle validation error if needed
        return;
    }
    const notes: NoteWithOctave[] = newTempNotes.value.map(
        (n) => `${n.name}${n.octave}` as NoteWithOctave
    );
    await addCustomTuning(tunerStore.currentInstrument.id, newName.value, notes);
    const customTunings = await getTuningsByInstrument(tunerStore.currentInstrument.id);
    
    // Update tunings: filter out existing customs and add new ones
    const defaultTunings = tunerStore.currentInstrument.tunings.filter((t: Tuning) => !t.custom);
    const updatedTunings = [
        ...defaultTunings,
        ...customTunings.map((c: any) => ({
            id: c.id.toString(),
            name: c.name,
            notes: c.notes,
            custom: true,
        })),
    ];
    tunerStore.currentInstrument.tunings = updatedTunings;
    
    // Set the new tuning as current
    const newTuning = updatedTunings.find((t: Tuning) => t.name === newName.value && t.custom);
    if (newTuning) {
        tunerStore.handleTuningChange(newTuning);
    }
    
    mode.value = 'select';
};
</script>