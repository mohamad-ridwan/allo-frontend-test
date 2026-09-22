# Dokumentasi Arsitektur Sistem: SpaceX Rockets Web Application

Dokumen ini menjelaskan arsitektur perangkat lunak, pola desain (*design patterns*), struktur direktori, manajemen *state*, penanganan *edge case*, serta strategi *defensive programming* yang diimplementasikan pada proyek **Allo Bank Frontend Technical Assignment**.

---

## 1. Ikhtisar Arsitektur (*Architectural Overview*)

Aplikasi ini dibangun menggunakan ekosistem modern **Vue 3** dengan menerapkan prinsip **Clean Architecture**, **Separation of Concerns (SoC)**, dan **Single Responsibility Principle (SRP)**:

1. **Framework & Engine**: Vue 3 (Composition API dengan `<script setup lang="ts">`) dan Vite sebagai *build tool*.
2. **Layered Clean Architecture**:
   * **Presentation Layer**: *Smart Container Pages* (`src/pages/`) dan *Presentational Components* (`src/components/`).
   * **Composition / Controller Layer**: *Custom Composables* (`src/composables/`) untuk mengisolasi stateful logic, form handling, dan lifecycles dari file `.vue`.
   * **State Management Layer**: **Pinia** (`src/stores/`) sebagai *single source of truth* reaktif untuk *cache* dan data lokal (*in-memory*).
   * **Service & Data Access Layer**: **API Client & Domain Services** (`src/services/`) yang memisahkan seluruh komunikasi HTTP dan konfigurasi endpoint dari store dan UI.
   * **Utility & Style Layer**: Fungsi helper murni (`src/utils/`) dan stylesheet utilitas terpusat (`src/styles/`).
3. **Design Pattern Komponen**: **Container / Presentational Pattern** (*Smart vs. Dumb Components*).
4. **Struktur Modular**: **Feature/Domain-Driven Structure** memisahkan komponen domain spesifik (`rocket`) dan komponen bersama (`common`).
5. **UI & Styling**: **Vuetify 3** (Material Design Component Framework) dengan utilitas SCSS terpusat dan tata letak responsif penuh.
6. **Type Safety**: **TypeScript 5.6** dengan *strict typing* dan validasi penuh pada tahap build pipeline (`vue-tsc`).

---

## 2. Diagram Aliran Data & Arsitektur

```mermaid
graph TD
    User([Pengguna / Browser]) --> Router[Vue Router / File-Based Routing]
    Router --> IndexPage["Page: index.vue (Smart Container)"]
    Router --> DetailPage["Page: [id].vue (Smart Container)"]

    subgraph Composition Layer [Custom Composables]
        UseList["useRocketList.ts"]
        UseDetail["useRocketDetail.ts"]
        UseForm["useRocketForm.ts"]
    end

    IndexPage <--> UseList
    DetailPage <--> UseDetail
    AddRocketDialog <--> UseForm

    subgraph State Management [Pinia: useRocketStore]
        StoreAPI[apiRockets: Ref<Rocket[]>]
        StoreLocal[localRockets: Ref<Rocket[]>]
        StoreFilter[filterQuery: Ref<string>]
        StoreSelected[selectedRocket: Ref<Rocket | null>]
        Getters["rockets / filteredRockets (Computed)"]
        Actions["fetchRockets / fetchRocketById / addLocalRocket"]
    end

    UseList <--> StoreFilter
    UseList <--> Actions
    UseList <--> Getters
    UseDetail <--> Actions
    UseDetail <--> StoreSelected
    UseForm --> Actions

    subgraph Service Layer [Services & HTTP Client]
        RocketService["rocketService.ts (Domain API Methods)"]
        ApiClient["apiClient.ts (Reusable Fetch Wrapper)"]
    end

    Actions --> RocketService
    RocketService --> ApiClient
    ApiClient <--> LL2API["Launch Library 2 API (lldev.thespacedevs.com/2.2.0)"]

    subgraph Presentational Components [Dumb / Reusable Components]
        IndexPage --> RocketCard[RocketCard.vue]
        IndexPage --> RocketFilter[RocketFilter.vue]
        IndexPage --> AddRocketDialog[AddRocketDialog.vue]
        DetailPage --> RocketSpecsCard[RocketSpecsCard.vue]
        DetailPage --> RocketSpecsTable[RocketSpecsTable.vue]
        IndexPage & DetailPage --> StateError[StateError.vue]
        IndexPage & DetailPage --> StateEmpty[StateEmpty.vue]
    end

    subgraph Utilities & Styles
        RocketCard & DetailPage --> Formatters["formatters.ts (formatCost, formatDate)"]
        RocketCard & DetailPage --> Assets["assets/images/placeholders/rocket-placeholder.svg"]
        AllComponents --> GlobalStyles["styles/utilities.scss (line-clamp, hover, hero-overlay)"]
    end
```

---

## 3. Struktur Direktori Proyek

Pemisahan tanggung jawab diorganisasikan ke dalam struktur modular sebagai berikut:

```text
src/
├── assets/
│   └── images/
│       ├── logo/                      # Aset identitas/logo aplikasi
│       │   ├── logo.png
│       │   └── logo.svg
│       └── placeholders/              # Fallback SVG jika data gambar bernilai null/error
│           └── rocket-placeholder.svg
│
├── components/
│   ├── common/                        # Komponen UI generik & reusable lintas fitur
│   │   ├── StateEmpty.vue             # Menampilkan empty state (pencarian nihil / not found)
│   │   └── StateError.vue             # Alert error terstandarisasi dengan tombol Retry
│   │
│   └── rocket/                        # Komponen spesifik fitur/domain Rocket
│       ├── AddRocketDialog.vue        # Modal presentasional penambahan roket lokal
│       ├── RocketCard.vue             # Kartu item roket presentasional (zero-CSS SFC)
│       ├── RocketFilter.vue           # Input pencarian / filter reaktif (two-way binding v-model)
│       ├── RocketSpecsCard.vue        # 3 kartu metrik ringkasan (Cost, Country, Maiden Flight)
│       └── RocketSpecsTable.vue       # Tabel detail spesifikasi teknis roket
│
├── composables/                       # Custom Composables (Stateful logic & lifecycles)
│   ├── useRocketDetail.ts             # Logika halaman detail (routing params, auto-fetch, retry)
│   ├── useRocketForm.ts               # Logika formulir tambah roket (validasi, reset, submit)
│   └── useRocketList.ts               # Logika halaman daftar (lifecycle fetch, dialog handler)
│
├── pages/                             # Smart Containers (Orkestrasi view & layout)
│   ├── index.vue                      # Halaman utama daftar roket (Route: /)
│   └── rocket/
│       └── [id].vue                   # Halaman detail roket (Route: /rocket/:id)
│
├── plugins/
│   ├── index.ts                       # Registrasi plugin global (Pinia, Vuetify, Router)
│   └── vuetify.ts                     # Konfigurasi tema Vuetify dan import stylesheet
│
├── router/
│   └── index.ts                       # Konfigurasi Vue Router & penanganan dynamic import error
│
├── services/                          # Data Access / Service Layer
│   ├── apiClient.ts                   # Reusable HTTP client wrapper berbasis Fetch API
│   └── rocketService.ts               # Endpoint methods & response types untuk domain Rocket
│
├── stores/
│   └── rocket.ts                      # Pinia Store: State, Getters, dan Actions
│
├── styles/                            # Centralized Stylesheets
│   ├── settings.scss                  # Konfigurasi SASS variables Vuetify
│   └── utilities.scss                 # Utility classes global (line-clamp, card-hover, overlays)
│
├── types/
│   └── rocket.ts                      # Definisi interface TypeScript (Rocket, Manufacturer)
│
└── utils/
    └── formatters.ts                  # Pure utility functions (formatCost, formatDate, constant asset)
```

---

## 4. Pola Desain Komponen & Pemisahan Logika

### A. Smart Components (*Container Pages*)
File: `src/pages/index.vue` dan `src/pages/rocket/[id].vue`
* **Tanggung Jawab**:
  * Mengonsumsi logika dari **Composables** (`useRocketList`, `useRocketDetail`).
  * Menentukan *rendering state* (apakah sedang Loading, Error, Success, atau Empty).
  * Mengalirkan data ke komponen anak melalui `props` dan merespons `emits`.
* **Kelebihan**: Bagian `<script setup>` sangat ringkas (< 20 baris), bebas dari logika manipulasi data mentah.

### B. Custom Composables (*Headless Logic Layer*)
File: `src/composables/`
* **`useRocketList`**: Mengelola *lifecycle initial fetch* pada saat halaman dimuat, kontrol buka/tutup dialog tambah roket, dan penerusan data ke store.
* **`useRocketForm`**: Mengelola state reaktif form (`reactive`), validasi input, transformasi payload default (`SpaceX`, sanitasi `null`), dan pembersihan form (*reset*).
* **`useRocketDetail`**: Mengelola ekstraksi parameter URL `route.params.id`, pemanggilan detail roket, dan fungsi *retry* `loadData()`.
* **Kelebihan**: Logika bisnis dan reaktivitas dapat diuji (*unit test*) secara terpisah tanpa perlu me-render DOM.

### C. Dumb Components (*Presentational Components*)
File: Komponen di dalam `src/components/`
* **Tanggung Jawab**:
  * Murni mengelola representasi visual berdasarkan `props`.
  * Bebas dari dependensi ke Pinia store, router, atau API langsung.
  * Memicu aksi pengguna kembali ke parent melalui `emit` (misal: `@retry`, `@submit`, `@action`).
* **Kelebihan**: Bersih, modular, bebas efek samping (*side-effects*), dan dapat digunakan ulang di layar mana pun.

---

## 5. Service & HTTP Client Layer

Untuk mematuhi prinsip **Single Responsibility (SRP)**, seluruh komunikasi jaringan dipisahkan dari store:

1. **`apiClient.ts`**:
   * Wrapper berbasis Fetch API bawaan tanpa dependensi pihak ketiga tambahan.
   * Mendukung penanganan otomatis *query parameters* (`params`).
   * Standarisasi *header* (`Accept`, `Content-Type: application/json`).
   * Penanganan galat HTTP terpusat melalui class khusus `ApiError`.
2. **`rocketService.ts`**:
   * Mengisolasi spesifikasi endpoint The Space Devs:
     * `getRockets()`: Mengambil 13 roket SpaceX dengan `mode=detailed&limit=20`.
     * `getRocketById(id)`: Mengambil data roket tunggal.
   * Menyediakan antarmuka bertipe ketat (`PaginatedResponse<Rocket>`).

---

## 6. Manajemen State (*Pinia Store Architecture*)

State dikelola terpusat di dalam [src/stores/rocket.ts](file:///Volumes/iwandev/mac/allo-frontend-test/src/stores/rocket.ts):

### 1. Reaktif State
* `apiRockets`: Menyimpan hasil fetch roket dari API.
* `localRockets`: Menyimpan roket buatan pengguna (*in-memory*).
* `isLoading` / `isDetailLoading`: Indikator status fetch data.
* `error` / `detailError`: Pesan galat dari respons jaringan atau server.
* `filterQuery`: Kata kunci pencarian nama atau deskripsi roket.
* `selectedRocket`: Data aktif roket yang sedang dilihat di layar detail.

### 2. Getters Cerdas
* **`rockets`**:
  ```typescript
  computed(() => [...localRockets.value, ...apiRockets.value])
  ```
  Menggabungkan roket lokal di urutan paling atas dan data API di bawahnya.
* **`filteredRockets`**:
  Memfilter `rockets` berdasarkan kecocokan nama (`full_name`) atau deskripsi (`description`) secara *case-insensitive*.

### 3. Actions & Caching Bertingkat
Pada `fetchRocketById(id)`:
1. **Level 1**: Memeriksa `localRockets`. Jika ditemukan, langsung disajikan tanpa memanggil network.
2. **Level 2**: Memeriksa cache `apiRockets`. Jika roket sudah pernah di-fetch di list, detail langsung ditampilkan seketika (*instant navigation*).
3. **Level 3**: Jika halaman diakses langsung lewat URL (misal `/rocket/5`), aplikasi memanggil `rocketService.getRocketById(id)`.

---

## 7. Defensive Programming & Penanganan Edge Cases

Untuk mematuhi batasan teknis dari The Space Devs API:

| Edge Case / Skenario Galat | Strategi Penanganan |
| :--- | :--- |
| **`image_url` bernilai `null`** | Otomatis fallback ke `@/assets/images/placeholders/rocket-placeholder.svg`. |
| **URL gambar ada tapi 404 / Broken Link** | Ditangani melalui slot `<template #error>` pada `v-img` yang langsung mengalihkan ke SVG placeholder lokal tanpa menampilkan ikon *broken image* browser. |
| **`launch_cost` bernilai `null` / `""` / `NaN`** | Fungsi `formatCost` mengembalikan `'N/A'` secara aman tanpa memicu crash `Intl.NumberFormat`. |
| **`maiden_flight` bernilai `null` / Format invalid** | Fungsi `formatDate` memvalidasi `isNaN(d.getTime())` dan mengembalikan `'N/A'`. |
| **`manufacturer` atau `country_code` bernilai `null`** | Menggunakan *optional chaining* `rocket.manufacturer?.country_code || 'N/A'`. |
| **Koneksi Terputus / API Error (4xx/5xx)** | Ditangkap oleh blok `catch`, menyimpan pesan error ke store, dan menampilkan `StateError` dengan tombol **Retry** yang memicu *asynchronous re-fetch* tanpa reload browser. |
| **Pencarian Tidak Ditemukan** | Menampilkan `StateEmpty` dengan tombol aksi untuk membersihkan filter (*Clear Filter*). |
| **Batas Kuota API (Rate Limit)** | Menggunakan host development `lldev.thespacedevs.com` dengan versi API `2.2.0` yang stabil. |

---

## 8. Standarisasi Tiga UI States

Setiap layar wajib mengimplementasikan 3 state berikut:
1. **Loading State**:
   * Komponen: `v-skeleton-loader` (tipe card pada list, tipe article/table pada detail).
   * Efek: Memberikan umpan balik visual instan (*perceived performance*) kepada pengguna saat request sedang berlangsung.
2. **Error / Fail State**:
   * Komponen: `StateError.vue` (`v-alert` tonal).
   * Tombol Aksi: **Retry** yang mengeksekusi ulang fungsi pemanggilan data tanpa menyegarkan (*refresh*) halaman browser.
3. **Success State**:
   * Menampilkan grid kartu roket responsif atau kartu detail lengkap beserta spesifikasi metrik dan tabel informasi.

---

## 9. Arsitektur Styling & Utilitas Terpusat

Seluruh komponen Vue menerapkan konsep **Zero-CSS SFC** di mana styling tidak ditulis berulang kali di blok `<style scoped>`:
* **[src/styles/utilities.scss](file:///Volumes/iwandev/mac/allo-frontend-test/src/styles/utilities.scss)**:
  * `.line-clamp-2` & `.line-clamp-3`: Pemotongan teks multi-baris berbasis CSS Webkit Box.
  * `.rocket-card` & `.rocket-card:hover`: Transisi dan efek elevasi kartu.
  * `.hero-overlay`: Efek gradien linear pada gambar header detail roket.
  * `.line-height-relaxed`: Kerapian jarak baris teks deskripsi.
* Diimpor secara terpusat di `src/plugins/vuetify.ts`, menjamin konsistensi visual dan kemudahan pemeliharaan.

---

## 10. Verifikasi Kualitas Kode & CI/CD Pipeline

Proyek ini telah lulus seluruh tahapan pengujian statis dan dinamis:

```bash
# 1. Analisis Linting & Code Formatting
npm run lint
# Status: Passed (0 errors, 0 warnings)

# 2. Strict TypeScript Compilation Check
npm run type-check
# Status: Passed (vue-tsc --build --force lulus tanpa error tipe)

# 3. Production Bundle Build
npm run build
# Status: Passed (Bundling modul Vite + Type-check berhasil)
```
