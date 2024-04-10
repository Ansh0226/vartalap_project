const asyncHanler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
const allMessages = asyncHanler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected
// const sendMessage = asyncHanler(async (req, res) => {
//   const { content, chatId } = req.body;

//   if (!content || !chatId) {
//     console.log("Invalid data passed into request");
//     return res.sendStatus(400);
//   }

//   var newMessage = {
//     sender: req.user._id,
//     content: content,
//     chat: chatId,
//   };

//   try {
//     var message = await Message.create(newMessage);

//     message = await message.populate("sender", "name pic");
//     message = await message.populate("chat");

//     // message = await User.populate(message, {
//     //   path: "chat.users",
//     //   select: "name pic email",
//     // });
//     // Populate the message with chat information including latest message
//     message = await message.populate({
//       path: "chat",
//       populate: { path: "latestMessage" }
//     });

//     await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

//     res.json(message);
//   } catch (error) {
//     res.status(400);
//     throw new Error(error.message);
//   }
// });

const sendMessage = asyncHanler(async (req, res) => {
  const { content, chatId } = req.body;

  // Check if content and chatId are provided
  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  try {
    // Create a new message object
    const newMessage = {
      sender: req.user._id, // Assign the sender's user ID
      content: content,
      chat: chatId, // Assign the provided chat ID
    };

    // Create the message in the database
    const message = await Message.create(newMessage);

    // Populate the message with sender information (name and pic)
    await message.populate("sender", "name pic");

    // Populate the message with chat information, including the latest message
    await message.populate({
      path: "chat",
      populate: { path: "latestMessage" }
    });

    // Update the latest message of the chat
    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

    // Check if the chat is a one-to-one chat and update the latest message for the other user
    const chat = await Chat.findById(chatId);
    if (chat) { // Check if chat exists
      if (!chat.isGroupChat) {
        const otherUserId = chat.users.find(user => String(user) !== String(req.user._id));
        if (otherUserId) { // Check if other user ID exists
          await Chat.findOneAndUpdate(
            { _id: chatId, isGroupChat: false },
            { latestMessage: message },
            { new: true }
          );
        }
      }
    } else {
      console.log("Chat not found with ID:", chatId);
    }

    // Send the created message in the response
    res.json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = { allMessages, sendMessage };





module.exports = { allMessages, sendMessage };