# 🌸 NinaFlowers

Sistema web integral para la gestión y venta de flores y arreglos florales. Permite administrar catálogo, inventario, pedidos, pagos y entregas, ofreciendo interfaces diferenciadas para clientes y administradores.

Proyecto académico desarrollado bajo el stack **MERN** (MongoDB, Express.js, React.js, Node.js).

---

## 📋 Tabla de contenidos

- [Descripción general](#-descripción-general)
- [Roles del sistema](#-roles-del-sistema)
- [Tecnologías utilizadas](#-tecnologías-utilizadas)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Requisitos previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Variables de entorno](#-variables-de-entorno)
- [Ejecución del proyecto](#-ejecución-del-proyecto)
- [Autores](#-autores)

---

## 📖 Descripción general

**NinaFlowers** es una plataforma web que digitaliza la operación de una florería, permitiendo:

- Consultar y comprar productos en línea.
- Gestionar el catálogo, inventario y proveedores.
- Administrar pedidos, pagos y entregas.
- Realizar seguimiento del estado de cada pedido.

---

## 👥 Roles del sistema

| Rol | Funcionalidades principales |
|---|---|
| **Cliente** | Registro/login, catálogo, búsqueda, carrito y pedidos |
| **Administrador** | Gestión de usuarios, productos, categorías, inventario, pedidos, pagos y envíos |

> La coordinación de entregas con el personal de reparto es gestionada directamente por el administrador desde el panel de control.

---

## 🛠 Tecnologías utilizadas

**Frontend / Admin**
- React.js (Vite)
- React Router DOM
- JavaScript (ES6+)
- HTML5 / CSS3

**Backend**
- Node.js
- Express.js
- Mongoose (ODM para MongoDB)
- JWT (`jsonwebtoken`) — autenticación
- Bcrypt — encriptación de contraseñas
- Cors — control de acceso entre orígenes
- Dotenv — variables de entorno
- Multer — carga de archivos/imágenes
- Stripe — procesamiento de pagos
- Validator — validación de datos
- Nodemon — reinicio automático en desarrollo

**Base de datos**
- MongoDB Atlas

**Herramientas**
- Visual Studio Code
- Git & GitHub
- Postman

---

## 📁 Estructura del proyecto

El proyecto está dividido en tres aplicaciones independientes:

```
NinaFlowers/
├── Backend/     # API REST (Node.js + Express)
├── Frontend/    # Aplicación del cliente (React)
└── Admin/       # Panel administrativo (React)
```

Cada carpeta cuenta con su propio `package.json` y `.gitignore`.

---

## ✅ Requisitos previos

Antes de instalar el proyecto, asegúrate de contar con:

- [Node.js](https://nodejs.org/) v18 o superior
- npm o yarn
- Cuenta activa en [MongoDB Atlas](https://www.mongodb.com/atlas)
- Cuenta de [Stripe](https://stripe.com/) (modo de pruebas) para el procesamiento de pagos
- Git

---

## ⚙️ Instalación

Clona el repositorio:

```bash
git clone https://github.com/Steven-aCr/ninaflowers-mern.git
cd NinaFlowers
```

Instala las dependencias de cada aplicación:

```bash
# Backend
cd Backend
npm install

# Frontend (Cliente)
cd ../Frontend
npm install

# Admin
cd ../Admin
npm install
```

> Las aplicaciones **Frontend** y **Admin** fueron creadas con `npm create vite@latest .` y utilizan `react-router-dom` para el manejo de rutas.

---

## 🔐 Variables de entorno

Dentro de la carpeta `Backend/`, crea un archivo `.env` (no incluido en el repositorio) con las siguientes variables:

```
PORT=3000
MONGODB_URI=tu_cadena_de_conexion
JWT_SECRET=tu_clave_secreta
STRIPE_SECRET_KEY=tu_clave_de_stripe
```

> ⚠️ Este archivo **nunca** debe subirse a GitHub. Ya se encuentra excluido mediante `.gitignore`.

---

## ▶️ Ejecución del proyecto

**Backend** (disponible en `http://localhost:3000`)

```bash
cd Backend
npm run server
```

**Frontend (Cliente)**

```bash
cd Frontend
npm run dev
```

**Admin**

```bash
cd Admin
npm run dev
```

---

## 👤 Autores

Steven Campos https://github.com/Steven-aCr. 
Jency Franco https://github.com/JLiz23.

---

## 📄 Licencia

Este proyecto tiene fines educativos.