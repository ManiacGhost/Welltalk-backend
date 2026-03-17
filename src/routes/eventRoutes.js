const express = require('express');
const { body } = require('express-validator');
const multer = require('multer');
const router = express.Router();
const eventController = require('../controllers/eventController');

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/events/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Validation middleware
const validateEvent = [
  body('title')
    .notEmpty()
    .withMessage('Event title is required')
    .isLength({ min: 5 })
    .withMessage('Title must be at least 5 characters'),
  body('description').notEmpty().withMessage('Event description is required'),
  body('eventDate').notEmpty().withMessage('Event date is required').isISO8601().withMessage('Invalid date format'),
  body('eventTime').notEmpty().withMessage('Event time is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('slug').optional().isSlug().withMessage('Invalid slug format'),
];

// Routes
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);
router.post(
  '/',
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'galleryImages', maxCount: 10 },
  ]),
  validateEvent,
  eventController.createEvent
);
router.put(
  '/:id',
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'galleryImages', maxCount: 10 },
  ]),
  validateEvent,
  eventController.updateEvent
);
router.delete('/:id', eventController.deleteEvent);

module.exports = router;
