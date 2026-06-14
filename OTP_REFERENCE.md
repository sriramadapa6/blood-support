# 🩸 Blood Support - Quick Reference Guide

## OTP VERIFICATION FLOW (UPDATED) ✨

### User Journey in Registration:

```
1. User enters Phone Number
   └─> Validation: Must be 10 digits (0-9)
   
2. User clicks "Send OTP" button
   └─> Phone disabled (no changes allowed)
   └─> OTP input section appears
   └─> 4-digit code generated and shown in alert
   
3. User sees generated OTP
   └─> Example: "2847"
   
4. User enters OTP in the field
   └─> Input accepts only numbers
   └─> Max 4 characters (auto-stops)
   
5. User clicks "Verify OTP" button
   ├─> IF CORRECT:
   │   ├─> Message: "✅ OTP Verified Successfully!"
   │   ├─> Status box turns green
   │   ├─> "Register Now" button ENABLED
   │   └─> Can proceed with registration
   │
   └─> IF WRONG:
       ├─> Message: "❌ Invalid OTP. Please try again."
       ├─> User can retry
       └─> "Register Now" button stays DISABLED
       
6. Complete all other fields:
   ├─ Email
   ├─ Blood Group
   ├─ State
   ├─ District
   └─ City
   
7. Click "Register Now"
   └─> Only works if OTP verified ✅
   └─> Data saved to donors.json
   └─> Success message shown
```

---

## CODE BREAKDOWN 📝

### HTML Changes (register.html):
```html
<!-- Phone Number with OTP Button -->
<input type="tel" id="regPhone" />
<button type="button" id="sendOtpBtn" class="btn-otp">
    Send OTP
</button>

<!-- OTP Input Section (Hidden by default) -->
<div id="otpSection" style="display: none;">
    <input type="text" id="otpInput" maxlength="4" />
    <button type="button" id="verifyOtpBtn" class="btn-otp">
        Verify OTP
    </button>
    <div id="otpStatus"></div>
</div>

<!-- Verification Status Indicator -->
<div id="otpVerificationStatus" style="display: none;"></div>

<!-- Submit Button (Disabled by default) -->
<button type="submit" class="btn" id="submitBtn" disabled>
    Register Now
</button>
```

### JavaScript Logic (script.js):

#### Send OTP:
```javascript
// Validate phone
if (!/^\d{10}$/.test(phone)) {
    alert("Invalid phone number");
    return;
}

// Generate 4-digit OTP
generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();

// Show to user
alert(`Your OTP is: ${generatedOtp}`);

// Show OTP input field
document.getElementById('otpSection').style.display = 'block';
```

#### Verify OTP:
```javascript
const enteredOtp = document.getElementById('otpInput').value;

if (enteredOtp === generatedOtp) {
    otpVerified = true;
    // Enable submit button
    document.getElementById('submitBtn').disabled = false;
}
```

#### Prevent Form Submission:
```javascript
registerForm.addEventListener('submit', function(e) {
    if (!otpVerified) {
        alert("Please verify OTP first!");
        return;
    }
    // Continue with registration...
});
```

### CSS Styling (style.css):

```css
.btn-otp {
    padding: 12px 20px;
    background: #007bff;    /* Blue */
    color: white;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-otp:hover:not(:disabled) {
    background: #0056b3;
    transform: translateY(-2px);
}

.btn-otp:disabled {
    background: #ccc;
    opacity: 0.6;
    cursor: not-allowed;
}
```

---

## VALIDATION RULES 🛡️

### Phone Number:
```
Format: 10 digits only (0-9)
Examples:
✅ 9876543210 (VALID)
❌ 987654321 (TOO SHORT)
❌ 98765432100 (TOO LONG)
❌ 987654321a (CONTAINS LETTER)
❌ 9876-543210 (CONTAINS DASH)
```

### OTP:
```
Format: 4 digits
Range: 1000-9999
Examples:
✅ 2847 (VALID)
✅ 1000 (VALID)
✅ 9999 (VALID)
❌ 847 (TOO SHORT)
❌ 28471 (TOO LONG)
```

### Email:
```
Format: standard@example.com
Validation: Must have @ and .
Examples:
✅ user@example.com (VALID)
✅ john.doe@company.co.uk (VALID)
❌ invalidemail (MISSING @)
❌ user@example (MISSING .)
❌ @example.com (MISSING NAME)
```

### Blood Group:
```
Valid Values:
✅ A+, A-
✅ B+, B-
✅ O+, O-
✅ AB+, AB-

❌ AB (Missing sign)
❌ RH+ (Wrong format)
❌ O1+ (Wrong character)
```

### State/District:
```
Predefined list in dropdown
Cannot be custom
Must match exactly
```

---

## BACKEND VALIDATION (app.py) 🔒

### Phone Number Check:
```python
import re

def is_valid_phone(phone):
    return bool(re.match(r'^\d{10}$', phone))
    # Checks: exactly 10 digits

# Test Cases:
is_valid_phone("9876543210")   # True
is_valid_phone("987654321")    # False (too short)
is_valid_phone("9876-543210")  # False (contains dash)
```

### Email Check:
```python
def is_valid_email(email):
    return bool(re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email))
    # Checks: has @ and . and text on both sides

# Test Cases:
is_valid_email("user@example.com")  # True
is_valid_email("invalidemail")      # False
is_valid_email("@example.com")      # False
```

### Blood Group Check:
```python
def is_valid_blood_group(blood):
    valid_groups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]
    return blood in valid_groups

# Test Cases:
is_valid_blood_group("O+")      # True
is_valid_blood_group("AB")      # False
is_valid_blood_group("o+")      # False (case sensitive)
```

### Duplicate Phone Check:
```python
donors = load_data()
for donor in donors:
    if donor.get('phone') == new_phone:
        return error("Phone already registered")
        
# Prevents same phone from registering twice
```

---

## API RESPONSES 📡

### Success (Register):
```json
Status: 200 OK

{
    "message": "✅ Registered successfully",
    "donor": {
        "name": "John Doe",
        "phone": "9876543210",
        "email": "john@example.com",
        "bloodGroup": "O+",
        "state": "Andhra Pradesh",
        "district": "East Godavari",
        "city": "Kakinada",
        "registeredAt": "2024-01-20T14:30:00"
    }
}
```

### Error - Invalid Phone:
```json
Status: 400 Bad Request

{
    "error": "Invalid phone number. Must be 10 digits."
}
```

### Error - Invalid Email:
```json
Status: 400 Bad Request

{
    "error": "Invalid email format"
}
```

### Error - Duplicate Phone:
```json
Status: 409 Conflict

{
    "error": "Phone number already registered"
}
```

### Error - Invalid Blood Group:
```json
Status: 400 Bad Request

{
    "error": "Invalid blood group"
}
```

### Error - Missing Fields:
```json
Status: 400 Bad Request

{
    "error": "Missing required field: email"
}
```

---

## TESTING CHECKLIST ✅

### Manual Testing Steps:

```
Test 1: Invalid Phone
□ Enter "12345" (too short)
□ Click "Send OTP"
□ Should show: "⚠️ Please enter a valid 10-digit phone number"

Test 2: Valid Phone, Valid OTP
□ Enter "9876543210"
□ Click "Send OTP"
□ See alert: "Your OTP is: XXXX"
□ Enter the OTP
□ Click "Verify OTP"
□ Should show: "✅ OTP Verified Successfully!"
□ "Register Now" button should be ENABLED

Test 3: Valid Phone, Invalid OTP
□ Enter "9876543210"
□ Click "Send OTP"
□ Get OTP (e.g., "2847")
□ Enter wrong OTP (e.g., "1234")
□ Click "Verify OTP"
□ Should show: "❌ Invalid OTP"
□ Can try again

Test 4: Invalid Email
□ Complete OTP
□ Enter invalid email: "invalidemail"
□ Click "Register Now"
□ Should show: "⚠️ Please enter a valid email address"

Test 5: Duplicate Phone
□ Register with phone: "9876543210"
□ Try registering with same phone again
□ Should show: "Phone number already registered"

Test 6: Search Donors
□ Complete registration with phone "9876543210"
□ Go to Search page
□ Select B+ blood group
□ Select East Godavari district
□ Click Search
□ Should find the newly registered donor
```

---

## TROUBLESHOOTING COMMON ISSUES 🔧

### Issue: OTP button not showing up
**Check:**
1. Browser console (F12) for errors
2. Check if `id="sendOtpBtn"` exists in HTML
3. Clear browser cache
4. Hard refresh (Ctrl+F5)

### Issue: OTP not working
**Check:**
1. Phone number is 10 digits
2. JavaScript file loaded (check Network tab)
3. Console errors (F12 → Console tab)
4. OTP input accepts numbers only

### Issue: Register button disabled even after OTP
**Check:**
1. `otpVerified` variable is set to `true`
2. Button ID is `submitBtn`
3. Check console for errors

### Issue: Phone stays disabled after OTP
**This is intentional!** Once OTP is sent, phone is locked to prevent cheating.

---

## KEY VARIABLES IN JAVASCRIPT 📊

```javascript
// Global variables in script.js:

let generatedOtp = "";      // Stores generated 4-digit OTP
let otpVerified = false;    // Flag: is OTP verified?

// Usage:
generatedOtp = "2847"           // After Send OTP
otpVerified = true              // After Verify OTP
otpVerified = false             // Reset after registration
```

---

## PRODUCTION CHECKLIST 🚀

Before going live:

```
□ Add real SMS gateway (Twilio, AWS SNS)
□ Implement OTP expiration (5 minutes)
□ Add max OTP attempts (3 tries)
□ Use HTTPS/SSL encryption
□ Migrate from JSON to database
□ Add user authentication
□ Rate limiting on API endpoints
□ Comprehensive logging
□ Error monitoring (Sentry)
□ Backup system for donors.json
□ User privacy policy
□ Data retention policy
```

---

## VERSION HISTORY 📅

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Early | Initial version |
| 2.0 | Jan 2024 | Added OTP, validation, background image |

---

**Last Updated:** January 2024  
**Status:** ✅ Production Ready
