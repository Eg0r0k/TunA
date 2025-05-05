<template>
  <div class="p-6 max-w-5xl mx-auto space-y-8">
    <div class="space-y-4">
      <div class="space-y-2">
        <h2 class="text-lg font-semibold">Настройки аудио</h2>
        <p class="text-sm text-muted-foreground">Выберите микрофон для работы тюнера</p>
      </div>

      <div class="grid gap-4">
        <div class="flex items-center gap-4 truncate">
          <Select v-model="selectedDeviceId" @update:model-value="(value) => handleDeviceChange(value as string)">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Выберите микрофон" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Доступные устройства</SelectLabel>
                <SelectItem v-for="device in appStore.audioDevices" :key="device.deviceId" :value="device.deviceId">
                  {{ device.label || `Микрофон (${device.deviceId.slice(0, 4)})` }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>

    <div class="space-y-4">
      <div class="space-y-2">
        <h2 class="text-lg font-semibold">Калибровка A4</h2>
        <p class="text-sm text-muted-foreground">Установите опорную частоту для ноты A4 (Гц)</p>
      </div>
      <div class="flex items-center gap-4">
        <Slider v-model="appStore.state.a4Frequency" :min="400" :max="480" :step="1" class="w-[200px]" />
        <span class="text-sm text-muted-foreground">{{ appStore.state.a4Frequency }} Гц</span>
      </div>
    </div>

    <div class="space-y-4">
      <div class="space-y-2">
        <h2 class="text-lg font-semibold">Настройки темы</h2>
        <p class="text-sm text-muted-foreground">Выберите предпочтительную цветовую схему</p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline" class="justify-between">
            <div class="flex items-center gap-2">
              <component :is="themeIcons[appStore.mode]" class="size-4" />
              <span>{{ themeLabels[appStore.mode] }}</span>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" class="w-[var(--radix-dropdown-menu-trigger-width)]">
          <DropdownMenuItem v-for="(icon, key) in themeIcons" :key="key" @click="appStore.mode = key" class="gap-2">
            <component :is="icon" class="size-4" />
            <span>{{ themeLabels[key] }}</span>
            <Check class="ml-auto size-4" :class="{ 'opacity-0': appStore.mode !== key }" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <div class="space-y-4">
      <div class="space-y-2">
        <h2 class="text-lg font-semibold">Информация о приложении</h2>
        <p class="text-sm text-muted-foreground">Текущая версия приложения</p>
      </div>
      <div class="text-sm text-muted-foreground">
        Версия: {{ appVersion }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Moon, Sun, Laptop, Check } from 'lucide-vue-next';
import { useAppStore } from '@/stores/appStore';
import { computed, onBeforeMount, ref } from 'vue';
import { getVersion } from '@tauri-apps/api/app';

const appStore = useAppStore();
const appVersion = ref('Загрузка...');

const themeIcons = {
  light: Sun,
  dark: Moon,
  auto: Laptop,
};

const themeLabels = {
  light: 'Светлая',
  dark: 'Тёмная',
  auto: 'Системная',
};

const selectedDeviceId = computed({
  get: () => appStore.state.selectedDeviceId || '',
  set: (value) => appStore.setDevice(value),
});

const handleDeviceChange = async (deviceId: string) => {
  appStore.setDevice(deviceId);
};

onBeforeMount(async () => {
  if (appStore.audioDevices.length > 0 && !appStore.state.selectedDeviceId) {
    appStore.setDevice(appStore.audioDevices[0].deviceId);
  }
  try {
    appVersion.value = await getVersion();
  } catch (error) {
    console.error('Ошибка при получении версии приложения:', error);
    appVersion.value = 'Неизвестно';
  }
});
</script>