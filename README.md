# Identity Service

Service responsible for authentication and identity management.

## Modules

- **Auth**: Login, register, JWT tokens
- **Users**: User CRUD operations
- **Roles**: Role management
- **Permissions**: Permission management

## Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Refresh access token
- `GET /auth/profile` - Get current user profile

### Users
- `GET /users` - List all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Roles
- `GET /roles` - List all roles
- `POST /roles` - Create role
- `PUT /roles/:id` - Update role
- `DELETE /roles/:id` - Delete role

### Permissions
- `GET /permissions` - List all permissions
- `POST /permissions` - Create permission
- `PUT /permissions/:id` - Update permission

## Environment Variables

```bash
DATABASE_URL=postgresql://user:pass @localhost:5432/identity_db
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret
PORT=3000
```