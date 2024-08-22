const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const historySchema = new Schema({
  date: {
    type: String,
    required: true,
  },
  translate_from_language: {
    type: String,
    required: true,
  },
  translated_to_language: {
    type: String,
    required: true,
  },
  translate_from_text: {
    type: String,
    required: true,
  },
  translated_to_text: {
    type: String,
    required: true,
  },
});

const History = mongoose.model("History", historySchema);

module.exports = { History };
