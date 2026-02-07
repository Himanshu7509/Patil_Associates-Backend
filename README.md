# Patil Associate Backend API

A comprehensive backend system for Patil Associate's restaurant and bar management, with future support for hotel and properties.

## Table of Contents
- [API Overview](#api-overview)
- [Authentication](#authentication)
- [Restaurant & Bar APIs](#restaurant--bar-apis)
- [Table Management APIs](#table-management-apis)
- [Menu Management APIs](#menu-management-apis)
- [Error Handling](#error-handling)
- [Setup and Installation](#setup-and-installation)

## API Overview

Base URL: `http://localhost:3000/api`

### Authentication
Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

Admin routes require the user to have 'admin' role.

## Authentication APIs

### Signup
**POST** `/api/auth/signup`

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phoneNo": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "fullName": "John Doe",
      "email": "john@example.com",
      "phoneNo": "+1234567890",
      "roles": ["customer"]
    },
    "token": "jwt_token_here"
  }
}
```

### Login
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "user_id",
      "fullName": "John Doe",
      "email": "john@example.com",
      "roles": ["customer"]
    },
    "token": "jwt_token_here"
  }
}
```

## Restaurant & Bar APIs

### Create Booking
**POST** `/api/restaurant/`

**Authentication:** Required

**Request Body:**
```json
{
  "partySize": 4,
  "bookingDate": "2026-02-15",
  "bookingTime": "19:30",
  "specialRequests": "Window seat preferred",
  "tableNumber": "12",
  "bookingType": "table",
  "notes": "Celebrating anniversary"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "_id": "booking_id",
    "customerId": {
      "_id": "user_id",
      "fullName": "John Doe",
      "email": "john@example.com"
    },
    "partySize": 4,
    "bookingDate": "2026-02-15T00:00:00.000Z",
    "bookingTime": "19:30",
    "specialRequests": "Window seat preferred",
    "tableNumber": "12",
    "status": "pending",
    "bookingType": "table",
    "notes": "Celebrating anniversary",
    "createdAt": "2026-02-07T10:30:00.000Z",
    "updatedAt": "2026-02-07T10:30:00.000Z"
  }
}
```

### Get All Bookings
**GET** `/api/restaurant/`

**Authentication:** Required

**Query Parameters:**
- For customers: Returns only their own bookings
- For admins: Returns all bookings

**Response:**
```json
{
  "success": true,
  "message": "Bookings retrieved successfully",
  "data": [
    {
      "_id": "booking_id",
      "customerId": {
        "_id": "user_id",
        "fullName": "John Doe",
        "email": "john@example.com"
      },
      "partySize": 4,
      "bookingDate": "2026-02-15T00:00:00.000Z",
      "bookingTime": "19:30",
      "status": "confirmed",
      "bookingType": "table"
    }
  ],
  "count": 1
}
```

### Get Booking by ID
**GET** `/api/restaurant/:id`

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "message": "Booking retrieved successfully",
  "data": {
    "_id": "booking_id",
    "customerId": {
      "_id": "user_id",
      "fullName": "John Doe",
      "email": "john@example.com"
    },
    "partySize": 4,
    "bookingDate": "2026-02-15T00:00:00.000Z",
    "bookingTime": "19:30",
    "status": "confirmed",
    "bookingType": "table"
  }
}
```

### Update Booking
**PUT** `/api/restaurant/:id`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "status": "confirmed",
  "tableNumber": "15",
  "notes": "Updated table assignment"
}
```

### Delete Booking
**DELETE** `/api/restaurant/:id`

**Authentication:** Required (Admin only)

### Get Bookings by Date Range
**GET** `/api/restaurant/date-range?startDate=2026-02-01&endDate=2026-02-28`

**Authentication:** Optional (Public access shows only confirmed bookings)

**Response:**
```json
{
  "success": true,
  "message": "Bookings retrieved successfully",
  "data": [
    {
      "_id": "booking_id",
      "customerId": {
        "_id": "user_id",
        "fullName": "John Doe",
        "email": "john@example.com"
      },
      "partySize": 4,
      "bookingDate": "2026-02-15T00:00:00.000Z",
      "bookingTime": "19:30",
      "status": "confirmed"
    }
  ],
  "count": 1
}
```

### Get Available Tables
**GET** `/api/restaurant/available-tables?date=2026-02-15&time=19:30`

**Authentication:** Optional

**Response:**
```json
{
  "success": true,
  "message": "Available tables retrieved successfully",
  "data": {
    "date": "2026-02-15",
    "time": "19:30",
    "availableTables": ["3", "7", "11", "16"],
    "bookedTables": ["1", "2", "4", "5", "6", "8", "9", "10", "12", "13", "14", "15", "17", "18", "19", "20"],
    "totalAvailable": 4
  }
}
```

## Table Management APIs

### Create Table
**POST** `/api/tables/`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "tableNumber": "21",
  "capacity": 6,
  "location": "indoor",
  "shape": "round",
  "features": ["window_view", "quiet_corner"],
  "isActive": true,
  "notes": "VIP table near window"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Table created successfully",
  "data": {
    "_id": "table_id",
    "tableNumber": "21",
    "capacity": 6,
    "location": "indoor",
    "shape": "round",
    "features": ["window_view", "quiet_corner"],
    "isActive": true,
    "notes": "VIP table near window",
    "createdAt": "2026-02-07T10:30:00.000Z",
    "updatedAt": "2026-02-07T10:30:00.000Z"
  }
}
```

### Get All Tables
**GET** `/api/tables/`

**Authentication:** Required (Admin only)

**Query Parameters:**
- `isActive` (boolean): Filter by active status
- `location` (string): Filter by location (indoor, outdoor, patio, vip, bar_area)
- `capacity` (number): Minimum capacity

**Response:**
```json
{
  "success": true,
  "message": "Tables retrieved successfully",
  "data": [
    {
      "_id": "table_id",
      "tableNumber": "1",
      "capacity": 4,
      "location": "indoor",
      "shape": "round",
      "features": ["window_view"],
      "isActive": true
    }
  ],
  "count": 20
}
```

### Get Table by ID
**GET** `/api/tables/:id`

**Authentication:** Required (Admin only)

### Update Table
**PUT** `/api/tables/:id`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "capacity": 8,
  "location": "vip",
  "isActive": false
}
```

### Delete Table
**DELETE** `/api/tables/:id`

**Authentication:** Required (Admin only)

### Get Available Tables by Criteria
**GET** `/api/tables/available?date=2026-02-15&time=19:30&partySize=4&location=indoor`

**Authentication:** Optional

**Response:**
```json
{
  "success": true,
  "message": "Available tables retrieved successfully",
  "data": {
    "date": "2026-02-15",
    "time": "19:30",
    "partySize": 4,
    "location": "indoor",
    "availableTables": [
      {
        "_id": "table_id",
        "tableNumber": "3",
        "capacity": 4,
        "location": "indoor",
        "shape": "round",
        "features": ["window_view"]
      }
    ],
    "totalAvailable": 8,
    "bookedCount": 12
  }
}
```

## Menu Management APIs

### Create Menu Item
**POST** `/api/menu/`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "name": "Grilled Salmon",
  "description": "Fresh Atlantic salmon with lemon herb butter",
  "price": 24.99,
  "category": "main_course",
  "ingredients": ["salmon", "lemon", "herbs", "butter"],
  "dietaryOptions": ["gluten_free"],
  "isActive": true,
  "image": "https://example.com/salmon.jpg",
  "cookingTime": 15
}
```

**Response:**
```json
{
  "success": true,
  "message": "Menu item created successfully",
  "data": {
    "_id": "menu_item_id",
    "name": "Grilled Salmon",
    "description": "Fresh Atlantic salmon with lemon herb butter",
    "price": 24.99,
    "category": "main_course",
    "ingredients": ["salmon", "lemon", "herbs", "butter"],
    "dietaryOptions": ["gluten_free"],
    "isActive": true,
    "image": "https://example.com/salmon.jpg",
    "cookingTime": 15,
    "createdAt": "2026-02-07T10:30:00.000Z",
    "updatedAt": "2026-02-07T10:30:00.000Z"
  }
}
```

### Get All Menu Items
**GET** `/api/menu/`

**Authentication:** Optional (Public access to active items)

**Query Parameters:**
- `isActive` (boolean): Filter by active status
- `category` (string): Filter by category
- `dietaryOption` (string): Filter by dietary option
- `search` (string): Search in name or description

**Response:**
```json
{
  "success": true,
  "message": "Menu items retrieved successfully",
  "data": [
    {
      "_id": "menu_item_id",
      "name": "Grilled Salmon",
      "description": "Fresh Atlantic salmon with lemon herb butter",
      "price": 24.99,
      "category": "main_course",
      "dietaryOptions": ["gluten_free"],
      "isActive": true
    }
  ],
  "count": 15
}
```

### Get Menu Item by ID
**GET** `/api/menu/:id`

**Authentication:** Required (Admin only for inactive items)

### Update Menu Item
**PUT** `/api/menu/:id`

**Authentication:** Required (Admin only)

### Delete Menu Item
**DELETE** `/api/menu/:id`

**Authentication:** Required (Admin only)

### Get Menu Items by Category
**GET** `/api/menu/category/:category`

**Authentication:** Optional

**Example:** `/api/menu/category/main_course`

**Response:**
```json
{
  "success": true,
  "message": "Menu items for category 'main_course' retrieved successfully",
  "data": [
    {
      "_id": "menu_item_id",
      "name": "Grilled Salmon",
      "price": 24.99,
      "category": "main_course",
      "isActive": true
    }
  ],
  "count": 8,
  "category": "main_course"
}
```

### Get Dietary Menu Items
**GET** `/api/menu/dietary/:dietaryType`

**Authentication:** Optional

**Example:** `/api/menu/dietary/vegetarian`

**Response:**
```json
{
  "success": true,
  "message": "Dietary menu items for 'vegetarian' retrieved successfully",
  "data": [
    {
      "_id": "menu_item_id",
      "name": "Vegetable Stir Fry",
      "price": 16.99,
      "category": "main_course",
      "dietaryOptions": ["vegetarian"],
      "isActive": true
    }
  ],
  "count": 5,
  "dietaryType": "vegetarian"
}
```

### Search Menu Items
**GET** `/api/menu/search?q=salmon&category=main_course&minPrice=20&maxPrice=30`

**Authentication:** Optional

**Query Parameters:**
- `q` (string): Search query (required)
- `category` (string): Filter by category
- `minPrice` (number): Minimum price
- `maxPrice` (number): Maximum price

**Response:**
```json
{
  "success": true,
  "message": "Menu items search completed successfully",
  "data": [
    {
      "_id": "menu_item_id",
      "name": "Grilled Salmon",
      "description": "Fresh Atlantic salmon with lemon herb butter",
      "price": 24.99,
      "category": "main_course",
      "isActive": true
    }
  ],
  "count": 1,
  "searchQuery": "salmon",
  "filters": {
    "category": "main_course",
    "minPrice": 20,
    "maxPrice": 30
  }
}
```

## Error Handling

All API responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {...}
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## Setup and Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation Steps

1. Clone the repository:
```bash
git clone <repository-url>
cd Patil_Associate-Backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_admin_password
```

4. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| PORT | Server port | Yes |
| MONGO_URI | MongoDB connection string | Yes |
| JWT_SECRET | Secret key for JWT tokens | Yes |
| ADMIN_EMAIL | Admin user email | Yes |
| ADMIN_PASSWORD | Admin user password | Yes |

### Default Admin Account
To create an admin account, register with the email specified in `ADMIN_EMAIL` and the password in `ADMIN_PASSWORD`. The system will automatically assign the 'admin' role.

### Testing
The server will be available at `http://localhost:3000`

Test the base endpoint:
```bash
curl http://localhost:3000/
```

## Future Development
This backend is designed to support:
- Hotel management APIs
- Property management APIs
- Additional features for restaurant and bar management

---
*Patil Associate Backend API - Version 1.0.0*