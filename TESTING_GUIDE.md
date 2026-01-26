# Testing Guide

## Quick Start Testing

### 1. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm start
```

### 2. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

### 3. Initial Setup

#### Create a Shop (via API or MongoDB)
You can create a shop directly in MongoDB or use the API:

```bash
# Using MongoDB Compass or mongo shell
{
  "name": "Main Shop",
  "address": {
    "city": "Your City",
    "country": "Your Country"
  },
  "isActive": true
}
```

#### Register First User
1. Go to http://localhost:3000/register
2. Fill in the form:
   - Name: Admin User
   - Email: admin@example.com
   - Password: password123
   - Role: Grand Admin (or Shop Admin if you have a shop ID)
3. Click "Sign Up"

#### Login
1. Go to http://localhost:3000/login
2. Enter your credentials
3. You should be redirected to the dashboard

### 4. Testing Features

#### Test 1: Create a Tile
1. Navigate to **Tiles** → **Add New Tile**
2. Fill in the form:
   - Category: Interior
   - Material: Ceramic
   - Size: Length: 30, Width: 30, Thickness: 5
   - Color: White
   - Purchase Price: 10
   - Selling Price: 20
   - Initial Stock: 100
3. **Upload Images:**
   - Drag and drop images or click to select
   - You can upload multiple images
   - First image will be marked as primary
4. Click "Create Tile"
5. Verify the tile appears in the tiles list

#### Test 2: View Tile Details
1. Go to **Tiles** page
2. Click on any tile card
3. Verify:
   - Images are displayed
   - Stock information is shown
   - All details are correct

#### Test 3: Add Stock
1. Navigate to **Stock** page
2. Click "Add Stock"
3. Select a tile from dropdown
4. Enter:
   - Quantity: 50
   - Unit Price: 12
   - Reference Number: INV-001
5. Click "Add Stock"
6. Verify:
   - Stock quantity increased
   - Transaction appears in history

#### Test 4: Create a Sale
1. Navigate to **Sales** page
2. Click "New Sale"
3. Fill customer information:
   - Name: John Doe
   - Phone: 123-456-7890
4. Add items:
   - Select a tile
   - Enter quantity (check available stock)
   - Unit price (auto-filled, can edit)
   - Click "Add Item"
   - Add more items if needed
5. Set discount and tax if needed
6. Select payment method and status
7. Click "Create Sale"
8. Verify:
   - Sale appears in sales list
   - Stock decreased automatically

#### Test 5: View Reports
1. Navigate to **Reports** page
2. Test different report types:
   - **Stock Report**: View stock summary and category breakdown
   - **Sales Report**: View sales trends and top selling tiles
   - **Profit Report**: View profit analysis by tile
   - **Inventory Report**: View inventory movements
3. Try different periods:
   - 1 Week
   - 1 Month
   - 1 Year
   - Custom date range

#### Test 6: Dashboard
1. Go to **Dashboard**
2. Verify statistics cards show:
   - Total Tiles
   - Today's Sales
   - Low Stock Alerts
   - Month Revenue
3. Check top selling tiles table

### 5. Common Issues & Solutions

#### Issue: MongoDB Connection Error
**Solution:**
- Ensure MongoDB is running
- Check connection string in `backend/.env`
- For local MongoDB: `mongodb://localhost:27017/tile-stock-management`
- For MongoDB Atlas: Use your connection string

#### Issue: Images Not Displaying
**Solution:**
- Check if `backend/uploads` directory exists
- Verify image URLs in database start with `/uploads/`
- Check CORS settings in backend
- Ensure backend is serving static files from `/uploads`

#### Issue: CORS Errors
**Solution:**
- Check `CORS_ORIGIN` in `backend/.env`
- Should match frontend URL: `http://localhost:3000`
- Restart backend after changing .env

#### Issue: Authentication Errors
**Solution:**
- Check JWT_SECRET in `backend/.env`
- Clear browser localStorage and login again
- Verify token is being sent in request headers

#### Issue: Stock Not Updating
**Solution:**
- Check if sale was created successfully
- Verify tile exists and has sufficient stock
- Check transaction history in Stock page

### 6. Testing Checklist

- [ ] User registration and login
- [ ] Create tile with images
- [ ] View tile details
- [ ] Add stock (purchase)
- [ ] Adjust stock
- [ ] Create sale with multiple items
- [ ] View sales list
- [ ] Cancel sale (stock restored)
- [ ] Mark sale as delivered
- [ ] View dashboard statistics
- [ ] Generate stock report
- [ ] Generate sales report
- [ ] Generate profit report
- [ ] Generate inventory report
- [ ] Filter reports by period
- [ ] View low stock alerts
- [ ] View transaction history

### 7. API Testing (Optional)

You can also test the API directly using Postman or curl:

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

# Get tiles (replace TOKEN with actual token)
curl http://localhost:5000/api/tiles \
  -H "Authorization: Bearer TOKEN"

# Create tile
curl -X POST http://localhost:5000/api/tiles \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "interior",
    "material": "Ceramic",
    "size": {"length": 30, "width": 30, "thickness": 5},
    "color": "White",
    "price": {"purchasePrice": 10, "sellingPrice": 20},
    "stock": {"totalQuantity": 100}
  }'
```

### 8. Next Steps After Testing

Once basic functionality is verified:
1. Test with multiple shops (if grand admin)
2. Test image upload with different formats
3. Test large datasets
4. Test edge cases (negative stock, etc.)
5. Test visual preview system (when implemented)
6. Test image-based recognition (when implemented)

## Notes

- All images are stored in `backend/uploads/`
- Images are automatically optimized (thumbnail, medium, original)
- Stock transactions are automatically logged
- Sales automatically deduct stock
- Cancelled sales restore stock

