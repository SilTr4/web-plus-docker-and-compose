import {
  IsUrl,
  Length,
  IsString,
  IsNumber,
  Min,
  IsOptional,
} from 'class-validator';

export class UpdateWishDto {
  @IsString()
  @Length(1, 250)
  @IsOptional()
  name: string;

  @IsString()
  @IsUrl()
  @IsOptional()
  link: string;

  @IsString()
  @IsUrl()
  @IsOptional()
  image: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  price: number;

  @IsString()
  @Length(1, 1024)
  @IsOptional()
  description: string;
}
