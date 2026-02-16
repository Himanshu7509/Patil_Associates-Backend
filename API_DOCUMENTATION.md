# Patil Associate Backend API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## API Categories

### 1. PUBLIC ROUTES (No Authentication Required)

#### Authentication Routes

**POST** `/auth/signup` - User registration
- **Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "phone": "+919876543210",
  "role": "customer" // Optional: customer (default) or admin
}
```
- **Response**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer"
    },
    "token": "jwt_token_here"
  }
}
```

**POST** `/auth/login` - User login
- **Request Body**:
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer"
    },
    "token": "jwt_token_here"
  }
}
```

#### Hotel Room Routes

**GET** `/hotel-rooms/public/:id` - Get room by ID (public access)
- **URL Parameters**: `id` (Room ID)
- **Response**:
```json
{
  "success": true,
  "message": "Room retrieved successfully",
  "data": {
    "_id": "room_id",
    "roomNumber": "101",
    "roomType": "deluxe",
    "floor": 1,
    "capacity": 2,
    "pricePerNight": 2500,
    "viewType": "city",
    "description": "Beautiful deluxe room with city view",
    "images": ["image_url_1", "image_url_2"],
    "isActive": true,
    "isAvailable": true,
    "createdAt": "2026-02-16T10:00:00.000Z",
    "updatedAt": "2026-02-16T10:00:00.000Z"
  }
}
```

**GET** `/hotel-rooms/available` - Get available rooms for specific dates
- **Query Parameters**:
  - `checkInDate` (required): Date format YYYY-MM-DD
  - `checkOutDate` (required): Date format YYYY-MM-DD
  - `numberOfGuests` (optional): Number of guests
  - `roomType` (optional): Filter by room type
- **Example**: `/hotel-rooms/available?checkInDate=2026-03-01&checkOutDate=2026-03-05&numberOfGuests=2&roomType=deluxe`
- **Response**:
```json
{
  "success": true,
  "message": "Available rooms retrieved successfully",
  "data": {
    "checkInDate": "2026-03-01",
    "checkOutDate": "2026-03-05",
    "numberOfGuests": 2,
    "roomType": "deluxe",
    "availableRooms": [...],
    "count": 5
  }
}
```

**GET** `/hotel-rooms` - Get all rooms with pagination
- **Query Parameters**:
  - `isActive` (optional): true/false
  - `isAvailable` (optional): true/false
  - `roomType` (optional): deluxe, standard, suite, etc.
  - `viewType` (optional): city, ocean, garden, etc.
  - `floor` (optional): Floor number
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 12)
- **Response**:
```json
{
  "success": true,
  "message": "Rooms retrieved successfully",
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 12,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "count": 12
}
```

#### Menu Routes

**GET** `/menu` - Get all menu items
- **Query Parameters**:
  - `category` (optional): Filter by category
  - `isAvailable` (optional): true/false
  - `page`, `limit` for pagination
- **Response**:
```json
{
  "success": true,
  "message": "Menu items retrieved successfully",
  "data": [
    {
      "_id": "item_id",
      "name": "Butter Chicken",
      "description": "Creamy butter chicken with naan",
      "price": 350,
      "category": "main_course",
      "isAvailable": true,
      "image": "image_url"
    }
  ]
}
```

**GET** `/menu/:id` - Get menu item by ID
- **URL Parameters**: `id` (Menu item ID)

**GET** `/menu/category/:category` - Get menu items by category
- **URL Parameters**: `category` (main_course, starter, dessert, etc.)

#### Restaurant Routes

**GET** `/restaurants` - Get all restaurants
- **Query Parameters**: `isActive`, `page`, `limit`

**GET** `/restaurants/:id` - Get restaurant by ID
- **URL Parameters**: `id` (Restaurant ID)

#### Property Routes

**GET** `/properties` - Get all properties
- **Query Parameters**: `isActive`, `propertyType`, `location`, `page`, `limit`

**GET** `/properties/:id` - Get property by ID
- **URL Parameters**: `id` (Property ID)

#### Property Listing Routes

**GET** `/property-listings` - Get all property listings
- **Query Parameters**: `status`, `propertyType`, `minPrice`, `maxPrice`, `page`, `limit`

**GET** `/property-listings/:id` - Get property listing by ID
- **URL Parameters**: `id` (Property listing ID)

#### Table Routes

**GET** `/tables` - Get all tables
- **Query Parameters**: `restaurantId`, `capacity`, `isActive`, `page`, `limit`

**GET** `/tables/:id` - Get table by ID
- **URL Parameters**: `id` (Table ID)

**GET** `/tables/available` - Get available tables for specific date/time
- **Query Parameters**:
  - `date` (required): YYYY-MM-DD
  - `time` (required): HH:MM format
  - `restaurantId` (optional)
  - `numberOfGuests` (optional)

#### Hotel Booking Routes

**GET** `/hotel-bookings/available-rooms` - Get available rooms for booking
- **Query Parameters**: `checkInDate`, `checkOutDate`, `numberOfGuests` (optional)

#### Query Routes

**POST** `/queries` - Submit a query/contact form
- **Request Body**:
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+919876543210",
  "message": "I would like to know more about your services",
  "product": "bar & restaurant", // Options: bar & restaurant, hotel, properties
  "source": "website" // Optional: website, referral, advertisement, other
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Query submitted successfully",
  "data": {
    "_id": "query_id",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+919876543210",
    "message": "I would like to know more about your services",
    "product": "bar & restaurant",
    "source": "website",
    "status": "pending",
    "createdAt": "2026-02-16T10:00:00.000Z",
    "updatedAt": "2026-02-16T10:00:00.000Z"
  }
}
```

### 2. USER ROUTES (Authentication Required)

#### Profile Routes

**GET** `/profile` - Get user's own profile
- **Response**:
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+919876543210",
    "role": "customer",
    "profilePicture": "image_url",
    "documents": ["doc_url_1", "doc_url_2"],
    "createdAt": "2026-02-16T10:00:00.000Z"
  }
}
```

**PUT** `/profile` - Update user's own profile
- **Request Body**:
```json
{
  "name": "John Smith",
  "phone": "+919876543211",
  "address": "New Address"
}
```

**POST** `/profile/picture` - Upload profile picture
- **Form Data**: `profilePicture` (file, image format)
- **Response**:
```json
{
  "success": true,
  "message": "Profile picture uploaded successfully",
  "data": {
    "profilePicture": "new_image_url"
  }
}
```

**POST** `/profile/document` - Upload document
- **Form Data**: `document` (file, PDF/DOC formats)
- **Response**:
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "documentUrl": "document_url"
  }
}
```

#### Hotel Booking Routes

**POST** `/hotel-bookings` - Create a new booking
- **Request Body**:
```json
{
  "roomId": "room_id",
  "checkInDate": "2026-03-01",
  "checkOutDate": "2026-03-05",
  "numberOfGuests": 2,
  "specialRequests": "Early check-in preferred"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "_id": "booking_id",
    "userId": "user_id",
    "roomId": "room_id",
    "checkInDate": "2026-03-01T00:00:00.000Z",
    "checkOutDate": "2026-03-05T00:00:00.000Z",
    "numberOfGuests": 2,
    "totalAmount": 10000,
    "status": "pending",
    "specialRequests": "Early check-in preferred"
  }
}
```

**GET** `/hotel-bookings/my-bookings` - Get user's bookings
- **Query Parameters**: `status`, `page`, `limit`
- **Response**:
```json
{
  "success": true,
  "message": "Bookings retrieved successfully",
  "data": [...],
  "count": 3
}
```

**GET** `/hotel-bookings/:id` - Get specific booking by ID
- **URL Parameters**: `id` (Booking ID)

**PUT** `/hotel-bookings/:id` - Update booking
- **URL Parameters**: `id` (Booking ID)
- **Request Body**: Same as POST but only fields to update

**DELETE** `/hotel-bookings/:id` - Cancel booking
- **URL Parameters**: `id` (Booking ID)

#### Restaurant Booking Routes

**POST** `/restaurant-bookings` - Create a new restaurant booking
- **Request Body**:
```json
{
  "restaurantId": "restaurant_id",
  "tableId": "table_id",
  "date": "2026-03-01",
  "time": "19:30",
  "numberOfGuests": 4,
  "specialRequests": "Window seat preferred"
}
```

**GET** `/restaurant-bookings/my-bookings` - Get user's restaurant bookings
- **Query Parameters**: `status`, `page`, `limit`

**GET** `/restaurant-bookings/:id` - Get specific restaurant booking by ID
- **URL Parameters**: `id` (Restaurant booking ID)

**PUT** `/restaurant-bookings/:id` - Update restaurant booking
- **URL Parameters**: `id` (Restaurant booking ID)

**DELETE** `/restaurant-bookings/:id` - Cancel restaurant booking
- **URL Parameters**: `id` (Restaurant booking ID)

#### Billing Routes

**GET** `/billing/my-bills` - Get user's bills
- **Query Parameters**: `status`, `page`, `limit`
- **Response**:
```json
{
  "success": true,
  "message": "Bills retrieved successfully",
  "data": [
    {
      "_id": "bill_id",
      "bookingId": "booking_id",
      "userId": "user_id",
      "amount": 2500,
      "gstAmount": 450,
      "totalAmount": 2950,
      "status": "pending",
      "items": [...],
      "createdAt": "2026-02-16T10:00:00.000Z"
    }
  ]
}
```

**GET** `/billing/:id` - Get specific bill by ID
- **URL Parameters**: `id` (Bill ID)

**POST** `/billing/:id/pay` - Pay a bill
- **URL Parameters**: `id` (Bill ID)
- **Request Body**:
```json
{
  "paymentMethod": "credit_card",
  "transactionId": "txn_123456"
}
```

**GET** `/billing/:id/print` - Get printable bill
- **URL Parameters**: `id` (Bill ID)
- **Response**: PDF file or HTML content

### 3. ADMIN ROUTES (Authentication + Admin Role Required)

#### User Management Routes

**GET** `/admin/users` - Get all users
- **Query Parameters**: `role`, `isActive`, `page`, `limit`
- **Response**:
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer",
      "isActive": true,
      "createdAt": "2026-02-16T10:00:00.000Z"
    }
  ]
}
```

**GET** `/admin/users/:id` - Get user by ID
- **URL Parameters**: `id` (User ID)

**PUT** `/admin/users/:id` - Update user
- **URL Parameters**: `id` (User ID)
- **Request Body**:
```json
{
  "name": "Updated Name",
  "role": "admin",
  "isActive": false
}
```

**DELETE** `/admin/users/:id` - Delete user
- **URL Parameters**: `id` (User ID)

#### Hotel Room Routes

**POST** `/hotel-rooms` - Create a new room
- **Form Data**:
  - `roomNumber` (string, required)
  - `roomType` (string, required): deluxe, standard, suite
  - `floor` (number, required)
  - `capacity` (number, required)
  - `pricePerNight` (number, required)
  - `viewType` (string): city, ocean, garden
  - `description` (string)
  - `images` (multiple files, image format)
- **Response**:
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
    "pricePerNight": 2500,
    "images": ["image_url_1", "image_url_2"],
    "isActive": true,
    "isAvailable": true
  }
}
```

**GET** `/hotel-rooms/stats` - Get room statistics
- **Response**:
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
        "count": 20,
        "averagePrice": 3000
      }
    ]
  }
}
```

**GET** `/hotel-rooms/:id` - Get room by ID (admin)
- **URL Parameters**: `id` (Room ID)

**PUT** `/hotel-rooms/:id` - Update room
- **URL Parameters**: `id` (Room ID)
- **Form Data**: Same as POST but optional fields

**DELETE** `/hotel-rooms/:id` - Delete room
- **URL Parameters**: `id` (Room ID)

**POST** `/hotel-rooms/upload/images` - Upload room images
- **Form Data**: `images` (multiple files, image format)

#### Menu Routes

**POST** `/menu` - Create a new menu item
- **Request Body**:
```json
{
  "name": "Butter Chicken",
  "description": "Creamy butter chicken",
  "price": 350,
  "category": "main_course",
  "isAvailable": true
}
```

**PUT** `/menu/:id` - Update menu item
- **URL Parameters**: `id` (Menu item ID)

**DELETE** `/menu/:id` - Delete menu item
- **URL Parameters**: `id` (Menu item ID)

#### Restaurant Routes

**POST** `/restaurants` - Create a new restaurant
- **Request Body**:
```json
{
  "name": "The Grand Restaurant",
  "description": "Fine dining experience",
  "location": "Main Street",
  "contact": "+919876543210",
  "isActive": true
}
```

**PUT** `/restaurants/:id` - Update restaurant
- **URL Parameters**: `id` (Restaurant ID)

**DELETE** `/restaurants/:id` - Delete restaurant
- **URL Parameters**: `id` (Restaurant ID)

#### Property Routes

**POST** `/properties` - Create a new property
- **Request Body**:
```json
{
  "title": "Luxury Villa",
  "description": "Beautiful luxury villa",
  "propertyType": "villa",
  "location": "Beach Road",
  "price": 5000000,
  "bedrooms": 4,
  "bathrooms": 3,
  "area": 2500,
  "isActive": true
}
```

**PUT** `/properties/:id` - Update property
- **URL Parameters**: `id` (Property ID)

**DELETE** `/properties/:id` - Delete property
- **URL Parameters**: `id` (Property ID)

#### Property Listing Routes

**POST** `/property-listings` - Create a new property listing
- **Request Body**:
```json
{
  "propertyId": "property_id",
  "listingType": "sale",
  "price": 5000000,
  "status": "available"
}
```

**PUT** `/property-listings/:id` - Update property listing
- **URL Parameters**: `id` (Property listing ID)

**DELETE** `/property-listings/:id` - Delete property listing
- **URL Parameters**: `id` (Property listing ID)

#### Table Routes

**POST** `/tables` - Create a new table
- **Request Body**:
```json
{
  "restaurantId": "restaurant_id",
  "tableNumber": "T01",
  "capacity": 4,
  "location": "window",
  "isActive": true
}
```

**PUT** `/tables/:id` - Update table
- **URL Parameters**: `id` (Table ID)

**DELETE** `/tables/:id` - Delete table
- **URL Parameters**: `id` (Table ID)

#### Hotel Booking Routes

**GET** `/hotel-bookings` - Get all bookings
- **Query Parameters**: `status`, `userId`, `roomId`, `page`, `limit`

**PUT** `/hotel-bookings/:id/status` - Update booking status
- **URL Parameters**: `id` (Booking ID)
- **Request Body**:
```json
{
  "status": "confirmed" // pending, confirmed, checked_in, checked_out, cancelled
}
```

**DELETE** `/hotel-bookings/:id` - Delete booking (admin)
- **URL Parameters**: `id` (Booking ID)

#### Restaurant Booking Routes

**GET** `/restaurant-bookings` - Get all restaurant bookings
- **Query Parameters**: `status`, `userId`, `restaurantId`, `page`, `limit`

**PUT** `/restaurant-bookings/:id/status` - Update restaurant booking status
- **URL Parameters**: `id` (Restaurant booking ID)
- **Request Body**:
```json
{
  "status": "confirmed" // pending, confirmed, completed, cancelled
}
```

**DELETE** `/restaurant-bookings/:id` - Delete restaurant booking (admin)
- **URL Parameters**: `id` (Restaurant booking ID)

#### Billing Routes

**GET** `/billing` - Get all bills
- **Query Parameters**: `status`, `userId`, `page`, `limit`

**POST** `/billing` - Create a new bill
- **Request Body**:
```json
{
  "bookingId": "booking_id",
  "userId": "user_id",
  "amount": 2500,
  "items": [
    {
      "description": "Room charge",
      "quantity": 1,
      "unitPrice": 2500,
      "total": 2500
    }
  ]
}
```

**PUT** `/billing/:id` - Update bill
- **URL Parameters**: `id` (Bill ID)

**DELETE** `/billing/:id` - Delete bill
- **URL Parameters**: `id` (Bill ID)

#### Query Management Routes (Admin Only)

**GET** `/queries` - Get all queries
- **Query Parameters**: `product`, `status`, `page`, `limit`
- **Response**:
```json
{
  "success": true,
  "message": "Queries retrieved successfully",
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "count": 10
}
```

**GET** `/queries/stats` - Get query statistics
- **Response**:
```json
{
  "success": true,
  "message": "Query statistics retrieved successfully",
  "data": {
    "totalQueries": 150,
    "productStats": [
      { "_id": "bar & restaurant", "count": 60 },
      { "_id": "hotel", "count": 50 },
      { "_id": "properties", "count": 40 }
    ],
    "statusStats": [
      { "_id": "pending", "count": 80 },
      { "_id": "reviewed", "count": 40 },
      { "_id": "contacted", "count": 20 },
      { "_id": "resolved", "count": 10 }
    ],
    "recentQueries": 25
  }
}
```

**GET** `/queries/:id` - Get specific query by ID
- **URL Parameters**: `id` (Query ID)

**PUT** `/queries/:id/status` - Update query status
- **URL Parameters**: `id` (Query ID)
- **Request Body**:
```json
{
  "status": "reviewed" // Options: pending, reviewed, contacted, resolved, closed
}
```

**DELETE** `/queries/:id` - Delete query
- **URL Parameters**: `id` (Query ID)

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error message here",
  "error": "Detailed error description"
}
```

## Success Responses

Successful requests return:

```json
{
  "success": true,
  "message": "Success message",
  "data": {...} // Response data
}
```

## Pagination

Paginated endpoints return:

```json
{
  "success": true,
  "message": "Success message",
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 12,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "count": 12
}
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse. Excessive requests will return a 429 status code.

## CORS Policy

The API accepts requests from all origins during development. Production configuration may be more restrictive.

## Version Information

- **API Version**: v1
- **Last Updated**: February 2026
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Authentication**: JWT
- **File Storage**: AWS S3