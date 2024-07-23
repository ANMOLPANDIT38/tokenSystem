// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./RewardToken.sol";

contract RewardSystem {
    RewardToken private token;
    address private owner;

    struct User {
        address wallet;
        uint256 totalEarned;
        uint256 totalRedeemed;
        uint256[] activities;
    }

    mapping(address => User) public users;

    event TokensEarned(address indexed user, uint256 amount);
    event TokensRedeemed(address indexed user, uint256 amount, string reward);

    constructor(RewardToken _token) {
        token = _token;
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    function registerUser(address _user) public onlyOwner {
        users[_user] = User(_user, 0, 0, new uint256[](0));
    }

    function earnTokens(address _user, uint256 _amount) public onlyOwner {
        require(users[_user].wallet != address(0), "User not registered");
        token.transfer(_user, _amount);
        users[_user].totalEarned += _amount;
        users[_user].activities.push(_amount);
        emit TokensEarned(_user, _amount);
    }

    function redeemTokens(address _user, uint256 _amount, string memory _reward) public onlyOwner {
        require(users[_user].wallet != address(0), "User not registered");
        require(token.balanceOf(_user) >= _amount, "Insufficient balance");
        token.transferFrom(_user, address(this), _amount);
        users[_user].totalRedeemed += _amount;
        emit TokensRedeemed(_user, _amount, _reward);
    }

    function getUserActivities(address _user) public view returns (uint256[] memory) {
        return users[_user].activities;
    }
}
