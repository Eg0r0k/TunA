<template>
    <Dialog v-model:open="open">
        <DialogTrigger as-child>
            <Button variant="outline">
                {{ tunerStore.currentInstrument.name }} - {{ tunerStore.currentTuning.name }}
            </Button>
        </DialogTrigger>
        <DialogContent class="sm:max-w-[425px] grid-rows-[auto_minmax(0,1fr)_auto] p-0 max-h-[90vh]">
            <DialogHeader class="p-6 pb-0">
                <DialogTitle>{{ title }}</DialogTitle>
                <DialogDescription v-if="mode === 'select'">{{ $t('tuner.instrumentDialog.description') }}
                </DialogDescription>
                <DialogDescription v-else>{{ $t('tuner.customTuning.description', {
                    instrument: tunerStore.currentInstrument.name }) }}</DialogDescription>
            </DialogHeader>

            <div v-if="mode === 'select'" class="grid gap-4 py-4 overflow-y-auto px-6">
                <div class="grid gap-2">
                    <Label>{{ $t('tuner.selectInstrument') }}</Label>
                    <Select :model-value="tunerStore.currentInstrument.id"
                        @update:model-value="(value) => tunerStore.handleInstrumentChange(value as string)">
                        <SelectTrigger>
                            <SelectValue :placeholder="$t('tuner.selectInstrument')" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem v-for="instrument in tunerStore.instruments" :key="instrument.id"
                                :value="instrument.id">
                                {{ instrument.name }}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div class="grid gap-2">
                    <Label>{{ $t('tuner.selectTuning') }}</Label>
                    <div class="flex gap-2">
                        <Select :model-value="tunerStore.currentTuning.id"
                            @update:model-value="(value) => tunerStore.handleTuningChange(value as string)">
                            <SelectTrigger class="flex-1 min-w-0">
                                <SelectValue :placeholder="$t('tuner.selectTuning')" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel v-if="customTunings.length" class="text-xs text-muted-foreground">{{ $t('tuner.customTuning.groupStandard')
                                        }}</SelectLabel>
                                    <SelectItem v-for="tuning in standardTunings" :key="tuning.id" :value="tuning.id">
                                        {{ tuning.name }}
                                    </SelectItem>
                                </SelectGroup>
                                <SelectGroup v-if="customTunings.length">
                                    <SelectLabel class="text-xs text-muted-foreground border-t mt-1 pt-2">{{ $t('tuner.customTuning.groupCustom') }}</SelectLabel>
                                    <SelectItem v-for="tuning in customTunings" :key="tuning.id" :value="tuning.id">
                                        {{ tuning.name }}
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <template v-if="tunerStore.currentTuning.custom">
                            <Button variant="outline" size="icon" :title="$t('tuner.customTuning.edit')"
                                :aria-label="$t('tuner.customTuning.edit')" @click="startEditMode">
                                <Pencil />
                            </Button>
                            <Button :variant="confirmingDelete ? 'destructive' : 'outline'" size="icon"
                                :title="deleteLabel" :aria-label="deleteLabel" @click="deleteCurrentTuning">
                                <Trash2 />
                            </Button>
                        </template>
                    </div>
                    <p v-if="confirmingDelete" role="alert" class="text-xs text-destructive">
                        {{ $t('tuner.customTuning.confirmDelete', { name: tunerStore.currentTuning.name }) }}
                    </p>
                    <p v-else class="text-xs text-muted-foreground">{{ tunerStore.currentTuning.notes.join(' · ') }}</p>
                </div>
            </div>

            <div v-else class="grid gap-4 py-4 overflow-y-auto hide-scrollbar px-6 content-start">
                <div class="grid gap-2">
                    <Label for="tuning-name">{{ $t('tuner.customTuning.name') }}</Label>
                    <Input id="tuning-name" v-model="newName" :placeholder="$t('tuner.customTuning.namePlaceholder')"
                        :aria-invalid="!!nameError" maxlength="40" @keydown.enter="saveCustomTuning" />
                    <p v-if="nameError" class="text-xs text-destructive">{{ nameError }}</p>
                </div>
                <div class="grid gap-2">
                    <Label>{{ $t('tuner.customTuning.strings') }}</Label>
                    <div v-for="(note, index) in newTempNotes" :key="note.key" class="flex gap-2 items-center">
                        <span class="w-6 text-sm text-muted-foreground tabular-nums">{{ index + 1 }}</span>
                        <Select v-model="note.name">
                            <SelectTrigger class="flex-1" :aria-label="$t('tuner.customTuning.note')">
                                <SelectValue :placeholder="$t('tuner.customTuning.note')" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem v-for="n in NOTES" :key="n" :value="n">{{ n }}</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select v-model="note.octave">
                            <SelectTrigger class="flex-1" :aria-label="$t('tuner.customTuning.octave')">
                                <SelectValue :placeholder="$t('tuner.customTuning.octave')" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem v-for="o in OCTAVES" :key="o" :value="o">{{ o }}</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="ghost" size="icon"
                            :aria-label="$t('tuner.referenceTone', { note: toNote(note) })"
                            :title="$t('tuner.referenceTone', { note: toNote(note) })"
                            @click="tunerStore.playReference(toNote(note))">
                            <Volume2 />
                        </Button>
                        <Button variant="ghost" size="icon" :disabled="newTempNotes.length <= 1"
                            :aria-label="$t('tuner.customTuning.remove')" :title="$t('tuner.customTuning.remove')"
                            @click="removeString(index)">
                            <X />
                        </Button>
                    </div>
                </div>
                <Button v-if="newTempNotes.length < MAX_STRINGS" variant="secondary" @click="addString">
                    <Plus /> {{ $t('tuner.customTuning.addString') }}
                </Button>
            </div>

            <DialogFooter v-if="mode === 'select'" class="p-6 pt-0 flex sm:justify-start justify-stretch">
                <Button variant="secondary" @click="startCreateMode">
                    <Plus /> {{ $t('tuner.customTuning.create') }}
                </Button>
            </DialogFooter>

            <DialogFooter v-else class="p-6 pt-0 flex sm:justify-end justify-stretch gap-2">
                <Button variant="outline" @click="mode = 'select'">{{ $t('general.cancel') }}</Button>
                <Button @click="saveCustomTuning" :disabled="saving">{{ $t('general.save') }}</Button>
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
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pencil, Plus, Trash2, Volume2, X } from 'lucide-vue-next';
import { type NoteName, type NoteWithOctave } from '@/types/tuner/notes';
import { useTunerStore } from '@/stores/tunerStore';
import { NOTES } from '@/constants/tuner';
import { midiToNote, noteToMidi, splitNote } from '@/utils/noteUtils';
import { computed, ref, watch } from 'vue';
import { toast } from 'vue-sonner';
import { useTimeoutFn } from '@vueuse/core';
import { useI18n } from 'vue-i18n';

interface EditableString {
    key: number;
    name: NoteName;
    octave: number;
}

const MAX_STRINGS = 12;
const OCTAVES = [0, 1, 2, 3, 4, 5, 6, 7, 8];
// Most string instruments are tuned in fourths
const NEW_STRING_INTERVAL = 5;

const { t } = useI18n();
const tunerStore = useTunerStore();
const open = ref(false);
const mode = ref<'select' | 'create' | 'edit'>('select');
const editingId = ref<string | null>(null);
const newName = ref('');
const newTempNotes = ref<EditableString[]>([]);
const showErrors = ref(false);
const saving = ref(false);
let nextKey = 0;

const standardTunings = computed(() => tunerStore.currentInstrument.tunings.filter((tuning) => !tuning.custom));
const customTunings = computed(() => tunerStore.currentInstrument.tunings.filter((tuning) => tuning.custom));

const title = computed(() => {
    if (mode.value === 'create') return t('tuner.customTuning.title');
    if (mode.value === 'edit') return t('tuner.customTuning.editTitle');
    return t('tuner.instrumentDialog.title');
});

const nameError = computed(() => {
    if (!showErrors.value) return null;
    const name = newName.value.trim();
    if (!name) return t('tuner.customTuning.nameRequired');
    const taken = tunerStore.currentInstrument.tunings.some(
        (tuning) => tuning.id !== editingId.value && tuning.name.toLowerCase() === name.toLowerCase()
    );
    return taken ? t('tuner.customTuning.nameTaken') : null;
});

const toNote = (string: EditableString): NoteWithOctave => `${string.name}${string.octave}` as NoteWithOctave;

const toEditable = (note: NoteWithOctave): EditableString => {
    const { name, octave } = splitNote(note);
    return { key: nextKey++, name: name === '—' ? 'E' : name, octave: Number(octave) || 2 };
};

const startEditor = (notes: NoteWithOctave[], name: string, id: string | null) => {
    newTempNotes.value = notes.map(toEditable);
    newName.value = name;
    editingId.value = id;
    showErrors.value = false;
    mode.value = id ? 'edit' : 'create';
};

// A new tuning starts as a copy of the current one, which is easier to tweak
const startCreateMode = () => startEditor(tunerStore.currentTuning.notes, '', null);

const startEditMode = () => {
    const tuning = tunerStore.currentTuning;
    startEditor(tuning.notes, tuning.name, tuning.id);
};

const addString = () => {
    if (newTempNotes.value.length >= MAX_STRINGS) return;
    const last = newTempNotes.value.at(-1);
    const lastMidi = last ? noteToMidi(toNote(last)) : null;
    const maxMidi = noteToMidi(`B${OCTAVES.at(-1)}` as NoteWithOctave) ?? 0;
    const note = lastMidi === null ? 'E2' : midiToNote(Math.min(lastMidi + NEW_STRING_INTERVAL, maxMidi));
    newTempNotes.value.push(toEditable(note));
};

const removeString = (index: number) => {
    if (newTempNotes.value.length > 1) {
        newTempNotes.value.splice(index, 1);
    }
};

const saveCustomTuning = async () => {
    showErrors.value = true;
    if (nameError.value || saving.value) return;

    const name = newName.value.trim();
    const notes = newTempNotes.value.map(toNote);
    saving.value = true;
    try {
        if (editingId.value) {
            await tunerStore.updateCustomTuning(editingId.value, name, notes);
        } else {
            await tunerStore.createCustomTuning(name, notes);
        }
        toast.success(t('tuner.customTuning.saved', { name }));
        open.value = false;
    } catch (error) {
        console.error('Failed to save tuning:', error);
        toast.error(t('errors.unknownError'));
    } finally {
        saving.value = false;
    }
};

// Deleting needs a second click (window.confirm is unreliable in Tauri webviews)
const confirmingDelete = ref(false);
const deleteLabel = computed(() =>
    confirmingDelete.value ? t('tuner.customTuning.confirmDeleteButton') : t('tuner.customTuning.delete')
);
const { start: startConfirmTimeout, stop: stopConfirmTimeout } = useTimeoutFn(
    () => (confirmingDelete.value = false), 4000, { immediate: false }
);

const deleteCurrentTuning = async () => {
    if (!confirmingDelete.value) {
        confirmingDelete.value = true;
        startConfirmTimeout();
        return;
    }
    confirmingDelete.value = false;
    stopConfirmTimeout();
    const { id } = tunerStore.currentTuning;
    try {
        await tunerStore.deleteCustomTuning(id);
    } catch (error) {
        console.error('Failed to delete tuning:', error);
        toast.error(t('errors.unknownError'));
    }
};

// Always reopen on the selection screen
watch(open, (isOpen) => {
    if (!isOpen) mode.value = 'select';
});

watch(() => tunerStore.currentTuning.id, () => (confirmingDelete.value = false));
</script>
