import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { AuthResponseDto } from './dto/auth-response.dto.js';
import { RefreshTokenGuard } from './guards/refresh-token.guard.js';
import { GetUser } from '../../common/decorators/get-user.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { LoginDto } from './dto/login.dto.js';
import { ApiAuthResponses, ApiStandardResponses } from '../../common/decorators/api-responses.decorator.js';
import { ResponseMessage } from '../../common/decorators/response-message.decorator.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ResponseMessage('User registered successfully')
  @ApiAuthResponses(AuthResponseDto, HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in with email and password' })
  @ResponseMessage('Login successful')
  @ApiAuthResponses(AuthResponseDto)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshTokenGuard)
  @ApiBearerAuth('Refresh-JWT')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiAuthResponses(AuthResponseDto)
  async refresh(@GetUser('id') userId: string): Promise<AuthResponseDto> {
    return this.authService.refreshTokens(userId);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Log out and invalidate refresh token' })
  @ApiStandardResponses()
  async logout(@GetUser('id') userId: string): Promise<{ message: string }> {
    await this.authService.logout(userId);
    return { message: 'Logged out successfully' };
  }
}
