# ticket_2025_bun_vue_daisyui

This project is a frontend application built with Bun, Vue 3, Pinia, and DaisyUI, designed to manage and display ticket orders, user profile information, and match details.

## Features

-   **User Authentication:** Login and logout functionality using Pinia for state management.
-   **User Profile Management:** View and edit user details such as name, phone, and email. Includes a test email sending feature.
-   **Current Orders:** View orders for the current match. Fetches the current match ID automatically and displays orders using a shared `OrderList` component.
-   **Historical Orders:** View orders for past matches. Fetches a list of historical matches, allows the user to select a match from a list, and then displays orders for the selected match using the shared `OrderList` component.
-   **Reusable Order List Component:** Common logic for fetching and displaying orders is abstracted into the `OrderList.vue` component, improving code reusability.
-   **Type Safety:** Uses TypeScript for better code structure and preventing runtime errors, including shared interface definitions like `Match`.
-   **UI Framework:** Utilizes DaisyUI component library with Tailwind CSS for styling.

## Technology Stack

-   **Build Tool & Runtime:** Bun
-   **Frontend Framework:** Vue 3 (with `<script setup>`)
-   **State Management:** Pinia
-   **Styling:** Tailwind CSS + DaisyUI
-   **Language:** TypeScript
-   **Routing:** Vue Router

## Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd ticket_2025_bun_vue_daisyui
    ```
2.  **Install dependencies using Bun:**
    ```bash
    bun install
    ```

## Configuration

Create a `.env` file in the project root directory based on the `.env.example` file.

```env
VITE_API_BASE_URL=your_backend_api_base_url
```

Replace `your_backend_api_base_url` with the actual URL of your backend API.

## Running the Project

1.  **Start the development server:**
    ```bash
    bun run dev
    ```
2.  The application will be served at the address shown in your terminal (e.g., `http://localhost:5173`). Open this address in your web browser.

## Project Structure (Key Files)

-   `src/main.ts`: Entry point of the application.
-   `src/router/index.ts`: Vue Router configuration.
-   `src/stores/auth.ts`: Pinia store for authentication state and actions (login, logout).
-   `src/views/MyView.vue`: User profile view with edit and logout functionality.
-   `src/views/orders/CurrentOrdersView.vue`: View for displaying current match orders. Fetches current match ID and uses `OrderList`.
-   `src/views/orders/OrderHistoryView.vue`: View for displaying historical orders. Fetches match list, allows selection, and uses `OrderList`.
-   `src/components/orders/OrderList.vue`: Reusable component for fetching and displaying orders based on a `matchId` prop.
-   `src/types/match.ts`: TypeScript interface definition for the `Match` object.
-   `src/App.vue`: Main application component.

## Contributing

Please follow the standard fork and pull request workflow.

## License

[Specify your license here, e.g., MIT]