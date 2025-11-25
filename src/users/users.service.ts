import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(Role) private roleRepository: Repository<Role>,
    ) {}

    async findOneByEmail(email: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { email }, relations: ['roles', 'roles.permissions'] });
        if (!user) {
            throw new NotFoundException(`Usuario con email '${email}' no encontrado.`);
        }
        return user;
    }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const { email, password, username, roles, firstName, lastName } = createUserDto;

        const existingUser = await this.userRepository.findOne({ where: [{ email }, { username }] });
        if (existingUser) {
            if (existingUser.username === username) {
                throw new BadRequestException(`El nombre de usuario '${username}' ya está en uso.`);
            }
            if (existingUser.email === email) {
                throw new BadRequestException(`El email '${email}' ya está en uso.`);
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let userRoles: Role[] = [];
        if (roles && roles.length > 0) {
            userRoles = await this.roleRepository.createQueryBuilder('role')
                .where('role.name IN (:...names)', { names: roles })
                .getMany();
            if (userRoles.length !== roles.length) {
                throw new BadRequestException('Uno o más de los roles especificados no existen.');
            }
        }

        const newUser = this.userRepository.create({
            username,
            email,
            password: hashedPassword,
            roles: userRoles,
            firstName,
            lastName,
            isActive: true,
        });

        try {
            return await this.userRepository.save(newUser);
        } catch (error) {
            throw new InternalServerErrorException('Ocurrió un error al guardar el usuario.');
        }
    }

    async findAll(): Promise<User[]> {
        return this.userRepository.find({ where: { isActive: true } });
    }

    async findOne(id: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException(`Usuario con ID '${id}' no encontrado.`);
        }
        return user;
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.findOne(id);
        const { roles, ...restOfDto } = updateUserDto;

        if (restOfDto.password) {
            restOfDto.password = await bcrypt.hash(restOfDto.password, 10);
        }

        if (roles) {
            const foundRoles = await this.roleRepository.createQueryBuilder('role')
                .where('role.name IN (:...names)', { names: roles })
                .getMany();
            if (foundRoles.length !== roles.length) {
                throw new BadRequestException('Uno o más de los roles especificados no existen.');
            }
            user.roles = foundRoles;
        }

        const updatedUser = this.userRepository.merge(user, restOfDto);
        return this.userRepository.save(updatedUser);
    }

    async remove(id: string): Promise<void> {
        const user = await this.findOne(id);
        user.isActive = false;
        console.log('--- SOFT DELETING USER (this should only UPDATE, not DELETE): ---', user);
        await this.userRepository.save(user);
    }

    async enable(id: string): Promise<void> {
        const user = await this.findOne(id);
        user.isActive = true;
        await this.userRepository.save(user);
    }
}