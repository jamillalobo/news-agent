import express from 'express';
import { AgentController } from '../controllers/agentController';

const router = express.Router();
const agentController = new AgentController();

router.post('/agent', agentController.handleAgentRequest.bind(agentController));

export default router;