export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    try {
      res.status(200).json({
        success: true,
        data: {
          flowId: 'cf-999',
          status: 'ACTIVE',
          requirements: [
            { id: 'req-1', type: 'AgeGate', satisfied: true }
          ]
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
