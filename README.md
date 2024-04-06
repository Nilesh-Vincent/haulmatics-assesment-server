# Project Setup Guide

This project is a NestJS authentication and authorization system using JWT with refresh tokens and role-based actions, along with other features.

## Setup Instructions

1. **Clone the Repository**

    ```bash
    git clone <repository_url>
    ```

2. **Navigate to the Project Directory**

    ```bash
    cd <project_directory>
    ```

3. **Build and Start Docker Compose**

    ```bash
    docker-compose up --build
    ```

4. **Install PNPM Globally (if not already installed)**

    ```bash
    npm install -g pnpm
    ```

5. **Install Project Dependencies**

    ```bash
    pnpm install
    ```

6. **Run in Development Mode**

    ```bash
    pnpm run start:dev
    ```

    OR

7. **Run in Production Mode**

    ```bash
    pnpm run start:prod
    ```

## Additional Information

- **Environment Variables**: All environment files are included in the project repository. There is no harmful personal data contained within.

- **API Documentation**: View the API documentation using Swagger at `localhost:5001/api`.

- **Improvements**: While there are many areas for improvement within the API, the current implementation is deemed satisfactory for this assessment.

## Contact

If you encounter any issues or require clarification, please feel free to reach out.
