import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@ApiTags('Access Control - Permissions')
@Controller('permissions')
// @UseGuards(JwtAuthGuard, PermissionsGuard)
// @ApiBearerAuth()
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo permiso' })
  // @Permissions('manage:access_control')
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.createPermission(createPermissionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los permisos activos' })
  // @Permissions('manage:access_control')
  findAll() {
    return this.permissionsService.findAllPermissions();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un permiso por ID' })
  @Permissions('manage:access_control')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.permissionsService.findOnePermission(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un permiso' })
  @Permissions('manage:access_control')
  update(@Param('id', ParseIntPipe) id: number, @Body() updatePermissionDto: UpdatePermissionDto) {
    return this.permissionsService.updatePermission(id, updatePermissionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un permiso (borrado lógico)' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permissions('manage:access_control')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.permissionsService.removePermission(id);
  }

  @Patch('enable/:id')
  @ApiOperation({ summary: 'Reactivar un permiso' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permissions('manage:access_control')
  enable(@Param('id', ParseIntPipe) id: number) {
    return this.permissionsService.enablePermission(id);
  }
}