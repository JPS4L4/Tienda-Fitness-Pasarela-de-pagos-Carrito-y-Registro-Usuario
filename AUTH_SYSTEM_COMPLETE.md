# 🔐 Complete Authentication System Documentation

## Overview

This project implements a comprehensive authentication system with email verification and password recovery features. Built with Next.js, NextAuth.js, Prisma, MongoDB, and bcryptjs.

## Features Implemented

### ✅ Core Authentication
- User registration with email and password
- Secure login with bcryptjs password hashing
- NextAuth.js JWT-based sessions
- Role-based access control ready
- Google OAuth integration
- Facebook OAuth integration

### ✅ Email Verification
- Automatic verification email on registration
- Secure token generation (32-byte crypto tokens)
- 24-hour token expiration
- Verification status in database
- Beautiful HTML email templates
- Verified users can access full features

### ✅ Password Recovery
- "Forgot Password" functionality
- Secure password reset tokens
- 1-hour token expiration for security
- Password reset form with validation
- Email notifications for password changes
- Previous password hashing maintained

### ✅ Security Features
- bcryptjs password hashing (10 rounds)
- Secure token generation using crypto module
- Token expiration validation
- SQL injection prevention (Prisma ORM)
- HTTPS ready
- Environment variable protection

## Database Schema

### User Model
```prisma
model User {
  id                           String   @id @default(auto()) @map("_id") @db.ObjectId
  name                         String?
  email                        String?  @unique
  emailVerified                DateTime?
  emailVerificationToken       String?  @unique
  emailVerificationTokenExpiry DateTime?
  passwordResetToken           String?  @unique
  passwordResetTokenExpiry     DateTime?
  image                        String?
  createdAt                    DateTime @default(now())
  updatedAt                    DateTime @updatedAt

  accounts      Account[]
  favorites     Favorite[]
  cartItems     CartItem[]
  reviews       Review[]
  orders        Order[]
}

model Account {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  userId    String   @db.ObjectId
  provider  String   // "credentials" | "google" | "facebook" | etc.
  password  String?  // Solo para provider = "credentials"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User     @relation(fields: [userId], references: [id])

  @@unique([userId, provider])
}
```

## API Endpoints

### Authentication Routes

#### POST `/api/auth/register`
Register a new user with email and password.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "email": "john@example.com",
    "name": "John Doe"
  },
  "message": "Cuenta creada. Revisa tu email para verificar tu cuenta."
}
```

**Side Effects:**
- Generates verification token
- Sends verification email
- User stored in MongoDB

---

#### POST `/api/auth/login`
Authenticate user with credentials (used by NextAuth).

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "email": "john@example.com",
    "emailVerified": true
  }
}
```

---

#### POST `/api/auth/verify-email`
Send verification email to user (manual trigger).

**Request:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email de verificación enviado"
}
```

---

#### GET `/api/auth/verify-email?token=...`
Verify email with token from email link.

**Query Parameters:**
- `token` (required): Verification token from email

**Response:**
```json
{
  "success": true,
  "message": "Email verificado exitosamente"
}
```

**Side Effects:**
- Marks email as verified
- Clears verification token
- User can now login

---

#### POST `/api/auth/forgot-password`
Request password reset email.

**Request:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Si el email existe, recibirás instrucciones para resetear tu contraseña"
}
```

**Side Effects:**
- Generates password reset token
- Sends reset email with 1-hour validity
- Token stored in database

---

#### GET `/api/auth/reset-password?token=...`
Validate password reset token without changing password.

**Query Parameters:**
- `token` (required): Password reset token from email

**Response:**
```json
{
  "success": true,
  "message": "Token válido"
}
```

---

#### POST `/api/auth/reset-password`
Reset password with token.

**Request:**
```json
{
  "token": "...",
  "password": "NewPassword123",
  "confirmPassword": "NewPassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Contraseña actualizada exitosamente"
}
```

**Side Effects:**
- Updates password (hashed with bcryptjs)
- Clears reset token
- User can login with new password

---

## Frontend Pages

### `/login`
Login and registration page with toggle mode.

**Features:**
- Email and password inputs
- Form validation
- Error/success messages
- Google OAuth button
- Facebook OAuth button
- Toggle to registration mode
- "Forgot Password?" link

**File:** `app/(main)/login/page.tsx`

---

### `/register`
Part of the login page (toggle mode).

**Features:**
- Name, email, password inputs
- Password confirmation
- Terms & conditions links
- Auto-redirect to login on success
- Verification email notice

---

### `/verify-email`
Email verification confirmation page.

**Features:**
- Automatic token validation from URL
- Loading spinner during validation
- Success state with checkmark
- Error state with failure message
- Auto-redirect to login on success
- Manual retry link on failure

**File:** `app/(main)/verify-email/page.tsx`

**URL:** `/verify-email?token=...`

---

### `/forgot-password`
Request password reset email.

**Features:**
- Email input
- Submit button
- Success message showing next steps
- Error handling
- Link back to login

**File:** `app/(main)/forgot-password/page.tsx`

---

### `/reset-password`
Reset password with token.

**Features:**
- Auto-validate token from URL
- New password input
- Confirm password input
- Form validation
- Loading state
- Success/error messages
- Auto-redirect to login on success

**File:** `app/(main)/reset-password/page.tsx`

**URL:** `/reset-password?token=...`

---

## Service Layer

### `/lib/emailService.ts`

**Functions:**

#### `generateToken(): string`
Generates a secure 32-byte random token.
```typescript
const token = generateToken()
// Returns: "a1b2c3d4..."
```

---

#### `getTokenExpiry(hours: number): Date`
Calculates token expiration time.
```typescript
const expiry = getTokenExpiry(24) // 24 hours from now
const expiry = getTokenExpiry(1)  // 1 hour from now
```

---

#### `isTokenExpired(expiryDate: Date | null): boolean`
Checks if a token has expired.
```typescript
const expired = isTokenExpired(user.emailVerificationTokenExpiry)
```

---

#### `async sendVerificationEmail(email: string, name: string, token: string): Promise<void>`
Sends HTML email with verification link.

**Email Content:**
- User's name
- Verification button (links to `/verify-email?token=...`)
- 24-hour expiration warning
- Support contact information

**Configuration Required:**
- `EMAIL_USER` environment variable
- `EMAIL_PASSWORD` environment variable

---

#### `async sendPasswordResetEmail(email: string, name: string, token: string): Promise<void>`
Sends HTML email with password reset link.

**Email Content:**
- User's name
- Reset button (links to `/reset-password?token=...`)
- 1-hour expiration warning
- Security notice
- Support contact information

**Configuration Required:**
- `EMAIL_USER` environment variable
- `EMAIL_PASSWORD` environment variable

---

### `/app/api/auth/services/prismaAuthService.ts`

**Functions:**

#### `async registerUser(payload: RegisterPayload): Promise<AuthResult>`
Register new user with hashed password.

```typescript
const result = await registerUser({
  name: "John Doe",
  email: "john@example.com",
  password: "SecurePass123"
})
```

**Side Effects:**
- Creates User document
- Creates Account document with hashed password
- Returns user data

---

#### `async validateCredentials(email: string, password: string): Promise<AuthResult>`
Validate login credentials with bcryptjs comparison.

```typescript
const result = await validateCredentials("john@example.com", "SecurePass123")
if (result.success) {
  // User authenticated
}
```

**Checks:**
- User exists by email
- Email verified (emailVerified !== null)
- Password matches (bcryptjs.compare)

---

## Environment Variables

Required environment variables (`.env.local`):

```env
# Database
DATABASE_URL="mongodb+srv://username:password@host/nanPageDatabase"

# NextAuth
NEXTAUTH_SECRET="..." # Generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"

# Email Configuration (Gmail recommended)
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="app-password" # Use Gmail App Password

# OAuth Providers (Optional)
GOOGLE_ID="..."
GOOGLE_SECRET="..."
FACEBOOK_ID="..."
FACEBOOK_SECRET="..."
```

## Email Configuration (Gmail)

### Steps:
1. **Enable 2FA** in Google Account
2. **Generate App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Copy the 16-character password
3. **Set environment variables:**
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   ```

### Alternative (Development only - not recommended for production):
Use Nodemailer with a testing service like Ethereal or Mailtrap.

## Security Considerations

### ✅ Implemented
- **Password Hashing:** bcryptjs with 10 rounds
- **Token Security:** 32-byte crypto tokens
- **Token Expiration:** 24h for email, 1h for password reset
- **ORM Protection:** Prisma prevents SQL injection
- **Environment Variables:** Secrets not in code
- **HTTP-only Cookies:** NextAuth session handling
- **CSRF Protection:** NextAuth built-in

### ⚠️ Additional Recommendations
- Use HTTPS in production
- Set `NEXTAUTH_URL` to production URL
- Use strong `NEXTAUTH_SECRET`
- Enable email verification requirement
- Implement rate limiting on auth endpoints
- Add CAPTCHA to registration form
- Log authentication events
- Implement 2FA for sensitive operations

## Development Server

Start the development server:
```bash
npm run dev
```

Visit `http://localhost:3000`

## Build & Deployment

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## Testing Checklist

- [ ] Register new user
- [ ] Receive verification email
- [ ] Click verification link
- [ ] Email marked as verified
- [ ] Login with verified email
- [ ] Request password reset
- [ ] Receive reset email
- [ ] Click reset link
- [ ] Enter new password
- [ ] Login with new password
- [ ] Google OAuth works
- [ ] Facebook OAuth works
- [ ] Token expiration validation
- [ ] Invalid token handling
- [ ] Error messages display correctly

## File Structure

```
app/
├── api/auth/
│   ├── [...nextAuth]/route.ts (NextAuth config)
│   ├── login/route.ts
│   ├── register/route.ts (sends verification email)
│   ├── verify-email/route.ts (POST & GET handlers)
│   ├── forgot-password/route.ts
│   ├── reset-password/route.ts
│   └── services/
│       └── prismaAuthService.ts
├── (main)/
│   ├── login/page.tsx (login/register UI)
│   ├── verify-email/page.tsx (email confirmation)
│   ├── forgot-password/page.tsx (request reset)
│   └── reset-password/page.tsx (change password)
lib/
├── emailService.ts (token & email functions)
├── authService.ts (auth wrappers)
├── auth.ts (NextAuth types)
├── nextAuth.ts (NextAuth config)
└── prisma.ts (Prisma singleton)
types/
└── auth.ts (TypeScript interfaces)
prisma/
└── schema.prisma (database models)
```

## Dependencies

- **next**: ^16.0.10
- **react**: ^19.2.1
- **next-auth**: ^4.24.13
- **prisma**: ^6.19.2
- **mongodb**: driver (via Prisma)
- **bcryptjs**: ^2.4.3
- **nodemailer**: ^6.9.13
- **@types/nodemailer**: ^6.4.14

## Troubleshooting

### Email not sending
- Check `EMAIL_USER` and `EMAIL_PASSWORD` in `.env.local`
- Verify Gmail App Password is used (not regular password)
- Check email logs: `console.error()` in emailService.ts
- Test with nodemailer directly

### Token expired error
- Verify token hasn't expired (24h for email, 1h for reset)
- Check system clock is correct
- Look at `emailVerificationTokenExpiry` in database

### Verification email doesn't arrive
- Check spam/junk folder
- Verify sender email address is correct
- Check browser console for API errors
- Look at server logs for email service errors

### Login fails after verification
- Check `emailVerified` field is not null in database
- Verify token was cleared after verification
- Check password is hashed in `Account` table

## API Response Format

All auth API endpoints follow this format:

### Success
```json
{
  "success": true,
  "message": "...",
  "user": { ... }
}
```

### Error
```json
{
  "success": false,
  "error": "Error description",
  "message": "Error message"
}
```

## Next Steps

1. **Test Email Configuration:** Set `EMAIL_USER` and `EMAIL_PASSWORD`
2. **Test Complete Flow:** Register → Verify → Login
3. **Test Password Recovery:** Forgot → Reset → Login
4. **Configure OAuth:** Add Google and Facebook credentials
5. **Deploy:** Set production environment variables
6. **Monitor:** Log authentication events
7. **Enhance:** Add rate limiting and CAPTCHA

---

**System Status:** ✅ Complete and Ready for Testing

Generated: 2024
Stack: Next.js 16 + React 19 + Prisma 6 + MongoDB + NextAuth 4
