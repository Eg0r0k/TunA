<template>
    <section class="flex h-full flex-col items-center justify-center space-y-6">
        <div class="space-y-3 text-center">
            <pre class="text-primary animate-pulse text-xl font-medium md:text-2xl">
╔═══════╗
║ 4 0 4 ║
╚═══════╝
             </pre>

            <h1 class="font-mono text-4xl font-bold tracking-tighter text-foreground/80">(◡﹏◡)</h1>
            <p class="font-mono text-sm text-muted-foreground">
                {{ $t("notFound.error") }}
            </p>
        </div>

        <Button variant="secondary" asChild>
            <RouterLink to="/">
                {{ $t("notFound.button") }}
            </RouterLink>
        </Button>
    </section>
</template>

<script lang="ts" setup>
import { Button } from '@/components/ui/button';
</script>