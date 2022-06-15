// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.10;

import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20SnapshotUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/presets/ERC20PresetMinterPauserUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/draft-ERC20PermitUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";


contract RandomToken is
    ERC20PresetMinterPauserUpgradeable,
    ERC20SnapshotUpgradeable,
    EIP712Upgradeable,
    ERC20PermitUpgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable
{
    function initializeToken(uint256 initialSupply) public initializer {
        __UUPSUpgradeable_init();
        __Ownable_init();
        __ERC20Snapshot_init();
        __ERC20PresetMinterPauser_init("Random", "RNDM");
        __ERC20Permit_init("Random");
        _mint(msg.sender, initialSupply);
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    )
        internal
        virtual
        override(
            ERC20SnapshotUpgradeable,
            ERC20PresetMinterPauserUpgradeable,
            ERC20Upgradeable
        )
    {
        super._beforeTokenTransfer(from, to, amount);
    }

    function createSnapshot() public virtual returns (uint256) {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, _msgSender()),
            "ERC20PresetMinterPauser: must have admin role to snapshot"
        );
        return _snapshot();
    }

    function verifyVote(
        string memory mailTo,
        string memory mailContents,
        bytes memory signature
    ) public virtual returns (address) {
        bytes32 digest =
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        keccak256("Mail(address to,string contents)"),
                        mailTo,
                        keccak256(bytes(mailContents))
                    )
                )
            );
        address signer = ECDSAUpgradeable.recover(digest, signature);
        return signer;
    }
}
