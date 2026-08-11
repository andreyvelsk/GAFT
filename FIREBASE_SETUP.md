# 🔥 Firebase Setup для лайков (пошаговая инструкция)

Этот гайд поможет вам настроить Firebase Firestore для хранения лайков на статьях блога. Выполняйте шаги последовательно.

---

## Шаг 1: Создание аккаунта и проекта Firebase

1. Перейдите на [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Войдите через Google-аккаунт
3. Нажмите **«Добавить проект»** (Add project)
4. Введите имя проекта, например: `my-blog-likes`
5. **Google Analytics** — можно оставить включённым или отключить (необязательно)
6. Нажмите **«Создать проект»** (Create project)
7. Дождитесь завершения создания и нажмите **«Продолжить»**

---

## Шаг 2: Добавление веб-приложения

1. На главной странице проекта нажмите иконку **`</>`** (Web)
2. Введите имя приложения, например: `my-blog-web`
3. (Опционально) Поставьте галочку «Also set up Firebase Hosting» — вам это не нужно для Static Site, но можно
4. Нажмите **«Зарегистрировать приложение»** (Register app)
5. **Важно!** Скопируйте объект конфигурации — он понадобится на шаге 5:

```javascript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

6. Нажмите **«Завершить»** (Done)

---

## Шаг 3: Настройка Firestore Database

1. В левой панели консоли Firebase выберите **Firestore Database**
2. Нажмите **«Создать базу данных»** (Create database)
3. Выберите **режим**: выберите **«Режим тестирования»** (Start in test mode)
   - Мы позже настроим правила безопасности
4. Выберите ближайший регион (например, `eur3` для Европы или `nam5` для США)
5. Нажмите **«Создать»** (Enable)

---

## Шаг 4: Настройка Security Rules (правила безопасности)

Это критически важный шаг — правила определяют, кто может читать/писать данные.

1. В Firestore выберите вкладку **«Правила»** (Rules)
2. Замените содержимое на:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Коллекция likes — документ ID = slug статьи
    match /likes/{articleSlug} {
      // Чтение — разрешено всем (анонимно)
      allow read: if true;

      // Запись — разрешено всем, но ТОЛЬКО:
      // 1. Документ может быть создан (setDoc) с count = 0
      // 2. Поле count может быть увеличено только на 1 (increment)
      // 3. Запрещено: удаление, обновление других полей, установка произвольного count
      allow create: if request.resource.data.count == 0
                    && request.resource.data.keys().hasAll(['count', 'updatedAt']);

      allow update: if request.resource.data.count == resource.data.count + 1
                    && request.resource.data.keys().hasAll(['count', 'updatedAt']);

      // Запрет на удаление документов
      allow delete: if false;
    }
  }
}
```

3. Нажмите **«Опубликовать»** (Publish)

> ⚠️ **Важно:** Эти правила разрешают увеличивать `count` только на +1 и запрещают
> устанавливать произвольные значения. Это защищает от накрутки.

---

## Шаг 5: Получение ключей API и подключение к проекту

### 5.1. Получение ключей

1. В консоли Firebase перейдите в **Настройки проекта** (⚙️ Project Settings)
2. Выберите вкладку **«Общие»** (General)
3. В разделе **«Ваши приложения»** найдите веб-приложение, созданное на шаге 2
4. Нажмите **«Запуск»** (Web config) — скопируйте значения

### 5.2. Создание файла `.env`

В корне проекта (рядом с `nuxt.config.ts`) создайте файл `.env`:

```bash
# Firebase Configuration
NUXT_PUBLIC_FIREBASE_API_KEY=ваш_apiKey
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ваш_projectId.firebaseapp.com
NUXT_PUBLIC_FIREBASE_PROJECT_ID=ваш_projectId
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ваш_projectId.firebasestorage.app
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=ваш_messagingSenderId
NUXT_PUBLIC_FIREBASE_APP_ID=ваш_appId
NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

> Значения подставьте из скопированного конфига (шаг 2.5 или 5.1).

### 5.3. Для GitHub Pages (GitHub Actions)

Если вы деплоитесь через GitHub Actions, добавьте эти значения как **Repository Secrets**:

1. В репозитории GitHub: **Settings** → **Secrets and variables** → **Actions**
2. Нажмите **«New repository secret»** для каждой переменной:
   - `NUXT_PUBLIC_FIREBASE_API_KEY`
   - `NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NUXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NUXT_PUBLIC_FIREBASE_APP_ID`
   - `NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

В файле `.github/workflows/deploy.yml` перед сборкой добавьте:

```yaml
- name: Generate .env
  run: |
    echo "NUXT_PUBLIC_FIREBASE_API_KEY=${{ secrets.NUXT_PUBLIC_FIREBASE_API_KEY }}" >> .env
    echo "NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${{ secrets.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN }}" >> .env
    echo "NUXT_PUBLIC_FIREBASE_PROJECT_ID=${{ secrets.NUXT_PUBLIC_FIREBASE_PROJECT_ID }}" >> .env
    echo "NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${{ secrets.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET }}" >> .env
    echo "NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${{ secrets.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID }}" >> .env
    echo "NUXT_PUBLIC_FIREBASE_APP_ID=${{ secrets.NUXT_PUBLIC_FIREBASE_APP_ID }}" >> .env
    echo "NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID=${{ secrets.NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID }}" >> .env
```

---

## Шаг 6: Проверка работоспособности

1. Запустите проект локально:

```bash
cd nuxt-blog
cp .env.example .env
# Заполните .env вашими ключами из Firebase
npm run dev
```

2. Откройте браузер → `http://localhost:3000`
3. На главной странице вы должны увидеть кнопки лайков (❤️) на каждой карточке статьи
4. Нажмите на кнопку лайка:
   - Счётчик должен увеличиться на 1
   - Кнопка должна стать розовой (активное состояние)
   - Повторное нажатие не должно быть возможным
5. Откройте Firebase Console → Firestore — вы должны увидеть коллекцию `likes` с документами

---

## Шаг 7: Структура данных в Firestore

```
likes/
  ├── civilization-6/
  │     ├── count: 5
  │     └── updatedAt: <timestamp>
  ├── dualscreendex/
  │     ├── count: 12
  │     └── updatedAt: <timestamp>
  ├── skyrim/
  │     ├── count: 3
  │     └── updatedAt: <timestamp>
  └── ...
```

- **Коллекция:** `likes`
- **Document ID:** slug статьи (совпадает с именем папки в `content/`)
- **Поля:**
  - `count` (number) — количество лайков
  - `updatedAt` (timestamp) — время последнего обновления

---

## Шаг 8: Настройка Google Analytics (GA4)

Firebase Analytics использует **Google Analytics 4 (GA4)** под капотом. Это позволяет отслеживать посещаемость, поведение пользователей и многое другое — всё через встроенные дашборды Firebase.

### 8.1. Включение Analytics в Firebase Console

1. В консоли Firebase перейдите в **Integrations** → **Google Analytics**
2. Нажмите **«Link a Google Analytics property»**
3. Выберите существующий аккаунт GA4 или создайте новый:
   - Нажмите **«Create a new property»**
   - Введите имя (например: `Dual Screen Games Blog`)
   - Выберите часовой пояс и валюту
4. Нажмите **«Link»** и дождитесь завершения
5. Нажмите **«Continue»**

### 8.2. Получение Measurement ID

Measurement ID — это ключ GA4 в формате `G-XXXXXXXXXX`.

1. Перейдите в **Google Analytics** → [analytics.google.com](https://analytics.google.com/)
2. Выберите созданное свойство (property)
3. Перейдите в **Администратор** (⚙️) → **Потоки данных** (Data streams)
4. Выберите веб-поток данных
5. Скопируйте **Measurement ID** (отображается в верхней части)

### 8.3. Добавление Measurement ID в проект

Добавьте в файл `.env`:

```bash
NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 8.4. GitHub Actions (если деплоитесь через CI)

Добавьте секрет `NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID` в Repository Secrets.

### 8.5. Как это работает

Плагин [`plugins/firebase-analytics.client.ts`](plugins/firebase-analytics.client.ts) автоматически:

1. **Инициализирует** Firebase Analytics при загрузке страницы (только на клиенте)
2. **Логирует** событие `page_view` при каждом переходе между страницами
3. **Предоставляет** хелпер `$trackEvent()` для кастомных событий

#### Автоматический трекинг

При каждом переходе на страницу автоматически отправляется событие:

```
page_view
  ├── page_path: "/project/skyrim"
  └── page_title: "Skyrim | Dual Screen Games..."
```

#### Кастомные события

Используйте `$trackEvent()` для отслеживания пользовательских действий:

```vue
<script setup lang="ts">
const { $trackEvent } = useNuxtApp()

// Трекинг клика по лайку
const handleLike = () => {
  $trackEvent('like_clicked', { article: 'skyrim' })
}

// Трекинг поиска
const handleSearch = (query: string) => {
  $trackEvent('search', { query })
}
</script>
```

### 8.6. Просмотр аналитики

#### В Firebase Console:

1. Перейдите в **Analytics** → **Dashboard** в консоли Firebase
2. Вы увидите:
   - Количество активных пользователей
   - Количество сессий
   - Популярные страницы
   - Географию аудитории
   - Устройства и браузеры

#### В Google Analytics:

1. Перейдите в [analytics.google.com](https://analytics.google.com/)
2. Выберите свойство вашего блога
3. Полные отчёты GA4 доступны:
   - **Realtime** — кто на сайте прямо сейчас
   - **Lifecycle** — воронки, удержание, монетизация
   - **User** — демография, интересы, технологии

### 8.7. Полезные события для блога

| Событие | Параметры | Когда отправлять |
|---------|-----------|------------------|
| `page_view` | `page_path`, `page_title` | Автоматически (плагин) |
| `like_clicked` | `article` (slug) | При нажатии лайка |
| `search` | `query`, `results_count` | При поиске |
| `sort_changed` | `sort_by` (popular/newest) | При сортировке |
| `article_open` | `article` (slug) | При открытии статьи |

### 8.8. Конфиденциальность и GDPR

> ⚠️ **Важно:** Firebase Analytics отправляет данные в Google. Если ваш сайт ориентирован на пользователей из ЕС, вам может потребоваться:
> - Добавить баннер согласия (cookie consent)
> - Настроить IP-анонимизацию
> - Обновить политику конфиденциальности

Для простого блога это обычно не требуется, но стоит иметь в виду.

---

## Часто задаваемые вопросы

### Могут ли пользователи накрутить лайки?
Нет. Каждый браузер хранит в `localStorage` информацию о том, какие статьи уже лайкнуты. Пользователь не может поставить больше одного лайка на одну статью с одного браузера. Additionally, правила Firestore не позволяют устанавливать произвольные значения `count`.

### Нужна ли авторизация для лайков?
Нет. Лайки работают анонимно — авторизация не требуется. Это сделано намеренно для простоты UX.

### Что если пользователь очистит localStorage?
Тогда он сможет поставить лайк повторно. Этоacceptable trade-off для анонимной системы без авторизации.

### Как работает сортировка по популярности?
На странице главной нажмите «❤️ Popular» в панели сортировки. Статьи будут отсортированы по количеству лайков (от наибольшего к наименьшему).

### Сколько это стоит?
Бесплатно. Тариф Firebase Spark (free) включает:
- 1 GiB хранения данных
- 50 КБ/с чтения
- 20 КБ/с записи
- 10 000 операций чтения/дня

Для блога с лайками этого более чем достаточно.

---

## Архитектура решения

```
┌─────────────────────┐     onSnapshot      ┌──────────────────┐
│   Browser (Vue 3)   │ ◄──────────────────► │  Firebase Firestore │
│                     │     increment(+1)    │                  │
│  LikeButton.vue     │ ──────────────────► │  collection:     │
│  useLikes.ts        │                      │    likes/        │
│  localStorage       │                      │      {slug}/     │
│  (liked_articles)   │                      │        count: N  │
└─────────────────────┘                      └──────────────────┘
```

- **Локальное хранение:** `localStorage` key `liked_articles` — массив slug'ов
- **Глобальное хранение:** Firestore коллекция `likes` — документ ID = slug
- **Синхронизация:** `onSnapshot` — подписка на обновления в реальном времени
- **Атомарность:** `increment(1)` — операция +1 атомарна на уровне Firestore
