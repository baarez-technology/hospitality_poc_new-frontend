import { Suspense, ReactNode } from 'react';
import { LoadingFallback } from './LoadingFallback';

interface SuspenseWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const SuspenseWrapper = ({
  children,
  fallback = <LoadingFallback />,
}: SuspenseWrapperProps) => {
  return <Suspense fallback={fallback}>{children}</Suspense>;
};
