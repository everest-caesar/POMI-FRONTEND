import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit2, Check, X, Upload, Bell, Mail, User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import authService from '@/services/authService'
import { API_BASE_URL } from '@/config/api'

interface UserProfile {
  id: string
  username: string
  email: string
  avatar?: string
  bio?: string
  preferences?: {
    theme: 'light' | 'dark'
    notifications: boolean
    language: 'en' | 'am' | 'ti'
  }
}

export default function UserProfilePage() {
  const navigate = useNavigate()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    language: 'en' as const
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = authService.getToken()
        if (!token) {
          navigate('/?auth=1')
          return
        }

        const response = await fetch(`${API_BASE_URL}/users/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await response.json()
        if (data.success || data.user) {
          const userData = data.data || data.user
          setUser(userData)
          setFormData({
            username: userData.username || '',
            bio: userData.bio || '',
            language: userData.preferences?.language || 'en'
          })
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [navigate])

  const handleSave = async () => {
    setSaving(true)
    try {
      const token = authService.getToken()
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: formData.username,
          bio: formData.bio,
          preferences: {
            theme: 'dark',
            notifications: true,
            language: formData.language
          }
        })
      })

      const data = await response.json()
      if (data.success || data.user) {
        setUser(data.data || data.user)
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Failed to save profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    authService.removeToken()
    authService.clearUserData()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
        <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-lg">
          <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2 text-slate-300 hover:text-white hover:bg-slate-800">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </header>
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="h-96 rounded-2xl bg-slate-900/50 border border-slate-800 animate-pulse" />
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2 text-slate-300 hover:text-white hover:bg-slate-800">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">POMI</p>
              <p className="text-sm font-semibold text-white">Your Profile</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="gap-2 border-red-500/30 text-red-400 hover:bg-red-950/30"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Log out</span>
          </Button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-800 p-8 space-y-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-full border-4 border-orange-500 bg-slate-800 flex items-center justify-center shadow-lg">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="h-12 w-12 text-slate-400" />
              )}
            </div>
            <button className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full transition-colors">
              <Upload className="h-4 w-4" />
            </button>
            <h2 className="text-2xl font-bold text-white">{user.username}</h2>
            <p className="text-sm text-slate-400">{user.email}</p>
          </div>

          <div className="border-t border-slate-700 pt-6">
            <h3 className="text-lg font-semibold text-white mb-6">Account Information</h3>

            <div className="space-y-5">
              {/* Username */}
              <div>
                <label className="text-sm font-medium text-slate-400 flex items-center gap-2 mb-2">
                  <User className="h-4 w-4" />
                  Username
                </label>
                <Input
                  disabled={!isEditing}
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white disabled:text-slate-400"
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-sm font-medium text-slate-400 flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4" />
                  Email
                </label>
                <Input
                  disabled
                  value={user.email}
                  className="bg-slate-800 border-slate-700 text-slate-400"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="text-sm font-medium text-slate-400 mb-2 block">Bio</label>
                <textarea
                  disabled={!isEditing}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full rounded-lg bg-slate-800 border border-slate-700 p-3 text-white disabled:text-slate-400 focus:border-orange-500 focus:outline-none"
                  rows={4}
                  placeholder="Tell us about yourself..."
                />
              </div>

              {/* Language */}
              <div>
                <label className="text-sm font-medium text-slate-400 mb-2 block">Preferred Language</label>
                <select
                  disabled={!isEditing}
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value as any })}
                  className="w-full rounded-lg bg-slate-800 border border-slate-700 p-3 text-white disabled:text-slate-400 focus:border-orange-500 focus:outline-none"
                >
                  <option value="en">English</option>
                  <option value="am">Amharic</option>
                  <option value="ti">Tigrinya</option>
                </select>
              </div>

              {/* Notifications */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-slate-700 bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="font-medium text-white">Notifications</p>
                    <p className="text-sm text-slate-400">Receive updates</p>
                  </div>
                </div>
                <button className="relative inline-flex h-8 w-14 items-center rounded-full bg-orange-500 transition-colors">
                  <span className="inline-block h-6 w-6 transform rounded-full bg-white translate-x-7" />
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-slate-700 pt-6 flex gap-3 flex-wrap">
            {isEditing ? (
              <>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                >
                  <Check className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                  className="gap-2 border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                className="gap-2 bg-orange-500 hover:bg-orange-600"
              >
                <Edit2 className="h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="border-t border-slate-700 pt-6 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-orange-500">0</p>
              <p className="text-xs text-slate-400">Listings</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-500">0</p>
              <p className="text-xs text-slate-400">Events</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-violet-500">0</p>
              <p className="text-xs text-slate-400">Posts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
