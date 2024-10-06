# InkSpire

This project is a blogging platform like Medium, built with React, Tailwind CSS, Hono for serverless backend, TypeScript, a custom npm package, Prisma as the ORM, PostgreSQL as the database, and `acclerate` for connection pooling.

## Features

- **React Frontend**: Utilizes React for building a dynamic and responsive user interface.
- **Tailwind CSS**: Provides utility-first styling for rapid UI development and easy customization.
- **Hono Serverless Backend**: Offers scalable backend services, reducing the overhead of server management.
- **TypeScript**: Enhances code quality and maintainability with static typing.
- **Custom npm Package**: Includes custom functionalities packaged for ease of use and reusability.
- **Prisma ORM**: Simplifies database interactions and ensures type safety.
- **PostgreSQL Database**: Reliable and feature-rich database management system for data storage.
- **acclerate for Connection Pooling**: Manages database connections efficiently to improve performance and scalability.

## Demo

The project is hosted on Vercel. You can access it [here](https://ajsmedium.vercel.app/).

## Getting Started

### Prerequisites

- Node.js
- npm or Yarn
- PostgreSQL database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/medium-clone.git
   
2. Run npm install for both backend and frontend
   ```bash
   cd backend
   npm install
3.
   ```bash
   cd ../frontend
   npm install

4. Create a database and configure the connection in the .env file.  
5. Add your acelerate url to wrangler.toml
6. Add JWT_SECRET
7. npx prisma migrate dev
8. npm run dev

Contributions are welcome! Feel free to open an issue or submit a pull request for new features, bug fixes, or improvements.
