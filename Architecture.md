# Tile Stock Management System - Architecture Document

## 1. System Overview

### 1.1 Purpose
A comprehensive web-based stock management system for tile retailers that enables inventory tracking, sales management, visual product previews, and multi-shop administration with centralized data synchronization.

### 1.2 Key Objectives
- Efficient inventory management for tiles
- Real-time stock tracking and reporting
- Visual product preview system (interior/exterior/bathroom)
- Multi-shop support with centralized administration
- Sales analytics and profit/loss tracking
- Image-based product recognition

---

## 2. System Architecture

### 2.1 Architecture Pattern
**Three-Tier Architecture with Microservices Approach**

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│  (React/Vue.js Frontend - Responsive Web Application)   │
└─────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────┐
│                    Application Layer                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Inventory    │  │ Sales        │  │ Analytics    │  │
│  │ Service      │  │ Service      │  │ Service      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Image        │  │ Auth         │  │ Sync         │  │
│  │ Processing   │  │ Service      │  │ Service      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────┐
│                    Data Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ MongoDB      │  │ File Storage │  │ Cache        │  │
│  │ (Centralized)│  │ (Images/3D)  │  │ (Redis)      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack

#### Frontend
- **Framework**: React.js with TypeScript
- **State Management**: Redux Toolkit / Zustand
- **UI Library**: Material-UI / Ant Design / Tailwind CSS
- **3D Rendering**: Three.js / React Three Fiber
- **Image Processing**: Fabric.js / Konva.js
- **Charts**: Chart.js / Recharts
- **Routing**: React Router v6
- **HTTP Client**: Axios

#### Backend
- **Runtime**: Node.js with Express.js / NestJS
- **Language**: TypeScript
- **API Style**: RESTful API with GraphQL (optional for complex queries)
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer / Cloudinary
- **Image Processing**: Sharp / ImageMagick
- **3D Processing**: Node.js with Three.js server-side

#### Database
- **Primary Database**: MongoDB (Centralized)
- **Cache**: Redis (for session management and frequently accessed data)
- **File Storage**: 
  - Option 1: MongoDB GridFS (for smaller files)
  - Option 2: AWS S3 / Cloudinary (for production scalability)
  - Option 3: Local storage with backup strategy

#### Additional Services
- **Real-time Sync**: WebSocket (Socket.io) for multi-shop synchronization
- **Background Jobs**: Bull Queue (Redis-based)
- **Search**: MongoDB Atlas Search / Elasticsearch (for image-based search)
- **Image Recognition**: TensorFlow.js / Custom ML model

---

## 3. Database Schema

### 3.1 Core Collections

#### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed),
  role: Enum ['grand_admin', 'shop_admin', 'staff'],
  shopId: ObjectId (ref: 'Shop'), // null for grand_admin
  name: String,
  phone: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date,
  lastLogin: Date
}
```

#### Shops Collection
```javascript
{
  _id: ObjectId,
  name: String (required),
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  contact: {
    phone: String,
    email: String
  },
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### Tiles Collection
```javascript
{
  _id: ObjectId,
  name: String (optional),
  sku: String (unique, auto-generated),
  category: Enum ['interior', 'exterior', 'bathroom', 'kitchen', 'floor', 'wall'],
  material: String, // e.g., 'ceramic', 'porcelain', 'marble'
  size: {
    length: Number, // in cm
    width: Number,  // in cm
    thickness: Number // in mm
  },
  color: String,
  pattern: String,
  price: {
    purchasePrice: Number, // cost price
    sellingPrice: Number,   // retail price
    currency: String (default: 'USD')
  },
  images: [{
    url: String,
    type: Enum ['primary', 'thumbnail', 'detail', 'pattern'],
    uploadedAt: Date
  }],
  imageHash: String, // for image-based recognition
  description: String,
  specifications: {
    waterAbsorption: Number,
    slipResistance: String,
    frostResistance: Boolean,
    // ... other technical specs
  },
  stock: {
    totalQuantity: Number,
    availableQuantity: Number,
    reservedQuantity: Number,
    minimumThreshold: Number // alert when below this
  },
  shopId: ObjectId (ref: 'Shop'),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId (ref: 'User')
}
```

#### Stock Transactions Collection
```javascript
{
  _id: ObjectId,
  tileId: ObjectId (ref: 'Tile'),
  shopId: ObjectId (ref: 'Shop'),
  transactionType: Enum ['purchase', 'sale', 'adjustment', 'return', 'damage'],
  quantity: Number,
  unitPrice: Number,
  totalAmount: Number,
  referenceNumber: String, // invoice number, receipt number, etc.
  notes: String,
  performedBy: ObjectId (ref: 'User'),
  createdAt: Date,
  updatedAt: Date
}
```

#### Sales Collection
```javascript
{
  _id: ObjectId,
  saleNumber: String (unique, auto-generated),
  shopId: ObjectId (ref: 'Shop'),
  customer: {
    name: String,
    phone: String,
    email: String,
    address: String
  },
  items: [{
    tileId: ObjectId (ref: 'Tile'),
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number
  }],
  subtotal: Number,
  discount: Number,
  tax: Number,
  totalAmount: Number,
  paymentMethod: Enum ['cash', 'card', 'bank_transfer', 'credit'],
  paymentStatus: Enum ['pending', 'partial', 'paid'],
  status: Enum ['pending', 'confirmed', 'delivered', 'cancelled'],
  soldBy: ObjectId (ref: 'User'),
  createdAt: Date,
  updatedAt: Date,
  deliveredAt: Date
}
```

#### Visual Previews Collection
```javascript
{
  _id: ObjectId,
  tileId: ObjectId (ref: 'Tile'),
  previewType: Enum ['interior', 'exterior', 'bathroom', 'kitchen'],
  roomTemplate: String, // URL to 3D room template
  renderedImage: String, // URL to final rendered preview
  settings: {
    lighting: String,
    cameraAngle: String,
    roomSize: Object
  },
  createdAt: Date
}
```

#### Reports Collection (Cached Reports)
```javascript
{
  _id: ObjectId,
  shopId: ObjectId (ref: 'Shop'), // null for grand admin reports
  reportType: Enum ['stock', 'sales', 'profit', 'inventory'],
  period: Enum ['daily', 'weekly', 'monthly', 'yearly', 'custom'],
  startDate: Date,
  endDate: Date,
  data: Object, // cached report data
  generatedAt: Date,
  expiresAt: Date
}
```

---

## 4. API Endpoints

### 4.1 Authentication & Authorization
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh-token
GET    /api/auth/me
PUT    /api/auth/profile
```

### 4.2 Tiles Management
```
GET    /api/tiles                    # List all tiles (with filters, pagination)
GET    /api/tiles/:id                # Get tile details
POST   /api/tiles                    # Create new tile
PUT    /api/tiles/:id                # Update tile
DELETE /api/tiles/:id                # Delete tile (soft delete)
POST   /api/tiles/upload-image       # Upload tile image
POST   /api/tiles/search-by-image    # Image-based search
GET    /api/tiles/:id/stock          # Get stock information
GET    /api/tiles/:id/sales-stats    # Get sales statistics
```

### 4.3 Stock Management
```
GET    /api/stock                    # List stock (with filters)
POST   /api/stock/purchase           # Add stock (purchase)
POST   /api/stock/adjustment         # Stock adjustment
GET    /api/stock/transactions       # Stock transaction history
GET    /api/stock/low-stock          # Get low stock alerts
```

### 4.4 Sales Management
```
GET    /api/sales                    # List sales (with filters)
GET    /api/sales/:id                # Get sale details
POST   /api/sales                    # Create new sale
PUT    /api/sales/:id                # Update sale
DELETE /api/sales/:id                # Cancel sale
POST   /api/sales/:id/deliver        # Mark as delivered
```

### 4.5 Visual Preview
```
GET    /api/previews/:tileId         # Get available previews for tile
POST   /api/previews/generate        # Generate new preview
GET    /api/previews/templates       # Get room templates
POST   /api/previews/render          # Render preview image
```

### 4.6 Reports & Analytics
```
GET    /api/reports/stock            # Stock report
GET    /api/reports/sales            # Sales report
GET    /api/reports/profit           # Profit/loss report
GET    /api/reports/inventory        # Inventory report
GET    /api/reports/dashboard        # Dashboard statistics
POST   /api/reports/custom           # Custom report generation
```

### 4.7 Shops Management (Grand Admin)
```
GET    /api/shops                    # List all shops
GET    /api/shops/:id                # Get shop details
POST   /api/shops                    # Create shop
PUT    /api/shops/:id                # Update shop
DELETE /api/shops/:id                # Delete shop
GET    /api/shops/:id/statistics     # Shop statistics
GET    /api/shops/overview           # All shops overview
```

### 4.8 Synchronization
```
GET    /api/sync/status              # Get sync status
POST   /api/sync/trigger             # Trigger manual sync
GET    /api/sync/history             # Sync history
WS     /ws/sync                      # WebSocket for real-time sync
```

---

## 5. Feature Specifications

### 5.1 Item Creation Form
**Purpose**: Create new tile products in the system

**Fields**:
- Basic Information:
  - Name (optional)
  - SKU (auto-generated)
  - Category (dropdown)
  - Material (dropdown)
  - Size (length, width, thickness)
  - Color
  - Pattern
- Pricing:
  - Purchase Price
  - Selling Price
  - Currency
- Images:
  - Primary Image (required)
  - Additional Images (multiple)
  - Image upload with drag & drop
  - Image preview
- Specifications:
  - Water Absorption
  - Slip Resistance
  - Frost Resistance
  - Other technical specs
- Stock:
  - Initial Quantity
  - Minimum Threshold
- Description (rich text editor)

**Validation**:
- At least one image required
- Purchase price and selling price must be positive numbers
- Size dimensions must be positive
- SKU must be unique

### 5.2 Item Insertion Form (Stock Addition)
**Purpose**: Add stock to existing tiles

**Fields**:
- Tile Selection (searchable dropdown with image preview)
- Quantity
- Purchase Price (per unit)
- Supplier Information
- Reference Number (invoice/receipt)
- Notes
- Date

**Features**:
- Bulk insertion for multiple tiles
- Import from CSV/Excel
- Automatic stock update
- Transaction history logging

### 5.3 Item Purchase Form (Sales)
**Purpose**: Record sales transactions

**Fields**:
- Customer Information:
  - Name
  - Phone
  - Email (optional)
  - Address
- Items:
  - Tile selection (with image preview)
  - Quantity
  - Unit Price (auto-filled, editable)
  - Total Price (auto-calculated)
  - Add multiple items
- Pricing:
  - Subtotal (auto-calculated)
  - Discount (percentage or fixed)
  - Tax
  - Total Amount
- Payment:
  - Payment Method
  - Payment Status
- Delivery:
  - Delivery Address
  - Delivery Date
  - Status

**Features**:
- Real-time stock availability check
- Automatic stock deduction
- Invoice generation (PDF)
- Receipt printing
- Customer history lookup

### 5.4 Report Page (Admin Dashboard)
**Purpose**: Comprehensive analytics and reporting

**Sections**:

1. **Dashboard Overview**:
   - Total Tiles in Stock (all shops)
   - Total Sales Today/Week/Month
   - Total Revenue
   - Low Stock Alerts
   - Top Selling Tiles
   - Recent Transactions

2. **Stock Reports**:
   - Current Stock Levels
   - Stock by Category
   - Stock by Shop
   - Stock Movement History
   - Low Stock Items
   - Stock Value

3. **Sales Reports**:
   - Sales by Period (1 week, 1 month, 1 year, custom)
   - Sales by Shop
   - Sales by Tile
   - Sales by Category
   - Sales Trends (charts)
   - Top Customers

4. **Profit/Loss Reports**:
   - Gross Profit
   - Net Profit
   - Profit Margin
   - Profit by Tile
   - Profit by Shop
   - Profit Trends

5. **Inventory Reports**:
   - Total Tiles in Stock (period-based)
   - Tiles Purchased (period-based)
   - Tiles Sold (period-based)
   - Inventory Turnover
   - Aging Inventory

**Features**:
- Date Range Filter (1 week, 1 month, 1 year, custom)
- Export to PDF/Excel
- Real-time data updates
- Interactive charts and graphs
- Drill-down capabilities
- Scheduled report generation

### 5.5 Tile Detail View
**Purpose**: View detailed information about a specific tile

**Information Displayed**:
- Tile Images (gallery)
- Basic Information (name, SKU, category, etc.)
- Stock Information:
  - Available Quantity
  - Reserved Quantity
  - Total Quantity
  - Stock Status (In Stock, Low Stock, Out of Stock)
- Sales Performance:
  - Total Sold (all time, period-based)
  - Revenue Generated
  - Profit/Loss
  - Profit Margin
  - Sales Trend Chart
- Pricing Information
- Specifications
- Related Tiles (similar tiles)
- Visual Previews (interior, exterior, bathroom)

**Actions**:
- Edit Tile
- Add Stock
- Create Sale
- Generate Preview
- View Transaction History

### 5.6 Visual Preview System
**Purpose**: Show clients how tiles look in real home settings

**Features**:

1. **Room Templates**:
   - Interior Living Room
   - Interior Bedroom
   - Exterior Facade
   - Bathroom
   - Kitchen
   - Other room types

2. **Tile Application**:
   - Select tile from inventory
   - Apply to floor/wall
   - Adjust tile size/scale
   - Adjust tile orientation/pattern
   - Change lighting conditions
   - Multiple camera angles

3. **Rendering**:
   - Real-time preview
   - High-quality render
   - Save preview images
   - Share with customers
   - Print preview

4. **3D Visualization**:
   - 360-degree view
   - Virtual walkthrough
   - AR preview (future enhancement)

**Technical Implementation**:
- Use Three.js for 3D rendering
- Pre-rendered room templates
- Texture mapping for tiles
- Real-time shader updates
- Image processing for realistic lighting

### 5.7 Image-Based Recognition
**Purpose**: Identify tiles using images

**Features**:
- Upload image of tile
- System identifies matching tile from database
- Shows confidence score
- Allows manual selection if multiple matches
- Learns from corrections (ML improvement)

**Technical Implementation**:
- Image feature extraction (color, pattern, texture)
- Similarity matching algorithm
- Machine learning model (optional)
- Image hashing for fast lookup

### 5.8 Multi-Shop Management
**Purpose**: Manage multiple shops with centralized administration

**Features**:

1. **Shop Admin**:
   - Manage own shop's inventory
   - View own shop's sales
   - Generate own shop's reports
   - Cannot access other shops' data

2. **Grand Admin**:
   - View all shops
   - Aggregate reports across all shops
   - Shop comparison
   - Transfer stock between shops
   - Manage shop settings
   - User management per shop

3. **Synchronization**:
   - Real-time sync via WebSocket
   - Conflict resolution
   - Sync history
   - Manual sync trigger
   - Offline mode support (future)

---

## 6. Additional Features

### 6.1 Customer Management
- Customer database
- Purchase history
- Customer preferences
- Loyalty program (optional)

### 6.2 Supplier Management
- Supplier database
- Purchase orders
- Supplier performance tracking
- Payment tracking

### 6.3 Barcode/QR Code Support
- Generate barcodes for tiles
- Scan barcodes for quick lookup
- QR codes for customer previews

### 6.4 Notifications & Alerts
- Low stock alerts
- Price change notifications
- Sales milestone alerts
- System notifications

### 6.5 Backup & Recovery
- Automated database backups
- Image backup strategy
- Disaster recovery plan
- Data export functionality

### 6.6 Mobile Responsiveness
- Fully responsive design
- Mobile-optimized forms
- Touch-friendly interface
- Mobile app (future enhancement)

### 6.7 Multi-language Support
- Language selection
- Localized content
- Currency conversion

### 6.8 Advanced Search & Filters
- Full-text search
- Advanced filtering
- Saved searches
- Search history

### 6.9 Audit Trail
- Track all changes
- User activity logs
- Data modification history
- Compliance reporting

### 6.10 Integration Capabilities
- Accounting software integration
- E-commerce platform integration
- Payment gateway integration
- Shipping provider integration

---

## 7. Security Considerations

### 7.1 Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing (bcrypt)
- Session management
- Two-factor authentication (optional)

### 7.2 Data Security
- HTTPS encryption
- Database encryption at rest
- Secure file storage
- Input validation and sanitization
- SQL injection prevention (MongoDB injection prevention)
- XSS protection

### 7.3 API Security
- Rate limiting
- CORS configuration
- API key management
- Request validation
- Error handling (no sensitive data exposure)

### 7.4 Shop Data Isolation
- Data segregation by shop
- Access control enforcement
- Audit logs for cross-shop access

---

## 8. Performance Optimization

### 8.1 Frontend Optimization
- Code splitting
- Lazy loading
- Image optimization and lazy loading
- Caching strategies
- CDN for static assets

### 8.2 Backend Optimization
- Database indexing
- Query optimization
- Caching (Redis)
- Pagination
- Background job processing

### 8.3 Image Optimization
- Image compression
- Multiple image sizes (thumbnails, medium, full)
- Progressive image loading
- WebP format support

### 8.4 Database Optimization
- Proper indexing strategy
- Aggregation pipeline optimization
- Connection pooling
- Read replicas (for scaling)

---

## 9. Deployment Strategy

### 9.1 Infrastructure
- **Hosting**: AWS / Azure / Google Cloud
- **Application Server**: Node.js on EC2 / App Service
- **Database**: MongoDB Atlas (managed)
- **File Storage**: AWS S3 / Azure Blob Storage
- **CDN**: CloudFront / Azure CDN
- **Load Balancer**: Application Load Balancer

### 9.2 CI/CD Pipeline
- Version control: Git (GitHub/GitLab)
- CI/CD: GitHub Actions / GitLab CI / Jenkins
- Automated testing
- Automated deployment
- Environment management (dev, staging, production)

### 9.3 Monitoring & Logging
- Application monitoring (New Relic / Datadog)
- Error tracking (Sentry)
- Log aggregation (ELK Stack / CloudWatch)
- Performance monitoring
- Uptime monitoring

---

## 10. Development Phases

### Phase 1: Core Functionality (MVP)
- User authentication
- Tile CRUD operations
- Stock management (purchase, sale)
- Basic reporting
- Image upload

### Phase 2: Enhanced Features
- Visual preview system
- Advanced reporting
- Multi-shop support
- Image-based recognition

### Phase 3: Advanced Features
- Real-time synchronization
- Advanced analytics
- Mobile optimization
- Integration capabilities

### Phase 4: Optimization & Scaling
- Performance optimization
- Advanced caching
- Load balancing
- Monitoring and logging

---

## 11. Technology Recommendations

### Recommended Stack (Production-Ready)
- **Frontend**: React.js + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express.js + TypeScript
- **Database**: MongoDB Atlas
- **Cache**: Redis (AWS ElastiCache)
- **File Storage**: AWS S3 + CloudFront
- **3D Rendering**: Three.js
- **Image Processing**: Sharp (Node.js)
- **Real-time**: Socket.io
- **Deployment**: Docker + Kubernetes (or simpler: AWS Elastic Beanstalk)

### Alternative Stack (Simpler Setup)
- **Frontend**: React.js + Material-UI
- **Backend**: Node.js + Express.js
- **Database**: MongoDB (self-hosted or Atlas)
- **File Storage**: MongoDB GridFS or local storage
- **3D Rendering**: Three.js
- **Deployment**: PM2 + Nginx

---

## 12. Future Enhancements

1. **Mobile Applications**: Native iOS and Android apps
2. **AR/VR Integration**: Augmented reality tile preview
3. **AI Recommendations**: AI-powered tile recommendations
4. **E-commerce Integration**: Online ordering system
5. **Advanced Analytics**: Machine learning for sales forecasting
6. **IoT Integration**: Smart inventory tracking with sensors
7. **Blockchain**: Supply chain transparency
8. **Voice Commands**: Voice-activated search and operations

---

## 13. Conclusion

This architecture provides a scalable, maintainable, and feature-rich solution for tile stock management. The system supports multiple shops with centralized administration, real-time synchronization, and advanced features like visual previews and image-based recognition. The modular design allows for incremental development and future enhancements.

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Author**: System Architect

