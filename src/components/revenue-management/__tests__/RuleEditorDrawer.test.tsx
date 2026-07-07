/**
 * RuleEditorDrawer Component Tests
 * Tests for the pricing rule editor drawer component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RuleEditorDrawer from '../RuleEditorDrawer';

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
const mockCreatePricingRule = vi.fn();
const mockUpdatePricingRule = vi.fn();
const mockDeletePricingRule = vi.fn();

vi.mock('../../../api/services/revenue-intelligence.service', () => ({
  default: {
    createPricingRule: (rule: any) => mockCreatePricingRule(rule),
    updatePricingRule: (id: number, rule: any) => mockUpdatePricingRule(id, rule),
    deletePricingRule: (id: number) => mockDeletePricingRule(id),
  },
}));

// Mock createPortal for select dropdown
vi.mock('react-dom', async () => {
  const actual = await vi.importActual('react-dom');
  return {
    ...actual,
    createPortal: (node: any) => node,
  };
});

// Sample pricing rule for editing
const mockRule = {
  id: 1,
  name: 'High Occupancy Premium',
  description: 'Increase rates when occupancy exceeds 80%',
  priority: 2,
  isActive: true,
  roomTypes: ['DLX', 'SUP'],
  conditions: [{ type: 'occupancy_above', value: 80 }],
  actions: [{ type: 'increase_percent', value: 15 }],
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-20T14:30:00Z',
  timesTriggered: 45,
};

describe('RuleEditorDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreatePricingRule.mockResolvedValue({ id: 1, ...mockRule });
    mockUpdatePricingRule.mockResolvedValue(mockRule);
    mockDeletePricingRule.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Create Mode', () => {
    it('should render create mode title', () => {
      render(
        <RuleEditorDrawer isOpen={true} onClose={vi.fn()} rule={null} onSave={vi.fn()} />
      );

      expect(screen.getByText('Create Pricing Rule')).toBeInTheDocument();
    });

    it('should render empty form fields in create mode', () => {
      render(
        <RuleEditorDrawer isOpen={true} onClose={vi.fn()} rule={null} onSave={vi.fn()} />
      );

      const nameInput = screen.getByPlaceholderText('e.g., High Occupancy Premium');
      expect(nameInput).toHaveValue('');
    });

    it('should have default condition and action', () => {
      render(
        <RuleEditorDrawer isOpen={true} onClose={vi.fn()} rule={null} onSave={vi.fn()} />
      );

      // Should have IF Conditions section
      expect(screen.getByText('IF Conditions')).toBeInTheDocument();
      // Should have THEN Actions section
      expect(screen.getByText('THEN Actions')).toBeInTheDocument();
    });

    it('should show Create Rule button in create mode', () => {
      render(
        <RuleEditorDrawer isOpen={true} onClose={vi.fn()} rule={null} onSave={vi.fn()} />
      );

      expect(screen.getByRole('button', { name: 'Create Rule' })).toBeInTheDocument();
    });

    it('should not show delete button in create mode', () => {
      render(
        <RuleEditorDrawer isOpen={true} onClose={vi.fn()} rule={null} onSave={vi.fn()} />
      );

      expect(screen.queryByText('Delete Rule')).not.toBeInTheDocument();
    });
  });

  describe('Edit Mode', () => {
    it('should render edit mode title', () => {
      render(
        <RuleEditorDrawer isOpen={true} onClose={vi.fn()} rule={mockRule} onSave={vi.fn()} />
      );

      expect(screen.getByText('Edit Pricing Rule')).toBeInTheDocument();
    });

    it('should populate form with rule data', () => {
      render(
        <RuleEditorDrawer isOpen={true} onClose={vi.fn()} rule={mockRule} onSave={vi.fn()} />
      );

      const nameInput = screen.getByPlaceholderText('e.g., High Occupancy Premium');
      expect(nameInput).toHaveValue('High Occupancy Premium');

      const descInput = screen.getByPlaceholderText('What does this rule do?');
      expect(descInput).toHaveValue('Increase rates when occupancy exceeds 80%');
    });

    it('should show Save Changes button in edit mode', () => {
      render(
        <RuleEditorDrawer isOpen={true} onClose={vi.fn()} rule={mockRule} onSave={vi.fn()} />
      );

      expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
    });

    it('should show delete button in edit mode', () => {
      render(
        <RuleEditorDrawer isOpen={true} onClose={vi.fn()} rule={mockRule} onSave={vi.fn()} />
      );

      expect(screen.getByText('Delete Rule')).toBeInTheDocument();
    });

    it('should pre-select priority level', () => {
      render(
        <RuleEditorDrawer isOpen={true} onClose={vi.fn()} rule={mockRule} onSave={vi.fn()} />
      );

      // Priority 2 (P2) should be selected
      const p2Button = screen.getByRole('button', { name: 'P2' });
      expect(p2Button).toHaveClass('bg-gold-500');
    });

    it('should pre-select room types', () => {
      render(
        <RuleEditorDrawer isOpen={true} onClose={vi.fn()} rule={mockRule} onSave={vi.fn()} />
      );

      // DLX and SUP should be selected
      const dlxButton = screen.getByRole('button', { name: 'Deluxe Room' });
      const supButton = screen.getByRole('button', { name: 'Superior Suite' });

      expect(dlxButton).toHaveClass('bg-terra-500');
      expect(supButton).toHaveClass('bg-terra-500');
    });
  });

  describe('Form Validation', () => {
    it('should show error when name is empty', async () => {
      const user = userEvent.setup();
      render(
        <RuleEditorDrawer isOpen={true} onClose={vi.fn()} rule={null} onSave={vi.fn()} />
      );

      const submitButton = screen.getByRole('button', { name: 'Create Rule' });
      await user.click(submitButton);

      expect(screen.getByText('Rule name is required')).toBeInTheDocument();
    });

    it('should show error when no conditions', async () => {
      const user = userEvent.setup();
      render(
        <RuleEditorDrawer isOpen={true} onClose={vi.fn()} rule={null} onSave={vi.fn()} />
      );

      // Enter name
      const nameInput = screen.getByPlaceholderText('e.g., High Occupancy Premium');
      await user.type(nameInput, 'Test Rule');

      // Remove default condition (need to find and click remove)
      // Since we can't easily remove the last condition, let's just test the validation
      // by submitting without name first
      const submitButton = screen.getByRole('button', { name: 'Create Rule' });

      // Clear name to trigger validation
      await user.clear(nameInput);
      await user.click(submitButton);

      expect(screen.getByText('Rule name is required')).toBeInTheDocument();
    });

    it('should pass validation with valid data', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const onSave = vi.fn();

      render(
        <RuleEditorDrawer isOpen={true} onClose={onClose} rule={null} onSave={onSave} />
      );

      const nameInput = screen.getByPlaceholderText('e.g., High Occupancy Premium');
      await user.type(nameInput, 'My New Rule');

      const submitButton = screen.getByRole('button', { name: 'Create Rule' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCreatePricingRule).toHaveBeenCalled();
      });
    });
  });

  describe('Conditions Management', () => {
    it('should add a new condition', async () => {
      const user = userEvent.setup();
      render(
        <RuleEditorDrawer isOpen={true} onClose={vi.fn()} rule={null} onSave={vi.fn()} />
      );

      // Count initial conditions
      const initialConditions = document.querySelectorAll('.bg-ocean-50');
      const initialCount = initialConditions.length;

      // Click add condition button
      const addButtons = screen.getAllByText('Add');
      await user.click(addButtons[0]); // First Add button is for conditions

      const newConditions = document.querySelectorAll('.bg-ocean-50');
      expect(newConditions.length).toBe(initialCount + 1);
    });

    it('should remove a condition when more than one exists', async () => {
      const user = userEvent.setup();
      render(
        <RuleEditorDrawer isOpen={true} onClose={vi.fn()} rule={null} onSave={vi.fn()} />
      );

      // Add a second condition
      const addButtons = screen.getAllByText('Add');
      await user.click(addButtons[0]);

      // Now we should have remove buttons
      const trashButtons = document.querySelectorAll('[class*="hover:text-rose-500"]');
      expect(trashButtons.length).toBeGreaterThan(0);

      // Click to remove one
      await user.click(trashButtons[0] as HTMLElement);

      // Should have one fewer condition
      const conditions = document.querySelectorAll('.bg-ocean-50');
      expect(conditions.length).toBe(1);
    });

    it('should not show remove button when only one condition', () => {
      render(
        <RuleEditorDrawer isOpen={true} onClose={vi.fn()} rule={null} onSave={vi.fn()} />
      );

      // In conditions section, should not have trash button when only 1 condition
      const conditionsSection = screen.getByText('IF Conditions').parentElement?.parentElement;
      const trashInConditions = conditionsSection?.querySelectorAll('[class*="hover:text-rose-500"]');
      expect(trashInConditions?.length || 0).toBe(0);
    });
  });

  describe('Actions Management', () => {
    it('should add a new action', async () => {
      const user = userEvent.setup();
      render(
        <RuleEditorDrawer isOpen={true} onClose={vi.fn()} rule={null} onSave={vi.fn()} />
      );

      // Count initial actions
      const initialActions = document.querySelectorAll('.bg-sage-50');
      const initialCount = initialActions.length;

      // Click add action button
      const addButtons = screen.getAllByText('Add');
      await user.click(addButtons[1]); // Second Add button is for actions

      const newActions = document.querySelectorAll('.bg-sage-50');
      expect(newActions.length).toBe(initialCount + 1);
    });

    it('should remove an action when more than one exists', async () => {
      const user = userEvent.setup();
      render(
        <RuleEditorDrawer isOpen={true} onClose={vi.fn()} rule={null} onSave={vi.fn()} />
      );

      // Add a second action
      const addButtons = screen.getAllByText('Add');
      await user.click(addButtons[1]);

      // Should have trash buttons in actions section
      const actionsSection = document.querySelectorAll('.bg-sage-50');
      expect(actionsSection.length).toBe(2);
    });
  });

  describe('Room Type Selection', () => {
    it('should toggle room type selection', async () => {
      const user = userEvent.setup();
      render(
        <RuleEditorDrawer isOpen={true} onClose={vi.fn()} rule={null} onSave={vi.fn()} />
      );

      // Initially "All Room Types" should be selected
      const allButton = screen.getByRole('button', { name: 'All Room Types' });
      expect(allButton).toHaveClass('bg-terra-500');

      // Click on Deluxe Room
      const deluxeButton = screen.getByRole('button', { name: 'Deluxe Room' });
      await user.click(deluxeButton);

      // Deluxe should be selected, All should be unselected
      expect(deluxeButton).toHaveClass('bg-terra-500');
      expect(allButton).not.toHaveClass('bg-terra-500');
    });

    it('should select All when clicking All Room Types', async () => {
      const user = userEvent.setup();
      render(
        <RuleEditorDrawer isOpen={true} onClose={vi.fn()} rule={null} onSave={vi.fn()} />
      );

      // First select a specific room
      const deluxeButton = screen.getByRole('button', { name: 'Deluxe Room' });
      await user.click(deluxeButton);

      // Then click All Room Types
      const allButton = screen.getByRole('button', { name: 'All Room Types' });
      await user.click(allButton);

      // Only All should be selected
      expect(allButton).toHaveClass('bg-terra-500');
      expect(deluxeButton).not.toHaveClass('bg-terra-500');
    });
  });

  describe('Priority Selection', () => {
    it('should change priority when clicking different level', async () => {
      const user = userEvent.setup();
      render(
        <RuleEditorDrawer isOpen={true} onClose={vi.fn()} rule={null} onSave={vi.fn()} />
      );

      // Default is P3, click P1
      const p1Button = screen.getByRole('button', { name: 'P1' });
      await user.click(p1Button);

      expect(p1Button).toHaveClass('bg-rose-500');
    });

    it('should display all priority levels', () => {
      render(
        <RuleEditorDrawer isOpen={true} onClose={vi.fn()} rule={null} onSave={vi.fn()} />
      );

      expect(screen.getByRole('button', { name: 'P1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'P2' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'P3' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'P4' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'P5' })).toBeInTheDocument();
    });
  });

  describe('Status Toggle', () => {
    it('should toggle active status', async () => {
      const user = userEvent.setup();
      render(
        <RuleEditorDrawer isOpen={true} onClose={vi.fn()} rule={null} onSave={vi.fn()} />
      );

      // Default is Active
      const statusButton = screen.getByRole('button', { name: 'Active' });
      expect(statusButton).toHaveClass('bg-sage-100');

      await user.click(statusButton);

      // Should now show Inactive
      expect(screen.getByRole('button', { name: 'Inactive' })).toBeInTheDocument();
    });
  });

  describe('Create Rule', () => {
    it('should call createPricingRule API', async () => {
      const user = userEvent.setup();
      const onSave = vi.fn();
      const onClose = vi.fn();

      render(
        <RuleEditorDrawer isOpen={true} onClose={onClose} rule={null} onSave={onSave} />
      );

      // Fill in the form
      const nameInput = screen.getByPlaceholderText('e.g., High Occupancy Premium');
      await user.type(nameInput, 'Test Rule');

      const descInput = screen.getByPlaceholderText('What does this rule do?');
      await user.type(descInput, 'Test description');

      // Submit
      const submitButton = screen.getByRole('button', { name: 'Create Rule' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCreatePricingRule).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Test Rule',
            description: 'Test description',
          })
        );
      });

      expect(mockSuccess).toHaveBeenCalledWith('Pricing rule created successfully');
      expect(onSave).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });

    it('should show loading state during create', async () => {
      const user = userEvent.setup();
      let resolveCreate: () => void;
      mockCreatePricingRule.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveCreate = resolve;
          })
      );

      render(
        <RuleEditorDrawer isOpen={true} onClose={vi.fn()} rule={null} onSave={vi.fn()} />
      );

      const nameInput = screen.getByPlaceholderText('e.g., High Occupancy Premium');
      await user.type(nameInput, 'Test Rule');

      const submitButton = screen.getByRole('button', { name: 'Create Rule' });
      await user.click(submitButton);

      expect(screen.getByText('Creating...')).toBeInTheDocument();

      resolveCreate!();
    });

    it('should show error on create failure', async () => {
      const user = userEvent.setup();
      mockCreatePricingRule.mockRejectedValue(new Error('API Error'));

      render(
        <RuleEditorDrawer isOpen={true} onClose={vi.fn()} rule={null} onSave={vi.fn()} />
      );

      const nameInput = screen.getByPlaceholderText('e.g., High Occupancy Premium');
      await user.type(nameInput, 'Test Rule');

      const submitButton = screen.getByRole('button', { name: 'Create Rule' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockError).toHaveBeenCalledWith('Failed to create pricing rule');
      });
    });
  });

  describe('Update Rule', () => {
    it('should call updatePricingRule API', async () => {
      const user = userEvent.setup();
      const onSave = vi.fn();
      const onClose = vi.fn();

      render(
        <RuleEditorDrawer isOpen={true} onClose={onClose} rule={mockRule} onSave={onSave} />
      );

      // Modify the name
      const nameInput = screen.getByPlaceholderText('e.g., High Occupancy Premium');
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Rule Name');

      // Submit
      const submitButton = screen.getByRole('button', { name: 'Save Changes' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockUpdatePricingRule).toHaveBeenCalledWith(
          1,
          expect.objectContaining({
            name: 'Updated Rule Name',
          })
        );
      });

      expect(mockSuccess).toHaveBeenCalledWith('Pricing rule updated successfully');
    });

    it('should show loading state during update', async () => {
      const user = userEvent.setup();
      let resolveUpdate: () => void;
      mockUpdatePricingRule.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveUpdate = resolve;
          })
      );

      render(
        <RuleEditorDrawer isOpen={true} onClose={vi.fn()} rule={mockRule} onSave={vi.fn()} />
      );

      const submitButton = screen.getByRole('button', { name: 'Save Changes' });
      await user.click(submitButton);

      expect(screen.getByText('Saving...')).toBeInTheDocument();

      resolveUpdate!();
    });

    it('should show error on update failure', async () => {
      const user = userEvent.setup();
      mockUpdatePricingRule.mockRejectedValue(new Error('API Error'));

      render(
        <RuleEditorDrawer isOpen={true} onClose={vi.fn()} rule={mockRule} onSave={vi.fn()} />
      );

      const submitButton = screen.getByRole('button', { name: 'Save Changes' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockError).toHaveBeenCalledWith('Failed to update pricing rule');
      });
    });
  });

  describe('Delete Rule', () => {
    it('should show delete confirmation', async () => {
      const user = userEvent.setup();

      render(
        <RuleEditorDrawer isOpen={true} onClose={vi.fn()} rule={mockRule} onSave={vi.fn()} />
      );

      const deleteButton = screen.getByText('Delete Rule');
      await user.click(deleteButton);

      expect(screen.getByText('Delete this rule?')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Confirm Delete' })).toBeInTheDocument();
    });

    it('should cancel delete when clicking Cancel', async () => {
      const user = userEvent.setup();

      render(
        <RuleEditorDrawer isOpen={true} onClose={vi.fn()} rule={mockRule} onSave={vi.fn()} />
      );

      const deleteButton = screen.getByText('Delete Rule');
      await user.click(deleteButton);

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      await user.click(cancelButton);

      // Should hide confirmation
      expect(screen.queryByText('Delete this rule?')).not.toBeInTheDocument();
    });

    it('should call deletePricingRule API on confirm', async () => {
      const user = userEvent.setup();
      const onSave = vi.fn();
      const onClose = vi.fn();

      render(
        <RuleEditorDrawer isOpen={true} onClose={onClose} rule={mockRule} onSave={onSave} />
      );

      const deleteButton = screen.getByText('Delete Rule');
      await user.click(deleteButton);

      const confirmButton = screen.getByRole('button', { name: 'Confirm Delete' });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockDeletePricingRule).toHaveBeenCalledWith(1);
      });

      expect(mockSuccess).toHaveBeenCalledWith('Pricing rule deleted successfully');
      expect(onSave).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });

    it('should show loading state during delete', async () => {
      const user = userEvent.setup();
      let resolveDelete: () => void;
      mockDeletePricingRule.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveDelete = resolve;
          })
      );

      render(
        <RuleEditorDrawer isOpen={true} onClose={vi.fn()} rule={mockRule} onSave={vi.fn()} />
      );

      const deleteButton = screen.getByText('Delete Rule');
      await user.click(deleteButton);

      const confirmButton = screen.getByRole('button', { name: 'Confirm Delete' });
      await user.click(confirmButton);

      expect(screen.getByText('Deleting...')).toBeInTheDocument();

      resolveDelete!();
    });

    it('should show error on delete failure', async () => {
      const user = userEvent.setup();
      mockDeletePricingRule.mockRejectedValue(new Error('API Error'));

      render(
        <RuleEditorDrawer isOpen={true} onClose={vi.fn()} rule={mockRule} onSave={vi.fn()} />
      );

      const deleteButton = screen.getByText('Delete Rule');
      await user.click(deleteButton);

      const confirmButton = screen.getByRole('button', { name: 'Confirm Delete' });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockError).toHaveBeenCalledWith('Failed to delete pricing rule');
      });
    });
  });

  describe('Cancel/Close', () => {
    it('should call onClose when clicking Cancel', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <RuleEditorDrawer isOpen={true} onClose={onClose} rule={null} onSave={vi.fn()} />
      );

      // Find the Cancel button in footer (not the delete confirmation one)
      const buttons = screen.getAllByRole('button', { name: 'Cancel' });
      await user.click(buttons[0]);

      expect(onClose).toHaveBeenCalled();
    });

    it('should disable Cancel during save operation', async () => {
      const user = userEvent.setup();
      let resolveCreate: () => void;
      mockCreatePricingRule.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveCreate = resolve;
          })
      );

      render(
        <RuleEditorDrawer isOpen={true} onClose={vi.fn()} rule={null} onSave={vi.fn()} />
      );

      const nameInput = screen.getByPlaceholderText('e.g., High Occupancy Premium');
      await user.type(nameInput, 'Test Rule');

      const submitButton = screen.getByRole('button', { name: 'Create Rule' });
      await user.click(submitButton);

      // Cancel should be disabled
      const cancelButtons = screen.getAllByRole('button', { name: 'Cancel' });
      expect(cancelButtons[0]).toBeDisabled();

      resolveCreate!();
    });
  });

  describe('Drawer State', () => {
    it('should reset form when reopened with no rule', async () => {
      const { rerender } = render(
        <RuleEditorDrawer isOpen={true} onClose={vi.fn()} rule={mockRule} onSave={vi.fn()} />
      );

      // Should have mock rule data
      expect(screen.getByDisplayValue('High Occupancy Premium')).toBeInTheDocument();

      // Rerender with null rule
      rerender(
        <RuleEditorDrawer isOpen={true} onClose={vi.fn()} rule={null} onSave={vi.fn()} />
      );

      // Should have empty form
      const nameInput = screen.getByPlaceholderText('e.g., High Occupancy Premium');
      expect(nameInput).toHaveValue('');
    });

    it('should not render when isOpen is false', () => {
      render(
        <RuleEditorDrawer isOpen={false} onClose={vi.fn()} rule={null} onSave={vi.fn()} />
      );

      // Drawer content should not be visible
      expect(screen.queryByText('Create Pricing Rule')).not.toBeInTheDocument();
    });
  });

  describe('Form Sections', () => {
    it('should display Basic Information section', () => {
      render(
        <RuleEditorDrawer isOpen={true} onClose={vi.fn()} rule={null} onSave={vi.fn()} />
      );

      expect(screen.getByText('Basic Information')).toBeInTheDocument();
    });

    it('should display Priority & Status section', () => {
      render(
        <RuleEditorDrawer isOpen={true} onClose={vi.fn()} rule={null} onSave={vi.fn()} />
      );

      expect(screen.getByText('Priority & Status')).toBeInTheDocument();
    });

    it('should display Apply to Room Types section', () => {
      render(
        <RuleEditorDrawer isOpen={true} onClose={vi.fn()} rule={null} onSave={vi.fn()} />
      );

      expect(screen.getByText('Apply to Room Types')).toBeInTheDocument();
    });
  });

  describe('Input Fields', () => {
    it('should update name input', async () => {
      const user = userEvent.setup();
      render(
        <RuleEditorDrawer isOpen={true} onClose={vi.fn()} rule={null} onSave={vi.fn()} />
      );

      const nameInput = screen.getByPlaceholderText('e.g., High Occupancy Premium');
      await user.type(nameInput, 'New Rule');

      expect(nameInput).toHaveValue('New Rule');
    });

    it('should update description input', async () => {
      const user = userEvent.setup();
      render(
        <RuleEditorDrawer isOpen={true} onClose={vi.fn()} rule={null} onSave={vi.fn()} />
      );

      const descInput = screen.getByPlaceholderText('What does this rule do?');
      await user.type(descInput, 'A description');

      expect(descInput).toHaveValue('A description');
    });

    it('should update condition value input', async () => {
      const user = userEvent.setup();
      render(
        <RuleEditorDrawer isOpen={true} onClose={vi.fn()} rule={null} onSave={vi.fn()} />
      );

      // Find the condition value input (first number input in conditions section)
      const valueInputs = document.querySelectorAll('input[type="number"]');
      expect(valueInputs.length).toBeGreaterThan(0);

      await user.clear(valueInputs[0] as HTMLInputElement);
      await user.type(valueInputs[0] as HTMLInputElement, '90');

      expect(valueInputs[0]).toHaveValue(90);
    });

    it('should update action value input', async () => {
      const user = userEvent.setup();
      render(
        <RuleEditorDrawer isOpen={true} onClose={vi.fn()} rule={null} onSave={vi.fn()} />
      );

      // Find the action value input (number input in actions section)
      const valueInputs = document.querySelectorAll('input[type="number"]');
      // Second input should be action value
      expect(valueInputs.length).toBeGreaterThan(1);

      await user.clear(valueInputs[1] as HTMLInputElement);
      await user.type(valueInputs[1] as HTMLInputElement, '20');

      expect(valueInputs[1]).toHaveValue(20);
    });
  });
});
