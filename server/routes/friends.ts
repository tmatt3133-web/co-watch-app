import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { dbRun, dbGet, dbAll } from '../database/init.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;

    const friends = await dbAll(`
      SELECT u.id, u.username, 'offline' as status
      FROM users u
      JOIN friendships f ON (f.friend_id = u.id AND f.user_id = ?)
      WHERE f.status = 'accepted'
      UNION
      SELECT u.id, u.username, 'offline' as status
      FROM users u
      JOIN friendships f ON (f.user_id = u.id AND f.friend_id = ?)
      WHERE f.status = 'accepted'
    `, [userId, userId]);

    res.json({ friends });
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/add', async (req: AuthenticatedRequest, res) => {
  try {
    const { username } = req.body;
    const userId = req.user!.id;

    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    const friendUser = await dbGet('SELECT id FROM users WHERE username = ?', [username]);
    if (!friendUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (friendUser.id === userId) {
      return res.status(400).json({ message: 'Cannot add yourself as a friend' });
    }

    const existingFriendship = await dbGet(
      'SELECT id FROM friendships WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)',
      [userId, friendUser.id, friendUser.id, userId]
    );

    if (existingFriendship) {
      return res.status(400).json({ message: 'Friendship already exists' });
    }

    const friendshipId = uuidv4();
    await dbRun(
      'INSERT INTO friendships (id, user_id, friend_id, status) VALUES (?, ?, ?, ?)',
      [friendshipId, userId, friendUser.id, 'accepted']
    );

    res.status(201).json({ message: 'Friend added successfully' });
  } catch (error) {
    console.error('Error adding friend:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:friendId', async (req: AuthenticatedRequest, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user!.id;

    await dbRun(
      'DELETE FROM friendships WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)',
      [userId, friendId, friendId, userId]
    );

    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    console.error('Error removing friend:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;