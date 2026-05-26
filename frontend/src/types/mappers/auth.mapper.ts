import { LoginResponseDTO } from '../api';
import { LoginResponse } from '../models';

export const toLoginResponseModel = (dto: LoginResponseDTO): LoginResponse => ({
  accessToken: dto.access_token,
  refreshToken: dto.refresh_token,
  tokenType: dto.token_type,
  username: dto.username,
  role: dto.role,
});
