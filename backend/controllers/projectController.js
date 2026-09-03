import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Activity from '../models/Activity.js';

async function logActivity(projectId, userId, action, entityType, entityId, metadata = {}) {
  await Activity.create({
    project: projectId,
    user: userId,
    action,
    entityType,
    entityId,
    metadata,
  });
}

export async function getProjects(req, res) {
  const projects = await Project.find({
    $or: [
      { owner: req.user._id },
      { 'members.user': req.user._id },
    ],
  })
    .populate('owner', 'name email avatarUrl jobTitle')
    .sort({ updatedAt: -1 });

  const withCounts = await Promise.all(
    projects.map(async (p) => {
      const taskCount = await Task.countDocuments({ project: p._id });
      return { ...p.toJSON(), taskCount, memberCount: p.members.length };
    }),
  );

  res.json({ projects: withCounts });
}

export async function getProject(req, res) {
  const project = await Project.findById(req.params.id).populate(
    'owner',
    'name email avatarUrl jobTitle',
  );

  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  const isMember =
    project.owner._id.toString() === req.user._id.toString() ||
    project.members.some((m) => m.user.toString() === req.user._id.toString());

  if (!isMember) {
    return res.status(403).json({ message: 'You do not have access to this project' });
  }

  const taskCount = await Task.countDocuments({ project: project._id });
  res.json({ project: { ...project.toJSON(), taskCount, memberCount: project.members.length } });
}

export async function createProject(req, res) {
  const { name, description, color, icon } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Project name is required' });
  }

  const project = await Project.create({
    name: name.trim(),
    description: description || '',
    color: color || 'blue',
    icon: icon || 'FolderKanban',
    owner: req.user._id,
    members: [{ user: req.user._id, role: 'owner' }],
  });

  await logActivity(project._id, req.user._id, 'project_created', 'project', project._id, {
    name: project.name,
  });

  await project.populate('owner', 'name email avatarUrl jobTitle');
  res.status(201).json({ project: { ...project.toJSON(), taskCount: 0, memberCount: 1 } });
}

export async function updateProject(req, res) {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  if (project.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Only the project owner can make changes' });
  }

  const { name, description, color, icon } = req.body;
  if (name !== undefined) project.name = name;
  if (description !== undefined) project.description = description;
  if (color !== undefined) project.color = color;
  if (icon !== undefined) project.icon = icon;

  await project.save();
  await project.populate('owner', 'name email avatarUrl jobTitle');
  res.json({ project: project.toJSON() });
}

export async function deleteProject(req, res) {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  if (project.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Only the project owner can delete the project' });
  }

  await Task.deleteMany({ project: project._id });
  await Activity.deleteMany({ project: project._id });
  await project.deleteOne();
  res.json({ message: 'Project deleted' });
}

export async function getMembers(req, res) {
  const project = await Project.findById(req.params.id).populate(
    'members.user',
    'name email avatarUrl jobTitle',
  );

  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  const isMember =
    project.owner.toString() === req.user._id.toString() ||
    project.members.some((m) => m.user._id?.toString() === req.user._id.toString());

  if (!isMember) {
    return res.status(403).json({ message: 'You do not have access to this project' });
  }

  const members = project.members.map((m) => ({
    id: m._id,
    user: m.user,
    role: m.role,
    joinedAt: m.joinedAt,
  }));

  res.json({ members });
}

export async function addMember(req, res) {
  const { userId } = req.body;
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  if (project.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Only the project owner can add members' });
  }

  if (!userId) {
    return res.status(400).json({ message: 'userId is required' });
  }

  const already = project.members.some((m) => m.user.toString() === userId);
  if (already) {
    return res.status(409).json({ message: 'User is already a member' });
  }

  project.members.push({ user: userId, role: 'member' });
  await project.save();

  await logActivity(project._id, req.user._id, 'member_added', 'user', userId, {});
  res.status(201).json({ message: 'Member added' });
}

export async function removeMember(req, res) {
  const { userId } = req.params;
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  if (project.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Only the project owner can remove members' });
  }

  project.members = project.members.filter((m) => m.user.toString() !== userId);
  await project.save();
  res.json({ message: 'Member removed' });
}

export { logActivity };
