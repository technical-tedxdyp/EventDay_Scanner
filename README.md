## Scanner setup

1. Install the locked dependencies with `npm ci`.
2. Copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_URL` to the staging backend URL ending in `/api`.
3. Ask the backend administrator to set a private `SCANNER_ACCESS_CODE` in the staging environment and share it with the small event scanning team. No operator or device records are needed for this event.
4. Start the app with `npm start` and enter the shared scanner access code on an iOS or Android device. The app stores the short-lived token in native SecureStore; it does not store the access code, use browser storage, or use the admin key.

Scanner admission requires a live backend connection. Verification failure, network failure, or failed check-in never authorizes entry. Use staging test bookings during validation; do not test check-in with real attendee tickets.

## Sample QR references

---

## 🧪 Testing QR Codes

Use the following QR codes to test different scenarios:

---

### ✅ Valid Ticket QR (Sample 1)

<img src="./sample_qr/Valid QR.png" width="200"/>

---

### ✅ Valid Ticket QR (Sample 2)

<img src="./sample_qr/Valid QR 2.png" width="200"/>

---

### ❌ Invalid Ticket QR

<img src="./sample_qr/Invalid QR.png" width="200"/>

---

### ⚠️ Already Used Ticket QR

<img src="./sample_qr/Already used QR.png" width="200"/>

---
