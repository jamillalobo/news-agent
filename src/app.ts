import express from 'express';
import bodyParser from 'body-parser';
import { errorHandler } from './middlewares/errorHandler';
import agentRoute from './routes/agentRoute';

const app = express();

app.use(bodyParser.json());
app.use('/api', agentRoute);
app.use(errorHandler);

export default app;