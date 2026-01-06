// Auth utilities for Next.js frontend
import { supabase } from './supabase'

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error) {
    console.error('Google sign-in error:', error)
    throw error
  }

  return data
}

export const signInWithApple = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
    },
  })

  if (error) {
    console.error('Apple sign-in error:', error)
    throw error
  }

  return data
}

export const signInWithAzure = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'azure',
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
      scopes: 'email',
    },
  })

  if (error) {
    console.error('Azure sign-in error:', error)
    throw error
  }

  return data
}

export const saveParentToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('inspir_parent_token', token)
  }
}

export const getParentToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('inspir_parent_token')
  }
  return null
}

export const removeParentToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('inspir_parent_token')
  }
}

export const logout = () => {
  removeParentToken()
  window.location.href = '/login'
}
