# Multi-User AI Interface with Blockchain Integration

A real-time collaborative chat platform that integrates AI capabilities with blockchain verification technology. Users can create shared sessions, communicate with each other, and interact with an AI assistant while ensuring message integrity through blockchain-based verification.

## Features

- **Real-time multi-user chat** with Socket.io
- **Smart AI integration** - AI responds only when messages start with "AI "
- **Blockchain verification** for message integrity
- **Session sharing** via shareable links
- **User management** with admin controls (kick/add users)
- **Cross-device compatibility** with network access
- **Responsive web interface**

## Tech Stack

- **Backend:** Node.js, Express, Socket.io, Web3.js
- **Frontend:** React, Socket.io Client, Axios
- **AI Integration:** Anthropic Claude API
- **Blockchain:** Ethereum (Solidity smart contracts)
- **Authentication:** JWT tokens

## Prerequisites

- Node.js (v14.x or higher)
- npm (v6.x or higher)
- Anthropic API key
- Blockchain provider (Infura/Alchemy) - optional for full blockchain features

## Quick Start Guide

### Step 1: Clone and Install

```
# Clone the repository
git clone https://github.com/Svetoslav-1/Multi-user-AI-Interface-with-Blockchain-Integration.git
cd Multi-user-AI-Interface-with-Blockchain-Integration
```

# Install backend dependencies
```
npm install
```
# Install frontend dependencies
```
cd client
npm install
cd ..
```
Step 2: Configure Environment Variables
Copy the environment template:
```cp .env .env.local ```
Edit .env.local with your actual API keys:
```PORT=5000
NODE_ENV=development
JWT_SECRET=your-strong-random-secret-key-minimum-32-characters
ANTHROPIC_API_KEY=your-actual-anthropic-api-key-here
BLOCKCHAIN_PROVIDER_URL=https://mainnet.infura.io/v3/your-infura-project-id
CONTRACT_ADDRESS=your-deployed-contract-address
CORS_ORIGIN=*
```
Step 3: Get Required API Keys
Anthropic API Key (Required for AI features):

Go to Anthropic Console
Sign up for an account
Generate a new API key
Copy the key to your .env.local file

Blockchain Provider (Optional - for full blockchain verification):

Sign up at Infura or Alchemy
Create a new project
Copy the HTTPS endpoint URL
Add to your .env.local file

Step 4: Run the Application
Start both backend and frontend servers
```npm run dev```
The application will be available at:

Frontend: http://localhost:3000
Backend API: http://localhost:5000

How to Use
Creating Your First Session

Open the application: Navigate to http://localhost:3000
Enter a username: Choose any username you like
Click "Create Session": This generates a unique session ID
Share the link: Copy the generated link to invite others

Using the Chat
The chat has two modes:
Regular Chat Messages:

Hello everyone!
How's everyone doing?
Anyone want to collaborate on this project?

AI-Triggered Messages (start with "AI "):

AI What's the weather like today?
AI Can you explain blockchain technology?
AI Help me write a function in JavaScript

Admin Functions (Session Creators Only)

Remove users: Click the red "×" button next to usernames
Manage session: Share the session link with new participants
End session: Click "Leave Session" to exit

Network Access Setup
To access the application from other devices on your network:
For Virtual Machine Users:

Configure VM Network:

VMware: VM Settings → Network Adapter → Bridged
VirtualBox: Settings → Network → Adapter 1 → Bridged Adapter
Restart your VM


Find your VM's IP address:
```ip addr show```
# Look for something like 192.168.1.x

Access from other devices:

Use: http://YOUR-VM-IP:3000
Example: http://192.168.1.8:3000



For Regular Installation:
The app is pre-configured for network access. Other devices on your network can access it using your computer's IP address.
Troubleshooting
Common Issues and Solutions
"AI not responding"

✅ Check that your message starts with "AI " (with a space)
✅ Verify ANTHROPIC_API_KEY is set in .env.local
✅ Check the browser console for error messages

"Cannot connect to session"

✅ Ensure backend server is running (check terminal for "Server running on port 5000")
✅ Check if you're using the correct URL
✅ Verify network connectivity

"Users not seeing each other"

✅ Refresh the page
✅ Check that both users are in the same session
✅ Restart the application with npm run dev

"Module not found" errors

✅ Run npm install in the root directory
✅ Run npm install in the client directory
✅ Delete node_modules folders and reinstall if necessary

Development Tips

Check browser console: Press F12 to see frontend errors
Monitor server logs: Watch the terminal where you ran npm run dev
Test locally first: Use multiple browser tabs before testing network access
Clear browser cache: If you see old versions of the app
```
Project Structure
Multi-user-AI-Interface-with-Blockchain-Integration/
├── server.js                    # Main backend server
├── blockchain.js                # Blockchain utility functions
├── .env                         # Environment template (safe for GitHub)
├── .env.local                   # Your actual secrets (create this locally)
├── package.json                 # Backend dependencies
├── AISessionIntegrity.sol       # Smart contract for blockchain verification
├── README.md                    # This file
├── .gitignore                   # Files to exclude from Git
└── client/                      # React frontend application
    ├── package.json             # Frontend dependencies
    ├── public/
    │   └── index.html           # HTML template
    └── src/
        ├── App.js               # Main React component
        ├── App.css              # Application styling
        ├── index.js             # React entry point
        ├── index.css            # Global styles
        ├── reportWebVitals.js   # Performance monitoring
        ├── BlockchainVerification.js  # Blockchain verification component
        └── BlockchainVerification.css # Verification styling
```
Available Scripts
bash# Development (runs both frontend and backend)
```
npm run dev

# Run only backend
npm run server

# Run only frontend
npm run client

# Build for production
npm run build

# Start production server
npm start

# Install all dependencies
npm run install-all
```
Advanced Configuration
Blockchain Integration
The project includes a Solidity smart contract for message verification:

Deploy the contract: Use tools like Remix or Hardhat to deploy AISessionIntegrity.sol
Update contract address: Add the deployed address to your .env.local
Verify messages: Users can verify message integrity through the UI

Custom AI Models
To use different AI providers, modify the connectToAI function in server.js:
javascript Example for OpenAI integration
```
const connectToAI = async () => {
  const { Configuration, OpenAIApi } = require("openai");
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);
  // ... rest of implementation
};
```
Security Considerations

Never commit real API keys to version control
Use strong JWT secrets (minimum 32 characters)
Enable HTTPS in production environments
Validate all user inputs on both client and server
Implement rate limiting for production deployments


Acknowledgments

Anthropic for Claude AI API
Socket.io for real-time communication
React for the frontend framework
Web3.js for blockchain integration

Support
If you encounter any issues:

Check the troubleshooting section above
Look for existing issues in the GitHub repository
Create a new issue with detailed error information
Include your operating system, Node.js version, and steps to reproduce
