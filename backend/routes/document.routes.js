import express from 'express'
import authMiddleware from '../middleware/auth.middleware.js'
import { upload } from '../config/cloudinary.js'
import {
  uploadDocument,
  getDocuments,
  deleteDocument,
  attachSignature,
} from '../controllers/document.controller.js'

const router = express.Router()
router.use(authMiddleware)

router.get('/', getDocuments)
router.post('/upload', upload.single('file'), uploadDocument)
router.delete('/:id', deleteDocument)
router.post('/:id/signature', attachSignature)

export default router