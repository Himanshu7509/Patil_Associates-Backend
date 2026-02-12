# Patil Associates Unified Backend API Documentation

## Overview
This is a comprehensive RESTful API for Patil Associates that manages multiple business operations including restaurant bookings, hotel management, property listings, and user authentication.

**Base URL:** `http://localhost:3000` or your deployed server URL
**API Prefix:** `/api`

---

## Authentication

### JWT Token
Most endpoints require authentication using JWT tokens. Tokens are returned upon successful login/signup and should be included in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles
- `customer` - Regular users
- `admin` - Administrative users with extended privileges

---

## API Endpoints

### 1. Authentication Routes `/api/auth`

#### Signup
Create a new user account

**POST** `/api/auth/signup`

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phoneNo": "+919876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "60f7b1b1c9e8f10015d1b1a1",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phoneNo": "+919876543210",
    "roles": ["customer"],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Login
Authenticate user and receive JWT token

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
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "60f7b1b1c9e8f10015d1b1a1",
    "fullName": "John Doe",
    "email": "john@example.com",
    "roles": ["customer"]
  }
}
```

---

### 2. Restaurant Booking Routes `/api/restaurant`

The restaurant booking system allows customers to browse menu items and book tables either with or without creating an account. Customers can place orders and book tables seamlessly without requiring authentication, though registered users have additional features like viewing their booking history.

#### Get All Menu Items (Public)
Browse all available menu items before placing an order

**GET** `/api/menu/`

**Response:**
```json
{
  "success": true,
  "message": "Menu items retrieved successfully",
  "data": [
    {
      "_id": "60f7b1b1c9e8f10015d1b1a1",
      "name": "Paneer Tikka",
      "description": "Grilled cottage cheese with spices",
      "price": 250,
      "category": "appetizer",
      "dietaryOptions": ["vegetarian"],
      "isActive": true,
      "image": "https://example.com/paneer-tikka.jpg"
    }
  ]
}
```

#### Get Bookings by Date Range (Public)
Retrieve restaurant bookings within a specific date range

**GET** `/api/restaurant/date-range?startDate=2024-01-01&endDate=2024-01-31`

**Query Parameters:**
- `startDate` (required): Start date in YYYY-MM-DD format
- `endDate` (required): End date in YYYY-MM-DD format

**Response:**
```json
{
  "success": true,
  "message": "Bookings retrieved successfully",
  "data": [
    {
      "_id": "60f7b1b1c9e8f10015d1b1a1",
      "partySize": 4,
      "bookingDate": "2024-01-15T00:00:00.000Z",
      "bookingTime": "19:30",
      "status": "confirmed",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Get Available Tables (Public)
Check which tables are available for a specific date and time

**GET** `/api/restaurant/available-tables?date=2024-01-15&time=19:30`

**Query Parameters:**
- `date` (required): Date in YYYY-MM-DD format
- `time` (required): Time in HH:MM format

**Response:**
```json
{
  "success": true,
  "message": "Available tables retrieved successfully",
  "data": {
    "date": "2024-01-15",
    "time": "19:30",
    "availableTables": ["1", "3", "5", "7"],
    "bookedTables": ["2", "4", "6"],
    "totalAvailable": 4
  }
}
```

#### Get All Bookings (Authenticated)
Retrieve all bookings for the authenticated user

**GET** `/api/restaurant/`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Bookings retrieved successfully",
  "data": [
    {
      "_id": "60f7b1b1c9e8f10015d1b1a1",
      "customerId": "60f7b1b1c9e8f10015d1b1a1",
      "partySize": 4,
      "bookingDate": "2024-01-15T00:00:00.000Z",
      "bookingTime": "19:30",
      "status": "confirmed",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Create Booking (Public/Authenticated)
Create a new restaurant booking. This endpoint supports both authenticated users (who can use their account details) and unauthenticated users (guests).

**POST** `/api/restaurant/`

**For Unauthenticated Users (Guests):**
Create a booking without an account by providing customer details.

**Request Body:**
```json
{
  "partySize": 4,
  "bookingDate": "2024-01-15",
  "bookingTime": "19:30",
  "specialRequests": "Window seat preferred",
  "tableNumber": "12",
  "bookingType": "table",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+919876543210",
  "orderDetails": [
    {
      "itemId": "60f7b1b1c9e8f10015d1b1a1",
      "quantity": 2,
      "price": 250
    }
  ],
  "totalAmount": 500
}
```

**For Authenticated Users:**
Create a booking using account details. Customer information will be auto-populated from the user's account if not provided.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "partySize": 4,
  "bookingDate": "2024-01-15",
  "bookingTime": "19:30",
  "specialRequests": "Window seat preferred",
  "tableNumber": "12",
  "bookingType": "table",
  "orderDetails": [
    {
      "itemId": "60f7b1b1c9e8f10015d1b1a1",
      "quantity": 2,
      "price": 250
    }
  ],
  "totalAmount": 500
  // customerName, customerEmail, customerPhone will be auto-populated from account
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "_id": "60f7b1b1c9e8f10015d1b1a1",
    "customerId": {
      "_id": "user_id",
      "fullName": "John Doe",
      "email": "john@example.com"
    },
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "+919876543210",
    "partySize": 4,
    "bookingDate": "2024-01-15T00:00:00.000Z",
    "bookingTime": "19:30",
    "specialRequests": "Window seat preferred",
    "tableNumber": "12",
    "status": "pending",
    "bookingType": "table",
    "orderDetails": [
      {
        "itemId": "60f7b1b1c9e8f10015d1b1a1",
        "itemName": "Paneer Tikka",
        "quantity": 2,
        "price": 250,
        "description": "Grilled cottage cheese with spices",
        "category": "appetizer",
        "ingredients": ["paneer", "spices", "herbs"],
        "dietaryOptions": ["vegetarian"],
        "image": "https://example.com/paneer-tikka.jpg",
        "cookingTime": 25
      }
    ],
    "totalAmount": 500,
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
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Get Booking by ID (Authenticated)
Retrieve a specific booking by ID

**GET** `/api/restaurant/:id`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

#### Update Booking (Admin Only)
Update an existing booking

**PUT** `/api/restaurant/:id`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "status": "confirmed",
  "tableNumber": "5"
}
```

#### Delete Booking (Admin Only)
Delete a booking

**DELETE** `/api/restaurant/:id`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

---

### 3. Table Management Routes `/api/tables`

#### Get Available Tables by Criteria (Public)
Get available tables based on specific criteria

**GET** `/api/tables/available?date=2024-01-15&time=19:30&partySize=4&location=indoor`

**Query Parameters:**
- `date` (required): Date in YYYY-MM-DD format
- `time` (required): Time in HH:MM format
- `partySize` (required): Number of people
- `location` (optional): Table location (indoor, outdoor, patio, vip, bar_area)

**Response:**
```json
{
  "success": true,
  "message": "Available tables retrieved successfully",
  "data": [
    {
      "_id": "60f7b1b1c9e8f10015d1b1a1",
      "tableNumber": "5",
      "capacity": 6,
      "location": "indoor",
      "shape": "round",
      "isActive": true
    }
  ]
}
```

#### Get All Tables (Admin Only)
Retrieve all tables

**GET** `/api/tables/`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `isActive` (optional): Filter by active status (true/false)
- `location` (optional): Filter by location
- `capacity` (optional): Minimum capacity

#### Create Table (Admin Only)
Create a new table

**POST** `/api/tables/`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "tableNumber": "10",
  "capacity": 4,
  "location": "indoor",
  "shape": "round",
  "features": ["window_view", "quiet_corner"],
  "notes": "Corner table near window"
}
```

#### Get Table by ID (Admin Only)
Retrieve a specific table

**GET** `/api/tables/:id`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

#### Update Table (Admin Only)
Update table information

**PUT** `/api/tables/:id`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

#### Delete Table (Admin Only)
Delete a table

**DELETE** `/api/tables/:id`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

---

### 4. Menu Management Routes `/api/menu`

#### Get All Menu Items (Public)
Retrieve all active menu items

**GET** `/api/menu/`

**Response:**
```json
{
  "success": true,
  "message": "Menu items retrieved successfully",
  "data": [
    {
      "_id": "60f7b1b1c9e8f10015d1b1a1",
      "name": "Paneer Tikka",
      "description": "Grilled cottage cheese with spices",
      "price": 250,
      "category": "appetizer",
      "dietaryOptions": ["vegetarian"],
      "isActive": true,
      "image": "https://example.com/paneer-tikka.jpg"
    }
  ]
}
```

#### Search Menu Items (Public)
Search menu items by name or description

**GET** `/api/menu/search?q=paneer`

**Query Parameters:**
- `q` (required): Search query

#### Get Menu Items by Category (Public)
Get menu items by category

**GET** `/api/menu/category/:category`

**Parameters:**
- `category`: appetizer, main_course, dessert, beverage, etc.

#### Get Dietary Menu Items (Public)
Get menu items for specific dietary requirements

**GET** `/api/menu/dietary/:dietaryType`

**Parameters:**
- `dietaryType`: vegetarian, vegan, gluten_free, etc.

#### Create Menu Item (Admin Only)
Create a new menu item

**POST** `/api/menu/`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "name": "Paneer Butter Masala",
  "description": "Cottage cheese in rich tomato gravy",
  "price": 320,
  "category": "main_course",
  "ingredients": ["paneer", "tomato", "butter", "cream"],
  "dietaryOptions": ["vegetarian"],
  "image": "https://example.com/paneer-butter-masala.jpg",
  "cookingTime": 30
}
```

#### Get Menu Item by ID (Admin Only)
Retrieve a specific menu item

**GET** `/api/menu/:id`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

#### Update Menu Item (Admin Only)
Update menu item information

**PUT** `/api/menu/:id`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

#### Delete Menu Item (Admin Only)
Delete a menu item

**DELETE** `/api/menu/:id`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

---

### 5. Hotel Room Routes `/api/hotel/rooms`

#### Get Available Rooms (Public)
Get available rooms for specific dates

**GET** `/api/hotel/rooms/available?checkIn=2024-01-15&checkOut=2024-01-18`

**Query Parameters:**
- `checkIn` (required): Check-in date (YYYY-MM-DD)
- `checkOut` (required): Check-out date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "message": "Available rooms retrieved successfully",
  "data": [
    {
      "_id": "60f7b1b1c9e8f10015d1b1a1",
      "roomNumber": "101",
      "roomType": "deluxe",
      "pricePerNight": 2500,
      "capacity": 2,
      "isAvailable": true
    }
  ]
}
```

#### Get Room Statistics (Admin Only)
Get room statistics and analytics

**GET** `/api/hotel/rooms/stats`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

#### Create Room (Admin Only)
Create a new hotel room

**POST** `/api/hotel/rooms/`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "roomNumber": "105",
  "roomType": "suite",
  "floor": 3,
  "capacity": 4,
  "pricePerNight": 4500,
  "amenities": ["wifi", "ac", "mini_bar", "balcony"],
  "viewType": "city",
  "bedType": "king",
  "size": 450,
  "description": "Luxury suite with city view"
}
```

#### Get All Rooms (Admin Only)
Retrieve all hotel rooms

**GET** `/api/hotel/rooms/`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

#### Get Room by ID (Admin Only)
Retrieve a specific room

**GET** `/api/hotel/rooms/:id`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

#### Update Room (Admin Only)
Update room information

**PUT** `/api/hotel/rooms/:id`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

#### Delete Room (Admin Only)
Delete a room

**DELETE** `/api/hotel/rooms/:id`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

---

### 6. Hotel Booking Routes `/api/hotel/bookings`

#### Check Room Availability (Public)
Check if rooms are available for specific dates

**GET** `/api/hotel/bookings/check-availability?checkIn=2024-01-15&checkOut=2024-01-18`

**Query Parameters:**
- `checkIn` (required): Check-in date (YYYY-MM-DD)
- `checkOut` (required): Check-out date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "message": "Room availability checked successfully",
  "data": {
    "checkIn": "2024-01-15",
    "checkOut": "2024-01-18",
    "availableRooms": 12,
    "totalRooms": 20
  }
}
```

#### Get Bookings by Date Range (Public)
Get hotel bookings within a date range

**GET** `/api/hotel/bookings/date-range?startDate=2024-01-01&endDate=2024-01-31`

**Query Parameters:**
- `startDate` (required): Start date (YYYY-MM-DD)
- `endDate` (required): End date (YYYY-MM-DD)

#### Get All Bookings (Authenticated)
Retrieve all bookings for the authenticated user

**GET** `/api/hotel/bookings/`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

#### Create Booking (Authenticated)
Create a new hotel booking

**POST** `/api/hotel/bookings/`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "roomId": "60f7b1b1c9e8f10015d1b1a1",
  "checkInDate": "2024-01-15",
  "checkOutDate": "2024-01-18",
  "numberOfGuests": 2,
  "specialRequests": "Late check-in requested",
  "guestName": "John Doe",
  "guestEmail": "john@example.com",
  "guestPhone": "+919876543210"
}
```

#### Get Booking by ID (Authenticated)
Retrieve a specific booking

**GET** `/api/hotel/bookings/:id`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

#### Update Booking (Admin Only)
Update booking information

**PUT** `/api/hotel/bookings/:id`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

#### Delete Booking (Admin Only)
Delete a booking

**DELETE** `/api/hotel/bookings/:id`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

#### Get Booking Statistics (Admin Only)
Get booking statistics and analytics

**GET** `/api/hotel/bookings/stats`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

---

### 7. Property Routes `/api/properties`

#### Get Featured Properties (Public)
Retrieve featured properties

**GET** `/api/properties/featured`

**Response:**
```json
{
  "success": true,
  "message": "Featured properties retrieved successfully",
  "data": [
    {
      "_id": "60f7b1b1c9e8f10015d1b1a1",
      "title": "Luxury Villa in Mumbai",
      "description": "Beautiful villa with modern amenities",
      "propertyType": "residential",
      "listingType": "sale",
      "price": 25000000,
      "area": 2500,
      "bedrooms": 4,
      "bathrooms": 3,
      "images": ["https://example.com/image1.jpg"],
      "isFeatured": true
    }
  ]
}
```

#### Get Property Statistics (Admin Only)
Get property statistics

**GET** `/api/properties/stats`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

#### Upload Property Images (Admin Only)
Upload images for a property

**POST** `/api/properties/upload/images`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Form Data:**
- `images` (multiple): Image files

#### Create Property (Admin Only)
Create a new property listing

**POST** `/api/properties/`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "title": "Luxury Apartment",
  "description": "Modern apartment in prime location",
  "propertyType": "residential",
  "listingType": "rent",
  "address": {
    "street": "Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001",
    "country": "India"
  },
  "price": 50000,
  "area": 1200,
  "areaUnit": "sqft",
  "bedrooms": 2,
  "bathrooms": 2,
  "parking": 1,
  "amenities": ["gym", "swimming_pool", "parking"],
  "features": ["fully_furnished", "central_ac"],
  "contactInfo": {
    "name": "Property Manager",
    "email": "manager@example.com",
    "phone": "+919876543210"
  }
}
```

#### Get All Properties (Admin Only)
Retrieve all properties

**GET** `/api/properties/`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `propertyType`: Filter by property type
- `listingType`: Filter by listing type (sale/rent)
- `city`: Filter by city
- `minPrice`: Minimum price
- `maxPrice`: Maximum price

#### Get Property by ID (Admin Only)
Retrieve a specific property

**GET** `/api/properties/:id`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

#### Update Property (Admin Only)
Update property information

**PUT** `/api/properties/:id`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

#### Delete Property (Admin Only)
Delete a property

**DELETE** `/api/properties/:id`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

---

### 8. Property Listing Routes `/api/property-listings`

#### Create Property Listing (Authenticated)
Create a new property inquiry/booking

**POST** `/api/property-listings/`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "propertyId": "60f7b1b1c9e8f10015d1b1a1",
  "listingType": "inquiry",
  "customerInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+919876543210",
    "message": "Interested in scheduling a viewing"
  }
}
```

#### Get All Property Listings (Authenticated)
Retrieve all property listings for the authenticated user

**GET** `/api/property-listings/`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

#### Schedule Viewing (Admin Only)
Schedule a property viewing

**POST** `/api/property-listings/:id/schedule-viewing`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "date": "2024-01-20",
  "time": "15:00"
}
```

#### Update Viewing Status (Admin Only)
Update the status of a property viewing

**PUT** `/api/property-listings/:id/viewing-status`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "status": "completed"
}
```

#### Get Listing Statistics (Admin Only)
Get property listing statistics

**GET** `/api/property-listings/stats`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

#### Upload Listing Documents (Admin Only)
Upload documents for a property listing

**POST** `/api/property-listings/:id/documents`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Form Data:**
- `documents` (multiple): Document files

#### Delete Listing Document (Admin Only)
Delete a document from a property listing

**DELETE** `/api/property-listings/:id/documents/:documentId`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

#### Get Property Listing by ID (Admin Only)
Retrieve a specific property listing

**GET** `/api/property-listings/:id`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

#### Update Property Listing (Admin Only)
Update property listing information

**PUT** `/api/property-listings/:id`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

#### Delete Property Listing (Admin Only)
Delete a property listing

**DELETE** `/api/property-listings/:id`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

---

## Error Responses

### General Error Format
```json
{
  "success": false,
  "message": "Error message description",
  "error": "Detailed error information"
}
```

### Common HTTP Status Codes
- **200 OK**: Successful request
- **201 Created**: Resource successfully created
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Access denied, insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource already exists
- **500 Internal Server Error**: Server error

---

## Data Models

### User Model
```json
{
  "_id": "ObjectId",
  "fullName": "String",
  "email": "String",
  "password": "String (hashed)",
  "phoneNo": "String",
  "roles": ["customer"|"admin"],
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Restaurant Booking Model
```json
{
  "_id": "ObjectId",
  "customerId": "ObjectId (ref: User)",
  "customerName": "String",
  "customerEmail": "String",
  "customerPhone": "String",
  "partySize": "Number",
  "bookingDate": "Date",
  "bookingTime": "String (HH:MM)",
  "specialRequests": "String",
  "tableNumber": "String",
  "status": "pending|confirmed|cancelled|completed",
  "bookingType": "table|event|private_dining|regular",
  "orderDetails": [
    {
      "itemId": "ObjectId (ref: MenuItem)",
      "itemName": "String",
      "quantity": "Number",
      "price": "Number",
      "description": "String",
      "category": "String",
      "ingredients": ["String"],
      "dietaryOptions": ["String"],
      "image": "String (URL)",
      "cookingTime": "Number (minutes)"
    }
  ],
  "tableDetails": [
    {
      "tableId": "ObjectId (ref: Table)",
      "tableNumber": "String",
      "capacity": "Number",
      "location": "String",
      "shape": "String",
      "features": ["String"],
      "isActive": "Boolean",
      "notes": "String"
    }
  ],
  "totalAmount": "Number",
  "notes": "String",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Table Model
```json
{
  "_id": "ObjectId",
  "tableNumber": "String",
  "capacity": "Number",
  "location": "indoor|outdoor|patio|vip|bar_area",
  "shape": "round|square|rectangle|oval|semi_circle",
  "features": ["window_view", "quiet_corner", "near_bar", "accessible", "high_top", "booth"],
  "isActive": "Boolean",
  "notes": "String",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Menu Item Model
```json
{
  "_id": "ObjectId",
  "name": "String",
  "description": "String",
  "price": "Number",
  "category": "appetizer|main_course|dessert|beverage|alcoholic_beverage|non_alcoholic_beverage|specials",
  "ingredients": ["String"],
  "dietaryOptions": ["vegetarian", "vegan", "gluten_free", "dairy_free", "nut_free", "halal", "kosher"],
  "isActive": "Boolean",
  "image": "String (URL)",
  "cookingTime": "Number (minutes)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Hotel Room Model
```json
{
  "_id": "ObjectId",
  "roomNumber": "String",
  "roomType": "single|double|twin|suite|deluxe|family|presidential",
  "floor": "Number",
  "capacity": "Number",
  "pricePerNight": "Number",
  "amenities": ["String"],
  "viewType": "city|ocean|mountain|garden|pool|none",
  "bedType": "single|double|queen|king|sofa_bed",
  "size": "Number (sq ft)",
  "description": "String",
  "images": ["String"],
  "isActive": "Boolean",
  "isAvailable": "Boolean",
  "maintenanceNotes": "String",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Hotel Booking Model
```json
{
  "_id": "ObjectId",
  "customerId": "ObjectId (ref: User)",
  "roomId": "ObjectId (ref: HotelRoom)",
  "checkInDate": "Date",
  "checkOutDate": "Date",
  "numberOfGuests": "Number",
  "totalPrice": "Number",
  "status": "pending|confirmed|checked_in|checked_out|cancelled|no_show",
  "specialRequests": "String",
  "guestName": "String",
  "guestEmail": "String",
  "guestPhone": "String",
  "paymentStatus": "pending|paid|partial|refunded",
  "paymentMethod": "credit_card|debit_card|cash|bank_transfer|paypal|other",
  "bookingSource": "website|phone|walk_in|travel_agent|booking_com|expedia|other",
  "notes": "String",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Property Model
```json
{
  "_id": "ObjectId",
  "title": "String",
  "description": "String",
  "propertyType": "residential|commercial|industrial|agricultural|land|mixed_use",
  "listingType": "sale|rent|lease",
  "address": {
    "street": "String",
    "city": "String",
    "state": "String",
    "zipCode": "String",
    "country": "String"
  },
  "price": "Number",
  "area": "Number",
  "areaUnit": "sqft|sqm|acres|hectares",
  "bedrooms": "Number",
  "bathrooms": "Number",
  "parking": "Number",
  "amenities": ["String"],
  "features": ["String"],
  "images": ["String"],
  "isActive": "Boolean",
  "isFeatured": "Boolean",
  "contactInfo": {
    "name": "String",
    "email": "String",
    "phone": "String"
  },
  "agentId": "ObjectId (ref: User)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Property Listing Model
```json
{
  "_id": "ObjectId",
  "propertyId": "ObjectId (ref: Property)",
  "customerId": "ObjectId (ref: User)",
  "listingType": "inquiry|offer|booking|sold|rented",
  "status": "pending|reviewed|accepted|rejected|completed|cancelled",
  "customerInfo": {
    "name": "String",
    "email": "String",
    "phone": "String",
    "message": "String"
  },
  "offerPrice": "Number",
  "proposedRent": "Number",
  "leaseDuration": "String",
  "moveInDate": "Date",
  "viewingSchedule": {
    "date": "Date",
    "time": "String",
    "status": "scheduled|confirmed|completed|cancelled"
  },
  "paymentInfo": {
    "amount": "Number",
    "paymentMethod": "cash|bank_transfer|cheque|online_payment",
    "paymentStatus": "pending|partial|completed|refunded"
  },
  "documents": [
    {
      "name": "String",
      "url": "String",
      "type": "String"
    }
  ],
  "notes": "String",
  "agentId": "ObjectId (ref: User)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin_password
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_BUCKET_NAME=your_s3_bucket_name
```

---

## Rate Limiting

API requests are rate-limited to prevent abuse:
- **Anonymous requests**: 100 requests per hour
- **Authenticated requests**: 1000 requests per hour
- **Admin requests**: 5000 requests per hour

---

## CORS Policy

The API allows requests from all origins in development. In production, configure the `cors()` middleware in `index.js` to restrict allowed origins.

---

## Versioning

Current API version: v1.0.0

---

## Support

For API support and questions, contact:
- Email: support@eliteassociate.in
- Phone: +91-XXXXXXXXXX

---

*Last Updated: February 12, 2026*