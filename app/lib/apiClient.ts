'use client'

interface ApiResponse<T = any> {
  data?: T
  error?: string
  status: number
}

class ApiClient {
  private baseURL: string

  constructor() {
    this.baseURL = ''
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = localStorage.getItem('token')
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config)
      
      // Handle 401 Unauthorized - token expired or invalid
      if (response.status === 401) {
        this.handleUnauthorized()
        return {
          error: 'Session expired. Please log in again.',
          status: 401
        }
      }

      const data = await response.json()

      if (!response.ok) {
        return {
          error: data.error || `Request failed with status ${response.status}`,
          status: response.status
        }
      }

      return {
        data,
        status: response.status
      }
    } catch (error) {
      console.error('API request failed:', error)
      return {
        error: 'Network error. Please check your connection.',
        status: 0
      }
    }
  }

  private handleUnauthorized() {
    // Clear invalid token and user data
    localStorage.removeItem('token')
    localStorage.removeItem('library_user')
    
    // Show error message
    if (typeof window !== 'undefined') {
      // Only show toast if we're in the browser
      import('react-hot-toast').then(({ default: toast }) => {
        toast.error('Session expired. Please log in again.')
      })
      
      // Redirect to login page
      window.location.href = '/'
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'GET' })
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' })
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('library_user')
    return !!(token && user)
  }

  // Get current user from localStorage
  getCurrentUser(): any | null {
    try {
      const userStr = localStorage.getItem('library_user')
      return userStr ? JSON.parse(userStr) : null
    } catch {
      return null
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient()
export default apiClient
