// blockchain.js - Utility functions for blockchain interaction
const Web3 = require('web3');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Contract ABI - Copy from your compiled contract
const CONTRACT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "sessionId",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "messageId",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "messageHash",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "MessageAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "sessionId",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "sessionHash",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "creator",
        "type": "address"
      }
    ],
    "name": "SessionCreated",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "sessionId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "messageId",
        "type": "string"
      },
      {
        "internalType": "bytes32",
        "name": "messageHash",
        "type": "bytes32"
      }
    ],
    "name": "addMessage",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "sessionId",
        "type": "string"
      },
      {
        "internalType": "bytes32",
        "name": "sessionHash",
        "type": "bytes32"
      }
    ],
    "name": "createSession",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "sessionId",
        "type": "string"
      }
    ],
    "name": "getMessageCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "sessionId",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
      }
    ],
    "name": "getMessageIdByIndex",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Contract address from environment variables
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

// Provider URL from environment variables
const PROVIDER_URL = process.env.BLOCKCHAIN_PROVIDER_URL;

// Initialize Web3
let web3;
let contract;

/**
 * Initialize blockchain connection and contract
 * @returns {Promise<Object>} - Web3 instance and contract instance
 */
const initBlockchain = async () => {
  if (web3 && contract) {
    return { web3, contract };
  }
  
  try {
    // Create Web3 instance
    web3 = new Web3(new Web3.providers.HttpProvider(PROVIDER_URL));
    
    // Create contract instance
    contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
    
    console.log('Blockchain connection initialized');
    return { web3, contract };
  } catch (error) {
    console.error('Error initializing blockchain connection:', error);
    throw error;
  }
};

/**
 * Create a new session on the blockchain
 * @param {string} sessionId - Unique identifier for the session
 * @param {object} sessionData - Session metadata
 * @returns {Promise<object>} - Transaction receipt
 */
const createSessionOnBlockchain = async (sessionId, sessionData) => {
  try {
    const { web3, contract } = await initBlockchain();
    
    // Create hash of the session data
    const sessionHash = web3.utils.sha3(JSON.stringify(sessionData));
    
    // For demo purposes, we'll just simulate a transaction
    // In production, you would use a real blockchain account to sign and send
    console.log(`Creating session on blockchain: ${sessionId}`);
    console.log(`Session hash: ${sessionHash}`);
    
    // Return a mock receipt
    return {
      transactionHash: `0x${Math.random().toString(16).substr(2, 40)}`,
      blockNumber: Math.floor(Math.random() * 10000000),
      status: true
    };
  } catch (error) {
    console.error('Error creating session on blockchain:', error);
    throw error;
  }
};

/**
 * Add a message to the blockchain
 * @param {string} sessionId - ID of the session
 * @param {string} messageId - Unique identifier for the message
 * @param {object} messageData - Message content and metadata
 * @returns {Promise<object>} - Transaction receipt
 */
const addMessageToBlockchain = async (sessionId, messageId, messageData) => {
  try {
    const { web3, contract } = await initBlockchain();
    
    // Create hash of the message data
    const messageHash = web3.utils.sha3(JSON.stringify(messageData));
    
    // For demo purposes, we'll just simulate a transaction
    console.log(`Adding message to blockchain: ${messageId} in session ${sessionId}`);
    console.log(`Message hash: ${messageHash}`);
    
    // Return a mock receipt
    return {
      transactionHash: `0x${Math.random().toString(16).substr(2, 40)}`,
      blockNumber: Math.floor(Math.random() * 10000000),
      status: true
    };
  } catch (error) {
    console.error('Error adding message to blockchain:', error);
    throw error;
  }
};

/**
 * Verify a message on the blockchain
 * @param {string} sessionId - ID of the session
 * @param {string} messageId - ID of the message
 * @param {object} messageData - Message content and metadata to verify
 * @returns {Promise<boolean>} - True if the message is verified
 */
const verifyMessageOnBlockchain = async (sessionId, messageId, messageData) => {
  try {
    const { web3, contract } = await initBlockchain();
    
    // Create hash of the message data
    const contentHash = web3.utils.sha3(JSON.stringify(messageData));
    
    // For demo purposes, we'll simulate verification
    // In production, you would call the contract
    console.log(`Verifying message on blockchain: ${messageId} in session ${sessionId}`);
    
    // Simulate successful verification
    return true;
  } catch (error) {
    console.error('Error verifying message on blockchain:', error);
    throw error;
  }
};

// Export the functions
module.exports = {
  initBlockchain,
  createSessionOnBlockchain,
  addMessageToBlockchain,
  verifyMessageOnBlockchain
};
