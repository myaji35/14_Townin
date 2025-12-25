import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.WEBSOCKET_CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private readonly connectedClients = new Map<string, AuthenticatedSocket>();

  constructor(private readonly jwtService: JwtService) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract JWT from handshake query or headers
      const token =
        client.handshake.query.token ||
        client.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        client.disconnect();
        return;
      }

      // Verify JWT
      const payload = await this.jwtService.verifyAsync(token as string);
      client.userId = payload.sub;
      client.userRole = payload.role;

      // Store connection
      this.connectedClients.set(client.id, client);

      // Join user-specific room
      client.join(`user:${client.userId}`);

      // Join admin room if admin
      if (client.userRole === 'super_admin' || client.userRole === 'admin') {
        client.join('admin');
      }

      this.logger.log(
        `Client connected: ${client.id} (User: ${client.userId}, Role: ${client.userRole})`,
      );
      this.logger.log(`Total connected clients: ${this.connectedClients.size}`);
    } catch (error) {
      this.logger.error(`Authentication failed for client ${client.id}: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.connectedClients.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id} (User: ${client.userId})`);
    this.logger.log(`Total connected clients: ${this.connectedClients.size}`);
  }

  /**
   * Join a specific room (for targeted notifications)
   */
  @SubscribeMessage('join_room')
  handleJoinRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    client.join(data.roomId);
    this.logger.log(`Client ${client.id} joined room: ${data.roomId}`);
    return { event: 'joined_room', data: { roomId: data.roomId } };
  }

  /**
   * Leave a room
   */
  @SubscribeMessage('leave_room')
  handleLeaveRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    client.leave(data.roomId);
    this.logger.log(`Client ${client.id} left room: ${data.roomId}`);
    return { event: 'left_room', data: { roomId: data.roomId } };
  }

  /**
   * Emit notification to specific user
   */
  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
    this.logger.log(`Sent ${event} to user ${userId}`);
  }

  /**
   * Emit notification to admin room
   */
  sendToAdmins(event: string, data: any) {
    this.server.to('admin').emit(event, data);
    this.logger.log(`Sent ${event} to admin room`);
  }

  /**
   * Emit notification to specific room
   */
  sendToRoom(roomId: string, event: string, data: any) {
    this.server.to(roomId).emit(event, data);
    this.logger.log(`Sent ${event} to room ${roomId}`);
  }

  /**
   * Broadcast to all connected clients
   */
  broadcast(event: string, data: any) {
    this.server.emit(event, data);
    this.logger.log(`Broadcasted ${event} to all clients`);
  }

  /**
   * Get connected clients count
   */
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  /**
   * Check if user is connected
   */
  isUserConnected(userId: string): boolean {
    for (const [, client] of this.connectedClients) {
      if (client.userId === userId) {
        return true;
      }
    }
    return false;
  }
}
