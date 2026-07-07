/**
 * RateRecommendations Component Tests
 * Tests for the AI-powered pricing recommendations component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RateRecommendations from '../RateRecommendations';

// Mock the toast context
const mockSuccess = vi.fn();
const mockError = vi.fn();

vi.mock('../../../contexts/ToastContext', () => ({
  useToast: () => ({
    success: mockSuccess,
    error: mockError,
  }),
}));

// Mock the revenue intelligence service
const mockGetPricingRecommendations = vi.fn();
const mockAcceptRecommendation = vi.fn();
const mockDismissRecommendation = vi.fn();
const mockApplyAllRecommendations = vi.fn();
const mockDismissAllRecommendations = vi.fn();

vi.mock('../../../api/services/revenue-intelligence.service', () => ({
  default: {
    getPricingRecommendations: () => mockGetPricingRecommendations(),
    acceptRecommendation: (id: string) => mockAcceptRecommendation(id),
    dismissRecommendation: (id: string) => mockDismissRecommendation(id),
    applyAllRecommendations: () => mockApplyAllRecommendations(),
    dismissAllRecommendations: () => mockDismissAllRecommendations(),
  },
}));

// Sample recommendation data
const mockRecommendations = [
  {
    date: '2024-02-15',
    room_type_id: 1,
    room_type_name: 'Deluxe Room',
    current_rate: 8000,
    recommended_rate: 9200,
    change_percent: 15,
    demand_level: 'high',
    forecasted_occupancy: 85,
    competitor_avg: 8500,
    confidence: 0.92,
    reasoning: 'High demand expected due to upcoming weekend',
    priority: 'high' as const,
  },
  {
    date: '2024-02-16',
    room_type_id: 2,
    room_type_name: 'Standard Room',
    current_rate: 5000,
    recommended_rate: 4500,
    change_percent: -10,
    demand_level: 'low',
    forecasted_occupancy: 45,
    competitor_avg: 4800,
    confidence: 0.78,
    reasoning: 'Low occupancy forecast, reduce rates to attract bookings',
    priority: 'medium' as const,
  },
  {
    date: '2024-02-17',
    room_type_id: 1,
    room_type_name: 'Deluxe Room',
    current_rate: 8000,
    recommended_rate: 10500,
    change_percent: 31,
    demand_level: 'critical',
    forecasted_occupancy: 95,
    competitor_avg: 10000,
    confidence: 0.95,
    reasoning: 'Conference event driving high demand',
    priority: 'critical' as const,
  },
];

describe('RateRecommendations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetPricingRecommendations.mockResolvedValue({
      recommendations: mockRecommendations,
      total_opportunity: 45000,
      generated_at: new Date().toISOString(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render loading skeleton initially', () => {
      render(<RateRecommendations />);

      // Should show loading animation elements
      const loadingElements = document.querySelectorAll('.animate-pulse');
      expect(loadingElements.length).toBeGreaterThan(0);
    });

    it('should render recommendations after loading', async () => {
      render(<RateRecommendations />);

      await waitFor(() => {
        expect(screen.getByText('Deluxe Room')).toBeInTheDocument();
      });

      expect(screen.getByText('Standard Room')).toBeInTheDocument();
      expect(screen.getByText('AI Rate Recommendations')).toBeInTheDocument();
    });

    it('should display empty state when no recommendations', async () => {
      mockGetPricingRecommendations.mockResolvedValue({
        recommendations: [],
        total_opportunity: 0,
        generated_at: new Date().toISOString(),
      });

      render(<RateRecommendations />);

      await waitFor(() => {
        expect(screen.getByText('All caught up!')).toBeInTheDocument();
      });

      expect(
        screen.getByText('No pricing recommendations at this time.')
      ).toBeInTheDocument();
    });

    it('should show high confidence count', async () => {
      render(<RateRecommendations />);

      await waitFor(() => {
        // 2 recommendations have confidence >= 0.8
        expect(screen.getByText(/2\/3 High Confidence/)).toBeInTheDocument();
      });
    });

    it('should display current and recommended rates', async () => {
      render(<RateRecommendations />);

      await waitFor(() => {
        // Check for INR currency format
        expect(screen.getAllByText(/8,000/).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/9,200/).length).toBeGreaterThan(0);
      });
    });

    it('should show change percentage with correct styling', async () => {
      render(<RateRecommendations />);

      await waitFor(() => {
        // Positive change
        expect(screen.getByText('+15%')).toBeInTheDocument();
        // Negative change
        expect(screen.getByText('-10%')).toBeInTheDocument();
      });
    });

    it('should display demand level badges', async () => {
      render(<RateRecommendations />);

      await waitFor(() => {
        expect(screen.getByText('High demand')).toBeInTheDocument();
        expect(screen.getByText('Low demand')).toBeInTheDocument();
        expect(screen.getByText('Critical demand')).toBeInTheDocument();
      });
    });

    it('should show reasoning for recommendations', async () => {
      render(<RateRecommendations />);

      await waitFor(() => {
        expect(
          screen.getByText('High demand expected due to upcoming weekend')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Accept Recommendation', () => {
    it('should accept a single recommendation', async () => {
      const user = userEvent.setup();
      mockAcceptRecommendation.mockResolvedValue(undefined);

      render(<RateRecommendations />);

      await waitFor(() => {
        expect(screen.getByText('Deluxe Room')).toBeInTheDocument();
      });

      // Find the accept button (check icon) for the first recommendation
      const acceptButtons = screen.getAllByTitle('Apply');
      await user.click(acceptButtons[0]);

      await waitFor(() => {
        expect(mockAcceptRecommendation).toHaveBeenCalledWith('1_2024-02-15');
      });

      expect(mockSuccess).toHaveBeenCalledWith(
        expect.stringContaining('Rate updated for Deluxe Room')
      );
    });

    it('should show loading state when accepting', async () => {
      const user = userEvent.setup();
      let resolveAccept: () => void;
      mockAcceptRecommendation.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveAccept = resolve;
          })
      );

      render(<RateRecommendations />);

      await waitFor(() => {
        expect(screen.getByText('Deluxe Room')).toBeInTheDocument();
      });

      const acceptButtons = screen.getAllByTitle('Apply');
      await user.click(acceptButtons[0]);

      // Should show loading spinner
      expect(document.querySelector('.animate-spin')).toBeInTheDocument();

      // Resolve the promise
      resolveAccept!();
    });

    it('should show error toast on accept failure', async () => {
      const user = userEvent.setup();
      mockAcceptRecommendation.mockRejectedValue(new Error('API Error'));

      render(<RateRecommendations />);

      await waitFor(() => {
        expect(screen.getByText('Deluxe Room')).toBeInTheDocument();
      });

      const acceptButtons = screen.getAllByTitle('Apply');
      await user.click(acceptButtons[0]);

      await waitFor(() => {
        expect(mockError).toHaveBeenCalledWith('Failed to apply recommendation');
      });
    });

    it('should call onRefreshCalendar after accepting', async () => {
      const user = userEvent.setup();
      mockAcceptRecommendation.mockResolvedValue(undefined);
      const onRefreshCalendar = vi.fn();

      render(<RateRecommendations onRefreshCalendar={onRefreshCalendar} />);

      await waitFor(() => {
        expect(screen.getByText('Deluxe Room')).toBeInTheDocument();
      });

      const acceptButtons = screen.getAllByTitle('Apply');
      await user.click(acceptButtons[0]);

      await waitFor(() => {
        expect(onRefreshCalendar).toHaveBeenCalled();
      });
    });
  });

  describe('Dismiss Recommendation', () => {
    it('should dismiss a single recommendation', async () => {
      const user = userEvent.setup();
      mockDismissRecommendation.mockResolvedValue(undefined);

      render(<RateRecommendations />);

      await waitFor(() => {
        expect(screen.getByText('Deluxe Room')).toBeInTheDocument();
      });

      const dismissButtons = screen.getAllByTitle('Dismiss');
      await user.click(dismissButtons[0]);

      await waitFor(() => {
        expect(mockDismissRecommendation).toHaveBeenCalledWith('1_2024-02-15');
      });

      expect(mockSuccess).toHaveBeenCalledWith('Recommendation dismissed');
    });

    it('should show error toast on dismiss failure', async () => {
      const user = userEvent.setup();
      mockDismissRecommendation.mockRejectedValue(new Error('API Error'));

      render(<RateRecommendations />);

      await waitFor(() => {
        expect(screen.getByText('Deluxe Room')).toBeInTheDocument();
      });

      const dismissButtons = screen.getAllByTitle('Dismiss');
      await user.click(dismissButtons[0]);

      await waitFor(() => {
        expect(mockError).toHaveBeenCalledWith('Failed to dismiss recommendation');
      });
    });
  });

  describe('Apply All Recommendations', () => {
    it('should apply all recommendations', async () => {
      const user = userEvent.setup();
      mockApplyAllRecommendations.mockResolvedValue(undefined);

      render(<RateRecommendations />);

      await waitFor(() => {
        expect(screen.getByText('Deluxe Room')).toBeInTheDocument();
      });

      const applyAllButton = screen.getByRole('button', { name: 'Apply All' });
      await user.click(applyAllButton);

      await waitFor(() => {
        expect(mockApplyAllRecommendations).toHaveBeenCalled();
      });

      expect(mockSuccess).toHaveBeenCalledWith(
        expect.stringContaining('Applied 3 rate recommendations')
      );
    });

    it('should show loading state when applying all', async () => {
      const user = userEvent.setup();
      let resolveApplyAll: () => void;
      mockApplyAllRecommendations.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveApplyAll = resolve;
          })
      );

      render(<RateRecommendations />);

      await waitFor(() => {
        expect(screen.getByText('Deluxe Room')).toBeInTheDocument();
      });

      const applyAllButton = screen.getByRole('button', { name: 'Apply All' });
      await user.click(applyAllButton);

      expect(screen.getByText('Applying...')).toBeInTheDocument();

      resolveApplyAll!();
    });

    it('should show error toast on apply all failure', async () => {
      const user = userEvent.setup();
      mockApplyAllRecommendations.mockRejectedValue(new Error('API Error'));

      render(<RateRecommendations />);

      await waitFor(() => {
        expect(screen.getByText('Deluxe Room')).toBeInTheDocument();
      });

      const applyAllButton = screen.getByRole('button', { name: 'Apply All' });
      await user.click(applyAllButton);

      await waitFor(() => {
        expect(mockError).toHaveBeenCalledWith('Failed to apply all recommendations');
      });
    });
  });

  describe('Dismiss All Recommendations', () => {
    it('should dismiss all recommendations', async () => {
      const user = userEvent.setup();
      mockDismissAllRecommendations.mockResolvedValue(undefined);

      render(<RateRecommendations />);

      await waitFor(() => {
        expect(screen.getByText('Deluxe Room')).toBeInTheDocument();
      });

      const dismissAllButton = screen.getByRole('button', { name: 'Dismiss All' });
      await user.click(dismissAllButton);

      await waitFor(() => {
        expect(mockDismissAllRecommendations).toHaveBeenCalled();
      });

      expect(mockSuccess).toHaveBeenCalledWith('All recommendations dismissed');
    });

    it('should show loading state when dismissing all', async () => {
      const user = userEvent.setup();
      let resolveDismissAll: () => void;
      mockDismissAllRecommendations.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveDismissAll = resolve;
          })
      );

      render(<RateRecommendations />);

      await waitFor(() => {
        expect(screen.getByText('Deluxe Room')).toBeInTheDocument();
      });

      const dismissAllButton = screen.getByRole('button', { name: 'Dismiss All' });
      await user.click(dismissAllButton);

      expect(screen.getByText('Dismissing...')).toBeInTheDocument();

      resolveDismissAll!();
    });
  });

  describe('Auto Rate Setting', () => {
    it('should show auto-optimization indicator when enabled', async () => {
      render(<RateRecommendations settings={{ autoRate: true }} />);

      await waitFor(() => {
        expect(screen.getByText('Auto-optimization enabled')).toBeInTheDocument();
      });
    });

    it('should show manual review message when auto rate disabled', async () => {
      render(<RateRecommendations settings={{ autoRate: false }} />);

      await waitFor(() => {
        expect(
          screen.getByText('Review and apply recommended rates')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Priority Styling', () => {
    it('should apply critical priority styling', async () => {
      render(<RateRecommendations />);

      await waitFor(() => {
        // Check for critical priority background class
        const rows = document.querySelectorAll('[class*="border-rose"]');
        expect(rows.length).toBeGreaterThan(0);
      });
    });

    it('should apply high priority styling', async () => {
      render(<RateRecommendations />);

      await waitFor(() => {
        // Check for high priority background class
        const rows = document.querySelectorAll('[class*="border-gold"]');
        expect(rows.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error toast on fetch failure', async () => {
      mockGetPricingRecommendations.mockRejectedValue(new Error('Network Error'));

      render(<RateRecommendations />);

      await waitFor(() => {
        expect(mockError).toHaveBeenCalledWith('Failed to load recommendations');
      });
    });
  });

  describe('Refresh', () => {
    it('should have refresh button in empty state', async () => {
      mockGetPricingRecommendations.mockResolvedValue({
        recommendations: [],
        total_opportunity: 0,
        generated_at: new Date().toISOString(),
      });

      const user = userEvent.setup();
      render(<RateRecommendations />);

      await waitFor(() => {
        expect(screen.getByText('All caught up!')).toBeInTheDocument();
      });

      const refreshButton = screen.getByRole('button', { name: 'Refresh' });
      expect(refreshButton).toBeInTheDocument();

      mockGetPricingRecommendations.mockResolvedValue({
        recommendations: mockRecommendations,
        total_opportunity: 45000,
        generated_at: new Date().toISOString(),
      });

      await user.click(refreshButton);

      await waitFor(() => {
        expect(mockGetPricingRecommendations).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Button Disabled States', () => {
    it('should disable buttons during apply all operation', async () => {
      const user = userEvent.setup();
      let resolveApplyAll: () => void;
      mockApplyAllRecommendations.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveApplyAll = resolve;
          })
      );

      render(<RateRecommendations />);

      await waitFor(() => {
        expect(screen.getByText('Deluxe Room')).toBeInTheDocument();
      });

      const applyAllButton = screen.getByRole('button', { name: 'Apply All' });
      const dismissAllButton = screen.getByRole('button', { name: 'Dismiss All' });

      await user.click(applyAllButton);

      expect(applyAllButton).toBeDisabled();
      expect(dismissAllButton).toBeDisabled();

      resolveApplyAll!();
    });

    it('should disable buttons during dismiss all operation', async () => {
      const user = userEvent.setup();
      let resolveDismissAll: () => void;
      mockDismissAllRecommendations.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveDismissAll = resolve;
          })
      );

      render(<RateRecommendations />);

      await waitFor(() => {
        expect(screen.getByText('Deluxe Room')).toBeInTheDocument();
      });

      const applyAllButton = screen.getByRole('button', { name: 'Apply All' });
      const dismissAllButton = screen.getByRole('button', { name: 'Dismiss All' });

      await user.click(dismissAllButton);

      expect(applyAllButton).toBeDisabled();
      expect(dismissAllButton).toBeDisabled();

      resolveDismissAll!();
    });
  });
});
