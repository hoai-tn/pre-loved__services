export interface TokenPayloadDto {
  tid: string;
  sub: string;
  iat?: number;
  exp?: number;
}
