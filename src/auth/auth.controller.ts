import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  login(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.create(createAuthDto);
  }

  @Get()
  profile() {
    return this.authService.findAll();
  }

  @Delete(':id')
  logout(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}
