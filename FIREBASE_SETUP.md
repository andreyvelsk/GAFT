# 🔥 Firebase Setup for Likes & Views (step-by-step guide)

This guide walks you through setting up Firebase Firestore to store likes and unique page views for the blog. Follow the steps in order.

---

## Step 1: Create a Firebase account and project

1. Go to [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Sign in with your Google account
3. Click **"Add project"**
4. Enter a project name, e.g. `my-blog-likes`
5. **Google Analytics** — you can keep it enabled or disable it (optional)
6. Click **"Create project"**
7. Wait for creation to finish and click **"Continue"**

---

## Step 2: Add a web app

1. On the project home page, click the **`</>`** (Web) icon
2. Enter an app name, e.g. `my-blog-web`
3. (Optional) Tick "Also set up Firebase Hosting" — you don't need it for a static site, but it's fine
4. Click **"Register app"**
5. **Important!** Copy the config object — you'll need it in Step 5:

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

6. Click **"Done"**

---

## Step 3: Set up Firestore Database

1. In the Firebase console left panel, select **Firestore Database**
2. Click **"Create database"**
3. Choose a **mode**: select **"Start in test mode"**
   - We'll configure security rules later
4. Choose the nearest region (e.g. `eur3` for Europe or `nam5` for the US)
5. Click **"Enable"**

---

## Step 4: Configure Security Rules

This is a critical step — the rules define who can read/write data.

1. In Firestore, open the **"Rules"** tab
2. Replace the contents with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // likes collection — document ID = article slug
    match /likes/{articleSlug} {
      // Read — allowed for everyone (anonymous)
      allow read: if true;

      // Write — allowed for everyone, but ONLY:
      // 1. The document may be created (setDoc) with count = 0
      // 2. The count field may only be incremented by 1 (increment)
      // 3. Forbidden: deletion, updating other fields, setting an arbitrary count
      allow create: if request.resource.data.count == 0
                    && request.resource.data.keys().hasAll(['count', 'updatedAt']);

      allow update: if request.resource.data.count == resource.data.count + 1
                    && request.resource.data.keys().hasAll(['count', 'updatedAt']);

      // Deletion is forbidden
      allow delete: if false;
    }

    // views collection — document ID = article slug (unique page views)
    match /views/{articleSlug} {
      // Read — allowed for everyone (anonymous)
      allow read: if true;

      // Write — allowed for everyone, but ONLY:
      // 1. The document may be created (setDoc merge) with count = 1
      // 2. The count field may only be incremented by 1 (increment)
      // 3. Forbidden: deletion, updating other fields, setting an arbitrary count
      allow create: if request.resource.data.count == 1
                    && request.resource.data.keys().hasAll(['count', 'updatedAt']);

      allow update: if request.resource.data.count == resource.data.count + 1
                    && request.resource.data.keys().hasAll(['count', 'updatedAt']);

      // Deletion is forbidden
      allow delete: if false;
    }
  }
}
```

3. Click **"Publish"**

> ⚠️ **Important:** These rules only allow incrementing `count` by +1 and forbid
> setting arbitrary values. This protects against inflation.

---

## Step 5: Get the API keys and connect them to the project

### 5.1. Get the keys

1. In the Firebase console, go to **Project Settings** (⚙️)
2. Open the **"General"** tab
3. Under **"Your apps"**, find the web app you created in Step 2
4. Click **"Web config"** — copy the values

### 5.2. Create the `.env` file

In the project root (next to `nuxt.config.ts`), create a `.env` file:

```bash
# Firebase Configuration
NUXT_PUBLIC_FIREBASE_API_KEY=your_apiKey
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_projectId.firebaseapp.com
NUXT_PUBLIC_FIREBASE_PROJECT_ID=your_projectId
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_projectId.firebasestorage.app
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messagingSenderId
NUXT_PUBLIC_FIREBASE_APP_ID=your_appId
NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

> Fill in the values from the config you copied (Step 2.5 or 5.1).

### 5.3. For GitHub Pages (GitHub Actions)

If you deploy via GitHub Actions, add these values as **Repository Secrets**:

1. In the GitHub repository: **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"** for each variable:
   - `NUXT_PUBLIC_FIREBASE_API_KEY`
   - `NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NUXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NUXT_PUBLIC_FIREBASE_APP_ID`
   - `NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

In `.github/workflows/deploy.yml`, add this before the build step:

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

## Step 6: Verify it works

1. Run the project locally:

```bash
cd nuxt-blog
cp .env.example .env
# Fill in .env with your Firebase keys
npm run dev
```

2. Open your browser → `http://localhost:3000`
3. On the home page you should see like buttons (❤️) on each article card
4. Click a like button:
   - The counter should increase by 1
   - The button should turn pink (active state)
   - Clicking again should not be possible
5. Open the Firebase Console → Firestore — you should see the `likes` collection with documents
6. Open any project page (e.g. `http://localhost:3000/project/skyrim`) — you should see the `views` collection with a document for that slug

---

## Step 7: Firestore data structure

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

- **Collection:** `likes`
- **Document ID:** article slug (matches the folder name in `content/`)
- **Fields:**
  - `count` (number) — number of likes
  - `updatedAt` (timestamp) — last update time

### `views` collection (unique page views)

```
views/
  ├── civilization-6/
  │     ├── count: 42
  │     └── updatedAt: <timestamp>
  ├── dualscreendex/
  │     ├── count: 128
  │     └── updatedAt: <timestamp>
  └── ...
```

- **Collection:** `views`
- **Document ID:** article slug (matches the folder name in `content/`)
- **Fields:**
  - `count` (number) — number of unique page views
  - `updatedAt` (timestamp) — last update time

**How uniqueness is determined:** one browser = one view, forever.
After the first counted view, the slug is stored in `localStorage`
(key `viewed_articles`), and repeat visits from that browser are not counted.
The logic lives in [`composables/useViews.ts`](composables/useViews.ts:1) and is
invoked on the page [`pages/project/[slug].vue`](pages/project/[slug].vue:1).

**Quota efficiency:** the write is performed via
`setDoc(ref, { count: increment(1), updatedAt: serverTimestamp() }, { merge: true })` —
that's **one write and zero reads** per unique browser. The `onSnapshot`
subscription and `getDoc` are intentionally not used, since displaying the
counter in the UI is not required yet.

---

## Step 8: Google Analytics (GA4) setup

Firebase Analytics is powered by **Google Analytics 4 (GA4)** under the hood. It lets you track traffic, user behavior and much more — all through the built-in Firebase dashboards.

### 8.1. Enable Analytics in the Firebase Console

1. In the Firebase console, go to **Integrations** → **Google Analytics**
2. Click **"Link a Google Analytics property"**
3. Select an existing GA4 account or create a new one:
   - Click **"Create a new property"**
   - Enter a name (e.g. `Dual Screen Games Blog`)
   - Choose a time zone and currency
4. Click **"Link"** and wait for it to finish
5. Click **"Continue"**

### 8.2. Get the Measurement ID

The Measurement ID is the GA4 key in the format `G-XXXXXXXXXX`.

1. Go to **Google Analytics** → [analytics.google.com](https://analytics.google.com/)
2. Select the property you created
3. Go to **Admin** (⚙️) → **Data streams**
4. Select the web data stream
5. Copy the **Measurement ID** (shown at the top)

### 8.3. Add the Measurement ID to the project

Add this to your `.env` file:

```bash
NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 8.4. GitHub Actions (if you deploy via CI)

Add the `NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID` secret to Repository Secrets.

### 8.5. How it works

The plugin [`plugins/firebase-analytics.client.ts`](plugins/firebase-analytics.client.ts) automatically:

1. **Initializes** Firebase Analytics on page load (client-side only)
2. **Logs** a `page_view` event on every navigation
3. **Provides** the `$trackEvent()` helper for custom events

#### Automatic tracking

On every navigation, the following event is sent automatically:

```
page_view
  ├── page_path: "/project/skyrim"
  └── page_title: "Skyrim | Dual Screen Games..."
```

#### Custom events

Use `$trackEvent()` to track user actions:

```vue
<script setup lang="ts">
const { $trackEvent } = useNuxtApp()

// Track a like click
const handleLike = () => {
  $trackEvent('like_clicked', { article: 'skyrim' })
}

// Track a search
const handleSearch = (query: string) => {
  $trackEvent('search', { query })
}
</script>
```

### 8.6. Viewing analytics

#### In the Firebase Console:

1. Go to **Analytics** → **Dashboard** in the Firebase console
2. You'll see:
   - Active users
   - Number of sessions
   - Popular pages
   - Audience geography
   - Devices and browsers

#### In Google Analytics:

1. Go to [analytics.google.com](https://analytics.google.com/)
2. Select your blog's property
3. Full GA4 reports are available:
   - **Realtime** — who is on the site right now
   - **Lifecycle** — funnels, retention, monetization
   - **User** — demographics, interests, technology

### 8.7. Useful events for the blog

| Event | Parameters | When to send |
|-------|------------|--------------|
| `page_view` | `page_path`, `page_title` | Automatically (plugin) |
| `like_clicked` | `article` (slug) | On like click |
| `search` | `query`, `results_count` | On search |
| `sort_changed` | `sort_by` (popular/newest) | On sort |
| `article_open` | `article` (slug) | On opening an article |

### 8.8. Privacy and GDPR

> ⚠️ **Important:** Firebase Analytics sends data to Google. If your site targets EU users, you may need to:
> - Add a cookie consent banner
> - Enable IP anonymization
> - Update your privacy policy

For a simple blog this is usually not required, but it's worth keeping in mind.

---

## FAQ

### Can users inflate likes?
No. Each browser stores in `localStorage` which articles have already been liked. A user cannot like the same article more than once from a single browser. Additionally, the Firestore rules do not allow setting arbitrary `count` values.

### Is authentication required for likes?
No. Likes work anonymously — no authentication is required. This is intentional for a simple UX.

### What if a user clears localStorage?
Then they can like again. This is an acceptable trade-off for an anonymous system without authentication.

### How does sorting by popularity work?
On the home page, click "❤️ Popular" in the sort controls. Articles will be sorted by like count (highest to lowest).

### How much does it cost?
Free. The Firebase Spark (free) plan includes:
- 1 GiB of stored data
- 50,000 read operations/day
- 20,000 write operations/day
- 20,000 delete operations/day
- 10 GiB of outbound traffic/month

For a blog with likes and views this is more than enough: each unique
browser produces just one write per view and one per like.

> ⚠️ **Important:** once the daily quota is exhausted, writes simply stop
> going through (the client receives an error). The Spark plan has no budget
> alerts — those are only available on the paid Blaze plan. The view counter
> code ([`composables/useViews.ts`](composables/useViews.ts:1)) catches errors
> and does not break the page.

### How do I view the number of page views in the Firebase panel?
1. Open the [Firebase Console](https://console.firebase.google.com/) and select your project.
2. In the left menu, go to **Build → Firestore Database**
   (direct link: `https://console.firebase.google.com/project/<PROJECT_ID>/firestore`).
3. On the **Data** tab, select the **`views`** collection.
4. Each document is a project page: **Document ID** = slug,
   the **`count`** field = number of unique views, **`updatedAt`** = last view time.
5. To sort by popularity: click the `count` column header
   (or create an index/query) — documents will be ordered descending.

> Tip: to quickly find a specific page, type its slug
> (e.g. `skyrim`) into the search box above the document list.

---

## Solution architecture

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

- **Local storage:** `localStorage` key `liked_articles` — an array of slugs
- **Global storage:** Firestore collection `likes` — document ID = slug
- **Sync:** `onSnapshot` — real-time subscription to updates
- **Atomicity:** `increment(1)` — the +1 operation is atomic at the Firestore level
