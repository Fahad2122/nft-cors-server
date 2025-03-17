const express = require("express");
const mongoose = require("mongoose");
const AuctionNFT = require("./models/AuctionNFT");

const router = express.Router();

router.post("/addAuction", async (req, res) => {
    try {
        const { walletAddress, nft } = req.body;

        if (!walletAddress || !nft) {
            return res.status(400).json({ message: "walletAddress and NFT data are required" });
        }

        let userAuction = await AuctionNFT.findOne({ walletAddress });

        if (!userAuction) {
            userAuction = new AuctionNFT({ walletAddress, NFTs: [nft] });
        } else {
            userAuction.NFTs.push(nft);
        }

        await userAuction.save();
        res.status(201).json({ message: "Auction added successfully", auction: userAuction });
    } catch (error) {
        console.error("Error adding auction:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.put("/updateBid", async (req, res) => {
    try {
        const { walletAddress, auctionId, bidAmount } = req.body;

        if (!walletAddress || !auctionId || bidAmount === undefined) {
            return res.status(400).json({ message: "Invalid data provided" });
        }

        const userAuction = await AuctionNFT.findOne({ walletAddress });
        if (!userAuction) return res.status(404).json({ message: "User auction not found" });

        const nft = userAuction.NFTs.find(nft => nft.auctionId === auctionId);
        if (!nft) return res.status(404).json({ message: "Auction not found" });

        nft.bidAmount = bidAmount;
        await userAuction.save();

        res.status(200).json({ message: "Bid amount updated successfully", nft });
    } catch (error) {
        console.error("Error updating bid amount:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/userAuctions/:walletAddress", async (req, res) => {
    try {
        const { walletAddress } = req.params;
        const userAuction = await AuctionNFT.findOne({ walletAddress });

        if (!userAuction) {
            return res.status(404).json({ message: "No auctions found for this user" });
        }

        res.status(200).json(userAuction);
    } catch (error) {
        console.error("Error fetching user auctions:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/userAuction/:walletAddress/:auctionId", async (req, res) => {
    try {
        const { walletAddress, auctionId } = req.params;
        const userAuction = await AuctionNFT.findOne({ walletAddress });

        if (!userAuction) {
            return res.status(404).json({ message: "No auctions found for this user" });
        }

        const nft = userAuction.NFTs.find(nft => nft.auctionId === auctionId);
        if (!nft) {
            return res.status(404).json({ message: "Auction not found" });
        }

        res.status(200).json(nft);
    } catch (error) {
        console.error("Error fetching auction:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/createdAuctions/:walletAddress/:creatorAddress", async (req, res) => {
    try {
        const { walletAddress, creatorAddress } = req.params;
        const userAuction = await AuctionNFT.findOne({ walletAddress });

        if (!userAuction) {
            return res.status(404).json({ message: "No auctions found for this user" });
        }

        const nfts = userAuction.NFTs.filter(nft => nft.creatorAddress === creatorAddress);
        if (nfts.length === 0) {
            return res.status(404).json({ message: "No auctions found for this creator" });
        }

        res.status(200).json(nfts);
    } catch (error) {
        console.error("Error fetching auctions:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;