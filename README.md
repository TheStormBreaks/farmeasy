# FarmEasy Connect

This is a Next.js application connecting KVK centers, Farmers, and Suppliers. It facilitates communication, product management, and training program coordination.

## Prerequisites

Before you begin, ensure you have the following installed:

*   **Node.js:** Version 18.x or later (Download from [https://nodejs.org/](https://nodejs.org/))
*   **npm** or **yarn:** Comes bundled with Node.js or install yarn via `npm install -g yarn`
*   **Visual Studio Code (VS Code):** (Download from [https://code.visualstudio.com/](https://code.visualstudio.com/))
*   **Firebase Project:** You need a Firebase project set up. ([https://firebase.google.com/](https://firebase.google.com/))

## Setup Instructions

1.  **Clone the Repository:**
    Open your terminal or command prompt and run:
    ```bash
    git clone <repository_url> farm-easy-connect
    cd farm-easy-connect
    ```
    Replace `<repository_url>` with the actual URL of your Git repository. If you downloaded the code as a ZIP, extract it and navigate into the project folder.

2.  **Open in VS Code:**
    Open the `farm-easy-connect` folder in Visual Studio Code:
    ```bash
    code .
    ```

3.  **Install Dependencies:**
    Open the integrated terminal in VS Code (View > Terminal) and run:
    ```bash
    npm install
    ```
    or if you prefer yarn:
    ```bash
    yarn install
    ```

4.  **Firebase Configuration:**
    *   Create a new file named `.env.local` in the root directory of the project.
    *   Go to your Firebase project settings:
        *   Project Settings > General > Your apps > Web app.
        *   Find your web app configuration (it will look similar to the `firebaseConfig` object in `src/lib/firebase.ts`).
    *   Add the following environment variables to your `.env.local` file, replacing the placeholder values with your actual Firebase project credentials:

        ```dotenv
        NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
        NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
        NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID

        # Optional: Add Google Generative AI API Key if using Genkit features
        # GOOGLE_GENAI_API_KEY=YOUR_GOOGLE_GENAI_API_KEY
        ```

    *   **Important:** Ensure you have enabled Firestore in your Firebase project (Native mode is recommended).

## Running the Development Server

1.  **Start the Next.js App:**
    In the VS Code terminal, run:
    ```bash
    npm run dev
    ```
    or
    ```bash
    yarn dev
    ```
    This will start the development server, typically on `http://localhost:9002`.

2.  **Open the App:**
    Open your web browser and navigate to `http://localhost:9002`.

## Running Genkit (Optional)

If the project utilizes Google Generative AI features via Genkit:

1.  **Ensure API Key is Set:** Make sure `GOOGLE_GENAI_API_KEY` is set in your `.env.local` file.
2.  **Start Genkit Dev Server:**
    Open a *separate* terminal window in VS Code and run:
    ```bash
    npm run genkit:dev
    ```
    or
    ```bash
    yarn genkit:dev
    ```
    This starts the Genkit development UI, usually on `http://localhost:4000`.

## Building for Production

To create an optimized production build:

```bash
npm run build
```

or

```bash
yarn build
```

After building, you can start the production server:

```bash
npm start
```

or

```bash
yarn start
```

This will typically run the app on `http://localhost:3000` (the default Next.js production port).
