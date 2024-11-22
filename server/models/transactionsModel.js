const mongoose = require("mongoose");
const { Schema } = mongoose;

const TransactionsSchema = new Schema({
  id: {
    type: String,
    unique: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  spent: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const GetTransactionsSchema = new Schema({
  address: String,
  from: String,
  to: String,
  value: String,
  gas: String,
  gasPrice: String,
  hash: String,
  blockNumber: Number,
  timeStamp: Number,
});

const TransactionModel = mongoose.model("Transaction", TransactionsSchema);
const GetTransactionModel = mongoose.model("GetTransaction", GetTransactionsSchema);

module.exports = {
  TransactionModel,
  GetTransactionModel,
};
