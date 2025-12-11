"use client"

import type React from "react"
import { useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Check, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { API_BASE_URL } from "@/config/api"
import authService from "@/services/authService"

const CATEGORIES = [
  { value: "restaurant", label: "Food & Hospitality" },
  { value: "retail", label: "Retail & Shopping" },
  { value: "services", label: "Services" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "technology", label: "Technology" },
  { value: "finance", label: "Finance" },
  { value: "entertainment", label: "Entertainment" },
  { value: "other", label: "Other" },
]

export default function NewBusinessPage() {
  const navigate = useNavigate()
  const token = authService.getToken()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    businessName: "",
    description: "",
    category: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    hours: "",
  })
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      setError("Please sign in to submit a business listing.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/businesses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          status: "draft", // Requires admin approval
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "Failed to submit business listing")
      }

      setIsSuccess(true)
      setTimeout(() => navigate("/business"), 2000)
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Unable to submit right now. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg font-semibold">Sign in required</p>
          <p className="text-slate-400">You need to be signed in to submit a business listing.</p>
          <Link to="/business">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              Back to directory
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Business submitted!</h2>
          <p className="text-slate-400 mb-4">We'll verify details before it appears in the directory.</p>
          <p className="text-sm text-slate-500">Redirecting to directory...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Link to="/business">
              <Button variant="ghost" size="sm" className="gap-2 text-slate-300 hover:text-white hover:bg-slate-800">
                <ArrowLeft className="h-4 w-4" />
                Back to Directory
              </Button>
            </Link>
          </div>
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-rose-600">
              <span className="text-lg font-bold text-white">P</span>
            </div>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300 mb-2">
            Community businesses
          </p>
          <h1 className="text-3xl font-bold text-white mb-2">List a Business</h1>
          <p className="text-slate-400">
            Share a local Habesha-owned business so neighbours can find and support it.
          </p>
          {error && (
            <p className="text-sm text-rose-300 mt-3 bg-rose-500/10 border border-rose-500/30 rounded-lg px-4 py-2">
              {error}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-5">
            <div>
              <Label htmlFor="businessName" className="text-white">
                Business name *
              </Label>
              <Input
                id="businessName"
                placeholder="e.g. Habesha Restaurant"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="mt-2 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                required
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-white">
                Description *
              </Label>
              <Textarea
                id="description"
                placeholder="Tell neighbours what makes this business special..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-2 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 min-h-32"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category" className="text-white">
                  Category *
                </Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="mt-2 w-full h-10 px-3 rounded-md bg-slate-800 border border-slate-700 text-white"
                  required
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="phone" className="text-white">
                  Phone *
                </Label>
                <Input
                  id="phone"
                  placeholder="(613) 555-0123"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-2 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address" className="text-white">
                Address *
              </Label>
              <Input
                id="address"
                placeholder="123 Bank Street, Ottawa, ON"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="mt-2 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                required
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-white">
                Business email *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@business.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-2 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="website" className="text-white">
                  Website (optional)
                </Label>
                <Input
                  id="website"
                  placeholder="www.business.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="mt-2 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
              <div>
                <Label htmlFor="hours" className="text-white">
                  Business hours (optional)
                </Label>
                <Input
                  id="hours"
                  placeholder="Mon-Fri 9am-6pm"
                  value={formData.hours}
                  onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                  className="mt-2 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
            </div>

            <div>
              <Label className="text-white">Logo or banner (optional)</Label>
              <button
                type="button"
                className="mt-2 w-full border-2 border-dashed border-slate-700 rounded-xl p-6 text-center hover:border-slate-600 transition-colors cursor-pointer bg-slate-900/40"
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="h-24 mx-auto mb-2 rounded-lg object-cover" />
                ) : (
                  <Upload className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                )}
                <p className="text-slate-300 text-sm">Click to upload or drag and drop</p>
                <p className="text-slate-500 text-xs mt-1">
                  If you skip this step, we'll use a placeholder image.
                </p>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  setFileName(file.name)
                  const url = URL.createObjectURL(file)
                  setImagePreview(url)
                }}
              />
              {fileName && (
                <p className="mt-2 text-xs text-emerald-300">Selected: {fileName}</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
            <p className="text-sm text-amber-300">
              <strong>Note:</strong> All submissions are reviewed by our admin team before appearing
              in the directory. This helps ensure quality and accuracy for the community.
            </p>
          </div>

          <div className="flex gap-4">
            <Link to="/business" className="flex-1">
              <Button
                type="button"
                variant="outline"
                className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent"
              >
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit for Review"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
