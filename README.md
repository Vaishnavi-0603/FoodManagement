# Food Saver Platform (Food Management System)

A comprehensive web application designed to bridge the gap between donors with surplus food (restaurants, grocery stores, hotels, and individuals) and local NGOs. The platform uses a network of volunteers to pick up and deliver donations safely, using QR-code hash verification for security and tracking.

---

## 🌟 Key Features

### 👥 User Roles & Dashboards
*   **Donors**: Create food donations, upload food images, track donation status, and view donation history.
*   **NGOs**: View available food donations in nearby locations, accept donations, assign volunteers for pick up and delivery, and view statistics.
*   **Volunteers**: Accept delivery/pickup tasks, navigate routes, and verify pickups/deliveries.
*   **Admins**: Comprehensive system administration, platform analytics, complaint management, and user oversight.

### 🔒 Core Modules
*   **JWT Authentication**: Secure registration and login for all four roles using JSON Web Tokens (JWT).
*   **QR-Code Verification**: Secure handshakes using unique QR hashes for picking up food from donors and delivering it to NGOs.
*   **Location-Based Matchmaking**: Recommends nearby available food donations to registered NGOs.
*   **Complaint & Support System**: Users can raise issues or complaints, which are investigated and resolved by the Administrator.
*   **Interactive Analytics**: Dashboards with visualizations of donation activities, impact stats, and volunteer contributions.

---

## 🛠️ Technology Stack

### Backend
*   **Language & Runtime**: Java 21
*   **Framework**: Spring Boot 3.x
*   **Security**: Spring Security (JWT-based token authentication)
*   **Persistence**: Spring Data JPA & Hibernate
*   **Database**: MySQL
*   **API Documentation**: Springdoc OpenAPI / Swagger UI
*   **Communication**: Spring Mail (SMTP integration for email alerts)

### Frontend
*   **Library/Runtime**: React.js with Vite
*   **Styling**: Custom CSS (Vanilla CSS design system)
*   **Routing**: React Router DOM
*   **HTTP Client**: Axios

---

## ⚙️ Configuration & Prerequisites

### 1. Database Setup
The backend requires a MySQL database.
*   Ensure MySQL server is running on `localhost:3306`.
*   Configure the database username and password in `backend/src/main/resources/application.properties` (Default is `username=root`, `password=root123`).
*   The database `food_donation_platform` will automatically be created on launch (`createDatabaseIfNotExist=true`).

### 2. Environment Configurations
Configure the email host and credentials inside [application.properties](file:///c:/Food%20Management/backend/src/main/resources/application.properties) if mail services are required:
```properties
spring.mail.username=your-gmail@gmail.com
spring.mail.password=your-app-password
```

---

## 🚀 How to Run

For convenience, startup script batch files are provided in the root directory:

### Running the Backend
1. Ensure Java JDK 21 is installed.
2. Run the [run_backend.cmd](file:///c:/Food%20Management/run_backend.cmd) file:
   ```cmd
   ./run_backend.cmd
   ```
   *Alternatively*, navigate to `backend` directory and run using Maven:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
3. The server starts at `http://localhost:8080`.

### Running the Frontend
1. Ensure Node.js is installed.
2. Run the [run_frontend.cmd](file:///c:/Food%20Management/run_frontend.cmd) file:
   ```cmd
   ./run_frontend.cmd
   ```
   *Alternatively*, install dependencies and start the dev server manually:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser.

---

## 📖 API Documentation

Once the backend server is running, you can explore, test, and view all API endpoints using Swagger UI:
👉 [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
