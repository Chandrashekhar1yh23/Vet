const mongoose = require('mongoose');

const animalSchema = new mongoose.Schema({
    name: { type: String, required: true },
    species: { type: String, required: true }, // Dog, Cat, Cow, etc.
    breed: { type: String },
    age: { type: Number },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isFarmAnimal: { type: Boolean, default: false },
    milkProduction: { type: Number, default: 0 }, // For cows etc (Liters/day)
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Animal', animalSchema);
