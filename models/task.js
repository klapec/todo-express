import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const TaskSchema = new Schema({
  name: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  completed: { type: Boolean, default: false },
  createdOn: { type: Date, default: '' }
});

mongoose.model('Task', TaskSchema);
