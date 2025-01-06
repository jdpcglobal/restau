import mongoose from 'mongoose';

const logintableSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

export default mongoose.models.logintable || mongoose.model('logintable', logintableSchema);
