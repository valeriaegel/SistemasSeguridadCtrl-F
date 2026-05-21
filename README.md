# Secure Campus IA 🎓🤖

Bienvenido al repositorio de **Secure Campus IA**. Este proyecto es una aplicación web moderna desarrollada con Next.js que implementa una interfaz de chat con Inteligencia Artificial.

Está diseñada con un enfoque _mobile-first_ para que se sienta como una aplicación nativa (sin scroll global, solo en el área de mensajes) y cuenta con un diseño limpio utilizando Tailwind CSS.

---

## 🚀 Cómo empezar (Guía rápida)

### Requisitos previos
Asegúrate de tener instalado en tu computadora:
- Node.js (Se recomienda la versión 18 o superior).

### Instalación y ejecución

1. **Instala las dependencias** del proyecto. Abre tu terminal en la carpeta raíz del proyecto y ejecuta:
```bash
   npm install
```

2. **Configura las variables de entorno.** Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:
```env
   API_KEY=tu_api_key_de_groq
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=tu_clave_publica_de_clerk
   CLERK_SECRET_KEY=tu_clave_secreta_de_clerk
```

3. **Inicia el servidor de desarrollo** localmente:
```bash
   npm run dev
```

4. **Abre la aplicación:** Ve a tu navegador y entra a http://localhost:3000.

---

## 🛠️ Tecnologías Principales

- **Next.js (App Router):** El framework de React que usamos tanto para el frontend como para las rutas de API (backend ligero).
- **React:** Para construir la interfaz de usuario.
- **Tailwind CSS:** Para los estilos rápidos, responsivos y el soporte de "Modo Oscuro".
- **Zustand:** Para manejar el estado global de la aplicación (como guardar el historial de la conversación).
- **Clerk:** Para la autenticación y autorización de usuarios mediante OIDC/OAuth.
- **Groq SDK:** Para la integración con el modelo de lenguaje `llama-3.1-8b-instant`.

---

## 🔐 Medidas de Seguridad Implementadas

### Fase I — Hardening de API & Entorno

- **Variables de entorno:** La API Key de Groq nunca está expuesta en el repositorio ni viaja al frontend. Se gestiona exclusivamente desde `.env.local` y se accede únicamente desde el servidor.
- **Autenticación con Clerk (OIDC):** Todas las rutas de la aplicación están protegidas. Solo los usuarios autenticados pueden acceder al chat.
- **Autorización por roles (OAuth):** Se implementó un sistema de permisos basado en roles (`UserRole`). El acceso al chat requiere el permiso `CHAT_AI_BASIC`, que se verifica en cada request antes de procesar el mensaje.

### Fase II — Configuración WAF Rules

- Se implementaron reglas de Firewall en Vercel para proteger la aplicación contra tráfico malicioso, limitación de requests y bloqueo de rutas sensibles.

### Fase III — Prevención de Prompt Injection

Se diseñó e implementó un sistema de defensa en tres capas dentro de `AddMessageHandler.ts`:

**Capa 1 — Validación estática de input**
Antes de realizar cualquier llamada a la IA, el mensaje del usuario es analizado mediante:
- Verificación de longitud máxima (2000 caracteres).
- Detección de patrones conocidos de ataque mediante expresiones regulares (frases como "ignorá las instrucciones", "act as", "jailbreak", etc.) en español e inglés.

**Capa 2 — LLM Juez**
Si el mensaje supera la capa 1, se realiza una segunda llamada al modelo con el rol de sistema de seguridad. Analiza semánticamente el mensaje y devuelve un JSON indicando si es seguro o no. Se configura con `temperature: 0` para máximo determinismo.

**Capa 3 — LLM Principal con System Prompt restrictivo**
Solo si el mensaje pasa las dos capas anteriores, se llama al modelo principal. Este cuenta con un System Prompt que:
- Limita las respuestas exclusivamente a temas académicos universitarios.
- Instruye al modelo a ignorar cualquier intento de modificar su rol o comportamiento.
- Impide la revelación de instrucciones internas.

---

## 📂 Estructura clave del proyecto

- 🖥️ `app/page.tsx`: Pantalla principal con el diseño del chat.
- ⚙️ `app/api/chat/route.ts`: Backend del chat. Verifica autenticación y autorización antes de procesar cada mensaje.
- 🔒 `app/lib/roles.ts`: Define los roles y permisos del sistema de autorización.
- 🧠 `application/command/AddMessageHandler.ts`: Contiene toda la lógica de seguridad contra Prompt Injection y la integración con Groq.
- 🧠 `app/store/conversation.ts`: Memoria de la conversación actual con Zustand.
- 🪝 `app/hooks/useConversation.ts`: Conecta la interfaz gráfica con la API.

>