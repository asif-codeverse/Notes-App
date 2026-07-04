# Notes Application - Engineering Documentation

This document serves as the comprehensive internal engineering documentation for the Notes Application. It details architectural decisions, data flow, component structures, and system security to onboard new developers and maintain a clear understanding of the codebase.

---

## 🏗️ Project Architecture

The application is built on the **MERN Stack** (MongoDB, Express, React, Node.js). It adheres to a decoupled client-server architecture:

1. **Client (React + Vite):** A Single Page Application (SPA) responsible for presentation, client-side routing, and local state management. It communicates with the backend exclusively via RESTful JSON APIs.
2. **Server (Express + Node.js):** A stateless API layer that handles request routing, business logic, authentication, and database interactions.
3. **Database (MongoDB):** A NoSQL document database used to persistently store user profiles and note entries.

The system is designed to be fully stateless on the backend. Sessions are managed via JSON Web Tokens (JWT) stored on the client.

---

## 📁 Folder Structure Explained

### `backend/`
* `config/db.js`: Contains the MongoDB connection logic using Mongoose.
* `middleware/auth.js`: The guardian of protected routes. Intercepts incoming requests, extracts the JWT, verifies it against the secret, and attaches the resolved `User` object to the request.
* `models/`: Contains Mongoose schemas.
  * `User.js`: Defines the schema for users and includes pre-save hooks for bcrypt password hashing.
  * `Note.js`: Defines the structure of a note, mapping it to the user who created it via an ObjectId reference.
* `routes/`: Defines the API endpoints.
  * `auth.js`: Handles `/register`, `/login`, and `/me`.
  * `notes.js`: Handles full CRUD operations mapping to `/api/notes`.
* `server.js`: The application entry point. Bootstraps Express, sets up middleware (`express.json()`), mounts route handlers, connects to the DB, and handles production static file serving.

### `frontend/src/`
* `components/`: Modular React components.
  * `App.jsx`: The root component housing React Router logic and global state (`user`).
  * `Home.jsx`: The primary dashboard where users view, create, and manage their notes.
  * `Login.jsx` & `Register.jsx`: Authentication interfaces.
  * `Navbar.jsx`: Global navigation and logout controls.
  * `NoteModal.jsx`: A reusable modal component for creating and editing notes.
  * `ThemeContext.jsx`: React Context provider for managing Light/Dark mode state globally.

---

## 🔄 Request Lifecycle

When a user interacts with the application, data flows in a specific lifecycle. 

**Example: Creating a Note**
1. **Browser (User Action):** The user fills out the Note Modal and clicks "Save".
2. **React (State/API Call):** The `Home.jsx` component captures the form state and triggers an Axios `POST` request to `/api/notes`.
3. **Axios (Network):** Axios automatically attaches the JWT from `localStorage` into the `Authorization: Bearer <token>` header.
4. **Express (Routing):** `server.js` receives the request at `/api/notes` and forwards it to `notesRoutes`.
5. **Middleware (Auth):** The `protect` middleware inside `auth.js` intercepts the request. It decodes the JWT, finds the user in MongoDB, and attaches it to `req.user`.
6. **Controller (Logic):** The specific `POST /` route handler extracts `title` and `description` from `req.body`, creates a new `Note` document in MongoDB, explicitly setting `createdBy: req.user._id`.
7. **MongoDB (Storage):** The document is saved persistently.
8. **Response (Network):** The backend returns the newly created note object as JSON with a `201 Created` status.
9. **React UI Update:** `Home.jsx` receives the response, updates its local `notes` array state, and React re-renders the UI to display the new note instantly.

---

## 🔐 Authentication & JWT Lifecycle

Authentication is built around stateless JWTs to ensure scalability and security.

### JWT Lifecycle
1. **Generation:** Upon successful registration or login in `backend/routes/auth.js`, `generateToken(user._id)` is called. It signs the user's ID with `process.env.JWT_SECRET` and sets an expiration of `30d`.
2. **Transmission:** The token is returned to the client in the JSON response payload.
3. **Storage:** The frontend explicitly stores this token in browser `localStorage` as `token`.
4. **Subsequent Usage:** On every subsequent protected request (e.g., fetching notes), the frontend manually reads `localStorage.getItem("token")` and attaches it to the HTTP headers.
5. **Verification:** The backend `protect` middleware uses `jwt.verify()` to validate the token's signature and expiration.
6. **Logout:** Logout is handled entirely on the client side by executing `localStorage.removeItem("token")` and clearing the React `user` state, effectively destroying the session.

---

## 🗄️ Database Schema

### `User` Model
* `username`: String, required, unique.
* `email`: String, required, unique, converted to lowercase for consistency.
* `password`: String, required. Hashed before saving using `bcrypt.genSalt(10)`.

### `Note` Model
* `title`: String, required. The header of the note.
* `description`: String, required. The body of the note.
* `createdBy`: ObjectId, required. A foreign key referencing the `User` model. This is critical for data isolation.

*Both models automatically generate `createdAt` and `updatedAt` timestamps via `{ timestamps: true }`.*

---

## 🖥️ Frontend Architecture

* **State Flow:** Global user state (`user`, `setUser`) is lifted to `App.jsx` and passed down to child components (`Navbar`, `Login`, `Register`) via props. Notes data is localized to `Home.jsx` as it is the only page that requires it.
* **Routing:** Handled by `react-router-dom`. Protected routes are enforced using ternary operators in `App.jsx` (`element={user ? <Home /> : <Navigate to="/login" />}`).
* **Theme System:** Implemented via a Context API (`ThemeContext.jsx`) allowing deep components to access and toggle theme variables without prop drilling.

---

## ⚙️ Backend Architecture

* **Configuration:** Environment variables are loaded via `dotenv`. Database connection strings and secrets are abstracted out of the source code.
* **Routing Strategy:** Routes are logically grouped by resource (`users` and `notes`) and mounted in `server.js` (`app.use("/api/users", authRoutes)`).
* **Static Serving:** In production (`NODE_ENV === "production"`), Express serves the compiled Vite `dist` directory and uses a wildcard route (`app.get("/{*splat}")`) to allow React Router to handle client-side pathing.

---

## 🔌 API Reference

### Authentication (`/api/users`)
* `POST /register`: Accepts `{ username, email, password }`. Returns User object + JWT.
* `POST /login`: Accepts `{ email, password }`. Returns User object + JWT.
* `GET /me`: Requires Auth. Returns current User object.

### Notes (`/api/notes`)
* `GET /`: Requires Auth. Returns array of notes where `createdBy == req.user._id`.
* `POST /`: Requires Auth. Accepts `{ title, description }`. Creates a note.
* `GET /:id`: Requires Auth. Returns a single note, verifying ownership.
* `PUT /:id`: Requires Auth. Accepts `{ title, description }`. Updates note, verifying ownership.
* `DELETE /:id`: Requires Auth. Deletes a note, verifying ownership.

---

## 🧩 Component Breakdown

* **`App.jsx`**: The orchestrator. Handles initial authentication checking on mount (fetching `/api/users/me` if a token exists in local storage). Renders the Navbar and routing logic.
* **`Navbar.jsx`**: Displays branding, user info (if logged in), and a Logout button.
* **`Home.jsx`**: The core application view. Fetches notes on mount. Renders the list of notes. Controls the state and visibility of the `NoteModal`.
* **`NoteModal.jsx`**: A controlled form component. Can function in "Create" or "Edit" mode depending on the props passed down from `Home.jsx`.
* **`Login.jsx` & `Register.jsx`**: Unauthenticated views handling form state, input validation, and API submission for auth.

---

## 💡 Design Decisions

* **JWT vs Sessions:** JWT was chosen for statelessness, making the backend easier to scale and reducing database overhead (no session lookups required per request).
* **Vite over CRA:** Vite was selected for significantly faster cold starts and Hot Module Replacement (HMR).
* **Tailwind CSS:** Selected for rapid UI prototyping directly within JSX, eliminating the need for context-switching between CSS files and JS files.

---

## 🛡️ Security Considerations

* **Data Isolation (Authorization):** Crucially, the backend does not just look at the note ID when updating/deleting. It verifies that `note.createdBy.toString() === req.user._id.toString()`. This prevents a malicious user from modifying another user's note via API spoofing.
* **Password Hashing:** Storing plaintext passwords is a critical vulnerability. The `User.js` model utilizes Mongoose middleware (`pre('save')`) to ensure passwords are automatically hashed with bcrypt before they ever hit the database.
* **CORS & Proxying:** During development, CORS issues are avoided by using Vite's internal proxy to route `/api` requests to the backend server.

---

## 📈 Performance Notes

* **Current Status:** The application is highly performant for a small to medium user base. React state updates are localized where possible to prevent unnecessary re-renders.
* **Database Indexing:** Currently, MongoDB relies on the default `_id` index. As the database grows, adding an index on the `Note` model's `createdBy` field will be necessary to keep `GET /api/notes` fast.

---

## 🔮 Future Improvements

1. **Token Refresh Rotation:** Implement short-lived access tokens (e.g., 15 mins) and long-lived HTTP-only refresh tokens to enhance session security.
2. **React Query:** Replace standard `useEffect`/`useState` data fetching in `Home.jsx` with `@tanstack/react-query` for automatic caching, background refetching, and simplified loading states.
3. **Pagination:** Implement pagination on the `GET /api/notes` endpoint to ensure fast load times when a user accumulates hundreds of notes.

---

## ⚠️ Known Limitations

* **Local Storage Vulnerability:** Storing JWTs in `localStorage` makes them accessible via JavaScript, leaving the app potentially vulnerable to Cross-Site Scripting (XSS) attacks. Moving to HTTP-only cookies is recommended for high-security environments.
* **Missing Password Reset:** There is currently no flow for users who have forgotten their passwords.

---

## 🎓 Learning Outcomes

This project successfully demonstrates mastery over:
* Building robust REST APIs using Node.js and Express.
* Implementing secure, stateless authentication and authorization flows with JWT and bcrypt.
* Interfacing a Node application with MongoDB via the Mongoose ODM.
* Building modern, responsive single-page applications using React 19.
* Managing complex application state and routing on the client side.
* Integrating and configuring Tailwind CSS v4 in a Vite environment.