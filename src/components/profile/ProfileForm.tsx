'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { supabaseClient as supabase } from '@/lib/supabase.client'
import { useUser } from '@/hooks/useUser'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import type { Profile } from '@/types'

export function ProfileForm() {
  const { user } = useUser()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [fullName, setFullName] = useState('')
  const [course, setCourse]     = useState('')
  const [year, setYear]         = useState('')

  const fetchProfile = useCallback(async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    setFullName(data.full_name || '')
    setCourse(data.course || '')
    setYear(data.year?.toString() || '')
    setLoading(false)
  }, [user, supabase])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  async function handleSave() {
    if (!user) return
    setSaving(true)

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim() || null,
        course:    course.trim()   || null,
        year:      year ? Number(year) : null,
      })
      .eq('id', user.id)

    if (error) {
      toast.error(error.message ?? 'Could not save profile')
    } else {
      toast.success('Profile saved!')
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <div className="space-y-3 max-w-md">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 rounded-md bg-muted animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-md space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="full-name" className="text-xs">Full name</Label>
        <Input
          id="full-name"
          placeholder="e.g. Alex Johnson"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="h-9 text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="course" className="text-xs">Course</Label>
        <Input
          id="course"
          placeholder="e.g. Computer Science"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          className="h-9 text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="year" className="text-xs">Year</Label>
        <Input
          id="year"
          type="number"
          min={1}
          max={6}
          placeholder="e.g. 2"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="h-9 text-sm"
        />
      </div>

      <div className="flex justify-end pt-1">
        <Button
          size="sm"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </div>
  )
}