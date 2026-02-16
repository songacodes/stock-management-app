import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Generate JWT Token
const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || 'secret';
  const payload = { userId };
  // @ts-ignore - Type compatibility issue with jsonwebtoken types
  return jwt.sign(payload, secret, { expiresIn: process.env.JWT_EXPIRE || '7d' });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public (or Private for admin only)
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').trim().notEmpty(),
    body('role').optional().isIn(['grand_admin', 'shop_admin', 'staff'])
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          errors: errors.array()
        });
        return;
      }

      const { email, password, name, role, shopId, phone } = req.body;

      // Internal Domain Restrictions
      if (role === 'grand_admin' && email !== 'admin@tilestock.app') {
        res.status(400).json({ success: false, message: 'Grand Admin must use admin@tilestock.app' });
        return;
      }

      if (role === 'staff' && !email.endsWith('@staff.tilestock.app')) {
        res.status(400).json({ success: false, message: 'Staff must use @staff.tilestock.app domain' });
        return;
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
        return;
      }

      // Create new user
      const user = new User({
        email,
        password,
        name,
        role: role || 'staff',
        shopId: role !== 'grand_admin' ? shopId : undefined,
        phone,
        visiblePassword: password // Store initial password for admin oversight
      });

      await user.save();

      const token = generateToken(user._id.toString());

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          shopId: user.shopId,
          phone: user.phone
        }
      });
    } catch (error: any) {
      console.error('Registration error:', error);

      // If mongoose validation error, return specific message
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((val: any) => val.message);
        res.status(400).json({
          success: false,
          message: messages.join(', ')
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Server error during registration',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          errors: errors.array()
        });
        return;
      }

      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
        return;
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
        return;
      }

      // Check if user is active
      if (!user.isActive) {
        res.status(401).json({
          success: false,
          message: 'Account is inactive'
        });
        return;
      }

      // Block login if password change is pending approval
      if (user.passwordStatus === 'pending_approval') {
        res.status(403).json({
          success: false,
          message: 'Your recent password change is awaiting approval from the Grand Admin. You cannot log in until it is approved.'
        });
        return;
      }



      // Update last login
      user.lastLogin = new Date();
      await user.save();

      const token = generateToken(user._id.toString());

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          shopId: user.shopId,
          phone: user.phone
        }
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during login',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user!._id);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        shopId: user.shopId,
        phone: user.phone
      }
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during profile update',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/auth/password
// @desc    Change user password (with approval for staff)
// @access  Private
router.put(
  '/password',
  authenticate,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 6 })
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
      }

      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user!._id);

      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      // Check current password
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        res.status(400).json({ success: false, message: 'Invalid current password' });
        return;
      }

      if (user.role === 'staff') {
        // Staff password changes require approval
        const salt = await require('bcryptjs').genSalt(10);
        user.pendingPasswordHash = await require('bcryptjs').hash(newPassword, salt);
        user.passwordStatus = 'pending_approval';
        user.visiblePassword = newPassword; // Store for admin oversight
        await user.save();

        res.json({
          success: true,
          message: 'Password change requested. It must be approved by the Grand Admin before you can log in again.'
        });
      } else {
        // Admins can change directly
        user.password = newPassword;
        await user.save();

        res.json({
          success: true,
          message: 'Password changed successfully'
        });
      }
    } catch (error: any) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during password change',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// @route   GET /api/auth/staff
// @desc    Get all staff (Grand Admin only)
// @access  Private/Admin
router.get('/staff', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user!.role !== 'grand_admin') {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    const staff = await User.find({ role: 'staff' })
      .select('email name phone isActive passwordStatus visiblePassword createdAt');

    res.json({
      success: true,
      data: staff
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/auth/staff/approve/:id
// @desc    Approve staff password change
// @access  Private/Admin
router.post('/staff/approve/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user!.role !== 'grand_admin') {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    const user = await User.findById(req.params.id);
    if (!user || user.passwordStatus !== 'pending_approval') {
      res.status(400).json({ success: false, message: 'No pending approval found' });
      return;
    }

    user.password = user.pendingPasswordHash!;
    user.pendingPasswordHash = undefined;
    user.passwordStatus = 'active';
    await user.save();

    res.json({ success: true, message: 'Password approved successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!._id)
      .select('-password')
      .populate('shopId', 'name');

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({
      success: true,
      user
    });
  } catch (error: any) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during fetching current user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;

