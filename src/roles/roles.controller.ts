import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { RolePermissionsDto } from './dto/role-permissions.dto';

@ApiTags('Access Control - Roles')
@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
// @ApiBearerAuth()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo rol' })
  // @Permissions('manage:access_control')
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.createRole(createRoleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los roles activos' })
  // @Permissions('manage:access_control')
  findAll() {
    return this.rolesService.findAllRoles();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un rol por ID' })
  @Permissions('manage:access_control')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.findOneRole(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un rol' })
  @Permissions('manage:access_control')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.updateRole(id, updateRoleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un rol (borrado lógico)' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permissions('manage:access_control')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.removeRole(id);
  }

  @Patch('enable/:id')
  @ApiOperation({ summary: 'Reactivar un rol' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permissions('manage:access_control')
  enable(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.enableRole(id);
  }

  // --- Endpoints para Relaciones ---

  @Post(':id/permissions')
  @ApiOperation({ summary: 'Asignar permisos a un rol' })
  @Permissions('manage:access_control')
  assignPermissions(@Param('id', ParseIntPipe) id: number, @Body() rolePermissionsDto: RolePermissionsDto) {
    return this.rolesService.assignPermissionsToRole(id, rolePermissionsDto);
  }

  @Delete(':id/permissions')
  @ApiOperation({ summary: 'Desasignar permisos de un rol' })
  @Permissions('manage:access_control')
  unassignPermissions(@Param('id', ParseIntPipe) id: number, @Body() rolePermissionsDto: RolePermissionsDto) {
    return this.rolesService.unassignPermissionsFromRole(id, rolePermissionsDto);
  }
}
