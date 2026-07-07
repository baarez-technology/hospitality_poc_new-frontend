import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface FormFieldProps {
  children: ReactNode;
  className?: string;
}

export const FormField = ({ children, className }: FormFieldProps) => {
  return <div className={clsx('mb-4', className)}>{children}</div>;
};
