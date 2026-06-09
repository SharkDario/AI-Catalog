# AI Catalog - Plataforma Inclusiva

Bienvenido a **AI Catalog**, una plataforma web moderna e inclusiva diseñada para la búsqueda y gestión de información con un fuerte enfoque en la accesibilidad. Esta aplicación está desarrollada para permitir a todos los usuarios, independientemente de sus capacidades, interactuar de manera fluida y efectiva con el sistema.

## 🚀 Tecnologías Utilizadas

Este proyecto fue construido utilizando un stack tecnológico moderno, asegurando alto rendimiento, escalabilidad y una excelente experiencia de usuario:

- **Frontend & Backend**: [Next.js](https://nextjs.org/) (App Router) con **React**.
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/) para un desarrollo seguro y tipado.
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/) para un diseño responsivo, rápido y hermoso.
- **Base de Datos & ORM**: [Drizzle ORM](https://orm.drizzle.team/) para interactuar con la base de datos de manera eficiente y con tipado estricto.
- **Inteligencia Artificial**: Integración con el modelo local **LLaMA 3.2:3b** para procesamiento de lenguaje natural y consultas a la base de datos.
- **Autenticación**: [Clerk](https://clerk.com/) para una gestión segura y moderna de usuarios.
- **Accesibilidad & Machine Learning**: 
  - [TensorFlow.js](https://www.tensorflow.org/js) (MediaPipe Handpose) para reconocimiento de Lengua de Señas Argentina (LSA).
  - Reconocimiento de voz nativo (Web Speech API).
  - Herramientas de Eye Tracking (Seguimiento Ocular).
- **Gestor de Paquetes**: [pnpm](https://pnpm.io/) para una instalación de dependencias rápida y eficiente en espacio.

## 🌟 Funcionalidades Principales

La aplicación está dividida en varias secciones, cada una diseñada para cumplir un rol específico:

### 1. Búsqueda y Catálogo (`/catalog`)
- Muestra una lista de elementos (catálogo) con filtros avanzados.
- Vistas detalladas para cada elemento del catálogo.

### 2. Panel de Administración (`/admin`)
- Interfaz protegida para gestionar el contenido del catálogo.
- Permite crear, editar y eliminar elementos directamente desde la web.

### 3. Foro de Comunidad (`/forum`)
- Espacio para que los usuarios interactúen, hagan preguntas y compartan información.

### 4. Herramientas de Accesibilidad (El núcleo del proyecto)
Esta aplicación destaca por sus innovadoras herramientas de accesibilidad:
- **Asistente de Búsqueda por Voz (`/voice-search`)**: Permite a los usuarios navegar y buscar contenido simplemente hablando.
- **Reconocimiento de Lengua de Señas (LSA)**: Un módulo (`SignSearch.tsx`) que utiliza la cámara web para leer e interpretar gestos de la Lengua de Señas Argentina, permitiendo introducir texto "deletreando" en el aire.
- **Eye Tracking**: Un módulo (`useEyeTracking.tsx`) diseñado para ayudar a navegar la interfaz utilizando el movimiento de los ojos.

### 5. Integración con Inteligencia Artificial
- **Asistente Inteligente Local (LLaMA 3.2:3b)**: La plataforma integra un modelo de inteligencia artificial que tiene como contexto toda la información de la base de datos de la página. Cuando un usuario realiza una consulta o pregunta —**ya sea utilizando su voz o mediante la lectura de Lengua de Señas (LSA)**— el modelo procesa la petición, razona sobre el contenido del catálogo y le devuelve al usuario una respuesta conversacional junto con **sugerencias y enlaces directos** para navegar rápidamente a las secciones relevantes de la web.

## 🛠️ Cómo Ejecutar el Proyecto Localmente

Para correr este proyecto en tu máquina local en modo desarrollo, sigue estos pasos:

### Prerrequisitos
- Node.js (versión 18 o superior recomendada).
- `pnpm` instalado (`npm install -g pnpm`).
- Tus variables de entorno configuradas (crea un archivo `.env.local` basado en tus credenciales de Clerk y la base de datos).

### Pasos de instalación

1. **Clonar e instalar dependencias:**
   ```bash
   # Navega a la carpeta del proyecto
   cd ai-catalog
   
   # Instala las dependencias
   pnpm install
   ```

2. **Configurar la base de datos (Opcional si ya está viva en la nube):**
   ```bash
   pnpm db:push # O el comando configurado en Drizzle para sincronizar esquemas
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   pnpm dev
   ```

4. **Ver la aplicación:**
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la página.

## 🐳 Ejecutar con Docker

Si prefieres aislar el entorno de ejecución, puedes utilizar Docker. El proyecto ya incluye el `Dockerfile` necesario.

### Pasos con Docker

1. **Construir la imagen de Docker:**
   Asegúrate de estar en el directorio raíz del proyecto (donde está el `Dockerfile`) y ejecuta:
   ```bash
   docker build -t ai-catalog-app .
   ```

2. **Ejecutar el contenedor:**
   Una vez construida la imagen, puedes levantar un contenedor. Recuerda pasar las variables de entorno necesarias (puedes usar un archivo `.env` o pasarlas con la flag `-e`):
   ```bash
   docker run -p 3000:3000 --env-file .env.local ai-catalog-app
   ```

3. **Acceder:**
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador. El servidor estará corriendo dentro del contenedor.
