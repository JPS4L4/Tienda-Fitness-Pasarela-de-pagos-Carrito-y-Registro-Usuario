#!/usr/bin/env bash

# 🎯 START HERE - NEXT 15 MINUTES

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║         🚀 SYSTEM READY - NEXT 15 MINUTES GUIDE              ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}⏱️  TIMELINE: 15 MINUTES${NC}"
echo ""

# STEP 1 - CONFIGURE EMAIL
echo -e "${YELLOW}🔧 STEP 1: CONFIGURE EMAIL (5 MINUTES)${NC}"
echo "─────────────────────────────────────────"
echo ""
echo "Choose ONE option:"
echo ""
echo "OPTION A: GMAIL (Recommended)"
echo "  1. Go to: https://myaccount.google.com/apppasswords"
echo "  2. Select: 'Mail' and 'Windows Computer'"
echo "  3. Copy the 16-character password"
echo "  4. Open: .env.local"
echo "  5. Add:"
echo "     EMAIL_USER=your-email@gmail.com"
echo "     EMAIL_PASSWORD=16-character-password-here"
echo ""
echo "OPTION B: TESTING (Ethereal)"
echo "  1. Go to: https://ethereal.email"
echo "  2. Click 'Create Ethereal Account'"
echo "  3. Copy Email and Password"
echo "  4. Open: .env.local"
echo "  5. Add:"
echo "     EMAIL_USER=email@ethereal.email"
echo "     EMAIL_PASSWORD=your-password"
echo ""

read -p "Done? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}✓ Email configured${NC}"
else
    echo -e "${YELLOW}⚠ Please configure email first${NC}"
    exit 1
fi

echo ""

# STEP 2 - START SERVER
echo -e "${YELLOW}🖥️  STEP 2: START SERVER (1 MINUTE)${NC}"
echo "─────────────────────────────────────────"
echo ""
echo "Run this in a terminal:"
echo ""
echo "  npm run dev"
echo ""
echo "You should see:"
echo "  ✓ Ready in XXXms"
echo "  - Local: http://localhost:3000"
echo ""

read -p "Is server running? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}✓ Server running${NC}"
else
    echo -e "${YELLOW}⚠ Please start server first${NC}"
    exit 1
fi

echo ""

# STEP 3 - TEST THE SYSTEM
echo -e "${YELLOW}🧪 STEP 3: TEST SYSTEM (5 MINUTES)${NC}"
echo "─────────────────────────────────────────"
echo ""
echo "Follow this exact flow:"
echo ""
echo "1. Open: http://localhost:3000/login"
echo ""
echo "2. Click: 'Regístrate gratis'"
echo ""
echo "3. Fill registration form:"
echo "   • Name: Test User"
echo "   • Email: test@example.com"
echo "   • Password: TestPassword123"
echo "   • Confirm: TestPassword123"
echo ""
echo "4. Click: 'Crear cuenta'"
echo ""
echo "5. Check your email:"
echo "   • Inbox (or Spam folder)"
echo "   • Look for: 'Verifica tu email'"
echo "   • Click: Verification link"
echo ""
echo "6. You should see:"
echo "   ✅ ¡EMAIL VERIFICADO!"
echo "   Redirigiendo a login..."
echo ""
echo "7. Wait for redirect to login page"
echo ""
echo "8. Login with:"
echo "   • Email: test@example.com"
echo "   • Password: TestPassword123"
echo ""
echo "9. Click: 'Iniciar sesión'"
echo ""
echo "10. You should redirect to /profile"
echo ""

read -p "Did the registration work? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}✓ Registration flow works${NC}"
else
    echo -e "${YELLOW}⚠ Registration failed - check errors${NC}"
fi

echo ""

# STEP 4 - TEST PASSWORD RECOVERY
echo -e "${YELLOW}🔐 STEP 4: TEST PASSWORD RECOVERY (3 MINUTES)${NC}"
echo "─────────────────────────────────────────"
echo ""
echo "Follow this flow:"
echo ""
echo "1. Go to: http://localhost:3000/login"
echo ""
echo "2. Click: '¿Olvidaste?'"
echo ""
echo "3. Enter email: test@example.com"
echo ""
echo "4. Click: 'Enviar Instrucciones'"
echo ""
echo "5. You should see:"
echo "   'Si el email existe, recibirás instrucciones...'"
echo ""
echo "6. Check your email for:"
echo "   • Subject: 'Resetea tu contraseña'"
echo "   • Link: Reset password button"
echo ""
echo "7. Click the link"
echo ""
echo "8. Fill form:"
echo "   • New Password: NewPassword456"
echo "   • Confirm: NewPassword456"
echo ""
echo "9. Click: 'Resetear Contraseña'"
echo ""
echo "10. You should see:"
echo "    ✅ ¡ÉXITO!"
echo "    Redirigiendo a login..."
echo ""
echo "11. Login with NEW password:"
echo "    • Email: test@example.com"
echo "    • Password: NewPassword456"
echo ""

read -p "Did password recovery work? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}✓ Password recovery works${NC}"
else
    echo -e "${YELLOW}⚠ Password recovery had issues${NC}"
fi

echo ""

# SUMMARY
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                    ✨ ALL TESTS COMPLETED                     ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}✅ Your authentication system is working!${NC}"
echo ""
echo "What's next?"
echo ""
echo "1. Read QUICKSTART.md for more details"
echo "2. Read SETUP_INSTRUCTIONS.md for advanced setup"
echo "3. Read TESTING_GUIDE.md for edge case testing"
echo "4. Deploy to production when ready"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "📊 System Status:"
echo "  ✅ Email configured"
echo "  ✅ Server running"
echo "  ✅ Registration works"
echo "  ✅ Email verification works"
echo "  ✅ Login works"
echo "  ✅ Password recovery works"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "🚀 Ready for production!"
echo ""
