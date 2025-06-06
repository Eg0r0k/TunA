<template>
  <section class="p-6 max-w-5xl mx-auto space-y-8">
    <div class="space-y-4">
      <div class="space-y-2">
        <h2 class="text-lg font-semibold">{{ $t('settings.audioSettings.title') }}</h2>
        <p class="text-sm text-muted-foreground">{{ $t('settings.audioSettings.description') }}</p>
      </div>

      <div class="grid gap-4">
        <div class="flex items-center gap-4 truncate">
          <Select v-model="appStore.selectedDeviceId"
            @update:model-value="(value) => appStore.setDevice(value as string)"
            v-if="appStore.audioDevices.length > 0">
            <SelectTrigger class="w-full">
              <SelectValue :placeholder="$t('settings.audioSettings.selectMicrophone')" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>{{ $t('settings.audioSettings.availableDevices') }}</SelectLabel>
                <SelectItem v-for="device in appStore.audioDevices" :key="device.deviceId" :value="device.deviceId">
                  {{ device.label || $t('settings.audioSettings.microphoneLabel', { id: device.deviceId?.slice(0, 4) })
                  }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <div v-else class="text-sm text-muted-foreground">
            ! {{ $t('settings.audioSettings.noDevices') }} !
          </div>
        </div>
      </div>
    </div>

    <div class="space-y-4">
      <div class="space-y-2">
        <h2 class="text-lg font-semibold">{{ $t('settings.a4Calibration.title') }}</h2>
        <p class="text-sm text-muted-foreground">{{ $t('settings.a4Calibration.description') }}</p>
      </div>
      <div class="flex items-center gap-4 flex-wrap">
        <Slider v-model="settingsStore.state.a4Frequency" :min="400" :max="480" :step="1" class="w-[200px]" />
        <span class="text-sm text-muted-foreground text-nowrap">{{ settingsStore.state.a4Frequency }} {{
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
          <Button variant="outline" class="justify-between  w-32">
            <div class="flex items-center gap-2">
              <Globe class="size-4" />
              <span>{{ $t(`locales.${currentLocale}`) }}</span>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem v-for="lang in supportedLocale" :key="lang" @click="currentLocale = lang" class="gap-2">
            <span>{{ $t(`locales.${lang}`) }}</span>
            <Check v-show="currentLocale === lang" class="ml-auto size-4" />
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
          <Button variant="outline" class="justify-between w-32 ">
            <div class="flex items-center gap-2">
              <component :is="THEMES.find(t => t.id === settingsStore.mode)?.icon" class="size-4" />
              <span>{{ $t(`settings.theme.${settingsStore.mode}`) }}</span>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem v-for="theme in THEMES" :key="theme.id" @click="settingsStore.changeTheme(theme.id)"
            class="gap-2">
            <component :is="theme.icon" class="size-4" />
            <span>{{ $t(`settings.theme.${theme.id}`) }}</span>
            <Check v-show="settingsStore.mode === theme.id" class="ml-auto size-4" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    <Button @click="settingsStore.resetSettings" variant="destructive">
      [= {{ $t('general.reset') }} =]
    </Button>
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
  </section>
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
import { Check, Info, Github, GitPullRequest, Globe } from 'lucide-vue-next';
import { useAppStore } from '@/stores/appStore';
import { onBeforeMount } from 'vue';
import { getVersion } from '@tauri-apps/api/app';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { isTauri } from '@tauri-apps/api/core';
import { useLanguage } from '@/composables/useLanguage';
import { useI18n } from 'vue-i18n';
import { currentYear } from '@/utils/dateUrils';
import { THEMES } from '@/constants/themes';
import { useSettingsStore } from '@/stores/settingsStore';
const appStore = useAppStore();
const settingsStore = useSettingsStore()

const { t } = useI18n()
let appVersion = '';
const { currentLocale, supportedLocale } = useLanguage()

onBeforeMount(async () => {
  try {
    await appStore.ensurePermissions();
    if (appStore.audioDevices.length > 0) {
      const defaultDevice = appStore.audioDevices.find(d =>
        d.deviceId === appStore.state.selectedDeviceId
      ) || appStore.audioDevices[0];

      if (defaultDevice) {
        await appStore.setDevice(defaultDevice.deviceId);
      }
    }
  } catch (error) {
    console.error('Device initialization error:', error);
  }
  try {
    if (isTauri()) {
      appVersion = await getVersion();
    }
    appVersion = __APP_VERSION__;
  } catch (error) {
    console.error('Ошибка при получении версии приложения:', error);
    appVersion = isTauri() ? t('general.unknown') : __APP_VERSION__;
  }
});
</script>