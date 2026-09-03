import { Router } from 'express';
import { getComments, addComment, deleteComment } from '../controllers/commentController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/:taskId', getComments);
router.post('/:taskId', addComment);
router.delete('/:commentId', deleteComment);

export default router;
