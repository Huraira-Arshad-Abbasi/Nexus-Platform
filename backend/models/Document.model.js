import mongoose from 'mongoose'

const documentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  publicId: { type: String, required: true }, // cloudinary public_id for deletion
  type: { type: String, required: true },     // pdf, docx, image etc
  size: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['draft', 'active', 'archived'], default: 'active' },
  version: { type: Number, default: 1 },
  signatureUrl: { type: String, default: '' }, // e-signature image URL
  signedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  signedAt: { type: Date, default: null },
}, { timestamps: true })

const Document = mongoose.model('Document', documentSchema)
export default Document