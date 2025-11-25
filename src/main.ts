import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { RolesService } from './roles/roles.service';
import { PermissionsService } from './permissions/permissions.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformResponseInterceptor());

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  const permissionsService = app.get(PermissionsService);
  const rolesService = app.get(RolesService);

  const adminPermissionName = 'manage:access_control';
  const adminRoleName = 'admin';

  try {
    let permission = await permissionsService.findOnePermissionByName(adminPermissionName);
    if (!permission) {
      permission = await permissionsService.createPermission({
        name: adminPermissionName,
      });
      console.log(`Permission "${adminPermissionName}" created.`);
    }

    let role = await rolesService.findOneRoleByName(adminRoleName);
    if (!role) {
      role = await rolesService.createRole({ name: adminRoleName });
      console.log(`Role "${adminRoleName}" created.`);
    }

    const hasPermission = role.permissions.some(p => p.id === permission.id);
    if (!hasPermission) {
      await rolesService.assignPermissionsToRole(role.id, { permissionIds: [permission.id] });
      console.log(`Assigned "${adminPermissionName}" to "${adminRoleName}" role.`);
    }
  } catch (error) {
    console.error('Error during database seeding:', error);
  }

  const config = new DocumentBuilder()
    .setTitle('Identity Service API')
    .setDescription('API documentation for the Identity and Access Management Microservice')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT || 3000);
  console.log(`Identity service is running on port ${process.env.PORT || 3000}`);
}
bootstrap();