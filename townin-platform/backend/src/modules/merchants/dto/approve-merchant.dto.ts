import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum ApprovalAction {
  APPROVE = 'approve',
  REJECT = 'reject',
}

export class ApproveMerchantDto {
  @IsEnum(ApprovalAction)
  action: ApprovalAction;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
