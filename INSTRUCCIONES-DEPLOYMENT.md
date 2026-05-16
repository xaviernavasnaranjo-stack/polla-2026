# ⚽ Polla Mundialista 2026 — Guía de Deployment

## Lo que necesitas (todo gratis)
- Cuenta en **Supabase** → https://supabase.com (base de datos)
- Cuenta en **Vercel** → https://vercel.com (hosting)
- Cuenta en **GitHub** → https://github.com (para conectar Vercel)
- **Node.js** instalado en tu computadora → https://nodejs.org

---

## PASO 1 — Supabase (base de datos en la nube)

1. Ve a https://supabase.com y crea una cuenta gratuita
2. Haz clic en **"New project"**
   - Nombre: `polla-mundialista-2026`
   - Password: (elige uno seguro y guárdalo)
   - Region: elige la más cercana a Argentina (São Paulo o US East)
3. Espera ~2 minutos a que el proyecto se cree
4. Ve a **SQL Editor** (menú izquierdo)
5. Copia y pega **todo el contenido** del archivo `supabase-schema.sql`
6. Haz clic en **"Run"** — verás las tablas creadas
7. Ve a **Database → Replication** en el menú izquierdo
   - Activa **Realtime** para las 6 tablas creadas
8. Ve a **Project Settings → API**
   - Copia **Project URL** (algo como `https://xxxxx.supabase.co`)
   - Copia **anon public key** (la clave larga)

---

## PASO 2 — Configurar el proyecto

1. Abre la carpeta `polla-mundialista-2026` en tu computadora
2. Copia el archivo `.env.local.example` y renómbralo `.env.local`
3. Edita `.env.local` con los valores de Supabase:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
   NEXT_PUBLIC_ADMIN_PIN=2026
   ```
   (puedes cambiar el PIN por el que quieras)

---

## PASO 3 — Subir a GitHub

1. Ve a https://github.com → **New repository**
   - Nombre: `polla-2026`
   - Privado o público (da igual)
   - Sin README
2. En tu computadora, abre una terminal en la carpeta del proyecto:
   ```bash
   git init
   git add .
   git commit -m "Polla Mundialista 2026"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/polla-2026.git
   git push -u origin main
   ```

---

## PASO 4 — Deploy en Vercel

1. Ve a https://vercel.com → **New Project**
2. Importa tu repositorio de GitHub (`polla-2026`)
3. En **Environment Variables**, agrega:
   - `NEXT_PUBLIC_SUPABASE_URL` = tu URL de Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = tu anon key
   - `NEXT_PUBLIC_ADMIN_PIN` = tu PIN elegido
4. Haz clic en **Deploy**
5. Vercel te dará una URL como `https://polla-2026.vercel.app`

**¡Listo! Esa es tu URL para compartir con todos.**

---

## PASO 5 — Cómo usar la app

### Como administrador:
1. Entra a la URL de la app
2. Haz clic en el ícono 🔒 arriba a la derecha
3. Ingresa tu PIN
4. Ve a **⚙️ Admin** para:
   - Ver estadísticas generales
   - Eliminar participantes
   - **Abrir/cerrar partidos** (los participantes solo pueden pronosticar partidos abiertos)
5. Ve a **⚽ Partidos** para ingresar los resultados reales
6. Ve a **📊 Grupos** para registrar los clasificados reales

### Como participante:
1. Entra a la URL de la app
2. Haz clic en **+ Unirse** e ingresa tu nombre
3. Ve a **🔮 Mis Pronósticos**
4. Llena los goles de cada partido abierto (se guarda automáticamente al salir del campo)
5. Llena los clasificados de cada grupo y guarda

### Para volver a entrar (sesión):
- El nombre se guarda en el navegador. Si borra el historial, solo vuelve a escribir su nombre exacto.

---

## Sistema de puntos
| Resultado | Puntos |
|-----------|--------|
| Marcador exacto (ej: 2-1 y fue 2-1) | 3 pts |
| Resultado correcto (ganó/empató/perdió, no el marcador) | 2 pts |
| Equipo clasificado de grupo acertado (por cada uno) | 5 pts |

---

## Problemas frecuentes

**"No carga nada"** → Verifica que las variables de entorno estén bien en Vercel

**"Error al guardar"** → Revisa que ejecutaste el SQL en Supabase correctamente

**"No se actualizan en tiempo real"** → Activa Realtime en Supabase → Database → Replication

**Cambiar PIN** → En Vercel → Settings → Environment Variables → edita `NEXT_PUBLIC_ADMIN_PIN`

---

## Actualización v2 — Fase Eliminatoria

Si ya tenías la v1 desplegada, solo necesitas:

1. **Supabase**: Ejecutar el nuevo `supabase-schema.sql` (las tablas existentes se crean con `IF NOT EXISTS`, no borra datos)
2. **GitHub**: Subir los archivos actualizados con `git add . && git commit -m "v2 playoffs" && git push`
3. **Vercel**: Re-deploy automático en cuanto hagas push

### Nuevas funcionalidades v2:
- **🔥 Playoffs**: Bracket completo 16avos → Final con el calendario oficial del PDF
- **🎯 Mis Playoffs**: Participantes pronostican marcadores de cada partido eliminatorio
- **🏆 Campeón/Subcampeón/3er lugar**: Pronóstico con bonus 20/10/5 pts
- **Puntuación playoff**: 5 pts exacto, 3 pts resultado correcto
- **📧 Email**: Panel para redactar y enviar notificaciones a participantes
- **🔗 Links**: Links para compartir por fase
- **Acumulación de puntos**: Grupos + Playoffs + Bonus en una sola tabla
- Clasificados reducidos de 5 a **3 puntos** c/u
- **Eliminación de horarios** de los partidos (solo fecha)
