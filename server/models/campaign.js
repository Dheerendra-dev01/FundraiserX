const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
    owner: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    goal: { type: Number, required: true },
    raised: { type: Number, default: 0 },
    deadline: { type: Date, required: true },
    completed: { type: Boolean, default: false },
    contributions: [
        {
            contributor: String,
            amount: Number,
        }
    ],
}, { timestamps: true });

module.exports = mongoose.model('Campaign', campaignSchema);
