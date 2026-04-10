# AnimalCare Hub 🐾

A vibrant, modern full-stack web application designed for pet owners, farmers, and veterinary professionals to seamlessly manage animal healthcare.

## 🌟 Modules Included
1. **AI Animal Disease Predictor:** Analyze text symptoms to deduce conditions.
2. **Smart Vaccination Tracker:** Track ongoing & missed vaccinations with beautiful UI.
3. **Emergency Vet Locator:** Uses Geolocation logic to locate the closest clinic.
4. **Farm Animal Management:** Specific dashboards for livestock recording (e.g., milk yield).
5. **Pet Image Disease Scan:** Drag & drop uploading to process visual disease analytics.
6. **Robust Dashboard:** Tailored glassmorphism UI for users to monitor pet behaviors.

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js installed (v16+)
- MongoDB running locally on port 27017 (`mongodb://127.0.0.1:27017/animalcare`)

### 1. Setup Backend
Open a terminal and run the following:
```bash
cd backend
npm install
node data/seed.js   # Generates dummy users
node server.js      # Starts the backend server on port 5000
```
*Note: Make sure your MongoDB is actively running before starting the server or seeding.*

### 2. Setup Frontend
Open a **new** terminal and run the following:
```bash
cd frontend
npm install
npm run dev         # Starts the Vite React environment at localhost:5173
```

### 3. Log into the App
Access `http://localhost:5173/` in your browser.
You can use one of the seeded accounts:

- **Pet Owner:** `owner@vet.com` / `password123`
- **Veterinarian:** `vet@vet.com` / `password123`
- **Administrator:** `admin@vet.com` / `password123`

---

## Technical Stack
- **Frontend:** React, Vite, React Router, Axios, Lucide Icons, Custom Vanilla CSS Glassmorphism
- **Backend:** Node.js, Express, MongoDB (Mongoose), JSON Web Tokens (JWT), Multer
