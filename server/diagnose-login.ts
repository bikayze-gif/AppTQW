import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

const email = "nicolas.cornejo@telqway.cl";
const password = "N1c0l7as17";

async function diagnoseLogin() {
  console.log("========================================");
  console.log("  DIAGNÓSTICO DE LOGIN");
  console.log("========================================\n");

  let connection;

  try {
    // 1. Verificar configuración de la base de datos
    console.log("1️⃣  Verificando configuración de la base de datos...");
    console.log(`   Host: ${process.env.MYSQL_HOST}`);
    console.log(`   Puerto: ${process.env.MYSQL_PORT}`);
    console.log(`   Base de datos: ${process.env.MYSQL_DATABASE}`);
    console.log(`   Usuario: ${process.env.MYSQL_USER}\n`);

    // 2. Intentar conectar a la base de datos
    console.log("2️⃣  Intentando conectar a MySQL...");
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      port: parseInt(process.env.MYSQL_PORT || "3306"),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      timezone: "-03:00",
    });
    console.log("   ✅ Conexión exitosa\n");

    // 3. Verificar si el usuario existe
    console.log("3️⃣  Buscando usuario en tb_user_tqw...");
    const [userRows] = await connection.execute(
      "SELECT id, email, nombre, rut, PERFIL, ZONA_GEO, vigente FROM tb_user_tqw WHERE email = ?",
      [email]
    );

    const users = userRows as any[];
    if (!users || users.length === 0) {
      console.log(`   ❌ Usuario NO encontrado: ${email}`);
      console.log("   Posibles razones:");
      console.log("   - El email está mal escrito");
      console.log("   - El usuario no existe en la base de datos\n");
      return;
    }

    const user = users[0];
    console.log(`   ✅ Usuario encontrado:`);
    console.log(`   - ID: ${user.id}`);
    console.log(`   - Nombre: ${user.nombre}`);
    console.log(`   - RUT: ${user.rut}`);
    console.log(`   - Perfil: ${user.PERFIL}`);
    console.log(`   - Zona: ${user.ZONA_GEO}`);
    console.log(`   - Vigente: ${user.vigente}\n`);

    if (user.vigente !== "Si") {
      console.log(`   ⚠️  ADVERTENCIA: El usuario NO está vigente (vigente = "${user.vigente}")`);
      console.log("   El login fallará porque el usuario debe estar vigente.\n");
      return;
    }

    // 4. Verificar contraseña en tb_claves_usuarios
    console.log("4️⃣  Buscando contraseña más reciente en tb_claves_usuarios...");
    const [passRows] = await connection.execute(
      `SELECT usuario, pass_new, fecha_registro,
              (SELECT COUNT(*) FROM tb_claves_usuarios b
               WHERE a.usuario = b.usuario AND a.fecha_registro <= b.fecha_registro) as total
       FROM tb_claves_usuarios a
       WHERE a.usuario = ?
       ORDER BY fecha_registro DESC
       LIMIT 1`,
      [email]
    );

    const passwords = passRows as any[];
    if (!passwords || passwords.length === 0) {
      console.log(`   ❌ NO se encontró contraseña para: ${email}`);
      console.log("   El usuario existe pero no tiene contraseña registrada en tb_claves_usuarios.\n");
      return;
    }

    const passRecord = passwords[0];
    console.log(`   ✅ Contraseña encontrada:`);
    console.log(`   - Fecha registro: ${passRecord.fecha_registro}`);
    console.log(`   - Es la más reciente: ${passRecord.total === 1 ? "Sí" : "No"}`);

    const storedPassword = passRecord.pass_new;
    const isBcrypt = storedPassword?.startsWith('$2a$') || storedPassword?.startsWith('$2b$') || storedPassword?.startsWith('$2y$');
    console.log(`   - Tipo: ${isBcrypt ? "bcrypt (hash)" : "texto plano"}`);

    if (isBcrypt) {
      console.log(`   - Hash: ${storedPassword.substring(0, 30)}...`);
    } else {
      console.log(`   - Valor: "${storedPassword}"`);
    }
    console.log();

    // 5. Validar contraseña
    console.log("5️⃣  Validando contraseña ingresada...");
    console.log(`   Contraseña a verificar: "${password}"`);

    let passwordValid = false;
    if (isBcrypt) {
      try {
        passwordValid = await bcrypt.compare(password, storedPassword);
        console.log(`   ${passwordValid ? "✅" : "❌"} Validación bcrypt: ${passwordValid ? "CORRECTA" : "INCORRECTA"}`);
      } catch (bcryptError) {
        console.error("   ❌ Error al comparar con bcrypt:", bcryptError);
      }
    } else {
      passwordValid = storedPassword.trim() === password.trim();
      console.log(`   ${passwordValid ? "✅" : "❌"} Validación texto plano: ${passwordValid ? "CORRECTA" : "INCORRECTA"}`);
      if (!passwordValid) {
        console.log(`   Contraseña almacenada (trimmed): "${storedPassword.trim()}"`);
        console.log(`   Contraseña ingresada (trimmed): "${password.trim()}"`);
      }
    }

    console.log();

    // 6. Resultado final
    console.log("========================================");
    console.log("  RESULTADO FINAL");
    console.log("========================================");

    if (passwordValid && user.vigente === "Si") {
      console.log("✅ LOGIN DEBERÍA FUNCIONAR");
      console.log("\nSi aún así falla el login, el problema es:");
      console.log("1. El servidor backend no está corriendo");
      console.log("2. Hay un problema de red/CORS");
      console.log("3. Revisa la consola del servidor para errores");
    } else {
      console.log("❌ LOGIN NO FUNCIONARÁ");
      console.log("\nProblemas detectados:");
      if (!passwordValid) {
        console.log("- La contraseña es incorrecta");
      }
      if (user.vigente !== "Si") {
        console.log("- El usuario no está vigente");
      }
    }
    console.log();

  } catch (error: any) {
    console.error("\n❌ ERROR DE CONEXIÓN:");
    console.error(error.message);
    console.error("\nPosibles causas:");
    console.error("1. La base de datos no está accesible");
    console.error("2. Las credenciales en .env son incorrectas");
    console.error("3. El servidor MySQL está apagado");
    console.error("4. Hay un firewall bloqueando la conexión");
    console.error();
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

diagnoseLogin();
