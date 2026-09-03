import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

commentSchema.methods.toJSON = function () {
  const obj = this.toObject({ virtuals: true });
  obj.id = obj._id;
  return obj;
};

export default mongoose.model('Comment', commentSchema);
