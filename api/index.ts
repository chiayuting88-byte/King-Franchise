import { Router } from 'express';
import { healthHandler } from './health.js';
import { holidaysHandler } from './holidays.js';

const apiRouter = Router();

// Health check endpoint: GET /api/health
apiRouter.get('/health', healthHandler);

// Public Holidays endpoints:
// GET /api/holidays (defaults to 2026 and SG, or ?year=2026&countryCode=SG)
apiRouter.get('/holidays', holidaysHandler);

// GET /api/public-holidays/:year?/:countryCode?
apiRouter.get('/public-holidays/:year?/:countryCode?', holidaysHandler);

export { apiRouter, healthHandler, holidaysHandler };
export default apiRouter;
