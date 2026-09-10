# BUILD KOSMATE — PRODUCTION-READY SAAS

Saya ingin membangun aplikasi SaaS bernama **KosMate** untuk pemilik kos di Indonesia.

Jangan membuat prototype/mockup saja.

Saya membutuhkan **SOURCE CODE ASLI** yang dapat dijalankan di VS Code, disimpan di GitHub, dikembangkan sendiri, dan nantinya di-build menjadi aplikasi Android menggunakan Expo.

Gunakan **React Native + Expo + TypeScript + Supabase + Duitku**.

---

# 1. PRODUCT

Nama:
KosMate

Tagline:
"Kelola kos, tanpa ribet."

Target:
Pemilik kos di Indonesia.

KosMate membantu pemilik kos:

* Mengelola kamar
* Mengelola penghuni
* Mencatat pembayaran
* Mengetahui kamar yang sudah/belum bayar
* Mengetahui kamar yang jatuh tempo
* Melihat pemasukan
* Mengirim pengingat WhatsApp
* Membayar langganan KosMate setiap bulan

---

# 2. BUSINESS MODEL

Biaya setup awal:

Rp400.000

Setelah itu:

Rp10.000 / kamar TERISI / bulan.

PENTING:

Tagihan bulanan TIDAK berdasarkan jumlah total kamar.

Contoh:

Kos memiliki 25 kamar.

Bulan ini:

25 kamar total
23 kamar terisi
2 kamar kosong

Tagihan:

23 × Rp10.000
= Rp230.000

Bulan berikutnya jika hanya 20 kamar terisi:

20 × Rp10.000
= Rp200.000

Jadi harga berubah setiap bulan berdasarkan jumlah kamar yang terisi.

---

# 3. BILLING RULE

Buat sistem monthly billing.

Gunakan tanggal cut-off yang dapat dikonfigurasi.

Default:

Tanggal 28 setiap bulan.

Pada tanggal billing:

1. Hitung kamar yang statusnya TERISI.
2. Simpan jumlah kamar terisi ke invoice.
3. Hitung:
   occupied_rooms × 10000
4. Buat invoice.
5. Generate payment melalui Duitku.
6. Berikan Virtual Account/payment information kepada owner.
7. Owner melakukan transfer manual.
8. Duitku mengirim callback.
9. Backend memverifikasi callback.
10. Invoice berubah menjadi PAID.
11. Subscription owner aktif untuk periode berikutnya.

Jangan mengubah jumlah kamar pada invoice yang sudah dibuat.

Contoh:

Tanggal 28:

23 kamar terisi.

Invoice:

23 × 10.000 = Rp230.000.

Jika tanggal 29 ada penghuni keluar, invoice tetap Rp230.000.

---

# 4. PAYMENT MODEL

Jangan gunakan auto-debit.

Jangan gunakan Xendit.

Gunakan:

DUITKU.

Metode pembayaran utama:

Virtual Account.

Owner melakukan transfer manual ke Virtual Account/payment channel yang diberikan.

Setelah pembayaran diterima Duitku, Duitku mengirim HTTP callback ke backend.

Gunakan callback sebagai sumber utama perubahan status pembayaran.

---

# 5. IMPORTANT PAYMENT SECURITY

Duitku API KEY dan MERCHANT CODE tidak boleh berada di aplikasi Expo.

Jangan pernah menaruh:

DUITKU_API_KEY

di React Native.

Semua komunikasi Duitku harus melalui server-side:

Supabase Edge Functions.

Arsitektur:

Expo App
↓
Supabase
↓
Supabase Edge Function
↓
Duitku API

Callback:

Duitku
↓
Supabase Edge Function
↓
Supabase PostgreSQL
↓
Expo App

Supabase Edge Functions harus menyimpan secret melalui environment/secrets.

Gunakan:

DUITKU_MERCHANT_CODE
DUITKU_API_KEY
DUITKU_ENVIRONMENT

Jangan commit secret ke GitHub.

Supabase sendiri mendukung secrets untuk Edge Functions dan secret key tidak boleh digunakan di aplikasi client.

---

# 6. TECH STACK

Frontend:

* React Native
* Expo
* TypeScript
* Expo Router

Backend:

* Supabase
* PostgreSQL
* Supabase Auth
* Supabase Edge Functions

Database:

Supabase PostgreSQL.

Payment:

Duitku API
Duitku Virtual Account
Duitku HTTP Callback

Notifications:

WhatsApp deep link menggunakan:

https://wa.me/

Jangan menggunakan WhatsApp Business API untuk versi pertama.

---

# 7. AUTHENTICATION

Gunakan Supabase Auth.

Fitur:

* Register
* Login
* Logout
* Forgot password
* Reset password
* Session persistence
* Protected routes

Register:

Nama pemilik
Email
Nomor WhatsApp
Nama kos
Password

Setelah register:

→ buat profile
→ buat kos
→ masuk onboarding

Gunakan pola Supabase Auth resmi untuk React Native/Expo.

---

# 8. MULTI TENANT

Ini sangat penting.

KosMate adalah SaaS multi-tenant.

Setiap owner hanya boleh melihat data kos miliknya sendiri.

Contoh:

OWNER A

Kos A

* Kamar
* Penghuni
* Pembayaran
* Invoice

OWNER B

Kos B

* Kamar
* Penghuni
* Pembayaran
* Invoice

Owner A tidak boleh membaca data Owner B.

Implementasikan menggunakan:

Supabase Row Level Security (RLS).

Jangan hanya mengandalkan filtering frontend.

Setiap tabel yang berisi data owner harus mempunyai relasi ke owner/kos dan memiliki RLS policy.

---

# 9. DATABASE

Buat database migration SQL.

Jangan hanya membuat tabel melalui frontend.

Buat migration yang dapat dijalankan kembali.

Minimal tabel:

profiles
kos
rooms
tenants
payments
invoices
payment_transactions
subscriptions
reminders
notifications

---

# 10. PROFILES

Fields:

id
full_name
email
phone
role
created_at
updated_at

Roles:

OWNER
ADMIN

Default user:

OWNER

---

# 11. KOS

Fields:

id
owner_id
name
address
phone
total_rooms
billing_day
price_per_occupied_room
created_at
updated_at

Default:

price_per_occupied_room = 10000

Default billing day:

28

---

# 12. ROOMS

Fields:

id
kos_id
room_number
price
status
created_at
updated_at

Status:

EMPTY
OCCUPIED
MAINTENANCE

IMPORTANT:

Billing hanya menghitung:

status = OCCUPIED

---

# 13. TENANTS

Fields:

id
kos_id
room_id
name
phone
monthly_rent
move_in_date
due_date
status
created_at
updated_at

Status:

ACTIVE
INACTIVE

---

# 14. PAYMENTS

Fields:

id
kos_id
room_id
tenant_id
amount
billing_period
due_date
paid_at
status
payment_method
reference
created_at
updated_at

Status:

UNPAID
PAID
OVERDUE

---

# 15. INVOICES

Fields:

id
kos_id
invoice_number
billing_period
occupied_rooms
price_per_room
amount
status
due_date
paid_at
payment_gateway
gateway_reference
payment_url
virtual_account
created_at
updated_at

Status:

PENDING
PAID
EXPIRED
CANCELLED

Contoh:

occupied_rooms = 23

price_per_room = 10000

amount = 230000

---

# 16. SUBSCRIPTIONS

Fields:

id
kos_id
owner_id
status
current_period_start
current_period_end
last_invoice_id
created_at
updated_at

Status:

SETUP_PENDING
ACTIVE
PAYMENT_PENDING
GRACE_PERIOD
EXPIRED
CANCELLED

---

# 17. PAYMENT TRANSACTIONS

Fields:

id
invoice_id
kos_id
gateway
merchant_order_id
gateway_reference
payment_method
amount
status
callback_payload
paid_at
created_at
updated_at

Simpan gateway reference untuk tracking.

Simpan callback payload hanya jika aman dan diperlukan untuk audit.

---

# 18. DUITKU CREATE INVOICE

Buat Edge Function:

create-duitku-invoice

Flow:

Expo
↓
authenticated request
↓
Edge Function
↓
validate user
↓
validate invoice ownership
↓
call Duitku
↓
save gateway reference
↓
return payment information

Jangan call Duitku langsung dari Expo.

Duitku Create Invoice API menggunakan server-side HTTP POST dan mengembalikan reference/payment information.

---

# 19. DUITKU CALLBACK

Buat Edge Function public:

duitku-callback

Endpoint:

/functions/v1/duitku-callback

Duitku akan POST callback ke endpoint ini.

Callback harus:

1. Menerima POST.
2. Parse body.
3. Ambil:
   merchantCode
   amount
   merchantOrderId
   resultCode
   reference
   signature
4. Validasi merchantCode.
5. Cari invoice berdasarkan merchantOrderId.
6. Pastikan amount sama dengan invoice amount.
7. Verifikasi signature menggunakan HMAC SHA256.
8. Jika resultCode = 00:

   * invoice = PAID
   * payment transaction = SUCCESS
   * subscription = ACTIVE
9. Jika resultCode = 01:

   * payment transaction = FAILED
10. Return HTTP 200 setelah callback berhasil diproses.

Duitku mendokumentasikan callback sebagai HTTP POST dan resultCode `00` berarti success; signature callback menggunakan HMAC SHA256.

PENTING:

Callback harus idempotent.

Jika callback yang sama masuk dua kali:

JANGAN membuat dua payment.

JANGAN menambah saldo dua kali.

JANGAN membuat invoice baru.

Cukup return success jika transaksi sudah PAID.

---

# 20. PAYMENT VERIFICATION

Jangan mengubah invoice menjadi PAID hanya karena frontend mengatakan pembayaran berhasil.

Status PAID hanya boleh berasal dari:

Duitku callback yang sudah diverifikasi.

Jika perlu, buat Edge Function:

check-duitku-payment

untuk melakukan pengecekan server-side.

---

# 21. BILLING GENERATION

Buat Edge Function:

generate-monthly-invoices

Fungsi:

1. Cari kos aktif.
2. Hitung room dengan status OCCUPIED.
3. Ambil jumlah.
4. Hitung:

occupied_rooms × price_per_occupied_room

5. Buat invoice.
6. Pastikan tidak membuat invoice duplikat untuk periode yang sama.
7. Buat payment transaction.
8. Generate Duitku payment.

Contoh:

25 rooms
23 occupied
price = 10000

invoice = 230000

---

# 22. DUPLICATE PROTECTION

PENTING.

Tidak boleh ada:

2 invoice untuk kos yang sama
untuk billing period yang sama.

Gunakan unique constraint:

kos_id + billing_period

---

# 23. SUBSCRIPTION ACCESS

Jika:

subscription.status = ACTIVE

→ aplikasi normal.

Jika:

PAYMENT_PENDING

→ tampilkan tagihan.

Jika:

GRACE_PERIOD

→ aplikasi masih dapat digunakan tetapi tampilkan peringatan.

Jika:

EXPIRED

→ batasi fitur utama.

JANGAN menghapus data.

Owner tetap dapat login dan melihat data.

Owner dapat membayar invoice untuk mengaktifkan kembali akun.

---

# 24. GRACE PERIOD

Default:

3 hari.

Contoh:

Invoice dibuat:
28 September

Due:
30 September

Jika belum bayar:

30 September → PAYMENT_PENDING

1 Oktober → GRACE_PERIOD

3 Oktober → EXPIRED

Semua tanggal harus configurable.

---

# 25. OWNER DASHBOARD

Dashboard harus sederhana.

Tampilkan:

Total kamar
Kamar terisi
Kamar kosong
Maintenance
Penghuni aktif
Sudah bayar
Belum bayar
Jatuh tempo
Terlambat
Pendapatan bulan ini

Card contoh:

25
Total Kamar

23
Terisi

2
Kosong

18
Sudah Bayar

5
Belum Bayar

---

# 26. ROOM MANAGEMENT

Screen:

Kamar

Tampilkan:

Kamar 01
Terisi
Rp1.000.000

Kamar 02
Kosong

Kamar 03
Terisi
Rp1.200.000

Filter:

Semua
Terisi
Kosong
Maintenance

CRUD:

Create
Read
Update
Delete

---

# 27. TENANT MANAGEMENT

Screen:

Penghuni

Fitur:

Tambah penghuni
Edit
Hapus
Detail

Data:

Nama
Nomor HP
Kamar
Harga sewa
Tanggal masuk
Tanggal jatuh tempo
Status

---

# 28. PAYMENT SCREEN

Tampilkan:

Sudah bayar
Belum bayar
Terlambat

Filter:

Bulan

Kamar

Status

Owner dapat membuka detail pembayaran.

---

# 29. REMINDER

Buat reminder:

H-7
H-3
H-1
Hari H
Overdue

Gunakan tombol:

"Ingatkan via WhatsApp"

Generate:

https://wa.me/{phone}?text={encoded_message}

Contoh:

"Halo Budi, mengingatkan pembayaran kos kamar 12 sebesar Rp1.000.000 yang jatuh tempo pada 10 September 2026. Terima kasih."

---

# 30. MONTHLY INVOICE SCREEN

Buat screen:

Langganan KosMate

Tampilkan:

Periode
Jumlah kamar terisi
Harga per kamar
Total tagihan
Status
Tanggal jatuh tempo

Contoh:

September 2026

23 kamar terisi

Rp10.000/kamar

Total:

Rp230.000

Status:

MENUNGGU PEMBAYARAN

Button:

"Bayar Sekarang"

---

# 31. PAYMENT SCREEN

Ketika user menekan Bayar:

Tampilkan:

Tagihan:
Rp230.000

Nomor invoice:
KM-202609-0001

Payment method:

Virtual Account / metode Duitku yang tersedia.

Tampilkan payment information yang dikembalikan Duitku.

Button:

"Salin Nomor Pembayaran"

Button:

"Saya Sudah Bayar"

IMPORTANT:

"Saya Sudah Bayar" TIDAK mengubah status invoice menjadi PAID.

Hanya refresh status.

Status PAID hanya berasal dari callback Duitku.

---

# 32. ADMIN DASHBOARD

Buat role ADMIN.

Admin dapat melihat:

Total owner
Total kos
Total kamar
Total kamar terisi
Total revenue
Invoice pending
Invoice paid
Invoice expired

Admin dapat:

View owner
View kos
View subscription
View invoice
View transaction

Admin tidak boleh dapat melihat API secret.

---

# 33. UI / UX

Target pengguna adalah pemilik kos yang mungkin tidak terlalu paham teknologi.

Jangan membuat UI terlalu kompleks.

Gunakan:

Bahasa Indonesia.

Navigasi sederhana.

Bottom tabs:

Dashboard
Kamar
Penghuni
Pembayaran
Lainnya

Gunakan empty states.

Contoh:

"Belum ada penghuni."

"Tambahkan penghuni pertama."

Gunakan confirmation dialog sebelum delete.

Gunakan loading state.

Gunakan error state.

Gunakan toast/snackbar untuk success/error.

---

# 34. MOBILE FIRST

Prioritas:

Android phone.

Tetapi UI tetap responsive jika dijalankan pada tablet.

Jangan membuat dashboard seperti website desktop yang dipaksa masuk mobile.

Gunakan:

SafeAreaView

KeyboardAvoidingView

ScrollView

FlatList

Modal

Bottom sheet jika diperlukan.

---

# 35. NAVIGATION

Gunakan Expo Router.

Struktur:

app/

(auth)/
login.tsx
register.tsx
forgot-password.tsx

(onboarding)/
index.tsx

(tabs)/
index.tsx
rooms.tsx
tenants.tsx
payments.tsx
more.tsx

rooms/
[id].tsx

tenants/
[id].tsx

payments/
[id].tsx

subscription/
index.tsx

invoice/
[id].tsx

admin/
index.tsx

---

# 36. SECURITY

Implement:

Supabase Auth
RLS
Input validation
Authorization
Secure Edge Functions
Server-side Duitku API
Environment secrets

Jangan pernah:

* hardcode Duitku API key
* hardcode database password
* expose Supabase secret key
* trust client-side payment status

Supabase menyatakan publishable key dapat digunakan client dengan RLS, tetapi secret key yang bypass RLS tidak boleh berada di aplikasi client.

---

# 37. ENVIRONMENT VARIABLES

Create:

.env.example

Frontend:

EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

Backend/Supabase secrets:

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

DUITKU_MERCHANT_CODE=
DUITKU_API_KEY=
DUITKU_ENVIRONMENT=sandbox

IMPORTANT:

Jangan commit .env.

Tambahkan:

.env
.env.local

ke .gitignore.

---

# 38. SUPABASE EDGE FUNCTIONS

Buat:

supabase/functions/

create-duitku-invoice/
index.ts

duitku-callback/
index.ts

generate-monthly-invoices/
index.ts

check-duitku-payment/
index.ts

expire-subscriptions/
index.ts

Gunakan TypeScript.

---

# 39. CRON / SCHEDULE

Monthly billing harus dapat dijalankan otomatis.

Buat fungsi yang dapat dijadwalkan.

Jangan bergantung pada aplikasi mobile yang sedang terbuka.

Billing harus berjalan server-side.

---

# 40. DATABASE MIGRATIONS

Buat folder:

supabase/migrations/

Semua schema harus berupa SQL migration.

Contoh:

001_initial_schema.sql
002_rls_policies.sql
003_billing.sql
004_payment.sql

Jangan hanya mengandalkan manual table creation.

---

# 41. RLS

Setiap tabel tenant-specific harus mempunyai RLS.

Contoh:

Owner A hanya bisa:

SELECT rooms
WHERE rooms.kos_id milik Owner A.

Owner B tidak boleh membaca rooms Owner A.

Test RLS dengan minimal:

User A
User B

Pastikan User A tidak dapat membaca data User B walaupun mengetahui ID record.

---

# 42. ERROR HANDLING

Semua API harus menangani:

400
401
403
404
409
500

Tampilkan error dalam bahasa Indonesia.

Contoh:

"Pembayaran gagal. Silakan coba lagi."

"Anda tidak memiliki akses ke data ini."

"Invoice sudah dibayar."

---

# 43. OFFLINE / NETWORK

Jika internet tidak tersedia:

Tampilkan:

"Tidak ada koneksi internet."

Jangan menganggap payment berhasil.

Data penting harus berasal dari server.

---

# 44. DEVELOPMENT MODE

Buat:

APP_ENV=development

Pada development:

Duitku sandbox.

Jangan gunakan production credential.

Buat mock seed data:

1 owner
25 rooms
23 occupied
2 empty
23 tenants

Tetapi seed data hanya untuk development.

---

# 45. TESTING

Buat test untuk:

Authentication
RLS
Room CRUD
Tenant CRUD
Payment CRUD
Invoice generation
Duplicate invoice prevention
Duitku signature verification
Duitku callback
Payment success
Payment failure
Subscription expiration

Minimal test scenario:

User A login.

User A membuat kos.

User A membuat 25 kamar.

23 kamar diubah menjadi OCCUPIED.

Generate invoice.

Expected:

23 × Rp10.000 = Rp230.000.

Create Duitku invoice.

Simulate callback resultCode 00.

Expected:

invoice = PAID

payment_transaction = SUCCESS

subscription = ACTIVE

---

# 46. SOURCE CODE REQUIREMENT

Saya tidak ingin aplikasi yang hanya bisa berjalan di platform AI builder.

Saya ingin:

SOURCE CODE ASLI.

Project harus bisa:

npm install

npx expo start

dan dikembangkan melalui VS Code.

Pastikan semua source code berada di filesystem project.

Jangan menyembunyikan logic penting di platform builder.

---

# 47. README

Buat README.md yang menjelaskan:

Project overview
Tech stack
Installation
Supabase setup
Database migration
Environment variables
Duitku sandbox setup
Edge Functions
Webhook configuration
Local development
Testing
Build Android
Deployment
Production checklist

---

# 48. GITHUB READY

Buat project GitHub-ready.

Tambahkan:

.gitignore

.env.example

README.md

LICENSE

struktur folder yang rapi.

Jangan commit:

.env
API keys
Supabase secret keys
Duitku API keys

---

# 49. IMPORTANT DEVELOPMENT RULE

Jangan berhenti setelah membuat UI.

Kerjakan sampai:

1. Database dibuat.
2. Migration dibuat.
3. RLS dibuat.
4. Authentication dibuat.
5. Expo app terhubung Supabase.
6. CRUD kamar bekerja.
7. CRUD penghuni bekerja.
8. Payment bekerja.
9. Invoice bekerja.
10. Duitku integration dibuat.
11. Callback dibuat.
12. Subscription status bekerja.
13. Admin dashboard bekerja.
14. Testing dilakukan.
15. Semua error diperbaiki.

Jika ada bagian yang membutuhkan credential yang belum saya berikan:

JANGAN membuat credential palsu.

Gunakan environment variable placeholder dan sandbox/mock mode.

---

# 50. FINAL ARCHITECTURE

Architecture harus seperti ini:

```
            KOSMATE

         React Native
             Expo
              │
              ▼
      Supabase Auth
              │
              ▼
    Supabase PostgreSQL
              │
         RLS Security
              │
              ▼
   Supabase Edge Functions
      │       │       │
      │       │       │
      ▼       ▼       ▼
  Billing   Payment   Callback
              │
              ▼
           Duitku
              │
              ▼
      Virtual Account
              │
              ▼
      Pemilik Kos Bayar
              │
              ▼
        Duitku Callback
              │
              ▼
   Supabase Edge Function
              │
              ▼
        PostgreSQL
              │
              ▼
      Invoice = PAID
              │
              ▼
      Subscription ACTIVE
```

---

# 51. START NOW

Mulai dari codebase kosong.

Gunakan:

React Native
Expo
TypeScript
Expo Router
Supabase
PostgreSQL
Supabase Auth
Supabase RLS
Supabase Edge Functions
Duitku API

Jangan membuat website.

Buat MOBILE APP Android-first.

Jangan menggunakan OpenAI API.

Jangan menggunakan Firebase.

Jangan menggunakan localStorage sebagai database utama.

Jangan menggunakan dummy data sebagai production database.

Saya ingin hasil akhirnya berupa SOURCE CODE yang bisa saya buka di VS Code dan saya lanjutkan sendiri.

Mulai dengan:

1. Setup project Expo.
2. Setup Supabase client.
3. Buat database migrations.
4. Buat authentication.
5. Buat RLS.
6. Buat dashboard.
7. Buat room management.
8. Buat tenant management.
9. Buat payment/invoice.
10. Buat Duitku Edge Functions.
11. Buat callback.
12. Buat subscription logic.
13. Test.
14. Fix errors.
15. Pastikan project dapat dijalankan dengan `npx expo start`.

Jangan hanya menjelaskan apa yang harus dilakukan.

**LANGSUNG IMPLEMENTASIKAN CODE-NYA.**
