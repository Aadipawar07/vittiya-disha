// Hook for managing API request state (loading, success, error)
import { useState } from 'react'

export function useApi(asyncFunction, immediate = false) {
  const [state, setState] = useState({
    loading: false,
    error: null,
    data: null
  })

  const execute = async (...args) => {
    setState({ loading: true, error: null, data: null })
    try {
      const response = await asyncFunction(...args)
      setState({ loading: false, error: null, data: response })
      return response
    } catch (error) {
      setState({ loading: false, error, data: null })
      throw error
    }
  }

  return [state, execute]
}
