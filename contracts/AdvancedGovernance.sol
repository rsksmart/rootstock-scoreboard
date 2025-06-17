// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// CORRECTED IMPORT PATHS FOR OPENZEPPELIN 4.9
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title Advanced Governance Contract
 * @dev Advanced governance system with multi-sig, role specialization, time-locks, and staking
 */
contract AdvancedGovernance is ReentrancyGuard {

    // ============ ENUMS ============

    enum AdminRole {
        NONE,           // 0 - Not an admin
        TEAM_MANAGER,   // 1 - Can only manage teams
        VOTE_ADMIN,     // 2 - Can only manage voting
        RECOVERY_ADMIN, // 3 - Can only help in emergencies
        SUPER_ADMIN     // 4 - Can do everything
    }

    enum ActionType {
        ADD_ADMIN,
        REMOVE_ADMIN,
        CHANGE_ROLE,
        EMERGENCY_ACTION,
        STAKE_SLASH
    }

    // ============ STRUCTS ============

    struct AdminInfo {
        AdminRole role;
        uint256 stakedAmount;
        uint256 slashCount;
        uint256 rewardsClaimed;
        uint256 joinTimestamp;
        bool isActive;
    }

    struct AdminAction {
        uint256 id;
        ActionType actionType;
        address proposer;
        address target;
        AdminRole newRole;
        uint256 amount;
        bytes data;
        uint256 confirmations;
        uint256 requiredConfirmations;
        uint256 deadline;
        bool executed;
        bool cancelled;
        string reason;
    }

    struct TimeLock {
        uint256 id;
        AdminAction action;
        uint256 unlockTime;
        bool executed;
        bool cancelled;
    }

    // ============ STATE VARIABLES ============

    // Core admin management
    mapping(address => AdminInfo) public adminInfo;
    mapping(AdminRole => mapping(bytes4 => bool)) public rolePermissions;
    address[] public adminList;
    uint256 public totalAdmins;

    // Multi-signature system
    mapping(uint256 => AdminAction) public pendingActions;
    mapping(uint256 => mapping(address => bool)) public actionConfirmations;
    uint256 public nextActionId = 1;
    uint256 public requiredConfirmations = 2; // Default: 2 confirmations needed

    // Time-lock system
    mapping(uint256 => TimeLock) public timeLocks;
    uint256 public nextTimeLockId = 1;
    uint256 public defaultTimeLockDelay = 2 days;

    // Staking system
    IERC20 public stakingToken;
    uint256 public minimumStake = 1000 * 10**18; // 1000 tokens minimum
    uint256 public totalStaked;
    uint256 public rewardPool;
    uint256 public slashPercentage = 10; // 10% slash on misconduct

    // Emergency system
    bool public emergencyMode = false;
    address public emergencyTriggeredBy;
    uint256 public emergencyStartTime;

    // ============ EVENTS ============

    event AdminAdded(address indexed admin, AdminRole role, uint256 stakedAmount);
    event AdminRemoved(address indexed admin, AdminRole role);
    event AdminRoleChanged(address indexed admin, AdminRole oldRole, AdminRole newRole);
    event ActionProposed(uint256 indexed actionId, address indexed proposer, ActionType actionType);
    event ActionConfirmed(uint256 indexed actionId, address indexed confirmer);
    event ActionExecuted(uint256 indexed actionId, address indexed executor);
    event ActionCancelled(uint256 indexed actionId, address indexed canceller);
    event TimeLockScheduled(uint256 indexed lockId, uint256 unlockTime);
    event TimeLockExecuted(uint256 indexed lockId);
    event AdminStaked(address indexed admin, uint256 amount);
    event AdminSlashed(address indexed admin, uint256 amount, string reason);
    event RewardsClaimed(address indexed admin, uint256 amount);
    event EmergencyModeToggled(bool enabled, address indexed triggeredBy);

    // ============ MODIFIERS ============

    modifier onlyAdmins() {
        require(adminInfo[msg.sender].role != AdminRole.NONE && adminInfo[msg.sender].isActive, 
                "Not an active admin");
        _;
    }

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
        require(!emergencyMode, "Contract is in emergency mode");
        _;
    }

    modifier onlyInEmergency() {
        require(emergencyMode, "Emergency mode required");
        _;
    }

    modifier validAction(uint256 actionId) {
        require(actionId < nextActionId && actionId > 0, "Invalid action ID");
        require(!pendingActions[actionId].executed, "Action already executed");
        require(!pendingActions[actionId].cancelled, "Action cancelled");
        require(block.timestamp <= pendingActions[actionId].deadline, "Action expired");
        _;
    }

    // ============ CONSTRUCTOR ============

    constructor(
        address[] memory initialAdmins,
        address _stakingToken,
        uint256 _minimumStake
    ) {
        require(initialAdmins.length >= 3, "At least 3 initial admins required");
        require(_stakingToken != address(0), "Invalid staking token");

        stakingToken = IERC20(_stakingToken);
        minimumStake = _minimumStake;

        // Initialize first admin as super admin
        for (uint256 i = 0; i < initialAdmins.length; i++) {
            adminInfo[initialAdmins[i]] = AdminInfo({
                role: AdminRole.SUPER_ADMIN,
                stakedAmount: 0,
                slashCount: 0,
                rewardsClaimed: 0,
                joinTimestamp: block.timestamp,
                isActive: true
            });
            adminList.push(initialAdmins[i]);
        }

        totalAdmins = initialAdmins.length;
        requiredConfirmations = (totalAdmins * 60) / 100; // 60% majority
        if (requiredConfirmations < 2) requiredConfirmations = 2;

        _setupRolePermissions();
    }

    // ============ ROLE PERMISSION SETUP ============

    function _setupRolePermissions() internal {
        // TEAM_MANAGER permissions
        rolePermissions[AdminRole.TEAM_MANAGER][bytes4(keccak256("addTeam(string,address,address)"))] = true;
        rolePermissions[AdminRole.TEAM_MANAGER][bytes4(keccak256("removeTeam(string)"))] = true;
        rolePermissions[AdminRole.TEAM_MANAGER][bytes4(keccak256("updateTeamToken(string,address)"))] = true;

        // VOTE_ADMIN permissions  
        rolePermissions[AdminRole.VOTE_ADMIN][bytes4(keccak256("setReadyToVote(uint256)"))] = true;
        rolePermissions[AdminRole.VOTE_ADMIN][bytes4(keccak256("disableVoting()"))] = true;
        rolePermissions[AdminRole.VOTE_ADMIN][bytes4(keccak256("setVotingToken(address)"))] = true;
        rolePermissions[AdminRole.VOTE_ADMIN][bytes4(keccak256("setMinimumVoteAmount(uint256)"))] = true;

        // RECOVERY_ADMIN permissions - FIXED: Correct function signature
        rolePermissions[AdminRole.RECOVERY_ADMIN][bytes4(keccak256("triggerEmergency()"))] = true;
        rolePermissions[AdminRole.RECOVERY_ADMIN][bytes4(keccak256("emergencyAddAdmin(address,uint8)"))] = true;
        rolePermissions[AdminRole.RECOVERY_ADMIN][bytes4(keccak256("emergencyWithdraw(address,address,uint256)"))] = true;

        // SUPER_ADMIN has all permissions (checked in modifier)
    }

    // ============ MULTI-SIGNATURE OPERATIONS ============

    /**
     * @dev Propose adding a new admin
     */
    function proposeAddAdmin(
        address newAdmin, 
        AdminRole role, 
        string calldata reason
    ) external onlyRole(AdminRole.SUPER_ADMIN) notInEmergency {
        require(newAdmin != address(0), "Invalid admin address");
        require(adminInfo[newAdmin].role == AdminRole.NONE, "Already an admin");
        require(role != AdminRole.NONE, "Invalid role");

        uint256 actionId = _createAction(
            ActionType.ADD_ADMIN,
            newAdmin,
            role,
            0,
            "",
            reason
        );

        _confirmAction(actionId);
    }

    /**
     * @dev Propose removing an admin
     */
    function proposeRemoveAdmin(
        address admin, 
        string calldata reason
    ) external onlyRole(AdminRole.SUPER_ADMIN) notInEmergency {
        require(adminInfo[admin].role != AdminRole.NONE, "Not an admin");
        // FIXED: Allow removal if result would be >= 3 admins (totalAdmins - 1 >= 3)
        require(totalAdmins >= 4, "Cannot remove admin: minimum 3 required");

        uint256 actionId = _createAction(
            ActionType.REMOVE_ADMIN,
            admin,
            AdminRole.NONE,
            0,
            "",
            reason
        );

        _confirmAction(actionId);
    }

    /**
     * @dev Propose changing an admin's role
     */
    function proposeRoleChange(
        address admin, 
        AdminRole newRole, 
        string calldata reason
    ) external onlyRole(AdminRole.SUPER_ADMIN) notInEmergency {
        require(adminInfo[admin].role != AdminRole.NONE, "Not an admin");
        require(newRole != AdminRole.NONE, "Invalid role");
        require(adminInfo[admin].role != newRole, "Same role");

        uint256 actionId = _createAction(
            ActionType.CHANGE_ROLE,
            admin,
            newRole,
            0,
            "",
            reason
        );

        _confirmAction(actionId);
    }

    /**
     * @dev Confirm a pending action
     */
    function confirmAction(uint256 actionId) external onlyAdmins validAction(actionId) {
        require(!actionConfirmations[actionId][msg.sender], "Already confirmed");

        _confirmAction(actionId);
    }

    /**
     * @dev Execute a confirmed action
     */
    function executeAction(uint256 actionId) external onlyAdmins validAction(actionId) {
        AdminAction storage action = pendingActions[actionId];
        require(action.confirmations >= action.requiredConfirmations, "Insufficient confirmations");

        action.executed = true;

        if (action.actionType == ActionType.ADD_ADMIN) {
            _executeAddAdmin(action.target, action.newRole);
        } else if (action.actionType == ActionType.REMOVE_ADMIN) {
            _executeRemoveAdmin(action.target);
        } else if (action.actionType == ActionType.CHANGE_ROLE) {
            _executeRoleChange(action.target, action.newRole);
        }

        emit ActionExecuted(actionId, msg.sender);
    }

    /**
     * @dev Cancel a pending action
     */
    function cancelAction(uint256 actionId) external onlyRole(AdminRole.SUPER_ADMIN) validAction(actionId) {
        pendingActions[actionId].cancelled = true;
        emit ActionCancelled(actionId, msg.sender);
    }

    // ============ TIME-LOCKED OPERATIONS ============

    /**
     * @dev Schedule a time-locked admin addition
     */
    function scheduleTimeLockAddAdmin(
        address newAdmin,
        AdminRole role,
        uint256 delay
    ) external onlySuperAdmin {
        require(delay >= 1 hours, "Minimum 1 hour delay required");

        AdminAction memory action = AdminAction({
            id: 0,
            actionType: ActionType.ADD_ADMIN,
            proposer: msg.sender,
            target: newAdmin,
            newRole: role,
            amount: 0,
            data: "",
            confirmations: 0,
            requiredConfirmations: 0,
            deadline: block.timestamp + delay + 7 days,
            executed: false,
            cancelled: false,
            reason: "Time-locked admin addition"
        });

        TimeLock storage timeLock = timeLocks[nextTimeLockId];
        timeLock.id = nextTimeLockId;
        timeLock.action = action;
        timeLock.unlockTime = block.timestamp + delay;
        timeLock.executed = false;
        timeLock.cancelled = false;

        emit TimeLockScheduled(nextTimeLockId, timeLock.unlockTime);
        nextTimeLockId++;
    }

    /**
     * @dev Execute a time-locked action
     */
    function executeTimeLock(uint256 lockId) external onlyAdmins {
        TimeLock storage timeLock = timeLocks[lockId];
        require(!timeLock.executed, "Time lock already executed");
        require(!timeLock.cancelled, "Time lock cancelled");
        require(block.timestamp >= timeLock.unlockTime, "Time lock not yet unlocked");

        timeLock.executed = true;

        if (timeLock.action.actionType == ActionType.ADD_ADMIN) {
            _executeAddAdmin(timeLock.action.target, timeLock.action.newRole);
        }

        emit TimeLockExecuted(lockId);
    }

    /**
     * @dev Cancel a time-locked action
     */
    function cancelTimeLock(uint256 lockId) external onlySuperAdmin {
        TimeLock storage timeLock = timeLocks[lockId];
        require(!timeLock.executed, "Time lock already executed");
        require(!timeLock.cancelled, "Time lock already cancelled");

        timeLock.cancelled = true;
    }

    // ============ STAKING MECHANISM ============

    /**
     * @dev Stake tokens to become or remain an admin
     */
    function stakeForAdmin(uint256 amount) external nonReentrant {
        // FIXED: For additional stakes, don't require minimum amount
        if (adminInfo[msg.sender].stakedAmount == 0) {
            require(amount >= minimumStake, "Insufficient stake amount");
        } else {
            require(amount > 0, "Amount must be positive");
        }
        require(stakingToken.transferFrom(msg.sender, address(this), amount), "Stake transfer failed");

        adminInfo[msg.sender].stakedAmount += amount;
        totalStaked += amount;

        emit AdminStaked(msg.sender, amount);
    }

    /**
     * @dev Propose slashing an admin's stake
     */
    function proposeSlashAdmin(
        address admin, 
        string calldata reason
    ) external onlyRole(AdminRole.SUPER_ADMIN) {
        require(adminInfo[admin].role != AdminRole.NONE, "Not an admin");
        require(adminInfo[admin].stakedAmount > 0, "No stake to slash");

        uint256 slashAmount = (adminInfo[admin].stakedAmount * slashPercentage) / 100;

        uint256 actionId = _createAction(
            ActionType.STAKE_SLASH,
            admin,
            AdminRole.NONE,
            slashAmount,
            "",
            reason
        );

        _confirmAction(actionId);
    }

    /**
     * @dev Execute admin slashing
     */
    function executeSlash(uint256 actionId) external onlyAdmins validAction(actionId) {
        AdminAction storage action = pendingActions[actionId];
        require(action.actionType == ActionType.STAKE_SLASH, "Not a slash action");
        require(action.confirmations >= action.requiredConfirmations, "Insufficient confirmations");

        action.executed = true;

        AdminInfo storage admin = adminInfo[action.target];
        uint256 slashAmount = action.amount;

        if (slashAmount > admin.stakedAmount) {
            slashAmount = admin.stakedAmount;
        }

        admin.stakedAmount -= slashAmount;
        admin.slashCount++;
        rewardPool += slashAmount;
        totalStaked -= slashAmount;

        // Remove admin if slashed too many times
        if (admin.slashCount >= 3) {
            admin.isActive = false;
            totalAdmins--; // FIXED: Update totalAdmins when removing due to slashing
        }

        emit AdminSlashed(action.target, slashAmount, action.reason);
        emit ActionExecuted(actionId, msg.sender);
    }

    /**
     * @dev Claim staking rewards
     */
    function claimRewards() external onlyAdmins nonReentrant {
        uint256 adminStake = adminInfo[msg.sender].stakedAmount;
        require(adminStake > 0, "No stake to claim rewards for");

        uint256 reward = (rewardPool * adminStake) / totalStaked;
        require(reward > 0, "No rewards available");

        adminInfo[msg.sender].rewardsClaimed += reward;
        rewardPool -= reward;

        require(stakingToken.transfer(msg.sender, reward), "Reward transfer failed");

        emit RewardsClaimed(msg.sender, reward);
    }

    /**
     * @dev Withdraw stake (only when not an admin or during emergency)
     */
    function withdrawStake(uint256 amount) external nonReentrant {
        require(
            adminInfo[msg.sender].role == AdminRole.NONE || emergencyMode,
            "Active admins cannot withdraw stake"
        );
        require(adminInfo[msg.sender].stakedAmount >= amount, "Insufficient staked amount");

        adminInfo[msg.sender].stakedAmount -= amount;
        totalStaked -= amount;

        require(stakingToken.transfer(msg.sender, amount), "Stake withdrawal failed");
    }

    // ============ EMERGENCY FUNCTIONS ============

    /**
     * @dev Trigger emergency mode - FIXED: Only RECOVERY_ADMIN, not SUPER_ADMIN
     */
    function triggerEmergency() external {
        require(
            adminInfo[msg.sender].role == AdminRole.RECOVERY_ADMIN && adminInfo[msg.sender].isActive,
            "Only recovery admin can trigger emergency"
        );
        emergencyMode = true;
        emergencyTriggeredBy = msg.sender;
        emergencyStartTime = block.timestamp;

        emit EmergencyModeToggled(true, msg.sender);
    }

    /**
     * @dev Resolve emergency mode
     */
    function resolveEmergency() external onlyRole(AdminRole.SUPER_ADMIN) onlyInEmergency {
        emergencyMode = false;
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

        _executeAddAdmin(admin, role);
    }

    // ============ INTERNAL FUNCTIONS ============

    function _createAction(
        ActionType actionType,
        address target,
        AdminRole newRole,
        uint256 amount,
        bytes memory data,
        string memory reason
    ) internal returns (uint256) {
        uint256 actionId = nextActionId++;

        pendingActions[actionId] = AdminAction({
            id: actionId,
            actionType: actionType,
            proposer: msg.sender,
            target: target,
            newRole: newRole,
            amount: amount,
            data: data,
            confirmations: 0,
            requiredConfirmations: requiredConfirmations,
            deadline: block.timestamp + 7 days,
            executed: false,
            cancelled: false,
            reason: reason
        });

        emit ActionProposed(actionId, msg.sender, actionType);
        return actionId;
    }

    function _confirmAction(uint256 actionId) internal {
        actionConfirmations[actionId][msg.sender] = true;
        pendingActions[actionId].confirmations++;

        emit ActionConfirmed(actionId, msg.sender);
    }

    function _executeAddAdmin(address admin, AdminRole role) internal {
        adminInfo[admin] = AdminInfo({
            role: role,
            stakedAmount: 0,
            slashCount: 0,
            rewardsClaimed: 0,
            joinTimestamp: block.timestamp,
            isActive: true
        });

        adminList.push(admin);
        totalAdmins++;

        // Update required confirmations - FIXED: Calculate after increment
        requiredConfirmations = (totalAdmins * 60) / 100;
        if (requiredConfirmations < 2) requiredConfirmations = 2;

        emit AdminAdded(admin, role, 0);
    }

    function _executeRemoveAdmin(address admin) internal {
        AdminRole oldRole = adminInfo[admin].role;
        adminInfo[admin].isActive = false;
        adminInfo[admin].role = AdminRole.NONE; // FIXED: Set role to NONE when removing
        totalAdmins--;

        // Remove from admin list
        for (uint256 i = 0; i < adminList.length; i++) {
            if (adminList[i] == admin) {
                adminList[i] = adminList[adminList.length - 1];
                adminList.pop();
                break;
            }
        }

        // Update required confirmations - FIXED: Calculate after decrement
        requiredConfirmations = (totalAdmins * 60) / 100;
        if (requiredConfirmations < 2) requiredConfirmations = 2;

        emit AdminRemoved(admin, oldRole);
    }

    function _executeRoleChange(address admin, AdminRole newRole) internal {
        AdminRole oldRole = adminInfo[admin].role;
        adminInfo[admin].role = newRole;

        emit AdminRoleChanged(admin, oldRole, newRole);
    }

    // ============ VIEW FUNCTIONS ============

    function isAdmin(address _address) public view returns (bool) {
        return adminInfo[_address].role != AdminRole.NONE && adminInfo[_address].isActive;
    }

    function getAdminRole(address _address) public view returns (AdminRole) {
        return adminInfo[_address].role;
    }

    function getAdminInfo(address _address) public view returns (AdminInfo memory) {
        return adminInfo[_address];
    }

    function getPendingAction(uint256 actionId) public view returns (AdminAction memory) {
        return pendingActions[actionId];
    }

    function getTimeLock(uint256 lockId) public view returns (TimeLock memory) {
        return timeLocks[lockId];
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

    function hasPermission(address admin, bytes4 functionSelector) public view returns (bool) {
        AdminRole role = adminInfo[admin].role;

        // Super admin has all permissions
        if (role == AdminRole.SUPER_ADMIN) {
            return true;
        }

        return rolePermissions[role][functionSelector];
    }

    /**
     * @dev Get pending actions count
     */
    function getPendingActionsCount() external view returns (uint256) {
        return nextActionId - 1;
    }

    /**
     * @dev Check if action can be executed
     */
    function canExecuteAction(uint256 actionId) external view returns (bool) {
        if (actionId >= nextActionId || actionId == 0) return false;

        AdminAction storage action = pendingActions[actionId];
        return !action.executed && 
               !action.cancelled && 
               block.timestamp <= action.deadline &&
               action.confirmations >= action.requiredConfirmations;
    }
}s