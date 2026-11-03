const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    swapRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'SwapRequest', required: true, unique: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Conversation', ConversationSchema);
