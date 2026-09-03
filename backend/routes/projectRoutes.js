import { Router } from 'express';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getMembers,
  addMember,
  removeMember,
} from '../controllers/projectController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/', getProjects);
router.post('/', createProject);
router.get('/:id', getProject);
router.patch('/:id', updateProject);
router.delete('/:id', deleteProject);
router.get('/:id/members', getMembers);
router.post('/:id/members', addMember);
router.delete('/:id/members/:userId', removeMember);

export default router;
