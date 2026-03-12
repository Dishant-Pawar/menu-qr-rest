# ✅ Simple Testing Checklist

**Print this and check off as you test!**

---

## 🔧 Pre-Testing (5 min)
- [ ] Run `pnpm test:run` - Check test status
- [ ] Run `pnpm dev` - Start server at localhost:3000
- [ ] Open browser DevTools (F12)
- [ ] Have phone ready for QR testing

---

## 1️⃣ Authentication (10 min)

### Register
- [ ] Open `/register`
- [ ] Fill email, password, username
- [ ] Submit form
- [ ] Account created? ✅/❌
- [ ] **Issues:** ___________

### Login
- [ ] Open `/login`
- [ ] Enter credentials
- [ ] Click login
- [ ] Redirected to dashboard? ✅/❌
- [ ] **Issues:** ___________

### Invalid Login
- [ ] Try wrong password
- [ ] Error message shown? ✅/❌
- [ ] **Issues:** ___________

---

## 2️⃣ Create Menu (15 min)

### Basic Info
- [ ] Click "Create Menu"
- [ ] Name: "Test Restaurant"
- [ ] Address: "123 Main St"
- [ ] Select city
- [ ] Select language
- [ ] Submit
- [ ] Menu created? ✅/❌
- [ ] **Issues:** ___________

### Add Category
- [ ] Click "Add Category"
- [ ] Name: "Appetizers"
- [ ] Save
- [ ] Category appears? ✅/❌
- [ ] **Issues:** ___________

### Add Dish
- [ ] Click "Add Dish"
- [ ] Name: "Caesar Salad"
- [ ] Price: 12.99
- [ ] Description: Add text
- [ ] Save
- [ ] Dish appears? ✅/❌
- [ ] **Issues:** ___________

### Upload Image
- [ ] Edit dish
- [ ] Upload image
- [ ] Image displays? ✅/❌
- [ ] **Issues:** ___________

---

## 3️⃣ Restaurant Info (5 min)

- [ ] Go to "Restaurant" tab
- [ ] Upload logo
- [ ] Upload background
- [ ] Add phone number
- [ ] Add Facebook URL
- [ ] Save
- [ ] All saved correctly? ✅/❌
- [ ] **Issues:** ___________

---

## 4️⃣ QR Code (5 min)

- [ ] Go to "QR Menu" tab
- [ ] QR code displays? ✅/❌
- [ ] Download PNG
- [ ] File downloaded? ✅/❌
- [ ] Scan with phone
- [ ] Opens correct URL? ✅/❌
- [ ] **Issues:** ___________

---

## 5️⃣ Publish & View (10 min)

### Publish
- [ ] Toggle "Publish" ON
- [ ] Menu published? ✅/❌

### View Public Menu
- [ ] Open menu URL
- [ ] Categories display? ✅/❌
- [ ] Dishes display? ✅/❌
- [ ] Images load? ✅/❌
- [ ] Prices correct? ✅/❌
- [ ] **Issues:** ___________

### Mobile View
- [ ] Open on phone (or DevTools mobile)
- [ ] Responsive? ✅/❌
- [ ] All features work? ✅/❌
- [ ] **Issues:** ___________

---

## 6️⃣ Multi-Language (10 min)

- [ ] Add language (e.g., Spanish)
- [ ] Translate category name
- [ ] Translate dish name
- [ ] Save translations
- [ ] Switch language on public menu
- [ ] Content changes? ✅/❌
- [ ] **Issues:** ___________

---

## 7️⃣ Search & Filter (5 min)

- [ ] Go to public menu
- [ ] Search for dish name
- [ ] Results correct? ✅/❌
- [ ] Click category
- [ ] Filters correctly? ✅/❌
- [ ] **Issues:** ___________

---

## 8️⃣ Settings (5 min)

- [ ] Go to `/dashboard/settings`
- [ ] Update username
- [ ] Save
- [ ] Username updated? ✅/❌
- [ ] **Issues:** ___________

---

## 9️⃣ Security (10 min)

### XSS Test
- [ ] Enter `<script>alert('XSS')</script>` in dish name
- [ ] Input sanitized? ✅/❌
- [ ] **Issues:** ___________

### SQL Injection Test
- [ ] Enter `' OR '1'='1` in search
- [ ] Blocked/sanitized? ✅/❌
- [ ] **Issues:** ___________

### Authorization Test
- [ ] Create menu with User A
- [ ] Logout
- [ ] Login as User B
- [ ] Try to access User A's menu URL
- [ ] Access denied? ✅/❌
- [ ] **Issues:** ___________

### File Upload Test
- [ ] Try uploading .exe file
- [ ] Rejected? ✅/❌
- [ ] Try 20MB image
- [ ] Rejected or resized? ✅/❌
- [ ] **Issues:** ___________

---

## 🔟 Performance (5 min)

### Load Time
- [ ] Open DevTools → Network
- [ ] Load public menu
- [ ] Time: _____ seconds
- [ ] Under 2 seconds? ✅/❌

### Lighthouse
- [ ] Run Lighthouse (DevTools)
- [ ] Performance score: _____
- [ ] Over 90? ✅/❌

### Console Errors
- [ ] Check browser console
- [ ] Any errors? ___________

---

## 🎯 Summary

### Tests Passed: _____ / 50

### Critical Issues:
1. ___________
2. ___________
3. ___________

### Medium Issues:
1. ___________
2. ___________

### Minor Issues:
1. ___________
2. ___________

### Overall Status: ✅ PASS / ❌ FAIL

### Ready for Production? ✅ YES / ❌ NO

### Notes:
_________________________________
_________________________________
_________________________________
_________________________________

---

## 📊 Quick Stats

- **Start Time:** _____
- **End Time:** _____
- **Total Time:** _____
- **Tester:** _____
- **Environment:** Dev / Staging / Production
- **Browser:** _____
- **OS:** _____

---

**Recommendation:**
- [ ] Deploy to production
- [ ] Fix issues first
- [ ] More testing needed

---

**Next Steps:**
1. ___________
2. ___________
3. ___________

---

**Signature:** _____________ **Date:** _____________
