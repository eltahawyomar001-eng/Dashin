'use client';

import { useWebSocket, type ConnectionState } from '@/hooks/useWebSocket';
import { cn } from '@dashin/ui';

interface ConnectionStatusProps {
  className?: string;
  showLabel?: boolean;
  onReconnect?: () => void;
}

const statusConfig: Record<
  ConnectionState,
  {
    color: string;
    bgColor: string;
    label: string;
    icon: string;
  }
> = {
  connected: {
    color: 'text-green-600',
    bgColor: 'bg-green-500',
    label: 'Connected',
    icon: '●',
  },
  connecting: {
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-500',
    label: 'Connecting...',
    icon: '●',
  },
  reconnecting: {
    color: 'text-orange-600',
    bgColor: 'bg-orange-500',
    label: 'Reconnecting...',
    icon: '●',
  },
  disconnected: {
    color: 'text-gray-600',
    bgColor: 'bg-gray-500',
    label: 'Disconnected',
    icon: '●',
  },
  error: {
    color: 'text-red-600',
    bgColor: 'bg-red-500',
    label: 'Connection Error',
    icon: '●',
  },
};

export function ConnectionStatus({
  className,
  showLabel = true,
  onReconnect,
}: ConnectionStatusProps) {
  const { connectionState, error, reconnect } = useWebSocket({
    enabled: true,
  });

  const config = statusConfig[connectionState];

  const handleClick = () => {
    if (connectionState === 'error' || connectionState === 'disconnected') {
      reconnect();
      onReconnect?.();
    }
  };

  const isClickable =
    connectionState === 'error' || connectionState === 'disconnected';

  return (
    <div
      className={cn(
        'flex items-center gap-2',
        isClickable && 'cursor-pointer hover:opacity-80',
        className
      )}
      onClick={isClickable ? handleClick : undefined}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          handleClick();
        }
      }}
      title={
        isClickable
          ? 'Click to reconnect'
          : error
            ? error.message
            : config.label
      }
    >
      {/* Animated status dot */}
      <div className="relative flex h-3 w-3 items-center justify-center">
        {/* Pulse animation for connecting/reconnecting states */}
        {(connectionState === 'connecting' ||
          connectionState === 'reconnecting') && (
          <span
            className={cn(
              'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
              config.bgColor
            )}
          />
        )}
        {/* Status dot */}
        <span
          className={cn('relative inline-flex h-2 w-2 rounded-full', config.bgColor)}
        />
      </div>

      {/* Status label */}
      {showLabel && (
        <span className={cn('text-sm font-medium', config.color)}>
          {config.label}
        </span>
      )}

      {/* Reconnect hint for errors */}
      {isClickable && showLabel && (
        <span className="text-xs text-gray-500">(click to reconnect)</span>
      )}
    </div>
  );
}

// Compact version for use in headers/nav
export function ConnectionStatusBadge({ className }: { className?: string }) {
  return (
    <ConnectionStatus
      className={cn('rounded-full bg-white/5 px-3 py-1.5', className)}
      showLabel={false}
    />
  );
}
