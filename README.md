## Getting Started

### Prerequisites

Before you begin, ensure you have installed the following:
- [Node.js](https://nodejs.org/) (LTS version recommended)
- [Yarn](https://yarnpkg.com/) (version 1.22.19 as specified)
- A supported database for Prisma (e.g., PostgreSQL, MySQL, SQLite)

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/jake-rasmussen/patterson-park-music.git
   cd patterson-park-music
   ```

2. **Install Dependencies**

   ```bash
   yarn install
   ```

3. **Configure Environment Variables**

   Create a `.env` file in the project root and add your configuration details. For example:

   ```env
  HOST_PORT=
  NODE_ENV=

  DATABASE_URL=
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_API_KEY=
  
  TWILIO_ACCOUNT_SID=
  TWILIO_AUTH_TOKEN=
  TWILIO_PHONE_NUMBER=

  SENDGRID_API_KEY=
  SENDGRID_SENDER_EMAIL=
   ```

---

## Database Setup

### Prisma Commands

- **Generate Prisma Client**

  ```bash
  yarn db:generate
  ```

- **Apply Migrations**

  ```bash
  yarn db:migrate
  ```

- **Push Schema Changes (without migrations)**

  ```bash
  yarn db:push
  ```

- **Open Prisma Studio**

  ```bash
  yarn db:studio
  ```

---

## Running the Application

### Development Mode

Start your development server:

```bash
yarn dev
```

### Production Build

Build the application for production and start the server:

```bash
yarn build
yarn start
```

### Additional Scripts

- **ngrok**: Expose your local server to the internet.

  ```bash
  yarn ngrok
  ```

- **Migration Seed**: Execute the custom migration seed script.

  ```bash
  yarn migrate
  ```