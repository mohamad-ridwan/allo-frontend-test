# Dokumentasi Arsitektur Sistem: SpaceX Rockets Web Application

Dokumen ini menjelaskan arsitektur perangkat lunak, pola desain (*design patterns*), struktur direktori, manajemen *state*, penanganan *edge case*, serta strategi *defensive programming* yang diimplementasikan pada proyek **Allo Bank Frontend Technical Assignment**.

---

## 1. Ikhtisar Arsitektur (*Architectural Overview*)

Aplikasi ini dibangun menggunakan ekosistem modern **Vue 3** dengan prinsip **Clean Code**, **Separation of Concerns (SoC)**, dan **Single Responsibility Principle (SRP)**:

1. **Framework & Engine**: Vue 3 (Composition API dengan `<script setup lang="ts">`) dan Vite sebagai build tool.
2. **Design Pattern Komponen**: **Container / Presentational Pattern** (*Smart vs. Dumb Components*).
3. **Struktur Modular**: **Feature/Domain-Driven Component Structure** memisahkan komponen domain spesifik (`rocket`) dan komponen bersama (`common`).
4. **State Management**: **Pinia** sebagai *single source of truth* reaktif untuk data API dan data lokal (*in-memory*).
5. **UI & Styling**: **Vuetify 3** (Material Design Component Framework) dengan tata letak responsif penuh.
6. **Type Safety**: **TypeScript 5.6** dengan *strict typing* dan validasi penuh pada tahap build pipeline (`vue-tsc`).

---

## 2. Diagram Aliran Data & Arsitektur

```mermaid
graph TD
    User([Pengguna / Browser]) --> Router[Vue Router / File-Based Routing]
    Router --> IndexPage["Page: index.vue (Smart Container)"]
    Router --> DetailPage["Page: [id].vue (Smart Container)"]

    subgraph State Management [Pinia: useRocketStore]
        StoreAPI[apiRockets: Ref<Rocket[]>]
        StoreLocal[localRockets: Ref<Rocket[]>]
        StoreFilter[filterQuery: Ref<string>]
        StoreSelected[selectedRocket: Ref<Rocket | null>]
        Getters["rockets / filteredRockets (Computed)"]
        Actions["fetchRockets / fetchRocketById / addLocalRocket"]
    end

    IndexPage <--> StoreFilter
    IndexPage <--> Actions
    IndexPage <--> Getters
    DetailPage <--> Actions
    DetailPage <--> StoreSelected

    subgraph Presentational Components [Dumb / Reusable Components]
        IndexPage --> RocketCard[RocketCard.vue]
        IndexPage --> RocketFilter[RocketFilter.vue]
        IndexPage --> AddRocketDialog[AddRocketDialog.vue]
        DetailPage --> RocketSpecsCard[RocketSpecsCard.vue]
        DetailPage --> RocketSpecsTable[RocketSpecsTable.vue]
        IndexPage & DetailPage --> StateError[StateError.vue]
        IndexPage & DetailPage --> StateEmpty[StateEmpty.vue]
    end

    subgraph Utilities & Assets
        RocketCard & DetailPage --> Formatters["formatters.ts (formatCost, formatDate)"]
        RocketCard & DetailPage --> Assets["assets/images/placeholders/rocket-placeholder.svg"]
    end

    Actions <--> LL2API["Launch Library 2 API (lldev.thespacedevs.com/2.2.0)"]
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
│       ├── AddRocketDialog.vue        # Modal form penambahan roket lokal beserta validasinya
│       ├── RocketCard.vue             # Kartu item roket presentasional (hover effect, line-clamp)
│       ├── RocketFilter.vue           # Input pencarian / filter reaktif (two-way binding v-model)
│       ├── RocketSpecsCard.vue        # 3 kartu metrik ringkasan (Cost, Country, Maiden Flight)
│       └── RocketSpecsTable.vue       # Tabel detail spesifikasi teknis roket
│
├── pages/                             # Smart Containers (Orkestrasi data & lifecycle)
│   ├── index.vue                      # Halaman utama daftar roket (Route: /)
│   └── rocket/
│       └── [id].vue                   # Halaman detail roket (Route: /rocket/:id)
│
├── router/
│   └── index.ts                       # Konfigurasi Vue Router & penanganan dynamic import error
│
├── stores/
│   └── rocket.ts                      # Pinia Store: State, Getters, dan Actions
│
├── types/
│   └── rocket.ts                      # Definisi interface TypeScript (Rocket, Manufacturer)
│
└── utils/
    └── formatters.ts                  # Pure utility functions (formatCost, formatDate, constant asset)
```

---

## 4. Pola Desain Komponen: Smart vs. Dumb Components

### A. Smart Components (*Container Pages*)
File: `src/pages/index.vue` dan `src/pages/rocket/[id].vue`
* **Tanggung Jawab**:
  * Mengonsumsi Pinia store (`useRocketStore`).
  * Mengatur *lifecycle hooks* (`onMounted`).
  * Menentukan *rendering state* (apakah sedang Loading, Error, Success, atau Empty).
  * Mengalirkan data ke komponen anak melalui `props` dan merespons `emits`.
* **Kelebihan**: Logika halaman sangat ringkas (< 130 baris), tidak ada kode UI detail yang berceceran.

### B. Dumb Components (*Presentational Components*)
File: Komponen di dalam `src/components/`
* **Tanggung Jawab**:
  * Murni mengelola representasi visual berdasarkan `props`.
  * Tidak terikat langsung dengan panggilan API atau instance Pinia store.
  * Memicu aksi pengguna kembali ke parent melalui `emit` (misal: `@retry`, `@submit`, `@action`).
* **Kelebihan**: Sangat mudah diuji secara modular (*isolated unit testing*), tidak memiliki efek samping (*side-effects*), dan dapat digunakan ulang di layar mana pun.

---

## 5. Manajemen State (*Pinia Store Architecture*)

State dikelola terpusat di dalam [src/stores/rocket.ts](file:///Volumes/iwandev/mac/allo-frontend-test/src/stores/rocket.ts):

### 1. Reaktif State
* `apiRockets`: Menyimpan hasil fetch 13 roket dari API.
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
1. **Level 1**: Memeriksa `localRockets`. Jika ada, langsung disajikan tanpa memanggil network.
2. **Level 2**: Memeriksa cache `apiRockets`. Jika roket sudah pernah di-fetch di list, detail langsung ditampilkan seketika (*instant navigation*).
3. **Level 3**: Jika halaman diakses langsung lewat URL (misal `/rocket/5`), aplikasi memanggil endpoint detail API `/config/launcher/:id/`.

---

## 6. Defensive Programming & Penanganan Edge Cases

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

## 7. Standarisasi Tiga UI States

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

## 8. Verifikasi Kualitas Kode & CI/CD Pipeline

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
