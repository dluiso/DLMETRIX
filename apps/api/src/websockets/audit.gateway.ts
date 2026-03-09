import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { AuditProgressEvent } from '@dlmetrix/shared';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/audits',
})
export class AuditGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AuditGateway.name);

  handleConnection(client: Socket) {
    this.logger.debug(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe_audit')
  handleSubscribeAudit(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { auditId: string },
  ) {
    client.join(`audit:${data.auditId}`);
    this.logger.debug(`Client ${client.id} subscribed to audit:${data.auditId}`);
    return { status: 'subscribed', auditId: data.auditId };
  }

  @SubscribeMessage('unsubscribe_audit')
  handleUnsubscribeAudit(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { auditId: string },
  ) {
    client.leave(`audit:${data.auditId}`);
    return { status: 'unsubscribed', auditId: data.auditId };
  }

  emitProgress(event: AuditProgressEvent) {
    this.server.to(`audit:${event.auditId}`).emit('audit_progress', event);
  }

  emitCompleted(auditId: string, result: any) {
    this.server.to(`audit:${auditId}`).emit('audit_completed', { auditId, result });
  }

  emitFailed(auditId: string, error: string) {
    this.server.to(`audit:${auditId}`).emit('audit_failed', { auditId, error });
  }
}
