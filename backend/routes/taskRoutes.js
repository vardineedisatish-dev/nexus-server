import { Router } from 'express';
import { getTasks, createTask, updateTask, deleteTask, getTaskCounts } from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/counts', getTaskCounts);
router.get('/:projectId', getTasks);
router.post('/:projectId', createTask);
router.patch('/:projectId/:taskId', updateTask);
router.delete('/:projectId/:taskId', deleteTask);

export default router;
