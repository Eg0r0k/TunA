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
        <span class="text-sm text-muted-foreground text-nowrap">{{ settingsStore.a4 }} {{
          $t('general.hertz') }}</span>
      </div>
    </div>

    <div class="space-y-4">
      <div class="space-y-2">
        <h2 class="text-lg font-semibold">{{ $t('settings.tuner.title') }}</h2>
        <p class="text-sm text-muted-foreground">{{ $t('settings.tuner.toleranceDescription') }}</p>
      </div>
      <div class="flex items-center gap-4 flex-wrap">
        <Slider v-model="settingsStore.state.toleranceCents" :min="1" :max="20" :step="1" class="w-[200px]"
          :aria-label="$t('settings.tuner.tolerance')" />
        <span class="text-sm text-muted-foreground text-nowrap">±{{ settingsStore.tolerance }} {{ $t('general.cents')
          }}</span>
      </div>
      <label class="flex items-center gap-3 text-sm cursor-pointer w-fit">
        <input type="checkbox" class="size-4 accent-primary" v-model="settingsStore.state.autoAdvance" />
        {{ $t('settings.tuner.autoAdvance') }}
      </label>
      <label class="flex items-center gap-3 text-sm cursor-pointer w-fit">
        <input type="checkbox" class="size-4 accent-primary" v-model="settingsStore.state.keepScreenOn" />
        {{ $t('settings.tuner.keepScreenOn') }}
      </label>
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
    <div class="space-y-4" v-if="updateStore.platform !== 'unsupported'">
      <div class="space-y-2">
        <h2 class="text-lg font-semibold">{{ $t('updates.title') }}</h2>
        <p class="text-sm text-muted-foreground">
          {{ $t('updates.current', { version: updateStore.currentVersion }) }}
          <template v-if="updateStore.lastChecked">
            · {{ $t('updates.lastChecked', { time: updateStore.lastChecked.toLocaleTimeString() }) }}
          </template>
        </p>
      </div>
      <div class="flex items-center gap-4 flex-wrap">
        <Button v-if="updateStore.canInstall" @click="updateStore.install()">
          <Download />
          {{ updateStore.platform === 'desktop' ? $t('updates.install') : $t('general.refresh') }}
          <template v-if="updateStore.available?.version">v{{ updateStore.available.version }}</template>
        </Button>
        <Button v-else variant="outline" :disabled="updateStore.isBusy" @click="updateStore.check()">
          <RefreshCw :class="{ 'animate-spin': updateStore.status === 'checking' }" />
          {{ $t('updates.check') }}
        </Button>
        <span role="status" aria-live="polite" class="text-sm text-muted-foreground">{{ updateStatusText }}</span>
      </div>
      <div v-if="updateStore.status === 'downloading' && updateStore.progress !== null"
        class="w-full max-w-sm h-1.5 rounded-full bg-muted overflow-hidden" role="progressbar" aria-valuemin="0"
        aria-valuemax="100" :aria-valuenow="Math.round(updateStore.progress * 100)">
        <div class="h-full bg-primary transition-[width]" :style="{ width: `${updateStore.progress * 100}%` }"></div>
      </div>
      <p v-if="updateStore.available?.notes" class="text-sm text-muted-foreground whitespace-pre-line max-w-prose">
        {{ updateStore.available.notes }}
      </p>
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
                <GitPullRequest class="w-4 h-4 mr-2" /> v{{ updateStore.currentVersion }} ({{ isTauri() ? $t('about.desktop') : $t('about.web') }})
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
import { Check, Info, Github, GitPullRequest, Globe, Download, RefreshCw } from 'lucide-vue-next';
import { useAppStore } from '@/stores/appStore';
import { computed, onBeforeMount } from 'vue';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { isTauri } from '@tauri-apps/api/core';
import { useLanguage } from '@/composables/useLanguage';
import { useI18n } from 'vue-i18n';
import { currentYear } from '@/utils/dateUtils';
import { THEMES } from '@/constants/themes';
import { useSettingsStore } from '@/stores/settingsStore';
import { useUpdateStore } from '@/stores/updateStore';

const appStore = useAppStore();
const settingsStore = useSettingsStore()
const updateStore = useUpdateStore();

const { t } = useI18n()
const { currentLocale, supportedLocale } = useLanguage()

const updateStatusText = computed(() => {
  const version = updateStore.available?.version ? `v${updateStore.available.version}` : '';
  switch (updateStore.status) {
    case 'checking': return t('updates.checking');
    case 'upToDate': return t('updates.upToDate');
    case 'available': return t('updates.available', { version });
    case 'downloading': return updateStore.progress === null
      ? t('updates.downloading')
      : t('updates.downloadingProgress', { percent: Math.round(updateStore.progress * 100) });
    case 'ready': return t('updates.ready', { version });
    case 'error': return t('updates.error');
    default: return '';
  }
});

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
});
</script>
