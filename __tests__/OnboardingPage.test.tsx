import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; 
import OnboardingPage from '@/app/onboarding/page';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// Mock dependencies
jest.mock('@/context/AuthContext');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  updateDoc: jest.fn(),
  getFirestore: jest.fn(),
}));
jest.mock('@/lib/firebase', () => ({
  db: {},
}));

describe('OnboardingPage', () => {
  const mockUser = { uid: 'test-uid', email: 'test@example.com' };
  const mockRouter = { push: jest.fn() };
  
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    jest.clearAllMocks();
    
    // Mock global fetch
    global.fetch = jest.fn();
    
    // Mock navigator.geolocation
    const mockGeolocation = {
      getCurrentPosition: jest.fn(),
      watchPosition: jest.fn()
    };
    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true
    });
  });

  const fillStep1 = () => {
    fireEvent.change(screen.getByPlaceholderText('Min-jun'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByPlaceholderText('25'), { target: { value: '25' } });
    fireEvent.click(screen.getByText('Korean 🇰🇷'));
  };

  const fillStep2 = () => {
    fireEvent.change(screen.getByPlaceholderText('Seoul, Korea'), { target: { value: 'Seoul, Korea' } });
    fireEvent.change(screen.getByPlaceholderText('I love traveling and trying new foods...'), { target: { value: 'This is a valid bio with more than 10 characters.' } });
  };

  test('renders step 1 initially', () => {
    render(<OnboardingPage />);
    expect(screen.getByText('My name is')).toBeInTheDocument();
  });

  test('validates step 1 and navigates to step 2', async () => {
    render(<OnboardingPage />);
    
    // Try to move next without filling
    fireEvent.click(screen.getByText('Continue'));
    expect(screen.getByText('Name is required')).toBeInTheDocument();
    
    // Fill form
    fillStep1();
    
    fireEvent.click(screen.getByText('Continue'));
    await waitFor(() => {
        expect(screen.getByText('I live in')).toBeInTheDocument();
    });
  });

  test('navigates back from step 2 to step 1', async () => {
    render(<OnboardingPage />);
    fillStep1();
    fireEvent.click(screen.getByText('Continue'));
    
    // Now on step 2
    await waitFor(() => {
        expect(screen.getByText('I live in')).toBeInTheDocument();
    });
    
    // Click Back
    fireEvent.click(screen.getByText('Back'));
    await waitFor(() => {
        expect(screen.getByText('My name is')).toBeInTheDocument();
    });
  });

  test('fetches location on pin click', async () => {
    render(<OnboardingPage />);
    fillStep1();
    fireEvent.click(screen.getByText('Continue'));
    
    await waitFor(() => {
        expect(screen.getByText('I live in')).toBeInTheDocument();
    });

    // Mock geolocation success
    const mockGeolocation = global.navigator.geolocation as any;
    mockGeolocation.getCurrentPosition.mockImplementation((success: any) => {
      success({
        coords: {
          latitude: 37.5665,
          longitude: 126.9780
        }
      });
    });

    // Mock Google Maps API response
    (global.fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve({
        results: [{
          address_components: [
            { long_name: 'Seoul', types: ['locality'] },
            { long_name: 'South Korea', types: ['country'] }
          ]
        }]
      })
    });

    // Click location pin
    fireEvent.click(screen.getByTestId('location-pin'));

    // Wait for the location to be updated
    await waitFor(() => {
        expect(global.navigator.geolocation.getCurrentPosition).toHaveBeenCalled();
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('maps.googleapis.com'));
        // We check if the input value is updated. 
        expect(screen.getByDisplayValue('Seoul, South Korea')).toBeInTheDocument();
    });
  });
  
  test('validates 6 photos requirement', async () => {
     render(<OnboardingPage />);
     fillStep1();
     fireEvent.click(screen.getByText('Continue'));
     
     await waitFor(() => {
        expect(screen.getByText('I live in')).toBeInTheDocument();
    });

     fillStep2();
     fireEvent.click(screen.getByText('Continue'));
     
     // Step 3
     await waitFor(() => {
        expect(screen.getByText('Add your best photos')).toBeInTheDocument();
     });
     
     // Try to complete without photos
     fireEvent.click(screen.getByText('Complete Profile'));
     expect(screen.getByText('Please add exactly 6 photos to complete your profile.')).toBeInTheDocument();
  });
});
