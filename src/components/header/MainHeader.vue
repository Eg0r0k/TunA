<template>
    <header class="border-t">
        <nav class="flex items-center h-[50px] ">
            <RouterLink draggable="false" to="/"
                class="flex flex-col items-center justify-center flex-1 h-full
                       text-muted-foreground hover:text-foreground
                       transition-colors duration-150 [&.router-link-active]:text-foreground [&.router-link-active]:font-medium">
                <HomeIcon width="16" class="mb-0.5" />
                <span class="text-xs">Home</span>
            </RouterLink>

            <RouterLink draggable="false" to="/settings"
                class="flex flex-col items-center justify-center flex-1 h-full
                   text-muted-foreground hover:text-foreground
                   transition-colors duration-150 [&.router-link-active]:text-foreground [&.router-link-active]:font-medium">
                <Settings width="16" class="mb-0.5" />
                <span class="text-xs">Settings</span>
            </RouterLink>
        </nav>
    </header>
</template>

<script lang="ts" setup>
import { HomeIcon, Settings } from 'lucide-vue-next';
import { RouterLink } from 'vue-router';
</script>