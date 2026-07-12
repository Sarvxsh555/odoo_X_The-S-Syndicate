# 🛡️ AssetFlow

AssetFlow is a modern, enterprise-grade Asset Management and Booking Platform. It enables organizations to track the lifecycle of assets, manage employee allocations, book shared resources (e.g., meeting rooms, vehicles, projectors), handle maintenance requests, and coordinate audits.

---

## 🏗️ Architecture & Technology Stack

The application is split into a client-server architecture:

### Backend (`/assetflow-api`)
* **Core Framework:** Spring Boot 3.4.1 (Java 21/24)
* **Database Access:** Spring Data JPA + Hibernate ORM
* **Database Migrations:** Flyway DB Migrations
* **Database Engine:** PostgreSQL 16
* **Security:** Spring Security (Token-based Auth)
* **Build System:** Maven

### Frontend (`/assetflow-ui`)
* **Core Library:** React 18+
* **Build Tooling:** Vite (fast development server & hot-reloads)
* **Styling:** Tailwind CSS + custom premium styling presets
* **Routing & Client State:** React Router DOM + Axios HTTP Interceptors

---

## 🛠️ Getting Started & Running Locally

Follow these steps to set up and run the entire stack on your local machine.

### Prerequisites
Make sure you have the following installed:
* **Docker & Docker Compose**
* **Java Development Kit (JDK 21 or higher)**
* **Maven 3.9+**
* **Node.js 18+ & npm**

---

### Step 1: Start the Database via Docker
The application relies on PostgreSQL running via Docker. 

1. Open a terminal at the root of the project.
2. Run the following command to start PostgreSQL and pgAdmin:
   ```bash
   docker compose up -d
   ```
   * **PostgreSQL Port:** `5433` (mapped from container `5432`)
   * **Database Name:** `assetflow_db`
   * **Credentials:** `assetflow_user` / `assetflow_pass`
   * **pgAdmin Panel:** Accessible at `http://localhost:5050` (Login: `admin@assetflow.com` / `admin123`)

---

### Step 2: Run the Backend API
1. Navigate to the backend directory:
   ```bash
   cd assetflow-api
   ```
2. Run a clean build and start the Spring Boot application:
   ```bash
   mvn clean spring-boot:run
   ```
   * **API Port:** `8080`
   * **Migrations:** Flyway automatically cleans and runs migration scripts on startup when active in the `dev` profile.

---

### Step 3: Run the Frontend UI
1. Navigate to the frontend directory:
   ```bash
   cd assetflow-ui
   ```
2. Install npm dependencies (if running for the first time):
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   * **UI Web Address:** Open [http://localhost:5173](http://localhost:5173) in your browser.
   * **API Proxying:** Vite automatically proxies `/api` endpoints to `http://localhost:8080`.

---

## 🔑 Default Credentials

For testing and development, the database is pre-seeded with the following admin account:
* **Email:** `admin@assetflow.com`
* **Password:** `Admin@123`
* **Role:** `ROLE_ADMIN`

---

## 🔄 Troubleshooting & Flyway Migrations
If you encounter Flyway migration schema failures or checksum mismatch warnings:
1. Ensure your PostgreSQL container is running.
2. Run a clean maven build:
   ```bash
   mvn clean spring-boot:run
   ```
   This wipes old cached migration targets and reapplies the updated schema.
