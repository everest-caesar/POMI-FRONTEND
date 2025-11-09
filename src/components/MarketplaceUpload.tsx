import { useState, useRef, useCallback } from 'react'
import axios from 'axios'

interface UploadProgress {
  [key: string]: number
}

interface MarketplaceUploadProps {
  listingId?: string
  onUploadComplete?: (imageUrls: string[]) => void
  maxFiles?: number
  maxFileSize?: number // in MB
}

export default function MarketplaceUpload({
  listingId,
  onUploadComplete,
  maxFiles = 5,
  maxFileSize = 10,
}: MarketplaceUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<{ file: File; preview: string }[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({})
  const [error, setError] = useState('')
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([])

  // Generate preview for selected files
  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files) return

      setError('')
      const newFiles = Array.from(files)

      // Validate file count
      if (selectedFiles.length + newFiles.length > maxFiles) {
        setError(`Maximum ${maxFiles} files allowed`)
        return
      }

      // Validate each file
      const validFiles: File[] = []
      for (const file of newFiles) {
        // Check file size
        if (file.size > maxFileSize * 1024 * 1024) {
          setError(
            `File "${file.name}" exceeds ${maxFileSize}MB limit`
          )
          continue
        }

        // Check file type
        if (!file.type.startsWith('image/')) {
          setError(`File "${file.name}" is not an image`)
          continue
        }

        validFiles.push(file)

        // Create preview
        const reader = new FileReader()
        reader.onload = (e) => {
          setPreviews((prev) => [
            ...prev,
            { file, preview: e.target?.result as string },
          ])
        }
        reader.readAsDataURL(file)
      }

      setSelectedFiles((prev) => [...prev, ...validFiles])
    },
    [selectedFiles, maxFiles, maxFileSize]
  )

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one image')
      return
    }

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      selectedFiles.forEach((file) => {
        formData.append('images', file)
      })

      if (listingId) {
        formData.append('listingId', listingId)
      }

      const token = localStorage.getItem('token')

      const response = await axios.post(
        '/api/v1/marketplace/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            )
            setUploadProgress({
              total: percentCompleted,
            })
          },
        }
      )

      const urls = response.data.images || []
      setUploadedUrls(urls)
      setSelectedFiles([])
      setPreviews([])
      setUploadProgress({})

      if (onUploadComplete) {
        onUploadComplete(urls)
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error || err.message || 'Failed to upload images'
      )
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
        className="relative border-2 border-dashed border-gray-300 hover:border-red-500 rounded-xl p-8 text-center cursor-pointer transition-all bg-gradient-to-br from-gray-50 to-gray-100 hover:from-red-50 hover:to-red-100 group"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={uploading}
        />

        <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">
          📸
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Drag images here or click to browse
        </h3>
        <p className="text-gray-600 mb-3">
          Upload up to {maxFiles} images ({maxFileSize}MB each)
        </p>
        <p className="text-sm text-gray-500">
          Supported formats: JPG, PNG, WebP, GIF
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 border-l-4 border-l-red-600 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      {/* Preview Gallery */}
      {previews.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-bold text-gray-900 flex items-center gap-2">
            <span className="text-lg">📷</span>
            Selected Images ({previews.length}/{maxFiles})
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {previews.map((item, index) => (
              <div
                key={`${item.file.name}-${index}`}
                className="relative group rounded-lg overflow-hidden border border-gray-200 hover:border-red-500 transition-all"
              >
                {/* Image */}
                <img
                  src={item.preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-24 object-cover group-hover:scale-110 transition-transform"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {/* File info */}
                  <div className="text-white text-center text-xs">
                    <p className="font-semibold truncate max-w-[60px]">
                      {item.file.name.substring(0, 10)}...
                    </p>
                    <p className="text-white/80">
                      {(item.file.size / 1024).toFixed(1)}KB
                    </p>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFile(index)
                    }}
                    className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all hover:scale-110"
                    disabled={uploading}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded URLs */}
      {uploadedUrls.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
            <span className="text-lg">✅</span>
            Upload Successful! ({uploadedUrls.length} images)
          </h4>

          <div className="space-y-2">
            {uploadedUrls.map((url, index) => (
              <div
                key={index}
                className="bg-white p-3 rounded border border-green-200 text-sm text-gray-700 break-all hover:bg-green-50 transition-colors"
              >
                <code className="text-xs text-gray-600">{url}</code>
              </div>
            ))}
          </div>

          <p className="text-xs text-green-700 mt-3">
            ℹ️ These URLs can now be used in your listing
          </p>
        </div>
      )}

      {/* Upload Button */}
      {previews.length > 0 && uploadedUrls.length === 0 && (
        <button
          onClick={handleUpload}
          disabled={uploading || previews.length === 0}
          className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <span className="animate-spin text-lg">⚙️</span>
              Uploading... {uploadProgress.total}%
            </>
          ) : (
            <>
              <span>🚀</span>
              Upload {previews.length} Image{previews.length !== 1 ? 's' : ''}
            </>
          )}
        </button>
      )}

      {/* Reset button for new uploads */}
      {uploadedUrls.length > 0 && (
        <button
          onClick={() => {
            setUploadedUrls([])
            setSelectedFiles([])
            setPreviews([])
            setUploadProgress({})
          }}
          className="w-full border border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50 font-bold py-3 rounded-lg transition-all"
        >
          Upload More Images
        </button>
      )}
    </div>
  )
}
