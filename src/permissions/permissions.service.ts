import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionsService {
    constructor(
        @InjectRepository(Permission) private permissionRepository: Repository<Permission>,
    ) {}

    async createPermission(createPermissionDto: CreatePermissionDto): Promise<Permission> {
        const newPermission = this.permissionRepository.create({ ...createPermissionDto, isActive: true });
        return this.permissionRepository.save(newPermission);
    }

    async findAllPermissions(): Promise<Permission[]> {
        return this.permissionRepository.find({ where: { isActive: true } });
    }

    async findOnePermission(id: number): Promise<Permission> {
        const permission = await this.permissionRepository.findOne({ where: { id } });
        if (!permission) {
            throw new NotFoundException(`Permiso con ID "${id}" no encontrado.`);
        }
        return permission;
    }

    async updatePermission(id: number, updatePermissionDto: UpdatePermissionDto): Promise<Permission> {
        const permission = await this.findOnePermission(id);
        this.permissionRepository.merge(permission, updatePermissionDto);
        return this.permissionRepository.save(permission);
    }

    async removePermission(id: number): Promise<void> {
        const permission = await this.findOnePermission(id);
        permission.isActive = false;
        await this.permissionRepository.save(permission);
    }

    async enablePermission(id: number): Promise<void> {
        const permission = await this.findOnePermission(id);
        permission.isActive = true;
        await this.permissionRepository.save(permission);
    }

    async findOnePermissionByName(name: string): Promise<Permission | null> {
        return this.permissionRepository.findOne({ where: { name } });
    }

    async findPermissionsByIds(ids: number[]): Promise<Permission[]> {
        return this.permissionRepository.findBy({ id: In(ids), isActive: true });
    }
}