const express = require("express");
const {
  createTransaction,
  getTransactions,
  getTransactionsByAddress,
  getTokenBalance,
} = require("../controllers/transactionsController.js");
const requireAuth = require("../middleware/requireAuth.js");

const router = express.Router();

router.post("/", requireAuth, createTransaction);

router.get("/", requireAuth, getTransactions);

router.get("/address/:address", getTransactionsByAddress);

router.get("/balance/:address/:contractAddress", getTokenBalance);

module.exports = router;
