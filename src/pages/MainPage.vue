<template>
    <section class="flex flex-col items-center h-full gap-4">
        <InstrumentDialog />
        <NoteVisualizer />
    </section>
</template>

<script lang="ts" setup>
import InstrumentDialog from '@/components/tuner/InstrumentDialog.vue';
import NoteVisualizer from '@/components/tuner/NoteVisualizer.vue';

</script>
