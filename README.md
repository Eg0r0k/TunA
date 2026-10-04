# 🎵 Tuner - Tauri + Vue + TypeScript

**TunA** - Progressive Web App для точной настройки музыкальных инструментов с современным интерфейсом и кроссплатформенной поддержкой.

🌐 **Онлайн-версия**: [https://eg0r0k.github.io/TunA/#/](https://eg0r0k.github.io/TunA/#/)

---

## 📸 Интерфейс приложения

<div align="center">
  <img src="https://raw.githubusercontent.com/Eg0r0k/TunA/refs/heads/main/public/screenshots/main.webp" width="45%" alt="Главный экран TunA"/>
  <img src="https://raw.githubusercontent.com/Eg0r0k/TunA/refs/heads/main/public/screenshots/settings.webp" width="45%" alt="Настройки TunA"/>
  <br>
  <em>Главный экран и панель настроек приложения</em>
</div>

---

## 🌟 Основные возможности
- 🎹 Точная настройка инструментов с визуальной индикацией
- 📲 PWA-поддержка (установка на устройство)
- 🌗 Tемы (светлая/тёмная/системная)
- 🎤 Выбор аудиоустройства ввода
- 📊 Визуализация аудиосигнала и индикатор уровня входа
- 🎸 Режим инструмента с автоопределением струны и автопереходом к следующей
- 🎼 Хроматический режим
- 🔊 Опорный тон для настройки на слух
- 🎯 Отклонение в центах и настраиваемый допуск
- 💡 Экран не гаснет во время настройки (Wake Lock)
- 🔄 Автообновления: PWA через service worker, десктоп через tauri-plugin-updater
- ⚡ Легковесное

---

## 🛡️ Лицензия

Этот проект распространяется под лицензией **MIT**. Подробнее см. [LICENSE](LICENSE).

---

## 🚀 Локальный запуск
# Клонировать репозиторий
```bash 
git clone https://github.com/eg0r0k/TunA.git
cd TunA
```

# Установить зависимости
```bash 
npm install
```

# Запустить в режиме разработки
```bash 
npm run dev
```

# Тесты и проверка типов
```bash
npm test
npm run typecheck
```

---

## 🔄 Обновления и релизы

**PWA.** Service worker регистрируется в режиме `prompt`: новая версия скачивается в фоне, а пользователь видит уведомление с кнопкой «Обновить». Проверка запускается при старте, раз в час, при возврате на вкладку и при восстановлении сети. Вручную проверить можно в «Настройках → Обновления». Версию новой сборки приложение берёт из `version.json`, который создаётся при сборке.

**Десктоп (Tauri).** `tauri-plugin-updater` проверяет `latest.json` из последнего GitHub Release, скачивает подписанный бандл с прогрессом и перезапускает приложение. Версия берётся из `package.json` (`"version": "../package.json"` в `tauri.conf.json`).

### Первоначальная настройка (один раз)
1. Сгенерировать ключи подписи:
   ```bash
   npx tauri signer generate -w ~/.tauri/tuna.key
   ```
2. Вставить **публичный** ключ в `src-tauri/tauri.conf.json` → `plugins.updater.pubkey`.
3. Добавить секреты репозитория `TAURI_SIGNING_PRIVATE_KEY` (содержимое `~/.tauri/tuna.key`) и `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`.

### Выпуск версии
```bash
npm version patch   # или minor / major
git push --follow-tags
```
Workflow `.github/workflows/release.yml` соберёт приложения для Windows, macOS и Linux, загрузит их вместе с `latest.json` в GitHub Release, опубликует релиз и задеплоит PWA на GitHub Pages.

