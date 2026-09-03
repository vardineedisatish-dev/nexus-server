import mongoose from 'mongoose';

const VALID_ACTIONS = [
  'task_created',
  'task_updated',
  'task_completed',
  'task_assigned',
  'comment_added',
  'project_created',
  'member_added',
];

const activitySchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, enum: VALID_ACTIONS, required: true },
    entityType: { type: String, default: null },
    entityId: { type: mongoose.Schema.Types.ObjectId, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

activitySchema.methods.toJSON = function () {
  const obj = this.toObject({ virtuals: true });
  obj.id = obj._id;
  return obj;
};

export default mongoose.model('Activity', activitySchema);
