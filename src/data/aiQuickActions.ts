// AI Quick Actions
export const aiQuickActions = [
  {
    id: 1,
    icon: '📊',
    label: 'Generate Report',
    action: 'generate-report',
    description: 'Create a comprehensive report',
    color: 'primary'
  },
  {
    id: 2,
    icon: '📧',
    label: 'Draft Email',
    action: 'draft-email',
    description: 'Compose email to guests',
    color: 'aurora'
  },
  {
    id: 3,
    icon: '🔍',
    label: 'Analyze Data',
    action: 'analyze-data',
    description: 'Deep dive into metrics',
    color: 'sunset'
  },
  {
    id: 4,
    icon: '💡',
    label: 'Get Insights',
    action: 'get-insights',
    description: 'AI-powered recommendations',
    color: 'green'
  },
  {
    id: 5,
    icon: '📅',
    label: 'Schedule Task',
    action: 'schedule-task',
    description: 'Add to calendar',
    color: 'blue'
  },
  {
    id: 6,
    icon: '🎯',
    label: 'Set Goal',
    action: 'set-goal',
    description: 'Create new objective',
    color: 'purple'
  }
];

export const getQuickActionColor = (color) => {
  const colors = {
    primary: 'bg-primary-100 text-primary-700 hover:bg-primary-200',
    aurora: 'bg-aurora-100 text-aurora-700 hover:bg-aurora-200',
    sunset: 'bg-sunset-100 text-sunset-700 hover:bg-sunset-200',
    green: 'bg-green-100 text-green-700 hover:bg-green-200',
    blue: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    purple: 'bg-purple-100 text-purple-700 hover:bg-purple-200'
  };
  return colors[color] || colors.primary;
};
