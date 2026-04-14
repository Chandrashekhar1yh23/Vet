# AnimalCare Hub 🐾

![AnimalCare Hub Hero](file:///C:/Users/Chandrashekhar/.gemini/antigravity/brain/a3bd5b06-2ad6-4916-8d8d-f6e91620ca5e/animalcare_hub_hero_1776150880535.png)

A vibrant, modern full-stack web application designed for pet owners, farmers, and veterinary professionals to seamlessly manage animal healthcare.

---

## 🌟 Modules Included

1.  **AI Animal Disease Predictor**: Analyze text symptoms to deduce conditions using advanced AI logic.
2.  **Smart Vaccination Tracker**: Track ongoing & missed vaccinations with a beautiful, intuitive UI.
3.  **Emergency Vet Locator**: Uses Geolocation logic to locate the closest clinic in real-time.
4.  **Farm Animal Management**: Specific dashboards for livestock recording, including milk yield and health trends.
5.  **Pet Image Disease Scan**: Drag & drop uploading to process visual disease analytics.
6.  **Robust Dashboard**: Tailored glassmorphism UI for users to monitor pet behaviors and health metrics.

---

## 🌍 Local Network & Mobile Access

We have recently configured the app for **Local Network Access**, allowing you to use it from your mobile phone or other laptops on the same WiFi.

### Accessing via IP
1.  Connect your device to the same WiFi as the server.
2.  Open your browser and navigate to:  
    `http://10.149.84.217:5174` (or `http://10.149.84.217.nip.io:5174` for Google OAuth).

### Google OAuth Configuration
For Google Login to work on the network, add the following to your **Google Cloud Console** under "Authorized JavaScript origins":
*   `http://localhost:5174`
*   `http://10.149.84.217.nip.io:5174`

---

## 🚀 How to Run Locally

### Prerequisites
*   **Node.js**: v16 or higher
*   **MongoDB**: Running locally on port 27017

### 1. Setup Backend
```bash
cd backend
npm install
node server.js      # Runs on http://localhost:5000
```

### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev         # Runs on http://localhost:5174
```

### 3. Log into the App
Access `http://localhost:5174/` or your Network IP. Use these seeded accounts for testing:
*   **Pet Owner**: `owner@vet.com` / `password123`
*   **Veterinarian**: `vet@vet.com` / `password123`
*   **Administrator**: `admin@vet.com` / `password123`

---

## 🛠️ Technical Stack
*   **Frontend**: React (Vite), React Router, Axios, Lucide Icons
*   **Backend**: Node.js, Express, MongoDB (Mongoose), JWT, Multer
*   **Security**: Professional CORS handling, Dotenv configuration, HTTP-only cookies

---

Created with ❤️ by the AnimalCare Hub Team.
