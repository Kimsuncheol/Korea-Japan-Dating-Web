import { render, screen } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/context/AuthContext'

// Test component to access auth context
const TestComponent = () => {
  const { user, loading } = useAuth()
  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="user">{user ? 'Logged In' : 'Logged Out'}</div>
    </div>
  )
}

describe('AuthContext', () => {
  it('provides initial loading state', () => {
    render(
      <AuthProvider>
        <div>Test</div>
      </AuthProvider>
    )
    // AuthProvider shows children only when not loading
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('useAuth hook throws error when used outside provider', () => {
    // Suppress console.error for this test
    const spy = jest.spyOn(console, 'error').mockImplementation()
    
    expect(() => {
      render(<TestComponent />)
    }).toThrow('useAuth must be used within an AuthProvider')
    
    spy.mockRestore()
  })

  it('provides authentication context values', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    expect(screen.getByTestId('user')).toHaveTextContent('Logged Out')
  })
})
