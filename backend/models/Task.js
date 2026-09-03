import mongoose from 'mongoose';

const VALID_STATUSES = ['backlog', 'todo', 'in_progress', 'review', 'done'];
const VALID_PRIORITIES = ['low', 'medium', 'high', 'urgent'];

const taskSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: { type: String, enum: VALID_STATUSES, default: 'todo' },
    priority: { type: String, enum: VALID_PRIORITIES, default: 'medium' },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    position: { type: Number, default: 0 },
    dueDate: { type: Date, default: null },
  },
  { timestamps: true },
);

taskSchema.methods.toJSON = function () {
  const obj = this.toObject({ virtuals: true });
  obj.id = obj._id;
  if (obj.dueDate) obj.dueDate = obj.dueDate.toISOString().split('T')[0];
  return obj;
};

export default mongoose.model('Task', taskSchema);
