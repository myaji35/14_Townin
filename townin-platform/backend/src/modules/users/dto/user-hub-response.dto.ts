import { HubType } from '../entities/user-hub.entity';

export class UserHubResponseDto {
  id: string;
  hubType: HubType;
  lat: number;
  lng: number;
  address: string;
  h3CellId: string | null;
  nickname: string | null;
  createdAt: Date;
  updatedAt: Date;
}
