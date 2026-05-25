// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Administrable Contract
 * @dev Basic admin system for TeamsManager - essential functionality only
 */
contract Administrable is ReentrancyGuard {

    // ============ ENUMS ============

    /**
     * @dev WARNING: The ordering of this enum is critical for Role-Based Access Control (RBAC).
     * Access modifiers such as `onlyRole` use `>=` comparisons against the underlying integer
     * values. Changing the order or inserting new roles between existing ones will silently break
     * the access control hierarchy. Strict hierarchy is maintained in ascending power.
     */
    enum AdminRole {
        NONE,           // 0 - Not an admin
        TEAM_MANAGER,   // 1 - Can only manage teams
        VOTE_ADMIN,     // 2 - Can only manage voting
        RECOVERY_ADMIN, // 3 - Can only help in emergencies
        SUPER_ADMIN     // 4 - Can do everything
    }

    // ============ STRUCTS ============

    struct AdminInfo {
        AdminRole role;
        uint256 joinTimestamp;
        bool isActive;
    }

    // ============ STATE VARIABLES ============

    mapping(address => AdminInfo) public adminInfo;
    address[] public adminList;
    uint256 public totalAdmins;

    // Emergency system
    bool private _emergencyMode = false;
    uint256 public constant EMERGENCY_TIMEOUT = 7 days;
    address public emergencyTriggeredBy;
    uint256 public emergencyStartTime;

    // ============ EVENTS ============

    event AdminAdded(address indexed admin, AdminRole role);
    event AdminRemoved(address indexed admin, AdminRole role);
    event AdminRoleChanged(address indexed admin, AdminRole oldRole, AdminRole newRole);
    event EmergencyModeToggled(bool enabled, address indexed triggeredBy);

    // ============ MODIFIERS ============

    modifier onlyAdmins() {
        require(adminInfo[msg.sender].role != AdminRole.NONE && adminInfo[msg.sender].isActive,
                "Not an active admin");
        _;
    }

    /**
     * @dev Asserts a minimum role hierarchy required. Inherits privilege based on the integer order defined in `AdminRole`.
     */
    modifier onlyRole(AdminRole minRole) {
        require(adminInfo[msg.sender].role >= minRole && adminInfo[msg.sender].isActive,
                "Insufficient admin privileges");
        _;
    }

    modifier onlySuperAdmin() {
        require(adminInfo[msg.sender].role == AdminRole.SUPER_ADMIN && adminInfo[msg.sender].isActive,
                "Only super admin can perform this action");
        _;
    }

    modifier notInEmergency() {
        require(!emergencyMode(), "Contract is in emergency mode");
        _;
    }

    modifier onlyInEmergency() {
        require(emergencyMode(), "Emergency mode required");
        _;
    }

    // ============ CONSTRUCTOR ============

    constructor(address[] memory initialAdmins) {
        require(initialAdmins.length >= 1, "At least 1 initial admin required");

        // Initialize admins as super admins
        for (uint256 i = 0; i < initialAdmins.length; i++) {
            require(initialAdmins[i] != address(0), "Invalid admin address");
            adminInfo[initialAdmins[i]] = AdminInfo({
                role: AdminRole.SUPER_ADMIN,
                joinTimestamp: block.timestamp,
                isActive: true
            });
            adminList.push(initialAdmins[i]);
        }

        totalAdmins = initialAdmins.length;
    }

    // ============ ADMIN MANAGEMENT ============

    /**
     * @dev Add a new admin
     */
    function addAdmin(address newAdmin, AdminRole role) external onlySuperAdmin notInEmergency {
        require(newAdmin != address(0), "Invalid admin address");
        require(adminInfo[newAdmin].role == AdminRole.NONE, "Already an admin");
        require(role != AdminRole.NONE, "Invalid role");

        adminInfo[newAdmin] = AdminInfo({
            role: role,
            joinTimestamp: block.timestamp,
            isActive: true
        });

        adminList.push(newAdmin);
        totalAdmins++;

        emit AdminAdded(newAdmin, role);
    }

    /**
     * @dev Remove an admin
     */
    function removeAdmin(address admin) external onlySuperAdmin notInEmergency {
        require(adminInfo[admin].role != AdminRole.NONE, "Not an admin");
        require(adminInfo[admin].isActive, "Admin not active");
        require(totalAdmins > 1, "Cannot remove last admin");

        AdminRole oldRole = adminInfo[admin].role;
        adminInfo[admin].isActive = false;
        adminInfo[admin].role = AdminRole.NONE;
        totalAdmins--;

        // Remove from admin list
        for (uint256 i = 0; i < adminList.length; i++) {
            if (adminList[i] == admin) {
                adminList[i] = adminList[adminList.length - 1];
                adminList.pop();
                break;
            }
        }

        emit AdminRemoved(admin, oldRole);
    }

    /**
     * @dev Change an admin's role
     */
    function changeAdminRole(address admin, AdminRole newRole) external onlySuperAdmin notInEmergency {
        require(adminInfo[admin].role != AdminRole.NONE, "Not an admin");
        require(newRole != AdminRole.NONE, "Invalid role");
        require(adminInfo[admin].role != newRole, "Same role");

        AdminRole oldRole = adminInfo[admin].role;
        adminInfo[admin].role = newRole;

        emit AdminRoleChanged(admin, oldRole, newRole);
    }

    // ============ EMERGENCY FUNCTIONS ============

    /**
     * @dev Trigger emergency mode
     */
    function triggerEmergency() external onlyRole(AdminRole.RECOVERY_ADMIN) {
        _emergencyMode = true;
        emergencyTriggeredBy = msg.sender;
        emergencyStartTime = block.timestamp;

        emit EmergencyModeToggled(true, msg.sender);
    }

    /**
     * @dev Resolve emergency mode
     */
    function resolveEmergency() external onlySuperAdmin onlyInEmergency {
        _emergencyMode = false;
        emergencyTriggeredBy = address(0);
        emergencyStartTime = 0;

        emit EmergencyModeToggled(false, msg.sender);
    }

    /**
     * @dev Emergency admin addition (only during emergency)
     */
    function emergencyAddAdmin(address admin, AdminRole role) external onlyRole(AdminRole.RECOVERY_ADMIN) onlyInEmergency {
        require(admin != address(0), "Invalid admin address");
        require(adminInfo[admin].role == AdminRole.NONE, "Already an admin");
        require(role != AdminRole.NONE, "Invalid role");
        require(role <= adminInfo[msg.sender].role, "Cannot grant role higher than own");

        adminInfo[admin] = AdminInfo({
            role: role,
            joinTimestamp: block.timestamp,
            isActive: true
        });

        adminList.push(admin);
        totalAdmins++;

        emit AdminAdded(admin, role);
    }

    // ============ VIEW FUNCTIONS ============

    function emergencyMode() public view returns (bool) {
        if (!_emergencyMode) return false;
        return block.timestamp <= emergencyStartTime + EMERGENCY_TIMEOUT;
    }

    function isAdmin(address _address) public view returns (bool) {
        return adminInfo[_address].role != AdminRole.NONE && adminInfo[_address].isActive;
    }

    function getAdminRole(address _address) public view returns (AdminRole) {
        return adminInfo[_address].role;
    }

    function getAdminInfo(address _address) public view returns (AdminInfo memory) {
        return adminInfo[_address];
    }

    function getAllAdmins() public view returns (address[] memory) {
        address[] memory activeAdmins = new address[](totalAdmins);
        uint256 count = 0;

        for (uint256 i = 0; i < adminList.length; i++) {
            if (adminInfo[adminList[i]].isActive) {
                activeAdmins[count] = adminList[i];
                count++;
            }
        }

        // Resize array to actual count
        address[] memory result = new address[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = activeAdmins[i];
        }

        return result;
    }

    /**
     * @dev Check if admin has permission for specific role
     */
    function hasRole(address admin, AdminRole requiredRole) external view returns (bool) {
        return adminInfo[admin].role >= requiredRole && adminInfo[admin].isActive;
    }
}
