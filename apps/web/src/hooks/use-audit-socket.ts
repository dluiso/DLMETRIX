'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { AuditProgressEvent, AuditResult } from '@dlmetrix/shared';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

interface UseAuditSocketOptions {
  onProgress?: (event: AuditProgressEvent) => void;
  onCompleted?: (result: AuditResult) => void;
  onFailed?: (error: string) => void;
}

export function useAuditSocket(auditId: string, options: UseAuditSocketOptions) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!auditId) return;

    const socket = io(`${WS_URL}/audits`, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('subscribe_audit', { auditId });
    });

    socket.on('audit_progress', (event: AuditProgressEvent) => {
      options.onProgress?.(event);
    });

    socket.on('audit_completed', ({ result }: { auditId: string; result: AuditResult }) => {
      options.onCompleted?.(result);
    });

    socket.on('audit_failed', ({ error }: { auditId: string; error: string }) => {
      options.onFailed?.(error);
    });

    return () => {
      socket.emit('unsubscribe_audit', { auditId });
      socket.disconnect();
    };
  }, [auditId]);

  return socketRef;
}
