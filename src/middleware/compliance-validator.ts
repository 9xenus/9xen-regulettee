import { Request, Response, NextFunction } from 'express';

/**
 * Validation Middleware for Compliance-related Data Writes
 */
export const validateComplianceData = (req: Request, res: Response, next: NextFunction) => {
  const { path, method } = req;

  // Only validate writes
  if (method !== 'POST' && method !== 'PATCH' && method !== 'PUT') {
    return next();
  }

  // 1. Whistleblower Report Validation
  if (path.includes('/whistleblower/reports') && method === 'POST') {
    const { category, title, description, priority } = req.body;
    if (!category || !title || !description || !priority) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required whistleblower fields (category, title, description, priority)' 
      });
    }
    
    if (typeof title !== 'string' || title.length < 5) {
      return res.status(400).json({ success: false, error: 'Title must be a string of at least 5 characters' });
    }
  }

  // 2. Audit Log Validation
  if (path.includes('/admin/audit-logs') && method === 'POST') {
    const { action_type, actor_id, service_module } = req.body;
    if (!action_type || !actor_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required audit log fields (action_type, actor_id)' 
      });
    }
  }

  // 3. Tenant Config Validation
  if (path.includes('/tenants') && (method === 'POST' || method === 'PATCH')) {
    const { name, organization_metadata } = req.body;
    if (method === 'POST' && !name) {
      return res.status(400).json({ success: false, error: 'Tenant name is required' });
    }
    
    if (organization_metadata && typeof organization_metadata !== 'object') {
      return res.status(400).json({ success: false, error: 'organization_metadata must be a JSON object' });
    }
  }

  // 4. Sanctions Watchlist Validation
  if (path.includes('/compliance/sanctions') && method === 'POST') {
    const { name, type, country, risk_score } = req.body;
    if (!name || !type || !country || !risk_score) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required sanctions fields (name, type, country, risk_score)' 
      });
    }
  }

  // 5. Routing Override Validation
  if (path.includes('/admin/tenants/') && path.endsWith('/routing') && method === 'PATCH') {
    const { regionCode } = req.body;
    const validRegions = ['EU', 'USA', 'CA', 'BR', 'AU'];
    if (!regionCode || !validRegions.includes(regionCode.toUpperCase())) {
      return res.status(400).json({ 
        success: false, 
        error: `Invalid regionCode. Must be one of: ${validRegions.join(', ')}` 
      });
    }
  }

  next();
};
