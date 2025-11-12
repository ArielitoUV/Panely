## 🏗️ Descripción general de la arquitectura
- **API Gateway** (Puerto 8080): Punto de entrada central, enrutamiento y autenticación
- **Servicio de Autenticación** (Puerto 3001): Autenticación de usuarios y gestión de tokens JWT
- **Servicio de Usuarios** (Puerto 3002): Gestión de perfiles de usuario

Cada servicio tiene su propia base de datos PostgreSQL siguiendo el patrón de base de datos por servicio.

## 🚀 Tecnologías

- **Runtime**: Node.js con TypeScript
- **Framework**: Express.js
- **Base de datos**: PostgreSQL con Prisma ORM
- **Autenticación**: Tokens JWT
- **Contenerización**: Docker y Docker Compose
- **Pruebas**: Jest
- **Seguridad**: Helmet, CORS, bcrypt

## 📋 Requisitos previos

- Node.js (v18 o superior)
- PostgreSQL

## 🛠️ Inicio rápido

### 1. Configuración de entorno

Copia los archivos de ejemplo de entorno y configúralos:

```bash
# Archivo de entorno en la raíz
cp .env.example .env

# API Gateway
cp api-gateway/.env.example api-gateway/.env

# Servicios
cp services/auth-service/.env.example services/auth-service/.env
cp services/user-service/.env.example services/user-service/.env
```

### 2. Actualizar variables de entorno

Edita los archivos `.env` y actualiza los siguientes valores críticos:

- `JWT_SECRET`: Usa un secreto fuerte y aleatorio (mínimo 256 bits)
- `JWT_REFRESH_SECRET`: Usa un secreto diferente, fuerte y aleatorio


### 3. Configuración de la base de datos

Ejecuta las migraciones de Prisma para cada servicio:

```bash
# Servicio de Autenticación
cd services/auth-service
npx prisma migrate dev
npx prisma generate

# Servicio de Usuarios
cd ../user-service
npx prisma migrate dev
npx prisma generate

```

### 4. Iniciar los servicios

Inicia cada servicio en modo desarrollo:

```bash
# Terminal 1 - Servicio de Autenticación
cd services/auth-service
npm run dev

# Terminal 2 - Servicio de Usuarios
cd services/user-service
npm run dev

# Terminal 3 - API Gateway
cd api-gateway
npm run dev
```

## 📡 Endpoints de la API

### Autenticación

- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/refresh` - Renovación de tokens
- `POST /api/auth/logout` - Cierre de sesión

### Usuarios

- `GET /api/users/profile` - Obtener perfil de usuario
- `PUT /api/users/profile` - Actualizar perfil de usuario
