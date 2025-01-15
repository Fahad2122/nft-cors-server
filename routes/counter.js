const express = require("express");
const Counter = require("../models/Counter");
const router = express.Router();
require("dotenv").config();

router.post('/updateCounter', async (req, res) => {
    const { walletAddress, imageURI } = req.body;

    try {
        if(!walletAddress) {
            return res.status(400).json({ success: false, message: "Invalid input data" });
        }

        let counter = await Counter.findOne({ walletAddress });

        if(!counter) {
            counter = new Counter({
                walletAddress,
                nftGenerations: 1,
                imageURI: imageURI
            })
            await counter.save();
        } else {
            if(counter.nftGenerations >= process.env.NFT_LIMIT) {
                return res.status(400).json({ success: false, message: "Limit Reached, Please mint NFT to continue" });
            }
            counter.nftGenerations += 1;
            counter.imageURI = imageURI;
            await counter.save();
        }

        return res.status(200).json({ success: true, message: "Counter updated successfully" })

    } catch (error) {
        console.log("Error, while updating counter");
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
})

router.post("/clearCounter", async (req, res) => {
    const { walletAddress } = req.body;
    
    try {
        if(!walletAddress) {
            return res.status(400).json({ success: false, message: "Invalid input data" });
        }

        let counter = await Counter.findOne({ walletAddress });

        if(!counter) {
            return res.status(404).json({ success: false, message: "Not Found" });
        }

        counter.imageURI = "";
        counter.nftGenerations = 0;
        await counter.save();

        return res.status(200).json({ success: true, message: "Counter Cleared Successfully" });

    } catch (error) {
        console.log("Error, while getting counter");
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
})

router.post("/getCounter", async (req, res) => {
    const { walletAddress } = req.body;

    try {
        if(!walletAddress) {
            return res.status(400).json({ success: false, message: "Invalid input data" });
        }

        let counter = await Counter.findOne({ walletAddress });

        if(!counter) {
            return res.status(404).json({ success: false, message: "Not Found" });
        }

        res.status(200).json({
            success: true,
            counter,
            message: "Counter recieved successfully"
        })

    } catch (error) {
        console.log("Error, while getting counter");
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
})

module.exports = router;