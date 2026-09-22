export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    res.status(200).json({
      checklist: [
        { id: 1, label: "Enable Multi-Region Failover", done: false },
        { id: 2, label: "Draft Article 28 DPA Document", done: true },
        { id: 3, label: "Review cookie consent layout", done: false },
        { id: 4, label: "Complete quarterly Model audit", done: true },
      ]
    });
  } else {
    res.status(405).end();
  }
}
