import Comment from '../models/Comment.js';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import { logActivity } from './projectController.js';

async function checkTaskAccess(taskId, userId) {
  const task = await Task.findById(taskId);
  if (!task) return { task: null, allowed: false };

  const project = await Project.findById(task.project);
  if (!project) return { task: null, allowed: false };

  const allowed =
    project.owner.toString() === userId.toString() ||
    project.members.some((m) => m.user.toString() === userId.toString());

  return { task, allowed };
}

export async function getComments(req, res) {
  const { taskId } = req.params;

  const { allowed } = await checkTaskAccess(taskId, req.user._id);
  if (!allowed) {
    return res.status(403).json({ message: 'You do not have access to this task' });
  }

  const comments = await Comment.find({ task: taskId })
    .populate('user', 'name email avatarUrl jobTitle')
    .sort({ createdAt: 1 });

  res.json({ comments });
}

export async function addComment(req, res) {
  const { taskId } = req.params;
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ message: 'Comment content is required' });
  }

  const { task, allowed } = await checkTaskAccess(taskId, req.user._id);
  if (!allowed) {
    return res.status(403).json({ message: 'You do not have access to this task' });
  }

  const comment = await Comment.create({
    task: taskId,
    user: req.user._id,
    content: content.trim(),
  });

  await logActivity(task.project, req.user._id, 'comment_added', 'task', task._id, {
    title: task.title,
  });

  await comment.populate('user', 'name email avatarUrl jobTitle');
  res.status(201).json({ comment });
}

export async function deleteComment(req, res) {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    return res.status(404).json({ message: 'Comment not found' });
  }

  if (comment.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'You can only delete your own comments' });
  }

  await comment.deleteOne();
  res.json({ message: 'Comment deleted' });
}
