'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';
import type {
  JobProgressEvent,
  CampaignUpdateEvent,
  LeadUpdateEvent,
  NotificationEvent,
} from '@dashin/shared-types';
import {
  campaignKeys,
  leadKeys,
  scrapingJobKeys,
  analyticsKeys,
} from './queryKeys';

// Connection states
export type ConnectionState =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error'
  | 'reconnecting';

interface UseWebSocketOptions {
  enabled?: boolean;
  onJobProgress?: (event: JobProgressEvent) => void;
  onCampaignUpdate?: (event: CampaignUpdateEvent) => void;
  onLeadUpdate?: (event: LeadUpdateEvent) => void;
  onNotification?: (event: NotificationEvent) => void;
}

interface UseWebSocketReturn {
  connectionState: ConnectionState;
  isConnected: boolean;
  error: Error | null;
  reconnect: () => void;
}

// Exponential backoff configuration
const INITIAL_RETRY_DELAY = 1000; // 1s
const MAX_RETRY_DELAY = 60000; // 60s
const MAX_RETRIES = 10;

export function useWebSocket(
  options: UseWebSocketOptions = {}
): UseWebSocketReturn {
  const {
    enabled = true,
    onJobProgress,
    onCampaignUpdate,
    onLeadUpdate,
    onNotification,
  } = options;

  const [connectionState, setConnectionState] =
    useState<ConnectionState>('disconnected');
  const [error, setError] = useState<Error | null>(null);

  const queryClient = useQueryClient();
  const supabaseRef = useRef<any>(null);
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelsRef = useRef<any[]>([]);

  // Calculate retry delay with exponential backoff
  const getRetryDelay = useCallback(() => {
    const delay = Math.min(
      INITIAL_RETRY_DELAY * Math.pow(2, retryCountRef.current),
      MAX_RETRY_DELAY
    );
    return delay;
  }, []);

  // Initialize Supabase client
  const initializeSupabase = useCallback(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      const err = new Error(
        'Supabase URL or Anon Key not configured. WebSocket disabled.'
      );
      setError(err);
      setConnectionState('error');
      return null;
    }

    return createClient(url, anonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  }, []);

  // Handle job progress updates
  const handleJobProgress = useCallback(
    (payload: any) => {
      const event: JobProgressEvent = {
        jobId: payload.new.id,
        progress: payload.new.progress || 0,
        status: payload.new.status,
        recordsProcessed: payload.new.records_processed || 0,
        errors: payload.new.errors || 0,
      };

      // Invalidate scraping job queries
      queryClient.invalidateQueries({
        queryKey: scrapingJobKeys.detail(event.jobId),
      });
      queryClient.invalidateQueries({
        queryKey: scrapingJobKeys.all,
      });

      // Call custom handler
      onJobProgress?.(event);
    },
    [queryClient, onJobProgress]
  );

  // Handle campaign updates
  const handleCampaignUpdate = useCallback(
    (payload: any) => {
      const event: CampaignUpdateEvent = {
        campaignId: payload.new.id,
        metrics: {
          totalLeads: payload.new.total_leads || 0,
          qualifiedLeads: payload.new.qualified_leads || 0,
        },
      };

      // Invalidate campaign queries
      queryClient.invalidateQueries({
        queryKey: campaignKeys.detail(event.campaignId),
      });
      queryClient.invalidateQueries({
        queryKey: campaignKeys.analytics(event.campaignId),
      });
      queryClient.invalidateQueries({
        queryKey: analyticsKeys.overview,
      });

      // Call custom handler
      onCampaignUpdate?.(event);
    },
    [queryClient, onCampaignUpdate]
  );

  // Handle lead updates
  const handleLeadUpdate = useCallback(
    (payload: any) => {
      const event: LeadUpdateEvent = {
        leadId: payload.new.id,
        status: payload.new.status,
        assignedTo: payload.new.assigned_to,
        updatedAt: payload.new.updated_at || new Date().toISOString(),
      };

      // Invalidate lead queries
      queryClient.invalidateQueries({
        queryKey: leadKeys.detail(event.leadId),
      });
      queryClient.invalidateQueries({
        queryKey: leadKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: analyticsKeys.leads(),
      });

      // Call custom handler
      onLeadUpdate?.(event);
    },
    [queryClient, onLeadUpdate]
  );

  // Handle notifications
  const handleNotification = useCallback(
    (payload: any) => {
      const event: NotificationEvent = {
        id: payload.id || crypto.randomUUID(),
        type: payload.type || 'info',
        title: payload.title || 'Notification',
        message: payload.message,
        timestamp: payload.timestamp || new Date().toISOString(),
      };

      // Call custom handler
      onNotification?.(event);
    },
    [onNotification]
  );

  // Subscribe to database changes
  const subscribe = useCallback(() => {
    if (!supabaseRef.current) return;

    setConnectionState('connecting');

    try {
      // Subscribe to scraping_jobs table
      const jobsChannel = supabaseRef.current
        .channel('scraping_jobs_changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'scraping_jobs',
            filter: 'status=in.(running,pending)',
          },
          handleJobProgress
        )
        .subscribe((status: string) => {
          if (status === 'SUBSCRIBED') {
            console.log('✅ Subscribed to scraping_jobs updates');
          } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ Error subscribing to scraping_jobs');
            setConnectionState('error');
          }
        });

      // Subscribe to campaigns table
      const campaignsChannel = supabaseRef.current
        .channel('campaigns_changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'campaigns',
          },
          handleCampaignUpdate
        )
        .subscribe((status: string) => {
          if (status === 'SUBSCRIBED') {
            console.log('✅ Subscribed to campaigns updates');
          } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ Error subscribing to campaigns');
            setConnectionState('error');
          }
        });

      // Subscribe to leads table
      const leadsChannel = supabaseRef.current
        .channel('leads_changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'leads',
          },
          handleLeadUpdate
        )
        .subscribe((status: string) => {
          if (status === 'SUBSCRIBED') {
            console.log('✅ Subscribed to leads updates');
          } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ Error subscribing to leads');
            setConnectionState('error');
          }
        });

      // Subscribe to notifications broadcast channel
      const notificationsChannel = supabaseRef.current
        .channel('notifications')
        .on('broadcast', { event: 'notification' }, ({ payload }: { payload: any }) => {
          handleNotification(payload);
        })
        .subscribe((status: string) => {
          if (status === 'SUBSCRIBED') {
            console.log('✅ Subscribed to notifications');
          } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ Error subscribing to notifications');
            setConnectionState('error');
          }
        });

      // Store channel references for cleanup
      channelsRef.current = [
        jobsChannel,
        campaignsChannel,
        leadsChannel,
        notificationsChannel,
      ];

      setConnectionState('connected');
      setError(null);
      retryCountRef.current = 0; // Reset retry count on successful connection
    } catch (err) {
      console.error('❌ WebSocket subscription error:', err);
      setError(err instanceof Error ? err : new Error('Subscription failed'));
      setConnectionState('error');
      scheduleReconnect();
    }
  }, [
    handleJobProgress,
    handleCampaignUpdate,
    handleLeadUpdate,
    handleNotification,
  ]);

  // Unsubscribe from all channels
  const unsubscribe = useCallback(() => {
    if (channelsRef.current.length > 0) {
      channelsRef.current.forEach((channel) => {
        supabaseRef.current?.removeChannel(channel);
      });
      channelsRef.current = [];
      console.log('🔌 Unsubscribed from all channels');
    }
  }, []);

  // Schedule reconnection with exponential backoff
  const scheduleReconnect = useCallback(() => {
    if (retryCountRef.current >= MAX_RETRIES) {
      console.error(
        `❌ Max retries (${MAX_RETRIES}) reached. Giving up reconnection.`
      );
      setConnectionState('error');
      return;
    }

    const delay = getRetryDelay();
    retryCountRef.current += 1;
    setConnectionState('reconnecting');

    console.log(
      `🔄 Reconnecting in ${delay}ms (attempt ${retryCountRef.current}/${MAX_RETRIES})`
    );

    retryTimeoutRef.current = setTimeout(() => {
      console.log('🔄 Attempting reconnection...');
      unsubscribe();
      subscribe();
    }, delay);
  }, [getRetryDelay, unsubscribe, subscribe]);

  // Manual reconnect function
  const reconnect = useCallback(() => {
    console.log('🔄 Manual reconnection triggered');
    retryCountRef.current = 0; // Reset retry count
    unsubscribe();
    subscribe();
  }, [unsubscribe, subscribe]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!enabled) {
      setConnectionState('disconnected');
      return;
    }

    // Initialize Supabase client
    if (!supabaseRef.current) {
      supabaseRef.current = initializeSupabase();
      if (!supabaseRef.current) return; // Failed to initialize
    }

    // Subscribe to channels
    subscribe();

    // Cleanup on unmount
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      unsubscribe();
    };
  }, [enabled, initializeSupabase, subscribe, unsubscribe]);

  return {
    connectionState,
    isConnected: connectionState === 'connected',
    error,
    reconnect,
  };
}
