/**
 * Glimmora UI Component Library v2
 * Centralized exports for all reusable UI components
 *
 * Custom React components with glassmorphic design system
 */

// Core Components
export { default as Button } from './Button'
export { default as Modal } from './Modal'
export { default as Drawer } from './Drawer'
export { default as Input } from './Input'
export { default as Dropdown } from './Dropdown'
export { default as Breadcrumb } from './Breadcrumb'
export { default as Tooltip, InfoTooltip } from './Tooltip'
export { default as ConfirmDialog } from './ConfirmDialog'
export { default as CustomDropdown } from './CustomDropdown'
export { default as SearchHighlight } from './SearchHighlight'
export { default as Label } from './Label'
export { default as Separator } from './Separator'

// Card Components - Glimmora Design System v2
export { default as Card, KPICard, StatCard, SimpleCard, ActionCard, MetricCard } from './Card'

// Badge Components - Glimmora Design System v2
export { default as Badge, StatusBadge, SourceBadge, RoomTypeBadge, NotificationBadge } from './Badge'

// Avatar Components - Glimmora Design System v2
export { default as Avatar, AvatarGroup, getInitials, getAvatarVariant } from './Avatar'

// Alert Components - Glimmora Design System v2
export { default as Alert, ToastAlert } from './Alert'

// Form Controls - Glimmora Design System v2
export { default as Toggle, Checkbox, Radio, RadioGroup } from './Toggle'

// Tabs
export { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs'

// Select
export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from './Select'

// Table
export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
  TableFooter,
} from './Table'

// BaseModal and all sub-components
export {
  default as BaseModal,
  ModalContent,
  ModalSectionHeader,
  ModalLabel,
  ModalInput,
  ModalTextarea,
  ModalSelect,
  ModalSelectionCard,
  ModalPrimaryButton,
  ModalSecondaryButton,
  ModalError,
  ModalInfoCard,
  ModalHighlightCard,
  ModalCounter,
  ModalBadge,
} from './BaseModal'

// Charts & KPIs - Glimmora Design System v2
export {
  KPICard as KPICardBasic,
  KPICardSparklineBar,
  KPICardSparklineLine,
  KPICardHero,
  ProgressRing,
  ProgressBar,
  KPICardGradient,
  KPICardDark,
  KPICardSplit,
  ActivityStatsCard,
  MiniStat,
} from './Charts'
