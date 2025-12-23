import { render, screen, fireEvent } from '@testing-library/react'
import { ProfileDetailView } from '@/components/ProfileDetailView'
import { Profile } from '@/lib/mockData'

const mockProfile: Profile = {
  id: '1',
  name: 'Test User',
  age: 25,
  location: 'Seoul, Korea',
  bio: 'Test bio',
  images: ['https://example.com/image.jpg'],
  nationality: 'Korean',
  interests: ['Music', 'Travel']
}

describe('ProfileDetailView', () => {
  it('renders profile information correctly', () => {
    const onClose = jest.fn()
    
    render(<ProfileDetailView profile={mockProfile} onClose={onClose} />)
    
    expect(screen.getByText(/Test User, 25/)).toBeInTheDocument()
    expect(screen.getByText(/Seoul, Korea/)).toBeInTheDocument()
    expect(screen.getByText('Test bio')).toBeInTheDocument()
  })

  it('displays interests as tags', () => {
    const onClose = jest.fn()
    
    render(<ProfileDetailView profile={mockProfile} onClose={onClose} />)
    
    expect(screen.getByText('Music')).toBeInTheDocument()
    expect(screen.getByText('Travel')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn()
    
    render(<ProfileDetailView profile={mockProfile} onClose={onClose} />)
    
    const closeButtons = screen.getAllByRole('button')
    // Click the first button (close button)
    fireEvent.click(closeButtons[0])
    
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
