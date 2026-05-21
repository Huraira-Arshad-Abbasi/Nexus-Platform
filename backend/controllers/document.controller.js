import Document from '../models/Document.model.js'
import cloudinary from '../config/cloudinary.js'

// POST /api/documents/upload
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: 'No file uploaded' })

    const { originalname, path, filename, size } = req.file
    const ext = originalname.split('.').pop()

    const doc = await Document.create({
      name: req.body.name || originalname,
      url: path,           // cloudinary URL
      publicId: filename,  // cloudinary public_id
      type: ext,
      size: `${(size / 1024).toFixed(1)} KB`,
      uploadedBy: req.user.id,
    })

    await doc.populate('uploadedBy', 'name email avatarUrl')
    res.status(201).json({ document: doc })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// GET /api/documents
export const getDocuments = async (req, res) => {
  try {
    const docs = await Document.find({ uploadedBy: req.user.id })
      .populate('uploadedBy', 'name email avatarUrl')
      .populate('signedBy', 'name email')
      .sort({ createdAt: -1 })

    res.json({ documents: docs })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// DELETE /api/documents/:id
export const deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id)
    if (!doc) return res.status(404).json({ message: 'Document not found' })

    if (doc.uploadedBy.toString() !== req.user.id)
      return res.status(403).json({ message: 'Forbidden' })

    await cloudinary.uploader.destroy(doc.publicId, { resource_type: 'raw' })
    await doc.deleteOne()
    res.json({ message: 'Document deleted' })
  } catch (err) {
    console.error('DELETE ERROR:', err.message) // ← exact error here
    res.status(500).json({ message: err.message })
  }
}
// POST /api/documents/:id/signature
export const attachSignature = async (req, res) => {
  try {
    const { signatureUrl } = req.body
    if (!signatureUrl)
      return res.status(400).json({ message: 'Signature URL required' })

    const doc = await Document.findById(req.params.id)
    if (!doc) return res.status(404).json({ message: 'Document not found' })

    doc.signatureUrl = signatureUrl
    doc.signedBy = req.user.id
    doc.signedAt = new Date()
    await doc.save()

    await doc.populate('uploadedBy', 'name email avatarUrl')
    await doc.populate('signedBy', 'name email')

    res.json({ document: doc })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}