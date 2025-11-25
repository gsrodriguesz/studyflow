# StudyFlow

StudyFlow is a comprehensive, AI-powered study companion designed to help students organize their learning, stay focused, and track their progress. It combines productivity tools with gamification elements to make studying more engaging and effective.

## 🚀 Features

-   **Dashboard**: Overview of your study progress, streaks, and upcoming tasks.
-   **Deep Focus Mode**: A Pomodoro-style timer with a "Forest" gamification element. Grow trees while you focus! Includes an overlay mode to keep the timer visible while you navigate the app.
-   **Notes System**: Create and organize study notes.
-   **Planning & Calendar**: Schedule your study sessions and keep track of important dates.
-   **Progress Tracking**: Visualize your learning journey with charts and statistics.
-   **Simulations & Exams**: Manage and track your exam results and simulations.
-   **Gamification**: Earn XP, coins, and level up as you study. Maintain your daily streak to stay motivated.
-   **Customization**: Personalize your experience with dark/light themes and custom accent colors.
-   **Authentication**: Secure login with Google via Firebase Authentication.

## 🛠️ Tech Stack

-   **Frontend**: [React](https://react.dev/) (v19) with [TypeScript](https://www.typescriptlang.org/)
-   **Build Tool**: [Vite](https://vitejs.dev/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Backend / Services**:
    -   [Firebase Authentication](https://firebase.google.com/docs/auth) (Google Sign-In)
    -   [Firebase Firestore](https://firebase.google.com/docs/firestore) (Database)
-   **AI Integration**: [Google Generative AI](https://ai.google.dev/) (Gemini)

## 📦 Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/gsrodriguesz/studyflow.git
    cd studyflow
    ```

2.  **Install dependencies**

    ```bash
    npm install
    ```

3.  **Environment Setup**

    Create a `.env` file in the root directory and add your Firebase configuration keys:

    ```env
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
    VITE_FIREBASE_APP_ID=your_app_id
    ```

4.  **Run the development server**

    ```bash
    npm run dev
    ```

    The application will be available at `http://localhost:5173`.

## 🏗️ Project Structure

```
src/
├── assets/         # Static assets
├── components/     # Reusable UI components (Timer, Sidebar, etc.)
├── context/        # React Contexts (Auth, Theme, Gamification, Focus)
├── layouts/        # Layout components (AppLayout)
├── pages/          # Application pages (Dashboard, Login, Settings, etc.)
├── services/       # External services (Firebase, AI)
├── App.tsx         # Main application component with routing
└── main.tsx        # Entry point
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
