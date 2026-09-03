import Task from '../models/Task.js';
import Project from '../models/Project.js';
import { logActivity } from './projectController.js';

async function checkMembership(projectId, userId) {
  const project = await Project.findById(projectId);
  if (!project) return false;
  return (
    project.owner.toString() === userId.toString() ||
    project.members.some((m) => m.user.toString() === userId.toString())
  );
}

export async function getTasks(req, res) {
  const { projectId } = req.params;

  const isMember = await checkMembership(projectId, req.user._id);
  if (!isMember) {
    return res.status(403).json({ message: 'You do not have access to this project' });
  }

  const tasks = await Task.find({ project: projectId })
    .populate('assignee', 'name email avatarUrl jobTitle')
    .populate('createdBy', 'name email avatarUrl jobTitle')
    .sort({ position: 1, createdAt: 1 });

  res.json({ tasks });
}

export async function createTask(req, res) {
  const { projectId } = req.params;
  const { title, description, status, priority, assignee, dueDate } = req.body;

  const isMember = await checkMembership(projectId, req.user._id);
  if (!isMember) {
    return res.status(403).json({ message: 'You do not have access to this project' });
  }

  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'Task title is required' });
  }

  const maxPos = await Task.findOne({ project: projectId }).sort({ position: -1 }).select('position');
  const nextPos = maxPos ? maxPos.position + 1 : 1;

  const task = await Task.create({
    project: projectId,
    title: title.trim(),
    description: description || '',
    status: status || 'todo',
    priority: priority || 'medium',
    assignee: assignee || null,
    createdBy: req.user._id,
    dueDate: dueDate || null,
    position: nextPos,
  });

  await logActivity(projectId, req.user._id, 'task_created', 'task', task._id, { title: task.title });

  await task.populate('assignee', 'name email avatarUrl jobTitle');
  await task.populate('createdBy', 'name email avatarUrl jobTitle');

  res.status(201).json({ task });
}

export async function updateTask(req, res) {
  const { projectId, taskId } = req.params;
  const { title, description, status, priority, assignee, dueDate } = req.body;

  const isMember = await checkMembership(projectId, req.user._id);
  if (!isMember) {
    return res.status(403).json({ message: 'You do not have access to this project' });
  }

  const task = await Task.findById(taskId);
  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  if (task.project.toString() !== projectId) {
    return res.status(400).json({ message: 'Task does not belong to this project' });
  }

  const oldStatus = task.status;
  const oldAssignee = task.assignee ? task.assignee.toString() : null;

  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (status !== undefined) task.status = status;
  if (priority !== undefined) task.priority = priority;
  if (assignee !== undefined) task.assignee = assignee || null;
  if (dueDate !== undefined) task.dueDate = dueDate || null;

  await task.save();
  await task.populate('assignee', 'name email avatarUrl jobTitle');
  await task.populate('createdBy', 'name email avatarUrl jobTitle');

  if (status !== undefined && status !== oldStatus) {
    const action = status === 'done' ? 'task_completed' : 'task_updated';
    await logActivity(projectId, req.user._id, action, 'task', task._id, {
      title: task.title,
      oldStatus,
      newStatus: status,
    });
  }

  if (assignee !== undefined && assignee !== oldAssignee && assignee) {
    await logActivity(projectId, req.user._id, 'task_assigned', 'task', task._id, {
      title: task.title,
    });
  }

  res.json({ task });
}

export async function deleteTask(req, res) {
  const { projectId, taskId } = req.params;

  const isMember = await checkMembership(projectId, req.user._id);
  if (!isMember) {
    return res.status(403).json({ message: 'You do not have access to this project' });
  }

  const task = await Task.findById(taskId);
  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  if (task.project.toString() !== projectId) {
    return res.status(400).json({ message: 'Task does not belong to this project' });
  }

  const isOwner = await Project.findOne({ _id: projectId, owner: req.user._id });
  if (!isOwner && task.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'You can only delete tasks you created' });
  }

  await task.deleteOne();
  res.json({ message: 'Task deleted' });
}

export async function getTaskCounts(req, res) {
  const projectIds = await Project.find({
    $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
  }).distinct('_id');

  const tasks = await Task.find({ project: { $in: projectIds } }).select('status');

  const counts = {
    backlog: 0,
    todo: 0,
    in_progress: 0,
    review: 0,
    done: 0,
  };

  tasks.forEach((t) => {
    counts[t.status] = (counts[t.status] || 0) + 1;
  });

  res.json({ counts, total: tasks.length });
}
