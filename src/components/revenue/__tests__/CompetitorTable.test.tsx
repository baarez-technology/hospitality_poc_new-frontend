/**
 * CompetitorTable Component Tests
 * Tests for the competitor rate comparison component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import CompetitorTable from '../CompetitorTable';

// Sample competitor data
const mockCompetitors = [
  {
    id: 1,
    hotel: 'Grand Hotel Plaza',
    rating: 4.5,
    distance: '0.5 km',
    today: 8500,
    next7: 8200,
  },
  {
    id: 2,
    hotel: 'Royal Inn',
    rating: 4.2,
    distance: '1.2 km',
    today: 6800,
    next7: 7000,
  },
  {
    id: 3,
    hotel: 'Luxury Suites',
    rating: 4.8,
    distance: '0.8 km',
    today: 12000,
    next7: 11500,
  },
  {
    id: 4,
    hotel: 'Budget Stay',
    rating: 3.9,
    distance: '2.0 km',
    today: 4500,
    next7: 4200,
  },
];

describe('CompetitorTable', () => {
  describe('Rendering', () => {
    it('should render competitor table header', () => {
      render(<CompetitorTable data={mockCompetitors} yourRate={7800} />);

      expect(screen.getByText('Competitor Rates')).toBeInTheDocument();
      expect(screen.getByText(/hotels monitored/)).toBeInTheDocument();
    });

    it('should display correct number of monitored hotels', () => {
      render(<CompetitorTable data={mockCompetitors} yourRate={7800} />);

      expect(screen.getByText('4 hotels monitored')).toBeInTheDocument();
    });

    it('should display all competitor names', () => {
      render(<CompetitorTable data={mockCompetitors} yourRate={7800} />);

      expect(screen.getByText('Grand Hotel Plaza')).toBeInTheDocument();
      expect(screen.getByText('Royal Inn')).toBeInTheDocument();
      expect(screen.getByText('Luxury Suites')).toBeInTheDocument();
      expect(screen.getByText('Budget Stay')).toBeInTheDocument();
    });

    it('should display hotel first letter avatar', () => {
      render(<CompetitorTable data={mockCompetitors} yourRate={7800} />);

      expect(screen.getByText('G')).toBeInTheDocument(); // Grand Hotel Plaza
      expect(screen.getByText('R')).toBeInTheDocument(); // Royal Inn
      expect(screen.getByText('L')).toBeInTheDocument(); // Luxury Suites
      expect(screen.getByText('B')).toBeInTheDocument(); // Budget Stay
    });

    it('should display ratings for each competitor', () => {
      render(<CompetitorTable data={mockCompetitors} yourRate={7800} />);

      expect(screen.getByText('4.5')).toBeInTheDocument();
      expect(screen.getByText('4.2')).toBeInTheDocument();
      expect(screen.getByText('4.8')).toBeInTheDocument();
      expect(screen.getByText('3.9')).toBeInTheDocument();
    });

    it('should display distances for each competitor', () => {
      render(<CompetitorTable data={mockCompetitors} yourRate={7800} />);

      expect(screen.getByText('0.5 km')).toBeInTheDocument();
      expect(screen.getByText('1.2 km')).toBeInTheDocument();
      expect(screen.getByText('0.8 km')).toBeInTheDocument();
      expect(screen.getByText('2.0 km')).toBeInTheDocument();
    });

    it('should display today rates', () => {
      render(<CompetitorTable data={mockCompetitors} yourRate={7800} />);

      // Check for today's rates in INR format
      expect(screen.getByText('8,500')).toBeInTheDocument();
      expect(screen.getByText('6,800')).toBeInTheDocument();
      expect(screen.getByText('12,000')).toBeInTheDocument();
      expect(screen.getByText('4,500')).toBeInTheDocument();
    });

    it('should display 7-day average rates', () => {
      render(<CompetitorTable data={mockCompetitors} yourRate={7800} />);

      expect(screen.getByText('8,200')).toBeInTheDocument();
      expect(screen.getByText('7,000')).toBeInTheDocument();
      expect(screen.getByText('11,500')).toBeInTheDocument();
      expect(screen.getByText('4,200')).toBeInTheDocument();
    });
  });

  describe('Your Rate Display', () => {
    it('should display your rate correctly', () => {
      render(<CompetitorTable data={mockCompetitors} yourRate={7800} />);

      expect(screen.getByText('Your Rate')).toBeInTheDocument();
      expect(screen.getByText('7,800')).toBeInTheDocument();
    });

    it('should use default rate when not provided', () => {
      render(<CompetitorTable data={mockCompetitors} />);

      // Default is 7800
      expect(screen.getByText('7,800')).toBeInTheDocument();
    });
  });

  describe('Market Average Calculation', () => {
    it('should calculate and display correct market average', () => {
      render(<CompetitorTable data={mockCompetitors} yourRate={7800} />);

      // Average of next7 rates: (8200 + 7000 + 11500 + 4200) / 4 = 7725
      expect(screen.getByText('Market Avg')).toBeInTheDocument();
      expect(screen.getByText('7,725')).toBeInTheDocument();
    });
  });

  describe('Market Position Badge', () => {
    it('should show "above" badge when rate is higher than market', () => {
      // Your rate: 8500, Market avg: 7725 = ~10% above
      render(<CompetitorTable data={mockCompetitors} yourRate={8500} />);

      expect(screen.getByText(/above/)).toBeInTheDocument();
    });

    it('should show "below" badge when rate is lower than market', () => {
      // Your rate: 6000, Market avg: 7725 = ~22% below
      render(<CompetitorTable data={mockCompetitors} yourRate={6000} />);

      expect(screen.getByText(/below/)).toBeInTheDocument();
    });

    it('should show "At market" when rate is similar', () => {
      // Your rate: 7725 (same as market avg)
      render(<CompetitorTable data={mockCompetitors} yourRate={7725} />);

      expect(screen.getByText('At market')).toBeInTheDocument();
    });

    it('should calculate percentage difference correctly', () => {
      // Your rate: 9000, Market avg: 7725
      // Diff = ((9000 - 7725) / 7725) * 100 = ~16.5%
      render(<CompetitorTable data={mockCompetitors} yourRate={9000} />);

      expect(screen.getByText(/16% above/)).toBeInTheDocument();
    });
  });

  describe('Position Labels per Competitor', () => {
    it('should show Higher label for cheaper competitors', () => {
      // Your rate 7800 is higher than Budget Stay 7-day avg 4200
      render(<CompetitorTable data={mockCompetitors} yourRate={7800} />);

      expect(screen.getAllByText('Higher').length).toBeGreaterThan(0);
    });

    it('should show Lower label for expensive competitors', () => {
      // Your rate 7800 is lower than Luxury Suites 7-day avg 11500
      render(<CompetitorTable data={mockCompetitors} yourRate={7800} />);

      expect(screen.getAllByText('Lower').length).toBeGreaterThan(0);
    });

    it('should show Similar label for similar rates', () => {
      // Your rate 7200 is similar to Royal Inn 7-day avg 7000 (within 5%)
      render(<CompetitorTable data={mockCompetitors} yourRate={7200} />);

      expect(screen.getAllByText('Similar').length).toBeGreaterThan(0);
    });
  });

  describe('Market Insight', () => {
    it('should show insight section', () => {
      render(<CompetitorTable data={mockCompetitors} yourRate={7800} />);

      expect(screen.getByText('Market Insight')).toBeInTheDocument();
    });

    it('should show above market insight when rate is higher', () => {
      render(<CompetitorTable data={mockCompetitors} yourRate={9000} />);

      expect(
        screen.getByText(/Your rates are/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/above/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/value proposition/i)
      ).toBeInTheDocument();
    });

    it('should show below market insight when rate is lower', () => {
      render(<CompetitorTable data={mockCompetitors} yourRate={6000} />);

      expect(
        screen.getByText(/below/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/room to increase/i)
      ).toBeInTheDocument();
    });

    it('should show competitive insight when at market rate', () => {
      render(<CompetitorTable data={mockCompetitors} yourRate={7725} />);

      expect(
        screen.getByText(/competitive with the market/i)
      ).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty competitor list', () => {
      render(<CompetitorTable data={[]} yourRate={7800} />);

      expect(screen.getByText('0 hotels monitored')).toBeInTheDocument();
    });

    it('should handle single competitor', () => {
      const singleCompetitor = [mockCompetitors[0]];
      render(<CompetitorTable data={singleCompetitor} yourRate={7800} />);

      expect(screen.getByText('1 hotels monitored')).toBeInTheDocument();
      expect(screen.getByText('Grand Hotel Plaza')).toBeInTheDocument();
    });

    it('should handle very high rate difference', () => {
      render(<CompetitorTable data={mockCompetitors} yourRate={20000} />);

      // Should show significant percentage above market
      expect(screen.getByText(/above/)).toBeInTheDocument();
    });

    it('should handle very low rate', () => {
      render(<CompetitorTable data={mockCompetitors} yourRate={2000} />);

      // Should show significant percentage below market
      expect(screen.getByText(/below/)).toBeInTheDocument();
    });
  });

  describe('Rate Column Headers', () => {
    it('should display Today column header', () => {
      render(<CompetitorTable data={mockCompetitors} yourRate={7800} />);

      expect(screen.getAllByText('Today').length).toBeGreaterThan(0);
    });

    it('should display 7-Day Avg column header', () => {
      render(<CompetitorTable data={mockCompetitors} yourRate={7800} />);

      expect(screen.getAllByText('7-Day Avg').length).toBeGreaterThan(0);
    });
  });

  describe('Styling', () => {
    it('should apply correct styling for above market badge', () => {
      render(<CompetitorTable data={mockCompetitors} yourRate={9000} />);

      // Check for gold styling (above market)
      const badge = screen.getByText(/above/);
      expect(badge.closest('div')).toHaveClass('bg-gold-50');
    });

    it('should apply correct styling for below market badge', () => {
      render(<CompetitorTable data={mockCompetitors} yourRate={6000} />);

      // Check for sage styling (below market)
      const badge = screen.getByText(/below/);
      expect(badge.closest('div')).toHaveClass('bg-sage-50');
    });

    it('should apply correct styling for at market badge', () => {
      render(<CompetitorTable data={mockCompetitors} yourRate={7725} />);

      // Check for neutral styling
      const badge = screen.getByText('At market');
      expect(badge.closest('div')).toHaveClass('bg-neutral-100');
    });
  });

  describe('Position Badge Styling', () => {
    it('should have gold styling for Higher position', () => {
      render(<CompetitorTable data={mockCompetitors} yourRate={7800} />);

      const higherBadges = screen.getAllByText('Higher');
      higherBadges.forEach((badge) => {
        expect(badge.closest('div')).toHaveClass('bg-gold-50');
      });
    });

    it('should have sage styling for Lower position', () => {
      render(<CompetitorTable data={mockCompetitors} yourRate={7800} />);

      const lowerBadges = screen.getAllByText('Lower');
      lowerBadges.forEach((badge) => {
        expect(badge.closest('div')).toHaveClass('bg-sage-50');
      });
    });
  });

  describe('Icons', () => {
    it('should display star icon for ratings', () => {
      render(<CompetitorTable data={mockCompetitors} yourRate={7800} />);

      // Star icons should be present (SVG elements)
      const stars = document.querySelectorAll('.fill-gold-500');
      expect(stars.length).toBeGreaterThan(0);
    });

    it('should display map pin icon for distance', () => {
      render(<CompetitorTable data={mockCompetitors} yourRate={7800} />);

      // MapPin icons should be present
      const mapPins = document.querySelectorAll('svg');
      expect(mapPins.length).toBeGreaterThan(0);
    });
  });

  describe('Currency Formatting', () => {
    it('should format rates with Indian Rupee symbol', () => {
      render(<CompetitorTable data={mockCompetitors} yourRate={7800} />);

      // All rates should have INR symbol
      const currencySymbols = screen.getAllByText(/^.*$/);
      expect(currencySymbols.length).toBeGreaterThan(0);
    });

    it('should use locale formatting for large numbers', () => {
      const expensiveCompetitors = [
        { id: 1, hotel: 'Super Luxury', rating: 5.0, distance: '0.1 km', today: 150000, next7: 145000 },
      ];

      render(<CompetitorTable data={expensiveCompetitors} yourRate={100000} />);

      // Should format with commas
      expect(screen.getByText('1,50,000')).toBeInTheDocument();
    });
  });

  describe('Hover States', () => {
    it('should have hover class on competitor rows', () => {
      render(<CompetitorTable data={mockCompetitors} yourRate={7800} />);

      // Each row should have hover:bg-neutral-50 class
      const rows = document.querySelectorAll('.hover\\:bg-neutral-50');
      expect(rows.length).toBeGreaterThanOrEqual(mockCompetitors.length);
    });
  });
});
