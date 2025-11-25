import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true; // Si no se especifican permisos, se permite el acceso
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.permissions) {
      return false; // Si el usuario no existe o no tiene permisos, se deniega
    }

    // Comprueba si el usuario tiene TODOS los permisos requeridos
    return requiredPermissions.every(permission =>
      user.permissions.includes(permission),
    );
  }
}
