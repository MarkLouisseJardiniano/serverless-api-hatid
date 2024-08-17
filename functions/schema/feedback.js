const feedbackSchema = new mongoose.Schema({
    feedback: { type: String },
    dateTime: { type: Date, default: Date.now },
  });
  
  const Feedback = mongoose.model('Feedback', feedbackSchema);
  
  module.exports = Feedback;
  