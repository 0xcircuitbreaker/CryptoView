const TransactionsSchema = require("../models/transactionsModel.js");
const PortfolioSchema = require("../models/userPortfolioModel.js");
const mongoose = require("mongoose");
const axios = require("axios");
const { GetTransactionModel } = require("../models/transactionsModel");
const { ethers } = require('ethers');
const erc20Abi = require('../config/erc20Abi.json');

const createTransaction = async (req, res) => {
  const { id, quantity, price, spent, date } = req.body;

  const user_id = req.user._id;

  if (!user_id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  if (!id) {
    return res.status(400).json({ error: "Please provide an ID" });
  }

  if (!quantity) {
    return res.status(400).json({ error: "Please provide a quantity" });
  }

  if (!price) {
    return res.status(400).json({ error: "Please provide a price" });
  }

  if (!spent) {
    return res.status(400).json({ error: "Please provide a spend" });
  }

  if (!date) {
    return res.status(400).json({ error: "Please provide a date" });
  }

  try {
    const transaction = await TransactionsSchema.create({
      id,
      quantity,
      price,
      spent,
      date,
      user_id,
    });

    let portfolio = await PortfolioSchema.findOne({ user_id: user_id });

    if (!portfolio) {
      res.status(404).json({
        error: "portfolio not found",
      });
    }

    res.status(200).json(transaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;

    const userFolio = await PortfolioSchema.findOne({
      user_id: userId,
    }).populate("transactions");

    if (!userFolio) {
      return res.status(404).json({ error: "Portfolio not found" });
    }

    res.status(200).json(userFolio.transactions);
  } catch (error) {
    res.status(500).json({
      error:
        "Une erreur s'est produite lors de la récupération du portfolio de l'utilisateur.",
    });
  }
};

const getTransactionsByAddress = async (req, res) => {
  try {
    const { address } = req.params;
    const { startDate, endDate } = req.query;

    console.log('Fetching transactions for address:', address);
    console.log('Start date:', startDate);
    console.log('End date:', endDate);

    const response = await axios.get('https://api.etherscan.io/api', {
      params: {
        module: 'account',
        action: 'txlist',
        address: address,
        startblock: 0,
        endblock: 99999999,
        page: 1,
        offset: 5,
        sort: 'desc',
        apikey: 'ETHERSCAN_API_KEY',
      },
    });

    console.log('API response:', response.data);

    const transactions = response.data.result;

    console.log('Transactions:', transactions);

    const filteredTransactions = transactions.filter(tx => {
      const transactionDate = new Date(tx.timeStamp * 1000);
      return (
        (!startDate || transactionDate >= new Date(startDate)) &&
        (!endDate || transactionDate <= new Date(endDate))
      );
    });

    console.log('Filtered transactions:', filteredTransactions);

    const recentTransactions = filteredTransactions.slice(0, 5);
    await GetTransactionModel.insertMany(recentTransactions);

    console.log('Recent transactions (5) saved to the database');

    res.status(200).json(recentTransactions);
  } catch (error) {
    console.error('Error during transaction retrieval:', error);
    res.status(500).json({ error: 'An error occurred while retrieving transactions' });
  }
};

const getTokenBalance = async (req, res) => {
  try {
    const { address, contractAddress } = req.params;

    const provider = new ethers.JsonRpcProvider('https://mainnet.infura.io/v3/INFURA_PROJECT_ID');

    const ethBalance = await provider.getBalance(address);
    console.log(ethBalance);
    const ethBalanceInEther = ethers.formatEther(ethBalance);
    console.log(ethBalanceInEther);

    const tokenContract = new ethers.Contract(contractAddress, erc20Abi, provider);
    const tokenBalance = await tokenContract.balanceOf(address);
    console.log(tokenBalance);
    const tokenBalanceInEther = ethers.formatEther(tokenBalance);
    console.log(tokenBalanceInEther);

    const tokenName = await tokenContract.name();
    console.log(tokenName);
    const tokenSymbol = await tokenContract.symbol();
    console.log(tokenSymbol);

    res.status(200).json({
      ethBalance: ethBalanceInEther,
      tokenBalance: tokenBalanceInEther,
      tokenName,
      tokenSymbol,
    });
  } catch (error) {
    console.error('Error retrieving balances:', error);
    res.status(500).json({ error: 'An error occurred while retrieving balances' });
  }
};

module.exports = { 
  createTransaction, 
  getTransactions, 
  getTransactionsByAddress, 
  getTokenBalance
 };
