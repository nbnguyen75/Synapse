import logoUrl from '@/assets/images/logo.png?w=128&format=webp';

interface AppLogoProps {
  className?: string;
  size?: number;
}

export default function AppLogo({ className = 'rounded-md', size = 32 }: AppLogoProps) {
  return (
    <img
      src={logoUrl}
      alt="App Logo"
      width={size}
      height={size}
      loading="eager"
      fetchPriority="high"
      decoding="async"
      className={className}
    />
  );
}
