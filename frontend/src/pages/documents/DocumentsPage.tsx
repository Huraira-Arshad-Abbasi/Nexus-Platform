import React, { useEffect, useRef, useState } from 'react'
import { Upload, Trash2, Eye, PenTool, FileText, Download } from 'lucide-react'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { documentApi, Document } from '../../api/api'
import SignatureModal from './SignatureModal'

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<{
    url: string
    type: string
  } | null>(null)
  const [signDoc, setSignDoc] = useState<Document | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    documentApi
      .getDocuments()
      .then(({ data }) => setDocuments(data.documents))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('name', file.name)

    setUploading(true)
    try {
      const { data } = await documentApi.uploadDocument(formData)
      setDocuments(prev => [data.document, ...prev])
    } catch (err) {
      console.error(err)
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this document?')) return
    try {
      await documentApi.deleteDocument(id)
      setDocuments(prev => prev.filter(d => d._id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  const handleSignatureSave = async (docId: string, signatureUrl: string) => {
    try {
      const { data } = await documentApi.attachSignature(docId, signatureUrl)
      setDocuments(prev => prev.map(d => (d._id === docId ? data.document : d)))
      setSignDoc(null)
    } catch (err) {
      console.error(err)
    }
  }

  const handlePreview = (doc: Document) => {
    if (['jpg', 'jpeg', 'png', 'gif'].includes(doc.type.toLowerCase())) {
      // Images — show inline
      setPreviewUrl({ url: doc.url, type: 'image' })
    } else if (doc.type.toLowerCase() === 'pdf') {
      // PDF — open directly in new tab (most reliable)
      window.open(doc.url, '_blank')
    } else {
      // docx/xlsx — Google Docs viewer
      window.open(
        `https://docs.google.com/viewer?url=${encodeURIComponent(doc.url)}`,
        '_blank'
      )
    }
  }

  const getTypeColor = (type: string) => {
    if (type === 'pdf') return 'error'
    if (['doc', 'docx'].includes(type)) return 'primary'
    return 'gray'
  }

  return (
    <div className='space-y-6 animate-fade-in'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Documents</h1>
          <p className='text-gray-600'>
            Upload, manage and sign your documents
          </p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type='file'
            accept='.pdf,.doc,.docx,.png,.jpg,.jpeg'
            className='hidden'
            onChange={handleUpload}
          />
          <Button
            leftIcon={<Upload size={18} />}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-3 gap-4'>
        {[
          { label: 'Total', value: documents.length, color: 'text-gray-900' },
          {
            label: 'Signed',
            value: documents.filter(d => d.signatureUrl).length,
            color: 'text-green-600'
          },
          {
            label: 'Unsigned',
            value: documents.filter(d => !d.signatureUrl).length,
            color: 'text-yellow-600'
          }
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardBody className='p-4 text-center'>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className='text-sm text-gray-500'>{label}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Documents list */}
      <Card>
        <CardHeader>
          <h2 className='text-lg font-medium text-gray-900'>My Documents</h2>
        </CardHeader>
        <CardBody>
          {loading ? (
            <p className='text-center text-gray-500 py-8'>
              Loading documents...
            </p>
          ) : documents.length === 0 ? (
            <div className='text-center py-12'>
              <FileText size={48} className='mx-auto text-gray-300 mb-3' />
              <p className='text-gray-500'>No documents yet</p>
              <p className='text-sm text-gray-400 mt-1'>
                Upload your first document to get started
              </p>
            </div>
          ) : (
            <div className='space-y-3'>
              {documents.map(doc => (
                <div
                  key={doc._id}
                  className='flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'
                >
                  <div className='flex items-center gap-4'>
                    <div className='p-3 bg-primary-50 rounded-lg'>
                      <FileText size={22} className='text-primary-700' />
                    </div>
                    <div>
                      <h3 className='text-sm font-semibold text-gray-900'>
                        {doc.name}
                      </h3>
                      <div className='flex items-center gap-2 mt-1'>
                        <Badge variant={getTypeColor(doc.type)} size='sm'>
                          {doc.type.toUpperCase()}
                        </Badge>
                        <span className='text-xs text-gray-400'>
                          {doc.size}
                        </span>
                        <span className='text-xs text-gray-400'>
                          v{doc.version} •{' '}
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </span>
                        {doc.signatureUrl && (
                          <Badge variant='success' size='sm'>
                            ✓ Signed
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    {/* Preview */}
                    <Button
                      size='sm'
                      variant='outline'
                      leftIcon={<Eye size={14} />}
                      onClick={() => handlePreview(doc)}
                    >
                      Preview
                    </Button>

                    {/* Download */}
                    <a href={doc.url} target='_blank' rel='noreferrer' download>
                      <Button
                        size='sm'
                        variant='outline'
                        leftIcon={<Download size={14} />}
                      >
                        Download
                      </Button>
                    </a>

                    {/* Sign */}
                    {!doc.signatureUrl && (
                      <Button
                        size='sm'
                        variant='outline'
                        leftIcon={<PenTool size={14} />}
                        onClick={() => setSignDoc(doc)}
                      >
                        Sign
                      </Button>
                    )}

                    {/* Delete */}
                    <Button
                      size='sm'
                      variant='outline'
                      leftIcon={<Trash2 size={14} />}
                      onClick={() => handleDelete(doc._id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Preview Modal */}
      {previewUrl && (
        <div className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col'>
            <div className='flex items-center justify-between p-4 border-b'>
              <h2 className='text-lg font-semibold'>Image Preview</h2>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setPreviewUrl(null)}
              >
                Close
              </Button>
            </div>
            <div className='flex-1 overflow-auto p-4'>
              <img
                src={previewUrl.url}
                alt='Preview'
                className='w-full h-auto object-contain rounded'
              />
            </div>
          </div>
        </div>
      )}

      {/* Signature Modal */}
      {signDoc && (
        <SignatureModal
          document={signDoc}
          onClose={() => setSignDoc(null)}
          onSave={signatureUrl =>
            handleSignatureSave(signDoc._id, signatureUrl)
          }
        />
      )}
    </div>
  )
}
