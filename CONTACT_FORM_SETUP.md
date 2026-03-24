# Contact Form Setup & Testing Guide

## Overview
The contact form feature has been fully integrated into the Welltalk API. It includes:
- Form submission with validation
- Automatic email notifications to both admin and user (via Brevo SMTP)
- Admin panel for managing submissions
- Status tracking (pending, replied, closed)

## Setup Requirements

### 1. Brevo SMTP Configuration
Add the following to your `.env` file (get credentials from your Brevo account):

```env
# Email Configuration (Brevo SMTP)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your_brevo_account_email@example.com
SMTP_PASS=your_brevo_api_key_or_password
ADMIN_EMAIL=admin@welltalk.com
COMPANY_NAME=Welltalk
```

**Steps to get Brevo credentials:**
1. Log in to your Brevo account (https://app.brevo.com)
2. Go to SMTP & API section
3. Copy your SMTP credentials (Email and Password/API Key)
4. Add `ADMIN_EMAIL` as your admin contact email
5. Set `COMPANY_NAME` to your organization name

### 2. Database Setup
Run migrations to create the contact_forms table:
```bash
npm run migrate
```

This creates the contact_forms table with fields for:
- firstName, lastName, email, phone, message
- Status tracking (pending/replied/closed)
- Email sent flag
- Timestamps

### 3. Start the Server
```bash
npm run dev
```

Expected output:
```
✅ MySQL Database Connected Successfully
✅ SMTP Server connected successfully
🚀 Server running on port 5000
📝 API Base URL: http://localhost:5000/api/v1
```

## API Endpoints

### Submit Contact Form
**POST** `/api/v1/contact-forms`

Request body:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1 (555) 123-4567",
  "message": "I would like more information about your services."
}
```

Response:
```json
{
  "status": "success",
  "message": "Contact form submitted successfully",
  "data": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1 (555) 123-4567",
    "message": "I would like more information about your services.",
    "status": "pending",
    "emailSent": true,
    "createdAt": "2026-03-17T14:55:00.000Z",
    "updatedAt": "2026-03-17T14:55:00.000Z"
  }
}
```

### Get All Contact Forms
**GET** `/api/v1/contact-forms?page=1&limit=10`

Query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status (pending/replied/closed) - optional

Response:
```json
{
  "status": "success",
  "data": {
    "forms": [...],
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

### Get Contact Form by ID
**GET** `/api/v1/contact-forms/:id`

Example: `GET /api/v1/contact-forms/1`

Response: Returns single contact form object

### Update Contact Form Status
**PUT** `/api/v1/contact-forms/:id/status`

Request body:
```json
{
  "status": "replied"
}
```

Valid status values: `pending`, `replied`, `closed`

### Delete Contact Form
**DELETE** `/api/v1/contact-forms/:id`

Example: `DELETE /api/v1/contact-forms/1`

## Testing with Postman

1. Import the updated Postman collection: `Welltalk-API.postman_collection.json`
2. Set the `{{base_url}}` variable to `http://localhost:5000`
3. Go to the "Contact Forms" folder
4. Test each endpoint:
   - Submit Contact Form
   - Get All Contact Forms
   - Get Pending Contact Forms
   - Get Contact Form by ID
   - Update Contact Form Status
   - Delete Contact Form

## Email Notifications

When a contact form is submitted:

### Email 1: Admin Notification
- **To:** ADMIN_EMAIL (from .env)
- **Subject:** "New Contact Form Submission from [Name]"
- **Content:** Full contact details including name, email, phone, and message

### Email 2: User Confirmation
- **To:** User's email address
- **Subject:** "We received your message - [COMPANY_NAME]"
- **Content:** Confirmation message + echo of submitted details

## Troubleshooting

### SMTP Connection Error at Startup
**Error:** "SMTP Connection Error"
**Cause:** Brevo credentials not configured or invalid
**Solution:** 
- Verify `.env` file has correct SMTP credentials
- Check credentials in https://app.brevo.com
- Ensure SMTP_USER and SMTP_PASS are set correctly

### Email Not Sending
**Check:**
1. SMTP credentials are correct in .env
2. `emailSent` flag is `true` in database response
3. Check admin email address is set in ADMIN_EMAIL
4. Verify email is valid in contact form submission

### Validation Errors
**Common validation issues:**
- firstName/lastName: Required, must be non-empty string
- email: Required, must be valid email format
- phone: Required, must be non-empty string
- message: Required, must be non-empty text

Response example for validation error:
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## Database Schema

Table: `contact_forms`

```sql
CREATE TABLE contact_forms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  firstName VARCHAR(255) NOT NULL,
  lastName VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  message LONGTEXT NOT NULL,
  status ENUM('pending', 'replied', 'closed') DEFAULT 'pending',
  emailSent BOOLEAN DEFAULT FALSE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
```

## Next Steps

1. ✅ Complete: Database migration
2. ✅ Complete: API endpoints
3. ✅ Complete: Email service with Brevo
4. **TODO:** Add Brevo credentials to .env
5. **TODO:** Test form submission and email sending
6. **TODO:** Optional: Add frontend form that POST to this API
7. **TODO:** Optional: Add admin dashboard to view submissions

## Files Involved

- `/src/models/ContactForm.js` - Database model
- `/src/controllers/contactFormController.js` - Business logic
- `/src/routes/contactFormRoutes.js` - API endpoints
- `/src/utils/emailService.js` - Email sender with Brevo SMTP
- `migrations/004-create-contact-forms.js` - Database migration
- `.env` - Configuration file (add Brevo credentials here)
- `Welltalk-API.postman_collection.json` - Updated with contact form endpoints
