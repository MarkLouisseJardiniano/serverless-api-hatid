const User = require('./models/User');
const Message = require('../schema/message');


app.post('/api/messages', async (req, res) => {
  const { text, sender } = req.body;
  const message = new Message({ text, sender });
  await message.save();
  res.status(201).json(message);
});

// Example route to fetch all messages
app.get('/api/messages', async (req, res) => {
  const messages = await Message.find().sort({ timestamp: 1 });
  res.json(messages);
});
