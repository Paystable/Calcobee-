# Calcobee

A web application for calculating printing and binding costs with an admin panel for configuration management.

## Features

- Cost calculation for printing and binding services
- Admin panel for managing configuration
- File conversion capabilities
- User authentication and authorization
- Responsive design

## Tech Stack

- Frontend: React.js
- Backend: Node.js with Express
- Database: File-based storage (config.json)
- Server: Nginx
- Process Manager: PM2

## Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)
- Nginx (for production)

## Project Structure

```
calcobee/
├── client/             # Main application frontend
├── admin/             # Admin panel frontend
├── server/            # Backend server
│   ├── routes/       # API routes
│   └── server.js     # Main server file
├── nginx.conf        # Nginx configuration
└── deploy.config.js  # PM2 deployment configuration
```

## Setup Instructions

### Development

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/calcobee.git
   cd calcobee
   ```

2. Install dependencies:
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install

   # Install admin panel dependencies
   cd ../admin
   npm install
   ```

3. Create environment files:
   ```bash
   # In server directory
   cp .env.example .env
   ```

4. Start development servers:
   ```bash
   # Start backend server
   cd server
   npm run dev

   # Start client (in a new terminal)
   cd client
   npm start

   # Start admin panel (in a new terminal)
   cd admin
   npm start
   ```

### Production Deployment

1. Build the applications:
   ```bash
   # Build client
   cd client
   npm run build

   # Build admin panel
   cd admin
   npm run build
   ```

2. Configure Nginx:
   ```bash
   sudo cp nginx.conf /etc/nginx/sites-available/calcobee.com
   sudo ln -s /etc/nginx/sites-available/calcobee.com /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

3. Start the server with PM2:
   ```bash
   cd server
   pm2 start deploy.config.js --env production
   ```

## Environment Variables

Create a `.env` file in the server directory with the following variables:

```
NODE_ENV=development
PORT=5001
DOMAIN=localhost
```

## API Endpoints

- `GET /api/config` - Get current configuration
- `PUT /api/config` - Update configuration
- `POST /api/calculate` - Calculate costs
- `POST /api/conversion` - Handle file conversions
- `POST /api/auth/login` - User authentication
- `GET /api/users` - Get user information

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 