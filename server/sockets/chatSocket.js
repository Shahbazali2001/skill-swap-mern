const { verifySocketToken } = require("../middleware/auth");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Notification = require("../models/Notification");

/**
 * FR7 & FR11 - Real-Time Communication & Notifications
 * ----------------------------------------------------------------
 * Wires up Socket.io on the shared HTTP server. Every socket
 * connection is authenticated with the same JWT issued at login.
 */
function initChatSocket(io) {
  // Authenticate every incoming socket connection using the JWT
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("AUTH_REQUIRED"));
      const payload = verifySocketToken(token);
      socket.user = {
        id: payload.id,
        name: payload.name,
        email: payload.email,
        role: payload.role,
      };
      next();
    } catch (err) {
      next(new Error("INVALID_TOKEN"));
    }
  });

  io.on("connection", (socket) => {
    // Every user joins their personal room for push notifications
    socket.join(`user:${socket.user.id}`);

    // Join a conversation room
    socket.on("join_room", async ({ conversationId }) => {
      try {
        if (!conversationId) return;
        const conversation = await Conversation.findById(conversationId);
        if (!conversation)
          return socket.emit("error_message", {
            message: "Conversation not found",
          });

        const isParticipant = conversation.participants
          .map(String)
          .includes(socket.user.id);
        if (!isParticipant && socket.user.role !== "admin") {
          return socket.emit("error_message", {
            message: "Not a participant of this conversation",
          });
        }

        socket.join(`conversation:${conversationId}`);
        socket.emit("joined_room", { conversationId });
      } catch (err) {
        socket.emit("error_message", { message: err.message });
      }
    });

    // Leave a conversation room
    socket.on("leave_room", ({ conversationId }) => {
      if (conversationId) socket.leave(`conversation:${conversationId}`);
    });

    // Send a chat message: persist first, then broadcast (FR7)
    socket.on("send_message", async ({ conversationId, content }) => {
      try {
        if (!content || !content.trim()) return;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation)
          return socket.emit("error_message", {
            message: "Conversation not found",
          });

        const isParticipant = conversation.participants
          .map(String)
          .includes(socket.user.id);
        if (!isParticipant && socket.user.role !== "admin") {
          return socket.emit("error_message", {
            message: "Not a participant of this conversation",
          });
        }

        const message = await Message.create({
          conversation: conversationId,
          sender: socket.user.id,
          content: content.trim(),
          readBy: [socket.user.id],
        });

        const populated = await message.populate("sender", "-passwordHash");

        // Broadcast to everyone in the conversation room
        io.to(`conversation:${conversationId}`).emit("new_message", {
          message: populated,
        });

        // Also push notification to other participants if they aren't actively viewing
        const otherParticipantIds = conversation.participants
          .map(String)
          .filter((id) => id !== socket.user.id);

        for (const recipientId of otherParticipantIds) {
          const notification = await Notification.create({
            recipient: recipientId,
            sender: socket.user.id,
            type: "new_message",
            title: `New message from ${socket.user.name}`,
            message:
              content.trim().length > 60
                ? `${content.trim().slice(0, 60)}...`
                : content.trim(),
            link: "/swaps",
            metadata: { conversationId, swapId: conversation.swapRequest },
          });
          io.to(`user:${recipientId}`).emit("notification:new", notification);
        }
      } catch (err) {
        socket.emit("error_message", { message: err.message });
      }
    });

    // Typing indicators
    socket.on("typing_start", ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit("user_typing", {
        userId: socket.user.id,
        name: socket.user.name,
        conversationId,
      });
    });

    socket.on("typing_stop", ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit("user_stop_typing", {
        userId: socket.user.id,
        conversationId,
      });
    });

    // Mark messages as read
    socket.on("mark_read", async ({ conversationId }) => {
      try {
        await Message.updateMany(
          { conversation: conversationId, readBy: { $ne: socket.user.id } },
          { $addToSet: { readBy: socket.user.id } },
        );
        io.to(`conversation:${conversationId}`).emit("messages_read", {
          conversationId,
          userId: socket.user.id,
        });
      } catch (err) {
        socket.emit("error_message", { message: err.message });
      }
    });

    socket.on("disconnect", () => {});
  });
}

module.exports = initChatSocket;
