import { IsString, IsUrl, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAuditDto {
  @ApiProperty({ example: 'https://example.com' })
  @IsString()
  @MaxLength(2048)
  url: string;
}
