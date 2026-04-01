# Newsletter Management System - Complete Guide

## Overview

The Newsletter Management System allows users to subscribe to your newsletter and enables administrators to send newsletters to all subscribers. The system includes subscription management, preference settings, and bulk email sending with tracking.

## Features

✅ **Email Subscription** - Users can subscribe/resubscribe to newsletter  
✅ **Email Unsubscription** - Users can unsubscribe with optional reason  
✅ **Preference Management** - Users customize subscription frequency and categories  
✅ **Bulk Email Sending** - Send newsletters to all subscribers efficiently  
✅ **Email Tracking** - Track emails sent and delivery counts  
✅ **Subscriber Management** - Admin can view and manage subscribers  
✅ **Statistics Dashboard** - Get insights on subscriber metrics  
✅ **Duplicate Prevention** - Unique email constraint in database  
✅ **Welcome Emails** - Automatic welcome email on subscription  
✅ **Batch Processing** - Efficient email delivery with rate limiting  

## Database Schema

### Newsletters Table

```sql
CREATE TABLE newsletters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  firstName VARCHAR(255),
  lastName VARCHAR(255),
  status ENUM('subscribed', 'unsubscribed', 'bounced') DEFAULT 'subscribed',
  subscriptionDate DATETIME DEFAULT NOW(),
  preferences JSON DEFAULT '{"frequency": "weekly", "categories": []}',
  unsubscribeDate DATETIME,
  unsubscribeReason TEXT,
  lastEmailSent DATETIME,
  emailsReceived INT DEFAULT 0,
  isActive BOOLEAN DEFAULT true,
  metadata JSON,
  createdAt DATETIME DEFAULT NOW(),
  updatedAt DATETIME DEFAULT NOW(),
  UNIQUE KEY(email),
  KEY(status),
  KEY(isActive)
);
```

## API Endpoints

### Public Endpoints

#### 1. Subscribe to Newsletter
```
POST /api/v1/newsletter/subscribe
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "preferences": {
    "frequency": "weekly",
    "categories": ["wellness", "fitness"]
  }
}
```

**Parameters:**
- `email` (required): Email address
- `firstName` (optional): First name
- `lastName` (optional): Last name
- `preferences` (optional): Subscription preferences

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "status": "subscribed",
    "subscriptionDate": "2024-01-01T00:00:00Z",
    "preferences": {
      "frequency": "weekly",
      "categories": ["wellness", "fitness"]
    },
    "isActive": true,
    "emailsReceived": 0,
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "message": "Successfully subscribed to newsletter. Check your email for confirmation."
}
```

**Response (Duplicate):**
```json
{
  "success": false,
  "message": "This email is already subscribed to our newsletter"
}
```

#### 2. Get Subscriber Information
```
GET /api/v1/newsletter/subscriber/:email
```

**Example:**
```
GET /api/v1/newsletter/subscriber/user@example.com
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "status": "subscribed",
    "emailsReceived": 5,
    "lastEmailSent": "2024-01-15T10:30:00Z",
    "preferences": {
      "frequency": "weekly",
      "categories": ["wellness"]
    }
  },
  "message": "Subscriber fetched successfully"
}
```

#### 3. Unsubscribe from Newsletter
```
PUT /api/v1/newsletter/unsubscribe/:email
```

**Request Body:**
```json
{
  "reason": "Too many emails"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "email": "user@example.com",
    "status": "unsubscribed",
    "isActive": false,
    "unsubscribeDate": "2024-01-20T00:00:00Z",
    "unsubscribeReason": "Too many emails"
  },
  "message": "Successfully unsubscribed from newsletter"
}
```

#### 4. Update Subscriber Preferences
```
PUT /api/v1/newsletter/subscriber/:email/preferences
```

**Request Body:**
```json
{
  "preferences": {
    "frequency": "bi-weekly",
    "categories": ["fitness", "meditation"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "email": "user@example.com",
    "preferences": {
      "frequency": "bi-weekly",
      "categories": ["fitness", "meditation"]
    }
  },
  "message": "Subscriber preferences updated successfully"
}
```

### Admin Endpoints (Protected)

#### 5. Get All Subscribers
```
GET /api/v1/newsletter/subscribers
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)
- `status` (optional): Filter by status (subscribed|unsubscribed|bounced)

**Example:**
```
GET /api/v1/newsletter/subscribers?page=1&limit=50&status=subscribed
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "email": "user1@example.com",
      "firstName": "John",
      "status": "subscribed",
      "subscriptionDate": "2024-01-01T00:00:00Z",
      "emailsReceived": 5
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 50,
    "pages": 3
  },
  "message": "Subscribers fetched successfully"
}
```

#### 6. Send Newsletter to All Subscribers
```
POST /api/v1/newsletter/send
```

**Request Body:**
```json
{
  "subject": "Welltalk Weekly Newsletter - Your Wellness Journey",
  "htmlContent": "<h1>Weekly Newsletter</h1><p>Check out this week's wellness tips...</p>",
  "textContent": "Weekly Newsletter\n\nCheck out this week's wellness tips...",
  "categories": ["wellness", "fitness"]
}
```

**Parameters:**
- `subject` (required): Email subject (min 5 characters)
- `htmlContent` (required): Email HTML content (min 10 characters)
- `textContent` (optional): Plain text version
- `categories` (optional): Filter by categories

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSent": 150,
    "totalFailed": 2,
    "totalSubscribers": 152,
    "errors": [
      {
        "email": "invalid@example.com",
        "error": "SMTP connection timeout"
      }
    ]
  },
  "message": "Newsletter sent to 150 subscribers"
}
```

#### 7. Get Newsletter Statistics
```
GET /api/v1/newsletter/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSubscribers": 150,
    "activeSubscribers": 145,
    "unsubscribed": 4,
    "bounced": 1,
    "averageEmailsReceived": 8,
    "unsubscribeRate": 3
  },
  "message": "Newsletter statistics fetched successfully"
}
```

## Usage Examples

### cURL Examples

#### Subscribe to Newsletter
```bash
curl -X POST http://localhost:5000/api/v1/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "preferences": {
      "frequency": "weekly",
      "categories": ["wellness"]
    }
  }'
```

#### Check Subscription Status
```bash
curl http://localhost:5000/api/v1/newsletter/subscriber/user@example.com
```

#### Unsubscribe
```bash
curl -X PUT http://localhost:5000/api/v1/newsletter/unsubscribe/user@example.com \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Prefer not to receive emails"
  }'
```

#### Send Newsletter
```bash
curl -X POST http://localhost:5000/api/v1/newsletter/send \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Weekly Wellness Newsletter",
    "htmlContent": "<h1>This Week in Wellness</h1><p>Lorem ipsum dolor sit amet...</p>"
  }'
```

#### Get Statistics
```bash
curl http://localhost:5000/api/v1/newsletter/stats
```

## Frontend Integration

### React Component - Subscribe Form

```javascript
import { useState } from 'react';

export function NewsletterSubscribeForm() {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/v1/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          firstName,
          preferences: {
            frequency: 'weekly',
            categories: ['wellness', 'fitness'],
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Thanks for subscribing! Check your email for confirmation.');
        setEmail('');
        setFirstName('');
      } else {
        setError(data.message || 'Error subscribing to newsletter');
      }
    } catch (err) {
      setError('Failed to subscribe. Please try again.');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubscribe} className="newsletter-form">
      <h3>Subscribe to Our Newsletter</h3>
      
      <input
        type="text"
        placeholder="First Name (optional)"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
      />

      <input
        type="email"
        placeholder="Your Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? 'Subscribing...' : 'Subscribe'}
      </button>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
    </form>
  );
}
```

### React Component - Admin Newsletter Sender

```javascript
import { useState } from 'react';

export function NewsletterAdmin() {
  const [subject, setSubject] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  const handleSendNewsletter = async () => {
    if (!subject || !htmlContent) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/v1/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          htmlContent,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Newsletter sent to ${data.data.totalSent} subscribers!`);
        setSubject('');
        setHtmlContent('');
      } else {
        alert('Error sending newsletter');
      }
    } catch (err) {
      alert('Failed to send newsletter');
    }

    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/newsletter/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  return (
    <div className="newsletter-admin">
      <h2>Newsletter Management</h2>

      {stats && (
        <div className="stats">
          <p>Active Subscribers: {stats.activeSubscribers}</p>
          <p>Unsubscribed: {stats.unsubscribed}</p>
          <p>Average Emails Received: {stats.averageEmailsReceived}</p>
        </div>
      )}

      <input
        type="text"
        placeholder="Email Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />

      <textarea
        placeholder="Email HTML Content"
        value={htmlContent}
        onChange={(e) => setHtmlContent(e.target.value)}
        rows={10}
      />

      <button onClick={handleSendNewsletter} disabled={loading}>
        {loading ? 'Sending...' : 'Send Newsletter'}
      </button>

      <button onClick={fetchStats}>Refresh Stats</button>
    </div>
  );
}
```

## Email Template Example

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background-color: #007bff; color: white; padding: 20px; }
        .content { padding: 20px; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; }
        .unsubscribe { color: #999; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welltalk Weekly Newsletter</h1>
        </div>
        
        <div class="content">
            <h2>This Week's Top Stories</h2>
            <p>Hello! Here are this week's wellness tips and updates...</p>
            
            <h3>Featured Article</h3>
            <p>Learn about the benefits of daily meditation...</p>
            
            <h3>Weekly Challenge</h3>
            <p>Try our new 7-day fitness challenge...</p>
        </div>
        
        <div class="footer">
            <p>© 2024 Welltalk. All rights reserved.</p>
            <p class="unsubscribe">
                <a href="http://localhost:5000/api/v1/newsletter/unsubscribe/{{email}}">
                    Unsubscribe from this newsletter
                </a>
            </p>
        </div>
    </div>
</body>
</html>
```

## Subscription Preferences

### Frequency Options
- `weekly` - One newsletter per week
- `bi-weekly` - One newsletter every two weeks
- `monthly` - One newsletter per month

### Category Examples
- `wellness` - General wellness tips
- `fitness` - Fitness and exercise content
- `nutrition` - Nutrition and diet advice
- `meditation` - Meditation and mindfulness
- `events` - Updates on upcoming events
- `articles` - New blog articles

## Best Practices

### 1. Welcome Email
Automatically sent when user subscribes to confirm their interest.

### 2. Batch Sending
Newsletters are sent in batches of 50 with delays to avoid rate limiting.

### 3. Error Handling
Failed sends are tracked and reported in the response.

### 4. Unsubscribe Tracking
Capture reasons when users unsubscribe to improve content.

### 5. Email Headers
Include proper unsubscribe headers for compliance (RFC 8058).

### 6. Double Opt-In (Optional)
Consider implementing email verification for production.

## Production Recommendations

### 1. Add Authentication
```javascript
const authenticateAdmin = require('../middlewares/authMiddleware');

// Protect admin endpoints
router.post('/send', authenticateAdmin, validateNewsletter, newsletterController.sendNewsletter);
router.get('/subscribers', authenticateAdmin, newsletterController.getSubscribers);
router.get('/stats', authenticateAdmin, newsletterController.getNewsletterStats);
```

### 2. Implement Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const subscribeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5
});

router.post('/subscribe', subscribeLimiter, validateSubscription, subscribeNewsletter);
```

### 3. Add Email Verification
Implement double opt-in to verify email addresses.

### 4. Monitor Email Delivery
Track bounces, complaints, and failed sends.

### 5. GDPR Compliance
- Maintain consent records
- Provide easy unsubscribe
- Implement data deletion policies

## Database Indexes

The system uses indexes on:
- `email` (unique) - Fast subscriber lookups
- `status` - Filter subscribed/unsubscribed users
- `isActive` - Get only active subscribers

## Error Responses

### Validation Error
```json
{
  "success": false,
  "errors": [
    {
      "value": "invalid-email",
      "msg": "Invalid email format",
      "param": "email",
      "location": "body"
    }
  ]
}
```

### Duplicate Subscription
```json
{
  "success": false,
  "message": "This email is already subscribed to our newsletter"
}
```

### Not Found
```json
{
  "success": false,
  "message": "Subscriber not found"
}
```

## API Summary Table

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/api/v1/newsletter/subscribe` | Subscribe to newsletter | ❌ |
| GET | `/api/v1/newsletter/subscriber/:email` | Get subscriber info | ❌ |
| PUT | `/api/v1/newsletter/unsubscribe/:email` | Unsubscribe from newsletter | ❌ |
| PUT | `/api/v1/newsletter/subscriber/:email/preferences` | Update preferences | ❌ |
| GET | `/api/v1/newsletter/subscribers` | Get all subscribers | ✅ |
| POST | `/api/v1/newsletter/send` | Send newsletter to all | ✅ |
| GET | `/api/v1/newsletter/stats` | Get statistics | ✅ |
