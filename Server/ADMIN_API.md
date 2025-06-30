# Admin API Documentation

## Overview
The Admin API provides authentication and management functionality for system administrators. Only authenticated admins can perform administrative operations.

## Default Admin Credentials
When the application starts for the first time, a default admin is automatically created:
- **Phone**: 1234567890
- **Password**: admin123

⚠️ **Important**: Change the default password after first login for security!

## Base URL
```
http://localhost:3000/api/v1/admin
```

## Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Admin Login
**POST** `/login`
- **Description**: Authenticate admin and get JWT token
- **Authentication**: Not required
- **Body**:
  ```json
  {
    "phone": "1234567890",
    "password": "admin123"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Admin logged in successfully",
    "data": {
      "admin": {
        "id": "uuid",
        "name": "Super Admin",
        "phone": "1234567890",
        "status": "active"
      },
      "token": "jwt-token"
    }
  }
  ```

### 2. Create New Admin
**POST** `/`
- **Description**: Create a new admin (only by existing admins)
- **Authentication**: Required
- **Body**:
  ```json
  {
    "name": "New Admin",
    "phone": "9876543210",
    "password": "securepassword"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Admin created successfully",
    "data": {
      "id": "uuid",
      "name": "New Admin",
      "phone": "9876543210",
      "status": "active"
    }
  }
  ```

### 3. Get All Admins
**GET** `/`
- **Description**: Get list of all admins
- **Authentication**: Required
- **Response**:
  ```json
  {
    "success": true,
    "message": "Admins fetched successfully",
    "data": [
      {
        "id": "uuid",
        "name": "Super Admin",
        "phone": "1234567890",
        "status": "active",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
  ```

### 4. Get Current Admin Profile
**GET** `/profile`
- **Description**: Get current authenticated admin's profile
- **Authentication**: Required
- **Response**:
  ```json
  {
    "success": true,
    "message": "Admin profile fetched successfully",
    "data": {
      "id": "uuid",
      "name": "Super Admin",
      "phone": "1234567890",
      "status": "active",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

### 5. Get Admin by ID
**GET** `/:id`
- **Description**: Get specific admin by ID
- **Authentication**: Required
- **Response**:
  ```json
  {
    "success": true,
    "message": "Admin fetched successfully",
    "data": {
      "id": "uuid",
      "name": "Super Admin",
      "phone": "1234567890",
      "status": "active",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

### 6. Update Admin
**PUT** `/:id`
- **Description**: Update admin information
- **Authentication**: Required
- **Body** (all fields optional):
  ```json
  {
    "name": "Updated Name",
    "phone": "9876543210",
    "password": "newpassword",
    "status": "inactive"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Admin updated successfully",
    "data": {
      "id": "uuid",
      "name": "Updated Name",
      "phone": "9876543210",
      "status": "inactive"
    }
  }
  ```

### 7. Delete Admin
**DELETE** `/:id`
- **Description**: Delete an admin
- **Authentication**: Required
- **Response**:
  ```json
  {
    "success": true,
    "message": "Admin deleted successfully"
  }
  ```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Name is required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access token required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Admin access required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Admin not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Phone number already exists"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to create admin",
  "error": "Error details"
}
```

## Security Features

1. **Password Hashing**: All passwords are automatically hashed using bcrypt
2. **JWT Authentication**: Secure token-based authentication
3. **Admin-only Access**: Only authenticated admins can perform administrative operations
4. **Status Management**: Admins can be marked as active/inactive
5. **Unique Phone Numbers**: Each admin must have a unique phone number

## Usage Examples

### Login and Get Token
```bash
curl -X POST http://localhost:3000/api/v1/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "1234567890",
    "password": "admin123"
  }'
```

### Create New Admin (with token)
```bash
curl -X POST http://localhost:3000/api/v1/admin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "New Admin",
    "phone": "9876543210",
    "password": "securepassword"
  }'
```

### Get All Admins (with token)
```bash
curl -X GET http://localhost:3000/api/v1/admin \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
``` 