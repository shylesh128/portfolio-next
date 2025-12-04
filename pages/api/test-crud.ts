import type { NextApiRequest, NextApiResponse } from 'next';

// In-memory storage for demonstration purposes
// Note: This data will not persist across server restarts or different serverless function invocations
let items: { id: number; name: string }[] = [
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' },
];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      // Get all items
      res.status(200).json(items);
      break;

    case 'POST':
      // Create a new item
      const { name } = req.body;
      if (!name) {
        res.status(400).json({ error: 'Name is required' });
        return;
      }
      const newItem = {
        id: Date.now(),
        name,
      };
      items.push(newItem);
      res.status(201).json(newItem);
      break;

    case 'PUT':
      // Update an item
      const { id, name: newName } = req.body;
      if (!id || !newName) {
        res.status(400).json({ error: 'ID and Name are required' });
        return;
      }
      const index = items.findIndex((item) => item.id === Number(id));
      if (index > -1) {
        items[index].name = newName;
        res.status(200).json(items[index]);
      } else {
        res.status(404).json({ error: 'Item not found' });
      }
      break;

    case 'DELETE':
      // Delete an item
      const { id: deleteId } = req.query;
      if (!deleteId) {
        res.status(400).json({ error: 'ID is required' });
        return;
      }
      items = items.filter((item) => item.id !== Number(deleteId));
      res.status(200).json({ message: 'Item deleted' });
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
