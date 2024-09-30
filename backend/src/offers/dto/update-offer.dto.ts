import { IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class UpdateOfferDto {
  @IsNumber()
  @IsOptional()
  amount: number;

  @IsBoolean()
  @IsOptional()
  hidden: boolean;

  @IsNumber()
  @IsOptional()
  itemId: number;
}
