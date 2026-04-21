'use client'

import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/lib/stores/auth.store'
import type { Profile, Organization } from '@/types'

interface AuthInitializerProps {
  user: any | null
  profile: Profile | null
  organization: Organization | null
}

export function AuthInitializer({ user, profile, organization }: AuthInitializerProps) {
  const setAuth = useAuthStore((state) => state.setAuth)
  const initialized = useRef(false)

  // Use a ref and a single effect to avoid unnecessary re-renders or loops
  // We want to sync the server data to the client store once on mount
  useEffect(() => {
    if (!initialized.current) {
      setAuth(user, profile, organization)
      initialized.current = true
    }
  }, [user, profile, organization, setAuth])

  return null
}
