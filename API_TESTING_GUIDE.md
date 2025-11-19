# API Testing Guide

## 🚀 Application Running Successfully!

The Retailer Sales Representative API is now running on `http://localhost:9999/api/v1`

## 📚 API Documentation

Swagger UI is available at: `http://localhost:9999/api/docs`

## 📝 API Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful!"
}
```

For paginated endpoints, the response includes a `meta` object:

```json
{
  "success": true,
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  },
  "message": "Data retrieved successfully!"
}
```

### Pagination Parameters

Paginated endpoints support the following query parameters:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10 for sales-reps, 20 for retailers)

**Example:** `GET /retailers?page=2&limit=20`

### Filtering & Search

Retailers endpoint supports:
- `search` - Search in name, UID, or phone
- `regionId` - Filter by region
- `areaId` - Filter by area
- `distributorId` - Filter by distributor
- `territoryId` - Filter by territory

**Example:** `GET /retailers?search=Store&regionId=1&page=1&limit=20`

## 🔑 Login Credentials

### Admin User
- **Username**: `admin`
- **Password**: `admin123`

### Sales Rep Users
- **Username**: `karim_ahmed` | **Password**: `salesrep123`
- **Username**: `fatema_khatun` | **Password**: `salesrep123`
- **Username**: `rafiq_islam` | **Password**: `salesrep123`

## 📋 Tested Endpoints

### 1. Authentication

#### Admin Login
```bash
curl -X POST http://localhost:9999/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

#### Sales Rep Login
```bash
curl -X POST http://localhost:9999/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"karim_ahmed","password":"salesrep123"}'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "name": "Admin User",
    "role": "admin"
  }
}
```

### 2. Admin Endpoints (Require Admin Token)

#### Get All Regions
```bash
TOKEN="YOUR_ADMIN_TOKEN"
curl -X GET http://localhost:9999/api/v1/admin/regions \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Dhaka Division" },
    { "id": 2, "name": "Chittagong Division" }
  ],
  "message": "Regions retrieved successfully!"
}
```

#### Get All Areas
```bash
curl -X GET http://localhost:9999/api/v1/admin/areas \
  -H "Authorization: Bearer $TOKEN"
```

**Filter by Region:**
```bash
curl -X GET "http://localhost:9999/api/v1/admin/areas?regionId=1" \
  -H "Authorization: Bearer $TOKEN"
```

#### Get All Distributors
```bash
curl -X GET http://localhost:9999/api/v1/admin/distributors \
  -H "Authorization: Bearer $TOKEN"
```

#### Get All Territories
```bash
curl -X GET http://localhost:9999/api/v1/admin/territories \
  -H "Authorization: Bearer $TOKEN"
```

**Filter by Area:**
```bash
curl -X GET "http://localhost:9999/api/v1/admin/territories?areaId=1" \
  -H "Authorization: Bearer $TOKEN"
```

#### Get All Sales Reps (Paginated)
```bash
curl -X GET "http://localhost:9999/api/v1/admin/sales-reps?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 4,
      "username": "karim_ahmed",
      "name": "Karim Ahmed",
      "phone": "+8801712345678",
      "role": "sales_rep",
      "createdAt": "2025-11-19T10:00:00.000Z",
      "updatedAt": "2025-11-19T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 3,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  },
  "message": "Sales reps retrieved successfully!"
}
```

#### Bulk Import Retailers (CSV)
```bash
curl -X POST http://localhost:9999/api/v1/admin/retailers/import \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@retailers.csv"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "imported": 100,
    "failed": 0,
    "errors": []
  },
  "message": "Import completed successfully!"
}
```

#### Bulk Assignment of Retailers to Sales Rep
```bash
curl -X POST http://localhost:9999/api/v1/admin/assignments/bulk \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "salesRepId": 4,
    "retailerIds": [1, 2, 3, 4, 5]
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "assigned": 5,
    "alreadyAssigned": 0,
    "message": "Successfully assigned 5 retailers to sales rep"
  },
  "message": "Retailers assigned successfully!"
}
```

#### Bulk Unassign Retailers from Sales Rep
```bash
curl -X POST http://localhost:9999/api/v1/admin/assignments/bulk-unassign \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "salesRepId": 4,
    "retailerIds": [1, 2, 3]
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "unassigned": 3,
    "message": "Successfully unassigned 3 retailers from sales rep"
  },
  "message": "Retailers unassigned successfully!"
}
```

### 3. Sales Rep Endpoints

#### Get Assigned Retailers (Paginated)
```bash
SR_TOKEN="YOUR_SALES_REP_TOKEN"
curl -X GET "http://localhost:9999/api/v1/retailers?page=1&limit=10" \
  -H "Authorization: Bearer $SR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "uid": "RET-000001",
      "name": "Store 1",
      "phone": "+8801700000001",
      "points": 4529,
      "routes": "Route B",
      "notes": "Sample retailer 1",
      "regionId": 2,
      "areaId": 2,
      "distributorId": 2,
      "territoryId": 2,
      "updatedAt": "2025-11-19T10:00:00.000Z",
      "region": { "id": 2, "name": "Chittagong Division" },
      "area": { "id": 2, "name": "Gulshan" },
      "distributor": { "id": 2, "name": "XYZ Trading Company" },
      "territory": { "id": 2, "name": "Uttara Sector 8-14" }
    }
  ],
  "meta": {
    "total": 70,
    "page": 1,
    "limit": 10,
    "totalPages": 7
  },
  "message": "Retailers retrieved successfully!"
}
```

#### Search Retailers
```bash
curl -X GET "http://localhost:9999/api/v1/retailers?search=Store&page=1&limit=10" \
  -H "Authorization: Bearer $SR_TOKEN"
```

#### Filter Retailers by Region
```bash
curl -X GET "http://localhost:9999/api/v1/retailers?regionId=1&page=1&limit=10" \
  -H "Authorization: Bearer $SR_TOKEN"
```

#### Filter Retailers by Multiple Criteria
```bash
# Filter by region, area, and distributor
curl -X GET "http://localhost:9999/api/v1/retailers?regionId=1&areaId=2&distributorId=1&page=1&limit=20" \
  -H "Authorization: Bearer $SR_TOKEN"
```

#### Combined Search and Filter
```bash
# Search "Store" in retailers within region 1
curl -X GET "http://localhost:9999/api/v1/retailers?search=Store&regionId=1&page=1&limit=20" \
  -H "Authorization: Bearer $SR_TOKEN"
```

#### Get Retailer by UID
```bash
curl -X GET "http://localhost:9999/api/v1/retailers/RET-000001" \
  -H "Authorization: Bearer $SR_TOKEN"
```

#### Update Retailer (Points, Routes, Notes)
```bash
curl -X PATCH "http://localhost:9999/api/v1/retailers/RET-000001" \
  -H "Authorization: Bearer $SR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "points": 5000,
    "routes": "Route A, Route B",
    "notes": "Updated by sales rep"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "uid": "RET-000001",
    "name": "Store 1",
    "phone": "+8801700000001",
    "points": 5000,
    "routes": "Route A, Route B",
    "notes": "Updated by sales rep",
    "regionId": 2,
    "areaId": 2,
    "distributorId": 2,
    "territoryId": 2,
    "updatedAt": "2025-11-19T10:30:00.000Z"
  },
  "message": "Retailer updated successfully!"
}
```

### 4. Admin CRUD Operations

#### Create Region
```bash
curl -X POST http://localhost:9999/api/v1/admin/regions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Sylhet Division"}'
```

#### Update Region
```bash
curl -X PUT http://localhost:9999/api/v1/admin/regions/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Dhaka Division Updated"}'
```

#### Delete Region
```bash
curl -X DELETE http://localhost:9999/api/v1/admin/regions/1 \
  -H "Authorization: Bearer $TOKEN"
```

#### Create Area
```bash
curl -X POST http://localhost:9999/api/v1/admin/areas \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Mirpur", "regionId": 1}'
```

#### Create Distributor
```bash
curl -X POST http://localhost:9999/api/v1/admin/distributors \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "New Distributor Ltd"}'
```

#### Create Territory
```bash
curl -X POST http://localhost:9999/api/v1/admin/territories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Sector 10-15", "areaId": 1}'
```

#### Create Sales Rep
```bash
curl -X POST http://localhost:9999/api/v1/admin/sales-reps \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "new_sales_rep",
    "name": "New Sales Rep",
    "phone": "+8801799999999",
    "password": "password123",
    "role": "sales_rep"
  }'
```

#### Get Retailer Count for Sales Rep
```bash
curl -X GET http://localhost:9999/api/v1/admin/sales-reps/4/retailers/count \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": 70,
  "message": "Retailer count retrieved successfully!"
}
```

## ✅ Test Results

All 17 unit tests passed successfully:
- ✅ AuthService tests (5 tests)
- ✅ RegionsService tests (6 tests)
- ✅ SalesRepsService tests (6 tests)

## 🗄️ Database

- **100 sample retailers** have been created
- **3 sales reps** created with ~70 retailers each
- **5 regions**, **6 areas**, **3 distributors**, and **3 territories** seeded

## 🔄 Redis Caching

Redis is integrated and caching is working for:
- Regions
- Areas
- Distributors
- Territories
- Retailers list

## 🔒 Security Features

- ✅ JWT Authentication
- ✅ Role-based Authorization (Admin, Sales Rep)
- ✅ SQL Injection Protection Middleware
- ✅ XSS Protection Middleware
- ✅ Rate Limiting (Throttler)
- ✅ Helmet Security Headers
- ✅ CORS Configuration
- ✅ Password Hashing with bcrypt

## 🚀 Performance Optimizations

- ✅ Database indexes on frequently queried fields
- ✅ Redis caching for reference data
- ✅ Pagination for large datasets
- ✅ Prisma query optimization
- ✅ Eager loading of relations where needed

## 📊 Scaling Approach

See the main README.md for detailed scaling notes, but key strategies include:
- Horizontal scaling with load balancers
- Database read replicas for heavy read operations
- Redis caching layer
- Connection pooling
- API versioning for backward compatibility

## 🎯 Next Steps

1. Test all endpoints using Swagger UI at `http://localhost:9999/api/docs`
2. Import your own retailer data using the CSV import endpoint
3. Create additional sales reps using the admin endpoints
4. Assign retailers to sales reps in bulk

---

**Note**: The application is running in development mode. For production deployment, use:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

