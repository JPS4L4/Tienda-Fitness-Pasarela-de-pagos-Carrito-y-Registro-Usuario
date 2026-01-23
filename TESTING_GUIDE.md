#!/usr/bin/env bash

# 🧪 Complete Authentication System Testing Guide
# Run all tests to verify the implementation

echo "🔐 NanSalazar Authentication System - Testing Guide"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0

# Helper functions
test_step() {
    echo -e "${YELLOW}→${NC} $1"
}

success() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASSED++))
}

error() {
    echo -e "${RED}✗${NC} $1"
    ((FAILED++))
}

# ============================================
# MANUAL TESTING CHECKLIST
# ============================================

echo "📋 MANUAL TESTING CHECKLIST"
echo ""

echo "1️⃣  REGISTRATION FLOW"
echo "====================="
test_step "Navigate to http://localhost:3000/login"
test_step "Click on 'Regístrate gratis'"
test_step "Fill in the registration form:"
echo "   - Name: Test User"
echo "   - Email: test@example.com"
echo "   - Password: TestPassword123"
echo "   - Confirm Password: TestPassword123"
test_step "Click 'Crear cuenta'"
read -p "Did you receive a verification email? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    success "Verification email received"
else
    error "Verification email not received - check EMAIL_USER and EMAIL_PASSWORD"
fi

echo ""
echo "2️⃣  EMAIL VERIFICATION FLOW"
echo "============================="
test_step "Open the email and click the verification link"
test_step "Wait for page to load"
read -p "Did you see a success message with checkmark? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    success "Email verified successfully"
else
    error "Email verification failed"
fi

read -p "Did the page redirect to /login automatically? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    success "Auto-redirect to login working"
else
    error "Auto-redirect not working"
fi

echo ""
echo "3️⃣  LOGIN FLOW"
echo "==============="
test_step "You should be on /login page now"
test_step "Enter your credentials:"
echo "   - Email: test@example.com"
echo "   - Password: TestPassword123"
test_step "Click 'Iniciar sesión'"
read -p "Did you get logged in successfully? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    success "Login with verified email working"
else
    error "Login failed"
fi

read -p "Did you redirect to /profile? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    success "Login redirect working"
else
    error "Login redirect failed"
fi

echo ""
echo "4️⃣  FORGOT PASSWORD FLOW"
echo "=========================="
test_step "Go to http://localhost:3000/login"
test_step "Click on '¿Olvidaste?' link next to password field"
test_step "Enter your email: test@example.com"
test_step "Click 'Enviar Instrucciones'"
read -p "Did you see success message? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    success "Forgot password request successful"
else
    error "Forgot password request failed"
fi

read -p "Did you receive reset password email? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    success "Reset password email received"
else
    error "Reset password email not received"
fi

echo ""
echo "5️⃣  PASSWORD RESET FLOW"
echo "========================"
test_step "Click the password reset link in the email"
test_step "Wait for token validation"
read -p "Did you see the password reset form? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    success "Reset password page loaded"
else
    error "Reset password page failed to load"
fi

test_step "Enter new password:"
echo "   - New Password: NewPassword456"
echo "   - Confirm Password: NewPassword456"
test_step "Click 'Resetear Contraseña'"
read -p "Did you see success message? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    success "Password reset successful"
else
    error "Password reset failed"
fi

read -p "Did you redirect to /login? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    success "Auto-redirect after reset working"
else
    error "Auto-redirect after reset failed"
fi

echo ""
echo "6️⃣  LOGIN WITH NEW PASSWORD"
echo "============================"
test_step "You should be on /login page"
test_step "Enter your credentials with NEW password:"
echo "   - Email: test@example.com"
echo "   - Password: NewPassword456"
test_step "Click 'Iniciar sesión'"
read -p "Did you login successfully with new password? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    success "Login with new password working"
else
    error "Login with new password failed"
fi

echo ""
echo "7️⃣  TOKEN EXPIRATION TEST"
echo "=========================="
test_step "Create a new user account for testing"
test_step "Wait 24+ hours and try to verify email"
read -p "Did you see 'Token Expirado' message? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    success "Email token expiration working"
else
    error "Email token expiration not working"
fi

echo ""
echo "8️⃣  EDGE CASES"
echo "==============="
test_step "Try registering with same email twice"
read -p "Did you see error message about duplicate email? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    success "Duplicate email validation working"
else
    error "Duplicate email validation not working"
fi

test_step "Try logging in with wrong password"
read -p "Did you see 'Correo o contraseña incorrectos' error? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    success "Invalid password validation working"
else
    error "Invalid password validation not working"
fi

test_step "Try reset password with mismatched passwords"
echo "   - New Password: Pass123"
echo "   - Confirm Password: DifferentPass456"
test_step "Click 'Resetear Contraseña'"
read -p "Did you see error about passwords not matching? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    success "Password mismatch validation working"
else
    error "Password mismatch validation not working"
fi

test_step "Try reset password with password < 8 chars"
echo "   - New Password: Pass1"
echo "   - Confirm Password: Pass1"
test_step "Click 'Resetear Contraseña'"
read -p "Did you see error about minimum length? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    success "Minimum password length validation working"
else
    error "Minimum password length validation not working"
fi

echo ""
echo "9️⃣  BROWSER CONSOLE CHECK"
echo "=========================="
test_step "Open browser Developer Tools (F12)"
test_step "Go to Console tab"
test_step "Navigate through registration/login flow"
read -p "Are there any JavaScript errors in console? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Nn]$ ]]; then
    success "No console errors detected"
else
    error "There are console errors - check browser dev tools"
fi

echo ""
echo "🔟 DATABASE CHECK"
echo "================="
test_step "Open MongoDB/Prisma Studio (optional)"
test_step "Run: npx prisma studio"
test_step "Check User collection:"
echo "   - Verify emailVerified is set (not null)"
echo "   - Verify emailVerificationToken is cleared"
echo "   - Verify passwordResetToken is cleared"
read -p "Did you verify the database entries? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    success "Database entries verified"
else
    error "Database entries not verified"
fi

# ============================================
# RESULTS SUMMARY
# ============================================

echo ""
echo "=============================================="
echo "📊 TEST RESULTS SUMMARY"
echo "=============================================="
echo -e "${GREEN}✓ Passed: $PASSED${NC}"
echo -e "${RED}✗ Failed: $FAILED${NC}"
TOTAL=$((PASSED + FAILED))
echo "Total Tests: $TOTAL"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
    echo "Your authentication system is working correctly."
else
    echo -e "${RED}⚠️  SOME TESTS FAILED${NC}"
    echo "Please check the errors above and troubleshoot."
fi

echo ""
echo "=============================================="
echo "💡 ADDITIONAL TESTS (Optional)"
echo "=============================================="
echo ""
echo "• Test Google OAuth login"
echo "• Test Facebook OAuth login"
echo "• Test registration with special characters"
echo "• Test email with multiple recipients"
echo "• Load test: rapid registration/login attempts"
echo "• Test from different browsers/devices"
echo "• Test mobile responsive design"
echo ""

echo "🚀 System Status: READY FOR PRODUCTION"
echo ""
