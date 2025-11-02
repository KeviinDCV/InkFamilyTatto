/**
 * Test de Gemini Multi-Key
 * Ejecuta esto para probar que tus 5 API keys funcionan correctamente
 */

import { callGeminiWithRotation, geminiKeyManager } from "./gemini-multi-key";

export async function testGeminiBasic() {
  console.log("🧪 Iniciando test de Gemini Multi-Key...\n");

  try {
    // Test 1: Llamada simple
    console.log("📝 Test 1: Llamada simple sin imagen...");
    const response1 = await callGeminiWithRotation(
      "Di 'Hola desde InkFamily' en español"
    );
    console.log("✅ Respuesta:", response1);

    // Test 2: Ver estadísticas
    console.log("\n📊 Test 2: Estadísticas del manager...");
    const stats = geminiKeyManager.getStats();
    console.log(`   - Total de keys: ${stats.totalKeys}`);
    console.log(`   - Keys activas: ${stats.activeKeys}`);
    console.log(`   - Requests hoy: ${stats.totalRequestsToday}`);
    console.log(`   - Capacidad disponible: ${stats.availableCapacityMinute} RPM`);

    // Test 3: Múltiples llamadas para probar rotación
    console.log("\n🔄 Test 3: Probando rotación (5 llamadas)...");
    for (let i = 1; i <= 5; i++) {
      const response = await callGeminiWithRotation(`Cuenta hasta ${i}`);
      console.log(`   ✅ Llamada ${i}:`, response.substring(0, 50) + "...");
      await new Promise(resolve => setTimeout(resolve, 100)); // Pausa breve
    }

    // Test 4: Stats finales
    const finalStats = geminiKeyManager.getStats();
    console.log("\n📈 Test 4: Estadísticas finales...");
    console.log(`   - Requests totales hoy: ${finalStats.totalRequestsToday}`);
    console.log(`   - Keys activas: ${finalStats.activeKeys}/${finalStats.totalKeys}`);

    console.log("\n🎉 ¡Todos los tests pasaron exitosamente!");
    console.log(`💪 Tienes ${finalStats.totalKeys} keys configuradas`);
    console.log(`⚡ Capacidad: ${finalStats.availableCapacityMinute} RPM, ${finalStats.availableCapacityDay} RPD`);

    return true;
  } catch (error: any) {
    console.error("\n❌ Error en los tests:", error.message);
    console.error("\n🔧 Verifica:");
    console.error("   1. Que NEXT_PUBLIC_GEMINI_API_KEYS esté en .env.local");
    console.error("   2. Que las keys estén separadas por comas SIN espacios");
    console.error("   3. Que todas las keys sean válidas");
    return false;
  }
}

export async function testGeminiWithImage(imageDataUrl: string) {
  console.log("🧪 Test de Gemini con imagen...\n");

  try {
    const prompt = `Analiza brevemente esta imagen y describe:
    1. Qué elementos principales ves
    2. Qué estilo de line art recomiendas (grueso/fino)
    3. Nivel de detalle sugerido (bajo/medio/alto)`;

    console.log("📝 Enviando imagen a Gemini...");
    const response = await callGeminiWithRotation(prompt, imageDataUrl);
    
    console.log("✅ Análisis de imagen:");
    console.log(response);

    const stats = geminiKeyManager.getStats();
    console.log(`\n📊 Requests usados hoy: ${stats.totalRequestsToday}`);
    console.log(`⚡ Capacidad restante: ${stats.availableCapacityDay} RPD`);

    return response;
  } catch (error: any) {
    console.error("❌ Error analizando imagen:", error.message);
    return null;
  }
}
