import React, { useRef, useState } from 'react'
import { apiService } from '../../services/api'

interface SignatureCaptureProps {
  documentType: string
  documentId: number
  signatureType?: 'approval' | 'acknowledgment' | 'consent'
  onSigned?: () => void
}

export const SignatureCapture: React.FC<SignatureCaptureProps> = ({
  documentType,
  documentId,
  signatureType = 'approval',
  onSigned,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
    setIsDrawing(true)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const saveSignature = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Check if canvas is empty
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const isEmpty = imageData.data.every((channel) => channel === 0)

    if (isEmpty) {
      setMessage({ type: 'error', text: 'Please provide a signature' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      // Convert canvas to base64
      const signatureData = canvas.toDataURL('image/png')

      await apiService.createSignature({
        document_type: documentType,
        document_id: documentId,
        signature_type: signatureType,
        signature_data: signatureData,
      })

      setMessage({ type: 'success', text: 'Signature saved successfully!' })
      if (onSigned) {
        onSigned()
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to save signature. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  // Initialize canvas
  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [])

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Electronic Signature</h3>

      <div className="mb-4">
        <canvas
          ref={canvasRef}
          width={600}
          height={200}
          className="border-2 border-gray-300 rounded cursor-crosshair w-full"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>

      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={clearSignature}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={saveSignature}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Signature'}
        </button>
      </div>

      {message && (
        <div
          className={`px-4 py-3 rounded ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <p className="text-sm text-gray-500 mt-4">
        Draw your signature above, then click "Save Signature" to submit.
      </p>
    </div>
  )
}



