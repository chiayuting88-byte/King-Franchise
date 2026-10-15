import type { Request, Response } from 'express';

export interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
  service: string;
  apiEndpoints: {
    health: string;
    publicHolidays: string;
  };
}

/**
 * Serverless health check handler
 * GET /api/health
 */
export async function healthHandler(req: Request, res: Response) {
  try {
    const healthData: HealthCheckResponse = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      service: 'ShiftFlow API & Nager.date Live Connector',
      apiEndpoints: {
        health: '/api/health',
        publicHolidays: '/api/holidays?year=2026&countryCode=SG',
      },
    };

    res.status(200).json(healthData);
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: error?.message || 'Internal health check failure',
    });
  }
}

export default healthHandler;
