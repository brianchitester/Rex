pragma solidity ^0.8.4;
pragma experimental ABIEncoderV2; 

import "hardhat/console.sol";
import "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165Upgradeable.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";

contract TipOfferData {
    struct PaymentToken {
        address erc20; // Ether itself is allowed in the case of return value
        uint256 amount;
        bytes auth; // authorisation; null if underlying contract doesn't support it
    }

    struct Tip {
        PaymentToken[] paymentTokens;
        uint256         amtPayable; // any amtPayable commitment's amount
        string trackName;          // Track name of tipeebeing tipped
        address payable trackOwner;   // record address of track owner
        address offerer;            // only need this if offer is recindable
    }

    struct TipQuery {
        PaymentToken[] paymentTokens;
        uint256 weiValue;
        bool completed; // authorisation; null if underlying contract doesn't support it
    }

    // Dynamic data
    mapping (uint256 => Tip) _tips;

    uint256 _tipId;
    uint256 _tipFeePercentage; 
}

contract TipOffer is TipOfferData, Initializable, UUPSUpgradeable, OwnableUpgradeable {

    using AddressUpgradeable for address;
    using Strings for uint256;
    using SafeERC20Upgradeable for IERC20Upgradeable; 

    error InsufficientBalance(uint256 tipId);
    error TipPayoutFailed(address beneficiary);
    error CommissionPayoutFailed(address beneficiary);
    error CallerNotAuthorised();
    error PayingOutBeforeOfferTaken();

    bytes constant emptyBytes = new bytes(0x00);

    function _authorizeUpgrade(address) internal override onlyOwner {}

    function initialize() public initializer
    {
        __Ownable_init();
        _tipId = 1; 
        _tipFeePercentage = 0;
    }

    function reconfigure(uint256 commission) public onlyOwner
    {
        require(commission<=10000, "Commission limits 0..10000(100%)");
        _tipFeePercentage = commission;
    }

    function getAdmin() public view returns(address) {
        return owner();
    }

    event CreateTip(address indexed offerer, string indexed trackName, uint256 indexed tipId);
    event CollectTips(string indexed trackName, address tipee);
    event CancelTip(address indexed offerer, string indexed trackName, uint256 indexed tipId);

    /****
     * 
     * @param paymentTokens: ERC20 tokens to be committed
     * @param trackName: the trackName of the entity who can receive the tip
     */ 
    function createTip(PaymentToken[] memory paymentTokens, string memory trackName) public payable
    {
        require ((paymentTokens.length > 0 || msg.value > 0), "Tip requires base value or ERC20 payment");

        _tips[_tipId].trackName = trackName;
        _tips[_tipId].trackOwner  = payable(0); // null
        _tips[_tipId].amtPayable = msg.value;
        _tips[_tipId].offerer = msg.sender;
 
        for (uint256 index = 0; index < paymentTokens.length; index++)
        {
            _tips[_tipId].paymentTokens.push(paymentTokens[index]);
            IERC20Upgradeable paymentTokenContract = IERC20Upgradeable(paymentTokens[index].erc20);
            paymentTokenContract.safeTransferFrom(msg.sender, address(this), paymentTokens[index].amount); 
        }
        
        emit CreateTip(msg.sender, trackName, _tipId);
        _tipId++;
    }

    function checktrackName(string memory trackNameId, string memory checkId) internal pure returns(bool)
    {
        return (keccak256(abi.encodePacked((trackNameId))) == 
                    keccak256(abi.encodePacked((checkId))));
    }


    function collectTip(uint256[] memory tipIds) external 
    {
        //recover the commitment ID
        address payable subjectAddress;
        bool passedVerification;
        require(tipIds.length > 0, "No TipIds");
        string memory trackName = _tips[tipIds[0]].trackName;

        uint256 cumulativeWeiValue = 0;
        for (uint256 index = 0; index < tipIds.length; index++)
        {
            uint256 tipId = tipIds[index];
            require(_tips[tipId].trackOwner == address(0), "Tip already collected");
            if (index > 0) { require(checktrackName(trackName, _tips[tipId].trackName), "Not your tip"); }
            uint256 ethValue = _tips[tipId].amtPayable;
            _tips[tipId].amtPayable = 0; //prevent re-entrancy; if we hit a revert this is unwound
            if (_tips[tipId].paymentTokens.length > 0) payTokens(_tips[tipId], tipId, subjectAddress, _tipFeePercentage);
            _tips[tipId].trackOwner = subjectAddress;
            cumulativeWeiValue += ethValue; //add after we pay tokens, in case payTokens reverted
        }

        //Pay ETH in one transaction to save gas
        payEth(cumulativeWeiValue, subjectAddress, _tipFeePercentage);

        emit CollectTips(_tips[0].trackName, subjectAddress);
    }

    function payEth(uint256 cumulativeTip, address payable beneficiary, uint256 commissionMultiplier) internal
    {
        bool paymentSuccessful;
        if (cumulativeTip > 0)
        {
            uint256 commissionWei = (cumulativeTip * commissionMultiplier)/10000;

            if (commissionWei > 0)
            {
                (paymentSuccessful, ) = owner().call{value: commissionWei}(""); //commission
                if (!paymentSuccessful) {
                    revert CommissionPayoutFailed(beneficiary);
                }
            }

            (paymentSuccessful, ) =  beneficiary.call{value: (cumulativeTip - commissionWei)}(""); //payment to signer
            if (!paymentSuccessful) {
                revert TipPayoutFailed(beneficiary);
            }
        }
    }

    function payTokens(Tip memory thisTip, uint256 tipId, address payable beneficiary, uint256 commissionMultiplier) internal
    {        
        // Transfer ERC20 payments - these will have been stored within this contract, and are moving to the payee
        // Note that this may change in future, we may want a single move from token owner's account to the payee
        for (uint256 index = 0; index < thisTip.paymentTokens.length; index++)
        {
            IERC20Upgradeable tokenContract = IERC20Upgradeable(thisTip.paymentTokens[index].erc20);
            uint256 transferVal = thisTip.paymentTokens[index].amount;
            _tips[tipId].paymentTokens[index].amount = 0; //zeroise to avoid re-entrancy attacks
            if (commissionMultiplier > 0)
            {
                uint256 commissionVal = (transferVal * commissionMultiplier)/10000;
                transferVal = transferVal - commissionVal;
                tokenContract.safeTransfer(owner(), commissionVal);
            }
            
            tokenContract.safeTransfer(beneficiary, transferVal);
        }
    }

    // Fetch details of a specific commitment
    function getTip(uint256 tipId) external view 
        returns (PaymentToken[] memory paymentTokens, address offerer, uint256 weiValue, string memory trackName, address payee, bool completed)
    {
        Tip memory tip = _tips[tipId];
        paymentTokens = tip.paymentTokens;
        
        trackName = tip.trackName;
        weiValue = tip.amtPayable;
        offerer = tip.offerer;
        payee = tip.trackOwner;
        completed = (tip.trackOwner != address(0));
    }

    function getTips(uint256[] memory tipIds) external view 
        returns (TipQuery[] memory tips)
    {
        tips = new TipQuery[](tipIds.length);
        for (uint256 index = 0; index < tipIds.length; index++)
        {
            Tip memory tip = _tips[tipIds[index]];
            tips[index].paymentTokens = tip.paymentTokens;
            tips[index].weiValue = tip.amtPayable;
            tips[index].completed = (tip.trackOwner != address(0));
        }
    }

    function getTipStatus(uint256[] memory tipIds) external view 
        returns (bool[] memory completed)
    {
        completed = new bool[](tipIds.length);
        for (uint256 index = 0; index < tipIds.length; index++)
        {
            Tip memory tip = _tips[tipIds[index]];
            completed[index] = (tip.trackOwner != address(0));
        }
    }
    
    // Need to implement this to receive ERC721 Tokens
    function onERC721Received(address, address, uint256, bytes calldata) external pure returns(bytes4) 
    {
        return bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"));
    } 
    
    function getTipFeeFactor() external view returns(uint256)
    {
        return _tipFeePercentage;
    }

    function cancelTip(uint256 tipId) external payable
    {
        require(msg.sender == _tips[tipId].offerer, "Must be tip owner");

        payTokens(_tips[tipId], tipId, payable(_tips[tipId].offerer), 0);
        payEth(_tips[tipId].amtPayable, payable(_tips[tipId].offerer), 0);

        //emit event to aid bookkeeping
        emit CancelTip(_tips[tipId].offerer, _tips[tipId].trackName, tipId);
        delete (_tips[tipId]);
    }
}