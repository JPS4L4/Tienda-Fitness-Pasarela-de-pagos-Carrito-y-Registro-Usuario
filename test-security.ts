/**
 * test-security.ts
 * Script de pruebas manuales para validar las medidas de seguridad
 * 
 * INSTRUCCIONES:
 * 1. Abre la página de login en tu navegador
 * 2. Abre la consola del navegador (F12)
 * 3. Intenta los siguientes casos de prueba
 */

// =============================================================================
// PRUEBA 1: SQL Injection
// =============================================================================
console.log('🔬 PRUEBA 1: SQL Injection');
console.log('Intenta registrarte con estos valores:');
console.log('Email: admin\' OR \'1\'=\'1');
console.log('Password: cualquiera');
console.log('Resultado esperado: "Entrada sospechosa detectada"');
console.log('---');

// =============================================================================
// PRUEBA 2: XSS (Cross-Site Scripting)
// =============================================================================
console.log('🔬 PRUEBA 2: XSS');
console.log('Intenta registrarte con estos valores:');
console.log('Nombre: <script>alert("XSS")</script>');
console.log('Email: test@test.com');
console.log('Password: Password1!');
console.log('Resultado esperado: "Entrada sospechosa detectada" o nombre sanitizado');
console.log('---');

// =============================================================================
// PRUEBA 3: Contraseña débil
// =============================================================================
console.log('🔬 PRUEBA 3: Contraseña débil');
console.log('Intenta registrarte con estos valores:');
console.log('Password: abc123');
console.log('Resultado esperado: Error indicando requisitos de contraseña');
console.log('Mensajes esperados:');
console.log('  - La contraseña debe tener al menos 8 caracteres');
console.log('  - Debe contener al menos una mayúscula');
console.log('  - Debe contener al menos un carácter especial');
console.log('---');

// =============================================================================
// PRUEBA 4: Rate Limiting
// =============================================================================
console.log('🔬 PRUEBA 4: Rate Limiting');
console.log('Intenta hacer login 6 veces seguidas con credenciales incorrectas');
console.log('Resultado esperado: Después del 5to intento, bloqueo temporal');
console.log('Mensaje esperado: "Demasiados intentos. Por favor espera X segundos."');
console.log('---');

// =============================================================================
// PRUEBA 5: Email inválido
// =============================================================================
console.log('🔬 PRUEBA 5: Email inválido');
console.log('Intenta registrarte con estos valores:');
console.log('Email: not-an-email');
console.log('Resultado esperado: "El formato del email es inválido"');
console.log('---');

// =============================================================================
// PRUEBA 6: Caracteres especiales en email
// =============================================================================
console.log('🔬 PRUEBA 6: Caracteres peligrosos en email');
console.log('Intenta registrarte con estos valores:');
console.log('Email: test..@test.com (doble punto)');
console.log('Email: test@@test.com (doble arroba)');
console.log('Resultado esperado: "El email contiene caracteres no permitidos"');
console.log('---');

// =============================================================================
// PRUEBA 7: Contraseña común
// =============================================================================
console.log('🔬 PRUEBA 7: Contraseña común');
console.log('Intenta registrarte con estos valores:');
console.log('Password: Password1!');
console.log('Resultado esperado: "Esta contraseña es muy común, elige otra"');
console.log('---');

// =============================================================================
// PRUEBA 8: Verificar Headers de Seguridad
// =============================================================================
console.log('🔬 PRUEBA 8: Headers de Seguridad HTTP');
console.log('1. Abre DevTools (F12) > Network');
console.log('2. Recarga la página');
console.log('3. Click en la petición principal (login)');
console.log('4. Ve a la pestaña "Headers"');
console.log('5. Busca en "Response Headers":');
console.log('   ✅ X-Frame-Options: DENY');
console.log('   ✅ X-Content-Type-Options: nosniff');
console.log('   ✅ X-XSS-Protection: 1; mode=block');
console.log('   ✅ Referrer-Policy: strict-origin-when-cross-origin');
console.log('   ✅ Content-Security-Policy: (debe existir)');
console.log('   ✅ Permissions-Policy: camera=(), microphone=()...');
console.log('---');

// =============================================================================
// PRUEBA 9: Longitud excesiva
// =============================================================================
console.log('🔬 PRUEBA 9: Buffer overflow prevention');
console.log('Intenta registrarte con:');
console.log('Nombre: ' + 'A'.repeat(100) + ' (100 caracteres)');
console.log('Resultado esperado: "El nombre es demasiado largo (máximo 50 caracteres)"');
console.log('---');

// =============================================================================
// PRUEBA 10: Contraseñas no coinciden
// =============================================================================
console.log('🔬 PRUEBA 10: Confirmación de contraseña');
console.log('Intenta registrarte con:');
console.log('Password: Password1!');
console.log('Confirm Password: Password2!');
console.log('Resultado esperado: "Las contraseñas no coinciden"');
console.log('---');

// =============================================================================
// RESULTADO DE TODAS LAS PRUEBAS
// =============================================================================
console.log('');
console.log('════════════════════════════════════════════════════════════');
console.log('📋 CHECKLIST DE PRUEBAS');
console.log('════════════════════════════════════════════════════════════');
console.log('Marca cada prueba al completarla:');
console.log('□ PRUEBA 1: SQL Injection bloqueado');
console.log('□ PRUEBA 2: XSS bloqueado o sanitizado');
console.log('□ PRUEBA 3: Contraseña débil rechazada');
console.log('□ PRUEBA 4: Rate limiting activo');
console.log('□ PRUEBA 5: Email inválido rechazado');
console.log('□ PRUEBA 6: Caracteres peligrosos bloqueados');
console.log('□ PRUEBA 7: Contraseña común rechazada');
console.log('□ PRUEBA 8: Headers de seguridad presentes');
console.log('□ PRUEBA 9: Buffer overflow prevenido');
console.log('□ PRUEBA 10: Confirmación de contraseña funcional');
console.log('════════════════════════════════════════════════════════════');
console.log('');
console.log('💡 TIP: Para probar rate limiting del backend, necesitas hacer');
console.log('   las peticiones desde el mismo IP. Usa Postman o curl.');
console.log('');
console.log('🛡️ TODAS las pruebas deben PASAR para considerar la seguridad completa');

/**
 * Función helper para probar validaciones programáticamente
 */
export async function testValidations() {
  console.log('🧪 Iniciando pruebas automatizadas...\n');

  // Test 1: SQL Injection
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test',
        email: "admin' OR '1'='1",
        password: 'Password1!',
      }),
    });
    const data = await response.json();
    console.log('✅ Test SQL Injection:', data.message || data.error);
  } catch (error) {
    console.error('❌ Test SQL Injection falló:', error);
  }

  // Test 2: XSS
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: '<script>alert("xss")</script>',
        email: 'test@test.com',
        password: 'Password1!',
      }),
    });
    const data = await response.json();
    console.log('✅ Test XSS:', data.message || data.error);
  } catch (error) {
    console.error('❌ Test XSS falló:', error);
  }

  // Test 3: Contraseña débil
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@test.com',
        password: 'abc123',
      }),
    });
    const data = await response.json();
    console.log('✅ Test Contraseña débil:', data.message || data.error);
  } catch (error) {
    console.error('❌ Test Contraseña débil falló:', error);
  }

  console.log('\n🏁 Pruebas completadas');
}

// Exportar para usar en consola del navegador
if (typeof window !== 'undefined') {
  (window as any).testSecurity = testValidations;
  console.log('💡 Ejecuta testSecurity() en la consola para pruebas automatizadas');
}
