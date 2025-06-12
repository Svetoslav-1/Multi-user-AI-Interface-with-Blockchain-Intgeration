// BlockchainVerification.js - Component for verifying messages on the blockchain
import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import './BlockchainVerification.css';

// ABI for the AISessionIntegrity smart contract
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
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "name": "messages",
    "outputs": [
      {
        "internalType": "string",
        "name": "messageId",
        "type": "string"
      },
      {
        "internalType": "bytes32",
        "name": "messageHash",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
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
        "name": "",
        "type": "string"
      }
    ],
    "name": "sessions",
    "outputs": [
      {
        "internalType": "string",
        "name": "sessionId",
        "type": "string"
      },
      {
        "internalType": "bytes32",
        "name": "sessionHash",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "createdAt",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "exists",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
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
        "internalType": "string",
        "name": "messageId",
        "type": "string"
      },
      {
        "internalType": "bytes32",
        "name": "contentHash",
        "type": "bytes32"
      }
    ],
    "name": "verifyMessage",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Contract address - replace with your deployed contract address
const CONTRACT_ADDRESS = '0x1234567890123456789012345678901234567890';

const BlockchainVerification = ({ sessionId, messageId, messageContent }) => {
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [errorMessage, setErrorMessage] = useState('');
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [transactionHash, setTransactionHash] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize Web3 and contract
  useEffect(() => {
    const initWeb3 = async () => {
      try {
        // Check if Web3 is injected by MetaMask or similar
        if (window.ethereum) {
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);
          
          const contractInstance = new web3Instance.eth.Contract(
            CONTRACT_ABI,
            CONTRACT_ADDRESS
          );
          setContract(contractInstance);
        } else {
          // Fallback to a public provider
          const provider = new Web3.providers.HttpProvider(
            'https://mainnet.infura.io/v3/your-infura-project-id'
          );
          const web3Instance = new Web3(provider);
          setWeb3(web3Instance);
          
          const contractInstance = new web3Instance.eth.Contract(
            CONTRACT_ABI,
            CONTRACT_ADDRESS
          );
          setContract(contractInstance);
          
          setErrorMessage('MetaMask not detected. Using read-only mode.');
        }
      } catch (error) {
        console.error('Error initializing Web3:', error);
        setErrorMessage('Failed to initialize blockchain connection.');
      }
    };

    initWeb3();
  }, []);

  // Verify message function
  const verifyMessage = async () => {
    if (!web3 || !contract || !sessionId || !messageId || !messageContent) {
      setErrorMessage('Missing required information for verification.');
      return;
    }

    setLoading(true);
    
    try {
      // Create hash of the message content
      const contentHash = web3.utils.sha3(JSON.stringify({
        id: messageId,
        content: messageContent,
        sessionId: sessionId
      }));
      
      // Call the smart contract to verify the message
      const isVerified = await contract.methods
        .verifyMessage(sessionId, messageId, contentHash)
        .call();
      
      if (isVerified) {
        setVerificationStatus('verified');
        
        // Get message details from blockchain
        const messageDetails = await contract.methods
          .messages(sessionId, messageId)
          .call();
        
        setTransactionHash(messageDetails.messageHash);
      } else {
        setVerificationStatus('failed');
        setErrorMessage('Message verification failed. Content may have been altered.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationStatus('error');
      setErrorMessage(error.message || 'An error occurred during verification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="blockchain-verification">
      <h4>Blockchain Verification</h4>
      
      {errorMessage && (
        <div className="error-message">{errorMessage}</div>
      )}
      
      <div className="verification-status">
        <span>Status: </span>
        {verificationStatus === 'pending' && <span className="status-pending">Pending Verification</span>}
        {verificationStatus === 'verified' && <span className="status-verified">Verified ✓</span>}
        {verificationStatus === 'failed' && <span className="status-failed">Verification Failed ✗</span>}
        {verificationStatus === 'error' && <span className="status-error">Error</span>}
      </div>
      
      {transactionHash && (
        <div className="transaction-info">
          <div className="hash-label">Hash:</div>
          <div className="hash-value">{transactionHash}</div>
        </div>
      )}
      
      <button 
        className="verify-button"
        onClick={verifyMessage}
        disabled={loading || !web3 || !contract}
      >
        {loading ? (
          <>
            <span className="loading-spinner"></span>
            Verifying...
          </>
        ) : (
          'Verify on Blockchain'
        )}
      </button>
      
      <div className="blockchain-info">
        <p>
          This message's integrity can be verified on the blockchain. 
          Click the button above to check if the content matches what was recorded.
        </p>
      </div>
    </div>
  );
};

export default BlockchainVerification;
