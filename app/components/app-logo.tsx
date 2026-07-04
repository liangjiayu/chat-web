import { cn } from '@/lib/utils';

type AppLogoProps = {
  className?: string;
};

export function AppLogo({ className }: AppLogoProps) {
  return <img alt="" aria-hidden="true" className={cn('shrink-0', className)} src="/logo.svg" />;
}
