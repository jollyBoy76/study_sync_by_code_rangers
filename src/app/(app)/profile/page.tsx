// src/app/(app)/profile/page.tsx

'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { LogoutButton } from '@/components/logout-button'
import { createClient } from '@/lib/supabase'
import { useUser } from '@/hooks/useUser'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Pencil, CheckSquare, Users, BookOpen, GraduationCap, Mail } from 'lucide-react'

interface ProfileData {
  full_name: string | null
  course: string | null
  year: number | null
}

interface Stats {
  groupCount: number
  totalTasks: number
  completedTasks: number
}


function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-border bg-background p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  )
}


export default function ProfilePage() {
  const { user } = useUser()
  const supabase = useRef(createClient()).current
  
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving]   = useState(false)

  const [profile, setProfile] = useState<ProfileData>({ full_name: null, course: null, year: null })
  const [stats, setStats]     = useState<Stats>({ groupCount: 0, totalTasks: 0, completedTasks: 0 })

  // edit form state
  const [fullName, setFullName] = useState('')
  const [course, setCourse]     = useState('')
  const [year, setYear]         = useState('')


  const fetchAll = useCallback(async () => {
    if (!user) return

    const [
      { data: profileData },
      { count: groupCount },
      { data: tasks },
    ] = await Promise.all([
      supabase.from('profiles').select('full_name, course, year').eq('id', user.id).single(),
      supabase.from('group_members').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('tasks').select('status').eq('created_by', user.id),
    ])

    if (profileData) {
      setProfile(profileData)
      setFullName(profileData.full_name || '')
      setCourse(profileData.course || '')
      setYear(profileData.year?.toString() || '')
    }

    setStats({
      groupCount:     groupCount ?? 0,
      totalTasks:     tasks?.length ?? 0,
      completedTasks: tasks?.filter((t) => t.status === 'done').length ?? 0,
    })

    setLoading(false)
  }, [user, supabase])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

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
    
    // Also sync to auth metadata so greeting picks it up
    await supabase.auth.updateUser({
      data: { full_name: fullName.trim() || null }
    })

    if (error) {
      toast.error(error.message ?? 'Could not save profile')
    } else {
      toast.success('Profile saved!')
      setProfile({
        full_name: fullName.trim() || null,
        course:    course.trim()   || null,
        year:      year ? Number(year) : null,
      })
      setEditing(false)
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4 max-w-lg">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-muted animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-32 rounded bg-muted animate-pulse" />
            <div className="h-3 w-24 rounded bg-muted animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 p-6 max-w-lg">

      {/* ── Profile header ───────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Avatar name={profile.full_name ?? user?.email ?? '?'} size="lg" />
          <div>
            <h1 className="text-lg font-semibold leading-tight">
              {profile.full_name || 'No name set'}
            </h1>
            <div className="mt-1 flex flex-col gap-0.5">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Mail className="h-3 w-3" />
                {user?.email}
              </span>
              {profile.course && (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <BookOpen className="h-3 w-3" />
                  {profile.course}
                </span>
              )}
              {profile.year && (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <GraduationCap className="h-3 w-3" />
                  Year {profile.year}
                </span>
              )}
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => setEditing((e) => !e)}
        >
          <Pencil className="h-3.5 w-3.5" />
          {editing ? 'Cancel' : 'Edit'}
        </Button>
      </div>

      {/* ── Edit form (inline, toggled) ──────────────────────────────────── */}
      {editing && (
        <div className="rounded-xl border border-border bg-background p-4 space-y-4">
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
          <div className="flex justify-end">
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </div>
      )}

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <div>
        <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-3">
          Overview
        </p>
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            icon={<Users className="h-3.5 w-3.5" />}
            label="Groups"
            value={stats.groupCount}
          />
          <StatCard
            icon={<CheckSquare className="h-3.5 w-3.5" />}
            label="Tasks"
            value={stats.totalTasks}
          />
          <StatCard
            icon={<CheckSquare className="h-3.5 w-3.5" />}
            label="Done"
            value={stats.completedTasks}
          />
        </div>
      </div>

      {/* ── Logout ───────────────────────────────────────────────────────── */}
      <div className="pt-2 border-t border-border">
        <LogoutButton />
      </div>

    </div>
  )
}