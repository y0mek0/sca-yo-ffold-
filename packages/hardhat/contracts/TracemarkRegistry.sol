// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract TracemarkRegistry {
    mapping(bytes32 => uint64) public anchoredAt;

    event ReceiptAnchored(bytes32 indexed digest, address indexed submitter, uint64 timestamp);

    function anchor(bytes32 digest) external {
        require(digest != bytes32(0), "empty digest");
        require(anchoredAt[digest] == 0, "digest already anchored");

        uint64 timestamp = uint64(block.timestamp);
        anchoredAt[digest] = timestamp;
        emit ReceiptAnchored(digest, msg.sender, timestamp);
    }
}
