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

**Authentication:** Optional (Public access for guest bookings, Authenticated for registered users)

**Description:** Creates a new restaurant booking. Supports both authenticated users and guest bookings without registration. When booking as a guest, provide customerName, customerEmail, and/or customerPhone. When booking as an authenticated user, the customer details are automatically populated from the user profile.

**Request Body (Authenticated User):**
```json
{
  "partySize": 4,
  "bookingDate": "2026-02-15",
  "bookingTime": "19:30",
  "specialRequests": "Window seat preferred",
  "tableNumber": "12",
  "bookingType": "table",
  "notes": "Celebrating anniversary",
  "orderDetails": [
    {
      "itemId": "menu_item_id",
      "quantity": 2,
      "price": 24.99
    }
  ],
  "totalAmount": 49.98
}
```

**Request Body (Guest User):**
```json
{
  "partySize": 4,
  "bookingDate": "2026-02-15",
  "bookingTime": "19:30",
  "specialRequests": "Window seat preferred",
  "tableNumber": "12",
  "bookingType": "table",
  "notes": "Celebrating anniversary",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+1234567890",
  "orderDetails": [
    {
      "itemId": "menu_item_id",
      "quantity": 2,
      "price": 24.99
    }
  ],
  "totalAmount": 49.98
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
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "+1234567890",
    "partySize": 4,
    "bookingDate": "2026-02-15T00:00:00.000Z",
    "bookingTime": "19:30",
    "specialRequests": "Window seat preferred",
    "tableNumber": "12",
    "status": "pending",
    "bookingType": "table",
    "notes": "Celebrating anniversary",
    "orderDetails": [
      {
        "itemId": "menu_item_id",
        "itemName": "Grilled Salmon",
        "quantity": 2,
        "price": 24.99,
        "description": "Fresh Atlantic salmon with lemon herb butter",
        "category": "main_course",
        "ingredients": ["salmon", "lemon", "herbs", "butter"],
        "dietaryOptions": ["gluten_free"],
        "image": "https://s3.amazonaws.com/bucket-name/patil-associate/menu-items/unique-filename.jpg",
        "cookingTime": 15
      }
    ],
    "totalAmount": 49.98,
    "tableDetails": [
      {
        "tableId": "table_id",
        "tableNumber": "12",
        "capacity": 6,
        "location": "indoor",
        "shape": "round",
        "features": ["window_view", "quiet_corner"],
        "isActive": true,
        "notes": "VIP table near window"
      }
    ],
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
      "customerName": "John Doe",
      "customerEmail": "john@example.com",
      "customerPhone": "+1234567890",
      "partySize": 4,
      "bookingDate": "2026-02-15T00:00:00.000Z",
      "bookingTime": "19:30",
      "status": "confirmed",
      "bookingType": "table",
      "orderDetails": [
        {
          "itemId": "menu_item_id",
          "itemName": "Grilled Salmon",
          "quantity": 2,
          "price": 24.99,
          "description": "Fresh Atlantic salmon with lemon herb butter",
          "category": "main_course",
          "ingredients": ["salmon", "lemon", "herbs", "butter"],
          "dietaryOptions": ["gluten_free"],
          "image": "https://s3.amazonaws.com/bucket-name/patil-associate/menu-items/unique-filename.jpg",
          "cookingTime": 15
        }
      ],
      "totalAmount": 49.98,
      "tableDetails": [
        {
          "tableId": "table_id",
          "tableNumber": "12",
          "capacity": 6,
          "location": "indoor",
          "shape": "round",
          "features": ["window_view", "quiet_corner"],
          "isActive": true,
          "notes": "VIP table near window"
        }
      ]
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
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "+1234567890",
    "partySize": 4,
    "bookingDate": "2026-02-15T00:00:00.000Z",
    "bookingTime": "19:30",
    "status": "confirmed",
    "bookingType": "table",
    "orderDetails": [
      {
        "itemId": "menu_item_id",
        "itemName": "Grilled Salmon",
        "quantity": 2,
        "price": 24.99,
        "description": "Fresh Atlantic salmon with lemon herb butter",
        "category": "main_course",
        "ingredients": ["salmon", "lemon", "herbs", "butter"],
        "dietaryOptions": ["gluten_free"],
        "image": "https://s3.amazonaws.com/bucket-name/patil-associate/menu-items/unique-filename.jpg",
        "cookingTime": 15
      }
    ],
    "totalAmount": 49.98,
    "tableDetails": [
      {
        "tableId": "table_id",
        "tableNumber": "12",
        "capacity": 6,
        "location": "indoor",
        "shape": "round",
        "features": ["window_view", "quiet_corner"],
        "isActive": true,
        "notes": "VIP table near window"
      }
    ]
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
      "customerName": "John Doe",
      "customerEmail": "john@example.com",
      "customerPhone": "+1234567890",
      "partySize": 4,
      "bookingDate": "2026-02-15T00:00:00.000Z",
      "bookingTime": "19:30",
      "status": "confirmed",
      "orderDetails": [
        {
          "itemId": "menu_item_id",
          "itemName": "Grilled Salmon",
          "quantity": 2,
          "price": 24.99,
          "description": "Fresh Atlantic salmon with lemon herb butter",
          "category": "main_course",
          "ingredients": ["salmon", "lemon", "herbs", "butter"],
          "dietaryOptions": ["gluten_free"],
          "image": "https://s3.amazonaws.com/bucket-name/patil-associate/menu-items/unique-filename.jpg",
          "cookingTime": 15
        }
      ],
      "totalAmount": 49.98,
      "tableDetails": [
        {
          "tableId": "table_id",
          "tableNumber": "12",
          "capacity": 6,
          "location": "indoor",
          "shape": "round",
          "features": ["window_view", "quiet_corner"],
          "isActive": true,
          "notes": "VIP table near window"
        }
      ]
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
  "cookingTime": 15
}
```

**Request with Image:**
```bash
curl -X POST http://localhost:3000/api/menu/ \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: multipart/form-data" \
  -F "name=Grilled Salmon" \
  -F "description=Fresh Atlantic salmon with lemon herb butter" \
  -F "price=24.99" \
  -F "category=main_course" \
  -F "ingredients=salmon" \
  -F "ingredients=lemon" \
  -F "ingredients=herbs" \
  -F "ingredients=butter" \
  -F "dietaryOptions=gluten_free" \
  -F "isActive=true" \
  -F "cookingTime=15" \
  -F "image=@path/to/salmon-image.jpg"
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
    "image": "https://s3.amazonaws.com/bucket-name/patil-associate/menu-items/unique-filename.jpg",
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

**Request Body:**
```json
{
  "name": "Updated Grilled Salmon",
  "description": "Fresh Atlantic salmon with lemon herb butter - Updated",
  "price": 26.99,
  "category": "main_course",
  "ingredients": ["salmon", "lemon", "herbs", "butter", "garlic"],
  "dietaryOptions": ["gluten_free", "dairy_free"],
  "isActive": true,
  "cookingTime": 18
}
```

**Request with Image Update:**
```bash
curl -X PUT http://localhost:3000/api/menu/:id \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: multipart/form-data" \
  -F "name=Updated Grilled Salmon" \
  -F "description=Fresh Atlantic salmon with lemon herb butter - Updated" \
  -F "price=26.99" \
  -F "category=main_course" \
  -F "isActive=true" \
  -F "cookingTime=18" \
  -F "image=@path/to/new-salmon-image.jpg"
```

### Delete Menu Item
**DELETE** `/api/menu/:id`

**Authentication:** Required (Admin only)

**Note:** When deleting a menu item, any associated image stored in S3 will be automatically removed.

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

### Upload Menu Item Image
**POST** `/api/menu/upload/image`

**Authentication:** Required (Admin only)

**Description:** Upload an image for a menu item to S3 storage. This endpoint allows you to upload images separately without creating or updating a menu item immediately.

**Request:**
```bash
curl -X POST http://localhost:3000/api/menu/upload/image \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: multipart/form-data" \
  -F "image=@path/to/menu-item-image.jpg"
```

**Response:**
```json
{
  "success": true,
  "message": "Menu item image uploaded successfully",
  "data": {
    "imageUrl": "https://s3.amazonaws.com/bucket-name/patil-associate/menu-items/unique-filename.jpg"
  }
}
```

## Hotel Management APIs

### Create Hotel Room
**POST** `/api/hotel/rooms/`

**Authentication:** Required (Admin only)

**Request Body (JSON):**
```json
{
  "roomNumber": "101",
  "roomType": "deluxe",
  "floor": 1,
  "capacity": 2,
  "pricePerNight": 150.00,
  "amenities": ["wifi", "ac", "tv", "mini_bar"],
  "viewType": "city",
  "bedType": "king",
  "size": 350,
  "description": "Spacious deluxe room with city view",
  "isActive": true,
  "isAvailable": true,
  "maintenanceNotes": "Recently renovated"
}
```

**Request with Images (multipart/form-data):**
```bash
curl -X POST http://localhost:3000/api/hotel/rooms/ \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: multipart/form-data" \
  -F "roomNumber=101" \
  -F "roomType=deluxe" \
  -F "floor=1" \
  -F "capacity=2" \
  -F "pricePerNight=150.00" \
  -F "amenities=wifi" \
  -F "amenities=ac" \
  -F "amenities=tv" \
  -F "amenities=mini_bar" \
  -F "viewType=city" \
  -F "bedType=king" \
  -F "size=350" \
  -F "description=Spacious deluxe room with city view" \
  -F "isActive=true" \
  -F "isAvailable=true" \
  -F "maintenanceNotes=Recently renovated" \
  -F "images=@path/to/room-image1.jpg" \
  -F "images=@path/to/room-image2.jpg"
```

**Response:**
```json
{
  "success": true,
  "message": "Room created successfully",
  "data": {
    "_id": "room_id",
    "roomNumber": "101",
    "roomType": "deluxe",
    "floor": 1,
    "capacity": 2,
    "pricePerNight": 150.00,
    "amenities": ["wifi", "ac", "tv", "mini_bar"],
    "viewType": "city",
    "bedType": "king",
    "size": 350,
    "description": "Spacious deluxe room with city view",
    "images": [
      "https://s3.amazonaws.com/bucket-name/patil-associate/hotel-rooms/unique-filename1.jpg",
      "https://s3.amazonaws.com/bucket-name/patil-associate/hotel-rooms/unique-filename2.jpg"
    ],
    "isActive": true,
    "isAvailable": true,
    "maintenanceNotes": "Recently renovated",
    "createdAt": "2026-02-07T10:30:00.000Z",
    "updatedAt": "2026-02-07T10:30:00.000Z"
  }
}
```

### Get All Hotel Rooms
**GET** `/api/hotel/rooms/`

**Authentication:** Optional (Public access to active rooms)

**Query Parameters:**
- `isActive` (boolean): Filter by active status
- `isAvailable` (boolean): Filter by availability
- `roomType` (string): Filter by room type
- `viewType` (string): Filter by view type
- `floor` (number): Filter by floor number

**Response:**
```json
{
  "success": true,
  "message": "Rooms retrieved successfully",
  "data": [
    {
      "_id": "room_id",
      "roomNumber": "101",
      "roomType": "deluxe",
      "floor": 1,
      "capacity": 2,
      "pricePerNight": 150.00,
      "amenities": ["wifi", "ac", "tv", "mini_bar"],
      "viewType": "city",
      "isAvailable": true,
      "isActive": true
    }
  ],
  "count": 15
}
```

### Get Hotel Room by ID
**GET** `/api/hotel/rooms/:id`

**Authentication:** Required (Admin only)

### Update Hotel Room
**PUT** `/api/hotel/rooms/:id`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "roomType": "suite",
  "pricePerNight": 250.00,
  "isAvailable": false,
  "maintenanceNotes": "Under maintenance until further notice"
}
```

**Request with Image Updates:**
```bash
curl -X PUT http://localhost:3000/api/hotel/rooms/:id \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: multipart/form-data" \
  -F "roomType=suite" \
  -F "pricePerNight=250.00" \
  -F "isAvailable=false" \
  -F "maintenanceNotes=Under maintenance until further notice" \
  -F "images=@path/to/new-room-image1.jpg" \
  -F "images=@path/to/new-room-image2.jpg"
```

**Note:** When updating images, all existing images will be deleted from S3 and replaced with the new ones.

### Delete Hotel Room
**DELETE** `/api/hotel/rooms/:id`

**Authentication:** Required (Admin only)

**Note:** 
- Cannot delete rooms with active bookings
- When deleting a room, any associated images stored in S3 will be automatically removed

### Get Available Rooms
**GET** `/api/hotel/rooms/available?checkInDate=2026-02-15&checkOutDate=2026-02-18&numberOfGuests=2&roomType=deluxe`

**Authentication:** Optional

**Query Parameters:**
- `checkInDate` (string): Check-in date (required)
- `checkOutDate` (string): Check-out date (required)
- `numberOfGuests` (number): Minimum capacity required
- `roomType` (string): Filter by room type

**Response:**
```json
{
  "success": true,
  "message": "Available rooms retrieved successfully",
  "data": {
    "checkInDate": "2026-02-15",
    "checkOutDate": "2026-02-18",
    "numberOfGuests": 2,
    "roomType": "deluxe",
    "availableRooms": [
      {
        "_id": "room_id",
        "roomNumber": "101",
        "roomType": "deluxe",
        "floor": 1,
        "capacity": 2,
        "pricePerNight": 150.00,
        "isAvailable": true
      }
    ],
    "count": 8
  }
}
```

### Upload Room Images
**POST** `/api/hotel/rooms/upload/images`

**Authentication:** Required (Admin only)

**Description:** Upload images for hotel rooms to S3 storage. This endpoint allows you to upload images separately without creating or updating a room immediately.

**Request:**
```bash
curl -X POST http://localhost:3000/api/hotel/rooms/upload/images \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: multipart/form-data" \
  -F "images=@path/to/room-image1.jpg" \
  -F "images=@path/to/room-image2.jpg" \
  -F "images=@path/to/room-image3.jpg"
```

**Response:**
```json
{
  "success": true,
  "message": "Room images uploaded successfully",
  "data": {
    "imageUrls": [
      "https://s3.amazonaws.com/bucket-name/patil-associate/hotel-rooms/unique-filename1.jpg",
      "https://s3.amazonaws.com/bucket-name/patil-associate/hotel-rooms/unique-filename2.jpg",
      "https://s3.amazonaws.com/bucket-name/patil-associate/hotel-rooms/unique-filename3.jpg"
    ]
  }
}
```

### Get Room Statistics
**GET** `/api/hotel/rooms/stats`

**Authentication:** Required (Admin only)

**Response:**
```json
{
  "success": true,
  "message": "Room statistics retrieved successfully",
  "data": {
    "totalRooms": 50,
    "activeRooms": 45,
    "availableRooms": 30,
    "occupiedRooms": 15,
    "roomTypeStats": [
      {
        "_id": "deluxe",
        "count": 15,
        "averagePrice": 150.00
      },
      {
        "_id": "suite",
        "count": 5,
        "averagePrice": 300.00
      }
    ]
  }
}
```

### Create Hotel Booking
**POST** `/api/hotel/bookings/`

**Authentication:** Required (Customer or Admin)

**Request Body (Authenticated User - Guest info auto-populated):**
```json
{
  "roomId": "room_id",
  "checkInDate": "2026-02-15",
  "checkOutDate": "2026-02-18",
  "numberOfGuests": 2,
  "totalPrice": 450.00,
  "specialRequests": "Late check-in requested",
  "paymentMethod": "credit_card",
  "bookingSource": "website",
  "notes": "Honeymoon suite"
  // guestName, guestEmail, guestPhone automatically populated from user profile
}
```

**Request Body (Unauthenticated User - Guest info required):**
```json
{
  "roomId": "room_id",
  "checkInDate": "2026-02-15",
  "checkOutDate": "2026-02-18",
  "numberOfGuests": 2,
  "totalPrice": 450.00,
  "specialRequests": "Late check-in requested",
  "guestName": "John Doe",
  "guestEmail": "john@example.com",
  "guestPhone": "+1234567890",
  "paymentMethod": "credit_card",
  "bookingSource": "website",
  "notes": "Honeymoon suite"
}
```

**Response (Authenticated User):**
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
    "roomId": {
      "_id": "room_id",
      "roomNumber": "101",
      "roomType": "deluxe",
      "floor": 1
    },
    "checkInDate": "2026-02-15T00:00:00.000Z",
    "checkOutDate": "2026-02-18T00:00:00.000Z",
    "numberOfGuests": 2,
    "totalPrice": 450.00,
    "status": "pending",
    "guestName": "John Doe",
    "guestEmail": "john@example.com",
    "guestPhone": "+919876543210",
    "specialRequests": "Late check-in requested",
    "paymentStatus": "pending",
    "bookingSource": "website",
    "createdAt": "2026-02-07T10:30:00.000Z",
    "updatedAt": "2026-02-07T10:30:00.000Z"
  }
}
```

**Response (Unauthenticated User):**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "_id": "booking_id",
    "roomId": {
      "_id": "room_id",
      "roomNumber": "101",
      "roomType": "deluxe",
      "floor": 1
    },
    "checkInDate": "2026-02-15T00:00:00.000Z",
    "checkOutDate": "2026-02-18T00:00:00.000Z",
    "numberOfGuests": 2,
    "totalPrice": 450.00,
    "status": "pending",
    "guestName": "Jane Smith",
    "guestEmail": "jane@example.com",
    "guestPhone": "+1234567890",
    "specialRequests": "Late check-in requested",
    "paymentStatus": "pending",
    "bookingSource": "website",
    "createdAt": "2026-02-07T10:30:00.000Z",
    "updatedAt": "2026-02-07T10:30:00.000Z"
  }
}
```

### Get All Hotel Bookings
**GET** `/api/hotel/bookings/`

**Authentication:** Required

**Query Parameters:**
- For customers: Returns only their own bookings
- For admins: Returns all bookings

### Get Hotel Booking by ID
**GET** `/api/hotel/bookings/:id`

**Authentication:** Required

### Update Hotel Booking
**PUT** `/api/hotel/bookings/:id`

**Authentication:** Required (Admin only)

### Delete Hotel Booking
**DELETE** `/api/hotel/bookings/:id`

**Authentication:** Required (Admin only)

### Get Bookings by Date Range
**GET** `/api/hotel/bookings/date-range?startDate=2026-02-01&endDate=2026-02-28&status=confirmed`

**Authentication:** Optional (Public access shows only confirmed bookings)

### Check Room Availability
**GET** `/api/hotel/bookings/check-availability?roomId=room_id&checkInDate=2026-02-15&checkOutDate=2026-02-18`

**Authentication:** Optional

**Response:**
```json
{
  "success": true,
  "message": "Availability check completed",
  "data": {
    "roomId": "room_id",
    "checkInDate": "2026-02-15",
    "checkOutDate": "2026-02-18",
    "isAvailable": true,
    "reason": "Room is available"
  }
}
```

### Get Booking Statistics
**GET** `/api/hotel/bookings/stats`

**Authentication:** Required (Admin only)

**Response:**
```json
{
  "success": true,
  "message": "Booking statistics retrieved successfully",
  "data": {
    "totalBookings": 150,
    "pendingBookings": 25,
    "confirmedBookings": 80,
    "checkedInBookings": 30,
    "completedBookings": 100,
    "cancelledBookings": 15,
    "statusStats": [
      {
        "_id": "confirmed",
        "count": 80,
        "totalRevenue": 12000.00
      }
    ],
    "recentBookings": 45
  }
}
```

## Property Management APIs

### Create Property
**POST** `/api/properties/`

**Authentication:** Required (Admin only)

**Request Body (JSON):**
```json
{
  "title": "Luxury Villa in Mumbai",
  "description": "Beautiful 4-bedroom villa with sea view",
  "propertyType": "residential",
  "listingType": "sale",
  "address": {
    "street": "123 Marine Drive",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400020",
    "country": "India"
  },
  "price": 50000000,
  "area": 2500,
  "areaUnit": "sqft",
  "bedrooms": 4,
  "bathrooms": 3,
  "parking": 2,
  "amenities": ["swimming_pool", "garden", "gym", "security"],
  "features": ["sea_view", "modern_kitchen", "spa_bathroom"],
  "isActive": true,
  "isFeatured": true,
  "contactInfo": {
    "name": "John Smith",
    "email": "john@patilassociate.com",
    "phone": "+919876543210"
  }
}
```

**Request with Images (multipart/form-data):**
```bash
curl -X POST http://localhost:3000/api/properties/ \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: multipart/form-data" \
  -F "title=Luxury Villa in Mumbai" \
  -F "description=Beautiful 4-bedroom villa with sea view" \
  -F "propertyType=residential" \
  -F "listingType=sale" \
  -F "address[street]=123 Marine Drive" \
  -F "address[city]=Mumbai" \
  -F "address[state]=Maharashtra" \
  -F "address[zipCode]=400020" \
  -F "address[country]=India" \
  -F "price=50000000" \
  -F "area=2500" \
  -F "areaUnit=sqft" \
  -F "bedrooms=4" \
  -F "bathrooms=3" \
  -F "parking=2" \
  -F "amenities=swimming_pool" \
  -F "amenities=garden" \
  -F "amenities=gym" \
  -F "amenities=security" \
  -F "features=sea_view" \
  -F "features=modern_kitchen" \
  -F "features=spa_bathroom" \
  -F "isActive=true" \
  -F "isFeatured=true" \
  -F "contactInfo[name]=John Smith" \
  -F "contactInfo[email]=john@patilassociate.com" \
  -F "contactInfo[phone]=+919876543210" \
  -F "images=@path/to/villa-image1.jpg" \
  -F "images=@path/to/villa-image2.jpg" \
  -F "images=@path/to/villa-image3.jpg"
```

**Response:**
```json
{
  "success": true,
  "message": "Property created successfully",
  "data": {
    "_id": "property_id",
    "title": "Luxury Villa in Mumbai",
    "description": "Beautiful 4-bedroom villa with sea view",
    "propertyType": "residential",
    "listingType": "sale",
    "address": {
      "street": "123 Marine Drive",
      "city": "Mumbai",
      "state": "Maharashtra",
      "zipCode": "400020",
      "country": "India"
    },
    "price": 50000000,
    "area": 2500,
    "areaUnit": "sqft",
    "bedrooms": 4,
    "bathrooms": 3,
    "parking": 2,
    "amenities": ["swimming_pool", "garden", "gym", "security"],
    "features": ["sea_view", "modern_kitchen", "spa_bathroom"],
    "images": [
      "https://s3.amazonaws.com/bucket-name/patil-associate/properties/unique-filename1.jpg",
      "https://s3.amazonaws.com/bucket-name/patil-associate/properties/unique-filename2.jpg",
      "https://s3.amazonaws.com/bucket-name/patil-associate/properties/unique-filename3.jpg"
    ],
    "isActive": true,
    "isFeatured": true,
    "contactInfo": {
      "name": "John Smith",
      "email": "john@patilassociate.com",
      "phone": "+919876543210"
    },
    "agentId": "agent_id",
    "createdAt": "2026-02-07T10:30:00.000Z",
    "updatedAt": "2026-02-07T10:30:00.000Z"
  }
}
```

### Get All Properties
**GET** `/api/properties/`

**Authentication:** Optional (Public access)

**Query Parameters:**
- `propertyType` (string): Filter by property type (residential, commercial, etc.)
- `listingType` (string): Filter by listing type (sale, rent, lease)
- `isActive` (boolean): Filter by active status
- `isFeatured` (boolean): Filter by featured status
- `city` (string): Filter by city
- `minPrice` (number): Minimum price
- `maxPrice` (number): Maximum price
- `bedrooms` (number): Minimum number of bedrooms
- `search` (string): Search in title, description, or address

**Response:**
```json
{
  "success": true,
  "message": "Properties retrieved successfully",
  "data": [
    {
      "_id": "property_id",
      "title": "Luxury Villa in Mumbai",
      "propertyType": "residential",
      "listingType": "sale",
      "price": 50000000,
      "area": 2500,
      "bedrooms": 4,
      "bathrooms": 3,
      "images": ["https://s3.amazonaws.com/..."],
      "isActive": true,
      "isFeatured": true
    }
  ],
  "count": 15
}
```

### Get Property by ID
**GET** `/api/properties/:id`

**Authentication:** Optional (Public access)

### Update Property
**PUT** `/api/properties/:id`

**Authentication:** Required (Admin only)

**Request with Image Updates:**
```bash
curl -X PUT http://localhost:3000/api/properties/:id \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: multipart/form-data" \
  -F "price=55000000" \
  -F "isFeatured=true" \
  -F "images=@path/to/new-image1.jpg" \
  -F "images=@path/to/new-image2.jpg"
```

**Note:** When updating images, all existing images will be deleted from S3 and replaced with the new ones.

### Delete Property
**DELETE** `/api/properties/:id`

**Authentication:** Required (Admin only)

**Note:** 
- Cannot delete properties with active listings
- When deleting a property, any associated images stored in S3 will be automatically removed

### Upload Property Images
**POST** `/api/properties/upload/images`

**Authentication:** Required (Admin only)

**Description:** Upload images for properties to S3 storage. This endpoint allows you to upload images separately without creating or updating a property immediately.

**Request:**
```bash
curl -X POST http://localhost:3000/api/properties/upload/images \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: multipart/form-data" \
  -F "images=@path/to/property-image1.jpg" \
  -F "images=@path/to/property-image2.jpg" \
  -F "images=@path/to/property-image3.jpg"
```

**Response:**
```json
{
  "success": true,
  "message": "Property images uploaded successfully",
  "data": {
    "imageUrls": [
      "https://s3.amazonaws.com/bucket-name/patil-associate/properties/unique-filename1.jpg",
      "https://s3.amazonaws.com/bucket-name/patil-associate/properties/unique-filename2.jpg",
      "https://s3.amazonaws.com/bucket-name/patil-associate/properties/unique-filename3.jpg"
    ]
  }
}
```

### Get Featured Properties
**GET** `/api/properties/featured?limit=10`

**Authentication:** Optional (Public access)

**Query Parameters:**
- `limit` (number): Number of featured properties to return (default: 10)

### Get Property Statistics
**GET** `/api/properties/stats`

**Authentication:** Required (Admin only)

**Response:**
```json
{
  "success": true,
  "message": "Property statistics retrieved successfully",
  "data": {
    "totalProperties": 150,
    "activeProperties": 120,
    "featuredProperties": 25,
    "saleProperties": 80,
    "rentProperties": 40,
    "leaseProperties": 30,
    "propertyTypeStats": [
      {
        "_id": "residential",
        "count": 90,
        "averagePrice": 3500000
      },
      {
        "_id": "commercial",
        "count": 35,
        "averagePrice": 8000000
      }
    ]
  }
}

## Property Listing Management APIs

### Create Property Listing (Inquiry/Offer)
**POST** `/api/property-listings/`

**Authentication:** Optional (Anyone can create inquiries)

**Request Body (Authenticated User - Customer info auto-populated):**
```json
{
  "propertyId": "property_id",
  "listingType": "inquiry",
  "customerInfo": {
    "message": "I'm interested in this property. Please provide more details."
  },
  "offerPrice": 48000000,
  "proposedRent": null,
  "leaseDuration": null,
  "moveInDate": "2026-05-01",
  "notes": "Looking for immediate possession"
}
```

**Request Body (Unauthenticated User - Customer info required):**
```json
{
  "propertyId": "property_id",
  "listingType": "inquiry",
  "customerInfo": {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+919876543211",
    "message": "I'm interested in this property. Please provide more details."
  },
  "offerPrice": 48000000,
  "proposedRent": null,
  "leaseDuration": null,
  "moveInDate": "2026-05-01",
  "notes": "Looking for immediate possession"
}
```

**Response (Authenticated User):**
```json
{
  "success": true,
  "message": "Property listing created successfully",
  "data": {
    "_id": "listing_id",
    "propertyId": {
      "_id": "property_id",
      "title": "Luxury Villa in Mumbai",
      "propertyType": "residential",
      "listingType": "sale",
      "price": 50000000
    },
    "customerId": {
      "_id": "user_id",
      "fullName": "John Doe",
      "email": "john@example.com",
      "phoneNo": "+919876543210"
    },
    "listingType": "inquiry",
    "status": "pending",
    "customerInfo": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+919876543210",
      "message": "I'm interested in this property. Please provide more details."
    },
    "offerPrice": 48000000,
    "moveInDate": "2026-05-01T00:00:00.000Z",
    "notes": "Looking for immediate possession",
    "createdAt": "2026-02-07T10:30:00.000Z",
    "updatedAt": "2026-02-07T10:30:00.000Z"
  }
}
```

**Response (Unauthenticated User):**
```json
{
  "success": true,
  "message": "Property listing created successfully",
  "data": {
    "_id": "listing_id",
    "propertyId": {
      "_id": "property_id",
      "title": "Luxury Villa in Mumbai",
      "propertyType": "residential",
      "listingType": "sale",
      "price": 50000000
    },
    "listingType": "inquiry",
    "status": "pending",
    "customerInfo": {
      "name": "Jane Doe",
      "email": "jane@example.com",
      "phone": "+919876543211",
      "message": "I'm interested in this property. Please provide more details."
    },
    "offerPrice": 48000000,
    "moveInDate": "2026-05-01T00:00:00.000Z",
    "notes": "Looking for immediate possession",
    "createdAt": "2026-02-07T10:30:00.000Z",
    "updatedAt": "2026-02-07T10:30:00.000Z"
  }
}
```

### Get All Property Listings
**GET** `/api/property-listings/`

**Authentication:** Required

**Query Parameters:**
- For customers: Returns only their own listings
- For agents: Returns listings assigned to them
- For admins: Returns all listings
- `listingType` (string): Filter by listing type
- `status` (string): Filter by status
- `propertyId` (string): Filter by property ID

### Get Property Listing by ID
**GET** `/api/property-listings/:id`

**Authentication:** Required

### Update Property Listing
**PUT** `/api/property-listings/:id`

**Authentication:** Required (Admin/Agent only)

### Delete Property Listing
**DELETE** `/api/property-listings/:id`

**Authentication:** Required (Admin/Agent only)

### Get Listings by Property ID
**GET** `/api/property-listings/property/:propertyId`

**Authentication:** Required

### Schedule Property Viewing
**PUT** `/api/property-listings/:id/schedule-viewing`

**Authentication:** Required (Admin/Agent only)

**Request Body:**
```json
{
  "date": "2026-02-15",
  "time": "14:30"
}
```

### Update Viewing Status
**PUT** `/api/property-listings/:id/viewing-status`

**Authentication:** Required (Admin/Agent only)

**Request Body:**
```json
{
  "status": "confirmed"
}
```

### Upload Documents to Property Listing
**POST** `/api/property-listings/:listingId/documents`

**Authentication:** Required (Listing owner, agent, or admin)

**Description:** Upload documents (PDF, Word, Excel, images) to a property listing. Documents are stored in S3 and associated with the listing.

**Request:**
```bash
curl -X POST http://localhost:3000/api/property-listings/6989ad85dc846bc552f87a4f/documents \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: multipart/form-data" \
  -F "documents=@path/to/id-proof.pdf" \
  -F "documents=@path/to/income-certificate.docx" \
  -F "documents=@path/to/bank-statement.xlsx"
```

**Response:**
```json
{
  "success": true,
  "message": "Documents uploaded successfully",
  "data": {
    "_id": "6989ad85dc846bc552f87a4f",
    "propertyId": {
      "_id": "6989a410deddcafffff4867f",
      "title": "Luxury Villa in Mumbai",
      "propertyType": "residential",
      "listingType": "sale",
      "price": 50000000
    },
    "customerId": {
      "_id": "6989aa0ddeddcafffff48699",
      "fullName": "John Doe",
      "email": "john@example.com"
    },
    "listingType": "offer",
    "status": "pending",
    "documents": [
      {
        "name": "id-proof.pdf",
        "url": "https://s3.amazonaws.com/bucket-name/patil-associate/property-documents/uuid-timestamp-id-proof.pdf",
        "type": "application/pdf"
      },
      {
        "name": "income-certificate.docx",
        "url": "https://s3.amazonaws.com/bucket-name/patil-associate/property-documents/uuid-timestamp-income-certificate.docx",
        "type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      }
    ],
    "createdAt": "2026-02-09T09:48:53.939Z",
    "updatedAt": "2026-02-09T10:15:22.123Z"
  }
}
```

### Delete Document from Property Listing
**DELETE** `/api/property-listings/:listingId/documents/:documentIndex`

**Authentication:** Required (Listing owner, agent, or admin)

**Description:** Delete a specific document from a property listing. The document is also removed from S3 storage.

**Request:**
```bash
curl -X DELETE http://localhost:3000/api/property-listings/6989ad85dc846bc552f87a4f/documents/0 \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Response:**
```json
{
  "success": true,
  "message": "Document deleted successfully",
  "data": {
    "_id": "6989ad85dc846bc552f87a4f",
    "propertyId": {
      "_id": "6989a410deddcafffff4867f",
      "title": "Luxury Villa in Mumbai"
    },
    "customerId": {
      "_id": "6989aa0ddeddcafffff48699",
      "fullName": "John Doe",
      "email": "john@example.com"
    },
    "listingType": "offer",
    "status": "pending",
    "documents": [], // Document removed from array
    "createdAt": "2026-02-09T09:48:53.939Z",
    "updatedAt": "2026-02-09T10:20:45.456Z"
  }
}
```

### Get Listing Statistics
**GET** `/api/property-listings/stats`

**Authentication:** Required (Admin only)

**Response:**
```json
{
  "success": true,
  "message": "Listing statistics retrieved successfully",
  "data": {
    "totalListings": 200,
    "pendingListings": 75,
    "acceptedListings": 80,
    "completedListings": 30,
    "cancelledListings": 15,
    "typeStats": [
      {
        "_id": "inquiry",
        "count": 120
      },
      {
        "_id": "offer",
        "count": 50
      },
      {
        "_id": "booking",
        "count": 30
      }
    ],
    "recentListings": 45
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
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_BUCKET_NAME=your_s3_bucket_name
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
| AWS_ACCESS_KEY_ID | AWS Access Key ID for S3 | Yes (for image storage) |
| AWS_SECRET_ACCESS_KEY | AWS Secret Access Key for S3 | Yes (for image storage) |
| AWS_REGION | AWS Region for S3 bucket | Yes (for image storage) |
| AWS_BUCKET_NAME | S3 bucket name for storing images | Yes (for image storage) |

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