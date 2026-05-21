import React, { useRef, useState } from 'react'
import { X, RotateCcw, Check } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Document } from '../../api/api'

interface Props {
  document: Document
  onClose: () => void
  onSave: (signatureUrl: string) => void
}

const SignatureModal: React.FC<Props> = ({ document, onClose, onSave }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect()
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      }
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const pos = getPos(e, canvas)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
    setIsDrawing(true)
    setHasSignature(true)
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const pos = getPos(e, canvas)
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#1a1a1a'
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
  }

  const stopDraw = () => setIsDrawing(false)

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx?.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
  }

  const handleSave = async () => {
    const canvas = canvasRef.current
    if (!canvas || !hasSignature) return
    setSaving(true)
    try {
      // Convert canvas to base64 image
      const signatureUrl = canvas.toDataURL('image/png')
      onSave(signatureUrl)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Sign Document</h2>
            <p className="text-sm text-gray-500 mt-0.5">{document.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Signature pad */}
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-3">
            Draw your signature below:
          </p>
          <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50">
            <canvas
              ref={canvasRef}
              width={460}
              height={200}
              className="w-full touch-none cursor-crosshair"
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={stopDraw}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Draw your signature with mouse or touch
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t">
          <Button
            variant="outline"
            leftIcon={<RotateCcw size={16} />}
            onClick={clearSignature}
          >
            Clear
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              leftIcon={<Check size={16} />}
              onClick={handleSave}
              disabled={!hasSignature || saving}
            >
              {saving ? 'Saving...' : 'Apply Signature'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignatureModal