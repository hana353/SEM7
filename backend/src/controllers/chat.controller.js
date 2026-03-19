const { handleChatMessage } = require("../services/chat.service");

exports.sendMessage = async (req, res) => {
  try {
    const userId = req.user?.id || req.body?.userId;
    const message = req.body?.message;

    const result = await handleChatMessage({
      userId,
      message,
    });

    res.json({
      ok: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      ok: false,
      message: error.message,
    });
  }
};