import Activity from '../models/Activity.js';
import Project from '../models/Project.js';

export async function getActivity(req, res) {
  const { projectId } = req.params;

  const project = await Project.findById(projectId);
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  const isMember =
    project.owner.toString() === req.user._id.toString() ||
    project.members.some((m) => m.user.toString() === req.user._id.toString());

  if (!isMember) {
    return res.status(403).json({ message: 'You do not have access to this project' });
  }

  const limit = parseInt(req.query.limit) || 30;

  const activity = await Activity.find({ project: projectId })
    .populate('user', 'name email avatarUrl jobTitle')
    .sort({ createdAt: -1 })
    .limit(limit);

  res.json({ activity });
}
