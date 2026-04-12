const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Feature 1: AI Animal Disease Predictor (Mock)
router.post('/symptom-checker', (req, res) => {
    const { symptoms } = req.body;
    let condition = "Unknown";
    let recommendation = "Consult a vet immediately.";
    
    if(!symptoms) return res.status(400).json({message: "Symptoms are required."});

    const symptomsStr = symptoms.toLowerCase();
    
    if (symptomsStr.includes('fever') && symptomsStr.includes('loss of appetite')) {
        condition = "Bacterial Infection";
        recommendation = "Visit veterinarian within 24 hours.";
    } else if (symptomsStr.includes('vomiting')) {
        condition = "Gastrointestinal Issue or Food Poisoning";
        recommendation = "Withhold food for 12hrs and observe. If it persists, see a vet.";
    } else if (symptomsStr.includes('coughing')) {
        condition = "Respiratory Infection (e.g., Kennel Cough)";
        recommendation = "Isolate pet and schedule a vet appointment.";
    } else {
        condition = "Undefined mild issue";
        recommendation = "Monitor pet for 24 hours. Call vet if symptoms worsen.";
    }

    // Delay response lightly to simulate AI
    setTimeout(() => {
        res.json({
            symptoms,
            condition,
            recommendation,
            urgency: condition.includes("Infection") ? "High" : "Medium"
        });
    }, 1500);
});

// Bonus Feature 5: Pet Image Disease Detection (Mock)
router.post('/image-detection', upload.single('image'), (req, res) => {
    // Generate a random mock prediction to seem like an AI model
    const predictions = [
        { detection: "Possible skin infection (Dermatitis).", recommendation: "Visit veterinarian for an antifungal or antibiotic prescription." },
        { detection: "Tick infestation identified in coat.", recommendation: "Apply anti-tick treatment and manually remove visible ticks." },
        { detection: "Healthy Skin/Coat.", recommendation: "No immediate issues detected. Keep up the good grooming!" },
        { detection: "Ear Mites (Otodectes cynotis) suspected.", recommendation: "Clean ears with vet-approved solution and administer ear drops." }
    ];

    const result = predictions[Math.floor(Math.random() * predictions.length)];

    setTimeout(() => {
        res.json({
            message: "Image processed successfully",
            result
        });
    }, 2000); // simulate processing time
});

module.exports = router;
