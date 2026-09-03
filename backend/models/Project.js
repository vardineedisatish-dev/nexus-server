import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    color: { type: String, default: 'blue' },
    icon: { type: String, default: 'FolderKanban' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['owner', 'member'], default: 'member' },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

projectSchema.methods.toJSON = function () {
  const obj = this.toObject({ virtuals: true });
  obj.id = obj._id;
  return obj;
};

export default mongoose.model('Project', projectSchema);
