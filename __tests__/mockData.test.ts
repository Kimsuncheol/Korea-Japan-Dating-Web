import { mockProfiles } from '@/lib/mockData'

describe('Mock Data', () => {
  it('contains profile data', () => {
    expect(mockProfiles).toBeDefined()
    expect(mockProfiles.length).toBeGreaterThan(0)
  })

  it('profiles have required fields', () => {
    mockProfiles.forEach(profile => {
      expect(profile).toHaveProperty('id')
      expect(profile).toHaveProperty('name')
      expect(profile).toHaveProperty('age')
      expect(profile).toHaveProperty('location')
      expect(profile).toHaveProperty('bio')
      expect(profile).toHaveProperty('images')
      expect(profile).toHaveProperty('nationality')
      expect(profile).toHaveProperty('interests')
    })
  })

  it('profiles have Korean and Japanese nationalities', () => {
    const koreanProfiles = mockProfiles.filter(p => p.nationality === 'Korean')
    const japaneseProfiles = mockProfiles.filter(p => p.nationality === 'Japanese')
    
    expect(koreanProfiles.length).toBeGreaterThan(0)
    expect(japaneseProfiles.length).toBeGreaterThan(0)
  })

  it('all profiles have at least one image', () => {
    mockProfiles.forEach(profile => {
      expect(profile.images.length).toBeGreaterThan(0)
    })
  })

  it('all profiles have at least one interest', () => {
    mockProfiles.forEach(profile => {
      expect(profile.interests.length).toBeGreaterThan(0)
    })
  })
})
