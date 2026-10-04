<template>
    <Dialog v-model:open="open">
        <DialogTrigger as-child>
            <Button variant="outline">
                {{ tunerStore.currentInstrument.name }} - {{ tunerStore.currentTuning.name }}
            </Button>
        </DialogTrigger>
        <DialogContent class="sm:max-w-[425px] grid-rows-[auto_minmax(0,1fr)_auto] p-0 max-h-[90vh]">
            <DialogHeader class="p-6 pb-0">
                <DialogTitle v-if="mode === 'select'">{{ $t('tuner.instrumentDialog.title') }}</DialogTitle>
                <DialogTitle v-else>{{ $t('tuner.customTuning.title') }}</DialogTitle>
                <DialogDescription v-if="mode === 'select'">{{ $t('tuner.instrumentDialog.description') }}
                </DialogDescription>
                <DialogDescription v-else>{{ $t('tuner.customTuning.description') }}</DialogDescription>
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
                            <SelectTrigger class="flex-1">
                                <SelectValue :placeholder="$t('tuner.selectTuning')" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem v-for="tuning in tunerStore.currentInstrument.tunings" :key="tuning.id"
                                    :value="tuning.id">
                                    {{ tuning.name }}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <Button v-if="tunerStore.currentTuning.custom" variant="outline" size="icon"
                            :title="$t('tuner.customTuning.delete')" :aria-label="$t('tuner.customTuning.delete')"
                            @click="deleteCurrentTuning">
                            <Trash2 />
                        </Button>
                    </div>
                </div>
            </div>

            <div v-else class="grid gap-4 py-4 overflow-y-auto hide-scrollbar px-6">
                <div class="grid gap-2">
                    <Label for="tuning-name">{{ $t('tuner.customTuning.name') }}</Label>
                    <Input id="tuning-name" v-model="newName" :placeholder="$t('tuner.customTuning.namePlaceholder')"
                        :aria-invalid="showErrors && !newName.trim()" />
                </div>
                <div v-for="(note, index) in newTempNotes" :key="index" class="grid gap-2">
                    <div class="flex justify-between items-center">
                        <Label>{{ $t('tuner.customTuning.string', { n: index + 1 }) }}</Label>
                        <Button v-if="newTempNotes.length > 1" variant="destructive" size="sm"
                            @click="removeString(index)">{{ $t('tuner.customTuning.remove') }}</Button>
                    </div>
                    <div class="flex gap-2">
                        <Select v-model="note.name">
                            <SelectTrigger>
                                <SelectValue :placeholder="$t('tuner.customTuning.note')" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem v-for="n in NOTES" :key="n" :value="n">{{ n }}</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select v-model="note.octave">
                            <SelectTrigger>
                                <SelectValue :placeholder="$t('tuner.customTuning.octave')" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem v-for="o in OCTAVES" :key="o" :value="o">{{ o }}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <Button v-if="newTempNotes.length < MAX_STRINGS" variant="secondary" @click="addString">
                    {{ $t('tuner.customTuning.addString') }}
                </Button>
            </div>

            <DialogFooter v-if="mode === 'select'" class="p-6 pt-0 flex sm:justify-start justify-stretch">
                <Button variant="secondary" @click="startCreateMode">{{ $t('tuner.customTuning.create') }}</Button>
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
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-vue-next';
import { type NoteName, type NoteWithOctave } from '@/types/tuner/notes';
import { useTunerStore } from '@/stores/tunerStore';
import { NOTES } from '@/constants/tuner';
import { ref } from 'vue';
import { toast } from 'vue-sonner';
import { useI18n } from 'vue-i18n';

const MAX_STRINGS = 12;
const OCTAVES = [0, 1, 2, 3, 4, 5, 6, 7, 8];

const { t } = useI18n();
const tunerStore = useTunerStore();
const open = ref(false);
const mode = ref<'select' | 'create'>('select');
const newName = ref('');
const newTempNotes = ref<{ name: NoteName; octave: number }[]>([]);
const showErrors = ref(false);
const saving = ref(false);

const startCreateMode = () => {
    newTempNotes.value = [{ name: 'E', octave: 2 }];
    newName.value = '';
    showErrors.value = false;
    mode.value = 'create';
};

const addString = () => {
    if (newTempNotes.value.length < MAX_STRINGS) {
        newTempNotes.value.push({ name: 'E', octave: 2 });
    }
};

const removeString = (index: number) => {
    if (newTempNotes.value.length > 1) {
        newTempNotes.value.splice(index, 1);
    }
};

const saveCustomTuning = async () => {
    const name = newName.value.trim();
    if (!name) {
        showErrors.value = true;
        toast.error(t('tuner.customTuning.nameRequired'));
        return;
    }
    const notes: NoteWithOctave[] = newTempNotes.value.map(
        (n) => `${n.name}${n.octave}` as NoteWithOctave
    );
    saving.value = true;
    try {
        await tunerStore.createCustomTuning(name, notes);
        mode.value = 'select';
        open.value = false;
    } catch (error) {
        console.error('Failed to save tuning:', error);
        toast.error(t('errors.unknownError'));
    } finally {
        saving.value = false;
    }
};

const deleteCurrentTuning = async () => {
    try {
        await tunerStore.deleteCustomTuning(tunerStore.currentTuning.id);
    } catch (error) {
        console.error('Failed to delete tuning:', error);
        toast.error(t('errors.unknownError'));
    }
};
</script>
