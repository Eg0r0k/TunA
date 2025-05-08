<template>
    <header class="border-t">
        <nav class="flex items-center h-[50px] ">
            <RouterLink draggable="false" :to="link.path" v-for="link in LINKS" :key="link.name"
                class="flex flex-col items-center justify-center flex-1 h-full
                       text-muted-foreground hover:text-foreground
                       transition-colors duration-150 [&.router-link-active]:text-foreground [&.router-link-active]:font-medium">
                <component :is="link.icon" width="16" class="mb-0.5" />
                <span class="text-xs">{{ $t(`navigation.${link.name}`) }}</span>
            </RouterLink>
        </nav>
    </header>
</template>

<script lang="ts" setup>
import { HomeIcon, type LucideIcon, Settings } from 'lucide-vue-next';
import { RouterLink } from 'vue-router';
interface Link {
    name: string;
    icon: LucideIcon;
    path: string;
}
//TODO: Add handler for middle click 
//# Have problembs with tauri, need to lern how prevent or handle new Webview windows from tauri 
//? Mb add prevents on link clicks

const LINKS: Link[] = [
    { name: 'home', icon: HomeIcon, path: '/' },
    { name: 'settings', icon: Settings, path: '/settings' },
]



</script>