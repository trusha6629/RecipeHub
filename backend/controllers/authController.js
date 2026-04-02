const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    const user = await User.create({ name, email, password });

    return res.status(201).json({
      message: 'Registration successful.',
      token: generateToken(user._id),
      user: user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    return res.json({
      message: 'Login successful.',
      token: generateToken(user._id),
      user: user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.json(user.toSafeObject());
  } catch (error) {
    next(error);
  }
};

const toggleFollowCreator = async (req, res, next) => {
  try {
    const { creatorId } = req.params;

    if (req.user._id.toString() === creatorId) {
      return res.status(400).json({ message: 'You cannot follow your own profile.' });
    }

    const creator = await User.findById(creatorId);
    if (!creator) {
      return res.status(404).json({ message: 'Creator not found.' });
    }

    const user = await User.findById(req.user._id);
    const existingIndex = user.followingCreators.findIndex((id) => id.toString() === creatorId);

    if (existingIndex >= 0) {
      user.followingCreators.splice(existingIndex, 1);
    } else {
      user.followingCreators.push(creatorId);
    }

    await user.save();

    return res.json({
      message: existingIndex >= 0 ? 'Creator unfollowed.' : 'Creator followed.',
      user: user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  toggleFollowCreator
};
