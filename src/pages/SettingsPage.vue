<template>
  <div class="p-6 max-w-5xl mx-auto space-y-8">
    <div class="space-y-4">
      <div class="space-y-2">
        <h2 class="text-lg font-semibold">{{ $t('settings.audioSettings.title') }}</h2>
        <p class="text-sm text-muted-foreground">{{ $t('settings.audioSettings.description') }}</p>
      </div>

      <div class="grid gap-4">
        <div class="flex items-center gap-4 truncate">
          <Select v-model="selectedDeviceId" @update:model-value="(value) => handleDeviceChange(value as string)">
            <SelectTrigger class="w-full">
              <SelectValue :placeholder="$t('settings.audioSettings.selectMicrophone')" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>{{ $t('settings.audioSettings.availableDevices') }}</SelectLabel>

                <SelectItem v-for="device in appStore.audioDevices" :key="device.deviceId" :value="device.deviceId">
                  {{ device.label || $t('settings.audioSettings.microphoneLabel', { id: device.deviceId.slice(0, 4) })
                  }}

                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>

    <div class="space-y-4">
      <div class="space-y-2">
        <h2 class="text-lg font-semibold">{{ $t('settings.a4Calibration.title') }}</h2>
        <p class="text-sm text-muted-foreground">{{ $t('settings.a4Calibration.description') }}</p>
      </div>
      <div class="flex items-center gap-4 flex-wrap">
        <Slider v-model="appStore.state.a4Frequency" :min="400" :max="480" :step="1" class="w-[200px]" />
        <span class="text-sm text-muted-foreground text-nowrap">{{ appStore.state.a4Frequency }} {{
          $t('general.hertz') }}</span>
      </div>
    </div>

    <div class="space-y-4">
      <div class="space-y-2">
        <h2 class="text-lg font-semibold">{{ $t('settings.language.title') }}</h2>
        <p class="text-sm text-muted-foreground">{{ $t('settings.language.description') }}</p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline" class="justify-between w-full">
            <div class="flex items-center gap-2">
              <Globe class="size-4" />
              <span>{{ $t(`locales.${currentLocale}`) }}</span>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" class="w-[200px]">
          <DropdownMenuItem v-for="lang in supportedLocale" :key="lang" @click="currentLocale = lang" class="gap-2">
            <span>{{ $t(`locales.${lang}`) }}</span>
            <Check v-if="currentLocale === lang" class="ml-auto size-4" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <div class="space-y-4">
      <div class="space-y-2">
        <h2 class="text-lg font-semibold">{{ $t('settings.themeSettings.title') }}</h2>
        <p class="text-sm text-muted-foreground">{{ $t('settings.themeSettings.description') }}</p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline" class="justify-between ">
            <div class="flex items-center gap-2">
              <component :is="themes.find(t => t.id === appStore.mode)?.icon" class="size-4" />
              <span>{{ $t(`settings.theme.${appStore.mode}`) }}</span>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" class="w-[200px]">
          <DropdownMenuItem v-for="theme in themes" :key="theme.id"
            @click="appStore.mode = theme.id as BasicColorSchema" class="gap-2">
            <component :is="theme.icon" class="size-4" />
            <span>{{ $t(`settings.theme.${theme.id}`) }}</span>
            <Check v-if="appStore.mode === theme.id" class="ml-auto size-4" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <div class="flex justify-center gap-4">
      <Dialog>
        <DialogTrigger as-child>
          <Button variant="ghost">
            <Info class="w-4 h-4 mr-2" /> {{ $t('about.title') }}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{{ $t('about.title') }}</DialogTitle>
          </DialogHeader>

          <div class="grid gap-3 py-4">
            <div class="space-y-2 ">
              <Label>{{ $t('about.version') }}</Label>
              <div class="text-sm text-muted-foreground inline-flex">
                <GitPullRequest class="w-4 h-4 mr-2" /> v{{ appVersion }} ({{ isTauri() ? 'Desktop' : 'Web' }})
              </div>
            </div>

            <Separator />

            <div class="space-y-2">
              <Label>{{ $t('about.links') }}</Label>
              <div class="flex flex-col gap-2">
                <a draggable="false" href="https://github.com/Eg0r0k/TunA" target="_blank"
                  class="inline-flex w-fit items-center text-primary hover:underline">
                  <Github class="w-4 h-4 mr-2" /> {{ $t('about.github') }}
                </a>
              </div>
            </div>

            <Separator />

            <div class="text-sm text-muted-foreground">
              {{ $t('about.copyright', { year: currentYear }) }}
            </div>
          </div>
        </DialogContent>
      </Dialog>
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
import { Moon, Sun, Laptop, Check, Info, Github, GitPullRequest, Globe } from 'lucide-vue-next';
import { useAppStore } from '@/stores/appStore';
import { computed, onBeforeMount, ref } from 'vue';
import { getVersion } from '@tauri-apps/api/app';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { isTauri } from '@tauri-apps/api/core';
import { BasicColorSchema } from '@vueuse/core';
import { useLanguage } from '@/composables/useLanguage';

const appStore = useAppStore();
const appVersion = ref('Загрузка...');

const { currentLocale, supportedLocale } = useLanguage()

const currentYear = ref(new Date().getFullYear())

const themes = [
  { id: 'light', icon: Sun },
  { id: 'dark', icon: Moon },
  { id: 'system', icon: Laptop }
]
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
    if (isTauri()) {
      appVersion.value = await getVersion();
    }
    appVersion.value = __APP_VERSION__;
  } catch (error) {
    console.error('Ошибка при получении версии приложения:', error);
    appVersion.value = isTauri() ? 'Неизвестно' : __APP_VERSION__;
  }
});
</script>