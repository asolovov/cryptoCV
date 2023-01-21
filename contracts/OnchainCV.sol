// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

/*
 * This is a smart contract to store and update personal CV information on-chain. It has only one interactive feature -
 * user can set likes on published cases.
 *
 * Actually it is just a simple way to show to potential employer my performance level, but you can use the idea
 * for any purposes.
 *
 * Remember to set a like!
 *
 * @author Andrey Solovov
 */
contract OnchainCV is Ownable {

    // Next case id, started from 1
    uint256 private _nextId;

    // Total cases added
    uint256 private _totalCases;

    // Total likes on not removed cases
    uint256 private _totalLikes;

    // Main info for JSON metadata
    string private _mainInfo;

    // Case data type. Start date should not be 0
    struct Case {
        uint256 id;
        string info;
        uint256 startDate;
        uint256 endDate;
        uint256 likes;
    }

    // Mapping casesId to case data struct
    mapping(uint256 => Case) private _cases;

    // Mapping user address to case id to true if user already set like on the case and false if not
    mapping(address => mapping(uint256 => bool)) private _userCaseLikes;

    // Triggered when new like is set on `caseId` from `user`
    event LikeSet(uint256 caseId, address user);

    constructor () {
        _nextId++;
    }

    /*
     * Set new `_mainInfo` of the CV such as "about", "contacts" and other sections in JSON format
     *
     * Requirements:
     * - caller should be an owner
     *
     * @param `info` - new CV info in JSON format
     */
    function updateMainInfo(string memory info) external onlyOwner {
        _mainInfo = info;
    }

    // @return `_mainInfo` of the CV
    function getMainInfo() external view returns(string memory) {
        return _mainInfo;
    }

    /*
     * Creates new Case and sets `info`, `startDate`, `endDate` information of the case
     * @dev updates `_cases` mapping, increases `_nextId` and `_totalCases`
     *
     * Requirements:
     * - caller should be an owner
     * - `startDate` can not be 0
     *
     * @param `info` - Case info in JSON format
     * @param `startDate` - start date of the Case as a timestamp
     * @param `endDate` - end date of the Case as a timestamp
     */
    function addCase(
        string memory info,
        uint256 startDate,
        uint256 endDate
    ) external onlyOwner {
        require(startDate != 0, "OnchainCV: start date can not be 0");

        _cases[_nextId] = Case(_nextId, info, startDate, endDate, 0);
        _nextId++;
        _totalCases++;
    }

    /*
     * Updates existing Case and sets new `info`, `startDate`, `endDate` information of the case
     * @dev updates `_cases` mapping, and saves Case `likes`
     *
     * Requirements:
     * - caller should be an owner
     * - `startDate` can not be 0
     * - case should exist
     *
     * @param `caseId` - ID of an existing Case
     * @param `info` - Case info in JSON format
     * @param `startDate` - start date of the Case as a timestamp
     * @param `endDate` - end date of the Case as a timestamp
     */
    function updateCase(
        uint256 caseId,
        string memory info,
        uint256 startDate,
        uint256 endDate
    ) external onlyOwner {
        require(_isValidCaseId(caseId), "OnchainCV: case deleted or invalid ID");
        require(startDate != 0, "OnchainCV: start date can not be 0");

        uint256 caseLikes = _cases[caseId].likes;

        _cases[caseId] = Case(caseId, info, startDate, endDate, caseLikes);
    }

    /*
     * Removes existing Case
     * @dev deletes `Case` form `_cases` mapping, decreases `_totalCases` and `_totalLikes` on `likes` amount from `Case`
     *
     * Requirements:
     * - caller should be an owner
     * - case should exist
     *
     * @param `caseId` - ID of an existing Case
     */
    function removeCase(uint256 caseId) external onlyOwner {
        require(_isValidCaseId(caseId), "OnchainCV: case deleted or invalid ID");

        uint256 likes = _cases[caseId].likes;

        delete _cases[caseId];

        _totalLikes = _totalLikes - likes;
        _totalCases--;
    }

    // @return array of Case data structs for not deleted cases
    function getCases() external view returns(Case[] memory) {
        Case[] memory cases = new Case[](_totalCases);

        uint256 index;

        for (uint256 i = 1; i < _nextId; i++) {
            if (_cases[i].startDate != 0) {
                cases[index] = _cases[i];
                index++;
            }
        }

        return cases;
    }

    // @return Case data struct for given @param `caseId`
    // Requirement: case should exist
    function getCase(uint256 caseId) external view returns(Case memory) {
        require(_isValidCaseId(caseId), "OnchainCV: case deleted or invalid ID");

        return _cases[caseId];
    }

    /*
     * Sets like on a given case
     * @dev updates `_cases` mapping by increase of `Case` `likes`, increase `_totalLikes`
     * @dev and update `_userCaseLikes` mapping
     *
     * Requirements:
     * - case should exist
     * - user can set like for the case only once
     *
     * @param `caseId` - ID of an existing Case
     *
     * Emits `LikeSet` event
     */
    function setLike(uint256 caseId) external {
        require(_isValidCaseId(caseId), "OnchainCV: case deleted or invalid ID");
        require(!_isUserSetLike(caseId, msg.sender), "OnchainCV: you already set like on this case");

        _cases[caseId].likes++;
        _totalLikes++;
        _userCaseLikes[msg.sender][caseId] = true;

        emit LikeSet(caseId, msg.sender);
    }

    // @return Number of total likes
    function getTotalLikes() external view returns(uint256) {
        return _totalLikes;
    }

    // @return Number of total not deleted cases
    function getTotalCases() external view returns(uint256) {
        return _totalCases;
    }

    // @dev Returns true if `Case` for given `caseId` exists and not been deleted and false if not
    function _isValidCaseId(uint256 caseId) internal view returns(bool) {
        if (_cases[caseId].startDate == 0) {
            return false;
        }

        return true;
    }

    // @dev Returns true if `user` already set like on given `caseId` and false if not
    function _isUserSetLike(uint256 caseId, address user) internal view returns(bool) {
        return _userCaseLikes[user][caseId];
    }


}
