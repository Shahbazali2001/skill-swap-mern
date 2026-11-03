const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// GET /api/v1/conversations -> list conversations the current user participates in
exports.listConversations = async (req, res) => {
  const conversations = await Conversation.find({ participants: req.user.id })
    .populate('participants', '-passwordHash')
    .populate({
      path: 'swapRequest',
      populate: [{ path: 'offeredSkill' }, { path: 'requestedSkill' }],
    })
    .sort({ updatedAt: -1 });

  res.json({ success: true, data: { conversations } });
};

// GET /api/v1/conversations/:id/messages -> chat history for a conversation (FR7)
exports.getMessages = async (req, res) => {
  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Conversation not found' } });

  const isParticipant = conversation.participants.map(String).includes(req.user.id);
  if (!isParticipant) return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not a participant of this conversation' } });

  const messages = await Message.find({ conversation: conversation._id })
    .populate('sender', '-passwordHash')
    .sort({ createdAt: 1 });

  res.json({ success: true, data: { messages } });
};
