import { useState, useRef } from 'react'
import axios from 'axios'
import authService from '../services/authService'

interface BusinessFormData {
  businessName: string
  description: string
  category: string
  phone: string
  email: string
  address: string
}

interface BusinessUploadProps {
  onSuccess?: () => void
  onCancel?: () => void
}

const CATEGORIES = [
  { value: 'retail', label: 'Retail & Shopping' },
  { value: 'restaurant', label: 'Food & Hospitality' },
  { value: 'services', label: 'Services' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'education', label: 'Education' },
  { value: 'technology', label: 'Technology' },
  { value: 'finance', label: 'Finance' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'other', label: 'Other' },
]

export default function BusinessUpload({ onSuccess, onCancel }: BusinessUploadProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [businessId, setBusinessId] = useState<string | null>(null)

  const [formData, setFormData] = useState<BusinessFormData>({
    businessName: '',
    description: '',
    category: 'retail',
    phone: '',
    email: '',
    address: '',
  })

  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [filePreviews, setFilePreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const token = authService.getToken()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setSelectedFiles((prev) => [...prev, ...files])

    // Generate previews
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = (event.target as FileReader)?.result
        if (result) {
          setFilePreviews((prev) => [...prev, result as string])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    setFilePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      // Create business first
      const createResponse = await axios.post(
        '/api/v1/businesses',
        {
          ...formData,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      const newBusinessId = createResponse.data.business._id
      setBusinessId(newBusinessId)

      // Reset form for next business
      setFormData({
        businessName: '',
        description: '',
        category: 'retail',
        phone: '',
        email: '',
        address: '',
      })

      // If there are images, upload them
      if (selectedFiles.length > 0) {
        await uploadImages(newBusinessId)
      } else {
        // No images, show publish option
        setSuccess(`Business "${formData.businessName}" created successfully! Click "Publish Now" to make it visible in the directory.`)
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create business')
    } finally {
      setLoading(false)
    }
  }

  const uploadImages = async (id: string) => {
    try {
      const uploadFormData = new FormData()
      selectedFiles.forEach((file) => {
        uploadFormData.append('images', file)
      })

      await axios.post(`/api/v1/businesses/${id}/images`, uploadFormData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })

      setSuccess(`Business created and images uploaded successfully! Click "Publish Now" to make it visible in the directory.`)
      setSelectedFiles([])
      setFilePreviews([])
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload images')
    }
  }

  const publishBusiness = async () => {
    if (!businessId) return

    setLoading(true)
    try {
      await axios.put(
        `/api/v1/businesses/${businessId}`,
        { status: 'active' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      setSuccess(`Business published successfully! It's now visible in the directory.`)
      setBusinessId(null)

      if (onSuccess) {
        setTimeout(onSuccess, 2000)
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to publish business')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Add New Business</h2>

        {error && (
          <div className="mb-6 rounded-2xl border border-rose-300/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        )}

        {success && businessId && (
          <div className="mb-6 rounded-2xl border border-emerald-300/40 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-100 space-y-3">
            <p>{success}</p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={publishBusiness}
                disabled={loading}
                className="rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Publishing...' : '✨ Publish Now'}
              </button>
            </div>
          </div>
        )}

        {success && !businessId && (
          <div className="mb-6 rounded-2xl border border-emerald-300/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            {success}
          </div>
        )}

        <form onSubmit={handleCreateBusiness} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Business Name */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Business Name *</label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                required
                className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-white placeholder:text-white/40 focus:border-rose-300 focus:outline-none"
                placeholder="e.g., Shega Café & Bakery"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-white focus:border-rose-300 focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value} className="bg-slate-800 text-white">
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-white placeholder:text-white/40 focus:border-rose-300 focus:outline-none"
                placeholder="(613) 555-0123"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-white placeholder:text-white/40 focus:border-rose-300 focus:outline-none"
                placeholder="contact@business.com"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-white placeholder:text-white/40 focus:border-rose-300 focus:outline-none"
              placeholder="123 Main St, Ottawa, ON"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-white placeholder:text-white/40 focus:border-rose-300 focus:outline-none"
              placeholder="Describe the business, products/services, and what makes it unique..."
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Business Photos</label>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-lg border-2 border-dashed border-white/20 bg-white/5 px-4 py-8 text-center transition hover:border-white/40 hover:bg-white/10"
            >
              <p className="text-sm font-semibold text-white">Click to upload or drag and drop</p>
              <p className="text-xs text-white/60">PNG, JPG, or WebP (max 10MB each)</p>
            </button>

            {/* Image Previews */}
            {filePreviews.length > 0 && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {filePreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                    <img src={preview} alt={`Preview ${index + 1}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 rounded-full bg-rose-500 p-2 text-white hover:bg-rose-600"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading || !formData.businessName || !formData.description}
              className="flex-1 rounded-lg bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 px-6 py-3 font-semibold text-white hover:shadow-lg hover:shadow-rose-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Creating...' : 'Create Business'}
            </button>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 rounded-lg border border-white/15 text-white font-semibold hover:bg-white/10 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
