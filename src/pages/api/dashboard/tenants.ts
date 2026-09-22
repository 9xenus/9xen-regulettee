import { Request, Response } from 'express';
import { prisma } from '../../../lib/prisma';

export async function getTenants(req: Request, res: Response) {
  try {
    const tenants = await prisma.tenant.findMany({
      include: { subscription: true }
    });
    res.json(tenants);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tenants' });
  }
}
