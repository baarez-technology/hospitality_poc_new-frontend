import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { Check, ChevronRight, Circle } from "lucide-react"

import { cn } from "@/lib/utils"

const DropdownMenu = DropdownMenuPrimitive.Root
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger
const DropdownMenuGroup = DropdownMenuPrimitive.Group
const DropdownMenuPortal = DropdownMenuPrimitive.Portal
const DropdownMenuSub = DropdownMenuPrimitive.Sub
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

const DropdownMenuSubTrigger = React.forwardRef(
  ({ className, inset, children, ...props }, ref) => (
    <DropdownMenuPrimitive.SubTrigger
      ref={ref}
      className={cn(
        "flex cursor-default select-none items-center rounded-lg px-3 py-2.5 text-sm outline-none",
        "transition-all duration-200 ease-out",
        "focus:bg-gradient-to-r focus:from-terra-50 focus:to-copper-50/50",
        "data-[state=open]:bg-gradient-to-r data-[state=open]:from-terra-50 data-[state=open]:to-copper-50/50",
        inset && "pl-8",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRight className="ml-auto h-4 w-4 text-neutral-400 transition-transform duration-200 group-data-[state=open]:rotate-90" />
    </DropdownMenuPrimitive.SubTrigger>
  )
)
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName

const DropdownMenuSubContent = React.forwardRef(
  ({ className, ...props }, ref) => (
    <DropdownMenuPrimitive.SubContent
      ref={ref}
      className={cn(
        // Glassmorphism container
        "z-50 min-w-[max(11rem,var(--radix-popper-anchor-width))] overflow-hidden",
        "rounded-xl border border-white/60 bg-white/95 backdrop-blur-xl backdrop-saturate-150",
        "p-1.5 text-neutral-900",
        // Premium shadow stack
        "shadow-[0_4px_6px_-1px_rgba(165,120,101,0.05),0_10px_15px_-3px_rgba(165,120,101,0.08),0_20px_25px_-5px_rgba(0,0,0,0.05)]",
        // Animations
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
        "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  )
)
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName

const DropdownMenuContent = React.forwardRef(
  ({ className, sideOffset = 6, ...props }, ref) => (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          // Glassmorphism container
          "z-50 min-w-[max(11rem,var(--radix-popper-anchor-width))] overflow-hidden",
          "rounded-xl border border-white/60 bg-white/95 backdrop-blur-xl backdrop-saturate-150",
          "p-1.5 text-neutral-900",
          // Premium shadow stack with warm terra undertones
          "shadow-[0_4px_6px_-1px_rgba(165,120,101,0.05),0_10px_15px_-3px_rgba(165,120,101,0.08),0_20px_25px_-5px_rgba(0,0,0,0.05),0_0_0_1px_rgba(165,120,101,0.03)]",
          // Ring highlight at top
          "before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white before:to-transparent",
          // Animations - scale + fade
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
          "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          // Origin for scale animation
          "origin-[var(--radix-dropdown-menu-content-transform-origin)]",
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
)
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

const DropdownMenuItem = React.forwardRef(
  ({ className, inset, ...props }, ref) => (
    <DropdownMenuPrimitive.Item
      ref={ref}
      className={cn(
        // Base styles
        "group relative flex cursor-pointer select-none items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm outline-none",
        "transition-all duration-200 ease-out",
        // Left accent border (hidden by default, shown on focus)
        "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-0 before:w-[3px] before:rounded-full before:bg-terra-500 before:transition-all before:duration-200",
        // Hover & Focus states
        "hover:bg-gradient-to-r hover:from-neutral-50 hover:to-copper-50/30",
        "focus:bg-gradient-to-r focus:from-terra-50/80 focus:to-copper-50/40 focus:before:h-5",
        // Active state
        "active:scale-[0.98] active:bg-terra-100/50",
        // Disabled state
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
        inset && "pl-8",
        className
      )}
      {...props}
    />
  )
)
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

const DropdownMenuCheckboxItem = React.forwardRef(
  ({ className, children, checked, ...props }, ref) => (
    <DropdownMenuPrimitive.CheckboxItem
      ref={ref}
      className={cn(
        "group relative flex cursor-pointer select-none items-center rounded-lg py-2.5 pl-9 pr-3 text-sm outline-none",
        "transition-all duration-200 ease-out",
        "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-0 before:w-[3px] before:rounded-full before:bg-terra-500 before:transition-all before:duration-200",
        "hover:bg-gradient-to-r hover:from-neutral-50 hover:to-copper-50/30",
        "focus:bg-gradient-to-r focus:from-terra-50/80 focus:to-copper-50/40 focus:before:h-5",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="absolute left-2.5 flex h-4 w-4 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator className="animate-in zoom-in-50 fade-in-0 duration-200">
          <Check className="h-4 w-4 text-terra-600" strokeWidth={2.5} />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
)
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName

const DropdownMenuRadioItem = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <DropdownMenuPrimitive.RadioItem
      ref={ref}
      className={cn(
        "group relative flex cursor-pointer select-none items-center rounded-lg py-2.5 pl-9 pr-3 text-sm outline-none",
        "transition-all duration-200 ease-out",
        "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-0 before:w-[3px] before:rounded-full before:bg-terra-500 before:transition-all before:duration-200",
        "hover:bg-gradient-to-r hover:from-neutral-50 hover:to-copper-50/30",
        "focus:bg-gradient-to-r focus:from-terra-50/80 focus:to-copper-50/40 focus:before:h-5",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
        className
      )}
      {...props}
    >
      <span className="absolute left-2.5 flex h-4 w-4 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator className="animate-in zoom-in-50 fade-in-0 duration-200">
          <Circle className="h-2 w-2 fill-terra-600 text-terra-600" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  )
)
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

const DropdownMenuLabel = React.forwardRef(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      "px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

const DropdownMenuSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn(
      "my-1.5 h-px",
      // Gradient separator with fade effect
      "bg-gradient-to-r from-transparent via-terra-200/60 to-transparent",
      className
    )}
    {...props}
  />
))
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

const DropdownMenuShortcut = ({ className, ...props }) => (
  <span
    className={cn(
      "ml-auto pl-4 text-[10px] font-medium tracking-wider text-neutral-400/80",
      "inline-flex items-center gap-0.5",
      className
    )}
    {...props}
  />
)
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
}
