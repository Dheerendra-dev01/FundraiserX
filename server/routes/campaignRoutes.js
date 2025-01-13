const express = require('express');
const Campaign = require('../models/campaign');

const router = express.Router();

// Create a new campaign
router.post('/', async (req, res) => {
    try {
        const { owner, title, description, goal, deadline } = req.body;
        const newCampaign = new Campaign({ owner, title, description, goal, deadline });
        await newCampaign.save();
        res.status(201).json(newCampaign);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all campaigns
router.get('/', async (req, res) => {
    try {
        const campaigns = await Campaign.find();
        res.status(200).json(campaigns);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Contribute to a campaign
router.post('/:id/contribute', async (req, res) => {
    try {
        const { id } = req.params;
        const { contributor, amount } = req.body;
        const campaign = await Campaign.findById(id);
        if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

        campaign.raised += amount;
        campaign.contributions.push({ contributor, amount });
        await campaign.save();

        res.status(200).json(campaign);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
