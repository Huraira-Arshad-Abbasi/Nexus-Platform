import { body, validationResult } from 'express-validator'

// Reusable error handler
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
    })
  }
  next()
}

// Register validation
export const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters')
    .escape(), // prevents XSS

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase and a number'),

  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['entrepreneur', 'investor']).withMessage('Invalid role'),

  handleValidationErrors,
]

// Login validation
export const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required'),

  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['entrepreneur', 'investor']).withMessage('Invalid role'),

  handleValidationErrors,
]

// Profile update validation
export const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters')
    .escape(),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Bio max 500 characters')
    .escape(),

  body('startupName')
    .optional()
    .trim()
    .escape(),

  body('industry')
    .optional()
    .trim()
    .escape(),

  body('fundingNeeded')
    .optional()
    .trim()
    .escape(),

  handleValidationErrors,
]

// Meeting validation
export const validateMeeting = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 100 }).withMessage('Title max 100 characters')
    .escape(),

  body('scheduledWith')
    .notEmpty().withMessage('Participant is required')
    .isMongoId().withMessage('Invalid participant ID'),

  body('date')
    .notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Invalid date format')
    .custom(value => {
      if (new Date(value) <= new Date())
        throw new Error('Meeting date must be in the future')
      return true
    }),

  body('duration')
    .optional()
    .isInt({ min: 15, max: 120 }).withMessage('Duration must be 15-120 minutes'),

  handleValidationErrors,
]

// Payment validation
export const validatePayment = [
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 1 }).withMessage('Amount must be at least $1'),

  handleValidationErrors,
]

// OTP validation
export const validateOTP = [
  body('otp')
    .notEmpty().withMessage('OTP is required')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
    .isNumeric().withMessage('OTP must be numeric'),

  handleValidationErrors,
]