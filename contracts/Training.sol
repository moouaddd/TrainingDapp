// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PersonalTraining {
    address public owner;

    struct Session {
        uint id;
        string name;
        string image;
        uint price;
        uint slots;
    }

    Session[] public sessions;

    event SessionAdded(uint id, string name, uint price);
    event SessionUpdated(uint id, string name, uint price, uint slots);
    event SessionBooked(address client, uint id);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function addSession(
        string memory _name,
        string memory _image,
        uint _price,
        uint _slots
    ) public onlyOwner {
        require(_price > 0, "Invalid price");
        require(_slots > 0, "Invalid slots");
        uint newId = sessions.length + 1;
        sessions.push(Session(newId, _name, _image, _price, _slots));
        emit SessionAdded(newId, _name, _price);
    }

    function updateSession(
        uint _id,
        string memory _name,
        string memory _image,
        uint _price,
        uint _slots
    ) public onlyOwner {
        require(_id > 0 && _id <= sessions.length, "Invalid session ID");
        require(_price > 0, "Invalid price");
        require(_slots > 0, "Invalid slots");

        Session storage session = sessions[_id - 1];
        session.name = _name;
        session.image = _image;
        session.price = _price;
        session.slots = _slots;

        emit SessionUpdated(_id, _name, _price, _slots);
    }

    function bookSession(uint _id) public payable {
        require(_id > 0 && _id <= sessions.length, "Invalid session ID");
        Session storage session = sessions[_id - 1];
        require(msg.value >= session.price, "Not enough ETH sent");
        require(session.slots > 0, "No slots available");

        session.slots--;
        payable(owner).transfer(session.price);

        emit SessionBooked(msg.sender, _id);
    }

    function getSessions() public view returns (Session[] memory) {
        return sessions;
    }

    function getSession(uint _id) public view returns (Session memory) {
        require(_id > 0 && _id <= sessions.length, "Invalid session ID");
        return sessions[_id - 1];
    }
}