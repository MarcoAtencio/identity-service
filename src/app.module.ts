import { Module, NestModule, MiddlewareConsumer, RequestMethod, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from './common/redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { User } from './users/entities/user.entity';
import { Role } from './roles/entities/role.entity';
import { Permission } from './permissions/entities/permission.entity';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { LoggerMiddleware } from './common/middleware/logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {

        const logger = new Logger('TypeOrmModule');

        const host = config.get<string>('DB_HOST_ALISIS');
        const port = config.get<number>('DB_PORT_ALISIS');
        const username = config.get<string>('DB_USERNAME_ALISIS');
        const password = config.get<string>('DB_PASSWORD_ALISIS');
        const database = config.get<string>('DB_DATABASE_ALISIS');

        logger.log('--- Intentando conectar a la Base de Datos con: ---');
        logger.log(`Host: ${host}`);
        logger.log(`Port: ${port}`);
        logger.log(`User: ${username}`);
        logger.log(`Database: ${database}`);
        logger.log(`Password: ${password ? '********' : 'N/A'}`);
        logger.log('--------------------------------------------------');

        return {
          type: 'postgres',
          host: host,
          port: port,
          username: username,
          password: password,
          database: database,
          entities: [User, Role, Permission],
          synchronize: true,
          ssl: { rejectUnauthorized: false },
          // 🚀 OPTIMIZACIÓN DE CONNECTION POOL
          extra: {
            // Aumentar idle timeout de 10s a 30s para mantener conexiones calientes
            idleTimeoutMillis: 30000, // ⬅️ CAMBIO CRÍTICO
            connectionTimeoutMillis: 2000,
          },
          // Configuración del pool de conexiones
          poolSize: 5, // Máximo 5 conexiones activas
          // Configuración adicional del pool
          pool: {
            max: 10, // Máximo 10 conexiones en total
            min: 2,  // Mínimo 2 conexiones siempre disponibles
            idleTimeoutMillis: 30000, // ⬅️ CAMBIO CRÍTICO
            acquireTimeoutMillis: 60000, // Timeout para adquirir conexión
            evictCheckIntervalMillis: 1000,
            softIdleTimeoutMillis: 30000,
            testOnBorrow: true,
            testOnReturn: true,
            testOnIdle: true,
          },
        };
      },
    }),
    RedisModule,
    AuthModule,
    UsersModule,
    RolesModule,
    // EmailGrpcModule, // Temporarily disabled for debugging
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestIdMiddleware, LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}