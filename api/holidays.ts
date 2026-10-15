import type { Request, Response } from 'express';

export interface PublicHoliday {
  date: string; // YYYY-MM-DD
  localName: string;
  name: string;
  countryCode: string;
  fixed: boolean;
  global: boolean;
  counties: string[] | null;
  launchYear: number | null;
  types: string[];
}

/**
 * Serverless connector for Nager.Date Public Holidays API
 * Default endpoint requested: GET https://date.nager.at/api/v3/PublicHolidays/2026/SG
 * Keys are NOT hardcoded - reads from environment variables if set by the user.
 */
export async function holidaysHandler(req: Request, res: Response) {
  try {
    const year = (req.query.year as string) || (req.params.year as string) || '2026';
    const countryCode = ((req.query.countryCode as string) || (req.params.countryCode as string) || 'SG').toUpperCase();

    // Base URL configurable via environment variable without hardcoded keys
    const baseUrl = process.env.NAGER_API_BASE_URL || 'https://date.nager.at/api/v3';
    const targetUrl = `${baseUrl}/PublicHolidays/${encodeURIComponent(year)}/${encodeURIComponent(countryCode)}`;

    // Optional API key or bearer headers from environment (not hardcoded)
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'User-Agent': 'ShiftFlow-StaffScheduling/1.0',
    };

    const apiKey = process.env.NAGER_DATE_API_KEY || process.env.NAGER_API_KEY;
    if (apiKey) {
      headers['X-API-KEY'] = apiKey;
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: `Nager.date API returned status ${response.status}`,
        details: errorText,
        requestedUrl: targetUrl,
      });
    }

    const holidays: PublicHoliday[] = await response.json();

    // Cache-Control header for performance
    res.setHeader('Cache-Control', 'public, s-maxage=3600, max-age=1800');
    return res.status(200).json(holidays);
  } catch (error: any) {
    console.error('Error fetching public holidays from Nager.date:', error);
    return res.status(502).json({
      error: 'Failed to connect to Nager.date upstream service',
      message: error?.message || 'Network request failed or timed out',
      requestedYear: req.query.year || '2026',
      requestedCountry: req.query.countryCode || 'SG',
    });
  }
}

export default holidaysHandler;
