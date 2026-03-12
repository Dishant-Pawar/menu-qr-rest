# 🚀 Quick Testing Script - Start Here

## ⚡ Immediate Actions

### Step 1: Fix Failing Tests (5 minutes)
```bash
# Run tests to see current status
pnpm test:run

# Fix the 5 failing tests:
# 1. Auth router subscription test
# 2. Routes config public route detection
# 3. DB optimization cache delete
# 4. Security filename sanitization
# 5. Security SQL injection detection
```

### Step 2: Fix Linting Errors (2 minutes)
```bash
# Check linting errors
pnpm lint

# Auto-fix what can be fixed
pnpm format
```

### Step 3: Start Development Server
```bash
# Terminal 1: Start the dev server
pnpm dev

# Server will run on http://localhost:3000
```

---

## 🧪 Manual Testing Workflow (60 minutes)

### Phase 1: Authentication (10 min)
Open: http://localhost:3000

1. **Register New User**
   - [ ] Navigate to /register
   - [ ] Fill form: email, password, username
   - [ ] Submit and verify account creation
   - [ ] Check for verification email

2. **Login**
   - [ ] Navigate to /login
   - [ ] Enter credentials
   - [ ] Verify redirect to dashboard
   - [ ] Check session persistence

3. **Password Reset** (if time permits)
   - [ ] Click "Forgot Password"
   - [ ] Enter email
   - [ ] Check email for reset link

**Expected Issues:** None (95% test coverage)

---

### Phase 2: Create First Menu (15 min)

1. **Navigate to Dashboard**
   - [ ] Should see empty state or menu list
   - [ ] Click "Create Menu" button

2. **Fill Menu Details**
   - [ ] Menu name: "Test Restaurant"
   - [ ] Address: "123 Main Street"
   - [ ] City: Select any city
   - [ ] Default language: English
   - [ ] Click "Create"

3. **Verify Menu Created**
   - [ ] Should redirect to menu management
   - [ ] Check menu appears in dashboard

**Expected Issues:** Watch for slug generation issues

---

### Phase 3: Add Menu Content (20 min)

1. **Add Categories**
   - [ ] Click "Add Category"
   - [ ] Name: "Appetizers"
   - [ ] Save
   - [ ] Repeat for "Main Courses", "Desserts"

2. **Add Dishes**
   - [ ] Select "Appetizers" category
   - [ ] Click "Add Dish"
   - [ ] Name: "Caesar Salad"
   - [ ] Description: "Fresh romaine lettuce..."
   - [ ] Price: 12.99
   - [ ] Upload image (optional)
   - [ ] Add dietary tags: Vegetarian
   - [ ] Save

3. **Add Dish Variants** (if applicable)
   - [ ] Edit a dish
   - [ ] Add variant: "Small" - $8.99
   - [ ] Add variant: "Large" - $15.99
   - [ ] Save

4. **Translate Content**
   - [ ] Go to Languages tab
   - [ ] Add another language (e.g., Spanish)
   - [ ] Translate category name
   - [ ] Translate dish name and description

**Expected Issues:** 
- Image upload might be slow
- Translation sync issues possible

---

### Phase 4: Configure Restaurant Info (5 min)

1. **Update Restaurant Details**
   - [ ] Go to "Restaurant" tab
   - [ ] Upload logo image
   - [ ] Upload background image
   - [ ] Add contact number
   - [ ] Add social media links (Facebook, Instagram)
   - [ ] Save

**Expected Issues:** Image upload validation

---

### Phase 5: Generate QR Code (5 min)

1. **Create QR Code**
   - [ ] Go to "QR Menu" tab
   - [ ] View generated QR code
   - [ ] Download PNG
   - [ ] Download SVG
   - [ ] Download PDF template

2. **Test QR Code**
   - [ ] Scan with phone camera
   - [ ] Verify it opens correct menu URL

**Expected Issues:** QR code generation should be solid

---

### Phase 6: View Public Menu (10 min)

1. **Publish Menu**
   - [ ] Toggle "Publish" switch
   - [ ] Confirm menu is published

2. **View as Customer**
   - [ ] Open menu URL (from QR code or copy link)
   - [ ] Verify all categories display
   - [ ] Click on dishes to see details
   - [ ] Test language switcher
   - [ ] Test on mobile (responsive)
   - [ ] Test dark mode toggle

3. **Test Search/Filter**
   - [ ] Use search box to find dishes
   - [ ] Filter by dietary tags
   - [ ] Filter by category

**Expected Issues:** Watch for missing translations

---

### Phase 7: Settings & Billing (5 min)

1. **User Settings**
   - [ ] Navigate to /dashboard/settings
   - [ ] Update username
   - [ ] Change email
   - [ ] Update profile info

2. **Billing**
   - [ ] Navigate to /dashboard/billing
   - [ ] View free tier status
   - [ ] Check upgrade options
   - [ ] (Optional) Test upgrade flow

**Expected Issues:** Payment integration depends on LemonSqueezy config

---

## 🔒 Security Quick Tests (10 min)

### Test 1: XSS Prevention
Try entering these in various fields:
```
<script>alert('XSS')</script>
<img src=x onerror=alert('XSS')>
```
**Expected:** All inputs should be sanitized

### Test 2: SQL Injection
Try in search/login fields:
```
' OR '1'='1
'; DROP TABLE users; --
```
**Expected:** Should be blocked or sanitized

### Test 3: Authorization
1. Create menu with User A
2. Try to access menu management URL with User B
**Expected:** Access denied

### Test 4: File Upload
Try uploading:
- .exe file → Should be rejected
- 20MB image → Should be rejected or resized
- Valid image → Should work

---

## ⚡ Performance Quick Tests (5 min)

### Test Load Times
1. Open DevTools → Network tab
2. Navigate to public menu
3. Check:
   - [ ] Initial load < 2 seconds
   - [ ] Images lazy load
   - [ ] No console errors

### Test Mobile Performance
1. Open DevTools → Mobile emulation
2. Test menu on:
   - [ ] iPhone (small screen)
   - [ ] iPad (tablet)
3. Check responsiveness

---

## 📊 Test Results Template

Copy this after testing:

```
## Test Session Results - [Date]

### Authentication ✅/❌
- Registration: ___
- Login: ___
- Password Reset: ___
- Issues: ___

### Menu Management ✅/❌
- Create menu: ___
- Add categories: ___
- Add dishes: ___
- Image uploads: ___
- Issues: ___

### Multi-language ✅/❌
- Add language: ___
- Translate content: ___
- Language switcher: ___
- Issues: ___

### Public Menu ✅/❌
- Menu displays: ___
- Search works: ___
- Filters work: ___
- Mobile responsive: ___
- Issues: ___

### QR Code ✅/❌
- Generation: ___
- Download: ___
- Scan test: ___
- Issues: ___

### Security ✅/❌
- XSS prevention: ___
- SQL injection: ___
- Authorization: ___
- Issues: ___

### Performance ✅/❌
- Load times: ___
- Mobile: ___
- Images: ___
- Issues: ___

### Critical Bugs Found:
1. ___
2. ___
3. ___

### Recommendations:
1. ___
2. ___
3. ___
```

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot connect to database"
**Solution:** Check MenuQR.env file, verify DATABASE_URL is correct

### Issue: "Image upload fails"
**Solution:** Check Supabase storage configuration and file size limits

### Issue: "QR code doesn't scan"
**Solution:** Ensure menu is published and URL is accessible

### Issue: "Translations not showing"
**Solution:** Verify language is added to menu and translations are saved

### Issue: "Payment not working"
**Solution:** Check LemonSqueezy API keys and webhook configuration

---

## 📞 Quick Reference

### URLs to Test
- Home: http://localhost:3000
- Login: http://localhost:3000/login
- Register: http://localhost:3000/register
- Dashboard: http://localhost:3000/dashboard
- Create Menu: http://localhost:3000/menu/create
- Public Menu: http://localhost:3000/menu/[your-slug]

### Test Credentials (after registration)
- Email: your-test-email@example.com
- Password: your-test-password

### Important Commands
```bash
# Start dev server
pnpm dev

# Run tests
pnpm test:run

# Check types
pnpm check-types

# Lint
pnpm lint

# Format code
pnpm format

# View database
npx prisma studio
```

---

## 🎯 Priority Testing Order

1. **Critical (Must Test):**
   - Authentication (login/register)
   - Menu creation
   - Dish management
   - Public menu view
   - QR code generation

2. **Important (Should Test):**
   - Image uploads
   - Multi-language
   - Search/filter
   - Mobile responsive
   - Payment flow

3. **Nice to Have:**
   - Social media links
   - Analytics
   - Print functionality
   - Advanced settings

---

## ✅ Pre-Production Checklist

Before deploying to production:

- [ ] All unit tests passing
- [ ] Manual testing complete
- [ ] Security audit done
- [ ] Performance tested
- [ ] Mobile tested
- [ ] Multiple browsers tested
- [ ] Error tracking configured
- [ ] Backup system ready
- [ ] Environment variables set
- [ ] Database migrations run

---

**Estimated Total Testing Time: 90-120 minutes**

Good luck with testing! 🚀
