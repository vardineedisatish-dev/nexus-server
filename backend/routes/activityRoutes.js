import { Router } from 'express';
import { getActivity } from '../controllers/activityController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/:projectId', getActivity);

export default router;
