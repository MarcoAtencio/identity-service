import { Controller, Post, Body, Get, Param, ParseUUIDPipe, Patch, Delete, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { User } from './entities/user.entity';

@ApiTags('Users')
@Controller('users')
// @UseGuards(JwtAuthGuard, PermissionsGuard)
// @ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  private toUserResponse(user: User) {
    const { password, roles, ...userResult } = user;

    if (!roles) {
      return userResult;
    }

    const cleanedRoles = roles.map(role => {
      const { isActive, permissions, ...roleResult } = role;

      if (!permissions) {
        return roleResult;
      }

      const cleanedPermissions = permissions.map(permission => {
        const { isActive, ...permissionResult } = permission;
        return permissionResult;
      });

      return { ...roleResult, permissions: cleanedPermissions };
    });

    return { ...userResult, roles: cleanedRoles };
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo usuario (Permiso: create:user)' })
  @ApiResponse({ status: 201, description: 'El usuario ha sido creado exitosamente.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado.' })
  // @Permissions('manage:access_control')
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return this.toUserResponse(user);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener una lista de todos los usuarios (Permiso: read:users)' })
  @ApiResponse({ status: 403, description: 'Acceso denegado.' })
  @Permissions('manage:access_control')
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map(user => this.toUserResponse(user));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un usuario por su ID (Permiso: read:users)' })
  @ApiResponse({ status: 403, description: 'Acceso denegado.' })
  @Permissions('manage:access_control')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.findOne(id);
    return this.toUserResponse(user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un usuario existente (Permiso: update:user)' })
  @ApiResponse({ status: 403, description: 'Acceso denegado.' })
  @Permissions('manage:access_control')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersService.update(id, updateUserDto);
    return this.toUserResponse(user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Desactivar un usuario (borrado lógico) (Permiso: delete:user)' })
  @ApiResponse({ status: 204, description: 'Usuario desactivado exitosamente.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado.' })
  @Permissions('manage:access_control')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.usersService.remove(id);
  }

  @Patch('enable/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Reactivar un usuario (Permiso: manage:access_control)' })
  @ApiResponse({ status: 204, description: 'Usuario reactivado exitosamente.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado.' })
  @Permissions('manage:access_control')
  async enable(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.usersService.enable(id);
  }
}