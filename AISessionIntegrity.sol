// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title AISessionIntegrity
 * @dev Smart contract for verifying the integrity of AI chat sessions
 */
contract AISessionIntegrity {
    address public owner;
    
    // Session structure
    struct Session {
        string sessionId;
        bytes32 sessionHash;
        uint256 createdAt;
        address creator;
        bool exists;
    }
    
    // Message structure
    struct Message {
        string messageId;
        bytes32 messageHash;
        uint256 timestamp;
    }
    
    // Mapping of sessions
    mapping(string => Session) public sessions;
    
    // Mapping of messages within sessions
    mapping(string => mapping(string => Message)) public messages;
    
    // List of message IDs per session
    mapping(string => string[]) public sessionMessages;
    
    // Events
    event SessionCreated(string sessionId, bytes32 sessionHash, uint256 timestamp, address creator);
    event MessageAdded(string sessionId, string messageId, bytes32 messageHash, uint256 timestamp);
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    /**
     * @dev Create a new session
     * @param sessionId Unique identifier for the session
     * @param sessionHash Hash of the session metadata
     */
    function createSession(string memory sessionId, bytes32 sessionHash) public {
        require(!sessions[sessionId].exists, "Session already exists");
        
        sessions[sessionId] = Session({
            sessionId: sessionId,
            sessionHash: sessionHash,
            createdAt: block.timestamp,
            creator: msg.sender,
            exists: true
        });
        
        emit SessionCreated(sessionId, sessionHash, block.timestamp, msg.sender);
    }
    
    /**
     * @dev Add a message to an existing session
     * @param sessionId ID of the session
     * @param messageId Unique identifier for the message
     * @param messageHash Hash of the message content
     */
    function addMessage(string memory sessionId, string memory messageId, bytes32 messageHash) public {
        require(sessions[sessionId].exists, "Session does not exist");
        
        messages[sessionId][messageId] = Message({
            messageId: messageId,
            messageHash: messageHash,
            timestamp: block.timestamp
        });
        
        sessionMessages[sessionId].push(messageId);
        
        emit MessageAdded(sessionId, messageId, messageHash, block.timestamp);
    }
    
    /**
     * @dev Verify if a message hash matches the stored hash
     * @param sessionId ID of the session
     * @param messageId ID of the message
     * @param contentHash Hash of the message content to verify
     * @return bool True if the hash matches
     */
    function verifyMessage(string memory sessionId, string memory messageId, bytes32 contentHash) 
        public view returns (bool) 
    {
        require(sessions[sessionId].exists, "Session does not exist");
        return messages[sessionId][messageId].messageHash == contentHash;
    }
    
    /**
     * @dev Get the number of messages in a session
     * @param sessionId ID of the session
     * @return uint256 Number of messages
     */
    function getMessageCount(string memory sessionId) public view returns (uint256) {
        require(sessions[sessionId].exists, "Session does not exist");
        return sessionMessages[sessionId].length;
    }
    
    /**
     * @dev Get message ID by index in a session
     * @param sessionId ID of the session
     * @param index Index of the message
     * @return string Message ID
     */
    function getMessageIdByIndex(string memory sessionId, uint256 index) 
        public view returns (string memory) 
    {
        require(sessions[sessionId].exists, "Session does not exist");
        require(index < sessionMessages[sessionId].length, "Index out of bounds");
        return sessionMessages[sessionId][index];
    }
    
    /**
     * @dev Transfer ownership of the contract
     * @param newOwner Address of the new owner
     */
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        owner = newOwner;
    }
}
