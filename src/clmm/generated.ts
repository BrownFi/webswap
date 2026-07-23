import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

import {
  createReadContract,
  createWriteContract,
  createSimulateContract,
  createWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// AlgebraBasePluginV1
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const algebraBasePluginV1Abi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_pool', internalType: 'address', type: 'address' },
      { name: '_factory', internalType: 'address', type: 'address' },
      { name: '_pluginFactory', internalType: 'address', type: 'address' },
      {
        name: '_config',
        internalType: 'struct AlgebraFeeConfiguration',
        type: 'tuple',
        components: [
          { name: 'alpha1', internalType: 'uint16', type: 'uint16' },
          { name: 'alpha2', internalType: 'uint16', type: 'uint16' },
          { name: 'beta1', internalType: 'uint32', type: 'uint32' },
          { name: 'beta2', internalType: 'uint32', type: 'uint32' },
          { name: 'gamma1', internalType: 'uint16', type: 'uint16' },
          { name: 'gamma2', internalType: 'uint16', type: 'uint16' },
          { name: 'baseFee', internalType: 'uint16', type: 'uint16' },
        ],
      },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'targetIsTooOld' },
  { type: 'error', inputs: [], name: 'transferFailed' },
  { type: 'error', inputs: [], name: 'volatilityOracleAlreadyInitialized' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'feeConfig',
        internalType: 'struct AlgebraFeeConfiguration',
        type: 'tuple',
        components: [
          { name: 'alpha1', internalType: 'uint16', type: 'uint16' },
          { name: 'alpha2', internalType: 'uint16', type: 'uint16' },
          { name: 'beta1', internalType: 'uint32', type: 'uint32' },
          { name: 'beta2', internalType: 'uint32', type: 'uint32' },
          { name: 'gamma1', internalType: 'uint16', type: 'uint16' },
          { name: 'gamma2', internalType: 'uint16', type: 'uint16' },
          { name: 'baseFee', internalType: 'uint16', type: 'uint16' },
        ],
        indexed: false,
      },
    ],
    name: 'FeeConfiguration',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'newIncentive',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Incentive',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ALGEBRA_BASE_PLUGIN_MANAGER',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'afterFlash',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint160', type: 'uint160' },
      { name: 'tick', internalType: 'int24', type: 'int24' },
    ],
    name: 'afterInitialize',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'int24', type: 'int24' },
      { name: '', internalType: 'int24', type: 'int24' },
      { name: '', internalType: 'int128', type: 'int128' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'afterModifyPosition',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
      { name: 'zeroToOne', internalType: 'bool', type: 'bool' },
      { name: '', internalType: 'int256', type: 'int256' },
      { name: '', internalType: 'uint160', type: 'uint160' },
      { name: '', internalType: 'int256', type: 'int256' },
      { name: '', internalType: 'int256', type: 'int256' },
      { name: '', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'afterSwap',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'beforeFlash',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint160', type: 'uint160' },
    ],
    name: 'beforeInitialize',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'int24', type: 'int24' },
      { name: '', internalType: 'int24', type: 'int24' },
      { name: '', internalType: 'int128', type: 'int128' },
      { name: '', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'beforeModifyPosition',
    outputs: [
      { name: '', internalType: 'bytes4', type: 'bytes4' },
      { name: '', internalType: 'uint24', type: 'uint24' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'bool', type: 'bool' },
      { name: '', internalType: 'int256', type: 'int256' },
      { name: '', internalType: 'uint160', type: 'uint160' },
      { name: '', internalType: 'bool', type: 'bool' },
      { name: '', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'beforeSwap',
    outputs: [
      { name: '', internalType: 'bytes4', type: 'bytes4' },
      { name: '', internalType: 'uint24', type: 'uint24' },
      { name: '', internalType: 'uint24', type: 'uint24' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_config',
        internalType: 'struct AlgebraFeeConfiguration',
        type: 'tuple',
        components: [
          { name: 'alpha1', internalType: 'uint16', type: 'uint16' },
          { name: 'alpha2', internalType: 'uint16', type: 'uint16' },
          { name: 'beta1', internalType: 'uint32', type: 'uint32' },
          { name: 'beta2', internalType: 'uint32', type: 'uint32' },
          { name: 'gamma1', internalType: 'uint16', type: 'uint16' },
          { name: 'gamma2', internalType: 'uint16', type: 'uint16' },
          { name: 'baseFee', internalType: 'uint16', type: 'uint16' },
        ],
      },
    ],
    name: 'changeFeeConfiguration',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'recipient', internalType: 'address', type: 'address' },
    ],
    name: 'collectPluginFee',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'defaultPluginConfig',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'feeConfig',
    outputs: [
      { name: 'alpha1', internalType: 'uint16', type: 'uint16' },
      { name: 'alpha2', internalType: 'uint16', type: 'uint16' },
      { name: 'beta1', internalType: 'uint32', type: 'uint32' },
      { name: 'beta2', internalType: 'uint32', type: 'uint32' },
      { name: 'gamma1', internalType: 'uint16', type: 'uint16' },
      { name: 'gamma2', internalType: 'uint16', type: 'uint16' },
      { name: 'baseFee', internalType: 'uint16', type: 'uint16' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getCurrentFee',
    outputs: [{ name: 'fee', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getPool',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'secondsAgo', internalType: 'uint32', type: 'uint32' }],
    name: 'getSingleTimepoint',
    outputs: [
      { name: 'tickCumulative', internalType: 'int56', type: 'int56' },
      { name: 'volatilityCumulative', internalType: 'uint88', type: 'uint88' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'secondsAgos', internalType: 'uint32[]', type: 'uint32[]' },
    ],
    name: 'getTimepoints',
    outputs: [
      { name: 'tickCumulatives', internalType: 'int56[]', type: 'int56[]' },
      {
        name: 'volatilityCumulatives',
        internalType: 'uint88[]',
        type: 'uint88[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'handlePluginFee',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'incentive',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'targetIncentive', internalType: 'address', type: 'address' },
    ],
    name: 'isIncentiveConnected',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'isInitialized',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'lastTimepointTimestamp',
    outputs: [{ name: '', internalType: 'uint32', type: 'uint32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pool',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'startIndex', internalType: 'uint16', type: 'uint16' },
      { name: 'amount', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'prepayTimepointsStorageSlots',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newIncentive', internalType: 'address', type: 'address' },
    ],
    name: 'setIncentive',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'timepointIndex',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'timepoints',
    outputs: [
      { name: 'initialized', internalType: 'bool', type: 'bool' },
      { name: 'blockTimestamp', internalType: 'uint32', type: 'uint32' },
      { name: 'tickCumulative', internalType: 'int56', type: 'int56' },
      { name: 'volatilityCumulative', internalType: 'uint88', type: 'uint88' },
      { name: 'tick', internalType: 'int24', type: 'int24' },
      { name: 'averageTick', internalType: 'int24', type: 'int24' },
      { name: 'windowStartIndex', internalType: 'uint16', type: 'uint16' },
    ],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// AlgebraCustomPoolEntryPoint
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const algebraCustomPoolEntryPointAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_algebraFactory', internalType: 'address', type: 'address' },
      { name: '_entryPoint', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'newConfig',
        internalType: 'struct AlgebraFeeConfiguration',
        type: 'tuple',
        components: [
          { name: 'alpha1', internalType: 'uint16', type: 'uint16' },
          { name: 'alpha2', internalType: 'uint16', type: 'uint16' },
          { name: 'beta1', internalType: 'uint32', type: 'uint32' },
          { name: 'beta2', internalType: 'uint32', type: 'uint32' },
          { name: 'gamma1', internalType: 'uint16', type: 'uint16' },
          { name: 'gamma2', internalType: 'uint16', type: 'uint16' },
          { name: 'baseFee', internalType: 'uint16', type: 'uint16' },
        ],
        indexed: false,
      },
    ],
    name: 'DefaultFeeConfiguration',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'newFarmingAddress',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'FarmingAddress',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ALGEBRA_CUSTOM_PLUGIN_ADMINISTRATOR',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
    ],
    name: 'afterCreatePoolHook',
    outputs: [],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'algebraFactory',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'pool', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'beforeCreatePoolHook',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'creator', internalType: 'address', type: 'address' },
      { name: 'tokenA', internalType: 'address', type: 'address' },
      { name: 'tokenB', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'createCustomPool',
    outputs: [{ name: 'customPool', internalType: 'address', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'defaultFeeConfiguration',
    outputs: [
      { name: 'alpha1', internalType: 'uint16', type: 'uint16' },
      { name: 'alpha2', internalType: 'uint16', type: 'uint16' },
      { name: 'beta1', internalType: 'uint32', type: 'uint32' },
      { name: 'beta2', internalType: 'uint32', type: 'uint32' },
      { name: 'gamma1', internalType: 'uint16', type: 'uint16' },
      { name: 'gamma2', internalType: 'uint16', type: 'uint16' },
      { name: 'baseFee', internalType: 'uint16', type: 'uint16' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'entryPoint',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'farmingAddress',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'poolAddress', internalType: 'address', type: 'address' }],
    name: 'pluginByPool',
    outputs: [
      { name: 'pluginAddress', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'newConfig',
        internalType: 'struct AlgebraFeeConfiguration',
        type: 'tuple',
        components: [
          { name: 'alpha1', internalType: 'uint16', type: 'uint16' },
          { name: 'alpha2', internalType: 'uint16', type: 'uint16' },
          { name: 'beta1', internalType: 'uint32', type: 'uint32' },
          { name: 'beta2', internalType: 'uint32', type: 'uint32' },
          { name: 'gamma1', internalType: 'uint16', type: 'uint16' },
          { name: 'gamma2', internalType: 'uint16', type: 'uint16' },
          { name: 'baseFee', internalType: 'uint16', type: 'uint16' },
        ],
      },
    ],
    name: 'setDefaultFeeConfiguration',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newFarmingAddress', internalType: 'address', type: 'address' },
    ],
    name: 'setFarmingAddress',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// AlgebraEternalFarming
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const algebraEternalFarmingAbi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: '_deployer',
        internalType: 'contract IAlgebraPoolDeployer',
        type: 'address',
      },
      {
        name: '_nonfungiblePositionManager',
        internalType: 'contract INonfungiblePositionManager',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'anotherFarmingIsActive' },
  { type: 'error', inputs: [], name: 'claimToZeroAddress' },
  { type: 'error', inputs: [], name: 'emergencyActivated' },
  { type: 'error', inputs: [], name: 'farmDoesNotExist' },
  { type: 'error', inputs: [], name: 'incentiveNotExist' },
  { type: 'error', inputs: [], name: 'incentiveStopped' },
  { type: 'error', inputs: [], name: 'invalidPool' },
  { type: 'error', inputs: [], name: 'invalidTokenAmount' },
  { type: 'error', inputs: [], name: 'minimalPositionWidthTooWide' },
  { type: 'error', inputs: [], name: 'pluginNotConnected' },
  { type: 'error', inputs: [], name: 'poolReentrancyLock' },
  { type: 'error', inputs: [], name: 'positionIsTooNarrow' },
  { type: 'error', inputs: [], name: 'reentrancyLock' },
  { type: 'error', inputs: [], name: 'tokenAlreadyFarmed' },
  { type: 'error', inputs: [], name: 'zeroLiquidity' },
  { type: 'error', inputs: [], name: 'zeroRewardAmount' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'newStatus', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'EmergencyWithdraw',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'rewardToken',
        internalType: 'contract IERC20Minimal',
        type: 'address',
        indexed: true,
      },
      {
        name: 'bonusRewardToken',
        internalType: 'contract IERC20Minimal',
        type: 'address',
        indexed: true,
      },
      {
        name: 'pool',
        internalType: 'contract IAlgebraPool',
        type: 'address',
        indexed: true,
      },
      {
        name: 'virtualPool',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'nonce',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'reward',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'bonusReward',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'minimalAllowedPositionWidth',
        internalType: 'uint24',
        type: 'uint24',
        indexed: false,
      },
    ],
    name: 'EternalFarmingCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'incentiveId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'rewardAddress',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'bonusRewardToken',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'reward',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'bonusReward',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'FarmEnded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'incentiveId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'liquidity',
        internalType: 'uint128',
        type: 'uint128',
        indexed: false,
      },
    ],
    name: 'FarmEntered',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'farmingCenter',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'FarmingCenter',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'incentiveId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'IncentiveDeactivated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'rewardAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'bonusRewardAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'incentiveId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
    ],
    name: 'RewardAmountsDecreased',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'reward',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'rewardAddress',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RewardClaimed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'rewardAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'bonusRewardAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'incentiveId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
    ],
    name: 'RewardsAdded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'incentiveId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
      {
        name: 'rewardAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'bonusRewardAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'RewardsCollected',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'rewardRate',
        internalType: 'uint128',
        type: 'uint128',
        indexed: false,
      },
      {
        name: 'bonusRewardRate',
        internalType: 'uint128',
        type: 'uint128',
        indexed: false,
      },
      {
        name: 'incentiveId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
    ],
    name: 'RewardsRatesChanged',
  },
  {
    type: 'function',
    inputs: [],
    name: 'FARMINGS_ADMINISTRATOR_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'INCENTIVE_MAKER_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'key',
        internalType: 'struct IncentiveKey',
        type: 'tuple',
        components: [
          {
            name: 'rewardToken',
            internalType: 'contract IERC20Minimal',
            type: 'address',
          },
          {
            name: 'bonusRewardToken',
            internalType: 'contract IERC20Minimal',
            type: 'address',
          },
          {
            name: 'pool',
            internalType: 'contract IAlgebraPool',
            type: 'address',
          },
          { name: 'nonce', internalType: 'uint256', type: 'uint256' },
        ],
      },
      { name: 'rewardAmount', internalType: 'uint128', type: 'uint128' },
      { name: 'bonusRewardAmount', internalType: 'uint128', type: 'uint128' },
    ],
    name: 'addRewards',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'rewardToken',
        internalType: 'contract IERC20Minimal',
        type: 'address',
      },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amountRequested', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'claimReward',
    outputs: [{ name: 'reward', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'rewardToken',
        internalType: 'contract IERC20Minimal',
        type: 'address',
      },
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amountRequested', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'claimRewardFrom',
    outputs: [{ name: 'reward', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'key',
        internalType: 'struct IncentiveKey',
        type: 'tuple',
        components: [
          {
            name: 'rewardToken',
            internalType: 'contract IERC20Minimal',
            type: 'address',
          },
          {
            name: 'bonusRewardToken',
            internalType: 'contract IERC20Minimal',
            type: 'address',
          },
          {
            name: 'pool',
            internalType: 'contract IAlgebraPool',
            type: 'address',
          },
          { name: 'nonce', internalType: 'uint256', type: 'uint256' },
        ],
      },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: '_owner', internalType: 'address', type: 'address' },
    ],
    name: 'collectRewards',
    outputs: [
      { name: 'reward', internalType: 'uint256', type: 'uint256' },
      { name: 'bonusReward', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'key',
        internalType: 'struct IncentiveKey',
        type: 'tuple',
        components: [
          {
            name: 'rewardToken',
            internalType: 'contract IERC20Minimal',
            type: 'address',
          },
          {
            name: 'bonusRewardToken',
            internalType: 'contract IERC20Minimal',
            type: 'address',
          },
          {
            name: 'pool',
            internalType: 'contract IAlgebraPool',
            type: 'address',
          },
          { name: 'nonce', internalType: 'uint256', type: 'uint256' },
        ],
      },
      {
        name: 'params',
        internalType: 'struct IAlgebraEternalFarming.IncentiveParams',
        type: 'tuple',
        components: [
          { name: 'reward', internalType: 'uint128', type: 'uint128' },
          { name: 'bonusReward', internalType: 'uint128', type: 'uint128' },
          { name: 'rewardRate', internalType: 'uint128', type: 'uint128' },
          { name: 'bonusRewardRate', internalType: 'uint128', type: 'uint128' },
          {
            name: 'minimalPositionWidth',
            internalType: 'uint24',
            type: 'uint24',
          },
        ],
      },
      { name: 'plugin', internalType: 'address', type: 'address' },
    ],
    name: 'createEternalFarming',
    outputs: [
      { name: 'virtualPool', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'key',
        internalType: 'struct IncentiveKey',
        type: 'tuple',
        components: [
          {
            name: 'rewardToken',
            internalType: 'contract IERC20Minimal',
            type: 'address',
          },
          {
            name: 'bonusRewardToken',
            internalType: 'contract IERC20Minimal',
            type: 'address',
          },
          {
            name: 'pool',
            internalType: 'contract IAlgebraPool',
            type: 'address',
          },
          { name: 'nonce', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    name: 'deactivateIncentive',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'key',
        internalType: 'struct IncentiveKey',
        type: 'tuple',
        components: [
          {
            name: 'rewardToken',
            internalType: 'contract IERC20Minimal',
            type: 'address',
          },
          {
            name: 'bonusRewardToken',
            internalType: 'contract IERC20Minimal',
            type: 'address',
          },
          {
            name: 'pool',
            internalType: 'contract IAlgebraPool',
            type: 'address',
          },
          { name: 'nonce', internalType: 'uint256', type: 'uint256' },
        ],
      },
      { name: 'rewardAmount', internalType: 'uint128', type: 'uint128' },
      { name: 'bonusRewardAmount', internalType: 'uint128', type: 'uint128' },
    ],
    name: 'decreaseRewardsAmount',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'key',
        internalType: 'struct IncentiveKey',
        type: 'tuple',
        components: [
          {
            name: 'rewardToken',
            internalType: 'contract IERC20Minimal',
            type: 'address',
          },
          {
            name: 'bonusRewardToken',
            internalType: 'contract IERC20Minimal',
            type: 'address',
          },
          {
            name: 'pool',
            internalType: 'contract IAlgebraPool',
            type: 'address',
          },
          { name: 'nonce', internalType: 'uint256', type: 'uint256' },
        ],
      },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'enterFarming',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'key',
        internalType: 'struct IncentiveKey',
        type: 'tuple',
        components: [
          {
            name: 'rewardToken',
            internalType: 'contract IERC20Minimal',
            type: 'address',
          },
          {
            name: 'bonusRewardToken',
            internalType: 'contract IERC20Minimal',
            type: 'address',
          },
          {
            name: 'pool',
            internalType: 'contract IAlgebraPool',
            type: 'address',
          },
          { name: 'nonce', internalType: 'uint256', type: 'uint256' },
        ],
      },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: '_owner', internalType: 'address', type: 'address' },
    ],
    name: 'exitFarming',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'farmingCenter',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'incentiveId', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'farms',
    outputs: [
      { name: 'liquidity', internalType: 'uint128', type: 'uint128' },
      { name: 'tickLower', internalType: 'int24', type: 'int24' },
      { name: 'tickUpper', internalType: 'int24', type: 'int24' },
      { name: 'innerRewardGrowth0', internalType: 'uint256', type: 'uint256' },
      { name: 'innerRewardGrowth1', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'key',
        internalType: 'struct IncentiveKey',
        type: 'tuple',
        components: [
          {
            name: 'rewardToken',
            internalType: 'contract IERC20Minimal',
            type: 'address',
          },
          {
            name: 'bonusRewardToken',
            internalType: 'contract IERC20Minimal',
            type: 'address',
          },
          {
            name: 'pool',
            internalType: 'contract IAlgebraPool',
            type: 'address',
          },
          { name: 'nonce', internalType: 'uint256', type: 'uint256' },
        ],
      },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getRewardInfo',
    outputs: [
      { name: 'reward', internalType: 'uint256', type: 'uint256' },
      { name: 'bonusReward', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'pool', internalType: 'address', type: 'address' }],
    name: 'incentiveKeys',
    outputs: [
      {
        name: 'rewardToken',
        internalType: 'contract IERC20Minimal',
        type: 'address',
      },
      {
        name: 'bonusRewardToken',
        internalType: 'contract IERC20Minimal',
        type: 'address',
      },
      { name: 'pool', internalType: 'contract IAlgebraPool', type: 'address' },
      { name: 'nonce', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'incentiveId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'incentives',
    outputs: [
      { name: 'totalReward', internalType: 'uint128', type: 'uint128' },
      { name: 'bonusReward', internalType: 'uint128', type: 'uint128' },
      { name: 'virtualPoolAddress', internalType: 'address', type: 'address' },
      { name: 'minimalPositionWidth', internalType: 'uint24', type: 'uint24' },
      { name: 'deactivated', internalType: 'bool', type: 'bool' },
      { name: 'pluginAddress', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'isEmergencyWithdrawActivated',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'incentiveId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'isIncentiveDeactivated',
    outputs: [{ name: 'res', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'nonfungiblePositionManager',
    outputs: [
      {
        name: '',
        internalType: 'contract INonfungiblePositionManager',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'numOfIncentives',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      {
        name: 'rewardToken',
        internalType: 'contract IERC20Minimal',
        type: 'address',
      },
    ],
    name: 'rewards',
    outputs: [
      { name: 'rewardAmount', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'newStatus', internalType: 'bool', type: 'bool' }],
    name: 'setEmergencyWithdrawStatus',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_farmingCenter', internalType: 'address', type: 'address' },
    ],
    name: 'setFarmingCenterAddress',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'key',
        internalType: 'struct IncentiveKey',
        type: 'tuple',
        components: [
          {
            name: 'rewardToken',
            internalType: 'contract IERC20Minimal',
            type: 'address',
          },
          {
            name: 'bonusRewardToken',
            internalType: 'contract IERC20Minimal',
            type: 'address',
          },
          {
            name: 'pool',
            internalType: 'contract IAlgebraPool',
            type: 'address',
          },
          { name: 'nonce', internalType: 'uint256', type: 'uint256' },
        ],
      },
      { name: 'rewardRate', internalType: 'uint128', type: 'uint128' },
      { name: 'bonusRewardRate', internalType: 'uint128', type: 'uint128' },
    ],
    name: 'setRates',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

/**
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const algebraEternalFarmingAddress = {
  43111: '0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1',
} as const

/**
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const algebraEternalFarmingConfig = {
  address: algebraEternalFarmingAddress,
  abi: algebraEternalFarmingAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// AlgebraFactory
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const algebraFactoryAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_poolDeployer', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'deployer',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'token0',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'token1',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'pool',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'CustomPool',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'newDefaultCommunityFee',
        internalType: 'uint16',
        type: 'uint16',
        indexed: false,
      },
    ],
    name: 'DefaultCommunityFee',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'newDefaultFee',
        internalType: 'uint16',
        type: 'uint16',
        indexed: false,
      },
    ],
    name: 'DefaultFee',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'defaultPluginFactoryAddress',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'DefaultPluginFactory',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'newDefaultTickspacing',
        internalType: 'int24',
        type: 'int24',
        indexed: false,
      },
    ],
    name: 'DefaultTickspacing',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferStarted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'token0',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'token1',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'pool',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Pool',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'timestamp',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'RenounceOwnershipFinish',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'timestamp',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'finishTimestamp',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'RenounceOwnershipStart',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'timestamp',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'RenounceOwnershipStop',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'previousAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'newAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'RoleAdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleGranted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleRevoked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'newVaultFactory',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'VaultFactory',
  },
  {
    type: 'function',
    inputs: [],
    name: 'CUSTOM_POOL_DEPLOYER',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'POOLS_ADMINISTRATOR_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'POOL_INIT_CODE_HASH',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'acceptOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'deployer', internalType: 'address', type: 'address' },
      { name: 'token0', internalType: 'address', type: 'address' },
      { name: 'token1', internalType: 'address', type: 'address' },
    ],
    name: 'computeCustomPoolAddress',
    outputs: [{ name: 'customPool', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token0', internalType: 'address', type: 'address' },
      { name: 'token1', internalType: 'address', type: 'address' },
    ],
    name: 'computePoolAddress',
    outputs: [{ name: 'pool', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'deployer', internalType: 'address', type: 'address' },
      { name: 'creator', internalType: 'address', type: 'address' },
      { name: 'tokenA', internalType: 'address', type: 'address' },
      { name: 'tokenB', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'createCustomPool',
    outputs: [{ name: 'customPool', internalType: 'address', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'tokenA', internalType: 'address', type: 'address' },
      { name: 'tokenB', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'createPool',
    outputs: [{ name: 'pool', internalType: 'address', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
    ],
    name: 'customPoolByPair',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'defaultCommunityFee',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'defaultConfigurationForPool',
    outputs: [
      { name: 'communityFee', internalType: 'uint16', type: 'uint16' },
      { name: 'tickSpacing', internalType: 'int24', type: 'int24' },
      { name: 'fee', internalType: 'uint16', type: 'uint16' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'defaultFee',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'defaultPluginFactory',
    outputs: [
      {
        name: '',
        internalType: 'contract IAlgebraPluginFactory',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'defaultTickspacing',
    outputs: [{ name: '', internalType: 'int24', type: 'int24' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'index', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getRoleMember',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleMemberCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRoleOrOwner',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pendingOwner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
    ],
    name: 'poolByPair',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'poolDeployer',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnershipStartTimestamp',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'newDefaultCommunityFee',
        internalType: 'uint16',
        type: 'uint16',
      },
    ],
    name: 'setDefaultCommunityFee',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newDefaultFee', internalType: 'uint16', type: 'uint16' }],
    name: 'setDefaultFee',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'newDefaultPluginFactory',
        internalType: 'address',
        type: 'address',
      },
    ],
    name: 'setDefaultPluginFactory',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newDefaultTickspacing', internalType: 'int24', type: 'int24' },
    ],
    name: 'setDefaultTickspacing',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newVaultFactory', internalType: 'address', type: 'address' },
    ],
    name: 'setVaultFactory',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'startRenounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'stopRenounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'vaultFactory',
    outputs: [
      {
        name: '',
        internalType: 'contract IAlgebraVaultFactory',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
] as const

/**
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const algebraFactoryAddress = {
  43111: '0x10253594A832f967994b44f33411940533302ACb',
} as const

/**
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const algebraFactoryConfig = {
  address: algebraFactoryAddress,
  abi: algebraFactoryAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// AlgebraPool
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const algebraPoolAbi = [
  { type: 'error', inputs: [], name: 'alreadyInitialized' },
  { type: 'error', inputs: [], name: 'arithmeticError' },
  { type: 'error', inputs: [], name: 'bottomTickLowerThanMIN' },
  { type: 'error', inputs: [], name: 'dynamicFeeActive' },
  { type: 'error', inputs: [], name: 'dynamicFeeDisabled' },
  { type: 'error', inputs: [], name: 'flashInsufficientPaid0' },
  { type: 'error', inputs: [], name: 'flashInsufficientPaid1' },
  { type: 'error', inputs: [], name: 'incorrectPluginFee' },
  { type: 'error', inputs: [], name: 'insufficientInputAmount' },
  { type: 'error', inputs: [], name: 'invalidAmountRequired' },
  {
    type: 'error',
    inputs: [
      { name: 'expectedSelector', internalType: 'bytes4', type: 'bytes4' },
    ],
    name: 'invalidHookResponse',
  },
  { type: 'error', inputs: [], name: 'invalidLimitSqrtPrice' },
  { type: 'error', inputs: [], name: 'invalidNewCommunityFee' },
  { type: 'error', inputs: [], name: 'invalidNewTickSpacing' },
  { type: 'error', inputs: [], name: 'liquidityAdd' },
  { type: 'error', inputs: [], name: 'liquidityOverflow' },
  { type: 'error', inputs: [], name: 'liquiditySub' },
  { type: 'error', inputs: [], name: 'locked' },
  { type: 'error', inputs: [], name: 'notAllowed' },
  { type: 'error', inputs: [], name: 'notInitialized' },
  { type: 'error', inputs: [], name: 'pluginIsNotConnected' },
  { type: 'error', inputs: [], name: 'priceOutOfRange' },
  { type: 'error', inputs: [], name: 'tickInvalidLinks' },
  { type: 'error', inputs: [], name: 'tickIsNotInitialized' },
  { type: 'error', inputs: [], name: 'tickIsNotSpaced' },
  { type: 'error', inputs: [], name: 'tickOutOfRange' },
  { type: 'error', inputs: [], name: 'topTickAboveMAX' },
  { type: 'error', inputs: [], name: 'topTickLowerOrEqBottomTick' },
  { type: 'error', inputs: [], name: 'transferFailed' },
  { type: 'error', inputs: [], name: 'zeroAmountRequired' },
  { type: 'error', inputs: [], name: 'zeroLiquidityActual' },
  { type: 'error', inputs: [], name: 'zeroLiquidityDesired' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'bottomTick',
        internalType: 'int24',
        type: 'int24',
        indexed: true,
      },
      { name: 'topTick', internalType: 'int24', type: 'int24', indexed: true },
      {
        name: 'liquidityAmount',
        internalType: 'uint128',
        type: 'uint128',
        indexed: false,
      },
      {
        name: 'amount0',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'amount1',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'pluginFee',
        internalType: 'uint24',
        type: 'uint24',
        indexed: false,
      },
    ],
    name: 'Burn',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'recipient',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'bottomTick',
        internalType: 'int24',
        type: 'int24',
        indexed: true,
      },
      { name: 'topTick', internalType: 'int24', type: 'int24', indexed: true },
      {
        name: 'amount0',
        internalType: 'uint128',
        type: 'uint128',
        indexed: false,
      },
      {
        name: 'amount1',
        internalType: 'uint128',
        type: 'uint128',
        indexed: false,
      },
    ],
    name: 'Collect',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'communityFeeNew',
        internalType: 'uint16',
        type: 'uint16',
        indexed: false,
      },
    ],
    name: 'CommunityFee',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'newCommunityVault',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'CommunityVault',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'amount0',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'amount1',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'ExcessTokens',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'fee', internalType: 'uint16', type: 'uint16', indexed: false },
    ],
    name: 'Fee',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'recipient',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount0',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'amount1',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'paid0',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'paid1',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Flash',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'price',
        internalType: 'uint160',
        type: 'uint160',
        indexed: false,
      },
      { name: 'tick', internalType: 'int24', type: 'int24', indexed: false },
    ],
    name: 'Initialize',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'bottomTick',
        internalType: 'int24',
        type: 'int24',
        indexed: true,
      },
      { name: 'topTick', internalType: 'int24', type: 'int24', indexed: true },
      {
        name: 'liquidityAmount',
        internalType: 'uint128',
        type: 'uint128',
        indexed: false,
      },
      {
        name: 'amount0',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'amount1',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Mint',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'newPluginAddress',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Plugin',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'newPluginConfig',
        internalType: 'uint8',
        type: 'uint8',
        indexed: false,
      },
    ],
    name: 'PluginConfig',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount0',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'amount1',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Skim',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'recipient',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount0',
        internalType: 'int256',
        type: 'int256',
        indexed: false,
      },
      {
        name: 'amount1',
        internalType: 'int256',
        type: 'int256',
        indexed: false,
      },
      {
        name: 'price',
        internalType: 'uint160',
        type: 'uint160',
        indexed: false,
      },
      {
        name: 'liquidity',
        internalType: 'uint128',
        type: 'uint128',
        indexed: false,
      },
      { name: 'tick', internalType: 'int24', type: 'int24', indexed: false },
      {
        name: 'overrideFee',
        internalType: 'uint24',
        type: 'uint24',
        indexed: false,
      },
      {
        name: 'pluginFee',
        internalType: 'uint24',
        type: 'uint24',
        indexed: false,
      },
    ],
    name: 'Swap',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'newTickSpacing',
        internalType: 'int24',
        type: 'int24',
        indexed: false,
      },
    ],
    name: 'TickSpacing',
  },
  {
    type: 'function',
    inputs: [
      { name: 'bottomTick', internalType: 'int24', type: 'int24' },
      { name: 'topTick', internalType: 'int24', type: 'int24' },
      { name: 'amount', internalType: 'uint128', type: 'uint128' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'burn',
    outputs: [
      { name: 'amount0', internalType: 'uint256', type: 'uint256' },
      { name: 'amount1', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'bottomTick', internalType: 'int24', type: 'int24' },
      { name: 'topTick', internalType: 'int24', type: 'int24' },
      { name: 'amount0Requested', internalType: 'uint128', type: 'uint128' },
      { name: 'amount1Requested', internalType: 'uint128', type: 'uint128' },
    ],
    name: 'collect',
    outputs: [
      { name: 'amount0', internalType: 'uint128', type: 'uint128' },
      { name: 'amount1', internalType: 'uint128', type: 'uint128' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'communityVault',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'factory',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'fee',
    outputs: [{ name: 'currentFee', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'amount0', internalType: 'uint256', type: 'uint256' },
      { name: 'amount1', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'flash',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getCommunityFeePending',
    outputs: [
      { name: '', internalType: 'uint128', type: 'uint128' },
      { name: '', internalType: 'uint128', type: 'uint128' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getPluginFeePending',
    outputs: [
      { name: '', internalType: 'uint128', type: 'uint128' },
      { name: '', internalType: 'uint128', type: 'uint128' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getReserves',
    outputs: [
      { name: '', internalType: 'uint128', type: 'uint128' },
      { name: '', internalType: 'uint128', type: 'uint128' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'globalState',
    outputs: [
      { name: 'price', internalType: 'uint160', type: 'uint160' },
      { name: 'tick', internalType: 'int24', type: 'int24' },
      { name: 'lastFee', internalType: 'uint16', type: 'uint16' },
      { name: 'pluginConfig', internalType: 'uint8', type: 'uint8' },
      { name: 'communityFee', internalType: 'uint16', type: 'uint16' },
      { name: 'unlocked', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'initialPrice', internalType: 'uint160', type: 'uint160' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'isUnlocked',
    outputs: [{ name: 'unlocked', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'lastFeeTransferTimestamp',
    outputs: [{ name: '', internalType: 'uint32', type: 'uint32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'liquidity',
    outputs: [{ name: '', internalType: 'uint128', type: 'uint128' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'maxLiquidityPerTick',
    outputs: [{ name: '', internalType: 'uint128', type: 'uint128' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'leftoversRecipient', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'bottomTick', internalType: 'int24', type: 'int24' },
      { name: 'topTick', internalType: 'int24', type: 'int24' },
      { name: 'liquidityDesired', internalType: 'uint128', type: 'uint128' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'mint',
    outputs: [
      { name: 'amount0', internalType: 'uint256', type: 'uint256' },
      { name: 'amount1', internalType: 'uint256', type: 'uint256' },
      { name: 'liquidityActual', internalType: 'uint128', type: 'uint128' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'nextTickGlobal',
    outputs: [{ name: '', internalType: 'int24', type: 'int24' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'plugin',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    name: 'positions',
    outputs: [
      { name: 'liquidity', internalType: 'uint256', type: 'uint256' },
      {
        name: 'innerFeeGrowth0Token',
        internalType: 'uint256',
        type: 'uint256',
      },
      {
        name: 'innerFeeGrowth1Token',
        internalType: 'uint256',
        type: 'uint256',
      },
      { name: 'fees0', internalType: 'uint128', type: 'uint128' },
      { name: 'fees1', internalType: 'uint128', type: 'uint128' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'prevTickGlobal',
    outputs: [{ name: '', internalType: 'int24', type: 'int24' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'safelyGetStateOfAMM',
    outputs: [
      { name: 'sqrtPrice', internalType: 'uint160', type: 'uint160' },
      { name: 'tick', internalType: 'int24', type: 'int24' },
      { name: 'lastFee', internalType: 'uint16', type: 'uint16' },
      { name: 'pluginConfig', internalType: 'uint8', type: 'uint8' },
      { name: 'activeLiquidity', internalType: 'uint128', type: 'uint128' },
      { name: 'nextTick', internalType: 'int24', type: 'int24' },
      { name: 'previousTick', internalType: 'int24', type: 'int24' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newCommunityFee', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'setCommunityFee',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newCommunityVault', internalType: 'address', type: 'address' },
    ],
    name: 'setCommunityVault',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newFee', internalType: 'uint16', type: 'uint16' }],
    name: 'setFee',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newPluginAddress', internalType: 'address', type: 'address' },
    ],
    name: 'setPlugin',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newConfig', internalType: 'uint8', type: 'uint8' }],
    name: 'setPluginConfig',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newTickSpacing', internalType: 'int24', type: 'int24' }],
    name: 'setTickSpacing',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'skim',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'zeroToOne', internalType: 'bool', type: 'bool' },
      { name: 'amountRequired', internalType: 'int256', type: 'int256' },
      { name: 'limitSqrtPrice', internalType: 'uint160', type: 'uint160' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'swap',
    outputs: [
      { name: 'amount0', internalType: 'int256', type: 'int256' },
      { name: 'amount1', internalType: 'int256', type: 'int256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'leftoversRecipient', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'zeroToOne', internalType: 'bool', type: 'bool' },
      { name: 'amountToSell', internalType: 'int256', type: 'int256' },
      { name: 'limitSqrtPrice', internalType: 'uint160', type: 'uint160' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'swapWithPaymentInAdvance',
    outputs: [
      { name: 'amount0', internalType: 'int256', type: 'int256' },
      { name: 'amount1', internalType: 'int256', type: 'int256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'sync',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'tickSpacing',
    outputs: [{ name: '', internalType: 'int24', type: 'int24' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'int16', type: 'int16' }],
    name: 'tickTable',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'tickTreeRoot',
    outputs: [{ name: '', internalType: 'uint32', type: 'uint32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'int16', type: 'int16' }],
    name: 'tickTreeSecondLayer',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'int24', type: 'int24' }],
    name: 'ticks',
    outputs: [
      { name: 'liquidityTotal', internalType: 'uint256', type: 'uint256' },
      { name: 'liquidityDelta', internalType: 'int128', type: 'int128' },
      { name: 'prevTick', internalType: 'int24', type: 'int24' },
      { name: 'nextTick', internalType: 'int24', type: 'int24' },
      {
        name: 'outerFeeGrowth0Token',
        internalType: 'uint256',
        type: 'uint256',
      },
      {
        name: 'outerFeeGrowth1Token',
        internalType: 'uint256',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'token0',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'token1',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalFeeGrowth0Token',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalFeeGrowth1Token',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// AlgebraVirtualPool
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const algebraVirtualPoolAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_farmingAddress', internalType: 'address', type: 'address' },
      { name: '_plugin', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'invalidFeeWeights' },
  { type: 'error', inputs: [], name: 'invalidNewMaxRate' },
  { type: 'error', inputs: [], name: 'invalidNewMinRate' },
  { type: 'error', inputs: [], name: 'liquidityAdd' },
  { type: 'error', inputs: [], name: 'liquidityOverflow' },
  { type: 'error', inputs: [], name: 'liquiditySub' },
  { type: 'error', inputs: [], name: 'onlyFarming' },
  { type: 'error', inputs: [], name: 'onlyPlugin' },
  { type: 'error', inputs: [], name: 'tickInvalidLinks' },
  { type: 'error', inputs: [], name: 'tickIsNotInitialized' },
  {
    type: 'function',
    inputs: [],
    name: 'FEE_WEIGHT_DENOMINATOR',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'RATE_CHANGE_FREQUENCY',
    outputs: [{ name: '', internalType: 'uint32', type: 'uint32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token0Amount', internalType: 'uint128', type: 'uint128' },
      { name: 'token1Amount', internalType: 'uint128', type: 'uint128' },
    ],
    name: 'addRewards',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'bottomTick', internalType: 'int24', type: 'int24' },
      { name: 'topTick', internalType: 'int24', type: 'int24' },
      { name: 'liquidityDelta', internalType: 'int128', type: 'int128' },
      { name: 'currentTick', internalType: 'int24', type: 'int24' },
    ],
    name: 'applyLiquidityDeltaToPosition',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'targetTick', internalType: 'int24', type: 'int24' },
      { name: 'zeroToOne', internalType: 'bool', type: 'bool' },
      { name: 'feeAmount', internalType: 'uint128', type: 'uint128' },
    ],
    name: 'crossTo',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'currentLiquidity',
    outputs: [{ name: '', internalType: 'uint128', type: 'uint128' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'deactivate',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'deactivated',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token0Amount', internalType: 'uint128', type: 'uint128' },
      { name: 'token1Amount', internalType: 'uint128', type: 'uint128' },
    ],
    name: 'decreaseRewards',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'distributeRewards',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'dynamicRateActivated',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'farmingAddress',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'feeWeights',
    outputs: [
      { name: 'weight0', internalType: 'uint16', type: 'uint16' },
      { name: 'weight1', internalType: 'uint16', type: 'uint16' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'bottomTick', internalType: 'int24', type: 'int24' },
      { name: 'topTick', internalType: 'int24', type: 'int24' },
    ],
    name: 'getInnerRewardsGrowth',
    outputs: [
      { name: 'rewardGrowthInside0', internalType: 'uint256', type: 'uint256' },
      { name: 'rewardGrowthInside1', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'globalTick',
    outputs: [{ name: '', internalType: 'int24', type: 'int24' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'plugin',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'prevTimestamp',
    outputs: [{ name: '', internalType: 'uint32', type: 'uint32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'rateLimits',
    outputs: [
      { name: 'maxRewardRate0', internalType: 'uint128', type: 'uint128' },
      { name: 'maxRewardRate1', internalType: 'uint128', type: 'uint128' },
      { name: 'minRewardRate0', internalType: 'uint128', type: 'uint128' },
      { name: 'minRewardRate1', internalType: 'uint128', type: 'uint128' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'rewardRates',
    outputs: [
      { name: 'rate0', internalType: 'uint128', type: 'uint128' },
      { name: 'rate1', internalType: 'uint128', type: 'uint128' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'rewardReserves',
    outputs: [
      { name: 'reserve0', internalType: 'uint128', type: 'uint128' },
      { name: 'reserve1', internalType: 'uint128', type: 'uint128' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_maxRate0', internalType: 'uint128', type: 'uint128' },
      { name: '_maxRate1', internalType: 'uint128', type: 'uint128' },
      { name: '_minRate0', internalType: 'uint128', type: 'uint128' },
      { name: '_minRate1', internalType: 'uint128', type: 'uint128' },
    ],
    name: 'setDynamicRateLimits',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'rate0', internalType: 'uint128', type: 'uint128' },
      { name: 'rate1', internalType: 'uint128', type: 'uint128' },
    ],
    name: 'setRates',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'weight0', internalType: 'uint16', type: 'uint16' },
      { name: 'weight1', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'setWeights',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'isActive', internalType: 'bool', type: 'bool' }],
    name: 'switchDynamicRate',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'tickId', internalType: 'int24', type: 'int24' }],
    name: 'ticks',
    outputs: [
      { name: 'liquidityTotal', internalType: 'uint256', type: 'uint256' },
      { name: 'liquidityDelta', internalType: 'int128', type: 'int128' },
      { name: 'prevTick', internalType: 'int24', type: 'int24' },
      { name: 'nextTick', internalType: 'int24', type: 'int24' },
      {
        name: 'outerFeeGrowth0Token',
        internalType: 'uint256',
        type: 'uint256',
      },
      {
        name: 'outerFeeGrowth1Token',
        internalType: 'uint256',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalRewardGrowth',
    outputs: [
      { name: 'rewardGrowth0', internalType: 'uint256', type: 'uint256' },
      { name: 'rewardGrowth1', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FarmingCenter
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA)
 */
export const farmingCenterAbi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: '_eternalFarming',
        internalType: 'contract IAlgebraEternalFarming',
        type: 'address',
      },
      {
        name: '_nonfungiblePositionManager',
        internalType: 'contract INonfungiblePositionManager',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'algebraPoolDeployer',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'int256', type: 'int256' },
    ],
    name: 'applyLiquidityDelta',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'rewardToken',
        internalType: 'contract IERC20Minimal',
        type: 'address',
      },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amountRequested', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'claimReward',
    outputs: [
      { name: 'rewardBalanceBefore', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'key',
        internalType: 'struct IncentiveKey',
        type: 'tuple',
        components: [
          {
            name: 'rewardToken',
            internalType: 'contract IERC20Minimal',
            type: 'address',
          },
          {
            name: 'bonusRewardToken',
            internalType: 'contract IERC20Minimal',
            type: 'address',
          },
          {
            name: 'pool',
            internalType: 'contract IAlgebraPool',
            type: 'address',
          },
          { name: 'nonce', internalType: 'uint256', type: 'uint256' },
        ],
      },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'collectRewards',
    outputs: [
      { name: 'reward', internalType: 'uint256', type: 'uint256' },
      { name: 'bonusReward', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newVirtualPool', internalType: 'address', type: 'address' },
      {
        name: 'plugin',
        internalType: 'contract IFarmingPlugin',
        type: 'address',
      },
    ],
    name: 'connectVirtualPoolToPlugin',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'deposits',
    outputs: [
      { name: 'incentiveId', internalType: 'bytes32', type: 'bytes32' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'virtualPool', internalType: 'address', type: 'address' },
      {
        name: 'plugin',
        internalType: 'contract IFarmingPlugin',
        type: 'address',
      },
    ],
    name: 'disconnectVirtualPoolFromPlugin',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'key',
        internalType: 'struct IncentiveKey',
        type: 'tuple',
        components: [
          {
            name: 'rewardToken',
            internalType: 'contract IERC20Minimal',
            type: 'address',
          },
          {
            name: 'bonusRewardToken',
            internalType: 'contract IERC20Minimal',
            type: 'address',
          },
          {
            name: 'pool',
            internalType: 'contract IAlgebraPool',
            type: 'address',
          },
          { name: 'nonce', internalType: 'uint256', type: 'uint256' },
        ],
      },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'enterFarming',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'eternalFarming',
    outputs: [
      {
        name: '',
        internalType: 'contract IAlgebraEternalFarming',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'key',
        internalType: 'struct IncentiveKey',
        type: 'tuple',
        components: [
          {
            name: 'rewardToken',
            internalType: 'contract IERC20Minimal',
            type: 'address',
          },
          {
            name: 'bonusRewardToken',
            internalType: 'contract IERC20Minimal',
            type: 'address',
          },
          {
            name: 'pool',
            internalType: 'contract IAlgebraPool',
            type: 'address',
          },
          { name: 'nonce', internalType: 'uint256', type: 'uint256' },
        ],
      },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'exitFarming',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'incentiveId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'incentiveKeys',
    outputs: [
      {
        name: 'rewardToken',
        internalType: 'contract IERC20Minimal',
        type: 'address',
      },
      {
        name: 'bonusRewardToken',
        internalType: 'contract IERC20Minimal',
        type: 'address',
      },
      { name: 'pool', internalType: 'contract IAlgebraPool', type: 'address' },
      { name: 'nonce', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'data', internalType: 'bytes[]', type: 'bytes[]' }],
    name: 'multicall',
    outputs: [{ name: 'results', internalType: 'bytes[]', type: 'bytes[]' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'nonfungiblePositionManager',
    outputs: [
      {
        name: '',
        internalType: 'contract INonfungiblePositionManager',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'poolAddress', internalType: 'address', type: 'address' }],
    name: 'virtualPoolAddresses',
    outputs: [
      { name: 'virtualPoolAddress', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'view',
  },
] as const

/**
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA)
 */
export const farmingCenterAddress = {
  43111: '0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA',
} as const

/**
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA)
 */
export const farmingCenterConfig = {
  address: farmingCenterAddress,
  abi: farmingCenterAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LimitOrderManager
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const limitOrderManagerAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_wNativeToken', internalType: 'address', type: 'address' },
      { name: '_poolDeployer', internalType: 'address', type: 'address' },
      { name: '_basePluginFactory', internalType: 'address', type: 'address' },
      { name: '_factory', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'CrossedRange' },
  { type: 'error', inputs: [], name: 'Filled' },
  { type: 'error', inputs: [], name: 'InRange' },
  { type: 'error', inputs: [], name: 'InsufficientLiquidity' },
  { type: 'error', inputs: [], name: 'NotFilled' },
  { type: 'error', inputs: [], name: 'NotPlugin' },
  { type: 'error', inputs: [], name: 'NotPoolManagerToken' },
  { type: 'error', inputs: [], name: 'ZeroLiquidity' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'epoch', internalType: 'Epoch', type: 'uint232', indexed: true },
      {
        name: 'tickLower',
        internalType: 'int24',
        type: 'int24',
        indexed: false,
      },
      {
        name: 'zeroForOne',
        internalType: 'bool',
        type: 'bool',
        indexed: false,
      },
    ],
    name: 'Fill',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'epoch', internalType: 'Epoch', type: 'uint232', indexed: true },
      {
        name: 'tickLower',
        internalType: 'int24',
        type: 'int24',
        indexed: false,
      },
      {
        name: 'zeroForOne',
        internalType: 'bool',
        type: 'bool',
        indexed: false,
      },
      {
        name: 'liquidity',
        internalType: 'uint128',
        type: 'uint128',
        indexed: false,
      },
    ],
    name: 'Kill',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'pool', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'tickSpacing',
        internalType: 'int24',
        type: 'int24',
        indexed: false,
      },
    ],
    name: 'LimitOrderTickSpacing',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'epoch', internalType: 'Epoch', type: 'uint232', indexed: true },
      {
        name: 'pool',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'tickLower',
        internalType: 'int24',
        type: 'int24',
        indexed: false,
      },
      {
        name: 'tickUpper',
        internalType: 'int24',
        type: 'int24',
        indexed: false,
      },
      {
        name: 'zeroForOne',
        internalType: 'bool',
        type: 'bool',
        indexed: false,
      },
      {
        name: 'liquidity',
        internalType: 'uint128',
        type: 'uint128',
        indexed: false,
      },
    ],
    name: 'Place',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'epoch', internalType: 'Epoch', type: 'uint232', indexed: true },
      {
        name: 'liquidity',
        internalType: 'uint128',
        type: 'uint128',
        indexed: false,
      },
    ],
    name: 'Withdraw',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ALGEBRA_BASE_PLUGIN_MANAGER',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'pool', internalType: 'address', type: 'address' },
      { name: 'zeroToOne', internalType: 'bool', type: 'bool' },
      { name: 'tick', internalType: 'int24', type: 'int24' },
    ],
    name: 'afterSwap',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'amount0Owed', internalType: 'uint256', type: 'uint256' },
      { name: 'amount1Owed', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'algebraMintCallback',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'basePluginFactory',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'Epoch', type: 'uint232' }],
    name: 'epochInfos',
    outputs: [
      { name: 'filled', internalType: 'bool', type: 'bool' },
      { name: 'tickLower', internalType: 'int24', type: 'int24' },
      { name: 'tickUpper', internalType: 'int24', type: 'int24' },
      { name: 'liquidityTotal', internalType: 'uint128', type: 'uint128' },
      { name: 'token0', internalType: 'address', type: 'address' },
      { name: 'token1', internalType: 'address', type: 'address' },
      { name: 'deployer', internalType: 'address', type: 'address' },
      { name: 'token0Total', internalType: 'uint128', type: 'uint128' },
      { name: 'token1Total', internalType: 'uint128', type: 'uint128' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'epochNext',
    outputs: [{ name: '', internalType: 'Epoch', type: 'uint232' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    name: 'epochs',
    outputs: [{ name: '', internalType: 'Epoch', type: 'uint232' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'factory',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'pool', internalType: 'address', type: 'address' },
      { name: 'tickLower', internalType: 'int24', type: 'int24' },
      { name: 'tickUpper', internalType: 'int24', type: 'int24' },
      { name: 'zeroForOne', internalType: 'bool', type: 'bool' },
    ],
    name: 'getEpoch',
    outputs: [{ name: '', internalType: 'Epoch', type: 'uint232' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'epoch', internalType: 'Epoch', type: 'uint232' },
      { name: 'owner', internalType: 'address', type: 'address' },
    ],
    name: 'getEpochLiquidity',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'initialized',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'poolKey',
        internalType: 'struct PoolAddress.PoolKey',
        type: 'tuple',
        components: [
          { name: 'deployer', internalType: 'address', type: 'address' },
          { name: 'token0', internalType: 'address', type: 'address' },
          { name: 'token1', internalType: 'address', type: 'address' },
        ],
      },
      { name: 'tickLower', internalType: 'int24', type: 'int24' },
      { name: 'tickUpper', internalType: 'int24', type: 'int24' },
      { name: 'liquidity', internalType: 'uint128', type: 'uint128' },
      { name: 'zeroForOne', internalType: 'bool', type: 'bool' },
      { name: 'to', internalType: 'address', type: 'address' },
    ],
    name: 'kill',
    outputs: [
      { name: 'amount0', internalType: 'uint256', type: 'uint256' },
      { name: 'amount1', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'poolKey',
        internalType: 'struct PoolAddress.PoolKey',
        type: 'tuple',
        components: [
          { name: 'deployer', internalType: 'address', type: 'address' },
          { name: 'token0', internalType: 'address', type: 'address' },
          { name: 'token1', internalType: 'address', type: 'address' },
        ],
      },
      { name: 'tickLower', internalType: 'int24', type: 'int24' },
      { name: 'zeroForOne', internalType: 'bool', type: 'bool' },
      { name: 'liquidity', internalType: 'uint128', type: 'uint128' },
    ],
    name: 'place',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'poolDeployer',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'pool', internalType: 'address', type: 'address' },
      { name: 'tickSpacing', internalType: 'int24', type: 'int24' },
    ],
    name: 'setTickSpacing',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'tickLowerLasts',
    outputs: [{ name: '', internalType: 'int24', type: 'int24' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'tickSpacings',
    outputs: [{ name: '', internalType: 'int24', type: 'int24' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'wNativeToken',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'epoch', internalType: 'Epoch', type: 'uint232' },
      { name: 'to', internalType: 'address', type: 'address' },
    ],
    name: 'withdraw',
    outputs: [
      { name: 'amount0', internalType: 'uint256', type: 'uint256' },
      { name: 'amount1', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'receive', stateMutability: 'payable' },
] as const

/**
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const limitOrderManagerAddress = {
  43111: '0x0000000000000000000000000000000000000000',
} as const

/**
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const limitOrderManagerConfig = {
  address: limitOrderManagerAddress,
  abi: limitOrderManagerAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// NonfungiblePositionManager
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const nonfungiblePositionManagerAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_factory', internalType: 'address', type: 'address' },
      { name: '_WNativeToken', internalType: 'address', type: 'address' },
      { name: '_tokenDescriptor_', internalType: 'address', type: 'address' },
      { name: '_poolDeployer', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'tickOutOfRange' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'approved',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'operator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'approved', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'ApprovalForAll',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'recipient',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'amount0',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'amount1',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Collect',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'liquidity',
        internalType: 'uint128',
        type: 'uint128',
        indexed: false,
      },
      {
        name: 'amount0',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'amount1',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'DecreaseLiquidity',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'FarmingFailed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'liquidityDesired',
        internalType: 'uint128',
        type: 'uint128',
        indexed: false,
      },
      {
        name: 'actualLiquidity',
        internalType: 'uint128',
        type: 'uint128',
        indexed: false,
      },
      {
        name: 'amount0',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'amount1',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'pool',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'IncreaseLiquidity',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'Transfer',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DOMAIN_SEPARATOR',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'NONFUNGIBLE_POSITION_MANAGER_ADMINISTRATOR_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'PERMIT_TYPEHASH',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'WNativeToken',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'amount0Owed', internalType: 'uint256', type: 'uint256' },
      { name: 'amount1Owed', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'algebraMintCallback',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'approve', internalType: 'bool', type: 'bool' },
      { name: 'farmingAddress', internalType: 'address', type: 'address' },
    ],
    name: 'approveForFarming',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'burn',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'params',
        internalType: 'struct INonfungiblePositionManager.CollectParams',
        type: 'tuple',
        components: [
          { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
          { name: 'recipient', internalType: 'address', type: 'address' },
          { name: 'amount0Max', internalType: 'uint128', type: 'uint128' },
          { name: 'amount1Max', internalType: 'uint128', type: 'uint128' },
        ],
      },
    ],
    name: 'collect',
    outputs: [
      { name: 'amount0', internalType: 'uint256', type: 'uint256' },
      { name: 'amount1', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token0', internalType: 'address', type: 'address' },
      { name: 'token1', internalType: 'address', type: 'address' },
      { name: 'deployer', internalType: 'address', type: 'address' },
      { name: 'sqrtPriceX96', internalType: 'uint160', type: 'uint160' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'createAndInitializePoolIfNecessary',
    outputs: [{ name: 'pool', internalType: 'address', type: 'address' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'params',
        internalType:
          'struct INonfungiblePositionManager.DecreaseLiquidityParams',
        type: 'tuple',
        components: [
          { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
          { name: 'liquidity', internalType: 'uint128', type: 'uint128' },
          { name: 'amount0Min', internalType: 'uint256', type: 'uint256' },
          { name: 'amount1Min', internalType: 'uint256', type: 'uint256' },
          { name: 'deadline', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    name: 'decreaseLiquidity',
    outputs: [
      { name: 'amount0', internalType: 'uint256', type: 'uint256' },
      { name: 'amount1', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'factory',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'farmingApprovals',
    outputs: [
      {
        name: 'farmingCenterAddress',
        internalType: 'address',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'farmingCenter',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getApproved',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'params',
        internalType:
          'struct INonfungiblePositionManager.IncreaseLiquidityParams',
        type: 'tuple',
        components: [
          { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
          { name: 'amount0Desired', internalType: 'uint256', type: 'uint256' },
          { name: 'amount1Desired', internalType: 'uint256', type: 'uint256' },
          { name: 'amount0Min', internalType: 'uint256', type: 'uint256' },
          { name: 'amount1Min', internalType: 'uint256', type: 'uint256' },
          { name: 'deadline', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    name: 'increaseLiquidity',
    outputs: [
      { name: 'liquidity', internalType: 'uint128', type: 'uint128' },
      { name: 'amount0', internalType: 'uint256', type: 'uint256' },
      { name: 'amount1', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'operator', internalType: 'address', type: 'address' },
    ],
    name: 'isApprovedForAll',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'isApprovedOrOwner',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'params',
        internalType: 'struct INonfungiblePositionManager.MintParams',
        type: 'tuple',
        components: [
          { name: 'token0', internalType: 'address', type: 'address' },
          { name: 'token1', internalType: 'address', type: 'address' },
          { name: 'deployer', internalType: 'address', type: 'address' },
          { name: 'tickLower', internalType: 'int24', type: 'int24' },
          { name: 'tickUpper', internalType: 'int24', type: 'int24' },
          { name: 'amount0Desired', internalType: 'uint256', type: 'uint256' },
          { name: 'amount1Desired', internalType: 'uint256', type: 'uint256' },
          { name: 'amount0Min', internalType: 'uint256', type: 'uint256' },
          { name: 'amount1Min', internalType: 'uint256', type: 'uint256' },
          { name: 'recipient', internalType: 'address', type: 'address' },
          { name: 'deadline', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    name: 'mint',
    outputs: [
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'liquidity', internalType: 'uint128', type: 'uint128' },
      { name: 'amount0', internalType: 'uint256', type: 'uint256' },
      { name: 'amount1', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: 'data', internalType: 'bytes[]', type: 'bytes[]' }],
    name: 'multicall',
    outputs: [{ name: 'results', internalType: 'bytes[]', type: 'bytes[]' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
      { name: 'v', internalType: 'uint8', type: 'uint8' },
      { name: 'r', internalType: 'bytes32', type: 'bytes32' },
      { name: 's', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'permit',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'poolDeployer',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'positions',
    outputs: [
      { name: 'nonce', internalType: 'uint88', type: 'uint88' },
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'token0', internalType: 'address', type: 'address' },
      { name: 'token1', internalType: 'address', type: 'address' },
      { name: 'deployer', internalType: 'address', type: 'address' },
      { name: 'tickLower', internalType: 'int24', type: 'int24' },
      { name: 'tickUpper', internalType: 'int24', type: 'int24' },
      { name: 'liquidity', internalType: 'uint128', type: 'uint128' },
      {
        name: 'feeGrowthInside0LastX128',
        internalType: 'uint256',
        type: 'uint256',
      },
      {
        name: 'feeGrowthInside1LastX128',
        internalType: 'uint256',
        type: 'uint256',
      },
      { name: 'tokensOwed0', internalType: 'uint128', type: 'uint128' },
      { name: 'tokensOwed1', internalType: 'uint128', type: 'uint128' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'refundNativeToken',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
      { name: 'v', internalType: 'uint8', type: 'uint8' },
      { name: 'r', internalType: 'bytes32', type: 'bytes32' },
      { name: 's', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'selfPermit',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'nonce', internalType: 'uint256', type: 'uint256' },
      { name: 'expiry', internalType: 'uint256', type: 'uint256' },
      { name: 'v', internalType: 'uint8', type: 'uint8' },
      { name: 'r', internalType: 'bytes32', type: 'bytes32' },
      { name: 's', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'selfPermitAllowed',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'nonce', internalType: 'uint256', type: 'uint256' },
      { name: 'expiry', internalType: 'uint256', type: 'uint256' },
      { name: 'v', internalType: 'uint8', type: 'uint8' },
      { name: 'r', internalType: 'bytes32', type: 'bytes32' },
      { name: 's', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'selfPermitAllowedIfNecessary',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
      { name: 'v', internalType: 'uint8', type: 'uint8' },
      { name: 'r', internalType: 'bytes32', type: 'bytes32' },
      { name: 's', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'selfPermitIfNecessary',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'approved', internalType: 'bool', type: 'bool' },
    ],
    name: 'setApprovalForAll',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newFarmingCenter', internalType: 'address', type: 'address' },
    ],
    name: 'setFarmingCenter',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'amountMinimum', internalType: 'uint256', type: 'uint256' },
      { name: 'recipient', internalType: 'address', type: 'address' },
    ],
    name: 'sweepToken',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'toActive', internalType: 'bool', type: 'bool' },
    ],
    name: 'switchFarmingStatus',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'index', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenByIndex',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenFarmedIn',
    outputs: [
      {
        name: 'farmingCenterAddress',
        internalType: 'address',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'index', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'tokenOfOwnerByIndex',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'amountMinimum', internalType: 'uint256', type: 'uint256' },
      { name: 'recipient', internalType: 'address', type: 'address' },
    ],
    name: 'unwrapWNativeToken',
    outputs: [],
    stateMutability: 'payable',
  },
  { type: 'receive', stateMutability: 'payable' },
] as const

/**
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const nonfungiblePositionManagerAddress = {
  43111: '0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C',
} as const

/**
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const nonfungiblePositionManagerConfig = {
  address: nonfungiblePositionManagerAddress,
  abi: nonfungiblePositionManagerAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// QuoterV2
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x13fcE0acbe6Fb11641ab753212550574CaD31415)
 */
export const quoterV2Abi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_factory', internalType: 'address', type: 'address' },
      { name: '_WNativeToken', internalType: 'address', type: 'address' },
      { name: '_poolDeployer', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'WNativeToken',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'amount0Delta', internalType: 'int256', type: 'int256' },
      { name: 'amount1Delta', internalType: 'int256', type: 'int256' },
      { name: 'path', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'algebraSwapCallback',
    outputs: [],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'factory',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'poolDeployer',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'path', internalType: 'bytes', type: 'bytes' },
      { name: 'amountInRequired', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'quoteExactInput',
    outputs: [
      { name: 'amountOutList', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'amountInList', internalType: 'uint256[]', type: 'uint256[]' },
      {
        name: 'sqrtPriceX96AfterList',
        internalType: 'uint160[]',
        type: 'uint160[]',
      },
      {
        name: 'initializedTicksCrossedList',
        internalType: 'uint32[]',
        type: 'uint32[]',
      },
      { name: 'gasEstimate', internalType: 'uint256', type: 'uint256' },
      { name: 'feeList', internalType: 'uint16[]', type: 'uint16[]' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'params',
        internalType: 'struct IQuoterV2.QuoteExactInputSingleParams',
        type: 'tuple',
        components: [
          { name: 'tokenIn', internalType: 'address', type: 'address' },
          { name: 'tokenOut', internalType: 'address', type: 'address' },
          { name: 'deployer', internalType: 'address', type: 'address' },
          { name: 'amountIn', internalType: 'uint256', type: 'uint256' },
          { name: 'limitSqrtPrice', internalType: 'uint160', type: 'uint160' },
        ],
      },
    ],
    name: 'quoteExactInputSingle',
    outputs: [
      { name: 'amountOut', internalType: 'uint256', type: 'uint256' },
      { name: 'amountIn', internalType: 'uint256', type: 'uint256' },
      { name: 'sqrtPriceX96After', internalType: 'uint160', type: 'uint160' },
      {
        name: 'initializedTicksCrossed',
        internalType: 'uint32',
        type: 'uint32',
      },
      { name: 'gasEstimate', internalType: 'uint256', type: 'uint256' },
      { name: 'fee', internalType: 'uint16', type: 'uint16' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'path', internalType: 'bytes', type: 'bytes' },
      { name: 'amountOutRequired', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'quoteExactOutput',
    outputs: [
      { name: 'amountOutList', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'amountInList', internalType: 'uint256[]', type: 'uint256[]' },
      {
        name: 'sqrtPriceX96AfterList',
        internalType: 'uint160[]',
        type: 'uint160[]',
      },
      {
        name: 'initializedTicksCrossedList',
        internalType: 'uint32[]',
        type: 'uint32[]',
      },
      { name: 'gasEstimate', internalType: 'uint256', type: 'uint256' },
      { name: 'feeList', internalType: 'uint16[]', type: 'uint16[]' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'params',
        internalType: 'struct IQuoterV2.QuoteExactOutputSingleParams',
        type: 'tuple',
        components: [
          { name: 'tokenIn', internalType: 'address', type: 'address' },
          { name: 'tokenOut', internalType: 'address', type: 'address' },
          { name: 'deployer', internalType: 'address', type: 'address' },
          { name: 'amount', internalType: 'uint256', type: 'uint256' },
          { name: 'limitSqrtPrice', internalType: 'uint160', type: 'uint160' },
        ],
      },
    ],
    name: 'quoteExactOutputSingle',
    outputs: [
      { name: 'amountOut', internalType: 'uint256', type: 'uint256' },
      { name: 'amountIn', internalType: 'uint256', type: 'uint256' },
      { name: 'sqrtPriceX96After', internalType: 'uint160', type: 'uint160' },
      {
        name: 'initializedTicksCrossed',
        internalType: 'uint32',
        type: 'uint32',
      },
      { name: 'gasEstimate', internalType: 'uint256', type: 'uint256' },
      { name: 'fee', internalType: 'uint16', type: 'uint16' },
    ],
    stateMutability: 'nonpayable',
  },
] as const

/**
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x13fcE0acbe6Fb11641ab753212550574CaD31415)
 */
export const quoterV2Address = {
  43111: '0x13fcE0acbe6Fb11641ab753212550574CaD31415',
} as const

/**
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x13fcE0acbe6Fb11641ab753212550574CaD31415)
 */
export const quoterV2Config = {
  address: quoterV2Address,
  abi: quoterV2Abi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RebaseReward
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const rebaseRewardAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DURATION',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'NOTIFY_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'PRECISION',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'UPGRADE_INTERFACE_VERSION',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_amount', internalType: 'uint256', type: 'uint256' },
      { name: '_tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: '_deposit',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_amount', internalType: 'uint256', type: 'uint256' },
      { name: '_tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: '_withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'acceptOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_period', internalType: 'uint256', type: 'uint256' },
      { name: '_tokenId', internalType: 'uint256', type: 'uint256' },
      { name: '_token', internalType: 'address', type: 'address' },
    ],
    name: 'earnedForPeriod',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_tokenId', internalType: 'uint256', type: 'uint256' },
      { name: '_token', internalType: 'address', type: 'address' },
    ],
    name: 'earnedForToken',
    outputs: [{ name: 'reward', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'earnedForTokenId',
    outputs: [
      { name: 'rewardList', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'tokenList', internalType: 'address[]', type: 'address[]' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getCurrentPeriod',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getRewardForOwner',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_period', internalType: 'uint256', type: 'uint256' },
      { name: '_tokenId', internalType: 'uint256', type: 'uint256' },
      { name: '_token', internalType: 'address', type: 'address' },
    ],
    name: 'getRewardForPeriod',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getRewardForTokenId',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getRewardList',
    outputs: [{ name: '', internalType: 'address[]', type: 'address[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_account', internalType: 'address', type: 'address' }],
    name: 'grantNotifyRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_token', internalType: 'address', type: 'address' },
      { name: '_amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'incentivize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_voter', internalType: 'address', type: 'address' },
      { name: '_veTOKEN', internalType: 'address', type: 'address' },
      { name: '_initialOwner', internalType: 'address', type: 'address' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_amount', internalType: 'uint256', type: 'uint256' }],
    name: 'notifyRewardAmount',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_token', internalType: 'address', type: 'address' },
      { name: '_amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'notifyRewardAmount',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pendingOwner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'periodInit',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'callerConfirmation', internalType: 'address', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_period', internalType: 'uint256', type: 'uint256' },
      { name: '_reward', internalType: 'address', type: 'address' },
    ],
    name: 'rewardForPeriod',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'token',
    outputs: [
      { name: '_token', internalType: 'contract IERC20', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_period', internalType: 'uint256', type: 'uint256' },
      { name: '_tokenId', internalType: 'uint256', type: 'uint256' },
      { name: '_reward', internalType: 'address', type: 'address' },
    ],
    name: 'tokenIdRewardClaimedInPeriod',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_period', internalType: 'uint256', type: 'uint256' },
      { name: '_tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'tokenIdVotesInPeriod',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_period', internalType: 'uint256', type: 'uint256' }],
    name: 'totalVotesInPeriod',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_token', internalType: 'address', type: 'address' }],
    name: 'transferERC20',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'veTOKEN',
    outputs: [
      { name: '', internalType: 'contract IVotingEscrow', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'voter',
    outputs: [{ name: '', internalType: 'contract IVoter', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: '_period',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: '_tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: '_token',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      { name: '_to', internalType: 'address', type: 'address', indexed: false },
    ],
    name: 'ClaimReward',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: '_period',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: '_amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: '_tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Deposit',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: '_period',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: '_from',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: '_token',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'IncentivizedReward',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'version',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: '_period',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: '_from',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: '_token',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'NotifyReward',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferStarted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'previousAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'newAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'RoleAdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleGranted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleRevoked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'implementation',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'Upgraded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: '_period',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: '_amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: '_tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Withdraw',
  },
  { type: 'error', inputs: [], name: 'AccessControlBadConfirmation' },
  {
    type: 'error',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'neededRole', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'AccessControlUnauthorizedAccount',
  },
  {
    type: 'error',
    inputs: [{ name: 'target', internalType: 'address', type: 'address' }],
    name: 'AddressEmptyCode',
  },
  {
    type: 'error',
    inputs: [
      { name: 'implementation', internalType: 'address', type: 'address' },
    ],
    name: 'ERC1967InvalidImplementation',
  },
  { type: 'error', inputs: [], name: 'ERC1967NonPayable' },
  { type: 'error', inputs: [], name: 'FailedCall' },
  { type: 'error', inputs: [], name: 'FuturePeriodNotClaimable' },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  { type: 'error', inputs: [], name: 'NotApprovedOrOwner' },
  { type: 'error', inputs: [], name: 'NotInitializing' },
  { type: 'error', inputs: [], name: 'NotTOKEN' },
  { type: 'error', inputs: [], name: 'NotVoter' },
  { type: 'error', inputs: [], name: 'NotWhitelistedRewardToken' },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  {
    type: 'error',
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'SafeERC20FailedOperation',
  },
  { type: 'error', inputs: [], name: 'UUPSUnauthorizedCallContext' },
  {
    type: 'error',
    inputs: [{ name: 'slot', internalType: 'bytes32', type: 'bytes32' }],
    name: 'UUPSUnsupportedProxiableUUID',
  },
] as const

/**
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const rebaseRewardAddress = {
  43111: '0x0000000000000000000000000000000000000000',
} as const

/**
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const rebaseRewardConfig = {
  address: rebaseRewardAddress,
  abi: rebaseRewardAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SecurityRegistry
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const securityRegistryAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_algebraFactory', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'OnlyOwner' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'status',
        internalType: 'enum ISecurityRegistry.Status',
        type: 'uint8',
        indexed: false,
      },
    ],
    name: 'GlobalStatus',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'pool',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'status',
        internalType: 'enum ISecurityRegistry.Status',
        type: 'uint8',
        indexed: false,
      },
    ],
    name: 'PoolStatus',
  },
  {
    type: 'function',
    inputs: [],
    name: 'GUARD',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'algebraFactory',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'pool', internalType: 'address', type: 'address' }],
    name: 'getPoolStatus',
    outputs: [
      {
        name: '',
        internalType: 'enum ISecurityRegistry.Status',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'globalStatus',
    outputs: [
      {
        name: '',
        internalType: 'enum ISecurityRegistry.Status',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'isPoolStatusOverrided',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'poolStatus',
    outputs: [
      {
        name: '',
        internalType: 'enum ISecurityRegistry.Status',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'newStatus',
        internalType: 'enum ISecurityRegistry.Status',
        type: 'uint8',
      },
    ],
    name: 'setGlobalStatus',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'pools', internalType: 'address[]', type: 'address[]' },
      {
        name: 'newStatuses',
        internalType: 'enum ISecurityRegistry.Status[]',
        type: 'uint8[]',
      },
    ],
    name: 'setPoolsStatus',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

/**
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const securityRegistryAddress = {
  43111: '0x0000000000000000000000000000000000000000',
} as const

/**
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const securityRegistryConfig = {
  address: securityRegistryAddress,
  abi: securityRegistryAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SwapRouter
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const swapRouterAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_factory', internalType: 'address', type: 'address' },
      { name: '_WNativeToken', internalType: 'address', type: 'address' },
      { name: '_poolDeployer', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'WNativeToken',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'amount0Delta', internalType: 'int256', type: 'int256' },
      { name: 'amount1Delta', internalType: 'int256', type: 'int256' },
      { name: '_data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'algebraSwapCallback',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'params',
        internalType: 'struct ISwapRouter.ExactInputParams',
        type: 'tuple',
        components: [
          { name: 'path', internalType: 'bytes', type: 'bytes' },
          { name: 'recipient', internalType: 'address', type: 'address' },
          { name: 'deadline', internalType: 'uint256', type: 'uint256' },
          { name: 'amountIn', internalType: 'uint256', type: 'uint256' },
          {
            name: 'amountOutMinimum',
            internalType: 'uint256',
            type: 'uint256',
          },
        ],
      },
    ],
    name: 'exactInput',
    outputs: [{ name: 'amountOut', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'params',
        internalType: 'struct ISwapRouter.ExactInputSingleParams',
        type: 'tuple',
        components: [
          { name: 'tokenIn', internalType: 'address', type: 'address' },
          { name: 'tokenOut', internalType: 'address', type: 'address' },
          { name: 'deployer', internalType: 'address', type: 'address' },
          { name: 'recipient', internalType: 'address', type: 'address' },
          { name: 'deadline', internalType: 'uint256', type: 'uint256' },
          { name: 'amountIn', internalType: 'uint256', type: 'uint256' },
          {
            name: 'amountOutMinimum',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'limitSqrtPrice', internalType: 'uint160', type: 'uint160' },
        ],
      },
    ],
    name: 'exactInputSingle',
    outputs: [{ name: 'amountOut', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'params',
        internalType: 'struct ISwapRouter.ExactInputSingleParams',
        type: 'tuple',
        components: [
          { name: 'tokenIn', internalType: 'address', type: 'address' },
          { name: 'tokenOut', internalType: 'address', type: 'address' },
          { name: 'deployer', internalType: 'address', type: 'address' },
          { name: 'recipient', internalType: 'address', type: 'address' },
          { name: 'deadline', internalType: 'uint256', type: 'uint256' },
          { name: 'amountIn', internalType: 'uint256', type: 'uint256' },
          {
            name: 'amountOutMinimum',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'limitSqrtPrice', internalType: 'uint160', type: 'uint160' },
        ],
      },
    ],
    name: 'exactInputSingleSupportingFeeOnTransferTokens',
    outputs: [{ name: 'amountOut', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'params',
        internalType: 'struct ISwapRouter.ExactOutputParams',
        type: 'tuple',
        components: [
          { name: 'path', internalType: 'bytes', type: 'bytes' },
          { name: 'recipient', internalType: 'address', type: 'address' },
          { name: 'deadline', internalType: 'uint256', type: 'uint256' },
          { name: 'amountOut', internalType: 'uint256', type: 'uint256' },
          { name: 'amountInMaximum', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    name: 'exactOutput',
    outputs: [{ name: 'amountIn', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'params',
        internalType: 'struct ISwapRouter.ExactOutputSingleParams',
        type: 'tuple',
        components: [
          { name: 'tokenIn', internalType: 'address', type: 'address' },
          { name: 'tokenOut', internalType: 'address', type: 'address' },
          { name: 'deployer', internalType: 'address', type: 'address' },
          { name: 'recipient', internalType: 'address', type: 'address' },
          { name: 'deadline', internalType: 'uint256', type: 'uint256' },
          { name: 'amountOut', internalType: 'uint256', type: 'uint256' },
          { name: 'amountInMaximum', internalType: 'uint256', type: 'uint256' },
          { name: 'limitSqrtPrice', internalType: 'uint160', type: 'uint160' },
        ],
      },
    ],
    name: 'exactOutputSingle',
    outputs: [{ name: 'amountIn', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'factory',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'data', internalType: 'bytes[]', type: 'bytes[]' }],
    name: 'multicall',
    outputs: [{ name: 'results', internalType: 'bytes[]', type: 'bytes[]' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'poolDeployer',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'refundNativeToken',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
      { name: 'v', internalType: 'uint8', type: 'uint8' },
      { name: 'r', internalType: 'bytes32', type: 'bytes32' },
      { name: 's', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'selfPermit',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'nonce', internalType: 'uint256', type: 'uint256' },
      { name: 'expiry', internalType: 'uint256', type: 'uint256' },
      { name: 'v', internalType: 'uint8', type: 'uint8' },
      { name: 'r', internalType: 'bytes32', type: 'bytes32' },
      { name: 's', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'selfPermitAllowed',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'nonce', internalType: 'uint256', type: 'uint256' },
      { name: 'expiry', internalType: 'uint256', type: 'uint256' },
      { name: 'v', internalType: 'uint8', type: 'uint8' },
      { name: 'r', internalType: 'bytes32', type: 'bytes32' },
      { name: 's', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'selfPermitAllowedIfNecessary',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
      { name: 'v', internalType: 'uint8', type: 'uint8' },
      { name: 'r', internalType: 'bytes32', type: 'bytes32' },
      { name: 's', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'selfPermitIfNecessary',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'amountMinimum', internalType: 'uint256', type: 'uint256' },
      { name: 'recipient', internalType: 'address', type: 'address' },
    ],
    name: 'sweepToken',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'amountMinimum', internalType: 'uint256', type: 'uint256' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'feeBips', internalType: 'uint256', type: 'uint256' },
      { name: 'feeRecipient', internalType: 'address', type: 'address' },
    ],
    name: 'sweepTokenWithFee',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'amountMinimum', internalType: 'uint256', type: 'uint256' },
      { name: 'recipient', internalType: 'address', type: 'address' },
    ],
    name: 'unwrapWNativeToken',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'amountMinimum', internalType: 'uint256', type: 'uint256' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'feeBips', internalType: 'uint256', type: 'uint256' },
      { name: 'feeRecipient', internalType: 'address', type: 'address' },
    ],
    name: 'unwrapWNativeTokenWithFee',
    outputs: [],
    stateMutability: 'payable',
  },
  { type: 'receive', stateMutability: 'payable' },
] as const

/**
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const swapRouterAddress = {
  43111: '0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A',
} as const

/**
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const swapRouterConfig = {
  address: swapRouterAddress,
  abi: swapRouterAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Voter
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const voterAbi = [
  {
    type: 'function',
    inputs: [],
    name: 'AUTHORIZED_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DURATION',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'UPGRADE_INTERFACE_VERSION',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'acceptOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'algebraGaugeFactory',
    outputs: [
      {
        name: '',
        internalType: 'contract AlgebraGaugeFactory',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'algebraVaultFactory',
    outputs: [
      {
        name: '',
        internalType: 'contract IAlgebraVaultFactory',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_period', internalType: 'uint256', type: 'uint256' },
      { name: '_tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'checkPeriodVoted',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_votingRewardList',
        internalType: 'address[]',
        type: 'address[]',
      },
      { name: '_tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'claimVotingRewardBatch',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_poolAddress', internalType: 'address', type: 'address' },
    ],
    name: 'createAlgebraGauge',
    outputs: [
      { name: '_gauge', internalType: 'address', type: 'address' },
      { name: '_votingReward', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'createGauge',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_gauge', internalType: 'address', type: 'address' }],
    name: 'distribute',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'distributeAll',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_start', internalType: 'uint256', type: 'uint256' },
      { name: '_amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'distributeRange',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'epoch0Period',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_gauge', internalType: 'address', type: 'address' }],
    name: 'gaugeToPool',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getCurrentPeriod',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_pool', internalType: 'address', type: 'address' }],
    name: 'getGauge',
    outputs: [
      {
        name: '',
        internalType: 'struct IVoter.Gauge',
        type: 'tuple',
        components: [
          { name: 'gauge', internalType: 'address', type: 'address' },
          { name: 'isAlgebra', internalType: 'bool', type: 'bool' },
          { name: 'votingReward', internalType: 'address', type: 'address' },
          { name: 'isAlive', internalType: 'bool', type: 'bool' },
          { name: 'vault', internalType: 'address', type: 'address' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getGaugeList',
    outputs: [{ name: '', internalType: 'address[]', type: 'address[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_period', internalType: 'uint256', type: 'uint256' }],
    name: 'getPeriodData',
    outputs: [
      { name: '_globalTotalVotes', internalType: 'uint256', type: 'uint256' },
      { name: '_gaugeList', internalType: 'address[]', type: 'address[]' },
      {
        name: '_gaugeTotalVotesList',
        internalType: 'uint256[]',
        type: 'uint256[]',
      },
      { name: '_totalEmissions', internalType: 'uint256', type: 'uint256' },
      {
        name: '_gaugeEmissionsList',
        internalType: 'struct IVoter.Emissions[]',
        type: 'tuple[]',
        components: [
          { name: 'amount', internalType: 'uint256', type: 'uint256' },
          { name: 'distributed', internalType: 'bool', type: 'bool' },
          { name: 'killedDistributed', internalType: 'bool', type: 'bool' },
        ],
      },
      {
        name: '_totalClaimedEmissions',
        internalType: 'uint256',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getPoolList',
    outputs: [{ name: '', internalType: 'address[]', type: 'address[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_period', internalType: 'uint256', type: 'uint256' },
      { name: '_tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getTokenIdVotes',
    outputs: [
      {
        name: '_tokenIdVotedList',
        internalType: 'address[]',
        type: 'address[]',
      },
      { name: '_tokenIdVotes', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_veTOKEN', internalType: 'address', type: 'address' },
      { name: '_initialOwner', internalType: 'address', type: 'address' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_gauge', internalType: 'address', type: 'address' }],
    name: 'isAlive',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_gauge', internalType: 'address', type: 'address' }],
    name: 'isGauge',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_token', internalType: 'address', type: 'address' }],
    name: 'isWhitelisted',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_gauge', internalType: 'address', type: 'address' }],
    name: 'killGauge',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'minter',
    outputs: [{ name: '', internalType: 'contract IMinter', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_amount', internalType: 'uint256', type: 'uint256' }],
    name: 'notifyRewardAmount',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pendingOwner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_period', internalType: 'uint256', type: 'uint256' }],
    name: 'period',
    outputs: [
      { name: 'globalTotalVotes', internalType: 'uint256', type: 'uint256' },
      { name: 'totalEmissions', internalType: 'uint256', type: 'uint256' },
      {
        name: 'totalClaimedEmissions',
        internalType: 'uint256',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'rebaseReward',
    outputs: [
      { name: '', internalType: 'contract IRebaseReward', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'callerConfirmation', internalType: 'address', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_gauge', internalType: 'address', type: 'address' }],
    name: 'reviveGauge',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_algebraGaugeFactory',
        internalType: 'address',
        type: 'address',
      },
    ],
    name: 'setAlgebraGaugeFactory',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_algebraVaultFactory',
        internalType: 'address',
        type: 'address',
      },
    ],
    name: 'setAlgebraVaultFactory',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_minter', internalType: 'address', type: 'address' }],
    name: 'setMinter',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_rebaseReward', internalType: 'address', type: 'address' },
    ],
    name: 'setRebaseReward',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_token', internalType: 'address', type: 'address' },
      { name: '_status', internalType: 'bool', type: 'bool' },
    ],
    name: 'setTokenStatus',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_votingRewardFactory',
        internalType: 'address',
        type: 'address',
      },
    ],
    name: 'setVotingRewardFactory',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'start',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'token',
    outputs: [{ name: '', internalType: 'contract IERC20', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'veTOKEN',
    outputs: [
      { name: '', internalType: 'contract IVotingEscrow', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_tokenId', internalType: 'uint256', type: 'uint256' },
      { name: '_poolList', internalType: 'address[]', type: 'address[]' },
      { name: 'weightList', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'vote',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'votingRewardFactory',
    outputs: [
      {
        name: '',
        internalType: 'contract VotingRewardFactory',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: '_pool',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: '_amount0',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: '_amount1',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'DistributeAlgebraFees',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: '_gauge',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: '_amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: '_period',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'DistributeEmissions',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: '_gauge',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: '_votingReward',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: '_pool',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'GaugeCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: '_gauge',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'GaugeKilled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: '_gauge',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'GaugeRevived',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'version',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferStarted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'previousAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'newAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'RoleAdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleGranted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleRevoked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: '_token',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      { name: '_status', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'TokenStatus',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'implementation',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'Upgraded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: '_tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: '_votingPower',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: '_period',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Voted',
  },
  { type: 'error', inputs: [], name: 'AccessControlBadConfirmation' },
  {
    type: 'error',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'neededRole', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'AccessControlUnauthorizedAccount',
  },
  {
    type: 'error',
    inputs: [{ name: 'target', internalType: 'address', type: 'address' }],
    name: 'AddressEmptyCode',
  },
  { type: 'error', inputs: [], name: 'AlreadyVotedForPool' },
  { type: 'error', inputs: [], name: 'AlreadyVotedInPeriod' },
  {
    type: 'error',
    inputs: [
      { name: 'implementation', internalType: 'address', type: 'address' },
    ],
    name: 'ERC1967InvalidImplementation',
  },
  { type: 'error', inputs: [], name: 'ERC1967NonPayable' },
  { type: 'error', inputs: [], name: 'FailedCall' },
  { type: 'error', inputs: [], name: 'GaugeAlreadyExist' },
  { type: 'error', inputs: [], name: 'GaugeDead' },
  { type: 'error', inputs: [], name: 'GaugeDoesNotExist' },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  { type: 'error', inputs: [], name: 'InvalidParameters' },
  { type: 'error', inputs: [], name: 'InvalidPeriod' },
  { type: 'error', inputs: [], name: 'NotApprovedOrOwner' },
  { type: 'error', inputs: [], name: 'NotInitializing' },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  {
    type: 'error',
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'SafeERC20FailedOperation',
  },
  { type: 'error', inputs: [], name: 'TokenNotWhitelisted' },
  { type: 'error', inputs: [], name: 'UUPSUnauthorizedCallContext' },
  {
    type: 'error',
    inputs: [{ name: 'slot', internalType: 'bytes32', type: 'bytes32' }],
    name: 'UUPSUnsupportedProxiableUUID',
  },
  { type: 'error', inputs: [], name: 'Unauthorized' },
  { type: 'error', inputs: [], name: 'ZeroVotes' },
] as const

/**
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const voterAddress = {
  43111: '0x0000000000000000000000000000000000000000',
} as const

/**
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const voterConfig = { address: voterAddress, abi: voterAbi } as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// VotingEscrow
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const votingEscrowAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  {
    type: 'function',
    inputs: [],
    name: 'MAXTIME',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MULTIPLIER',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'UPGRADE_INTERFACE_VERSION',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'WEEK',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'acceptOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'artProxy',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'balanceOfNFT',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'checkpoint',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_value', internalType: 'uint256', type: 'uint256' },
      { name: '_lock_duration', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'create_lock',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_value', internalType: 'uint256', type: 'uint256' },
      { name: '_lock_duration', internalType: 'uint256', type: 'uint256' },
      { name: '_to', internalType: 'address', type: 'address' },
    ],
    name: 'create_lock_for',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_tokenId', internalType: 'uint256', type: 'uint256' },
      { name: '_value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'deposit_for',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'epoch',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getApproved',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'get_last_user_slope',
    outputs: [{ name: '', internalType: 'int128', type: 'int128' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'iMAXTIME',
    outputs: [{ name: '', internalType: 'int128', type: 'int128' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_tokenId', internalType: 'uint256', type: 'uint256' },
      { name: '_value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'increase_amount',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_tokenId', internalType: 'uint256', type: 'uint256' },
      { name: '_lock_duration', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'increase_unlock_time',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_token', internalType: 'address', type: 'address' },
      { name: 'art_proxy', internalType: 'address', type: 'address' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'operator', internalType: 'address', type: 'address' },
    ],
    name: 'isApprovedForAll',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_spender', internalType: 'address', type: 'address' },
      { name: '_tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'isApprovedOrOwner',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'locked',
    outputs: [
      { name: 'amount', internalType: 'int128', type: 'int128' },
      { name: 'end', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_from', internalType: 'uint256', type: 'uint256' },
      { name: '_to', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'merge',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'ownership_change',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pendingOwner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'point_history',
    outputs: [
      { name: 'bias', internalType: 'int128', type: 'int128' },
      { name: 'slope', internalType: 'int128', type: 'int128' },
      { name: 'ts', internalType: 'uint256', type: 'uint256' },
      { name: 'blk', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'approved', internalType: 'bool', type: 'bool' },
    ],
    name: 'setApprovalForAll',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_proxy', internalType: 'address', type: 'address' }],
    name: 'setArtProxy',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_voter', internalType: 'address', type: 'address' }],
    name: 'setVoter',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'slope_changes',
    outputs: [{ name: '', internalType: 'int128', type: 'int128' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_from', internalType: 'uint256', type: 'uint256' },
      { name: '_weightList', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'split',
    outputs: [
      { name: 'tokenIdList', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'supply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'token',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'index', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenByIndex',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'tokenId',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'index', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'tokenOfOwnerByIndex',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalVotingPower',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_tokenId', internalType: 'uint256', type: 'uint256' },
      { name: '_idx', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'userPointHistory',
    outputs: [
      {
        name: '',
        internalType: 'struct IVotingEscrow.Point',
        type: 'tuple',
        components: [
          { name: 'bias', internalType: 'int128', type: 'int128' },
          { name: 'slope', internalType: 'int128', type: 'int128' },
          { name: 'ts', internalType: 'uint256', type: 'uint256' },
          { name: 'blk', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'user_point_epoch',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'voted',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'voter',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'approved',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'operator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'approved', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'ApprovalForAll',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'provider',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'locktime',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'deposit_type',
        internalType: 'enum IVotingEscrow.DepositType',
        type: 'uint8',
        indexed: false,
      },
      { name: 'ts', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'Deposit',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'version',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferStarted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: '_from',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: '_sender',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: '_count',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Split',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'prevSupply',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'supply',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Supply',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'Transfer',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'implementation',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'Upgraded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'provider',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      { name: 'ts', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'Withdraw',
  },
  {
    type: 'error',
    inputs: [{ name: 'target', internalType: 'address', type: 'address' }],
    name: 'AddressEmptyCode',
  },
  {
    type: 'error',
    inputs: [
      { name: 'implementation', internalType: 'address', type: 'address' },
    ],
    name: 'ERC1967InvalidImplementation',
  },
  { type: 'error', inputs: [], name: 'ERC1967NonPayable' },
  { type: 'error', inputs: [], name: 'ERC721EnumerableForbiddenBatchMint' },
  {
    type: 'error',
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'owner', internalType: 'address', type: 'address' },
    ],
    name: 'ERC721IncorrectOwner',
  },
  {
    type: 'error',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC721InsufficientApproval',
  },
  {
    type: 'error',
    inputs: [{ name: 'approver', internalType: 'address', type: 'address' }],
    name: 'ERC721InvalidApprover',
  },
  {
    type: 'error',
    inputs: [{ name: 'operator', internalType: 'address', type: 'address' }],
    name: 'ERC721InvalidOperator',
  },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'ERC721InvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'receiver', internalType: 'address', type: 'address' }],
    name: 'ERC721InvalidReceiver',
  },
  {
    type: 'error',
    inputs: [{ name: 'sender', internalType: 'address', type: 'address' }],
    name: 'ERC721InvalidSender',
  },
  {
    type: 'error',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'ERC721NonexistentToken',
  },
  {
    type: 'error',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'index', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC721OutOfBoundsIndex',
  },
  { type: 'error', inputs: [], name: 'FailedCall' },
  { type: 'error', inputs: [], name: 'Invalid' },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  { type: 'error', inputs: [], name: 'InvalidParameters' },
  { type: 'error', inputs: [], name: 'LockExpired' },
  { type: 'error', inputs: [], name: 'LockNotExist' },
  { type: 'error', inputs: [], name: 'NotExpired' },
  { type: 'error', inputs: [], name: 'NotInitializing' },
  { type: 'error', inputs: [], name: 'NotVoter' },
  { type: 'error', inputs: [], name: 'OverMaxLockTime' },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  {
    type: 'error',
    inputs: [{ name: 'value', internalType: 'int256', type: 'int256' }],
    name: 'SafeCastOverflowedIntToUint',
  },
  { type: 'error', inputs: [], name: 'UUPSUnauthorizedCallContext' },
  {
    type: 'error',
    inputs: [{ name: 'slot', internalType: 'bytes32', type: 'bytes32' }],
    name: 'UUPSUnsupportedProxiableUUID',
  },
  { type: 'error', inputs: [], name: 'Voted' },
  { type: 'error', inputs: [], name: 'ZeroSplit' },
] as const

/**
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const votingEscrowAddress = {
  43111: '0x0000000000000000000000000000000000000000',
} as const

/**
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const votingEscrowConfig = {
  address: votingEscrowAddress,
  abi: votingEscrowAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// VotingReward
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const votingRewardAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DURATION',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'NOTIFY_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'PRECISION',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'UPGRADE_INTERFACE_VERSION',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_amount', internalType: 'uint256', type: 'uint256' },
      { name: '_tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: '_deposit',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_amount', internalType: 'uint256', type: 'uint256' },
      { name: '_tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: '_withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'acceptOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_period', internalType: 'uint256', type: 'uint256' },
      { name: '_tokenId', internalType: 'uint256', type: 'uint256' },
      { name: '_token', internalType: 'address', type: 'address' },
    ],
    name: 'earnedForPeriod',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_tokenId', internalType: 'uint256', type: 'uint256' },
      { name: '_token', internalType: 'address', type: 'address' },
    ],
    name: 'earnedForToken',
    outputs: [{ name: 'reward', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'earnedForTokenId',
    outputs: [
      { name: 'rewardList', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'tokenList', internalType: 'address[]', type: 'address[]' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getCurrentPeriod',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getRewardForOwner',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_period', internalType: 'uint256', type: 'uint256' },
      { name: '_tokenId', internalType: 'uint256', type: 'uint256' },
      { name: '_token', internalType: 'address', type: 'address' },
    ],
    name: 'getRewardForPeriod',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getRewardForTokenId',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getRewardList',
    outputs: [{ name: '', internalType: 'address[]', type: 'address[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_account', internalType: 'address', type: 'address' }],
    name: 'grantNotifyRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_token', internalType: 'address', type: 'address' },
      { name: '_amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'incentivize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_voter', internalType: 'address', type: 'address' },
      { name: '_veTOKEN', internalType: 'address', type: 'address' },
      { name: '_initialOwner', internalType: 'address', type: 'address' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_token', internalType: 'address', type: 'address' },
      { name: '_amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'notifyRewardAmount',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pendingOwner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'periodInit',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'callerConfirmation', internalType: 'address', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_period', internalType: 'uint256', type: 'uint256' },
      { name: '_reward', internalType: 'address', type: 'address' },
    ],
    name: 'rewardForPeriod',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_period', internalType: 'uint256', type: 'uint256' },
      { name: '_tokenId', internalType: 'uint256', type: 'uint256' },
      { name: '_reward', internalType: 'address', type: 'address' },
    ],
    name: 'tokenIdRewardClaimedInPeriod',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_period', internalType: 'uint256', type: 'uint256' },
      { name: '_tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'tokenIdVotesInPeriod',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_period', internalType: 'uint256', type: 'uint256' }],
    name: 'totalVotesInPeriod',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_token', internalType: 'address', type: 'address' }],
    name: 'transferERC20',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'veTOKEN',
    outputs: [
      { name: '', internalType: 'contract IVotingEscrow', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'voter',
    outputs: [{ name: '', internalType: 'contract IVoter', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: '_period',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: '_tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: '_token',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      { name: '_to', internalType: 'address', type: 'address', indexed: false },
    ],
    name: 'ClaimReward',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: '_period',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: '_amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: '_tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Deposit',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: '_period',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: '_from',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: '_token',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'IncentivizedReward',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'version',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: '_period',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: '_from',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: '_token',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'NotifyReward',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferStarted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'previousAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'newAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'RoleAdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleGranted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleRevoked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'implementation',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'Upgraded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: '_period',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: '_amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: '_tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Withdraw',
  },
  { type: 'error', inputs: [], name: 'AccessControlBadConfirmation' },
  {
    type: 'error',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'neededRole', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'AccessControlUnauthorizedAccount',
  },
  {
    type: 'error',
    inputs: [{ name: 'target', internalType: 'address', type: 'address' }],
    name: 'AddressEmptyCode',
  },
  {
    type: 'error',
    inputs: [
      { name: 'implementation', internalType: 'address', type: 'address' },
    ],
    name: 'ERC1967InvalidImplementation',
  },
  { type: 'error', inputs: [], name: 'ERC1967NonPayable' },
  { type: 'error', inputs: [], name: 'FailedCall' },
  { type: 'error', inputs: [], name: 'FuturePeriodNotClaimable' },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  { type: 'error', inputs: [], name: 'NotApprovedOrOwner' },
  { type: 'error', inputs: [], name: 'NotInitializing' },
  { type: 'error', inputs: [], name: 'NotVoter' },
  { type: 'error', inputs: [], name: 'NotWhitelistedRewardToken' },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  {
    type: 'error',
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'SafeERC20FailedOperation',
  },
  { type: 'error', inputs: [], name: 'UUPSUnauthorizedCallContext' },
  {
    type: 'error',
    inputs: [{ name: 'slot', internalType: 'bytes32', type: 'bytes32' }],
    name: 'UUPSUnsupportedProxiableUUID',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// WrappedNative
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const wrappedNativeAbi = [
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
  },
  {
    constant: false,
    payable: false,
    type: 'function',
    inputs: [
      { name: 'guy', type: 'address' },
      { name: 'wad', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    constant: false,
    payable: false,
    type: 'function',
    inputs: [
      { name: 'src', type: 'address' },
      { name: 'dst', type: 'address' },
      { name: 'wad', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    constant: false,
    payable: false,
    type: 'function',
    inputs: [{ name: 'wad', type: 'uint256' }],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [{ name: '', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
  },
  {
    constant: false,
    payable: false,
    type: 'function',
    inputs: [
      { name: 'dst', type: 'address' },
      { name: 'wad', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    constant: false,
    payable: true,
    type: 'function',
    inputs: [],
    name: 'deposit',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [
      { name: '', type: 'address' },
      { name: '', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  { payable: true, type: 'fallback', stateMutability: 'payable' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'src', type: 'address', indexed: true },
      { name: 'guy', type: 'address', indexed: true },
      { name: 'wad', type: 'uint256', indexed: false },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'src', type: 'address', indexed: true },
      { name: 'dst', type: 'address', indexed: true },
      { name: 'wad', type: 'uint256', indexed: false },
    ],
    name: 'Transfer',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'dst', type: 'address', indexed: true },
      { name: 'wad', type: 'uint256', indexed: false },
    ],
    name: 'Deposit',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'src', type: 'address', indexed: true },
      { name: 'wad', type: 'uint256', indexed: false },
    ],
    name: 'Withdrawal',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__
 */
export const useReadAlgebraBasePluginV1 = /*#__PURE__*/ createUseReadContract({
  abi: algebraBasePluginV1Abi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"ALGEBRA_BASE_PLUGIN_MANAGER"`
 */
export const useReadAlgebraBasePluginV1AlgebraBasePluginManager =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'ALGEBRA_BASE_PLUGIN_MANAGER',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"defaultPluginConfig"`
 */
export const useReadAlgebraBasePluginV1DefaultPluginConfig =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'defaultPluginConfig',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"feeConfig"`
 */
export const useReadAlgebraBasePluginV1FeeConfig =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'feeConfig',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"getCurrentFee"`
 */
export const useReadAlgebraBasePluginV1GetCurrentFee =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'getCurrentFee',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"getPool"`
 */
export const useReadAlgebraBasePluginV1GetPool =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'getPool',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"getSingleTimepoint"`
 */
export const useReadAlgebraBasePluginV1GetSingleTimepoint =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'getSingleTimepoint',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"getTimepoints"`
 */
export const useReadAlgebraBasePluginV1GetTimepoints =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'getTimepoints',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"handlePluginFee"`
 */
export const useReadAlgebraBasePluginV1HandlePluginFee =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'handlePluginFee',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"incentive"`
 */
export const useReadAlgebraBasePluginV1Incentive =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'incentive',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"isIncentiveConnected"`
 */
export const useReadAlgebraBasePluginV1IsIncentiveConnected =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'isIncentiveConnected',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"isInitialized"`
 */
export const useReadAlgebraBasePluginV1IsInitialized =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'isInitialized',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"lastTimepointTimestamp"`
 */
export const useReadAlgebraBasePluginV1LastTimepointTimestamp =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'lastTimepointTimestamp',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"pool"`
 */
export const useReadAlgebraBasePluginV1Pool =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'pool',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"timepointIndex"`
 */
export const useReadAlgebraBasePluginV1TimepointIndex =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'timepointIndex',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"timepoints"`
 */
export const useReadAlgebraBasePluginV1Timepoints =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'timepoints',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__
 */
export const useWriteAlgebraBasePluginV1 = /*#__PURE__*/ createUseWriteContract(
  { abi: algebraBasePluginV1Abi },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"afterFlash"`
 */
export const useWriteAlgebraBasePluginV1AfterFlash =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'afterFlash',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"afterInitialize"`
 */
export const useWriteAlgebraBasePluginV1AfterInitialize =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'afterInitialize',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"afterModifyPosition"`
 */
export const useWriteAlgebraBasePluginV1AfterModifyPosition =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'afterModifyPosition',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"afterSwap"`
 */
export const useWriteAlgebraBasePluginV1AfterSwap =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'afterSwap',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"beforeFlash"`
 */
export const useWriteAlgebraBasePluginV1BeforeFlash =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'beforeFlash',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"beforeInitialize"`
 */
export const useWriteAlgebraBasePluginV1BeforeInitialize =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'beforeInitialize',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"beforeModifyPosition"`
 */
export const useWriteAlgebraBasePluginV1BeforeModifyPosition =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'beforeModifyPosition',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"beforeSwap"`
 */
export const useWriteAlgebraBasePluginV1BeforeSwap =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'beforeSwap',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"changeFeeConfiguration"`
 */
export const useWriteAlgebraBasePluginV1ChangeFeeConfiguration =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'changeFeeConfiguration',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"collectPluginFee"`
 */
export const useWriteAlgebraBasePluginV1CollectPluginFee =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'collectPluginFee',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"initialize"`
 */
export const useWriteAlgebraBasePluginV1Initialize =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"prepayTimepointsStorageSlots"`
 */
export const useWriteAlgebraBasePluginV1PrepayTimepointsStorageSlots =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'prepayTimepointsStorageSlots',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"setIncentive"`
 */
export const useWriteAlgebraBasePluginV1SetIncentive =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'setIncentive',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__
 */
export const useSimulateAlgebraBasePluginV1 =
  /*#__PURE__*/ createUseSimulateContract({ abi: algebraBasePluginV1Abi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"afterFlash"`
 */
export const useSimulateAlgebraBasePluginV1AfterFlash =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'afterFlash',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"afterInitialize"`
 */
export const useSimulateAlgebraBasePluginV1AfterInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'afterInitialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"afterModifyPosition"`
 */
export const useSimulateAlgebraBasePluginV1AfterModifyPosition =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'afterModifyPosition',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"afterSwap"`
 */
export const useSimulateAlgebraBasePluginV1AfterSwap =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'afterSwap',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"beforeFlash"`
 */
export const useSimulateAlgebraBasePluginV1BeforeFlash =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'beforeFlash',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"beforeInitialize"`
 */
export const useSimulateAlgebraBasePluginV1BeforeInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'beforeInitialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"beforeModifyPosition"`
 */
export const useSimulateAlgebraBasePluginV1BeforeModifyPosition =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'beforeModifyPosition',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"beforeSwap"`
 */
export const useSimulateAlgebraBasePluginV1BeforeSwap =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'beforeSwap',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"changeFeeConfiguration"`
 */
export const useSimulateAlgebraBasePluginV1ChangeFeeConfiguration =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'changeFeeConfiguration',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"collectPluginFee"`
 */
export const useSimulateAlgebraBasePluginV1CollectPluginFee =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'collectPluginFee',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateAlgebraBasePluginV1Initialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"prepayTimepointsStorageSlots"`
 */
export const useSimulateAlgebraBasePluginV1PrepayTimepointsStorageSlots =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'prepayTimepointsStorageSlots',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"setIncentive"`
 */
export const useSimulateAlgebraBasePluginV1SetIncentive =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'setIncentive',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraBasePluginV1Abi}__
 */
export const useWatchAlgebraBasePluginV1Event =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: algebraBasePluginV1Abi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `eventName` set to `"FeeConfiguration"`
 */
export const useWatchAlgebraBasePluginV1FeeConfigurationEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraBasePluginV1Abi,
    eventName: 'FeeConfiguration',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `eventName` set to `"Incentive"`
 */
export const useWatchAlgebraBasePluginV1IncentiveEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraBasePluginV1Abi,
    eventName: 'Incentive',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraCustomPoolEntryPointAbi}__
 */
export const useReadAlgebraCustomPoolEntryPoint =
  /*#__PURE__*/ createUseReadContract({ abi: algebraCustomPoolEntryPointAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraCustomPoolEntryPointAbi}__ and `functionName` set to `"ALGEBRA_CUSTOM_PLUGIN_ADMINISTRATOR"`
 */
export const useReadAlgebraCustomPoolEntryPointAlgebraCustomPluginAdministrator =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraCustomPoolEntryPointAbi,
    functionName: 'ALGEBRA_CUSTOM_PLUGIN_ADMINISTRATOR',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraCustomPoolEntryPointAbi}__ and `functionName` set to `"afterCreatePoolHook"`
 */
export const useReadAlgebraCustomPoolEntryPointAfterCreatePoolHook =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraCustomPoolEntryPointAbi,
    functionName: 'afterCreatePoolHook',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraCustomPoolEntryPointAbi}__ and `functionName` set to `"algebraFactory"`
 */
export const useReadAlgebraCustomPoolEntryPointAlgebraFactory =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraCustomPoolEntryPointAbi,
    functionName: 'algebraFactory',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraCustomPoolEntryPointAbi}__ and `functionName` set to `"defaultFeeConfiguration"`
 */
export const useReadAlgebraCustomPoolEntryPointDefaultFeeConfiguration =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraCustomPoolEntryPointAbi,
    functionName: 'defaultFeeConfiguration',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraCustomPoolEntryPointAbi}__ and `functionName` set to `"entryPoint"`
 */
export const useReadAlgebraCustomPoolEntryPointEntryPoint =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraCustomPoolEntryPointAbi,
    functionName: 'entryPoint',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraCustomPoolEntryPointAbi}__ and `functionName` set to `"farmingAddress"`
 */
export const useReadAlgebraCustomPoolEntryPointFarmingAddress =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraCustomPoolEntryPointAbi,
    functionName: 'farmingAddress',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraCustomPoolEntryPointAbi}__ and `functionName` set to `"pluginByPool"`
 */
export const useReadAlgebraCustomPoolEntryPointPluginByPool =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraCustomPoolEntryPointAbi,
    functionName: 'pluginByPool',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraCustomPoolEntryPointAbi}__
 */
export const useWriteAlgebraCustomPoolEntryPoint =
  /*#__PURE__*/ createUseWriteContract({ abi: algebraCustomPoolEntryPointAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraCustomPoolEntryPointAbi}__ and `functionName` set to `"beforeCreatePoolHook"`
 */
export const useWriteAlgebraCustomPoolEntryPointBeforeCreatePoolHook =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraCustomPoolEntryPointAbi,
    functionName: 'beforeCreatePoolHook',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraCustomPoolEntryPointAbi}__ and `functionName` set to `"createCustomPool"`
 */
export const useWriteAlgebraCustomPoolEntryPointCreateCustomPool =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraCustomPoolEntryPointAbi,
    functionName: 'createCustomPool',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraCustomPoolEntryPointAbi}__ and `functionName` set to `"setDefaultFeeConfiguration"`
 */
export const useWriteAlgebraCustomPoolEntryPointSetDefaultFeeConfiguration =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraCustomPoolEntryPointAbi,
    functionName: 'setDefaultFeeConfiguration',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraCustomPoolEntryPointAbi}__ and `functionName` set to `"setFarmingAddress"`
 */
export const useWriteAlgebraCustomPoolEntryPointSetFarmingAddress =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraCustomPoolEntryPointAbi,
    functionName: 'setFarmingAddress',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraCustomPoolEntryPointAbi}__
 */
export const useSimulateAlgebraCustomPoolEntryPoint =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraCustomPoolEntryPointAbi,
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraCustomPoolEntryPointAbi}__ and `functionName` set to `"beforeCreatePoolHook"`
 */
export const useSimulateAlgebraCustomPoolEntryPointBeforeCreatePoolHook =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraCustomPoolEntryPointAbi,
    functionName: 'beforeCreatePoolHook',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraCustomPoolEntryPointAbi}__ and `functionName` set to `"createCustomPool"`
 */
export const useSimulateAlgebraCustomPoolEntryPointCreateCustomPool =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraCustomPoolEntryPointAbi,
    functionName: 'createCustomPool',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraCustomPoolEntryPointAbi}__ and `functionName` set to `"setDefaultFeeConfiguration"`
 */
export const useSimulateAlgebraCustomPoolEntryPointSetDefaultFeeConfiguration =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraCustomPoolEntryPointAbi,
    functionName: 'setDefaultFeeConfiguration',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraCustomPoolEntryPointAbi}__ and `functionName` set to `"setFarmingAddress"`
 */
export const useSimulateAlgebraCustomPoolEntryPointSetFarmingAddress =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraCustomPoolEntryPointAbi,
    functionName: 'setFarmingAddress',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraCustomPoolEntryPointAbi}__
 */
export const useWatchAlgebraCustomPoolEntryPointEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraCustomPoolEntryPointAbi,
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraCustomPoolEntryPointAbi}__ and `eventName` set to `"DefaultFeeConfiguration"`
 */
export const useWatchAlgebraCustomPoolEntryPointDefaultFeeConfigurationEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraCustomPoolEntryPointAbi,
    eventName: 'DefaultFeeConfiguration',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraCustomPoolEntryPointAbi}__ and `eventName` set to `"FarmingAddress"`
 */
export const useWatchAlgebraCustomPoolEntryPointFarmingAddressEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraCustomPoolEntryPointAbi,
    eventName: 'FarmingAddress',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const useReadAlgebraEternalFarming = /*#__PURE__*/ createUseReadContract(
  { abi: algebraEternalFarmingAbi, address: algebraEternalFarmingAddress },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"FARMINGS_ADMINISTRATOR_ROLE"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const useReadAlgebraEternalFarmingFarmingsAdministratorRole =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'FARMINGS_ADMINISTRATOR_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"INCENTIVE_MAKER_ROLE"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const useReadAlgebraEternalFarmingIncentiveMakerRole =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'INCENTIVE_MAKER_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"farmingCenter"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const useReadAlgebraEternalFarmingFarmingCenter =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'farmingCenter',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"farms"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const useReadAlgebraEternalFarmingFarms =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'farms',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"getRewardInfo"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const useReadAlgebraEternalFarmingGetRewardInfo =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'getRewardInfo',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"incentiveKeys"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const useReadAlgebraEternalFarmingIncentiveKeys =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'incentiveKeys',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"incentives"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const useReadAlgebraEternalFarmingIncentives =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'incentives',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"isEmergencyWithdrawActivated"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const useReadAlgebraEternalFarmingIsEmergencyWithdrawActivated =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'isEmergencyWithdrawActivated',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"isIncentiveDeactivated"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const useReadAlgebraEternalFarmingIsIncentiveDeactivated =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'isIncentiveDeactivated',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"nonfungiblePositionManager"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const useReadAlgebraEternalFarmingNonfungiblePositionManager =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'nonfungiblePositionManager',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"numOfIncentives"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const useReadAlgebraEternalFarmingNumOfIncentives =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'numOfIncentives',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"rewards"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const useReadAlgebraEternalFarmingRewards =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'rewards',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const useWriteAlgebraEternalFarming =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"addRewards"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const useWriteAlgebraEternalFarmingAddRewards =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'addRewards',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"claimReward"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const useWriteAlgebraEternalFarmingClaimReward =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'claimReward',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"claimRewardFrom"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const useWriteAlgebraEternalFarmingClaimRewardFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'claimRewardFrom',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"collectRewards"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const useWriteAlgebraEternalFarmingCollectRewards =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'collectRewards',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"createEternalFarming"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const useWriteAlgebraEternalFarmingCreateEternalFarming =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'createEternalFarming',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"deactivateIncentive"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const useWriteAlgebraEternalFarmingDeactivateIncentive =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'deactivateIncentive',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"decreaseRewardsAmount"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const useWriteAlgebraEternalFarmingDecreaseRewardsAmount =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'decreaseRewardsAmount',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"enterFarming"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const useWriteAlgebraEternalFarmingEnterFarming =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'enterFarming',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"exitFarming"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const useWriteAlgebraEternalFarmingExitFarming =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'exitFarming',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"setEmergencyWithdrawStatus"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const useWriteAlgebraEternalFarmingSetEmergencyWithdrawStatus =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'setEmergencyWithdrawStatus',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"setFarmingCenterAddress"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const useWriteAlgebraEternalFarmingSetFarmingCenterAddress =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'setFarmingCenterAddress',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"setRates"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const useWriteAlgebraEternalFarmingSetRates =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'setRates',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const useSimulateAlgebraEternalFarming =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"addRewards"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const useSimulateAlgebraEternalFarmingAddRewards =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'addRewards',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"claimReward"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const useSimulateAlgebraEternalFarmingClaimReward =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'claimReward',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"claimRewardFrom"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const useSimulateAlgebraEternalFarmingClaimRewardFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'claimRewardFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"collectRewards"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const useSimulateAlgebraEternalFarmingCollectRewards =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'collectRewards',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"createEternalFarming"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const useSimulateAlgebraEternalFarmingCreateEternalFarming =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'createEternalFarming',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"deactivateIncentive"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const useSimulateAlgebraEternalFarmingDeactivateIncentive =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'deactivateIncentive',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"decreaseRewardsAmount"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const useSimulateAlgebraEternalFarmingDecreaseRewardsAmount =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'decreaseRewardsAmount',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"enterFarming"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const useSimulateAlgebraEternalFarmingEnterFarming =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'enterFarming',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"exitFarming"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const useSimulateAlgebraEternalFarmingExitFarming =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'exitFarming',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"setEmergencyWithdrawStatus"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const useSimulateAlgebraEternalFarmingSetEmergencyWithdrawStatus =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'setEmergencyWithdrawStatus',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"setFarmingCenterAddress"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const useSimulateAlgebraEternalFarmingSetFarmingCenterAddress =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'setFarmingCenterAddress',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"setRates"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const useSimulateAlgebraEternalFarmingSetRates =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'setRates',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraEternalFarmingAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const useWatchAlgebraEternalFarmingEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `eventName` set to `"EmergencyWithdraw"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const useWatchAlgebraEternalFarmingEmergencyWithdrawEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    eventName: 'EmergencyWithdraw',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `eventName` set to `"EternalFarmingCreated"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const useWatchAlgebraEternalFarmingEternalFarmingCreatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    eventName: 'EternalFarmingCreated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `eventName` set to `"FarmEnded"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const useWatchAlgebraEternalFarmingFarmEndedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    eventName: 'FarmEnded',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `eventName` set to `"FarmEntered"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const useWatchAlgebraEternalFarmingFarmEnteredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    eventName: 'FarmEntered',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `eventName` set to `"FarmingCenter"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const useWatchAlgebraEternalFarmingFarmingCenterEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    eventName: 'FarmingCenter',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `eventName` set to `"IncentiveDeactivated"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const useWatchAlgebraEternalFarmingIncentiveDeactivatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    eventName: 'IncentiveDeactivated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `eventName` set to `"RewardAmountsDecreased"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const useWatchAlgebraEternalFarmingRewardAmountsDecreasedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    eventName: 'RewardAmountsDecreased',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `eventName` set to `"RewardClaimed"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const useWatchAlgebraEternalFarmingRewardClaimedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    eventName: 'RewardClaimed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `eventName` set to `"RewardsAdded"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const useWatchAlgebraEternalFarmingRewardsAddedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    eventName: 'RewardsAdded',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `eventName` set to `"RewardsCollected"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const useWatchAlgebraEternalFarmingRewardsCollectedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    eventName: 'RewardsCollected',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `eventName` set to `"RewardsRatesChanged"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const useWatchAlgebraEternalFarmingRewardsRatesChangedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    eventName: 'RewardsRatesChanged',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraFactoryAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useReadAlgebraFactory = /*#__PURE__*/ createUseReadContract({
  abi: algebraFactoryAbi,
  address: algebraFactoryAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"CUSTOM_POOL_DEPLOYER"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useReadAlgebraFactoryCustomPoolDeployer =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'CUSTOM_POOL_DEPLOYER',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"DEFAULT_ADMIN_ROLE"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useReadAlgebraFactoryDefaultAdminRole =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'DEFAULT_ADMIN_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"POOLS_ADMINISTRATOR_ROLE"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useReadAlgebraFactoryPoolsAdministratorRole =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'POOLS_ADMINISTRATOR_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"POOL_INIT_CODE_HASH"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useReadAlgebraFactoryPoolInitCodeHash =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'POOL_INIT_CODE_HASH',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"computeCustomPoolAddress"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useReadAlgebraFactoryComputeCustomPoolAddress =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'computeCustomPoolAddress',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"computePoolAddress"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useReadAlgebraFactoryComputePoolAddress =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'computePoolAddress',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"customPoolByPair"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useReadAlgebraFactoryCustomPoolByPair =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'customPoolByPair',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"defaultCommunityFee"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useReadAlgebraFactoryDefaultCommunityFee =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'defaultCommunityFee',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"defaultConfigurationForPool"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useReadAlgebraFactoryDefaultConfigurationForPool =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'defaultConfigurationForPool',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"defaultFee"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useReadAlgebraFactoryDefaultFee =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'defaultFee',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"defaultPluginFactory"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useReadAlgebraFactoryDefaultPluginFactory =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'defaultPluginFactory',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"defaultTickspacing"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useReadAlgebraFactoryDefaultTickspacing =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'defaultTickspacing',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"getRoleAdmin"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useReadAlgebraFactoryGetRoleAdmin =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'getRoleAdmin',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"getRoleMember"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useReadAlgebraFactoryGetRoleMember =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'getRoleMember',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"getRoleMemberCount"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useReadAlgebraFactoryGetRoleMemberCount =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'getRoleMemberCount',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"hasRole"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useReadAlgebraFactoryHasRole = /*#__PURE__*/ createUseReadContract(
  {
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'hasRole',
  },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"hasRoleOrOwner"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useReadAlgebraFactoryHasRoleOrOwner =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'hasRoleOrOwner',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"owner"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useReadAlgebraFactoryOwner = /*#__PURE__*/ createUseReadContract({
  abi: algebraFactoryAbi,
  address: algebraFactoryAddress,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"pendingOwner"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useReadAlgebraFactoryPendingOwner =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'pendingOwner',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"poolByPair"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useReadAlgebraFactoryPoolByPair =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'poolByPair',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"poolDeployer"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useReadAlgebraFactoryPoolDeployer =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'poolDeployer',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"renounceOwnershipStartTimestamp"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useReadAlgebraFactoryRenounceOwnershipStartTimestamp =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'renounceOwnershipStartTimestamp',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"supportsInterface"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useReadAlgebraFactorySupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"vaultFactory"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useReadAlgebraFactoryVaultFactory =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'vaultFactory',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraFactoryAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useWriteAlgebraFactory = /*#__PURE__*/ createUseWriteContract({
  abi: algebraFactoryAbi,
  address: algebraFactoryAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"acceptOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useWriteAlgebraFactoryAcceptOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'acceptOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"createCustomPool"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useWriteAlgebraFactoryCreateCustomPool =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'createCustomPool',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"createPool"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useWriteAlgebraFactoryCreatePool =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'createPool',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"grantRole"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useWriteAlgebraFactoryGrantRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useWriteAlgebraFactoryRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"renounceRole"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useWriteAlgebraFactoryRenounceRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"revokeRole"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useWriteAlgebraFactoryRevokeRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"setDefaultCommunityFee"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useWriteAlgebraFactorySetDefaultCommunityFee =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'setDefaultCommunityFee',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"setDefaultFee"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useWriteAlgebraFactorySetDefaultFee =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'setDefaultFee',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"setDefaultPluginFactory"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useWriteAlgebraFactorySetDefaultPluginFactory =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'setDefaultPluginFactory',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"setDefaultTickspacing"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useWriteAlgebraFactorySetDefaultTickspacing =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'setDefaultTickspacing',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"setVaultFactory"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useWriteAlgebraFactorySetVaultFactory =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'setVaultFactory',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"startRenounceOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useWriteAlgebraFactoryStartRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'startRenounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"stopRenounceOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useWriteAlgebraFactoryStopRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'stopRenounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useWriteAlgebraFactoryTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraFactoryAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useSimulateAlgebraFactory =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"acceptOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useSimulateAlgebraFactoryAcceptOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'acceptOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"createCustomPool"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useSimulateAlgebraFactoryCreateCustomPool =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'createCustomPool',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"createPool"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useSimulateAlgebraFactoryCreatePool =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'createPool',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"grantRole"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useSimulateAlgebraFactoryGrantRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useSimulateAlgebraFactoryRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"renounceRole"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useSimulateAlgebraFactoryRenounceRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"revokeRole"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useSimulateAlgebraFactoryRevokeRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"setDefaultCommunityFee"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useSimulateAlgebraFactorySetDefaultCommunityFee =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'setDefaultCommunityFee',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"setDefaultFee"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useSimulateAlgebraFactorySetDefaultFee =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'setDefaultFee',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"setDefaultPluginFactory"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useSimulateAlgebraFactorySetDefaultPluginFactory =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'setDefaultPluginFactory',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"setDefaultTickspacing"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useSimulateAlgebraFactorySetDefaultTickspacing =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'setDefaultTickspacing',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"setVaultFactory"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useSimulateAlgebraFactorySetVaultFactory =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'setVaultFactory',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"startRenounceOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useSimulateAlgebraFactoryStartRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'startRenounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"stopRenounceOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useSimulateAlgebraFactoryStopRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'stopRenounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useSimulateAlgebraFactoryTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraFactoryAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useWatchAlgebraFactoryEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraFactoryAbi}__ and `eventName` set to `"CustomPool"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useWatchAlgebraFactoryCustomPoolEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    eventName: 'CustomPool',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraFactoryAbi}__ and `eventName` set to `"DefaultCommunityFee"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useWatchAlgebraFactoryDefaultCommunityFeeEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    eventName: 'DefaultCommunityFee',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraFactoryAbi}__ and `eventName` set to `"DefaultFee"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useWatchAlgebraFactoryDefaultFeeEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    eventName: 'DefaultFee',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraFactoryAbi}__ and `eventName` set to `"DefaultPluginFactory"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useWatchAlgebraFactoryDefaultPluginFactoryEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    eventName: 'DefaultPluginFactory',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraFactoryAbi}__ and `eventName` set to `"DefaultTickspacing"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useWatchAlgebraFactoryDefaultTickspacingEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    eventName: 'DefaultTickspacing',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraFactoryAbi}__ and `eventName` set to `"OwnershipTransferStarted"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useWatchAlgebraFactoryOwnershipTransferStartedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    eventName: 'OwnershipTransferStarted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraFactoryAbi}__ and `eventName` set to `"OwnershipTransferred"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useWatchAlgebraFactoryOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraFactoryAbi}__ and `eventName` set to `"Pool"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useWatchAlgebraFactoryPoolEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    eventName: 'Pool',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraFactoryAbi}__ and `eventName` set to `"RenounceOwnershipFinish"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useWatchAlgebraFactoryRenounceOwnershipFinishEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    eventName: 'RenounceOwnershipFinish',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraFactoryAbi}__ and `eventName` set to `"RenounceOwnershipStart"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useWatchAlgebraFactoryRenounceOwnershipStartEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    eventName: 'RenounceOwnershipStart',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraFactoryAbi}__ and `eventName` set to `"RenounceOwnershipStop"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useWatchAlgebraFactoryRenounceOwnershipStopEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    eventName: 'RenounceOwnershipStop',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraFactoryAbi}__ and `eventName` set to `"RoleAdminChanged"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useWatchAlgebraFactoryRoleAdminChangedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    eventName: 'RoleAdminChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraFactoryAbi}__ and `eventName` set to `"RoleGranted"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useWatchAlgebraFactoryRoleGrantedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    eventName: 'RoleGranted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraFactoryAbi}__ and `eventName` set to `"RoleRevoked"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useWatchAlgebraFactoryRoleRevokedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    eventName: 'RoleRevoked',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraFactoryAbi}__ and `eventName` set to `"VaultFactory"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const useWatchAlgebraFactoryVaultFactoryEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    eventName: 'VaultFactory',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPoolAbi}__
 */
export const useReadAlgebraPool = /*#__PURE__*/ createUseReadContract({
  abi: algebraPoolAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"communityVault"`
 */
export const useReadAlgebraPoolCommunityVault =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraPoolAbi,
    functionName: 'communityVault',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"factory"`
 */
export const useReadAlgebraPoolFactory = /*#__PURE__*/ createUseReadContract({
  abi: algebraPoolAbi,
  functionName: 'factory',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"fee"`
 */
export const useReadAlgebraPoolFee = /*#__PURE__*/ createUseReadContract({
  abi: algebraPoolAbi,
  functionName: 'fee',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"getCommunityFeePending"`
 */
export const useReadAlgebraPoolGetCommunityFeePending =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraPoolAbi,
    functionName: 'getCommunityFeePending',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"getPluginFeePending"`
 */
export const useReadAlgebraPoolGetPluginFeePending =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraPoolAbi,
    functionName: 'getPluginFeePending',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"getReserves"`
 */
export const useReadAlgebraPoolGetReserves =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraPoolAbi,
    functionName: 'getReserves',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"globalState"`
 */
export const useReadAlgebraPoolGlobalState =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraPoolAbi,
    functionName: 'globalState',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"isUnlocked"`
 */
export const useReadAlgebraPoolIsUnlocked = /*#__PURE__*/ createUseReadContract(
  { abi: algebraPoolAbi, functionName: 'isUnlocked' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"lastFeeTransferTimestamp"`
 */
export const useReadAlgebraPoolLastFeeTransferTimestamp =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraPoolAbi,
    functionName: 'lastFeeTransferTimestamp',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"liquidity"`
 */
export const useReadAlgebraPoolLiquidity = /*#__PURE__*/ createUseReadContract({
  abi: algebraPoolAbi,
  functionName: 'liquidity',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"maxLiquidityPerTick"`
 */
export const useReadAlgebraPoolMaxLiquidityPerTick =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraPoolAbi,
    functionName: 'maxLiquidityPerTick',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"nextTickGlobal"`
 */
export const useReadAlgebraPoolNextTickGlobal =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraPoolAbi,
    functionName: 'nextTickGlobal',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"plugin"`
 */
export const useReadAlgebraPoolPlugin = /*#__PURE__*/ createUseReadContract({
  abi: algebraPoolAbi,
  functionName: 'plugin',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"positions"`
 */
export const useReadAlgebraPoolPositions = /*#__PURE__*/ createUseReadContract({
  abi: algebraPoolAbi,
  functionName: 'positions',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"prevTickGlobal"`
 */
export const useReadAlgebraPoolPrevTickGlobal =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraPoolAbi,
    functionName: 'prevTickGlobal',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"safelyGetStateOfAMM"`
 */
export const useReadAlgebraPoolSafelyGetStateOfAmm =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraPoolAbi,
    functionName: 'safelyGetStateOfAMM',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"tickSpacing"`
 */
export const useReadAlgebraPoolTickSpacing =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraPoolAbi,
    functionName: 'tickSpacing',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"tickTable"`
 */
export const useReadAlgebraPoolTickTable = /*#__PURE__*/ createUseReadContract({
  abi: algebraPoolAbi,
  functionName: 'tickTable',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"tickTreeRoot"`
 */
export const useReadAlgebraPoolTickTreeRoot =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraPoolAbi,
    functionName: 'tickTreeRoot',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"tickTreeSecondLayer"`
 */
export const useReadAlgebraPoolTickTreeSecondLayer =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraPoolAbi,
    functionName: 'tickTreeSecondLayer',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"ticks"`
 */
export const useReadAlgebraPoolTicks = /*#__PURE__*/ createUseReadContract({
  abi: algebraPoolAbi,
  functionName: 'ticks',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"token0"`
 */
export const useReadAlgebraPoolToken0 = /*#__PURE__*/ createUseReadContract({
  abi: algebraPoolAbi,
  functionName: 'token0',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"token1"`
 */
export const useReadAlgebraPoolToken1 = /*#__PURE__*/ createUseReadContract({
  abi: algebraPoolAbi,
  functionName: 'token1',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"totalFeeGrowth0Token"`
 */
export const useReadAlgebraPoolTotalFeeGrowth0Token =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraPoolAbi,
    functionName: 'totalFeeGrowth0Token',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"totalFeeGrowth1Token"`
 */
export const useReadAlgebraPoolTotalFeeGrowth1Token =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraPoolAbi,
    functionName: 'totalFeeGrowth1Token',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraPoolAbi}__
 */
export const useWriteAlgebraPool = /*#__PURE__*/ createUseWriteContract({
  abi: algebraPoolAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"burn"`
 */
export const useWriteAlgebraPoolBurn = /*#__PURE__*/ createUseWriteContract({
  abi: algebraPoolAbi,
  functionName: 'burn',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"collect"`
 */
export const useWriteAlgebraPoolCollect = /*#__PURE__*/ createUseWriteContract({
  abi: algebraPoolAbi,
  functionName: 'collect',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"flash"`
 */
export const useWriteAlgebraPoolFlash = /*#__PURE__*/ createUseWriteContract({
  abi: algebraPoolAbi,
  functionName: 'flash',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"initialize"`
 */
export const useWriteAlgebraPoolInitialize =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraPoolAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"mint"`
 */
export const useWriteAlgebraPoolMint = /*#__PURE__*/ createUseWriteContract({
  abi: algebraPoolAbi,
  functionName: 'mint',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"setCommunityFee"`
 */
export const useWriteAlgebraPoolSetCommunityFee =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraPoolAbi,
    functionName: 'setCommunityFee',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"setCommunityVault"`
 */
export const useWriteAlgebraPoolSetCommunityVault =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraPoolAbi,
    functionName: 'setCommunityVault',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"setFee"`
 */
export const useWriteAlgebraPoolSetFee = /*#__PURE__*/ createUseWriteContract({
  abi: algebraPoolAbi,
  functionName: 'setFee',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"setPlugin"`
 */
export const useWriteAlgebraPoolSetPlugin =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraPoolAbi,
    functionName: 'setPlugin',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"setPluginConfig"`
 */
export const useWriteAlgebraPoolSetPluginConfig =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraPoolAbi,
    functionName: 'setPluginConfig',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"setTickSpacing"`
 */
export const useWriteAlgebraPoolSetTickSpacing =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraPoolAbi,
    functionName: 'setTickSpacing',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"skim"`
 */
export const useWriteAlgebraPoolSkim = /*#__PURE__*/ createUseWriteContract({
  abi: algebraPoolAbi,
  functionName: 'skim',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"swap"`
 */
export const useWriteAlgebraPoolSwap = /*#__PURE__*/ createUseWriteContract({
  abi: algebraPoolAbi,
  functionName: 'swap',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"swapWithPaymentInAdvance"`
 */
export const useWriteAlgebraPoolSwapWithPaymentInAdvance =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraPoolAbi,
    functionName: 'swapWithPaymentInAdvance',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"sync"`
 */
export const useWriteAlgebraPoolSync = /*#__PURE__*/ createUseWriteContract({
  abi: algebraPoolAbi,
  functionName: 'sync',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraPoolAbi}__
 */
export const useSimulateAlgebraPool = /*#__PURE__*/ createUseSimulateContract({
  abi: algebraPoolAbi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"burn"`
 */
export const useSimulateAlgebraPoolBurn =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraPoolAbi,
    functionName: 'burn',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"collect"`
 */
export const useSimulateAlgebraPoolCollect =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraPoolAbi,
    functionName: 'collect',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"flash"`
 */
export const useSimulateAlgebraPoolFlash =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraPoolAbi,
    functionName: 'flash',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateAlgebraPoolInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraPoolAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"mint"`
 */
export const useSimulateAlgebraPoolMint =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraPoolAbi,
    functionName: 'mint',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"setCommunityFee"`
 */
export const useSimulateAlgebraPoolSetCommunityFee =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraPoolAbi,
    functionName: 'setCommunityFee',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"setCommunityVault"`
 */
export const useSimulateAlgebraPoolSetCommunityVault =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraPoolAbi,
    functionName: 'setCommunityVault',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"setFee"`
 */
export const useSimulateAlgebraPoolSetFee =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraPoolAbi,
    functionName: 'setFee',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"setPlugin"`
 */
export const useSimulateAlgebraPoolSetPlugin =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraPoolAbi,
    functionName: 'setPlugin',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"setPluginConfig"`
 */
export const useSimulateAlgebraPoolSetPluginConfig =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraPoolAbi,
    functionName: 'setPluginConfig',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"setTickSpacing"`
 */
export const useSimulateAlgebraPoolSetTickSpacing =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraPoolAbi,
    functionName: 'setTickSpacing',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"skim"`
 */
export const useSimulateAlgebraPoolSkim =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraPoolAbi,
    functionName: 'skim',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"swap"`
 */
export const useSimulateAlgebraPoolSwap =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraPoolAbi,
    functionName: 'swap',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"swapWithPaymentInAdvance"`
 */
export const useSimulateAlgebraPoolSwapWithPaymentInAdvance =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraPoolAbi,
    functionName: 'swapWithPaymentInAdvance',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"sync"`
 */
export const useSimulateAlgebraPoolSync =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraPoolAbi,
    functionName: 'sync',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraPoolAbi}__
 */
export const useWatchAlgebraPoolEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: algebraPoolAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraPoolAbi}__ and `eventName` set to `"Burn"`
 */
export const useWatchAlgebraPoolBurnEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraPoolAbi,
    eventName: 'Burn',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraPoolAbi}__ and `eventName` set to `"Collect"`
 */
export const useWatchAlgebraPoolCollectEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraPoolAbi,
    eventName: 'Collect',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraPoolAbi}__ and `eventName` set to `"CommunityFee"`
 */
export const useWatchAlgebraPoolCommunityFeeEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraPoolAbi,
    eventName: 'CommunityFee',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraPoolAbi}__ and `eventName` set to `"CommunityVault"`
 */
export const useWatchAlgebraPoolCommunityVaultEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraPoolAbi,
    eventName: 'CommunityVault',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraPoolAbi}__ and `eventName` set to `"ExcessTokens"`
 */
export const useWatchAlgebraPoolExcessTokensEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraPoolAbi,
    eventName: 'ExcessTokens',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraPoolAbi}__ and `eventName` set to `"Fee"`
 */
export const useWatchAlgebraPoolFeeEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraPoolAbi,
    eventName: 'Fee',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraPoolAbi}__ and `eventName` set to `"Flash"`
 */
export const useWatchAlgebraPoolFlashEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraPoolAbi,
    eventName: 'Flash',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraPoolAbi}__ and `eventName` set to `"Initialize"`
 */
export const useWatchAlgebraPoolInitializeEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraPoolAbi,
    eventName: 'Initialize',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraPoolAbi}__ and `eventName` set to `"Mint"`
 */
export const useWatchAlgebraPoolMintEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraPoolAbi,
    eventName: 'Mint',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraPoolAbi}__ and `eventName` set to `"Plugin"`
 */
export const useWatchAlgebraPoolPluginEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraPoolAbi,
    eventName: 'Plugin',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraPoolAbi}__ and `eventName` set to `"PluginConfig"`
 */
export const useWatchAlgebraPoolPluginConfigEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraPoolAbi,
    eventName: 'PluginConfig',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraPoolAbi}__ and `eventName` set to `"Skim"`
 */
export const useWatchAlgebraPoolSkimEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraPoolAbi,
    eventName: 'Skim',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraPoolAbi}__ and `eventName` set to `"Swap"`
 */
export const useWatchAlgebraPoolSwapEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraPoolAbi,
    eventName: 'Swap',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraPoolAbi}__ and `eventName` set to `"TickSpacing"`
 */
export const useWatchAlgebraPoolTickSpacingEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraPoolAbi,
    eventName: 'TickSpacing',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__
 */
export const useReadAlgebraVirtualPool = /*#__PURE__*/ createUseReadContract({
  abi: algebraVirtualPoolAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"FEE_WEIGHT_DENOMINATOR"`
 */
export const useReadAlgebraVirtualPoolFeeWeightDenominator =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'FEE_WEIGHT_DENOMINATOR',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"RATE_CHANGE_FREQUENCY"`
 */
export const useReadAlgebraVirtualPoolRateChangeFrequency =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'RATE_CHANGE_FREQUENCY',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"currentLiquidity"`
 */
export const useReadAlgebraVirtualPoolCurrentLiquidity =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'currentLiquidity',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"deactivated"`
 */
export const useReadAlgebraVirtualPoolDeactivated =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'deactivated',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"dynamicRateActivated"`
 */
export const useReadAlgebraVirtualPoolDynamicRateActivated =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'dynamicRateActivated',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"farmingAddress"`
 */
export const useReadAlgebraVirtualPoolFarmingAddress =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'farmingAddress',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"feeWeights"`
 */
export const useReadAlgebraVirtualPoolFeeWeights =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'feeWeights',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"getInnerRewardsGrowth"`
 */
export const useReadAlgebraVirtualPoolGetInnerRewardsGrowth =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'getInnerRewardsGrowth',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"globalTick"`
 */
export const useReadAlgebraVirtualPoolGlobalTick =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'globalTick',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"plugin"`
 */
export const useReadAlgebraVirtualPoolPlugin =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'plugin',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"prevTimestamp"`
 */
export const useReadAlgebraVirtualPoolPrevTimestamp =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'prevTimestamp',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"rateLimits"`
 */
export const useReadAlgebraVirtualPoolRateLimits =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'rateLimits',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"rewardRates"`
 */
export const useReadAlgebraVirtualPoolRewardRates =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'rewardRates',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"rewardReserves"`
 */
export const useReadAlgebraVirtualPoolRewardReserves =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'rewardReserves',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"ticks"`
 */
export const useReadAlgebraVirtualPoolTicks =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'ticks',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"totalRewardGrowth"`
 */
export const useReadAlgebraVirtualPoolTotalRewardGrowth =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'totalRewardGrowth',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__
 */
export const useWriteAlgebraVirtualPool = /*#__PURE__*/ createUseWriteContract({
  abi: algebraVirtualPoolAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"addRewards"`
 */
export const useWriteAlgebraVirtualPoolAddRewards =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'addRewards',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"applyLiquidityDeltaToPosition"`
 */
export const useWriteAlgebraVirtualPoolApplyLiquidityDeltaToPosition =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'applyLiquidityDeltaToPosition',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"crossTo"`
 */
export const useWriteAlgebraVirtualPoolCrossTo =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'crossTo',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"deactivate"`
 */
export const useWriteAlgebraVirtualPoolDeactivate =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'deactivate',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"decreaseRewards"`
 */
export const useWriteAlgebraVirtualPoolDecreaseRewards =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'decreaseRewards',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"distributeRewards"`
 */
export const useWriteAlgebraVirtualPoolDistributeRewards =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'distributeRewards',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"setDynamicRateLimits"`
 */
export const useWriteAlgebraVirtualPoolSetDynamicRateLimits =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'setDynamicRateLimits',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"setRates"`
 */
export const useWriteAlgebraVirtualPoolSetRates =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'setRates',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"setWeights"`
 */
export const useWriteAlgebraVirtualPoolSetWeights =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'setWeights',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"switchDynamicRate"`
 */
export const useWriteAlgebraVirtualPoolSwitchDynamicRate =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'switchDynamicRate',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__
 */
export const useSimulateAlgebraVirtualPool =
  /*#__PURE__*/ createUseSimulateContract({ abi: algebraVirtualPoolAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"addRewards"`
 */
export const useSimulateAlgebraVirtualPoolAddRewards =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'addRewards',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"applyLiquidityDeltaToPosition"`
 */
export const useSimulateAlgebraVirtualPoolApplyLiquidityDeltaToPosition =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'applyLiquidityDeltaToPosition',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"crossTo"`
 */
export const useSimulateAlgebraVirtualPoolCrossTo =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'crossTo',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"deactivate"`
 */
export const useSimulateAlgebraVirtualPoolDeactivate =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'deactivate',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"decreaseRewards"`
 */
export const useSimulateAlgebraVirtualPoolDecreaseRewards =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'decreaseRewards',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"distributeRewards"`
 */
export const useSimulateAlgebraVirtualPoolDistributeRewards =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'distributeRewards',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"setDynamicRateLimits"`
 */
export const useSimulateAlgebraVirtualPoolSetDynamicRateLimits =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'setDynamicRateLimits',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"setRates"`
 */
export const useSimulateAlgebraVirtualPoolSetRates =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'setRates',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"setWeights"`
 */
export const useSimulateAlgebraVirtualPoolSetWeights =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'setWeights',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"switchDynamicRate"`
 */
export const useSimulateAlgebraVirtualPoolSwitchDynamicRate =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'switchDynamicRate',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link farmingCenterAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA)
 */
export const useReadFarmingCenter = /*#__PURE__*/ createUseReadContract({
  abi: farmingCenterAbi,
  address: farmingCenterAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"algebraPoolDeployer"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA)
 */
export const useReadFarmingCenterAlgebraPoolDeployer =
  /*#__PURE__*/ createUseReadContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'algebraPoolDeployer',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"deposits"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA)
 */
export const useReadFarmingCenterDeposits = /*#__PURE__*/ createUseReadContract(
  {
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'deposits',
  },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"eternalFarming"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA)
 */
export const useReadFarmingCenterEternalFarming =
  /*#__PURE__*/ createUseReadContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'eternalFarming',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"incentiveKeys"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA)
 */
export const useReadFarmingCenterIncentiveKeys =
  /*#__PURE__*/ createUseReadContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'incentiveKeys',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"nonfungiblePositionManager"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA)
 */
export const useReadFarmingCenterNonfungiblePositionManager =
  /*#__PURE__*/ createUseReadContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'nonfungiblePositionManager',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"virtualPoolAddresses"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA)
 */
export const useReadFarmingCenterVirtualPoolAddresses =
  /*#__PURE__*/ createUseReadContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'virtualPoolAddresses',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link farmingCenterAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA)
 */
export const useWriteFarmingCenter = /*#__PURE__*/ createUseWriteContract({
  abi: farmingCenterAbi,
  address: farmingCenterAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"applyLiquidityDelta"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA)
 */
export const useWriteFarmingCenterApplyLiquidityDelta =
  /*#__PURE__*/ createUseWriteContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'applyLiquidityDelta',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"claimReward"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA)
 */
export const useWriteFarmingCenterClaimReward =
  /*#__PURE__*/ createUseWriteContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'claimReward',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"collectRewards"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA)
 */
export const useWriteFarmingCenterCollectRewards =
  /*#__PURE__*/ createUseWriteContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'collectRewards',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"connectVirtualPoolToPlugin"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA)
 */
export const useWriteFarmingCenterConnectVirtualPoolToPlugin =
  /*#__PURE__*/ createUseWriteContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'connectVirtualPoolToPlugin',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"disconnectVirtualPoolFromPlugin"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA)
 */
export const useWriteFarmingCenterDisconnectVirtualPoolFromPlugin =
  /*#__PURE__*/ createUseWriteContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'disconnectVirtualPoolFromPlugin',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"enterFarming"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA)
 */
export const useWriteFarmingCenterEnterFarming =
  /*#__PURE__*/ createUseWriteContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'enterFarming',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"exitFarming"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA)
 */
export const useWriteFarmingCenterExitFarming =
  /*#__PURE__*/ createUseWriteContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'exitFarming',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"multicall"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA)
 */
export const useWriteFarmingCenterMulticall =
  /*#__PURE__*/ createUseWriteContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'multicall',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link farmingCenterAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA)
 */
export const useSimulateFarmingCenter = /*#__PURE__*/ createUseSimulateContract(
  { abi: farmingCenterAbi, address: farmingCenterAddress },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"applyLiquidityDelta"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA)
 */
export const useSimulateFarmingCenterApplyLiquidityDelta =
  /*#__PURE__*/ createUseSimulateContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'applyLiquidityDelta',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"claimReward"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA)
 */
export const useSimulateFarmingCenterClaimReward =
  /*#__PURE__*/ createUseSimulateContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'claimReward',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"collectRewards"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA)
 */
export const useSimulateFarmingCenterCollectRewards =
  /*#__PURE__*/ createUseSimulateContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'collectRewards',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"connectVirtualPoolToPlugin"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA)
 */
export const useSimulateFarmingCenterConnectVirtualPoolToPlugin =
  /*#__PURE__*/ createUseSimulateContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'connectVirtualPoolToPlugin',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"disconnectVirtualPoolFromPlugin"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA)
 */
export const useSimulateFarmingCenterDisconnectVirtualPoolFromPlugin =
  /*#__PURE__*/ createUseSimulateContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'disconnectVirtualPoolFromPlugin',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"enterFarming"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA)
 */
export const useSimulateFarmingCenterEnterFarming =
  /*#__PURE__*/ createUseSimulateContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'enterFarming',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"exitFarming"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA)
 */
export const useSimulateFarmingCenterExitFarming =
  /*#__PURE__*/ createUseSimulateContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'exitFarming',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"multicall"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA)
 */
export const useSimulateFarmingCenterMulticall =
  /*#__PURE__*/ createUseSimulateContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'multicall',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link limitOrderManagerAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadLimitOrderManager = /*#__PURE__*/ createUseReadContract({
  abi: limitOrderManagerAbi,
  address: limitOrderManagerAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `functionName` set to `"ALGEBRA_BASE_PLUGIN_MANAGER"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadLimitOrderManagerAlgebraBasePluginManager =
  /*#__PURE__*/ createUseReadContract({
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
    functionName: 'ALGEBRA_BASE_PLUGIN_MANAGER',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `functionName` set to `"basePluginFactory"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadLimitOrderManagerBasePluginFactory =
  /*#__PURE__*/ createUseReadContract({
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
    functionName: 'basePluginFactory',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `functionName` set to `"epochInfos"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadLimitOrderManagerEpochInfos =
  /*#__PURE__*/ createUseReadContract({
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
    functionName: 'epochInfos',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `functionName` set to `"epochNext"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadLimitOrderManagerEpochNext =
  /*#__PURE__*/ createUseReadContract({
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
    functionName: 'epochNext',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `functionName` set to `"epochs"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadLimitOrderManagerEpochs =
  /*#__PURE__*/ createUseReadContract({
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
    functionName: 'epochs',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `functionName` set to `"factory"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadLimitOrderManagerFactory =
  /*#__PURE__*/ createUseReadContract({
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
    functionName: 'factory',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `functionName` set to `"getEpoch"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadLimitOrderManagerGetEpoch =
  /*#__PURE__*/ createUseReadContract({
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
    functionName: 'getEpoch',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `functionName` set to `"getEpochLiquidity"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadLimitOrderManagerGetEpochLiquidity =
  /*#__PURE__*/ createUseReadContract({
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
    functionName: 'getEpochLiquidity',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `functionName` set to `"initialized"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadLimitOrderManagerInitialized =
  /*#__PURE__*/ createUseReadContract({
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
    functionName: 'initialized',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `functionName` set to `"poolDeployer"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadLimitOrderManagerPoolDeployer =
  /*#__PURE__*/ createUseReadContract({
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
    functionName: 'poolDeployer',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `functionName` set to `"tickLowerLasts"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadLimitOrderManagerTickLowerLasts =
  /*#__PURE__*/ createUseReadContract({
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
    functionName: 'tickLowerLasts',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `functionName` set to `"tickSpacings"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadLimitOrderManagerTickSpacings =
  /*#__PURE__*/ createUseReadContract({
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
    functionName: 'tickSpacings',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `functionName` set to `"wNativeToken"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadLimitOrderManagerWNativeToken =
  /*#__PURE__*/ createUseReadContract({
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
    functionName: 'wNativeToken',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link limitOrderManagerAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteLimitOrderManager = /*#__PURE__*/ createUseWriteContract({
  abi: limitOrderManagerAbi,
  address: limitOrderManagerAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `functionName` set to `"afterSwap"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteLimitOrderManagerAfterSwap =
  /*#__PURE__*/ createUseWriteContract({
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
    functionName: 'afterSwap',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `functionName` set to `"algebraMintCallback"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteLimitOrderManagerAlgebraMintCallback =
  /*#__PURE__*/ createUseWriteContract({
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
    functionName: 'algebraMintCallback',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `functionName` set to `"kill"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteLimitOrderManagerKill =
  /*#__PURE__*/ createUseWriteContract({
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
    functionName: 'kill',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `functionName` set to `"place"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteLimitOrderManagerPlace =
  /*#__PURE__*/ createUseWriteContract({
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
    functionName: 'place',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `functionName` set to `"setTickSpacing"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteLimitOrderManagerSetTickSpacing =
  /*#__PURE__*/ createUseWriteContract({
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
    functionName: 'setTickSpacing',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `functionName` set to `"withdraw"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteLimitOrderManagerWithdraw =
  /*#__PURE__*/ createUseWriteContract({
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
    functionName: 'withdraw',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link limitOrderManagerAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateLimitOrderManager =
  /*#__PURE__*/ createUseSimulateContract({
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `functionName` set to `"afterSwap"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateLimitOrderManagerAfterSwap =
  /*#__PURE__*/ createUseSimulateContract({
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
    functionName: 'afterSwap',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `functionName` set to `"algebraMintCallback"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateLimitOrderManagerAlgebraMintCallback =
  /*#__PURE__*/ createUseSimulateContract({
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
    functionName: 'algebraMintCallback',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `functionName` set to `"kill"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateLimitOrderManagerKill =
  /*#__PURE__*/ createUseSimulateContract({
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
    functionName: 'kill',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `functionName` set to `"place"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateLimitOrderManagerPlace =
  /*#__PURE__*/ createUseSimulateContract({
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
    functionName: 'place',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `functionName` set to `"setTickSpacing"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateLimitOrderManagerSetTickSpacing =
  /*#__PURE__*/ createUseSimulateContract({
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
    functionName: 'setTickSpacing',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `functionName` set to `"withdraw"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateLimitOrderManagerWithdraw =
  /*#__PURE__*/ createUseSimulateContract({
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
    functionName: 'withdraw',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link limitOrderManagerAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWatchLimitOrderManagerEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `eventName` set to `"Fill"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWatchLimitOrderManagerFillEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
    eventName: 'Fill',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `eventName` set to `"Kill"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWatchLimitOrderManagerKillEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
    eventName: 'Kill',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `eventName` set to `"LimitOrderTickSpacing"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWatchLimitOrderManagerLimitOrderTickSpacingEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
    eventName: 'LimitOrderTickSpacing',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `eventName` set to `"Place"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWatchLimitOrderManagerPlaceEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
    eventName: 'Place',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `eventName` set to `"Withdraw"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWatchLimitOrderManagerWithdrawEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
    eventName: 'Withdraw',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useReadNonfungiblePositionManager =
  /*#__PURE__*/ createUseReadContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"DOMAIN_SEPARATOR"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useReadNonfungiblePositionManagerDomainSeparator =
  /*#__PURE__*/ createUseReadContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'DOMAIN_SEPARATOR',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"NONFUNGIBLE_POSITION_MANAGER_ADMINISTRATOR_ROLE"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useReadNonfungiblePositionManagerNonfungiblePositionManagerAdministratorRole =
  /*#__PURE__*/ createUseReadContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'NONFUNGIBLE_POSITION_MANAGER_ADMINISTRATOR_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"PERMIT_TYPEHASH"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useReadNonfungiblePositionManagerPermitTypehash =
  /*#__PURE__*/ createUseReadContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'PERMIT_TYPEHASH',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"WNativeToken"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useReadNonfungiblePositionManagerWNativeToken =
  /*#__PURE__*/ createUseReadContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'WNativeToken',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"balanceOf"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useReadNonfungiblePositionManagerBalanceOf =
  /*#__PURE__*/ createUseReadContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'balanceOf',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"factory"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useReadNonfungiblePositionManagerFactory =
  /*#__PURE__*/ createUseReadContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'factory',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"farmingApprovals"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useReadNonfungiblePositionManagerFarmingApprovals =
  /*#__PURE__*/ createUseReadContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'farmingApprovals',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"farmingCenter"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useReadNonfungiblePositionManagerFarmingCenter =
  /*#__PURE__*/ createUseReadContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'farmingCenter',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"getApproved"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useReadNonfungiblePositionManagerGetApproved =
  /*#__PURE__*/ createUseReadContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'getApproved',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"isApprovedForAll"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useReadNonfungiblePositionManagerIsApprovedForAll =
  /*#__PURE__*/ createUseReadContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'isApprovedForAll',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"isApprovedOrOwner"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useReadNonfungiblePositionManagerIsApprovedOrOwner =
  /*#__PURE__*/ createUseReadContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'isApprovedOrOwner',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"name"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useReadNonfungiblePositionManagerName =
  /*#__PURE__*/ createUseReadContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'name',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"ownerOf"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useReadNonfungiblePositionManagerOwnerOf =
  /*#__PURE__*/ createUseReadContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'ownerOf',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"poolDeployer"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useReadNonfungiblePositionManagerPoolDeployer =
  /*#__PURE__*/ createUseReadContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'poolDeployer',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"positions"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useReadNonfungiblePositionManagerPositions =
  /*#__PURE__*/ createUseReadContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'positions',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"supportsInterface"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useReadNonfungiblePositionManagerSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"symbol"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useReadNonfungiblePositionManagerSymbol =
  /*#__PURE__*/ createUseReadContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'symbol',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"tokenByIndex"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useReadNonfungiblePositionManagerTokenByIndex =
  /*#__PURE__*/ createUseReadContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'tokenByIndex',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"tokenFarmedIn"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useReadNonfungiblePositionManagerTokenFarmedIn =
  /*#__PURE__*/ createUseReadContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'tokenFarmedIn',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"tokenOfOwnerByIndex"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useReadNonfungiblePositionManagerTokenOfOwnerByIndex =
  /*#__PURE__*/ createUseReadContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'tokenOfOwnerByIndex',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"tokenURI"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useReadNonfungiblePositionManagerTokenUri =
  /*#__PURE__*/ createUseReadContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'tokenURI',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"totalSupply"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useReadNonfungiblePositionManagerTotalSupply =
  /*#__PURE__*/ createUseReadContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'totalSupply',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useWriteNonfungiblePositionManager =
  /*#__PURE__*/ createUseWriteContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"algebraMintCallback"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useWriteNonfungiblePositionManagerAlgebraMintCallback =
  /*#__PURE__*/ createUseWriteContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'algebraMintCallback',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"approve"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useWriteNonfungiblePositionManagerApprove =
  /*#__PURE__*/ createUseWriteContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"approveForFarming"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useWriteNonfungiblePositionManagerApproveForFarming =
  /*#__PURE__*/ createUseWriteContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'approveForFarming',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"burn"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useWriteNonfungiblePositionManagerBurn =
  /*#__PURE__*/ createUseWriteContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'burn',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"collect"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useWriteNonfungiblePositionManagerCollect =
  /*#__PURE__*/ createUseWriteContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'collect',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"createAndInitializePoolIfNecessary"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useWriteNonfungiblePositionManagerCreateAndInitializePoolIfNecessary =
  /*#__PURE__*/ createUseWriteContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'createAndInitializePoolIfNecessary',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"decreaseLiquidity"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useWriteNonfungiblePositionManagerDecreaseLiquidity =
  /*#__PURE__*/ createUseWriteContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'decreaseLiquidity',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"increaseLiquidity"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useWriteNonfungiblePositionManagerIncreaseLiquidity =
  /*#__PURE__*/ createUseWriteContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'increaseLiquidity',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"mint"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useWriteNonfungiblePositionManagerMint =
  /*#__PURE__*/ createUseWriteContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'mint',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"multicall"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useWriteNonfungiblePositionManagerMulticall =
  /*#__PURE__*/ createUseWriteContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'multicall',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"permit"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useWriteNonfungiblePositionManagerPermit =
  /*#__PURE__*/ createUseWriteContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'permit',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"refundNativeToken"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useWriteNonfungiblePositionManagerRefundNativeToken =
  /*#__PURE__*/ createUseWriteContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'refundNativeToken',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"safeTransferFrom"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useWriteNonfungiblePositionManagerSafeTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'safeTransferFrom',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"selfPermit"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useWriteNonfungiblePositionManagerSelfPermit =
  /*#__PURE__*/ createUseWriteContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'selfPermit',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"selfPermitAllowed"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useWriteNonfungiblePositionManagerSelfPermitAllowed =
  /*#__PURE__*/ createUseWriteContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'selfPermitAllowed',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"selfPermitAllowedIfNecessary"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useWriteNonfungiblePositionManagerSelfPermitAllowedIfNecessary =
  /*#__PURE__*/ createUseWriteContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'selfPermitAllowedIfNecessary',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"selfPermitIfNecessary"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useWriteNonfungiblePositionManagerSelfPermitIfNecessary =
  /*#__PURE__*/ createUseWriteContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'selfPermitIfNecessary',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"setApprovalForAll"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useWriteNonfungiblePositionManagerSetApprovalForAll =
  /*#__PURE__*/ createUseWriteContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'setApprovalForAll',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"setFarmingCenter"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useWriteNonfungiblePositionManagerSetFarmingCenter =
  /*#__PURE__*/ createUseWriteContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'setFarmingCenter',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"sweepToken"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useWriteNonfungiblePositionManagerSweepToken =
  /*#__PURE__*/ createUseWriteContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'sweepToken',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"switchFarmingStatus"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useWriteNonfungiblePositionManagerSwitchFarmingStatus =
  /*#__PURE__*/ createUseWriteContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'switchFarmingStatus',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"transferFrom"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useWriteNonfungiblePositionManagerTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"unwrapWNativeToken"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useWriteNonfungiblePositionManagerUnwrapWNativeToken =
  /*#__PURE__*/ createUseWriteContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'unwrapWNativeToken',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useSimulateNonfungiblePositionManager =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"algebraMintCallback"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useSimulateNonfungiblePositionManagerAlgebraMintCallback =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'algebraMintCallback',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"approve"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useSimulateNonfungiblePositionManagerApprove =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"approveForFarming"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useSimulateNonfungiblePositionManagerApproveForFarming =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'approveForFarming',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"burn"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useSimulateNonfungiblePositionManagerBurn =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'burn',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"collect"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useSimulateNonfungiblePositionManagerCollect =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'collect',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"createAndInitializePoolIfNecessary"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useSimulateNonfungiblePositionManagerCreateAndInitializePoolIfNecessary =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'createAndInitializePoolIfNecessary',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"decreaseLiquidity"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useSimulateNonfungiblePositionManagerDecreaseLiquidity =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'decreaseLiquidity',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"increaseLiquidity"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useSimulateNonfungiblePositionManagerIncreaseLiquidity =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'increaseLiquidity',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"mint"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useSimulateNonfungiblePositionManagerMint =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'mint',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"multicall"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useSimulateNonfungiblePositionManagerMulticall =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'multicall',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"permit"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useSimulateNonfungiblePositionManagerPermit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'permit',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"refundNativeToken"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useSimulateNonfungiblePositionManagerRefundNativeToken =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'refundNativeToken',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"safeTransferFrom"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useSimulateNonfungiblePositionManagerSafeTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'safeTransferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"selfPermit"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useSimulateNonfungiblePositionManagerSelfPermit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'selfPermit',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"selfPermitAllowed"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useSimulateNonfungiblePositionManagerSelfPermitAllowed =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'selfPermitAllowed',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"selfPermitAllowedIfNecessary"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useSimulateNonfungiblePositionManagerSelfPermitAllowedIfNecessary =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'selfPermitAllowedIfNecessary',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"selfPermitIfNecessary"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useSimulateNonfungiblePositionManagerSelfPermitIfNecessary =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'selfPermitIfNecessary',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"setApprovalForAll"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useSimulateNonfungiblePositionManagerSetApprovalForAll =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'setApprovalForAll',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"setFarmingCenter"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useSimulateNonfungiblePositionManagerSetFarmingCenter =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'setFarmingCenter',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"sweepToken"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useSimulateNonfungiblePositionManagerSweepToken =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'sweepToken',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"switchFarmingStatus"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useSimulateNonfungiblePositionManagerSwitchFarmingStatus =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'switchFarmingStatus',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"transferFrom"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useSimulateNonfungiblePositionManagerTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"unwrapWNativeToken"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useSimulateNonfungiblePositionManagerUnwrapWNativeToken =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'unwrapWNativeToken',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useWatchNonfungiblePositionManagerEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `eventName` set to `"Approval"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useWatchNonfungiblePositionManagerApprovalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `eventName` set to `"ApprovalForAll"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useWatchNonfungiblePositionManagerApprovalForAllEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    eventName: 'ApprovalForAll',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `eventName` set to `"Collect"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useWatchNonfungiblePositionManagerCollectEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    eventName: 'Collect',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `eventName` set to `"DecreaseLiquidity"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useWatchNonfungiblePositionManagerDecreaseLiquidityEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    eventName: 'DecreaseLiquidity',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `eventName` set to `"FarmingFailed"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useWatchNonfungiblePositionManagerFarmingFailedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    eventName: 'FarmingFailed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `eventName` set to `"IncreaseLiquidity"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useWatchNonfungiblePositionManagerIncreaseLiquidityEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    eventName: 'IncreaseLiquidity',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `eventName` set to `"Transfer"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const useWatchNonfungiblePositionManagerTransferEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    eventName: 'Transfer',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link quoterV2Abi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x13fcE0acbe6Fb11641ab753212550574CaD31415)
 */
export const useReadQuoterV2 = /*#__PURE__*/ createUseReadContract({
  abi: quoterV2Abi,
  address: quoterV2Address,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link quoterV2Abi}__ and `functionName` set to `"WNativeToken"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x13fcE0acbe6Fb11641ab753212550574CaD31415)
 */
export const useReadQuoterV2WNativeToken = /*#__PURE__*/ createUseReadContract({
  abi: quoterV2Abi,
  address: quoterV2Address,
  functionName: 'WNativeToken',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link quoterV2Abi}__ and `functionName` set to `"algebraSwapCallback"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x13fcE0acbe6Fb11641ab753212550574CaD31415)
 */
export const useReadQuoterV2AlgebraSwapCallback =
  /*#__PURE__*/ createUseReadContract({
    abi: quoterV2Abi,
    address: quoterV2Address,
    functionName: 'algebraSwapCallback',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link quoterV2Abi}__ and `functionName` set to `"factory"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x13fcE0acbe6Fb11641ab753212550574CaD31415)
 */
export const useReadQuoterV2Factory = /*#__PURE__*/ createUseReadContract({
  abi: quoterV2Abi,
  address: quoterV2Address,
  functionName: 'factory',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link quoterV2Abi}__ and `functionName` set to `"poolDeployer"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x13fcE0acbe6Fb11641ab753212550574CaD31415)
 */
export const useReadQuoterV2PoolDeployer = /*#__PURE__*/ createUseReadContract({
  abi: quoterV2Abi,
  address: quoterV2Address,
  functionName: 'poolDeployer',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link quoterV2Abi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x13fcE0acbe6Fb11641ab753212550574CaD31415)
 */
export const useWriteQuoterV2 = /*#__PURE__*/ createUseWriteContract({
  abi: quoterV2Abi,
  address: quoterV2Address,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link quoterV2Abi}__ and `functionName` set to `"quoteExactInput"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x13fcE0acbe6Fb11641ab753212550574CaD31415)
 */
export const useWriteQuoterV2QuoteExactInput =
  /*#__PURE__*/ createUseWriteContract({
    abi: quoterV2Abi,
    address: quoterV2Address,
    functionName: 'quoteExactInput',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link quoterV2Abi}__ and `functionName` set to `"quoteExactInputSingle"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x13fcE0acbe6Fb11641ab753212550574CaD31415)
 */
export const useWriteQuoterV2QuoteExactInputSingle =
  /*#__PURE__*/ createUseWriteContract({
    abi: quoterV2Abi,
    address: quoterV2Address,
    functionName: 'quoteExactInputSingle',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link quoterV2Abi}__ and `functionName` set to `"quoteExactOutput"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x13fcE0acbe6Fb11641ab753212550574CaD31415)
 */
export const useWriteQuoterV2QuoteExactOutput =
  /*#__PURE__*/ createUseWriteContract({
    abi: quoterV2Abi,
    address: quoterV2Address,
    functionName: 'quoteExactOutput',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link quoterV2Abi}__ and `functionName` set to `"quoteExactOutputSingle"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x13fcE0acbe6Fb11641ab753212550574CaD31415)
 */
export const useWriteQuoterV2QuoteExactOutputSingle =
  /*#__PURE__*/ createUseWriteContract({
    abi: quoterV2Abi,
    address: quoterV2Address,
    functionName: 'quoteExactOutputSingle',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link quoterV2Abi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x13fcE0acbe6Fb11641ab753212550574CaD31415)
 */
export const useSimulateQuoterV2 = /*#__PURE__*/ createUseSimulateContract({
  abi: quoterV2Abi,
  address: quoterV2Address,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link quoterV2Abi}__ and `functionName` set to `"quoteExactInput"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x13fcE0acbe6Fb11641ab753212550574CaD31415)
 */
export const useSimulateQuoterV2QuoteExactInput =
  /*#__PURE__*/ createUseSimulateContract({
    abi: quoterV2Abi,
    address: quoterV2Address,
    functionName: 'quoteExactInput',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link quoterV2Abi}__ and `functionName` set to `"quoteExactInputSingle"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x13fcE0acbe6Fb11641ab753212550574CaD31415)
 */
export const useSimulateQuoterV2QuoteExactInputSingle =
  /*#__PURE__*/ createUseSimulateContract({
    abi: quoterV2Abi,
    address: quoterV2Address,
    functionName: 'quoteExactInputSingle',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link quoterV2Abi}__ and `functionName` set to `"quoteExactOutput"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x13fcE0acbe6Fb11641ab753212550574CaD31415)
 */
export const useSimulateQuoterV2QuoteExactOutput =
  /*#__PURE__*/ createUseSimulateContract({
    abi: quoterV2Abi,
    address: quoterV2Address,
    functionName: 'quoteExactOutput',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link quoterV2Abi}__ and `functionName` set to `"quoteExactOutputSingle"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x13fcE0acbe6Fb11641ab753212550574CaD31415)
 */
export const useSimulateQuoterV2QuoteExactOutputSingle =
  /*#__PURE__*/ createUseSimulateContract({
    abi: quoterV2Abi,
    address: quoterV2Address,
    functionName: 'quoteExactOutputSingle',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rebaseRewardAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadRebaseReward = /*#__PURE__*/ createUseReadContract({
  abi: rebaseRewardAbi,
  address: rebaseRewardAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"DEFAULT_ADMIN_ROLE"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadRebaseRewardDefaultAdminRole =
  /*#__PURE__*/ createUseReadContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'DEFAULT_ADMIN_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"DURATION"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadRebaseRewardDuration = /*#__PURE__*/ createUseReadContract({
  abi: rebaseRewardAbi,
  address: rebaseRewardAddress,
  functionName: 'DURATION',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"NOTIFY_ROLE"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadRebaseRewardNotifyRole =
  /*#__PURE__*/ createUseReadContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'NOTIFY_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"PRECISION"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadRebaseRewardPrecision = /*#__PURE__*/ createUseReadContract(
  {
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'PRECISION',
  },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"UPGRADE_INTERFACE_VERSION"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadRebaseRewardUpgradeInterfaceVersion =
  /*#__PURE__*/ createUseReadContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'UPGRADE_INTERFACE_VERSION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"earnedForPeriod"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadRebaseRewardEarnedForPeriod =
  /*#__PURE__*/ createUseReadContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'earnedForPeriod',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"earnedForToken"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadRebaseRewardEarnedForToken =
  /*#__PURE__*/ createUseReadContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'earnedForToken',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"earnedForTokenId"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadRebaseRewardEarnedForTokenId =
  /*#__PURE__*/ createUseReadContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'earnedForTokenId',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"getCurrentPeriod"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadRebaseRewardGetCurrentPeriod =
  /*#__PURE__*/ createUseReadContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'getCurrentPeriod',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"getRewardList"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadRebaseRewardGetRewardList =
  /*#__PURE__*/ createUseReadContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'getRewardList',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"getRoleAdmin"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadRebaseRewardGetRoleAdmin =
  /*#__PURE__*/ createUseReadContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'getRoleAdmin',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"hasRole"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadRebaseRewardHasRole = /*#__PURE__*/ createUseReadContract({
  abi: rebaseRewardAbi,
  address: rebaseRewardAddress,
  functionName: 'hasRole',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"owner"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadRebaseRewardOwner = /*#__PURE__*/ createUseReadContract({
  abi: rebaseRewardAbi,
  address: rebaseRewardAddress,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"pendingOwner"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadRebaseRewardPendingOwner =
  /*#__PURE__*/ createUseReadContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'pendingOwner',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"periodInit"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadRebaseRewardPeriodInit =
  /*#__PURE__*/ createUseReadContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'periodInit',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"proxiableUUID"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadRebaseRewardProxiableUuid =
  /*#__PURE__*/ createUseReadContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'proxiableUUID',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"rewardForPeriod"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadRebaseRewardRewardForPeriod =
  /*#__PURE__*/ createUseReadContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'rewardForPeriod',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"supportsInterface"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadRebaseRewardSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"token"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadRebaseRewardToken = /*#__PURE__*/ createUseReadContract({
  abi: rebaseRewardAbi,
  address: rebaseRewardAddress,
  functionName: 'token',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"tokenIdRewardClaimedInPeriod"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadRebaseRewardTokenIdRewardClaimedInPeriod =
  /*#__PURE__*/ createUseReadContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'tokenIdRewardClaimedInPeriod',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"tokenIdVotesInPeriod"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadRebaseRewardTokenIdVotesInPeriod =
  /*#__PURE__*/ createUseReadContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'tokenIdVotesInPeriod',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"totalVotesInPeriod"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadRebaseRewardTotalVotesInPeriod =
  /*#__PURE__*/ createUseReadContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'totalVotesInPeriod',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"veTOKEN"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadRebaseRewardVeToken = /*#__PURE__*/ createUseReadContract({
  abi: rebaseRewardAbi,
  address: rebaseRewardAddress,
  functionName: 'veTOKEN',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"voter"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadRebaseRewardVoter = /*#__PURE__*/ createUseReadContract({
  abi: rebaseRewardAbi,
  address: rebaseRewardAddress,
  functionName: 'voter',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link rebaseRewardAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteRebaseReward = /*#__PURE__*/ createUseWriteContract({
  abi: rebaseRewardAbi,
  address: rebaseRewardAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"_deposit"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteRebaseRewardDeposit = /*#__PURE__*/ createUseWriteContract(
  {
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: '_deposit',
  },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"_withdraw"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteRebaseRewardWithdraw =
  /*#__PURE__*/ createUseWriteContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: '_withdraw',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"acceptOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteRebaseRewardAcceptOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'acceptOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"getRewardForOwner"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteRebaseRewardGetRewardForOwner =
  /*#__PURE__*/ createUseWriteContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'getRewardForOwner',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"getRewardForPeriod"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteRebaseRewardGetRewardForPeriod =
  /*#__PURE__*/ createUseWriteContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'getRewardForPeriod',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"getRewardForTokenId"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteRebaseRewardGetRewardForTokenId =
  /*#__PURE__*/ createUseWriteContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'getRewardForTokenId',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"grantNotifyRole"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteRebaseRewardGrantNotifyRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'grantNotifyRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"grantRole"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteRebaseRewardGrantRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"incentivize"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteRebaseRewardIncentivize =
  /*#__PURE__*/ createUseWriteContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'incentivize',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"initialize"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteRebaseRewardInitialize =
  /*#__PURE__*/ createUseWriteContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"notifyRewardAmount"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteRebaseRewardNotifyRewardAmount =
  /*#__PURE__*/ createUseWriteContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'notifyRewardAmount',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteRebaseRewardRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"renounceRole"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteRebaseRewardRenounceRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"revokeRole"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteRebaseRewardRevokeRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"transferERC20"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteRebaseRewardTransferErc20 =
  /*#__PURE__*/ createUseWriteContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'transferERC20',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteRebaseRewardTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"upgradeToAndCall"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteRebaseRewardUpgradeToAndCall =
  /*#__PURE__*/ createUseWriteContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link rebaseRewardAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateRebaseReward = /*#__PURE__*/ createUseSimulateContract({
  abi: rebaseRewardAbi,
  address: rebaseRewardAddress,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"_deposit"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateRebaseRewardDeposit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: '_deposit',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"_withdraw"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateRebaseRewardWithdraw =
  /*#__PURE__*/ createUseSimulateContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: '_withdraw',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"acceptOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateRebaseRewardAcceptOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'acceptOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"getRewardForOwner"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateRebaseRewardGetRewardForOwner =
  /*#__PURE__*/ createUseSimulateContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'getRewardForOwner',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"getRewardForPeriod"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateRebaseRewardGetRewardForPeriod =
  /*#__PURE__*/ createUseSimulateContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'getRewardForPeriod',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"getRewardForTokenId"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateRebaseRewardGetRewardForTokenId =
  /*#__PURE__*/ createUseSimulateContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'getRewardForTokenId',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"grantNotifyRole"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateRebaseRewardGrantNotifyRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'grantNotifyRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"grantRole"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateRebaseRewardGrantRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"incentivize"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateRebaseRewardIncentivize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'incentivize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"initialize"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateRebaseRewardInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"notifyRewardAmount"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateRebaseRewardNotifyRewardAmount =
  /*#__PURE__*/ createUseSimulateContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'notifyRewardAmount',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateRebaseRewardRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"renounceRole"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateRebaseRewardRenounceRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"revokeRole"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateRebaseRewardRevokeRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"transferERC20"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateRebaseRewardTransferErc20 =
  /*#__PURE__*/ createUseSimulateContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'transferERC20',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateRebaseRewardTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"upgradeToAndCall"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateRebaseRewardUpgradeToAndCall =
  /*#__PURE__*/ createUseSimulateContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link rebaseRewardAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWatchRebaseRewardEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link rebaseRewardAbi}__ and `eventName` set to `"ClaimReward"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWatchRebaseRewardClaimRewardEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    eventName: 'ClaimReward',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link rebaseRewardAbi}__ and `eventName` set to `"Deposit"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWatchRebaseRewardDepositEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    eventName: 'Deposit',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link rebaseRewardAbi}__ and `eventName` set to `"IncentivizedReward"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWatchRebaseRewardIncentivizedRewardEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    eventName: 'IncentivizedReward',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link rebaseRewardAbi}__ and `eventName` set to `"Initialized"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWatchRebaseRewardInitializedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link rebaseRewardAbi}__ and `eventName` set to `"NotifyReward"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWatchRebaseRewardNotifyRewardEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    eventName: 'NotifyReward',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link rebaseRewardAbi}__ and `eventName` set to `"OwnershipTransferStarted"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWatchRebaseRewardOwnershipTransferStartedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    eventName: 'OwnershipTransferStarted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link rebaseRewardAbi}__ and `eventName` set to `"OwnershipTransferred"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWatchRebaseRewardOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link rebaseRewardAbi}__ and `eventName` set to `"RoleAdminChanged"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWatchRebaseRewardRoleAdminChangedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    eventName: 'RoleAdminChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link rebaseRewardAbi}__ and `eventName` set to `"RoleGranted"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWatchRebaseRewardRoleGrantedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    eventName: 'RoleGranted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link rebaseRewardAbi}__ and `eventName` set to `"RoleRevoked"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWatchRebaseRewardRoleRevokedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    eventName: 'RoleRevoked',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link rebaseRewardAbi}__ and `eventName` set to `"Upgraded"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWatchRebaseRewardUpgradedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    eventName: 'Upgraded',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link rebaseRewardAbi}__ and `eventName` set to `"Withdraw"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWatchRebaseRewardWithdrawEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    eventName: 'Withdraw',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link securityRegistryAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadSecurityRegistry = /*#__PURE__*/ createUseReadContract({
  abi: securityRegistryAbi,
  address: securityRegistryAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link securityRegistryAbi}__ and `functionName` set to `"GUARD"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadSecurityRegistryGuard = /*#__PURE__*/ createUseReadContract(
  {
    abi: securityRegistryAbi,
    address: securityRegistryAddress,
    functionName: 'GUARD',
  },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link securityRegistryAbi}__ and `functionName` set to `"algebraFactory"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadSecurityRegistryAlgebraFactory =
  /*#__PURE__*/ createUseReadContract({
    abi: securityRegistryAbi,
    address: securityRegistryAddress,
    functionName: 'algebraFactory',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link securityRegistryAbi}__ and `functionName` set to `"getPoolStatus"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadSecurityRegistryGetPoolStatus =
  /*#__PURE__*/ createUseReadContract({
    abi: securityRegistryAbi,
    address: securityRegistryAddress,
    functionName: 'getPoolStatus',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link securityRegistryAbi}__ and `functionName` set to `"globalStatus"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadSecurityRegistryGlobalStatus =
  /*#__PURE__*/ createUseReadContract({
    abi: securityRegistryAbi,
    address: securityRegistryAddress,
    functionName: 'globalStatus',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link securityRegistryAbi}__ and `functionName` set to `"isPoolStatusOverrided"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadSecurityRegistryIsPoolStatusOverrided =
  /*#__PURE__*/ createUseReadContract({
    abi: securityRegistryAbi,
    address: securityRegistryAddress,
    functionName: 'isPoolStatusOverrided',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link securityRegistryAbi}__ and `functionName` set to `"poolStatus"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadSecurityRegistryPoolStatus =
  /*#__PURE__*/ createUseReadContract({
    abi: securityRegistryAbi,
    address: securityRegistryAddress,
    functionName: 'poolStatus',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link securityRegistryAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteSecurityRegistry = /*#__PURE__*/ createUseWriteContract({
  abi: securityRegistryAbi,
  address: securityRegistryAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link securityRegistryAbi}__ and `functionName` set to `"setGlobalStatus"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteSecurityRegistrySetGlobalStatus =
  /*#__PURE__*/ createUseWriteContract({
    abi: securityRegistryAbi,
    address: securityRegistryAddress,
    functionName: 'setGlobalStatus',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link securityRegistryAbi}__ and `functionName` set to `"setPoolsStatus"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteSecurityRegistrySetPoolsStatus =
  /*#__PURE__*/ createUseWriteContract({
    abi: securityRegistryAbi,
    address: securityRegistryAddress,
    functionName: 'setPoolsStatus',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link securityRegistryAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateSecurityRegistry =
  /*#__PURE__*/ createUseSimulateContract({
    abi: securityRegistryAbi,
    address: securityRegistryAddress,
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link securityRegistryAbi}__ and `functionName` set to `"setGlobalStatus"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateSecurityRegistrySetGlobalStatus =
  /*#__PURE__*/ createUseSimulateContract({
    abi: securityRegistryAbi,
    address: securityRegistryAddress,
    functionName: 'setGlobalStatus',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link securityRegistryAbi}__ and `functionName` set to `"setPoolsStatus"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateSecurityRegistrySetPoolsStatus =
  /*#__PURE__*/ createUseSimulateContract({
    abi: securityRegistryAbi,
    address: securityRegistryAddress,
    functionName: 'setPoolsStatus',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link securityRegistryAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWatchSecurityRegistryEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: securityRegistryAbi,
    address: securityRegistryAddress,
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link securityRegistryAbi}__ and `eventName` set to `"GlobalStatus"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWatchSecurityRegistryGlobalStatusEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: securityRegistryAbi,
    address: securityRegistryAddress,
    eventName: 'GlobalStatus',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link securityRegistryAbi}__ and `eventName` set to `"PoolStatus"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWatchSecurityRegistryPoolStatusEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: securityRegistryAbi,
    address: securityRegistryAddress,
    eventName: 'PoolStatus',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link swapRouterAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const useReadSwapRouter = /*#__PURE__*/ createUseReadContract({
  abi: swapRouterAbi,
  address: swapRouterAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"WNativeToken"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const useReadSwapRouterWNativeToken =
  /*#__PURE__*/ createUseReadContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'WNativeToken',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"factory"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const useReadSwapRouterFactory = /*#__PURE__*/ createUseReadContract({
  abi: swapRouterAbi,
  address: swapRouterAddress,
  functionName: 'factory',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"poolDeployer"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const useReadSwapRouterPoolDeployer =
  /*#__PURE__*/ createUseReadContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'poolDeployer',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link swapRouterAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const useWriteSwapRouter = /*#__PURE__*/ createUseWriteContract({
  abi: swapRouterAbi,
  address: swapRouterAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"algebraSwapCallback"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const useWriteSwapRouterAlgebraSwapCallback =
  /*#__PURE__*/ createUseWriteContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'algebraSwapCallback',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"exactInput"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const useWriteSwapRouterExactInput =
  /*#__PURE__*/ createUseWriteContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'exactInput',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"exactInputSingle"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const useWriteSwapRouterExactInputSingle =
  /*#__PURE__*/ createUseWriteContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'exactInputSingle',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"exactInputSingleSupportingFeeOnTransferTokens"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const useWriteSwapRouterExactInputSingleSupportingFeeOnTransferTokens =
  /*#__PURE__*/ createUseWriteContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'exactInputSingleSupportingFeeOnTransferTokens',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"exactOutput"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const useWriteSwapRouterExactOutput =
  /*#__PURE__*/ createUseWriteContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'exactOutput',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"exactOutputSingle"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const useWriteSwapRouterExactOutputSingle =
  /*#__PURE__*/ createUseWriteContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'exactOutputSingle',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"multicall"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const useWriteSwapRouterMulticall = /*#__PURE__*/ createUseWriteContract(
  { abi: swapRouterAbi, address: swapRouterAddress, functionName: 'multicall' },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"refundNativeToken"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const useWriteSwapRouterRefundNativeToken =
  /*#__PURE__*/ createUseWriteContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'refundNativeToken',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"selfPermit"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const useWriteSwapRouterSelfPermit =
  /*#__PURE__*/ createUseWriteContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'selfPermit',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"selfPermitAllowed"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const useWriteSwapRouterSelfPermitAllowed =
  /*#__PURE__*/ createUseWriteContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'selfPermitAllowed',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"selfPermitAllowedIfNecessary"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const useWriteSwapRouterSelfPermitAllowedIfNecessary =
  /*#__PURE__*/ createUseWriteContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'selfPermitAllowedIfNecessary',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"selfPermitIfNecessary"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const useWriteSwapRouterSelfPermitIfNecessary =
  /*#__PURE__*/ createUseWriteContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'selfPermitIfNecessary',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"sweepToken"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const useWriteSwapRouterSweepToken =
  /*#__PURE__*/ createUseWriteContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'sweepToken',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"sweepTokenWithFee"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const useWriteSwapRouterSweepTokenWithFee =
  /*#__PURE__*/ createUseWriteContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'sweepTokenWithFee',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"unwrapWNativeToken"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const useWriteSwapRouterUnwrapWNativeToken =
  /*#__PURE__*/ createUseWriteContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'unwrapWNativeToken',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"unwrapWNativeTokenWithFee"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const useWriteSwapRouterUnwrapWNativeTokenWithFee =
  /*#__PURE__*/ createUseWriteContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'unwrapWNativeTokenWithFee',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link swapRouterAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const useSimulateSwapRouter = /*#__PURE__*/ createUseSimulateContract({
  abi: swapRouterAbi,
  address: swapRouterAddress,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"algebraSwapCallback"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const useSimulateSwapRouterAlgebraSwapCallback =
  /*#__PURE__*/ createUseSimulateContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'algebraSwapCallback',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"exactInput"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const useSimulateSwapRouterExactInput =
  /*#__PURE__*/ createUseSimulateContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'exactInput',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"exactInputSingle"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const useSimulateSwapRouterExactInputSingle =
  /*#__PURE__*/ createUseSimulateContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'exactInputSingle',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"exactInputSingleSupportingFeeOnTransferTokens"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const useSimulateSwapRouterExactInputSingleSupportingFeeOnTransferTokens =
  /*#__PURE__*/ createUseSimulateContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'exactInputSingleSupportingFeeOnTransferTokens',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"exactOutput"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const useSimulateSwapRouterExactOutput =
  /*#__PURE__*/ createUseSimulateContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'exactOutput',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"exactOutputSingle"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const useSimulateSwapRouterExactOutputSingle =
  /*#__PURE__*/ createUseSimulateContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'exactOutputSingle',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"multicall"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const useSimulateSwapRouterMulticall =
  /*#__PURE__*/ createUseSimulateContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'multicall',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"refundNativeToken"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const useSimulateSwapRouterRefundNativeToken =
  /*#__PURE__*/ createUseSimulateContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'refundNativeToken',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"selfPermit"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const useSimulateSwapRouterSelfPermit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'selfPermit',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"selfPermitAllowed"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const useSimulateSwapRouterSelfPermitAllowed =
  /*#__PURE__*/ createUseSimulateContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'selfPermitAllowed',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"selfPermitAllowedIfNecessary"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const useSimulateSwapRouterSelfPermitAllowedIfNecessary =
  /*#__PURE__*/ createUseSimulateContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'selfPermitAllowedIfNecessary',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"selfPermitIfNecessary"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const useSimulateSwapRouterSelfPermitIfNecessary =
  /*#__PURE__*/ createUseSimulateContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'selfPermitIfNecessary',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"sweepToken"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const useSimulateSwapRouterSweepToken =
  /*#__PURE__*/ createUseSimulateContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'sweepToken',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"sweepTokenWithFee"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const useSimulateSwapRouterSweepTokenWithFee =
  /*#__PURE__*/ createUseSimulateContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'sweepTokenWithFee',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"unwrapWNativeToken"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const useSimulateSwapRouterUnwrapWNativeToken =
  /*#__PURE__*/ createUseSimulateContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'unwrapWNativeToken',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"unwrapWNativeTokenWithFee"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const useSimulateSwapRouterUnwrapWNativeTokenWithFee =
  /*#__PURE__*/ createUseSimulateContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'unwrapWNativeTokenWithFee',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link voterAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVoter = /*#__PURE__*/ createUseReadContract({
  abi: voterAbi,
  address: voterAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"AUTHORIZED_ROLE"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVoterAuthorizedRole = /*#__PURE__*/ createUseReadContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'AUTHORIZED_ROLE',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"DEFAULT_ADMIN_ROLE"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVoterDefaultAdminRole = /*#__PURE__*/ createUseReadContract(
  { abi: voterAbi, address: voterAddress, functionName: 'DEFAULT_ADMIN_ROLE' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"DURATION"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVoterDuration = /*#__PURE__*/ createUseReadContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'DURATION',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"UPGRADE_INTERFACE_VERSION"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVoterUpgradeInterfaceVersion =
  /*#__PURE__*/ createUseReadContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'UPGRADE_INTERFACE_VERSION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"algebraGaugeFactory"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVoterAlgebraGaugeFactory =
  /*#__PURE__*/ createUseReadContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'algebraGaugeFactory',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"algebraVaultFactory"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVoterAlgebraVaultFactory =
  /*#__PURE__*/ createUseReadContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'algebraVaultFactory',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"checkPeriodVoted"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVoterCheckPeriodVoted = /*#__PURE__*/ createUseReadContract(
  { abi: voterAbi, address: voterAddress, functionName: 'checkPeriodVoted' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"epoch0Period"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVoterEpoch0Period = /*#__PURE__*/ createUseReadContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'epoch0Period',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"gaugeToPool"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVoterGaugeToPool = /*#__PURE__*/ createUseReadContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'gaugeToPool',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"getCurrentPeriod"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVoterGetCurrentPeriod = /*#__PURE__*/ createUseReadContract(
  { abi: voterAbi, address: voterAddress, functionName: 'getCurrentPeriod' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"getGauge"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVoterGetGauge = /*#__PURE__*/ createUseReadContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'getGauge',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"getGaugeList"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVoterGetGaugeList = /*#__PURE__*/ createUseReadContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'getGaugeList',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"getPeriodData"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVoterGetPeriodData = /*#__PURE__*/ createUseReadContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'getPeriodData',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"getPoolList"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVoterGetPoolList = /*#__PURE__*/ createUseReadContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'getPoolList',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"getRoleAdmin"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVoterGetRoleAdmin = /*#__PURE__*/ createUseReadContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'getRoleAdmin',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"getTokenIdVotes"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVoterGetTokenIdVotes = /*#__PURE__*/ createUseReadContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'getTokenIdVotes',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"hasRole"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVoterHasRole = /*#__PURE__*/ createUseReadContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'hasRole',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"isAlive"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVoterIsAlive = /*#__PURE__*/ createUseReadContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'isAlive',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"isGauge"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVoterIsGauge = /*#__PURE__*/ createUseReadContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'isGauge',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"isWhitelisted"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVoterIsWhitelisted = /*#__PURE__*/ createUseReadContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'isWhitelisted',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"minter"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVoterMinter = /*#__PURE__*/ createUseReadContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'minter',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"owner"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVoterOwner = /*#__PURE__*/ createUseReadContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"pendingOwner"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVoterPendingOwner = /*#__PURE__*/ createUseReadContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'pendingOwner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"period"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVoterPeriod = /*#__PURE__*/ createUseReadContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'period',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"proxiableUUID"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVoterProxiableUuid = /*#__PURE__*/ createUseReadContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'proxiableUUID',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"rebaseReward"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVoterRebaseReward = /*#__PURE__*/ createUseReadContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'rebaseReward',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"supportsInterface"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVoterSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"token"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVoterToken = /*#__PURE__*/ createUseReadContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'token',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"veTOKEN"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVoterVeToken = /*#__PURE__*/ createUseReadContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'veTOKEN',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"votingRewardFactory"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVoterVotingRewardFactory =
  /*#__PURE__*/ createUseReadContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'votingRewardFactory',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link voterAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteVoter = /*#__PURE__*/ createUseWriteContract({
  abi: voterAbi,
  address: voterAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"acceptOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteVoterAcceptOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'acceptOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"claimVotingRewardBatch"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteVoterClaimVotingRewardBatch =
  /*#__PURE__*/ createUseWriteContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'claimVotingRewardBatch',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"createAlgebraGauge"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteVoterCreateAlgebraGauge =
  /*#__PURE__*/ createUseWriteContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'createAlgebraGauge',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"createGauge"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteVoterCreateGauge = /*#__PURE__*/ createUseWriteContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'createGauge',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"distribute"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteVoterDistribute = /*#__PURE__*/ createUseWriteContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'distribute',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"distributeAll"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteVoterDistributeAll = /*#__PURE__*/ createUseWriteContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'distributeAll',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"distributeRange"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteVoterDistributeRange =
  /*#__PURE__*/ createUseWriteContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'distributeRange',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"grantRole"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteVoterGrantRole = /*#__PURE__*/ createUseWriteContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'grantRole',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"initialize"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteVoterInitialize = /*#__PURE__*/ createUseWriteContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'initialize',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"killGauge"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteVoterKillGauge = /*#__PURE__*/ createUseWriteContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'killGauge',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"notifyRewardAmount"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteVoterNotifyRewardAmount =
  /*#__PURE__*/ createUseWriteContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'notifyRewardAmount',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteVoterRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"renounceRole"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteVoterRenounceRole = /*#__PURE__*/ createUseWriteContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'renounceRole',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"reviveGauge"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteVoterReviveGauge = /*#__PURE__*/ createUseWriteContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'reviveGauge',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"revokeRole"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteVoterRevokeRole = /*#__PURE__*/ createUseWriteContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'revokeRole',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"setAlgebraGaugeFactory"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteVoterSetAlgebraGaugeFactory =
  /*#__PURE__*/ createUseWriteContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'setAlgebraGaugeFactory',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"setAlgebraVaultFactory"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteVoterSetAlgebraVaultFactory =
  /*#__PURE__*/ createUseWriteContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'setAlgebraVaultFactory',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"setMinter"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteVoterSetMinter = /*#__PURE__*/ createUseWriteContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'setMinter',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"setRebaseReward"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteVoterSetRebaseReward =
  /*#__PURE__*/ createUseWriteContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'setRebaseReward',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"setTokenStatus"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteVoterSetTokenStatus = /*#__PURE__*/ createUseWriteContract(
  { abi: voterAbi, address: voterAddress, functionName: 'setTokenStatus' },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"setVotingRewardFactory"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteVoterSetVotingRewardFactory =
  /*#__PURE__*/ createUseWriteContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'setVotingRewardFactory',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"start"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteVoterStart = /*#__PURE__*/ createUseWriteContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'start',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteVoterTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"upgradeToAndCall"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteVoterUpgradeToAndCall =
  /*#__PURE__*/ createUseWriteContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"vote"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteVoterVote = /*#__PURE__*/ createUseWriteContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'vote',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link voterAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateVoter = /*#__PURE__*/ createUseSimulateContract({
  abi: voterAbi,
  address: voterAddress,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"acceptOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateVoterAcceptOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'acceptOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"claimVotingRewardBatch"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateVoterClaimVotingRewardBatch =
  /*#__PURE__*/ createUseSimulateContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'claimVotingRewardBatch',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"createAlgebraGauge"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateVoterCreateAlgebraGauge =
  /*#__PURE__*/ createUseSimulateContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'createAlgebraGauge',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"createGauge"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateVoterCreateGauge =
  /*#__PURE__*/ createUseSimulateContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'createGauge',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"distribute"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateVoterDistribute =
  /*#__PURE__*/ createUseSimulateContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'distribute',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"distributeAll"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateVoterDistributeAll =
  /*#__PURE__*/ createUseSimulateContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'distributeAll',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"distributeRange"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateVoterDistributeRange =
  /*#__PURE__*/ createUseSimulateContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'distributeRange',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"grantRole"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateVoterGrantRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"initialize"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateVoterInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"killGauge"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateVoterKillGauge =
  /*#__PURE__*/ createUseSimulateContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'killGauge',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"notifyRewardAmount"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateVoterNotifyRewardAmount =
  /*#__PURE__*/ createUseSimulateContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'notifyRewardAmount',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateVoterRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"renounceRole"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateVoterRenounceRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"reviveGauge"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateVoterReviveGauge =
  /*#__PURE__*/ createUseSimulateContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'reviveGauge',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"revokeRole"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateVoterRevokeRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"setAlgebraGaugeFactory"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateVoterSetAlgebraGaugeFactory =
  /*#__PURE__*/ createUseSimulateContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'setAlgebraGaugeFactory',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"setAlgebraVaultFactory"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateVoterSetAlgebraVaultFactory =
  /*#__PURE__*/ createUseSimulateContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'setAlgebraVaultFactory',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"setMinter"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateVoterSetMinter =
  /*#__PURE__*/ createUseSimulateContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'setMinter',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"setRebaseReward"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateVoterSetRebaseReward =
  /*#__PURE__*/ createUseSimulateContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'setRebaseReward',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"setTokenStatus"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateVoterSetTokenStatus =
  /*#__PURE__*/ createUseSimulateContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'setTokenStatus',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"setVotingRewardFactory"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateVoterSetVotingRewardFactory =
  /*#__PURE__*/ createUseSimulateContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'setVotingRewardFactory',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"start"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateVoterStart = /*#__PURE__*/ createUseSimulateContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'start',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateVoterTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"upgradeToAndCall"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateVoterUpgradeToAndCall =
  /*#__PURE__*/ createUseSimulateContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"vote"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateVoterVote = /*#__PURE__*/ createUseSimulateContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'vote',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link voterAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWatchVoterEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: voterAbi,
  address: voterAddress,
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link voterAbi}__ and `eventName` set to `"DistributeAlgebraFees"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWatchVoterDistributeAlgebraFeesEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: voterAbi,
    address: voterAddress,
    eventName: 'DistributeAlgebraFees',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link voterAbi}__ and `eventName` set to `"DistributeEmissions"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWatchVoterDistributeEmissionsEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: voterAbi,
    address: voterAddress,
    eventName: 'DistributeEmissions',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link voterAbi}__ and `eventName` set to `"GaugeCreated"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWatchVoterGaugeCreatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: voterAbi,
    address: voterAddress,
    eventName: 'GaugeCreated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link voterAbi}__ and `eventName` set to `"GaugeKilled"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWatchVoterGaugeKilledEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: voterAbi,
    address: voterAddress,
    eventName: 'GaugeKilled',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link voterAbi}__ and `eventName` set to `"GaugeRevived"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWatchVoterGaugeRevivedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: voterAbi,
    address: voterAddress,
    eventName: 'GaugeRevived',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link voterAbi}__ and `eventName` set to `"Initialized"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWatchVoterInitializedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: voterAbi,
    address: voterAddress,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link voterAbi}__ and `eventName` set to `"OwnershipTransferStarted"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWatchVoterOwnershipTransferStartedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: voterAbi,
    address: voterAddress,
    eventName: 'OwnershipTransferStarted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link voterAbi}__ and `eventName` set to `"OwnershipTransferred"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWatchVoterOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: voterAbi,
    address: voterAddress,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link voterAbi}__ and `eventName` set to `"RoleAdminChanged"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWatchVoterRoleAdminChangedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: voterAbi,
    address: voterAddress,
    eventName: 'RoleAdminChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link voterAbi}__ and `eventName` set to `"RoleGranted"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWatchVoterRoleGrantedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: voterAbi,
    address: voterAddress,
    eventName: 'RoleGranted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link voterAbi}__ and `eventName` set to `"RoleRevoked"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWatchVoterRoleRevokedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: voterAbi,
    address: voterAddress,
    eventName: 'RoleRevoked',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link voterAbi}__ and `eventName` set to `"TokenStatus"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWatchVoterTokenStatusEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: voterAbi,
    address: voterAddress,
    eventName: 'TokenStatus',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link voterAbi}__ and `eventName` set to `"Upgraded"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWatchVoterUpgradedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: voterAbi,
    address: voterAddress,
    eventName: 'Upgraded',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link voterAbi}__ and `eventName` set to `"Voted"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWatchVoterVotedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: voterAbi,
    address: voterAddress,
    eventName: 'Voted',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingEscrowAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVotingEscrow = /*#__PURE__*/ createUseReadContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"MAXTIME"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVotingEscrowMaxtime = /*#__PURE__*/ createUseReadContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'MAXTIME',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"MULTIPLIER"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVotingEscrowMultiplier =
  /*#__PURE__*/ createUseReadContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'MULTIPLIER',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"UPGRADE_INTERFACE_VERSION"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVotingEscrowUpgradeInterfaceVersion =
  /*#__PURE__*/ createUseReadContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'UPGRADE_INTERFACE_VERSION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"WEEK"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVotingEscrowWeek = /*#__PURE__*/ createUseReadContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'WEEK',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"artProxy"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVotingEscrowArtProxy = /*#__PURE__*/ createUseReadContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'artProxy',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"balanceOf"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVotingEscrowBalanceOf = /*#__PURE__*/ createUseReadContract(
  {
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'balanceOf',
  },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"balanceOfNFT"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVotingEscrowBalanceOfNft =
  /*#__PURE__*/ createUseReadContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'balanceOfNFT',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"epoch"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVotingEscrowEpoch = /*#__PURE__*/ createUseReadContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'epoch',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"getApproved"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVotingEscrowGetApproved =
  /*#__PURE__*/ createUseReadContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'getApproved',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"get_last_user_slope"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVotingEscrowGetLastUserSlope =
  /*#__PURE__*/ createUseReadContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'get_last_user_slope',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"iMAXTIME"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVotingEscrowIMaxtime = /*#__PURE__*/ createUseReadContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'iMAXTIME',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"isApprovedForAll"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVotingEscrowIsApprovedForAll =
  /*#__PURE__*/ createUseReadContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'isApprovedForAll',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"isApprovedOrOwner"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVotingEscrowIsApprovedOrOwner =
  /*#__PURE__*/ createUseReadContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'isApprovedOrOwner',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"locked"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVotingEscrowLocked = /*#__PURE__*/ createUseReadContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'locked',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"name"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVotingEscrowName = /*#__PURE__*/ createUseReadContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"owner"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVotingEscrowOwner = /*#__PURE__*/ createUseReadContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"ownerOf"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVotingEscrowOwnerOf = /*#__PURE__*/ createUseReadContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'ownerOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"ownership_change"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVotingEscrowOwnershipChange =
  /*#__PURE__*/ createUseReadContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'ownership_change',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"pendingOwner"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVotingEscrowPendingOwner =
  /*#__PURE__*/ createUseReadContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'pendingOwner',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"point_history"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVotingEscrowPointHistory =
  /*#__PURE__*/ createUseReadContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'point_history',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"proxiableUUID"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVotingEscrowProxiableUuid =
  /*#__PURE__*/ createUseReadContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'proxiableUUID',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"slope_changes"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVotingEscrowSlopeChanges =
  /*#__PURE__*/ createUseReadContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'slope_changes',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"supply"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVotingEscrowSupply = /*#__PURE__*/ createUseReadContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'supply',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"supportsInterface"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVotingEscrowSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"symbol"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVotingEscrowSymbol = /*#__PURE__*/ createUseReadContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'symbol',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"token"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVotingEscrowToken = /*#__PURE__*/ createUseReadContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'token',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"tokenByIndex"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVotingEscrowTokenByIndex =
  /*#__PURE__*/ createUseReadContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'tokenByIndex',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"tokenId"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVotingEscrowTokenId = /*#__PURE__*/ createUseReadContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'tokenId',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"tokenOfOwnerByIndex"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVotingEscrowTokenOfOwnerByIndex =
  /*#__PURE__*/ createUseReadContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'tokenOfOwnerByIndex',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"tokenURI"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVotingEscrowTokenUri = /*#__PURE__*/ createUseReadContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'tokenURI',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"totalSupply"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVotingEscrowTotalSupply =
  /*#__PURE__*/ createUseReadContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'totalSupply',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"totalVotingPower"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVotingEscrowTotalVotingPower =
  /*#__PURE__*/ createUseReadContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'totalVotingPower',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"userPointHistory"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVotingEscrowUserPointHistory =
  /*#__PURE__*/ createUseReadContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'userPointHistory',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"user_point_epoch"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVotingEscrowUserPointEpoch =
  /*#__PURE__*/ createUseReadContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'user_point_epoch',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"voted"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVotingEscrowVoted = /*#__PURE__*/ createUseReadContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'voted',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"voter"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useReadVotingEscrowVoter = /*#__PURE__*/ createUseReadContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'voter',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link votingEscrowAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteVotingEscrow = /*#__PURE__*/ createUseWriteContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"acceptOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteVotingEscrowAcceptOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'acceptOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"approve"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteVotingEscrowApprove = /*#__PURE__*/ createUseWriteContract(
  {
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'approve',
  },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"checkpoint"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteVotingEscrowCheckpoint =
  /*#__PURE__*/ createUseWriteContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'checkpoint',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"create_lock"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteVotingEscrowCreateLock =
  /*#__PURE__*/ createUseWriteContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'create_lock',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"create_lock_for"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteVotingEscrowCreateLockFor =
  /*#__PURE__*/ createUseWriteContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'create_lock_for',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"deposit_for"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteVotingEscrowDepositFor =
  /*#__PURE__*/ createUseWriteContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'deposit_for',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"increase_amount"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteVotingEscrowIncreaseAmount =
  /*#__PURE__*/ createUseWriteContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'increase_amount',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"increase_unlock_time"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteVotingEscrowIncreaseUnlockTime =
  /*#__PURE__*/ createUseWriteContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'increase_unlock_time',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"initialize"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteVotingEscrowInitialize =
  /*#__PURE__*/ createUseWriteContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"merge"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteVotingEscrowMerge = /*#__PURE__*/ createUseWriteContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'merge',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteVotingEscrowRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"safeTransferFrom"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteVotingEscrowSafeTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'safeTransferFrom',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"setApprovalForAll"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteVotingEscrowSetApprovalForAll =
  /*#__PURE__*/ createUseWriteContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'setApprovalForAll',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"setArtProxy"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteVotingEscrowSetArtProxy =
  /*#__PURE__*/ createUseWriteContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'setArtProxy',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"setVoter"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteVotingEscrowSetVoter =
  /*#__PURE__*/ createUseWriteContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'setVoter',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"split"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteVotingEscrowSplit = /*#__PURE__*/ createUseWriteContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'split',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"transferFrom"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteVotingEscrowTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteVotingEscrowTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"upgradeToAndCall"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteVotingEscrowUpgradeToAndCall =
  /*#__PURE__*/ createUseWriteContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"withdraw"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWriteVotingEscrowWithdraw =
  /*#__PURE__*/ createUseWriteContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'withdraw',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link votingEscrowAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateVotingEscrow = /*#__PURE__*/ createUseSimulateContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"acceptOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateVotingEscrowAcceptOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'acceptOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"approve"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateVotingEscrowApprove =
  /*#__PURE__*/ createUseSimulateContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"checkpoint"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateVotingEscrowCheckpoint =
  /*#__PURE__*/ createUseSimulateContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'checkpoint',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"create_lock"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateVotingEscrowCreateLock =
  /*#__PURE__*/ createUseSimulateContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'create_lock',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"create_lock_for"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateVotingEscrowCreateLockFor =
  /*#__PURE__*/ createUseSimulateContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'create_lock_for',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"deposit_for"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateVotingEscrowDepositFor =
  /*#__PURE__*/ createUseSimulateContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'deposit_for',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"increase_amount"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateVotingEscrowIncreaseAmount =
  /*#__PURE__*/ createUseSimulateContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'increase_amount',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"increase_unlock_time"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateVotingEscrowIncreaseUnlockTime =
  /*#__PURE__*/ createUseSimulateContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'increase_unlock_time',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"initialize"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateVotingEscrowInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"merge"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateVotingEscrowMerge =
  /*#__PURE__*/ createUseSimulateContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'merge',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateVotingEscrowRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"safeTransferFrom"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateVotingEscrowSafeTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'safeTransferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"setApprovalForAll"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateVotingEscrowSetApprovalForAll =
  /*#__PURE__*/ createUseSimulateContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'setApprovalForAll',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"setArtProxy"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateVotingEscrowSetArtProxy =
  /*#__PURE__*/ createUseSimulateContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'setArtProxy',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"setVoter"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateVotingEscrowSetVoter =
  /*#__PURE__*/ createUseSimulateContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'setVoter',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"split"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateVotingEscrowSplit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'split',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"transferFrom"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateVotingEscrowTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateVotingEscrowTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"upgradeToAndCall"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateVotingEscrowUpgradeToAndCall =
  /*#__PURE__*/ createUseSimulateContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"withdraw"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useSimulateVotingEscrowWithdraw =
  /*#__PURE__*/ createUseSimulateContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'withdraw',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link votingEscrowAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWatchVotingEscrowEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link votingEscrowAbi}__ and `eventName` set to `"Approval"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWatchVotingEscrowApprovalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link votingEscrowAbi}__ and `eventName` set to `"ApprovalForAll"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWatchVotingEscrowApprovalForAllEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    eventName: 'ApprovalForAll',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link votingEscrowAbi}__ and `eventName` set to `"Deposit"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWatchVotingEscrowDepositEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    eventName: 'Deposit',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link votingEscrowAbi}__ and `eventName` set to `"Initialized"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWatchVotingEscrowInitializedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link votingEscrowAbi}__ and `eventName` set to `"OwnershipTransferStarted"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWatchVotingEscrowOwnershipTransferStartedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    eventName: 'OwnershipTransferStarted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link votingEscrowAbi}__ and `eventName` set to `"OwnershipTransferred"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWatchVotingEscrowOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link votingEscrowAbi}__ and `eventName` set to `"Split"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWatchVotingEscrowSplitEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    eventName: 'Split',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link votingEscrowAbi}__ and `eventName` set to `"Supply"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWatchVotingEscrowSupplyEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    eventName: 'Supply',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link votingEscrowAbi}__ and `eventName` set to `"Transfer"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWatchVotingEscrowTransferEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    eventName: 'Transfer',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link votingEscrowAbi}__ and `eventName` set to `"Upgraded"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWatchVotingEscrowUpgradedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    eventName: 'Upgraded',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link votingEscrowAbi}__ and `eventName` set to `"Withdraw"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const useWatchVotingEscrowWithdrawEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    eventName: 'Withdraw',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingRewardAbi}__
 */
export const useReadVotingReward = /*#__PURE__*/ createUseReadContract({
  abi: votingRewardAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"DEFAULT_ADMIN_ROLE"`
 */
export const useReadVotingRewardDefaultAdminRole =
  /*#__PURE__*/ createUseReadContract({
    abi: votingRewardAbi,
    functionName: 'DEFAULT_ADMIN_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"DURATION"`
 */
export const useReadVotingRewardDuration = /*#__PURE__*/ createUseReadContract({
  abi: votingRewardAbi,
  functionName: 'DURATION',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"NOTIFY_ROLE"`
 */
export const useReadVotingRewardNotifyRole =
  /*#__PURE__*/ createUseReadContract({
    abi: votingRewardAbi,
    functionName: 'NOTIFY_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"PRECISION"`
 */
export const useReadVotingRewardPrecision = /*#__PURE__*/ createUseReadContract(
  { abi: votingRewardAbi, functionName: 'PRECISION' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"UPGRADE_INTERFACE_VERSION"`
 */
export const useReadVotingRewardUpgradeInterfaceVersion =
  /*#__PURE__*/ createUseReadContract({
    abi: votingRewardAbi,
    functionName: 'UPGRADE_INTERFACE_VERSION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"earnedForPeriod"`
 */
export const useReadVotingRewardEarnedForPeriod =
  /*#__PURE__*/ createUseReadContract({
    abi: votingRewardAbi,
    functionName: 'earnedForPeriod',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"earnedForToken"`
 */
export const useReadVotingRewardEarnedForToken =
  /*#__PURE__*/ createUseReadContract({
    abi: votingRewardAbi,
    functionName: 'earnedForToken',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"earnedForTokenId"`
 */
export const useReadVotingRewardEarnedForTokenId =
  /*#__PURE__*/ createUseReadContract({
    abi: votingRewardAbi,
    functionName: 'earnedForTokenId',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"getCurrentPeriod"`
 */
export const useReadVotingRewardGetCurrentPeriod =
  /*#__PURE__*/ createUseReadContract({
    abi: votingRewardAbi,
    functionName: 'getCurrentPeriod',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"getRewardList"`
 */
export const useReadVotingRewardGetRewardList =
  /*#__PURE__*/ createUseReadContract({
    abi: votingRewardAbi,
    functionName: 'getRewardList',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"getRoleAdmin"`
 */
export const useReadVotingRewardGetRoleAdmin =
  /*#__PURE__*/ createUseReadContract({
    abi: votingRewardAbi,
    functionName: 'getRoleAdmin',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"hasRole"`
 */
export const useReadVotingRewardHasRole = /*#__PURE__*/ createUseReadContract({
  abi: votingRewardAbi,
  functionName: 'hasRole',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"owner"`
 */
export const useReadVotingRewardOwner = /*#__PURE__*/ createUseReadContract({
  abi: votingRewardAbi,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"pendingOwner"`
 */
export const useReadVotingRewardPendingOwner =
  /*#__PURE__*/ createUseReadContract({
    abi: votingRewardAbi,
    functionName: 'pendingOwner',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"periodInit"`
 */
export const useReadVotingRewardPeriodInit =
  /*#__PURE__*/ createUseReadContract({
    abi: votingRewardAbi,
    functionName: 'periodInit',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const useReadVotingRewardProxiableUuid =
  /*#__PURE__*/ createUseReadContract({
    abi: votingRewardAbi,
    functionName: 'proxiableUUID',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"rewardForPeriod"`
 */
export const useReadVotingRewardRewardForPeriod =
  /*#__PURE__*/ createUseReadContract({
    abi: votingRewardAbi,
    functionName: 'rewardForPeriod',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadVotingRewardSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: votingRewardAbi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"tokenIdRewardClaimedInPeriod"`
 */
export const useReadVotingRewardTokenIdRewardClaimedInPeriod =
  /*#__PURE__*/ createUseReadContract({
    abi: votingRewardAbi,
    functionName: 'tokenIdRewardClaimedInPeriod',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"tokenIdVotesInPeriod"`
 */
export const useReadVotingRewardTokenIdVotesInPeriod =
  /*#__PURE__*/ createUseReadContract({
    abi: votingRewardAbi,
    functionName: 'tokenIdVotesInPeriod',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"totalVotesInPeriod"`
 */
export const useReadVotingRewardTotalVotesInPeriod =
  /*#__PURE__*/ createUseReadContract({
    abi: votingRewardAbi,
    functionName: 'totalVotesInPeriod',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"veTOKEN"`
 */
export const useReadVotingRewardVeToken = /*#__PURE__*/ createUseReadContract({
  abi: votingRewardAbi,
  functionName: 'veTOKEN',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"voter"`
 */
export const useReadVotingRewardVoter = /*#__PURE__*/ createUseReadContract({
  abi: votingRewardAbi,
  functionName: 'voter',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link votingRewardAbi}__
 */
export const useWriteVotingReward = /*#__PURE__*/ createUseWriteContract({
  abi: votingRewardAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"_deposit"`
 */
export const useWriteVotingRewardDeposit = /*#__PURE__*/ createUseWriteContract(
  { abi: votingRewardAbi, functionName: '_deposit' },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"_withdraw"`
 */
export const useWriteVotingRewardWithdraw =
  /*#__PURE__*/ createUseWriteContract({
    abi: votingRewardAbi,
    functionName: '_withdraw',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"acceptOwnership"`
 */
export const useWriteVotingRewardAcceptOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: votingRewardAbi,
    functionName: 'acceptOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"getRewardForOwner"`
 */
export const useWriteVotingRewardGetRewardForOwner =
  /*#__PURE__*/ createUseWriteContract({
    abi: votingRewardAbi,
    functionName: 'getRewardForOwner',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"getRewardForPeriod"`
 */
export const useWriteVotingRewardGetRewardForPeriod =
  /*#__PURE__*/ createUseWriteContract({
    abi: votingRewardAbi,
    functionName: 'getRewardForPeriod',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"getRewardForTokenId"`
 */
export const useWriteVotingRewardGetRewardForTokenId =
  /*#__PURE__*/ createUseWriteContract({
    abi: votingRewardAbi,
    functionName: 'getRewardForTokenId',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"grantNotifyRole"`
 */
export const useWriteVotingRewardGrantNotifyRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: votingRewardAbi,
    functionName: 'grantNotifyRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"grantRole"`
 */
export const useWriteVotingRewardGrantRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: votingRewardAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"incentivize"`
 */
export const useWriteVotingRewardIncentivize =
  /*#__PURE__*/ createUseWriteContract({
    abi: votingRewardAbi,
    functionName: 'incentivize',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"initialize"`
 */
export const useWriteVotingRewardInitialize =
  /*#__PURE__*/ createUseWriteContract({
    abi: votingRewardAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"notifyRewardAmount"`
 */
export const useWriteVotingRewardNotifyRewardAmount =
  /*#__PURE__*/ createUseWriteContract({
    abi: votingRewardAbi,
    functionName: 'notifyRewardAmount',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteVotingRewardRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: votingRewardAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useWriteVotingRewardRenounceRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: votingRewardAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useWriteVotingRewardRevokeRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: votingRewardAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"transferERC20"`
 */
export const useWriteVotingRewardTransferErc20 =
  /*#__PURE__*/ createUseWriteContract({
    abi: votingRewardAbi,
    functionName: 'transferERC20',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteVotingRewardTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: votingRewardAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useWriteVotingRewardUpgradeToAndCall =
  /*#__PURE__*/ createUseWriteContract({
    abi: votingRewardAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link votingRewardAbi}__
 */
export const useSimulateVotingReward = /*#__PURE__*/ createUseSimulateContract({
  abi: votingRewardAbi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"_deposit"`
 */
export const useSimulateVotingRewardDeposit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: votingRewardAbi,
    functionName: '_deposit',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"_withdraw"`
 */
export const useSimulateVotingRewardWithdraw =
  /*#__PURE__*/ createUseSimulateContract({
    abi: votingRewardAbi,
    functionName: '_withdraw',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"acceptOwnership"`
 */
export const useSimulateVotingRewardAcceptOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: votingRewardAbi,
    functionName: 'acceptOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"getRewardForOwner"`
 */
export const useSimulateVotingRewardGetRewardForOwner =
  /*#__PURE__*/ createUseSimulateContract({
    abi: votingRewardAbi,
    functionName: 'getRewardForOwner',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"getRewardForPeriod"`
 */
export const useSimulateVotingRewardGetRewardForPeriod =
  /*#__PURE__*/ createUseSimulateContract({
    abi: votingRewardAbi,
    functionName: 'getRewardForPeriod',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"getRewardForTokenId"`
 */
export const useSimulateVotingRewardGetRewardForTokenId =
  /*#__PURE__*/ createUseSimulateContract({
    abi: votingRewardAbi,
    functionName: 'getRewardForTokenId',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"grantNotifyRole"`
 */
export const useSimulateVotingRewardGrantNotifyRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: votingRewardAbi,
    functionName: 'grantNotifyRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"grantRole"`
 */
export const useSimulateVotingRewardGrantRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: votingRewardAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"incentivize"`
 */
export const useSimulateVotingRewardIncentivize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: votingRewardAbi,
    functionName: 'incentivize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateVotingRewardInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: votingRewardAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"notifyRewardAmount"`
 */
export const useSimulateVotingRewardNotifyRewardAmount =
  /*#__PURE__*/ createUseSimulateContract({
    abi: votingRewardAbi,
    functionName: 'notifyRewardAmount',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateVotingRewardRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: votingRewardAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useSimulateVotingRewardRenounceRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: votingRewardAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useSimulateVotingRewardRevokeRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: votingRewardAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"transferERC20"`
 */
export const useSimulateVotingRewardTransferErc20 =
  /*#__PURE__*/ createUseSimulateContract({
    abi: votingRewardAbi,
    functionName: 'transferERC20',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateVotingRewardTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: votingRewardAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useSimulateVotingRewardUpgradeToAndCall =
  /*#__PURE__*/ createUseSimulateContract({
    abi: votingRewardAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link votingRewardAbi}__
 */
export const useWatchVotingRewardEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: votingRewardAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link votingRewardAbi}__ and `eventName` set to `"ClaimReward"`
 */
export const useWatchVotingRewardClaimRewardEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: votingRewardAbi,
    eventName: 'ClaimReward',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link votingRewardAbi}__ and `eventName` set to `"Deposit"`
 */
export const useWatchVotingRewardDepositEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: votingRewardAbi,
    eventName: 'Deposit',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link votingRewardAbi}__ and `eventName` set to `"IncentivizedReward"`
 */
export const useWatchVotingRewardIncentivizedRewardEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: votingRewardAbi,
    eventName: 'IncentivizedReward',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link votingRewardAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchVotingRewardInitializedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: votingRewardAbi,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link votingRewardAbi}__ and `eventName` set to `"NotifyReward"`
 */
export const useWatchVotingRewardNotifyRewardEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: votingRewardAbi,
    eventName: 'NotifyReward',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link votingRewardAbi}__ and `eventName` set to `"OwnershipTransferStarted"`
 */
export const useWatchVotingRewardOwnershipTransferStartedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: votingRewardAbi,
    eventName: 'OwnershipTransferStarted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link votingRewardAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchVotingRewardOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: votingRewardAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link votingRewardAbi}__ and `eventName` set to `"RoleAdminChanged"`
 */
export const useWatchVotingRewardRoleAdminChangedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: votingRewardAbi,
    eventName: 'RoleAdminChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link votingRewardAbi}__ and `eventName` set to `"RoleGranted"`
 */
export const useWatchVotingRewardRoleGrantedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: votingRewardAbi,
    eventName: 'RoleGranted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link votingRewardAbi}__ and `eventName` set to `"RoleRevoked"`
 */
export const useWatchVotingRewardRoleRevokedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: votingRewardAbi,
    eventName: 'RoleRevoked',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link votingRewardAbi}__ and `eventName` set to `"Upgraded"`
 */
export const useWatchVotingRewardUpgradedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: votingRewardAbi,
    eventName: 'Upgraded',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link votingRewardAbi}__ and `eventName` set to `"Withdraw"`
 */
export const useWatchVotingRewardWithdrawEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: votingRewardAbi,
    eventName: 'Withdraw',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wrappedNativeAbi}__
 */
export const useReadWrappedNative = /*#__PURE__*/ createUseReadContract({
  abi: wrappedNativeAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wrappedNativeAbi}__ and `functionName` set to `"name"`
 */
export const useReadWrappedNativeName = /*#__PURE__*/ createUseReadContract({
  abi: wrappedNativeAbi,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wrappedNativeAbi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadWrappedNativeTotalSupply =
  /*#__PURE__*/ createUseReadContract({
    abi: wrappedNativeAbi,
    functionName: 'totalSupply',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wrappedNativeAbi}__ and `functionName` set to `"decimals"`
 */
export const useReadWrappedNativeDecimals = /*#__PURE__*/ createUseReadContract(
  { abi: wrappedNativeAbi, functionName: 'decimals' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wrappedNativeAbi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadWrappedNativeBalanceOf =
  /*#__PURE__*/ createUseReadContract({
    abi: wrappedNativeAbi,
    functionName: 'balanceOf',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wrappedNativeAbi}__ and `functionName` set to `"symbol"`
 */
export const useReadWrappedNativeSymbol = /*#__PURE__*/ createUseReadContract({
  abi: wrappedNativeAbi,
  functionName: 'symbol',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wrappedNativeAbi}__ and `functionName` set to `"allowance"`
 */
export const useReadWrappedNativeAllowance =
  /*#__PURE__*/ createUseReadContract({
    abi: wrappedNativeAbi,
    functionName: 'allowance',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wrappedNativeAbi}__
 */
export const useWriteWrappedNative = /*#__PURE__*/ createUseWriteContract({
  abi: wrappedNativeAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wrappedNativeAbi}__ and `functionName` set to `"approve"`
 */
export const useWriteWrappedNativeApprove =
  /*#__PURE__*/ createUseWriteContract({
    abi: wrappedNativeAbi,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wrappedNativeAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteWrappedNativeTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: wrappedNativeAbi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wrappedNativeAbi}__ and `functionName` set to `"withdraw"`
 */
export const useWriteWrappedNativeWithdraw =
  /*#__PURE__*/ createUseWriteContract({
    abi: wrappedNativeAbi,
    functionName: 'withdraw',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wrappedNativeAbi}__ and `functionName` set to `"transfer"`
 */
export const useWriteWrappedNativeTransfer =
  /*#__PURE__*/ createUseWriteContract({
    abi: wrappedNativeAbi,
    functionName: 'transfer',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wrappedNativeAbi}__ and `functionName` set to `"deposit"`
 */
export const useWriteWrappedNativeDeposit =
  /*#__PURE__*/ createUseWriteContract({
    abi: wrappedNativeAbi,
    functionName: 'deposit',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wrappedNativeAbi}__
 */
export const useSimulateWrappedNative = /*#__PURE__*/ createUseSimulateContract(
  { abi: wrappedNativeAbi },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wrappedNativeAbi}__ and `functionName` set to `"approve"`
 */
export const useSimulateWrappedNativeApprove =
  /*#__PURE__*/ createUseSimulateContract({
    abi: wrappedNativeAbi,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wrappedNativeAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateWrappedNativeTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: wrappedNativeAbi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wrappedNativeAbi}__ and `functionName` set to `"withdraw"`
 */
export const useSimulateWrappedNativeWithdraw =
  /*#__PURE__*/ createUseSimulateContract({
    abi: wrappedNativeAbi,
    functionName: 'withdraw',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wrappedNativeAbi}__ and `functionName` set to `"transfer"`
 */
export const useSimulateWrappedNativeTransfer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: wrappedNativeAbi,
    functionName: 'transfer',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wrappedNativeAbi}__ and `functionName` set to `"deposit"`
 */
export const useSimulateWrappedNativeDeposit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: wrappedNativeAbi,
    functionName: 'deposit',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link wrappedNativeAbi}__
 */
export const useWatchWrappedNativeEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: wrappedNativeAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link wrappedNativeAbi}__ and `eventName` set to `"Approval"`
 */
export const useWatchWrappedNativeApprovalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: wrappedNativeAbi,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link wrappedNativeAbi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchWrappedNativeTransferEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: wrappedNativeAbi,
    eventName: 'Transfer',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link wrappedNativeAbi}__ and `eventName` set to `"Deposit"`
 */
export const useWatchWrappedNativeDepositEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: wrappedNativeAbi,
    eventName: 'Deposit',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link wrappedNativeAbi}__ and `eventName` set to `"Withdrawal"`
 */
export const useWatchWrappedNativeWithdrawalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: wrappedNativeAbi,
    eventName: 'Withdrawal',
  })

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Action
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__
 */
export const readAlgebraBasePluginV1 = /*#__PURE__*/ createReadContract({
  abi: algebraBasePluginV1Abi,
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"ALGEBRA_BASE_PLUGIN_MANAGER"`
 */
export const readAlgebraBasePluginV1AlgebraBasePluginManager =
  /*#__PURE__*/ createReadContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'ALGEBRA_BASE_PLUGIN_MANAGER',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"defaultPluginConfig"`
 */
export const readAlgebraBasePluginV1DefaultPluginConfig =
  /*#__PURE__*/ createReadContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'defaultPluginConfig',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"feeConfig"`
 */
export const readAlgebraBasePluginV1FeeConfig =
  /*#__PURE__*/ createReadContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'feeConfig',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"getCurrentFee"`
 */
export const readAlgebraBasePluginV1GetCurrentFee =
  /*#__PURE__*/ createReadContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'getCurrentFee',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"getPool"`
 */
export const readAlgebraBasePluginV1GetPool = /*#__PURE__*/ createReadContract({
  abi: algebraBasePluginV1Abi,
  functionName: 'getPool',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"getSingleTimepoint"`
 */
export const readAlgebraBasePluginV1GetSingleTimepoint =
  /*#__PURE__*/ createReadContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'getSingleTimepoint',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"getTimepoints"`
 */
export const readAlgebraBasePluginV1GetTimepoints =
  /*#__PURE__*/ createReadContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'getTimepoints',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"handlePluginFee"`
 */
export const readAlgebraBasePluginV1HandlePluginFee =
  /*#__PURE__*/ createReadContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'handlePluginFee',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"incentive"`
 */
export const readAlgebraBasePluginV1Incentive =
  /*#__PURE__*/ createReadContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'incentive',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"isIncentiveConnected"`
 */
export const readAlgebraBasePluginV1IsIncentiveConnected =
  /*#__PURE__*/ createReadContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'isIncentiveConnected',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"isInitialized"`
 */
export const readAlgebraBasePluginV1IsInitialized =
  /*#__PURE__*/ createReadContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'isInitialized',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"lastTimepointTimestamp"`
 */
export const readAlgebraBasePluginV1LastTimepointTimestamp =
  /*#__PURE__*/ createReadContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'lastTimepointTimestamp',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"pool"`
 */
export const readAlgebraBasePluginV1Pool = /*#__PURE__*/ createReadContract({
  abi: algebraBasePluginV1Abi,
  functionName: 'pool',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"timepointIndex"`
 */
export const readAlgebraBasePluginV1TimepointIndex =
  /*#__PURE__*/ createReadContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'timepointIndex',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"timepoints"`
 */
export const readAlgebraBasePluginV1Timepoints =
  /*#__PURE__*/ createReadContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'timepoints',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__
 */
export const writeAlgebraBasePluginV1 = /*#__PURE__*/ createWriteContract({
  abi: algebraBasePluginV1Abi,
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"afterFlash"`
 */
export const writeAlgebraBasePluginV1AfterFlash =
  /*#__PURE__*/ createWriteContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'afterFlash',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"afterInitialize"`
 */
export const writeAlgebraBasePluginV1AfterInitialize =
  /*#__PURE__*/ createWriteContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'afterInitialize',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"afterModifyPosition"`
 */
export const writeAlgebraBasePluginV1AfterModifyPosition =
  /*#__PURE__*/ createWriteContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'afterModifyPosition',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"afterSwap"`
 */
export const writeAlgebraBasePluginV1AfterSwap =
  /*#__PURE__*/ createWriteContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'afterSwap',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"beforeFlash"`
 */
export const writeAlgebraBasePluginV1BeforeFlash =
  /*#__PURE__*/ createWriteContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'beforeFlash',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"beforeInitialize"`
 */
export const writeAlgebraBasePluginV1BeforeInitialize =
  /*#__PURE__*/ createWriteContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'beforeInitialize',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"beforeModifyPosition"`
 */
export const writeAlgebraBasePluginV1BeforeModifyPosition =
  /*#__PURE__*/ createWriteContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'beforeModifyPosition',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"beforeSwap"`
 */
export const writeAlgebraBasePluginV1BeforeSwap =
  /*#__PURE__*/ createWriteContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'beforeSwap',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"changeFeeConfiguration"`
 */
export const writeAlgebraBasePluginV1ChangeFeeConfiguration =
  /*#__PURE__*/ createWriteContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'changeFeeConfiguration',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"collectPluginFee"`
 */
export const writeAlgebraBasePluginV1CollectPluginFee =
  /*#__PURE__*/ createWriteContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'collectPluginFee',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"initialize"`
 */
export const writeAlgebraBasePluginV1Initialize =
  /*#__PURE__*/ createWriteContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"prepayTimepointsStorageSlots"`
 */
export const writeAlgebraBasePluginV1PrepayTimepointsStorageSlots =
  /*#__PURE__*/ createWriteContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'prepayTimepointsStorageSlots',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"setIncentive"`
 */
export const writeAlgebraBasePluginV1SetIncentive =
  /*#__PURE__*/ createWriteContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'setIncentive',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__
 */
export const simulateAlgebraBasePluginV1 = /*#__PURE__*/ createSimulateContract(
  { abi: algebraBasePluginV1Abi },
)

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"afterFlash"`
 */
export const simulateAlgebraBasePluginV1AfterFlash =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'afterFlash',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"afterInitialize"`
 */
export const simulateAlgebraBasePluginV1AfterInitialize =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'afterInitialize',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"afterModifyPosition"`
 */
export const simulateAlgebraBasePluginV1AfterModifyPosition =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'afterModifyPosition',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"afterSwap"`
 */
export const simulateAlgebraBasePluginV1AfterSwap =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'afterSwap',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"beforeFlash"`
 */
export const simulateAlgebraBasePluginV1BeforeFlash =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'beforeFlash',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"beforeInitialize"`
 */
export const simulateAlgebraBasePluginV1BeforeInitialize =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'beforeInitialize',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"beforeModifyPosition"`
 */
export const simulateAlgebraBasePluginV1BeforeModifyPosition =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'beforeModifyPosition',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"beforeSwap"`
 */
export const simulateAlgebraBasePluginV1BeforeSwap =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'beforeSwap',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"changeFeeConfiguration"`
 */
export const simulateAlgebraBasePluginV1ChangeFeeConfiguration =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'changeFeeConfiguration',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"collectPluginFee"`
 */
export const simulateAlgebraBasePluginV1CollectPluginFee =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'collectPluginFee',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"initialize"`
 */
export const simulateAlgebraBasePluginV1Initialize =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"prepayTimepointsStorageSlots"`
 */
export const simulateAlgebraBasePluginV1PrepayTimepointsStorageSlots =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'prepayTimepointsStorageSlots',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `functionName` set to `"setIncentive"`
 */
export const simulateAlgebraBasePluginV1SetIncentive =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraBasePluginV1Abi,
    functionName: 'setIncentive',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link algebraBasePluginV1Abi}__
 */
export const watchAlgebraBasePluginV1Event =
  /*#__PURE__*/ createWatchContractEvent({ abi: algebraBasePluginV1Abi })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `eventName` set to `"FeeConfiguration"`
 */
export const watchAlgebraBasePluginV1FeeConfigurationEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: algebraBasePluginV1Abi,
    eventName: 'FeeConfiguration',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link algebraBasePluginV1Abi}__ and `eventName` set to `"Incentive"`
 */
export const watchAlgebraBasePluginV1IncentiveEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: algebraBasePluginV1Abi,
    eventName: 'Incentive',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraCustomPoolEntryPointAbi}__
 */
export const readAlgebraCustomPoolEntryPoint = /*#__PURE__*/ createReadContract(
  { abi: algebraCustomPoolEntryPointAbi },
)

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraCustomPoolEntryPointAbi}__ and `functionName` set to `"ALGEBRA_CUSTOM_PLUGIN_ADMINISTRATOR"`
 */
export const readAlgebraCustomPoolEntryPointAlgebraCustomPluginAdministrator =
  /*#__PURE__*/ createReadContract({
    abi: algebraCustomPoolEntryPointAbi,
    functionName: 'ALGEBRA_CUSTOM_PLUGIN_ADMINISTRATOR',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraCustomPoolEntryPointAbi}__ and `functionName` set to `"afterCreatePoolHook"`
 */
export const readAlgebraCustomPoolEntryPointAfterCreatePoolHook =
  /*#__PURE__*/ createReadContract({
    abi: algebraCustomPoolEntryPointAbi,
    functionName: 'afterCreatePoolHook',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraCustomPoolEntryPointAbi}__ and `functionName` set to `"algebraFactory"`
 */
export const readAlgebraCustomPoolEntryPointAlgebraFactory =
  /*#__PURE__*/ createReadContract({
    abi: algebraCustomPoolEntryPointAbi,
    functionName: 'algebraFactory',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraCustomPoolEntryPointAbi}__ and `functionName` set to `"defaultFeeConfiguration"`
 */
export const readAlgebraCustomPoolEntryPointDefaultFeeConfiguration =
  /*#__PURE__*/ createReadContract({
    abi: algebraCustomPoolEntryPointAbi,
    functionName: 'defaultFeeConfiguration',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraCustomPoolEntryPointAbi}__ and `functionName` set to `"entryPoint"`
 */
export const readAlgebraCustomPoolEntryPointEntryPoint =
  /*#__PURE__*/ createReadContract({
    abi: algebraCustomPoolEntryPointAbi,
    functionName: 'entryPoint',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraCustomPoolEntryPointAbi}__ and `functionName` set to `"farmingAddress"`
 */
export const readAlgebraCustomPoolEntryPointFarmingAddress =
  /*#__PURE__*/ createReadContract({
    abi: algebraCustomPoolEntryPointAbi,
    functionName: 'farmingAddress',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraCustomPoolEntryPointAbi}__ and `functionName` set to `"pluginByPool"`
 */
export const readAlgebraCustomPoolEntryPointPluginByPool =
  /*#__PURE__*/ createReadContract({
    abi: algebraCustomPoolEntryPointAbi,
    functionName: 'pluginByPool',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraCustomPoolEntryPointAbi}__
 */
export const writeAlgebraCustomPoolEntryPoint =
  /*#__PURE__*/ createWriteContract({ abi: algebraCustomPoolEntryPointAbi })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraCustomPoolEntryPointAbi}__ and `functionName` set to `"beforeCreatePoolHook"`
 */
export const writeAlgebraCustomPoolEntryPointBeforeCreatePoolHook =
  /*#__PURE__*/ createWriteContract({
    abi: algebraCustomPoolEntryPointAbi,
    functionName: 'beforeCreatePoolHook',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraCustomPoolEntryPointAbi}__ and `functionName` set to `"createCustomPool"`
 */
export const writeAlgebraCustomPoolEntryPointCreateCustomPool =
  /*#__PURE__*/ createWriteContract({
    abi: algebraCustomPoolEntryPointAbi,
    functionName: 'createCustomPool',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraCustomPoolEntryPointAbi}__ and `functionName` set to `"setDefaultFeeConfiguration"`
 */
export const writeAlgebraCustomPoolEntryPointSetDefaultFeeConfiguration =
  /*#__PURE__*/ createWriteContract({
    abi: algebraCustomPoolEntryPointAbi,
    functionName: 'setDefaultFeeConfiguration',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraCustomPoolEntryPointAbi}__ and `functionName` set to `"setFarmingAddress"`
 */
export const writeAlgebraCustomPoolEntryPointSetFarmingAddress =
  /*#__PURE__*/ createWriteContract({
    abi: algebraCustomPoolEntryPointAbi,
    functionName: 'setFarmingAddress',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraCustomPoolEntryPointAbi}__
 */
export const simulateAlgebraCustomPoolEntryPoint =
  /*#__PURE__*/ createSimulateContract({ abi: algebraCustomPoolEntryPointAbi })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraCustomPoolEntryPointAbi}__ and `functionName` set to `"beforeCreatePoolHook"`
 */
export const simulateAlgebraCustomPoolEntryPointBeforeCreatePoolHook =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraCustomPoolEntryPointAbi,
    functionName: 'beforeCreatePoolHook',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraCustomPoolEntryPointAbi}__ and `functionName` set to `"createCustomPool"`
 */
export const simulateAlgebraCustomPoolEntryPointCreateCustomPool =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraCustomPoolEntryPointAbi,
    functionName: 'createCustomPool',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraCustomPoolEntryPointAbi}__ and `functionName` set to `"setDefaultFeeConfiguration"`
 */
export const simulateAlgebraCustomPoolEntryPointSetDefaultFeeConfiguration =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraCustomPoolEntryPointAbi,
    functionName: 'setDefaultFeeConfiguration',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraCustomPoolEntryPointAbi}__ and `functionName` set to `"setFarmingAddress"`
 */
export const simulateAlgebraCustomPoolEntryPointSetFarmingAddress =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraCustomPoolEntryPointAbi,
    functionName: 'setFarmingAddress',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link algebraCustomPoolEntryPointAbi}__
 */
export const watchAlgebraCustomPoolEntryPointEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: algebraCustomPoolEntryPointAbi,
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link algebraCustomPoolEntryPointAbi}__ and `eventName` set to `"DefaultFeeConfiguration"`
 */
export const watchAlgebraCustomPoolEntryPointDefaultFeeConfigurationEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: algebraCustomPoolEntryPointAbi,
    eventName: 'DefaultFeeConfiguration',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link algebraCustomPoolEntryPointAbi}__ and `eventName` set to `"FarmingAddress"`
 */
export const watchAlgebraCustomPoolEntryPointFarmingAddressEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: algebraCustomPoolEntryPointAbi,
    eventName: 'FarmingAddress',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const readAlgebraEternalFarming = /*#__PURE__*/ createReadContract({
  abi: algebraEternalFarmingAbi,
  address: algebraEternalFarmingAddress,
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"FARMINGS_ADMINISTRATOR_ROLE"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const readAlgebraEternalFarmingFarmingsAdministratorRole =
  /*#__PURE__*/ createReadContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'FARMINGS_ADMINISTRATOR_ROLE',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"INCENTIVE_MAKER_ROLE"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const readAlgebraEternalFarmingIncentiveMakerRole =
  /*#__PURE__*/ createReadContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'INCENTIVE_MAKER_ROLE',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"farmingCenter"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const readAlgebraEternalFarmingFarmingCenter =
  /*#__PURE__*/ createReadContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'farmingCenter',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"farms"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const readAlgebraEternalFarmingFarms = /*#__PURE__*/ createReadContract({
  abi: algebraEternalFarmingAbi,
  address: algebraEternalFarmingAddress,
  functionName: 'farms',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"getRewardInfo"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const readAlgebraEternalFarmingGetRewardInfo =
  /*#__PURE__*/ createReadContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'getRewardInfo',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"incentiveKeys"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const readAlgebraEternalFarmingIncentiveKeys =
  /*#__PURE__*/ createReadContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'incentiveKeys',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"incentives"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const readAlgebraEternalFarmingIncentives =
  /*#__PURE__*/ createReadContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'incentives',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"isEmergencyWithdrawActivated"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const readAlgebraEternalFarmingIsEmergencyWithdrawActivated =
  /*#__PURE__*/ createReadContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'isEmergencyWithdrawActivated',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"isIncentiveDeactivated"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const readAlgebraEternalFarmingIsIncentiveDeactivated =
  /*#__PURE__*/ createReadContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'isIncentiveDeactivated',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"nonfungiblePositionManager"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const readAlgebraEternalFarmingNonfungiblePositionManager =
  /*#__PURE__*/ createReadContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'nonfungiblePositionManager',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"numOfIncentives"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const readAlgebraEternalFarmingNumOfIncentives =
  /*#__PURE__*/ createReadContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'numOfIncentives',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"rewards"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const readAlgebraEternalFarmingRewards =
  /*#__PURE__*/ createReadContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'rewards',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const writeAlgebraEternalFarming = /*#__PURE__*/ createWriteContract({
  abi: algebraEternalFarmingAbi,
  address: algebraEternalFarmingAddress,
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"addRewards"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const writeAlgebraEternalFarmingAddRewards =
  /*#__PURE__*/ createWriteContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'addRewards',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"claimReward"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const writeAlgebraEternalFarmingClaimReward =
  /*#__PURE__*/ createWriteContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'claimReward',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"claimRewardFrom"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const writeAlgebraEternalFarmingClaimRewardFrom =
  /*#__PURE__*/ createWriteContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'claimRewardFrom',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"collectRewards"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const writeAlgebraEternalFarmingCollectRewards =
  /*#__PURE__*/ createWriteContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'collectRewards',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"createEternalFarming"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const writeAlgebraEternalFarmingCreateEternalFarming =
  /*#__PURE__*/ createWriteContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'createEternalFarming',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"deactivateIncentive"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const writeAlgebraEternalFarmingDeactivateIncentive =
  /*#__PURE__*/ createWriteContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'deactivateIncentive',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"decreaseRewardsAmount"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const writeAlgebraEternalFarmingDecreaseRewardsAmount =
  /*#__PURE__*/ createWriteContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'decreaseRewardsAmount',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"enterFarming"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const writeAlgebraEternalFarmingEnterFarming =
  /*#__PURE__*/ createWriteContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'enterFarming',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"exitFarming"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const writeAlgebraEternalFarmingExitFarming =
  /*#__PURE__*/ createWriteContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'exitFarming',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"setEmergencyWithdrawStatus"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const writeAlgebraEternalFarmingSetEmergencyWithdrawStatus =
  /*#__PURE__*/ createWriteContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'setEmergencyWithdrawStatus',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"setFarmingCenterAddress"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const writeAlgebraEternalFarmingSetFarmingCenterAddress =
  /*#__PURE__*/ createWriteContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'setFarmingCenterAddress',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"setRates"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const writeAlgebraEternalFarmingSetRates =
  /*#__PURE__*/ createWriteContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'setRates',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const simulateAlgebraEternalFarming =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"addRewards"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const simulateAlgebraEternalFarmingAddRewards =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'addRewards',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"claimReward"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const simulateAlgebraEternalFarmingClaimReward =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'claimReward',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"claimRewardFrom"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const simulateAlgebraEternalFarmingClaimRewardFrom =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'claimRewardFrom',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"collectRewards"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const simulateAlgebraEternalFarmingCollectRewards =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'collectRewards',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"createEternalFarming"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const simulateAlgebraEternalFarmingCreateEternalFarming =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'createEternalFarming',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"deactivateIncentive"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const simulateAlgebraEternalFarmingDeactivateIncentive =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'deactivateIncentive',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"decreaseRewardsAmount"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const simulateAlgebraEternalFarmingDecreaseRewardsAmount =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'decreaseRewardsAmount',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"enterFarming"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const simulateAlgebraEternalFarmingEnterFarming =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'enterFarming',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"exitFarming"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const simulateAlgebraEternalFarmingExitFarming =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'exitFarming',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"setEmergencyWithdrawStatus"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const simulateAlgebraEternalFarmingSetEmergencyWithdrawStatus =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'setEmergencyWithdrawStatus',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"setFarmingCenterAddress"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const simulateAlgebraEternalFarmingSetFarmingCenterAddress =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'setFarmingCenterAddress',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"setRates"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const simulateAlgebraEternalFarmingSetRates =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'setRates',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link algebraEternalFarmingAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const watchAlgebraEternalFarmingEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `eventName` set to `"EmergencyWithdraw"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const watchAlgebraEternalFarmingEmergencyWithdrawEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    eventName: 'EmergencyWithdraw',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `eventName` set to `"EternalFarmingCreated"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const watchAlgebraEternalFarmingEternalFarmingCreatedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    eventName: 'EternalFarmingCreated',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `eventName` set to `"FarmEnded"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const watchAlgebraEternalFarmingFarmEndedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    eventName: 'FarmEnded',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `eventName` set to `"FarmEntered"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const watchAlgebraEternalFarmingFarmEnteredEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    eventName: 'FarmEntered',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `eventName` set to `"FarmingCenter"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const watchAlgebraEternalFarmingFarmingCenterEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    eventName: 'FarmingCenter',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `eventName` set to `"IncentiveDeactivated"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const watchAlgebraEternalFarmingIncentiveDeactivatedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    eventName: 'IncentiveDeactivated',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `eventName` set to `"RewardAmountsDecreased"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const watchAlgebraEternalFarmingRewardAmountsDecreasedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    eventName: 'RewardAmountsDecreased',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `eventName` set to `"RewardClaimed"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const watchAlgebraEternalFarmingRewardClaimedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    eventName: 'RewardClaimed',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `eventName` set to `"RewardsAdded"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const watchAlgebraEternalFarmingRewardsAddedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    eventName: 'RewardsAdded',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `eventName` set to `"RewardsCollected"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const watchAlgebraEternalFarmingRewardsCollectedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    eventName: 'RewardsCollected',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `eventName` set to `"RewardsRatesChanged"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1)
 */
export const watchAlgebraEternalFarmingRewardsRatesChangedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    eventName: 'RewardsRatesChanged',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraFactoryAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const readAlgebraFactory = /*#__PURE__*/ createReadContract({
  abi: algebraFactoryAbi,
  address: algebraFactoryAddress,
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"CUSTOM_POOL_DEPLOYER"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const readAlgebraFactoryCustomPoolDeployer =
  /*#__PURE__*/ createReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'CUSTOM_POOL_DEPLOYER',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"DEFAULT_ADMIN_ROLE"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const readAlgebraFactoryDefaultAdminRole =
  /*#__PURE__*/ createReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'DEFAULT_ADMIN_ROLE',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"POOLS_ADMINISTRATOR_ROLE"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const readAlgebraFactoryPoolsAdministratorRole =
  /*#__PURE__*/ createReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'POOLS_ADMINISTRATOR_ROLE',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"POOL_INIT_CODE_HASH"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const readAlgebraFactoryPoolInitCodeHash =
  /*#__PURE__*/ createReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'POOL_INIT_CODE_HASH',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"computeCustomPoolAddress"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const readAlgebraFactoryComputeCustomPoolAddress =
  /*#__PURE__*/ createReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'computeCustomPoolAddress',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"computePoolAddress"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const readAlgebraFactoryComputePoolAddress =
  /*#__PURE__*/ createReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'computePoolAddress',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"customPoolByPair"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const readAlgebraFactoryCustomPoolByPair =
  /*#__PURE__*/ createReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'customPoolByPair',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"defaultCommunityFee"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const readAlgebraFactoryDefaultCommunityFee =
  /*#__PURE__*/ createReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'defaultCommunityFee',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"defaultConfigurationForPool"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const readAlgebraFactoryDefaultConfigurationForPool =
  /*#__PURE__*/ createReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'defaultConfigurationForPool',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"defaultFee"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const readAlgebraFactoryDefaultFee = /*#__PURE__*/ createReadContract({
  abi: algebraFactoryAbi,
  address: algebraFactoryAddress,
  functionName: 'defaultFee',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"defaultPluginFactory"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const readAlgebraFactoryDefaultPluginFactory =
  /*#__PURE__*/ createReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'defaultPluginFactory',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"defaultTickspacing"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const readAlgebraFactoryDefaultTickspacing =
  /*#__PURE__*/ createReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'defaultTickspacing',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"getRoleAdmin"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const readAlgebraFactoryGetRoleAdmin = /*#__PURE__*/ createReadContract({
  abi: algebraFactoryAbi,
  address: algebraFactoryAddress,
  functionName: 'getRoleAdmin',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"getRoleMember"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const readAlgebraFactoryGetRoleMember = /*#__PURE__*/ createReadContract(
  {
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'getRoleMember',
  },
)

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"getRoleMemberCount"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const readAlgebraFactoryGetRoleMemberCount =
  /*#__PURE__*/ createReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'getRoleMemberCount',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"hasRole"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const readAlgebraFactoryHasRole = /*#__PURE__*/ createReadContract({
  abi: algebraFactoryAbi,
  address: algebraFactoryAddress,
  functionName: 'hasRole',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"hasRoleOrOwner"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const readAlgebraFactoryHasRoleOrOwner =
  /*#__PURE__*/ createReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'hasRoleOrOwner',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"owner"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const readAlgebraFactoryOwner = /*#__PURE__*/ createReadContract({
  abi: algebraFactoryAbi,
  address: algebraFactoryAddress,
  functionName: 'owner',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"pendingOwner"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const readAlgebraFactoryPendingOwner = /*#__PURE__*/ createReadContract({
  abi: algebraFactoryAbi,
  address: algebraFactoryAddress,
  functionName: 'pendingOwner',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"poolByPair"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const readAlgebraFactoryPoolByPair = /*#__PURE__*/ createReadContract({
  abi: algebraFactoryAbi,
  address: algebraFactoryAddress,
  functionName: 'poolByPair',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"poolDeployer"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const readAlgebraFactoryPoolDeployer = /*#__PURE__*/ createReadContract({
  abi: algebraFactoryAbi,
  address: algebraFactoryAddress,
  functionName: 'poolDeployer',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"renounceOwnershipStartTimestamp"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const readAlgebraFactoryRenounceOwnershipStartTimestamp =
  /*#__PURE__*/ createReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'renounceOwnershipStartTimestamp',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"supportsInterface"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const readAlgebraFactorySupportsInterface =
  /*#__PURE__*/ createReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"vaultFactory"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const readAlgebraFactoryVaultFactory = /*#__PURE__*/ createReadContract({
  abi: algebraFactoryAbi,
  address: algebraFactoryAddress,
  functionName: 'vaultFactory',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraFactoryAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const writeAlgebraFactory = /*#__PURE__*/ createWriteContract({
  abi: algebraFactoryAbi,
  address: algebraFactoryAddress,
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"acceptOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const writeAlgebraFactoryAcceptOwnership =
  /*#__PURE__*/ createWriteContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'acceptOwnership',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"createCustomPool"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const writeAlgebraFactoryCreateCustomPool =
  /*#__PURE__*/ createWriteContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'createCustomPool',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"createPool"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const writeAlgebraFactoryCreatePool = /*#__PURE__*/ createWriteContract({
  abi: algebraFactoryAbi,
  address: algebraFactoryAddress,
  functionName: 'createPool',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"grantRole"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const writeAlgebraFactoryGrantRole = /*#__PURE__*/ createWriteContract({
  abi: algebraFactoryAbi,
  address: algebraFactoryAddress,
  functionName: 'grantRole',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const writeAlgebraFactoryRenounceOwnership =
  /*#__PURE__*/ createWriteContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"renounceRole"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const writeAlgebraFactoryRenounceRole =
  /*#__PURE__*/ createWriteContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"revokeRole"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const writeAlgebraFactoryRevokeRole = /*#__PURE__*/ createWriteContract({
  abi: algebraFactoryAbi,
  address: algebraFactoryAddress,
  functionName: 'revokeRole',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"setDefaultCommunityFee"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const writeAlgebraFactorySetDefaultCommunityFee =
  /*#__PURE__*/ createWriteContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'setDefaultCommunityFee',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"setDefaultFee"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const writeAlgebraFactorySetDefaultFee =
  /*#__PURE__*/ createWriteContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'setDefaultFee',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"setDefaultPluginFactory"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const writeAlgebraFactorySetDefaultPluginFactory =
  /*#__PURE__*/ createWriteContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'setDefaultPluginFactory',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"setDefaultTickspacing"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const writeAlgebraFactorySetDefaultTickspacing =
  /*#__PURE__*/ createWriteContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'setDefaultTickspacing',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"setVaultFactory"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const writeAlgebraFactorySetVaultFactory =
  /*#__PURE__*/ createWriteContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'setVaultFactory',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"startRenounceOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const writeAlgebraFactoryStartRenounceOwnership =
  /*#__PURE__*/ createWriteContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'startRenounceOwnership',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"stopRenounceOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const writeAlgebraFactoryStopRenounceOwnership =
  /*#__PURE__*/ createWriteContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'stopRenounceOwnership',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const writeAlgebraFactoryTransferOwnership =
  /*#__PURE__*/ createWriteContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraFactoryAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const simulateAlgebraFactory = /*#__PURE__*/ createSimulateContract({
  abi: algebraFactoryAbi,
  address: algebraFactoryAddress,
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"acceptOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const simulateAlgebraFactoryAcceptOwnership =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'acceptOwnership',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"createCustomPool"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const simulateAlgebraFactoryCreateCustomPool =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'createCustomPool',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"createPool"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const simulateAlgebraFactoryCreatePool =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'createPool',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"grantRole"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const simulateAlgebraFactoryGrantRole =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const simulateAlgebraFactoryRenounceOwnership =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"renounceRole"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const simulateAlgebraFactoryRenounceRole =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"revokeRole"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const simulateAlgebraFactoryRevokeRole =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"setDefaultCommunityFee"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const simulateAlgebraFactorySetDefaultCommunityFee =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'setDefaultCommunityFee',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"setDefaultFee"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const simulateAlgebraFactorySetDefaultFee =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'setDefaultFee',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"setDefaultPluginFactory"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const simulateAlgebraFactorySetDefaultPluginFactory =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'setDefaultPluginFactory',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"setDefaultTickspacing"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const simulateAlgebraFactorySetDefaultTickspacing =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'setDefaultTickspacing',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"setVaultFactory"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const simulateAlgebraFactorySetVaultFactory =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'setVaultFactory',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"startRenounceOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const simulateAlgebraFactoryStartRenounceOwnership =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'startRenounceOwnership',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"stopRenounceOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const simulateAlgebraFactoryStopRenounceOwnership =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'stopRenounceOwnership',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const simulateAlgebraFactoryTransferOwnership =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link algebraFactoryAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const watchAlgebraFactoryEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: algebraFactoryAbi,
  address: algebraFactoryAddress,
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link algebraFactoryAbi}__ and `eventName` set to `"CustomPool"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const watchAlgebraFactoryCustomPoolEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    eventName: 'CustomPool',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link algebraFactoryAbi}__ and `eventName` set to `"DefaultCommunityFee"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const watchAlgebraFactoryDefaultCommunityFeeEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    eventName: 'DefaultCommunityFee',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link algebraFactoryAbi}__ and `eventName` set to `"DefaultFee"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const watchAlgebraFactoryDefaultFeeEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    eventName: 'DefaultFee',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link algebraFactoryAbi}__ and `eventName` set to `"DefaultPluginFactory"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const watchAlgebraFactoryDefaultPluginFactoryEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    eventName: 'DefaultPluginFactory',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link algebraFactoryAbi}__ and `eventName` set to `"DefaultTickspacing"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const watchAlgebraFactoryDefaultTickspacingEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    eventName: 'DefaultTickspacing',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link algebraFactoryAbi}__ and `eventName` set to `"OwnershipTransferStarted"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const watchAlgebraFactoryOwnershipTransferStartedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    eventName: 'OwnershipTransferStarted',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link algebraFactoryAbi}__ and `eventName` set to `"OwnershipTransferred"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const watchAlgebraFactoryOwnershipTransferredEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link algebraFactoryAbi}__ and `eventName` set to `"Pool"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const watchAlgebraFactoryPoolEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    eventName: 'Pool',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link algebraFactoryAbi}__ and `eventName` set to `"RenounceOwnershipFinish"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const watchAlgebraFactoryRenounceOwnershipFinishEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    eventName: 'RenounceOwnershipFinish',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link algebraFactoryAbi}__ and `eventName` set to `"RenounceOwnershipStart"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const watchAlgebraFactoryRenounceOwnershipStartEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    eventName: 'RenounceOwnershipStart',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link algebraFactoryAbi}__ and `eventName` set to `"RenounceOwnershipStop"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const watchAlgebraFactoryRenounceOwnershipStopEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    eventName: 'RenounceOwnershipStop',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link algebraFactoryAbi}__ and `eventName` set to `"RoleAdminChanged"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const watchAlgebraFactoryRoleAdminChangedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    eventName: 'RoleAdminChanged',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link algebraFactoryAbi}__ and `eventName` set to `"RoleGranted"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const watchAlgebraFactoryRoleGrantedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    eventName: 'RoleGranted',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link algebraFactoryAbi}__ and `eventName` set to `"RoleRevoked"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const watchAlgebraFactoryRoleRevokedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    eventName: 'RoleRevoked',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link algebraFactoryAbi}__ and `eventName` set to `"VaultFactory"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x10253594A832f967994b44f33411940533302ACb)
 */
export const watchAlgebraFactoryVaultFactoryEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    eventName: 'VaultFactory',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraPoolAbi}__
 */
export const readAlgebraPool = /*#__PURE__*/ createReadContract({
  abi: algebraPoolAbi,
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"communityVault"`
 */
export const readAlgebraPoolCommunityVault = /*#__PURE__*/ createReadContract({
  abi: algebraPoolAbi,
  functionName: 'communityVault',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"factory"`
 */
export const readAlgebraPoolFactory = /*#__PURE__*/ createReadContract({
  abi: algebraPoolAbi,
  functionName: 'factory',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"fee"`
 */
export const readAlgebraPoolFee = /*#__PURE__*/ createReadContract({
  abi: algebraPoolAbi,
  functionName: 'fee',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"getCommunityFeePending"`
 */
export const readAlgebraPoolGetCommunityFeePending =
  /*#__PURE__*/ createReadContract({
    abi: algebraPoolAbi,
    functionName: 'getCommunityFeePending',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"getPluginFeePending"`
 */
export const readAlgebraPoolGetPluginFeePending =
  /*#__PURE__*/ createReadContract({
    abi: algebraPoolAbi,
    functionName: 'getPluginFeePending',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"getReserves"`
 */
export const readAlgebraPoolGetReserves = /*#__PURE__*/ createReadContract({
  abi: algebraPoolAbi,
  functionName: 'getReserves',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"globalState"`
 */
export const readAlgebraPoolGlobalState = /*#__PURE__*/ createReadContract({
  abi: algebraPoolAbi,
  functionName: 'globalState',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"isUnlocked"`
 */
export const readAlgebraPoolIsUnlocked = /*#__PURE__*/ createReadContract({
  abi: algebraPoolAbi,
  functionName: 'isUnlocked',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"lastFeeTransferTimestamp"`
 */
export const readAlgebraPoolLastFeeTransferTimestamp =
  /*#__PURE__*/ createReadContract({
    abi: algebraPoolAbi,
    functionName: 'lastFeeTransferTimestamp',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"liquidity"`
 */
export const readAlgebraPoolLiquidity = /*#__PURE__*/ createReadContract({
  abi: algebraPoolAbi,
  functionName: 'liquidity',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"maxLiquidityPerTick"`
 */
export const readAlgebraPoolMaxLiquidityPerTick =
  /*#__PURE__*/ createReadContract({
    abi: algebraPoolAbi,
    functionName: 'maxLiquidityPerTick',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"nextTickGlobal"`
 */
export const readAlgebraPoolNextTickGlobal = /*#__PURE__*/ createReadContract({
  abi: algebraPoolAbi,
  functionName: 'nextTickGlobal',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"plugin"`
 */
export const readAlgebraPoolPlugin = /*#__PURE__*/ createReadContract({
  abi: algebraPoolAbi,
  functionName: 'plugin',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"positions"`
 */
export const readAlgebraPoolPositions = /*#__PURE__*/ createReadContract({
  abi: algebraPoolAbi,
  functionName: 'positions',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"prevTickGlobal"`
 */
export const readAlgebraPoolPrevTickGlobal = /*#__PURE__*/ createReadContract({
  abi: algebraPoolAbi,
  functionName: 'prevTickGlobal',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"safelyGetStateOfAMM"`
 */
export const readAlgebraPoolSafelyGetStateOfAmm =
  /*#__PURE__*/ createReadContract({
    abi: algebraPoolAbi,
    functionName: 'safelyGetStateOfAMM',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"tickSpacing"`
 */
export const readAlgebraPoolTickSpacing = /*#__PURE__*/ createReadContract({
  abi: algebraPoolAbi,
  functionName: 'tickSpacing',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"tickTable"`
 */
export const readAlgebraPoolTickTable = /*#__PURE__*/ createReadContract({
  abi: algebraPoolAbi,
  functionName: 'tickTable',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"tickTreeRoot"`
 */
export const readAlgebraPoolTickTreeRoot = /*#__PURE__*/ createReadContract({
  abi: algebraPoolAbi,
  functionName: 'tickTreeRoot',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"tickTreeSecondLayer"`
 */
export const readAlgebraPoolTickTreeSecondLayer =
  /*#__PURE__*/ createReadContract({
    abi: algebraPoolAbi,
    functionName: 'tickTreeSecondLayer',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"ticks"`
 */
export const readAlgebraPoolTicks = /*#__PURE__*/ createReadContract({
  abi: algebraPoolAbi,
  functionName: 'ticks',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"token0"`
 */
export const readAlgebraPoolToken0 = /*#__PURE__*/ createReadContract({
  abi: algebraPoolAbi,
  functionName: 'token0',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"token1"`
 */
export const readAlgebraPoolToken1 = /*#__PURE__*/ createReadContract({
  abi: algebraPoolAbi,
  functionName: 'token1',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"totalFeeGrowth0Token"`
 */
export const readAlgebraPoolTotalFeeGrowth0Token =
  /*#__PURE__*/ createReadContract({
    abi: algebraPoolAbi,
    functionName: 'totalFeeGrowth0Token',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"totalFeeGrowth1Token"`
 */
export const readAlgebraPoolTotalFeeGrowth1Token =
  /*#__PURE__*/ createReadContract({
    abi: algebraPoolAbi,
    functionName: 'totalFeeGrowth1Token',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraPoolAbi}__
 */
export const writeAlgebraPool = /*#__PURE__*/ createWriteContract({
  abi: algebraPoolAbi,
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"burn"`
 */
export const writeAlgebraPoolBurn = /*#__PURE__*/ createWriteContract({
  abi: algebraPoolAbi,
  functionName: 'burn',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"collect"`
 */
export const writeAlgebraPoolCollect = /*#__PURE__*/ createWriteContract({
  abi: algebraPoolAbi,
  functionName: 'collect',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"flash"`
 */
export const writeAlgebraPoolFlash = /*#__PURE__*/ createWriteContract({
  abi: algebraPoolAbi,
  functionName: 'flash',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"initialize"`
 */
export const writeAlgebraPoolInitialize = /*#__PURE__*/ createWriteContract({
  abi: algebraPoolAbi,
  functionName: 'initialize',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"mint"`
 */
export const writeAlgebraPoolMint = /*#__PURE__*/ createWriteContract({
  abi: algebraPoolAbi,
  functionName: 'mint',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"setCommunityFee"`
 */
export const writeAlgebraPoolSetCommunityFee =
  /*#__PURE__*/ createWriteContract({
    abi: algebraPoolAbi,
    functionName: 'setCommunityFee',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"setCommunityVault"`
 */
export const writeAlgebraPoolSetCommunityVault =
  /*#__PURE__*/ createWriteContract({
    abi: algebraPoolAbi,
    functionName: 'setCommunityVault',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"setFee"`
 */
export const writeAlgebraPoolSetFee = /*#__PURE__*/ createWriteContract({
  abi: algebraPoolAbi,
  functionName: 'setFee',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"setPlugin"`
 */
export const writeAlgebraPoolSetPlugin = /*#__PURE__*/ createWriteContract({
  abi: algebraPoolAbi,
  functionName: 'setPlugin',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"setPluginConfig"`
 */
export const writeAlgebraPoolSetPluginConfig =
  /*#__PURE__*/ createWriteContract({
    abi: algebraPoolAbi,
    functionName: 'setPluginConfig',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"setTickSpacing"`
 */
export const writeAlgebraPoolSetTickSpacing = /*#__PURE__*/ createWriteContract(
  { abi: algebraPoolAbi, functionName: 'setTickSpacing' },
)

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"skim"`
 */
export const writeAlgebraPoolSkim = /*#__PURE__*/ createWriteContract({
  abi: algebraPoolAbi,
  functionName: 'skim',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"swap"`
 */
export const writeAlgebraPoolSwap = /*#__PURE__*/ createWriteContract({
  abi: algebraPoolAbi,
  functionName: 'swap',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"swapWithPaymentInAdvance"`
 */
export const writeAlgebraPoolSwapWithPaymentInAdvance =
  /*#__PURE__*/ createWriteContract({
    abi: algebraPoolAbi,
    functionName: 'swapWithPaymentInAdvance',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"sync"`
 */
export const writeAlgebraPoolSync = /*#__PURE__*/ createWriteContract({
  abi: algebraPoolAbi,
  functionName: 'sync',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraPoolAbi}__
 */
export const simulateAlgebraPool = /*#__PURE__*/ createSimulateContract({
  abi: algebraPoolAbi,
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"burn"`
 */
export const simulateAlgebraPoolBurn = /*#__PURE__*/ createSimulateContract({
  abi: algebraPoolAbi,
  functionName: 'burn',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"collect"`
 */
export const simulateAlgebraPoolCollect = /*#__PURE__*/ createSimulateContract({
  abi: algebraPoolAbi,
  functionName: 'collect',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"flash"`
 */
export const simulateAlgebraPoolFlash = /*#__PURE__*/ createSimulateContract({
  abi: algebraPoolAbi,
  functionName: 'flash',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"initialize"`
 */
export const simulateAlgebraPoolInitialize =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraPoolAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"mint"`
 */
export const simulateAlgebraPoolMint = /*#__PURE__*/ createSimulateContract({
  abi: algebraPoolAbi,
  functionName: 'mint',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"setCommunityFee"`
 */
export const simulateAlgebraPoolSetCommunityFee =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraPoolAbi,
    functionName: 'setCommunityFee',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"setCommunityVault"`
 */
export const simulateAlgebraPoolSetCommunityVault =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraPoolAbi,
    functionName: 'setCommunityVault',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"setFee"`
 */
export const simulateAlgebraPoolSetFee = /*#__PURE__*/ createSimulateContract({
  abi: algebraPoolAbi,
  functionName: 'setFee',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"setPlugin"`
 */
export const simulateAlgebraPoolSetPlugin =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraPoolAbi,
    functionName: 'setPlugin',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"setPluginConfig"`
 */
export const simulateAlgebraPoolSetPluginConfig =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraPoolAbi,
    functionName: 'setPluginConfig',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"setTickSpacing"`
 */
export const simulateAlgebraPoolSetTickSpacing =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraPoolAbi,
    functionName: 'setTickSpacing',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"skim"`
 */
export const simulateAlgebraPoolSkim = /*#__PURE__*/ createSimulateContract({
  abi: algebraPoolAbi,
  functionName: 'skim',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"swap"`
 */
export const simulateAlgebraPoolSwap = /*#__PURE__*/ createSimulateContract({
  abi: algebraPoolAbi,
  functionName: 'swap',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"swapWithPaymentInAdvance"`
 */
export const simulateAlgebraPoolSwapWithPaymentInAdvance =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraPoolAbi,
    functionName: 'swapWithPaymentInAdvance',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"sync"`
 */
export const simulateAlgebraPoolSync = /*#__PURE__*/ createSimulateContract({
  abi: algebraPoolAbi,
  functionName: 'sync',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link algebraPoolAbi}__
 */
export const watchAlgebraPoolEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: algebraPoolAbi,
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link algebraPoolAbi}__ and `eventName` set to `"Burn"`
 */
export const watchAlgebraPoolBurnEvent = /*#__PURE__*/ createWatchContractEvent(
  { abi: algebraPoolAbi, eventName: 'Burn' },
)

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link algebraPoolAbi}__ and `eventName` set to `"Collect"`
 */
export const watchAlgebraPoolCollectEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: algebraPoolAbi,
    eventName: 'Collect',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link algebraPoolAbi}__ and `eventName` set to `"CommunityFee"`
 */
export const watchAlgebraPoolCommunityFeeEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: algebraPoolAbi,
    eventName: 'CommunityFee',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link algebraPoolAbi}__ and `eventName` set to `"CommunityVault"`
 */
export const watchAlgebraPoolCommunityVaultEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: algebraPoolAbi,
    eventName: 'CommunityVault',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link algebraPoolAbi}__ and `eventName` set to `"ExcessTokens"`
 */
export const watchAlgebraPoolExcessTokensEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: algebraPoolAbi,
    eventName: 'ExcessTokens',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link algebraPoolAbi}__ and `eventName` set to `"Fee"`
 */
export const watchAlgebraPoolFeeEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: algebraPoolAbi,
  eventName: 'Fee',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link algebraPoolAbi}__ and `eventName` set to `"Flash"`
 */
export const watchAlgebraPoolFlashEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: algebraPoolAbi,
    eventName: 'Flash',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link algebraPoolAbi}__ and `eventName` set to `"Initialize"`
 */
export const watchAlgebraPoolInitializeEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: algebraPoolAbi,
    eventName: 'Initialize',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link algebraPoolAbi}__ and `eventName` set to `"Mint"`
 */
export const watchAlgebraPoolMintEvent = /*#__PURE__*/ createWatchContractEvent(
  { abi: algebraPoolAbi, eventName: 'Mint' },
)

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link algebraPoolAbi}__ and `eventName` set to `"Plugin"`
 */
export const watchAlgebraPoolPluginEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: algebraPoolAbi,
    eventName: 'Plugin',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link algebraPoolAbi}__ and `eventName` set to `"PluginConfig"`
 */
export const watchAlgebraPoolPluginConfigEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: algebraPoolAbi,
    eventName: 'PluginConfig',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link algebraPoolAbi}__ and `eventName` set to `"Skim"`
 */
export const watchAlgebraPoolSkimEvent = /*#__PURE__*/ createWatchContractEvent(
  { abi: algebraPoolAbi, eventName: 'Skim' },
)

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link algebraPoolAbi}__ and `eventName` set to `"Swap"`
 */
export const watchAlgebraPoolSwapEvent = /*#__PURE__*/ createWatchContractEvent(
  { abi: algebraPoolAbi, eventName: 'Swap' },
)

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link algebraPoolAbi}__ and `eventName` set to `"TickSpacing"`
 */
export const watchAlgebraPoolTickSpacingEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: algebraPoolAbi,
    eventName: 'TickSpacing',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__
 */
export const readAlgebraVirtualPool = /*#__PURE__*/ createReadContract({
  abi: algebraVirtualPoolAbi,
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"FEE_WEIGHT_DENOMINATOR"`
 */
export const readAlgebraVirtualPoolFeeWeightDenominator =
  /*#__PURE__*/ createReadContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'FEE_WEIGHT_DENOMINATOR',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"RATE_CHANGE_FREQUENCY"`
 */
export const readAlgebraVirtualPoolRateChangeFrequency =
  /*#__PURE__*/ createReadContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'RATE_CHANGE_FREQUENCY',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"currentLiquidity"`
 */
export const readAlgebraVirtualPoolCurrentLiquidity =
  /*#__PURE__*/ createReadContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'currentLiquidity',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"deactivated"`
 */
export const readAlgebraVirtualPoolDeactivated =
  /*#__PURE__*/ createReadContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'deactivated',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"dynamicRateActivated"`
 */
export const readAlgebraVirtualPoolDynamicRateActivated =
  /*#__PURE__*/ createReadContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'dynamicRateActivated',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"farmingAddress"`
 */
export const readAlgebraVirtualPoolFarmingAddress =
  /*#__PURE__*/ createReadContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'farmingAddress',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"feeWeights"`
 */
export const readAlgebraVirtualPoolFeeWeights =
  /*#__PURE__*/ createReadContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'feeWeights',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"getInnerRewardsGrowth"`
 */
export const readAlgebraVirtualPoolGetInnerRewardsGrowth =
  /*#__PURE__*/ createReadContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'getInnerRewardsGrowth',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"globalTick"`
 */
export const readAlgebraVirtualPoolGlobalTick =
  /*#__PURE__*/ createReadContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'globalTick',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"plugin"`
 */
export const readAlgebraVirtualPoolPlugin = /*#__PURE__*/ createReadContract({
  abi: algebraVirtualPoolAbi,
  functionName: 'plugin',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"prevTimestamp"`
 */
export const readAlgebraVirtualPoolPrevTimestamp =
  /*#__PURE__*/ createReadContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'prevTimestamp',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"rateLimits"`
 */
export const readAlgebraVirtualPoolRateLimits =
  /*#__PURE__*/ createReadContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'rateLimits',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"rewardRates"`
 */
export const readAlgebraVirtualPoolRewardRates =
  /*#__PURE__*/ createReadContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'rewardRates',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"rewardReserves"`
 */
export const readAlgebraVirtualPoolRewardReserves =
  /*#__PURE__*/ createReadContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'rewardReserves',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"ticks"`
 */
export const readAlgebraVirtualPoolTicks = /*#__PURE__*/ createReadContract({
  abi: algebraVirtualPoolAbi,
  functionName: 'ticks',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"totalRewardGrowth"`
 */
export const readAlgebraVirtualPoolTotalRewardGrowth =
  /*#__PURE__*/ createReadContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'totalRewardGrowth',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__
 */
export const writeAlgebraVirtualPool = /*#__PURE__*/ createWriteContract({
  abi: algebraVirtualPoolAbi,
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"addRewards"`
 */
export const writeAlgebraVirtualPoolAddRewards =
  /*#__PURE__*/ createWriteContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'addRewards',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"applyLiquidityDeltaToPosition"`
 */
export const writeAlgebraVirtualPoolApplyLiquidityDeltaToPosition =
  /*#__PURE__*/ createWriteContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'applyLiquidityDeltaToPosition',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"crossTo"`
 */
export const writeAlgebraVirtualPoolCrossTo = /*#__PURE__*/ createWriteContract(
  { abi: algebraVirtualPoolAbi, functionName: 'crossTo' },
)

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"deactivate"`
 */
export const writeAlgebraVirtualPoolDeactivate =
  /*#__PURE__*/ createWriteContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'deactivate',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"decreaseRewards"`
 */
export const writeAlgebraVirtualPoolDecreaseRewards =
  /*#__PURE__*/ createWriteContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'decreaseRewards',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"distributeRewards"`
 */
export const writeAlgebraVirtualPoolDistributeRewards =
  /*#__PURE__*/ createWriteContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'distributeRewards',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"setDynamicRateLimits"`
 */
export const writeAlgebraVirtualPoolSetDynamicRateLimits =
  /*#__PURE__*/ createWriteContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'setDynamicRateLimits',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"setRates"`
 */
export const writeAlgebraVirtualPoolSetRates =
  /*#__PURE__*/ createWriteContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'setRates',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"setWeights"`
 */
export const writeAlgebraVirtualPoolSetWeights =
  /*#__PURE__*/ createWriteContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'setWeights',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"switchDynamicRate"`
 */
export const writeAlgebraVirtualPoolSwitchDynamicRate =
  /*#__PURE__*/ createWriteContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'switchDynamicRate',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__
 */
export const simulateAlgebraVirtualPool = /*#__PURE__*/ createSimulateContract({
  abi: algebraVirtualPoolAbi,
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"addRewards"`
 */
export const simulateAlgebraVirtualPoolAddRewards =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'addRewards',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"applyLiquidityDeltaToPosition"`
 */
export const simulateAlgebraVirtualPoolApplyLiquidityDeltaToPosition =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'applyLiquidityDeltaToPosition',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"crossTo"`
 */
export const simulateAlgebraVirtualPoolCrossTo =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'crossTo',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"deactivate"`
 */
export const simulateAlgebraVirtualPoolDeactivate =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'deactivate',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"decreaseRewards"`
 */
export const simulateAlgebraVirtualPoolDecreaseRewards =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'decreaseRewards',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"distributeRewards"`
 */
export const simulateAlgebraVirtualPoolDistributeRewards =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'distributeRewards',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"setDynamicRateLimits"`
 */
export const simulateAlgebraVirtualPoolSetDynamicRateLimits =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'setDynamicRateLimits',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"setRates"`
 */
export const simulateAlgebraVirtualPoolSetRates =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'setRates',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"setWeights"`
 */
export const simulateAlgebraVirtualPoolSetWeights =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'setWeights',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"switchDynamicRate"`
 */
export const simulateAlgebraVirtualPoolSwitchDynamicRate =
  /*#__PURE__*/ createSimulateContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'switchDynamicRate',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link farmingCenterAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA)
 */
export const readFarmingCenter = /*#__PURE__*/ createReadContract({
  abi: farmingCenterAbi,
  address: farmingCenterAddress,
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"algebraPoolDeployer"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA)
 */
export const readFarmingCenterAlgebraPoolDeployer =
  /*#__PURE__*/ createReadContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'algebraPoolDeployer',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"deposits"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA)
 */
export const readFarmingCenterDeposits = /*#__PURE__*/ createReadContract({
  abi: farmingCenterAbi,
  address: farmingCenterAddress,
  functionName: 'deposits',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"eternalFarming"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA)
 */
export const readFarmingCenterEternalFarming = /*#__PURE__*/ createReadContract(
  {
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'eternalFarming',
  },
)

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"incentiveKeys"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA)
 */
export const readFarmingCenterIncentiveKeys = /*#__PURE__*/ createReadContract({
  abi: farmingCenterAbi,
  address: farmingCenterAddress,
  functionName: 'incentiveKeys',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"nonfungiblePositionManager"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA)
 */
export const readFarmingCenterNonfungiblePositionManager =
  /*#__PURE__*/ createReadContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'nonfungiblePositionManager',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"virtualPoolAddresses"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA)
 */
export const readFarmingCenterVirtualPoolAddresses =
  /*#__PURE__*/ createReadContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'virtualPoolAddresses',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link farmingCenterAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA)
 */
export const writeFarmingCenter = /*#__PURE__*/ createWriteContract({
  abi: farmingCenterAbi,
  address: farmingCenterAddress,
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"applyLiquidityDelta"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA)
 */
export const writeFarmingCenterApplyLiquidityDelta =
  /*#__PURE__*/ createWriteContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'applyLiquidityDelta',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"claimReward"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA)
 */
export const writeFarmingCenterClaimReward = /*#__PURE__*/ createWriteContract({
  abi: farmingCenterAbi,
  address: farmingCenterAddress,
  functionName: 'claimReward',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"collectRewards"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA)
 */
export const writeFarmingCenterCollectRewards =
  /*#__PURE__*/ createWriteContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'collectRewards',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"connectVirtualPoolToPlugin"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA)
 */
export const writeFarmingCenterConnectVirtualPoolToPlugin =
  /*#__PURE__*/ createWriteContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'connectVirtualPoolToPlugin',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"disconnectVirtualPoolFromPlugin"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA)
 */
export const writeFarmingCenterDisconnectVirtualPoolFromPlugin =
  /*#__PURE__*/ createWriteContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'disconnectVirtualPoolFromPlugin',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"enterFarming"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA)
 */
export const writeFarmingCenterEnterFarming = /*#__PURE__*/ createWriteContract(
  {
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'enterFarming',
  },
)

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"exitFarming"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA)
 */
export const writeFarmingCenterExitFarming = /*#__PURE__*/ createWriteContract({
  abi: farmingCenterAbi,
  address: farmingCenterAddress,
  functionName: 'exitFarming',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"multicall"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA)
 */
export const writeFarmingCenterMulticall = /*#__PURE__*/ createWriteContract({
  abi: farmingCenterAbi,
  address: farmingCenterAddress,
  functionName: 'multicall',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link farmingCenterAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA)
 */
export const simulateFarmingCenter = /*#__PURE__*/ createSimulateContract({
  abi: farmingCenterAbi,
  address: farmingCenterAddress,
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"applyLiquidityDelta"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA)
 */
export const simulateFarmingCenterApplyLiquidityDelta =
  /*#__PURE__*/ createSimulateContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'applyLiquidityDelta',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"claimReward"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA)
 */
export const simulateFarmingCenterClaimReward =
  /*#__PURE__*/ createSimulateContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'claimReward',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"collectRewards"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA)
 */
export const simulateFarmingCenterCollectRewards =
  /*#__PURE__*/ createSimulateContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'collectRewards',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"connectVirtualPoolToPlugin"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA)
 */
export const simulateFarmingCenterConnectVirtualPoolToPlugin =
  /*#__PURE__*/ createSimulateContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'connectVirtualPoolToPlugin',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"disconnectVirtualPoolFromPlugin"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA)
 */
export const simulateFarmingCenterDisconnectVirtualPoolFromPlugin =
  /*#__PURE__*/ createSimulateContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'disconnectVirtualPoolFromPlugin',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"enterFarming"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA)
 */
export const simulateFarmingCenterEnterFarming =
  /*#__PURE__*/ createSimulateContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'enterFarming',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"exitFarming"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA)
 */
export const simulateFarmingCenterExitFarming =
  /*#__PURE__*/ createSimulateContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'exitFarming',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"multicall"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA)
 */
export const simulateFarmingCenterMulticall =
  /*#__PURE__*/ createSimulateContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'multicall',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link limitOrderManagerAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readLimitOrderManager = /*#__PURE__*/ createReadContract({
  abi: limitOrderManagerAbi,
  address: limitOrderManagerAddress,
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `functionName` set to `"ALGEBRA_BASE_PLUGIN_MANAGER"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readLimitOrderManagerAlgebraBasePluginManager =
  /*#__PURE__*/ createReadContract({
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
    functionName: 'ALGEBRA_BASE_PLUGIN_MANAGER',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `functionName` set to `"basePluginFactory"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readLimitOrderManagerBasePluginFactory =
  /*#__PURE__*/ createReadContract({
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
    functionName: 'basePluginFactory',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `functionName` set to `"epochInfos"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readLimitOrderManagerEpochInfos = /*#__PURE__*/ createReadContract(
  {
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
    functionName: 'epochInfos',
  },
)

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `functionName` set to `"epochNext"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readLimitOrderManagerEpochNext = /*#__PURE__*/ createReadContract({
  abi: limitOrderManagerAbi,
  address: limitOrderManagerAddress,
  functionName: 'epochNext',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `functionName` set to `"epochs"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readLimitOrderManagerEpochs = /*#__PURE__*/ createReadContract({
  abi: limitOrderManagerAbi,
  address: limitOrderManagerAddress,
  functionName: 'epochs',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `functionName` set to `"factory"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readLimitOrderManagerFactory = /*#__PURE__*/ createReadContract({
  abi: limitOrderManagerAbi,
  address: limitOrderManagerAddress,
  functionName: 'factory',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `functionName` set to `"getEpoch"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readLimitOrderManagerGetEpoch = /*#__PURE__*/ createReadContract({
  abi: limitOrderManagerAbi,
  address: limitOrderManagerAddress,
  functionName: 'getEpoch',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `functionName` set to `"getEpochLiquidity"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readLimitOrderManagerGetEpochLiquidity =
  /*#__PURE__*/ createReadContract({
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
    functionName: 'getEpochLiquidity',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `functionName` set to `"initialized"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readLimitOrderManagerInitialized =
  /*#__PURE__*/ createReadContract({
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
    functionName: 'initialized',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `functionName` set to `"poolDeployer"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readLimitOrderManagerPoolDeployer =
  /*#__PURE__*/ createReadContract({
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
    functionName: 'poolDeployer',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `functionName` set to `"tickLowerLasts"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readLimitOrderManagerTickLowerLasts =
  /*#__PURE__*/ createReadContract({
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
    functionName: 'tickLowerLasts',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `functionName` set to `"tickSpacings"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readLimitOrderManagerTickSpacings =
  /*#__PURE__*/ createReadContract({
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
    functionName: 'tickSpacings',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `functionName` set to `"wNativeToken"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readLimitOrderManagerWNativeToken =
  /*#__PURE__*/ createReadContract({
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
    functionName: 'wNativeToken',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link limitOrderManagerAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeLimitOrderManager = /*#__PURE__*/ createWriteContract({
  abi: limitOrderManagerAbi,
  address: limitOrderManagerAddress,
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `functionName` set to `"afterSwap"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeLimitOrderManagerAfterSwap =
  /*#__PURE__*/ createWriteContract({
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
    functionName: 'afterSwap',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `functionName` set to `"algebraMintCallback"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeLimitOrderManagerAlgebraMintCallback =
  /*#__PURE__*/ createWriteContract({
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
    functionName: 'algebraMintCallback',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `functionName` set to `"kill"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeLimitOrderManagerKill = /*#__PURE__*/ createWriteContract({
  abi: limitOrderManagerAbi,
  address: limitOrderManagerAddress,
  functionName: 'kill',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `functionName` set to `"place"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeLimitOrderManagerPlace = /*#__PURE__*/ createWriteContract({
  abi: limitOrderManagerAbi,
  address: limitOrderManagerAddress,
  functionName: 'place',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `functionName` set to `"setTickSpacing"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeLimitOrderManagerSetTickSpacing =
  /*#__PURE__*/ createWriteContract({
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
    functionName: 'setTickSpacing',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `functionName` set to `"withdraw"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeLimitOrderManagerWithdraw = /*#__PURE__*/ createWriteContract(
  {
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
    functionName: 'withdraw',
  },
)

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link limitOrderManagerAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateLimitOrderManager = /*#__PURE__*/ createSimulateContract({
  abi: limitOrderManagerAbi,
  address: limitOrderManagerAddress,
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `functionName` set to `"afterSwap"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateLimitOrderManagerAfterSwap =
  /*#__PURE__*/ createSimulateContract({
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
    functionName: 'afterSwap',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `functionName` set to `"algebraMintCallback"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateLimitOrderManagerAlgebraMintCallback =
  /*#__PURE__*/ createSimulateContract({
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
    functionName: 'algebraMintCallback',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `functionName` set to `"kill"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateLimitOrderManagerKill =
  /*#__PURE__*/ createSimulateContract({
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
    functionName: 'kill',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `functionName` set to `"place"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateLimitOrderManagerPlace =
  /*#__PURE__*/ createSimulateContract({
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
    functionName: 'place',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `functionName` set to `"setTickSpacing"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateLimitOrderManagerSetTickSpacing =
  /*#__PURE__*/ createSimulateContract({
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
    functionName: 'setTickSpacing',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `functionName` set to `"withdraw"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateLimitOrderManagerWithdraw =
  /*#__PURE__*/ createSimulateContract({
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
    functionName: 'withdraw',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link limitOrderManagerAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const watchLimitOrderManagerEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `eventName` set to `"Fill"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const watchLimitOrderManagerFillEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
    eventName: 'Fill',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `eventName` set to `"Kill"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const watchLimitOrderManagerKillEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
    eventName: 'Kill',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `eventName` set to `"LimitOrderTickSpacing"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const watchLimitOrderManagerLimitOrderTickSpacingEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
    eventName: 'LimitOrderTickSpacing',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `eventName` set to `"Place"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const watchLimitOrderManagerPlaceEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
    eventName: 'Place',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link limitOrderManagerAbi}__ and `eventName` set to `"Withdraw"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const watchLimitOrderManagerWithdrawEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: limitOrderManagerAbi,
    address: limitOrderManagerAddress,
    eventName: 'Withdraw',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const readNonfungiblePositionManager = /*#__PURE__*/ createReadContract({
  abi: nonfungiblePositionManagerAbi,
  address: nonfungiblePositionManagerAddress,
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"DOMAIN_SEPARATOR"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const readNonfungiblePositionManagerDomainSeparator =
  /*#__PURE__*/ createReadContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'DOMAIN_SEPARATOR',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"NONFUNGIBLE_POSITION_MANAGER_ADMINISTRATOR_ROLE"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const readNonfungiblePositionManagerNonfungiblePositionManagerAdministratorRole =
  /*#__PURE__*/ createReadContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'NONFUNGIBLE_POSITION_MANAGER_ADMINISTRATOR_ROLE',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"PERMIT_TYPEHASH"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const readNonfungiblePositionManagerPermitTypehash =
  /*#__PURE__*/ createReadContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'PERMIT_TYPEHASH',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"WNativeToken"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const readNonfungiblePositionManagerWNativeToken =
  /*#__PURE__*/ createReadContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'WNativeToken',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"balanceOf"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const readNonfungiblePositionManagerBalanceOf =
  /*#__PURE__*/ createReadContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'balanceOf',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"factory"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const readNonfungiblePositionManagerFactory =
  /*#__PURE__*/ createReadContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'factory',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"farmingApprovals"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const readNonfungiblePositionManagerFarmingApprovals =
  /*#__PURE__*/ createReadContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'farmingApprovals',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"farmingCenter"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const readNonfungiblePositionManagerFarmingCenter =
  /*#__PURE__*/ createReadContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'farmingCenter',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"getApproved"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const readNonfungiblePositionManagerGetApproved =
  /*#__PURE__*/ createReadContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'getApproved',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"isApprovedForAll"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const readNonfungiblePositionManagerIsApprovedForAll =
  /*#__PURE__*/ createReadContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'isApprovedForAll',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"isApprovedOrOwner"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const readNonfungiblePositionManagerIsApprovedOrOwner =
  /*#__PURE__*/ createReadContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'isApprovedOrOwner',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"name"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const readNonfungiblePositionManagerName =
  /*#__PURE__*/ createReadContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'name',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"ownerOf"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const readNonfungiblePositionManagerOwnerOf =
  /*#__PURE__*/ createReadContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'ownerOf',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"poolDeployer"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const readNonfungiblePositionManagerPoolDeployer =
  /*#__PURE__*/ createReadContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'poolDeployer',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"positions"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const readNonfungiblePositionManagerPositions =
  /*#__PURE__*/ createReadContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'positions',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"supportsInterface"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const readNonfungiblePositionManagerSupportsInterface =
  /*#__PURE__*/ createReadContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"symbol"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const readNonfungiblePositionManagerSymbol =
  /*#__PURE__*/ createReadContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'symbol',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"tokenByIndex"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const readNonfungiblePositionManagerTokenByIndex =
  /*#__PURE__*/ createReadContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'tokenByIndex',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"tokenFarmedIn"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const readNonfungiblePositionManagerTokenFarmedIn =
  /*#__PURE__*/ createReadContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'tokenFarmedIn',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"tokenOfOwnerByIndex"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const readNonfungiblePositionManagerTokenOfOwnerByIndex =
  /*#__PURE__*/ createReadContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'tokenOfOwnerByIndex',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"tokenURI"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const readNonfungiblePositionManagerTokenUri =
  /*#__PURE__*/ createReadContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'tokenURI',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"totalSupply"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const readNonfungiblePositionManagerTotalSupply =
  /*#__PURE__*/ createReadContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'totalSupply',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const writeNonfungiblePositionManager =
  /*#__PURE__*/ createWriteContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"algebraMintCallback"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const writeNonfungiblePositionManagerAlgebraMintCallback =
  /*#__PURE__*/ createWriteContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'algebraMintCallback',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"approve"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const writeNonfungiblePositionManagerApprove =
  /*#__PURE__*/ createWriteContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'approve',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"approveForFarming"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const writeNonfungiblePositionManagerApproveForFarming =
  /*#__PURE__*/ createWriteContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'approveForFarming',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"burn"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const writeNonfungiblePositionManagerBurn =
  /*#__PURE__*/ createWriteContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'burn',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"collect"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const writeNonfungiblePositionManagerCollect =
  /*#__PURE__*/ createWriteContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'collect',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"createAndInitializePoolIfNecessary"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const writeNonfungiblePositionManagerCreateAndInitializePoolIfNecessary =
  /*#__PURE__*/ createWriteContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'createAndInitializePoolIfNecessary',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"decreaseLiquidity"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const writeNonfungiblePositionManagerDecreaseLiquidity =
  /*#__PURE__*/ createWriteContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'decreaseLiquidity',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"increaseLiquidity"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const writeNonfungiblePositionManagerIncreaseLiquidity =
  /*#__PURE__*/ createWriteContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'increaseLiquidity',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"mint"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const writeNonfungiblePositionManagerMint =
  /*#__PURE__*/ createWriteContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'mint',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"multicall"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const writeNonfungiblePositionManagerMulticall =
  /*#__PURE__*/ createWriteContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'multicall',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"permit"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const writeNonfungiblePositionManagerPermit =
  /*#__PURE__*/ createWriteContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'permit',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"refundNativeToken"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const writeNonfungiblePositionManagerRefundNativeToken =
  /*#__PURE__*/ createWriteContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'refundNativeToken',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"safeTransferFrom"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const writeNonfungiblePositionManagerSafeTransferFrom =
  /*#__PURE__*/ createWriteContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'safeTransferFrom',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"selfPermit"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const writeNonfungiblePositionManagerSelfPermit =
  /*#__PURE__*/ createWriteContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'selfPermit',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"selfPermitAllowed"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const writeNonfungiblePositionManagerSelfPermitAllowed =
  /*#__PURE__*/ createWriteContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'selfPermitAllowed',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"selfPermitAllowedIfNecessary"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const writeNonfungiblePositionManagerSelfPermitAllowedIfNecessary =
  /*#__PURE__*/ createWriteContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'selfPermitAllowedIfNecessary',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"selfPermitIfNecessary"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const writeNonfungiblePositionManagerSelfPermitIfNecessary =
  /*#__PURE__*/ createWriteContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'selfPermitIfNecessary',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"setApprovalForAll"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const writeNonfungiblePositionManagerSetApprovalForAll =
  /*#__PURE__*/ createWriteContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'setApprovalForAll',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"setFarmingCenter"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const writeNonfungiblePositionManagerSetFarmingCenter =
  /*#__PURE__*/ createWriteContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'setFarmingCenter',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"sweepToken"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const writeNonfungiblePositionManagerSweepToken =
  /*#__PURE__*/ createWriteContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'sweepToken',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"switchFarmingStatus"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const writeNonfungiblePositionManagerSwitchFarmingStatus =
  /*#__PURE__*/ createWriteContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'switchFarmingStatus',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"transferFrom"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const writeNonfungiblePositionManagerTransferFrom =
  /*#__PURE__*/ createWriteContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"unwrapWNativeToken"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const writeNonfungiblePositionManagerUnwrapWNativeToken =
  /*#__PURE__*/ createWriteContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'unwrapWNativeToken',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const simulateNonfungiblePositionManager =
  /*#__PURE__*/ createSimulateContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"algebraMintCallback"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const simulateNonfungiblePositionManagerAlgebraMintCallback =
  /*#__PURE__*/ createSimulateContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'algebraMintCallback',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"approve"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const simulateNonfungiblePositionManagerApprove =
  /*#__PURE__*/ createSimulateContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'approve',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"approveForFarming"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const simulateNonfungiblePositionManagerApproveForFarming =
  /*#__PURE__*/ createSimulateContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'approveForFarming',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"burn"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const simulateNonfungiblePositionManagerBurn =
  /*#__PURE__*/ createSimulateContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'burn',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"collect"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const simulateNonfungiblePositionManagerCollect =
  /*#__PURE__*/ createSimulateContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'collect',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"createAndInitializePoolIfNecessary"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const simulateNonfungiblePositionManagerCreateAndInitializePoolIfNecessary =
  /*#__PURE__*/ createSimulateContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'createAndInitializePoolIfNecessary',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"decreaseLiquidity"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const simulateNonfungiblePositionManagerDecreaseLiquidity =
  /*#__PURE__*/ createSimulateContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'decreaseLiquidity',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"increaseLiquidity"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const simulateNonfungiblePositionManagerIncreaseLiquidity =
  /*#__PURE__*/ createSimulateContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'increaseLiquidity',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"mint"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const simulateNonfungiblePositionManagerMint =
  /*#__PURE__*/ createSimulateContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'mint',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"multicall"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const simulateNonfungiblePositionManagerMulticall =
  /*#__PURE__*/ createSimulateContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'multicall',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"permit"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const simulateNonfungiblePositionManagerPermit =
  /*#__PURE__*/ createSimulateContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'permit',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"refundNativeToken"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const simulateNonfungiblePositionManagerRefundNativeToken =
  /*#__PURE__*/ createSimulateContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'refundNativeToken',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"safeTransferFrom"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const simulateNonfungiblePositionManagerSafeTransferFrom =
  /*#__PURE__*/ createSimulateContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'safeTransferFrom',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"selfPermit"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const simulateNonfungiblePositionManagerSelfPermit =
  /*#__PURE__*/ createSimulateContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'selfPermit',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"selfPermitAllowed"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const simulateNonfungiblePositionManagerSelfPermitAllowed =
  /*#__PURE__*/ createSimulateContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'selfPermitAllowed',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"selfPermitAllowedIfNecessary"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const simulateNonfungiblePositionManagerSelfPermitAllowedIfNecessary =
  /*#__PURE__*/ createSimulateContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'selfPermitAllowedIfNecessary',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"selfPermitIfNecessary"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const simulateNonfungiblePositionManagerSelfPermitIfNecessary =
  /*#__PURE__*/ createSimulateContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'selfPermitIfNecessary',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"setApprovalForAll"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const simulateNonfungiblePositionManagerSetApprovalForAll =
  /*#__PURE__*/ createSimulateContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'setApprovalForAll',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"setFarmingCenter"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const simulateNonfungiblePositionManagerSetFarmingCenter =
  /*#__PURE__*/ createSimulateContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'setFarmingCenter',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"sweepToken"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const simulateNonfungiblePositionManagerSweepToken =
  /*#__PURE__*/ createSimulateContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'sweepToken',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"switchFarmingStatus"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const simulateNonfungiblePositionManagerSwitchFarmingStatus =
  /*#__PURE__*/ createSimulateContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'switchFarmingStatus',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"transferFrom"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const simulateNonfungiblePositionManagerTransferFrom =
  /*#__PURE__*/ createSimulateContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `functionName` set to `"unwrapWNativeToken"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const simulateNonfungiblePositionManagerUnwrapWNativeToken =
  /*#__PURE__*/ createSimulateContract({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    functionName: 'unwrapWNativeToken',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const watchNonfungiblePositionManagerEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `eventName` set to `"Approval"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const watchNonfungiblePositionManagerApprovalEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `eventName` set to `"ApprovalForAll"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const watchNonfungiblePositionManagerApprovalForAllEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    eventName: 'ApprovalForAll',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `eventName` set to `"Collect"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const watchNonfungiblePositionManagerCollectEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    eventName: 'Collect',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `eventName` set to `"DecreaseLiquidity"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const watchNonfungiblePositionManagerDecreaseLiquidityEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    eventName: 'DecreaseLiquidity',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `eventName` set to `"FarmingFailed"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const watchNonfungiblePositionManagerFarmingFailedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    eventName: 'FarmingFailed',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `eventName` set to `"IncreaseLiquidity"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const watchNonfungiblePositionManagerIncreaseLiquidityEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    eventName: 'IncreaseLiquidity',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nonfungiblePositionManagerAbi}__ and `eventName` set to `"Transfer"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C)
 */
export const watchNonfungiblePositionManagerTransferEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: nonfungiblePositionManagerAbi,
    address: nonfungiblePositionManagerAddress,
    eventName: 'Transfer',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link quoterV2Abi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x13fcE0acbe6Fb11641ab753212550574CaD31415)
 */
export const readQuoterV2 = /*#__PURE__*/ createReadContract({
  abi: quoterV2Abi,
  address: quoterV2Address,
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link quoterV2Abi}__ and `functionName` set to `"WNativeToken"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x13fcE0acbe6Fb11641ab753212550574CaD31415)
 */
export const readQuoterV2WNativeToken = /*#__PURE__*/ createReadContract({
  abi: quoterV2Abi,
  address: quoterV2Address,
  functionName: 'WNativeToken',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link quoterV2Abi}__ and `functionName` set to `"algebraSwapCallback"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x13fcE0acbe6Fb11641ab753212550574CaD31415)
 */
export const readQuoterV2AlgebraSwapCallback = /*#__PURE__*/ createReadContract(
  {
    abi: quoterV2Abi,
    address: quoterV2Address,
    functionName: 'algebraSwapCallback',
  },
)

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link quoterV2Abi}__ and `functionName` set to `"factory"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x13fcE0acbe6Fb11641ab753212550574CaD31415)
 */
export const readQuoterV2Factory = /*#__PURE__*/ createReadContract({
  abi: quoterV2Abi,
  address: quoterV2Address,
  functionName: 'factory',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link quoterV2Abi}__ and `functionName` set to `"poolDeployer"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x13fcE0acbe6Fb11641ab753212550574CaD31415)
 */
export const readQuoterV2PoolDeployer = /*#__PURE__*/ createReadContract({
  abi: quoterV2Abi,
  address: quoterV2Address,
  functionName: 'poolDeployer',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link quoterV2Abi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x13fcE0acbe6Fb11641ab753212550574CaD31415)
 */
export const writeQuoterV2 = /*#__PURE__*/ createWriteContract({
  abi: quoterV2Abi,
  address: quoterV2Address,
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link quoterV2Abi}__ and `functionName` set to `"quoteExactInput"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x13fcE0acbe6Fb11641ab753212550574CaD31415)
 */
export const writeQuoterV2QuoteExactInput = /*#__PURE__*/ createWriteContract({
  abi: quoterV2Abi,
  address: quoterV2Address,
  functionName: 'quoteExactInput',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link quoterV2Abi}__ and `functionName` set to `"quoteExactInputSingle"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x13fcE0acbe6Fb11641ab753212550574CaD31415)
 */
export const writeQuoterV2QuoteExactInputSingle =
  /*#__PURE__*/ createWriteContract({
    abi: quoterV2Abi,
    address: quoterV2Address,
    functionName: 'quoteExactInputSingle',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link quoterV2Abi}__ and `functionName` set to `"quoteExactOutput"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x13fcE0acbe6Fb11641ab753212550574CaD31415)
 */
export const writeQuoterV2QuoteExactOutput = /*#__PURE__*/ createWriteContract({
  abi: quoterV2Abi,
  address: quoterV2Address,
  functionName: 'quoteExactOutput',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link quoterV2Abi}__ and `functionName` set to `"quoteExactOutputSingle"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x13fcE0acbe6Fb11641ab753212550574CaD31415)
 */
export const writeQuoterV2QuoteExactOutputSingle =
  /*#__PURE__*/ createWriteContract({
    abi: quoterV2Abi,
    address: quoterV2Address,
    functionName: 'quoteExactOutputSingle',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link quoterV2Abi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x13fcE0acbe6Fb11641ab753212550574CaD31415)
 */
export const simulateQuoterV2 = /*#__PURE__*/ createSimulateContract({
  abi: quoterV2Abi,
  address: quoterV2Address,
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link quoterV2Abi}__ and `functionName` set to `"quoteExactInput"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x13fcE0acbe6Fb11641ab753212550574CaD31415)
 */
export const simulateQuoterV2QuoteExactInput =
  /*#__PURE__*/ createSimulateContract({
    abi: quoterV2Abi,
    address: quoterV2Address,
    functionName: 'quoteExactInput',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link quoterV2Abi}__ and `functionName` set to `"quoteExactInputSingle"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x13fcE0acbe6Fb11641ab753212550574CaD31415)
 */
export const simulateQuoterV2QuoteExactInputSingle =
  /*#__PURE__*/ createSimulateContract({
    abi: quoterV2Abi,
    address: quoterV2Address,
    functionName: 'quoteExactInputSingle',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link quoterV2Abi}__ and `functionName` set to `"quoteExactOutput"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x13fcE0acbe6Fb11641ab753212550574CaD31415)
 */
export const simulateQuoterV2QuoteExactOutput =
  /*#__PURE__*/ createSimulateContract({
    abi: quoterV2Abi,
    address: quoterV2Address,
    functionName: 'quoteExactOutput',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link quoterV2Abi}__ and `functionName` set to `"quoteExactOutputSingle"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x13fcE0acbe6Fb11641ab753212550574CaD31415)
 */
export const simulateQuoterV2QuoteExactOutputSingle =
  /*#__PURE__*/ createSimulateContract({
    abi: quoterV2Abi,
    address: quoterV2Address,
    functionName: 'quoteExactOutputSingle',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link rebaseRewardAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readRebaseReward = /*#__PURE__*/ createReadContract({
  abi: rebaseRewardAbi,
  address: rebaseRewardAddress,
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"DEFAULT_ADMIN_ROLE"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readRebaseRewardDefaultAdminRole =
  /*#__PURE__*/ createReadContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'DEFAULT_ADMIN_ROLE',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"DURATION"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readRebaseRewardDuration = /*#__PURE__*/ createReadContract({
  abi: rebaseRewardAbi,
  address: rebaseRewardAddress,
  functionName: 'DURATION',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"NOTIFY_ROLE"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readRebaseRewardNotifyRole = /*#__PURE__*/ createReadContract({
  abi: rebaseRewardAbi,
  address: rebaseRewardAddress,
  functionName: 'NOTIFY_ROLE',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"PRECISION"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readRebaseRewardPrecision = /*#__PURE__*/ createReadContract({
  abi: rebaseRewardAbi,
  address: rebaseRewardAddress,
  functionName: 'PRECISION',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"UPGRADE_INTERFACE_VERSION"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readRebaseRewardUpgradeInterfaceVersion =
  /*#__PURE__*/ createReadContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'UPGRADE_INTERFACE_VERSION',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"earnedForPeriod"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readRebaseRewardEarnedForPeriod = /*#__PURE__*/ createReadContract(
  {
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'earnedForPeriod',
  },
)

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"earnedForToken"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readRebaseRewardEarnedForToken = /*#__PURE__*/ createReadContract({
  abi: rebaseRewardAbi,
  address: rebaseRewardAddress,
  functionName: 'earnedForToken',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"earnedForTokenId"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readRebaseRewardEarnedForTokenId =
  /*#__PURE__*/ createReadContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'earnedForTokenId',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"getCurrentPeriod"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readRebaseRewardGetCurrentPeriod =
  /*#__PURE__*/ createReadContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'getCurrentPeriod',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"getRewardList"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readRebaseRewardGetRewardList = /*#__PURE__*/ createReadContract({
  abi: rebaseRewardAbi,
  address: rebaseRewardAddress,
  functionName: 'getRewardList',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"getRoleAdmin"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readRebaseRewardGetRoleAdmin = /*#__PURE__*/ createReadContract({
  abi: rebaseRewardAbi,
  address: rebaseRewardAddress,
  functionName: 'getRoleAdmin',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"hasRole"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readRebaseRewardHasRole = /*#__PURE__*/ createReadContract({
  abi: rebaseRewardAbi,
  address: rebaseRewardAddress,
  functionName: 'hasRole',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"owner"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readRebaseRewardOwner = /*#__PURE__*/ createReadContract({
  abi: rebaseRewardAbi,
  address: rebaseRewardAddress,
  functionName: 'owner',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"pendingOwner"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readRebaseRewardPendingOwner = /*#__PURE__*/ createReadContract({
  abi: rebaseRewardAbi,
  address: rebaseRewardAddress,
  functionName: 'pendingOwner',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"periodInit"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readRebaseRewardPeriodInit = /*#__PURE__*/ createReadContract({
  abi: rebaseRewardAbi,
  address: rebaseRewardAddress,
  functionName: 'periodInit',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"proxiableUUID"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readRebaseRewardProxiableUuid = /*#__PURE__*/ createReadContract({
  abi: rebaseRewardAbi,
  address: rebaseRewardAddress,
  functionName: 'proxiableUUID',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"rewardForPeriod"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readRebaseRewardRewardForPeriod = /*#__PURE__*/ createReadContract(
  {
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'rewardForPeriod',
  },
)

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"supportsInterface"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readRebaseRewardSupportsInterface =
  /*#__PURE__*/ createReadContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"token"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readRebaseRewardToken = /*#__PURE__*/ createReadContract({
  abi: rebaseRewardAbi,
  address: rebaseRewardAddress,
  functionName: 'token',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"tokenIdRewardClaimedInPeriod"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readRebaseRewardTokenIdRewardClaimedInPeriod =
  /*#__PURE__*/ createReadContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'tokenIdRewardClaimedInPeriod',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"tokenIdVotesInPeriod"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readRebaseRewardTokenIdVotesInPeriod =
  /*#__PURE__*/ createReadContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'tokenIdVotesInPeriod',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"totalVotesInPeriod"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readRebaseRewardTotalVotesInPeriod =
  /*#__PURE__*/ createReadContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'totalVotesInPeriod',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"veTOKEN"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readRebaseRewardVeToken = /*#__PURE__*/ createReadContract({
  abi: rebaseRewardAbi,
  address: rebaseRewardAddress,
  functionName: 'veTOKEN',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"voter"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readRebaseRewardVoter = /*#__PURE__*/ createReadContract({
  abi: rebaseRewardAbi,
  address: rebaseRewardAddress,
  functionName: 'voter',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link rebaseRewardAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeRebaseReward = /*#__PURE__*/ createWriteContract({
  abi: rebaseRewardAbi,
  address: rebaseRewardAddress,
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"_deposit"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeRebaseRewardDeposit = /*#__PURE__*/ createWriteContract({
  abi: rebaseRewardAbi,
  address: rebaseRewardAddress,
  functionName: '_deposit',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"_withdraw"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeRebaseRewardWithdraw = /*#__PURE__*/ createWriteContract({
  abi: rebaseRewardAbi,
  address: rebaseRewardAddress,
  functionName: '_withdraw',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"acceptOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeRebaseRewardAcceptOwnership =
  /*#__PURE__*/ createWriteContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'acceptOwnership',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"getRewardForOwner"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeRebaseRewardGetRewardForOwner =
  /*#__PURE__*/ createWriteContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'getRewardForOwner',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"getRewardForPeriod"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeRebaseRewardGetRewardForPeriod =
  /*#__PURE__*/ createWriteContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'getRewardForPeriod',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"getRewardForTokenId"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeRebaseRewardGetRewardForTokenId =
  /*#__PURE__*/ createWriteContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'getRewardForTokenId',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"grantNotifyRole"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeRebaseRewardGrantNotifyRole =
  /*#__PURE__*/ createWriteContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'grantNotifyRole',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"grantRole"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeRebaseRewardGrantRole = /*#__PURE__*/ createWriteContract({
  abi: rebaseRewardAbi,
  address: rebaseRewardAddress,
  functionName: 'grantRole',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"incentivize"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeRebaseRewardIncentivize = /*#__PURE__*/ createWriteContract({
  abi: rebaseRewardAbi,
  address: rebaseRewardAddress,
  functionName: 'incentivize',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"initialize"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeRebaseRewardInitialize = /*#__PURE__*/ createWriteContract({
  abi: rebaseRewardAbi,
  address: rebaseRewardAddress,
  functionName: 'initialize',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"notifyRewardAmount"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeRebaseRewardNotifyRewardAmount =
  /*#__PURE__*/ createWriteContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'notifyRewardAmount',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeRebaseRewardRenounceOwnership =
  /*#__PURE__*/ createWriteContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"renounceRole"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeRebaseRewardRenounceRole = /*#__PURE__*/ createWriteContract({
  abi: rebaseRewardAbi,
  address: rebaseRewardAddress,
  functionName: 'renounceRole',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"revokeRole"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeRebaseRewardRevokeRole = /*#__PURE__*/ createWriteContract({
  abi: rebaseRewardAbi,
  address: rebaseRewardAddress,
  functionName: 'revokeRole',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"transferERC20"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeRebaseRewardTransferErc20 = /*#__PURE__*/ createWriteContract(
  {
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'transferERC20',
  },
)

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeRebaseRewardTransferOwnership =
  /*#__PURE__*/ createWriteContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"upgradeToAndCall"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeRebaseRewardUpgradeToAndCall =
  /*#__PURE__*/ createWriteContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link rebaseRewardAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateRebaseReward = /*#__PURE__*/ createSimulateContract({
  abi: rebaseRewardAbi,
  address: rebaseRewardAddress,
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"_deposit"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateRebaseRewardDeposit = /*#__PURE__*/ createSimulateContract(
  {
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: '_deposit',
  },
)

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"_withdraw"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateRebaseRewardWithdraw =
  /*#__PURE__*/ createSimulateContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: '_withdraw',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"acceptOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateRebaseRewardAcceptOwnership =
  /*#__PURE__*/ createSimulateContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'acceptOwnership',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"getRewardForOwner"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateRebaseRewardGetRewardForOwner =
  /*#__PURE__*/ createSimulateContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'getRewardForOwner',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"getRewardForPeriod"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateRebaseRewardGetRewardForPeriod =
  /*#__PURE__*/ createSimulateContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'getRewardForPeriod',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"getRewardForTokenId"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateRebaseRewardGetRewardForTokenId =
  /*#__PURE__*/ createSimulateContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'getRewardForTokenId',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"grantNotifyRole"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateRebaseRewardGrantNotifyRole =
  /*#__PURE__*/ createSimulateContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'grantNotifyRole',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"grantRole"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateRebaseRewardGrantRole =
  /*#__PURE__*/ createSimulateContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"incentivize"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateRebaseRewardIncentivize =
  /*#__PURE__*/ createSimulateContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'incentivize',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"initialize"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateRebaseRewardInitialize =
  /*#__PURE__*/ createSimulateContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"notifyRewardAmount"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateRebaseRewardNotifyRewardAmount =
  /*#__PURE__*/ createSimulateContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'notifyRewardAmount',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateRebaseRewardRenounceOwnership =
  /*#__PURE__*/ createSimulateContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"renounceRole"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateRebaseRewardRenounceRole =
  /*#__PURE__*/ createSimulateContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"revokeRole"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateRebaseRewardRevokeRole =
  /*#__PURE__*/ createSimulateContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"transferERC20"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateRebaseRewardTransferErc20 =
  /*#__PURE__*/ createSimulateContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'transferERC20',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateRebaseRewardTransferOwnership =
  /*#__PURE__*/ createSimulateContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link rebaseRewardAbi}__ and `functionName` set to `"upgradeToAndCall"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateRebaseRewardUpgradeToAndCall =
  /*#__PURE__*/ createSimulateContract({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link rebaseRewardAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const watchRebaseRewardEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: rebaseRewardAbi,
  address: rebaseRewardAddress,
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link rebaseRewardAbi}__ and `eventName` set to `"ClaimReward"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const watchRebaseRewardClaimRewardEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    eventName: 'ClaimReward',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link rebaseRewardAbi}__ and `eventName` set to `"Deposit"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const watchRebaseRewardDepositEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    eventName: 'Deposit',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link rebaseRewardAbi}__ and `eventName` set to `"IncentivizedReward"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const watchRebaseRewardIncentivizedRewardEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    eventName: 'IncentivizedReward',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link rebaseRewardAbi}__ and `eventName` set to `"Initialized"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const watchRebaseRewardInitializedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link rebaseRewardAbi}__ and `eventName` set to `"NotifyReward"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const watchRebaseRewardNotifyRewardEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    eventName: 'NotifyReward',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link rebaseRewardAbi}__ and `eventName` set to `"OwnershipTransferStarted"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const watchRebaseRewardOwnershipTransferStartedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    eventName: 'OwnershipTransferStarted',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link rebaseRewardAbi}__ and `eventName` set to `"OwnershipTransferred"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const watchRebaseRewardOwnershipTransferredEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link rebaseRewardAbi}__ and `eventName` set to `"RoleAdminChanged"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const watchRebaseRewardRoleAdminChangedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    eventName: 'RoleAdminChanged',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link rebaseRewardAbi}__ and `eventName` set to `"RoleGranted"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const watchRebaseRewardRoleGrantedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    eventName: 'RoleGranted',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link rebaseRewardAbi}__ and `eventName` set to `"RoleRevoked"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const watchRebaseRewardRoleRevokedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    eventName: 'RoleRevoked',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link rebaseRewardAbi}__ and `eventName` set to `"Upgraded"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const watchRebaseRewardUpgradedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    eventName: 'Upgraded',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link rebaseRewardAbi}__ and `eventName` set to `"Withdraw"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const watchRebaseRewardWithdrawEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: rebaseRewardAbi,
    address: rebaseRewardAddress,
    eventName: 'Withdraw',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link securityRegistryAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readSecurityRegistry = /*#__PURE__*/ createReadContract({
  abi: securityRegistryAbi,
  address: securityRegistryAddress,
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link securityRegistryAbi}__ and `functionName` set to `"GUARD"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readSecurityRegistryGuard = /*#__PURE__*/ createReadContract({
  abi: securityRegistryAbi,
  address: securityRegistryAddress,
  functionName: 'GUARD',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link securityRegistryAbi}__ and `functionName` set to `"algebraFactory"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readSecurityRegistryAlgebraFactory =
  /*#__PURE__*/ createReadContract({
    abi: securityRegistryAbi,
    address: securityRegistryAddress,
    functionName: 'algebraFactory',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link securityRegistryAbi}__ and `functionName` set to `"getPoolStatus"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readSecurityRegistryGetPoolStatus =
  /*#__PURE__*/ createReadContract({
    abi: securityRegistryAbi,
    address: securityRegistryAddress,
    functionName: 'getPoolStatus',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link securityRegistryAbi}__ and `functionName` set to `"globalStatus"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readSecurityRegistryGlobalStatus =
  /*#__PURE__*/ createReadContract({
    abi: securityRegistryAbi,
    address: securityRegistryAddress,
    functionName: 'globalStatus',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link securityRegistryAbi}__ and `functionName` set to `"isPoolStatusOverrided"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readSecurityRegistryIsPoolStatusOverrided =
  /*#__PURE__*/ createReadContract({
    abi: securityRegistryAbi,
    address: securityRegistryAddress,
    functionName: 'isPoolStatusOverrided',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link securityRegistryAbi}__ and `functionName` set to `"poolStatus"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readSecurityRegistryPoolStatus = /*#__PURE__*/ createReadContract({
  abi: securityRegistryAbi,
  address: securityRegistryAddress,
  functionName: 'poolStatus',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link securityRegistryAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeSecurityRegistry = /*#__PURE__*/ createWriteContract({
  abi: securityRegistryAbi,
  address: securityRegistryAddress,
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link securityRegistryAbi}__ and `functionName` set to `"setGlobalStatus"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeSecurityRegistrySetGlobalStatus =
  /*#__PURE__*/ createWriteContract({
    abi: securityRegistryAbi,
    address: securityRegistryAddress,
    functionName: 'setGlobalStatus',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link securityRegistryAbi}__ and `functionName` set to `"setPoolsStatus"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeSecurityRegistrySetPoolsStatus =
  /*#__PURE__*/ createWriteContract({
    abi: securityRegistryAbi,
    address: securityRegistryAddress,
    functionName: 'setPoolsStatus',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link securityRegistryAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateSecurityRegistry = /*#__PURE__*/ createSimulateContract({
  abi: securityRegistryAbi,
  address: securityRegistryAddress,
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link securityRegistryAbi}__ and `functionName` set to `"setGlobalStatus"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateSecurityRegistrySetGlobalStatus =
  /*#__PURE__*/ createSimulateContract({
    abi: securityRegistryAbi,
    address: securityRegistryAddress,
    functionName: 'setGlobalStatus',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link securityRegistryAbi}__ and `functionName` set to `"setPoolsStatus"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateSecurityRegistrySetPoolsStatus =
  /*#__PURE__*/ createSimulateContract({
    abi: securityRegistryAbi,
    address: securityRegistryAddress,
    functionName: 'setPoolsStatus',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link securityRegistryAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const watchSecurityRegistryEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: securityRegistryAbi,
    address: securityRegistryAddress,
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link securityRegistryAbi}__ and `eventName` set to `"GlobalStatus"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const watchSecurityRegistryGlobalStatusEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: securityRegistryAbi,
    address: securityRegistryAddress,
    eventName: 'GlobalStatus',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link securityRegistryAbi}__ and `eventName` set to `"PoolStatus"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const watchSecurityRegistryPoolStatusEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: securityRegistryAbi,
    address: securityRegistryAddress,
    eventName: 'PoolStatus',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link swapRouterAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const readSwapRouter = /*#__PURE__*/ createReadContract({
  abi: swapRouterAbi,
  address: swapRouterAddress,
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"WNativeToken"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const readSwapRouterWNativeToken = /*#__PURE__*/ createReadContract({
  abi: swapRouterAbi,
  address: swapRouterAddress,
  functionName: 'WNativeToken',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"factory"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const readSwapRouterFactory = /*#__PURE__*/ createReadContract({
  abi: swapRouterAbi,
  address: swapRouterAddress,
  functionName: 'factory',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"poolDeployer"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const readSwapRouterPoolDeployer = /*#__PURE__*/ createReadContract({
  abi: swapRouterAbi,
  address: swapRouterAddress,
  functionName: 'poolDeployer',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link swapRouterAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const writeSwapRouter = /*#__PURE__*/ createWriteContract({
  abi: swapRouterAbi,
  address: swapRouterAddress,
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"algebraSwapCallback"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const writeSwapRouterAlgebraSwapCallback =
  /*#__PURE__*/ createWriteContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'algebraSwapCallback',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"exactInput"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const writeSwapRouterExactInput = /*#__PURE__*/ createWriteContract({
  abi: swapRouterAbi,
  address: swapRouterAddress,
  functionName: 'exactInput',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"exactInputSingle"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const writeSwapRouterExactInputSingle =
  /*#__PURE__*/ createWriteContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'exactInputSingle',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"exactInputSingleSupportingFeeOnTransferTokens"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const writeSwapRouterExactInputSingleSupportingFeeOnTransferTokens =
  /*#__PURE__*/ createWriteContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'exactInputSingleSupportingFeeOnTransferTokens',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"exactOutput"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const writeSwapRouterExactOutput = /*#__PURE__*/ createWriteContract({
  abi: swapRouterAbi,
  address: swapRouterAddress,
  functionName: 'exactOutput',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"exactOutputSingle"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const writeSwapRouterExactOutputSingle =
  /*#__PURE__*/ createWriteContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'exactOutputSingle',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"multicall"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const writeSwapRouterMulticall = /*#__PURE__*/ createWriteContract({
  abi: swapRouterAbi,
  address: swapRouterAddress,
  functionName: 'multicall',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"refundNativeToken"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const writeSwapRouterRefundNativeToken =
  /*#__PURE__*/ createWriteContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'refundNativeToken',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"selfPermit"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const writeSwapRouterSelfPermit = /*#__PURE__*/ createWriteContract({
  abi: swapRouterAbi,
  address: swapRouterAddress,
  functionName: 'selfPermit',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"selfPermitAllowed"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const writeSwapRouterSelfPermitAllowed =
  /*#__PURE__*/ createWriteContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'selfPermitAllowed',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"selfPermitAllowedIfNecessary"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const writeSwapRouterSelfPermitAllowedIfNecessary =
  /*#__PURE__*/ createWriteContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'selfPermitAllowedIfNecessary',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"selfPermitIfNecessary"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const writeSwapRouterSelfPermitIfNecessary =
  /*#__PURE__*/ createWriteContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'selfPermitIfNecessary',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"sweepToken"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const writeSwapRouterSweepToken = /*#__PURE__*/ createWriteContract({
  abi: swapRouterAbi,
  address: swapRouterAddress,
  functionName: 'sweepToken',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"sweepTokenWithFee"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const writeSwapRouterSweepTokenWithFee =
  /*#__PURE__*/ createWriteContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'sweepTokenWithFee',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"unwrapWNativeToken"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const writeSwapRouterUnwrapWNativeToken =
  /*#__PURE__*/ createWriteContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'unwrapWNativeToken',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"unwrapWNativeTokenWithFee"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const writeSwapRouterUnwrapWNativeTokenWithFee =
  /*#__PURE__*/ createWriteContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'unwrapWNativeTokenWithFee',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link swapRouterAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const simulateSwapRouter = /*#__PURE__*/ createSimulateContract({
  abi: swapRouterAbi,
  address: swapRouterAddress,
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"algebraSwapCallback"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const simulateSwapRouterAlgebraSwapCallback =
  /*#__PURE__*/ createSimulateContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'algebraSwapCallback',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"exactInput"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const simulateSwapRouterExactInput =
  /*#__PURE__*/ createSimulateContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'exactInput',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"exactInputSingle"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const simulateSwapRouterExactInputSingle =
  /*#__PURE__*/ createSimulateContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'exactInputSingle',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"exactInputSingleSupportingFeeOnTransferTokens"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const simulateSwapRouterExactInputSingleSupportingFeeOnTransferTokens =
  /*#__PURE__*/ createSimulateContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'exactInputSingleSupportingFeeOnTransferTokens',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"exactOutput"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const simulateSwapRouterExactOutput =
  /*#__PURE__*/ createSimulateContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'exactOutput',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"exactOutputSingle"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const simulateSwapRouterExactOutputSingle =
  /*#__PURE__*/ createSimulateContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'exactOutputSingle',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"multicall"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const simulateSwapRouterMulticall = /*#__PURE__*/ createSimulateContract(
  { abi: swapRouterAbi, address: swapRouterAddress, functionName: 'multicall' },
)

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"refundNativeToken"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const simulateSwapRouterRefundNativeToken =
  /*#__PURE__*/ createSimulateContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'refundNativeToken',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"selfPermit"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const simulateSwapRouterSelfPermit =
  /*#__PURE__*/ createSimulateContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'selfPermit',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"selfPermitAllowed"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const simulateSwapRouterSelfPermitAllowed =
  /*#__PURE__*/ createSimulateContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'selfPermitAllowed',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"selfPermitAllowedIfNecessary"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const simulateSwapRouterSelfPermitAllowedIfNecessary =
  /*#__PURE__*/ createSimulateContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'selfPermitAllowedIfNecessary',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"selfPermitIfNecessary"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const simulateSwapRouterSelfPermitIfNecessary =
  /*#__PURE__*/ createSimulateContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'selfPermitIfNecessary',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"sweepToken"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const simulateSwapRouterSweepToken =
  /*#__PURE__*/ createSimulateContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'sweepToken',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"sweepTokenWithFee"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const simulateSwapRouterSweepTokenWithFee =
  /*#__PURE__*/ createSimulateContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'sweepTokenWithFee',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"unwrapWNativeToken"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const simulateSwapRouterUnwrapWNativeToken =
  /*#__PURE__*/ createSimulateContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'unwrapWNativeToken',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link swapRouterAbi}__ and `functionName` set to `"unwrapWNativeTokenWithFee"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A)
 */
export const simulateSwapRouterUnwrapWNativeTokenWithFee =
  /*#__PURE__*/ createSimulateContract({
    abi: swapRouterAbi,
    address: swapRouterAddress,
    functionName: 'unwrapWNativeTokenWithFee',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link voterAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVoter = /*#__PURE__*/ createReadContract({
  abi: voterAbi,
  address: voterAddress,
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"AUTHORIZED_ROLE"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVoterAuthorizedRole = /*#__PURE__*/ createReadContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'AUTHORIZED_ROLE',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"DEFAULT_ADMIN_ROLE"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVoterDefaultAdminRole = /*#__PURE__*/ createReadContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'DEFAULT_ADMIN_ROLE',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"DURATION"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVoterDuration = /*#__PURE__*/ createReadContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'DURATION',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"UPGRADE_INTERFACE_VERSION"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVoterUpgradeInterfaceVersion =
  /*#__PURE__*/ createReadContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'UPGRADE_INTERFACE_VERSION',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"algebraGaugeFactory"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVoterAlgebraGaugeFactory = /*#__PURE__*/ createReadContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'algebraGaugeFactory',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"algebraVaultFactory"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVoterAlgebraVaultFactory = /*#__PURE__*/ createReadContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'algebraVaultFactory',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"checkPeriodVoted"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVoterCheckPeriodVoted = /*#__PURE__*/ createReadContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'checkPeriodVoted',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"epoch0Period"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVoterEpoch0Period = /*#__PURE__*/ createReadContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'epoch0Period',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"gaugeToPool"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVoterGaugeToPool = /*#__PURE__*/ createReadContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'gaugeToPool',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"getCurrentPeriod"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVoterGetCurrentPeriod = /*#__PURE__*/ createReadContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'getCurrentPeriod',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"getGauge"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVoterGetGauge = /*#__PURE__*/ createReadContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'getGauge',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"getGaugeList"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVoterGetGaugeList = /*#__PURE__*/ createReadContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'getGaugeList',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"getPeriodData"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVoterGetPeriodData = /*#__PURE__*/ createReadContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'getPeriodData',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"getPoolList"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVoterGetPoolList = /*#__PURE__*/ createReadContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'getPoolList',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"getRoleAdmin"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVoterGetRoleAdmin = /*#__PURE__*/ createReadContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'getRoleAdmin',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"getTokenIdVotes"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVoterGetTokenIdVotes = /*#__PURE__*/ createReadContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'getTokenIdVotes',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"hasRole"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVoterHasRole = /*#__PURE__*/ createReadContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'hasRole',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"isAlive"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVoterIsAlive = /*#__PURE__*/ createReadContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'isAlive',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"isGauge"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVoterIsGauge = /*#__PURE__*/ createReadContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'isGauge',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"isWhitelisted"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVoterIsWhitelisted = /*#__PURE__*/ createReadContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'isWhitelisted',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"minter"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVoterMinter = /*#__PURE__*/ createReadContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'minter',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"owner"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVoterOwner = /*#__PURE__*/ createReadContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'owner',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"pendingOwner"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVoterPendingOwner = /*#__PURE__*/ createReadContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'pendingOwner',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"period"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVoterPeriod = /*#__PURE__*/ createReadContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'period',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"proxiableUUID"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVoterProxiableUuid = /*#__PURE__*/ createReadContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'proxiableUUID',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"rebaseReward"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVoterRebaseReward = /*#__PURE__*/ createReadContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'rebaseReward',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"supportsInterface"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVoterSupportsInterface = /*#__PURE__*/ createReadContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'supportsInterface',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"token"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVoterToken = /*#__PURE__*/ createReadContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'token',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"veTOKEN"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVoterVeToken = /*#__PURE__*/ createReadContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'veTOKEN',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"votingRewardFactory"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVoterVotingRewardFactory = /*#__PURE__*/ createReadContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'votingRewardFactory',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link voterAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeVoter = /*#__PURE__*/ createWriteContract({
  abi: voterAbi,
  address: voterAddress,
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"acceptOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeVoterAcceptOwnership = /*#__PURE__*/ createWriteContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'acceptOwnership',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"claimVotingRewardBatch"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeVoterClaimVotingRewardBatch =
  /*#__PURE__*/ createWriteContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'claimVotingRewardBatch',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"createAlgebraGauge"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeVoterCreateAlgebraGauge = /*#__PURE__*/ createWriteContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'createAlgebraGauge',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"createGauge"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeVoterCreateGauge = /*#__PURE__*/ createWriteContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'createGauge',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"distribute"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeVoterDistribute = /*#__PURE__*/ createWriteContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'distribute',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"distributeAll"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeVoterDistributeAll = /*#__PURE__*/ createWriteContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'distributeAll',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"distributeRange"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeVoterDistributeRange = /*#__PURE__*/ createWriteContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'distributeRange',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"grantRole"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeVoterGrantRole = /*#__PURE__*/ createWriteContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'grantRole',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"initialize"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeVoterInitialize = /*#__PURE__*/ createWriteContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'initialize',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"killGauge"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeVoterKillGauge = /*#__PURE__*/ createWriteContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'killGauge',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"notifyRewardAmount"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeVoterNotifyRewardAmount = /*#__PURE__*/ createWriteContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'notifyRewardAmount',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeVoterRenounceOwnership = /*#__PURE__*/ createWriteContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'renounceOwnership',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"renounceRole"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeVoterRenounceRole = /*#__PURE__*/ createWriteContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'renounceRole',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"reviveGauge"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeVoterReviveGauge = /*#__PURE__*/ createWriteContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'reviveGauge',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"revokeRole"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeVoterRevokeRole = /*#__PURE__*/ createWriteContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'revokeRole',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"setAlgebraGaugeFactory"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeVoterSetAlgebraGaugeFactory =
  /*#__PURE__*/ createWriteContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'setAlgebraGaugeFactory',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"setAlgebraVaultFactory"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeVoterSetAlgebraVaultFactory =
  /*#__PURE__*/ createWriteContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'setAlgebraVaultFactory',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"setMinter"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeVoterSetMinter = /*#__PURE__*/ createWriteContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'setMinter',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"setRebaseReward"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeVoterSetRebaseReward = /*#__PURE__*/ createWriteContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'setRebaseReward',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"setTokenStatus"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeVoterSetTokenStatus = /*#__PURE__*/ createWriteContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'setTokenStatus',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"setVotingRewardFactory"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeVoterSetVotingRewardFactory =
  /*#__PURE__*/ createWriteContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'setVotingRewardFactory',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"start"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeVoterStart = /*#__PURE__*/ createWriteContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'start',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeVoterTransferOwnership = /*#__PURE__*/ createWriteContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'transferOwnership',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"upgradeToAndCall"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeVoterUpgradeToAndCall = /*#__PURE__*/ createWriteContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'upgradeToAndCall',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"vote"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeVoterVote = /*#__PURE__*/ createWriteContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'vote',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link voterAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateVoter = /*#__PURE__*/ createSimulateContract({
  abi: voterAbi,
  address: voterAddress,
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"acceptOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateVoterAcceptOwnership =
  /*#__PURE__*/ createSimulateContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'acceptOwnership',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"claimVotingRewardBatch"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateVoterClaimVotingRewardBatch =
  /*#__PURE__*/ createSimulateContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'claimVotingRewardBatch',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"createAlgebraGauge"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateVoterCreateAlgebraGauge =
  /*#__PURE__*/ createSimulateContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'createAlgebraGauge',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"createGauge"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateVoterCreateGauge = /*#__PURE__*/ createSimulateContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'createGauge',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"distribute"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateVoterDistribute = /*#__PURE__*/ createSimulateContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'distribute',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"distributeAll"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateVoterDistributeAll = /*#__PURE__*/ createSimulateContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'distributeAll',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"distributeRange"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateVoterDistributeRange =
  /*#__PURE__*/ createSimulateContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'distributeRange',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"grantRole"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateVoterGrantRole = /*#__PURE__*/ createSimulateContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'grantRole',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"initialize"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateVoterInitialize = /*#__PURE__*/ createSimulateContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'initialize',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"killGauge"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateVoterKillGauge = /*#__PURE__*/ createSimulateContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'killGauge',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"notifyRewardAmount"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateVoterNotifyRewardAmount =
  /*#__PURE__*/ createSimulateContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'notifyRewardAmount',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateVoterRenounceOwnership =
  /*#__PURE__*/ createSimulateContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"renounceRole"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateVoterRenounceRole = /*#__PURE__*/ createSimulateContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'renounceRole',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"reviveGauge"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateVoterReviveGauge = /*#__PURE__*/ createSimulateContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'reviveGauge',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"revokeRole"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateVoterRevokeRole = /*#__PURE__*/ createSimulateContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'revokeRole',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"setAlgebraGaugeFactory"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateVoterSetAlgebraGaugeFactory =
  /*#__PURE__*/ createSimulateContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'setAlgebraGaugeFactory',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"setAlgebraVaultFactory"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateVoterSetAlgebraVaultFactory =
  /*#__PURE__*/ createSimulateContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'setAlgebraVaultFactory',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"setMinter"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateVoterSetMinter = /*#__PURE__*/ createSimulateContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'setMinter',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"setRebaseReward"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateVoterSetRebaseReward =
  /*#__PURE__*/ createSimulateContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'setRebaseReward',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"setTokenStatus"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateVoterSetTokenStatus = /*#__PURE__*/ createSimulateContract(
  { abi: voterAbi, address: voterAddress, functionName: 'setTokenStatus' },
)

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"setVotingRewardFactory"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateVoterSetVotingRewardFactory =
  /*#__PURE__*/ createSimulateContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'setVotingRewardFactory',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"start"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateVoterStart = /*#__PURE__*/ createSimulateContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'start',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateVoterTransferOwnership =
  /*#__PURE__*/ createSimulateContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"upgradeToAndCall"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateVoterUpgradeToAndCall =
  /*#__PURE__*/ createSimulateContract({
    abi: voterAbi,
    address: voterAddress,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link voterAbi}__ and `functionName` set to `"vote"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateVoterVote = /*#__PURE__*/ createSimulateContract({
  abi: voterAbi,
  address: voterAddress,
  functionName: 'vote',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link voterAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const watchVoterEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: voterAbi,
  address: voterAddress,
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link voterAbi}__ and `eventName` set to `"DistributeAlgebraFees"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const watchVoterDistributeAlgebraFeesEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: voterAbi,
    address: voterAddress,
    eventName: 'DistributeAlgebraFees',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link voterAbi}__ and `eventName` set to `"DistributeEmissions"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const watchVoterDistributeEmissionsEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: voterAbi,
    address: voterAddress,
    eventName: 'DistributeEmissions',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link voterAbi}__ and `eventName` set to `"GaugeCreated"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const watchVoterGaugeCreatedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: voterAbi,
    address: voterAddress,
    eventName: 'GaugeCreated',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link voterAbi}__ and `eventName` set to `"GaugeKilled"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const watchVoterGaugeKilledEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: voterAbi,
    address: voterAddress,
    eventName: 'GaugeKilled',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link voterAbi}__ and `eventName` set to `"GaugeRevived"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const watchVoterGaugeRevivedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: voterAbi,
    address: voterAddress,
    eventName: 'GaugeRevived',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link voterAbi}__ and `eventName` set to `"Initialized"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const watchVoterInitializedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: voterAbi,
    address: voterAddress,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link voterAbi}__ and `eventName` set to `"OwnershipTransferStarted"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const watchVoterOwnershipTransferStartedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: voterAbi,
    address: voterAddress,
    eventName: 'OwnershipTransferStarted',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link voterAbi}__ and `eventName` set to `"OwnershipTransferred"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const watchVoterOwnershipTransferredEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: voterAbi,
    address: voterAddress,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link voterAbi}__ and `eventName` set to `"RoleAdminChanged"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const watchVoterRoleAdminChangedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: voterAbi,
    address: voterAddress,
    eventName: 'RoleAdminChanged',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link voterAbi}__ and `eventName` set to `"RoleGranted"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const watchVoterRoleGrantedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: voterAbi,
    address: voterAddress,
    eventName: 'RoleGranted',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link voterAbi}__ and `eventName` set to `"RoleRevoked"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const watchVoterRoleRevokedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: voterAbi,
    address: voterAddress,
    eventName: 'RoleRevoked',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link voterAbi}__ and `eventName` set to `"TokenStatus"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const watchVoterTokenStatusEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: voterAbi,
    address: voterAddress,
    eventName: 'TokenStatus',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link voterAbi}__ and `eventName` set to `"Upgraded"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const watchVoterUpgradedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: voterAbi,
  address: voterAddress,
  eventName: 'Upgraded',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link voterAbi}__ and `eventName` set to `"Voted"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const watchVoterVotedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: voterAbi,
  address: voterAddress,
  eventName: 'Voted',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingEscrowAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVotingEscrow = /*#__PURE__*/ createReadContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"MAXTIME"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVotingEscrowMaxtime = /*#__PURE__*/ createReadContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'MAXTIME',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"MULTIPLIER"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVotingEscrowMultiplier = /*#__PURE__*/ createReadContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'MULTIPLIER',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"UPGRADE_INTERFACE_VERSION"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVotingEscrowUpgradeInterfaceVersion =
  /*#__PURE__*/ createReadContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'UPGRADE_INTERFACE_VERSION',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"WEEK"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVotingEscrowWeek = /*#__PURE__*/ createReadContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'WEEK',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"artProxy"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVotingEscrowArtProxy = /*#__PURE__*/ createReadContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'artProxy',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"balanceOf"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVotingEscrowBalanceOf = /*#__PURE__*/ createReadContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'balanceOf',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"balanceOfNFT"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVotingEscrowBalanceOfNft = /*#__PURE__*/ createReadContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'balanceOfNFT',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"epoch"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVotingEscrowEpoch = /*#__PURE__*/ createReadContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'epoch',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"getApproved"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVotingEscrowGetApproved = /*#__PURE__*/ createReadContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'getApproved',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"get_last_user_slope"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVotingEscrowGetLastUserSlope =
  /*#__PURE__*/ createReadContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'get_last_user_slope',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"iMAXTIME"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVotingEscrowIMaxtime = /*#__PURE__*/ createReadContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'iMAXTIME',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"isApprovedForAll"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVotingEscrowIsApprovedForAll =
  /*#__PURE__*/ createReadContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'isApprovedForAll',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"isApprovedOrOwner"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVotingEscrowIsApprovedOrOwner =
  /*#__PURE__*/ createReadContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'isApprovedOrOwner',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"locked"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVotingEscrowLocked = /*#__PURE__*/ createReadContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'locked',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"name"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVotingEscrowName = /*#__PURE__*/ createReadContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'name',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"owner"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVotingEscrowOwner = /*#__PURE__*/ createReadContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'owner',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"ownerOf"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVotingEscrowOwnerOf = /*#__PURE__*/ createReadContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'ownerOf',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"ownership_change"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVotingEscrowOwnershipChange = /*#__PURE__*/ createReadContract(
  {
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'ownership_change',
  },
)

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"pendingOwner"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVotingEscrowPendingOwner = /*#__PURE__*/ createReadContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'pendingOwner',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"point_history"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVotingEscrowPointHistory = /*#__PURE__*/ createReadContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'point_history',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"proxiableUUID"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVotingEscrowProxiableUuid = /*#__PURE__*/ createReadContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'proxiableUUID',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"slope_changes"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVotingEscrowSlopeChanges = /*#__PURE__*/ createReadContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'slope_changes',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"supply"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVotingEscrowSupply = /*#__PURE__*/ createReadContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'supply',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"supportsInterface"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVotingEscrowSupportsInterface =
  /*#__PURE__*/ createReadContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"symbol"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVotingEscrowSymbol = /*#__PURE__*/ createReadContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'symbol',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"token"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVotingEscrowToken = /*#__PURE__*/ createReadContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'token',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"tokenByIndex"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVotingEscrowTokenByIndex = /*#__PURE__*/ createReadContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'tokenByIndex',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"tokenId"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVotingEscrowTokenId = /*#__PURE__*/ createReadContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'tokenId',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"tokenOfOwnerByIndex"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVotingEscrowTokenOfOwnerByIndex =
  /*#__PURE__*/ createReadContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'tokenOfOwnerByIndex',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"tokenURI"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVotingEscrowTokenUri = /*#__PURE__*/ createReadContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'tokenURI',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"totalSupply"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVotingEscrowTotalSupply = /*#__PURE__*/ createReadContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'totalSupply',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"totalVotingPower"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVotingEscrowTotalVotingPower =
  /*#__PURE__*/ createReadContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'totalVotingPower',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"userPointHistory"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVotingEscrowUserPointHistory =
  /*#__PURE__*/ createReadContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'userPointHistory',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"user_point_epoch"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVotingEscrowUserPointEpoch = /*#__PURE__*/ createReadContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'user_point_epoch',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"voted"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVotingEscrowVoted = /*#__PURE__*/ createReadContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'voted',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"voter"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const readVotingEscrowVoter = /*#__PURE__*/ createReadContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'voter',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link votingEscrowAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeVotingEscrow = /*#__PURE__*/ createWriteContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"acceptOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeVotingEscrowAcceptOwnership =
  /*#__PURE__*/ createWriteContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'acceptOwnership',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"approve"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeVotingEscrowApprove = /*#__PURE__*/ createWriteContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'approve',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"checkpoint"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeVotingEscrowCheckpoint = /*#__PURE__*/ createWriteContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'checkpoint',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"create_lock"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeVotingEscrowCreateLock = /*#__PURE__*/ createWriteContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'create_lock',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"create_lock_for"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeVotingEscrowCreateLockFor = /*#__PURE__*/ createWriteContract(
  {
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'create_lock_for',
  },
)

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"deposit_for"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeVotingEscrowDepositFor = /*#__PURE__*/ createWriteContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'deposit_for',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"increase_amount"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeVotingEscrowIncreaseAmount =
  /*#__PURE__*/ createWriteContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'increase_amount',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"increase_unlock_time"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeVotingEscrowIncreaseUnlockTime =
  /*#__PURE__*/ createWriteContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'increase_unlock_time',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"initialize"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeVotingEscrowInitialize = /*#__PURE__*/ createWriteContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'initialize',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"merge"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeVotingEscrowMerge = /*#__PURE__*/ createWriteContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'merge',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeVotingEscrowRenounceOwnership =
  /*#__PURE__*/ createWriteContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"safeTransferFrom"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeVotingEscrowSafeTransferFrom =
  /*#__PURE__*/ createWriteContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'safeTransferFrom',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"setApprovalForAll"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeVotingEscrowSetApprovalForAll =
  /*#__PURE__*/ createWriteContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'setApprovalForAll',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"setArtProxy"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeVotingEscrowSetArtProxy = /*#__PURE__*/ createWriteContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'setArtProxy',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"setVoter"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeVotingEscrowSetVoter = /*#__PURE__*/ createWriteContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'setVoter',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"split"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeVotingEscrowSplit = /*#__PURE__*/ createWriteContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'split',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"transferFrom"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeVotingEscrowTransferFrom = /*#__PURE__*/ createWriteContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'transferFrom',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeVotingEscrowTransferOwnership =
  /*#__PURE__*/ createWriteContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"upgradeToAndCall"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeVotingEscrowUpgradeToAndCall =
  /*#__PURE__*/ createWriteContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"withdraw"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const writeVotingEscrowWithdraw = /*#__PURE__*/ createWriteContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'withdraw',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link votingEscrowAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateVotingEscrow = /*#__PURE__*/ createSimulateContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"acceptOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateVotingEscrowAcceptOwnership =
  /*#__PURE__*/ createSimulateContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'acceptOwnership',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"approve"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateVotingEscrowApprove = /*#__PURE__*/ createSimulateContract(
  {
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'approve',
  },
)

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"checkpoint"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateVotingEscrowCheckpoint =
  /*#__PURE__*/ createSimulateContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'checkpoint',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"create_lock"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateVotingEscrowCreateLock =
  /*#__PURE__*/ createSimulateContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'create_lock',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"create_lock_for"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateVotingEscrowCreateLockFor =
  /*#__PURE__*/ createSimulateContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'create_lock_for',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"deposit_for"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateVotingEscrowDepositFor =
  /*#__PURE__*/ createSimulateContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'deposit_for',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"increase_amount"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateVotingEscrowIncreaseAmount =
  /*#__PURE__*/ createSimulateContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'increase_amount',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"increase_unlock_time"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateVotingEscrowIncreaseUnlockTime =
  /*#__PURE__*/ createSimulateContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'increase_unlock_time',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"initialize"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateVotingEscrowInitialize =
  /*#__PURE__*/ createSimulateContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"merge"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateVotingEscrowMerge = /*#__PURE__*/ createSimulateContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'merge',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateVotingEscrowRenounceOwnership =
  /*#__PURE__*/ createSimulateContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"safeTransferFrom"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateVotingEscrowSafeTransferFrom =
  /*#__PURE__*/ createSimulateContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'safeTransferFrom',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"setApprovalForAll"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateVotingEscrowSetApprovalForAll =
  /*#__PURE__*/ createSimulateContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'setApprovalForAll',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"setArtProxy"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateVotingEscrowSetArtProxy =
  /*#__PURE__*/ createSimulateContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'setArtProxy',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"setVoter"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateVotingEscrowSetVoter =
  /*#__PURE__*/ createSimulateContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'setVoter',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"split"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateVotingEscrowSplit = /*#__PURE__*/ createSimulateContract({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
  functionName: 'split',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"transferFrom"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateVotingEscrowTransferFrom =
  /*#__PURE__*/ createSimulateContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateVotingEscrowTransferOwnership =
  /*#__PURE__*/ createSimulateContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"upgradeToAndCall"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateVotingEscrowUpgradeToAndCall =
  /*#__PURE__*/ createSimulateContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link votingEscrowAbi}__ and `functionName` set to `"withdraw"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const simulateVotingEscrowWithdraw =
  /*#__PURE__*/ createSimulateContract({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    functionName: 'withdraw',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link votingEscrowAbi}__
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const watchVotingEscrowEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: votingEscrowAbi,
  address: votingEscrowAddress,
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link votingEscrowAbi}__ and `eventName` set to `"Approval"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const watchVotingEscrowApprovalEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link votingEscrowAbi}__ and `eventName` set to `"ApprovalForAll"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const watchVotingEscrowApprovalForAllEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    eventName: 'ApprovalForAll',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link votingEscrowAbi}__ and `eventName` set to `"Deposit"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const watchVotingEscrowDepositEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    eventName: 'Deposit',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link votingEscrowAbi}__ and `eventName` set to `"Initialized"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const watchVotingEscrowInitializedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link votingEscrowAbi}__ and `eventName` set to `"OwnershipTransferStarted"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const watchVotingEscrowOwnershipTransferStartedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    eventName: 'OwnershipTransferStarted',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link votingEscrowAbi}__ and `eventName` set to `"OwnershipTransferred"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const watchVotingEscrowOwnershipTransferredEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link votingEscrowAbi}__ and `eventName` set to `"Split"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const watchVotingEscrowSplitEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    eventName: 'Split',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link votingEscrowAbi}__ and `eventName` set to `"Supply"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const watchVotingEscrowSupplyEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    eventName: 'Supply',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link votingEscrowAbi}__ and `eventName` set to `"Transfer"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const watchVotingEscrowTransferEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    eventName: 'Transfer',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link votingEscrowAbi}__ and `eventName` set to `"Upgraded"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const watchVotingEscrowUpgradedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    eventName: 'Upgraded',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link votingEscrowAbi}__ and `eventName` set to `"Withdraw"`
 *
 * [__View Contract on Hemi Blockscout__](https://explorer.hemi.xyz/address/0x0000000000000000000000000000000000000000)
 */
export const watchVotingEscrowWithdrawEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: votingEscrowAbi,
    address: votingEscrowAddress,
    eventName: 'Withdraw',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingRewardAbi}__
 */
export const readVotingReward = /*#__PURE__*/ createReadContract({
  abi: votingRewardAbi,
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"DEFAULT_ADMIN_ROLE"`
 */
export const readVotingRewardDefaultAdminRole =
  /*#__PURE__*/ createReadContract({
    abi: votingRewardAbi,
    functionName: 'DEFAULT_ADMIN_ROLE',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"DURATION"`
 */
export const readVotingRewardDuration = /*#__PURE__*/ createReadContract({
  abi: votingRewardAbi,
  functionName: 'DURATION',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"NOTIFY_ROLE"`
 */
export const readVotingRewardNotifyRole = /*#__PURE__*/ createReadContract({
  abi: votingRewardAbi,
  functionName: 'NOTIFY_ROLE',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"PRECISION"`
 */
export const readVotingRewardPrecision = /*#__PURE__*/ createReadContract({
  abi: votingRewardAbi,
  functionName: 'PRECISION',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"UPGRADE_INTERFACE_VERSION"`
 */
export const readVotingRewardUpgradeInterfaceVersion =
  /*#__PURE__*/ createReadContract({
    abi: votingRewardAbi,
    functionName: 'UPGRADE_INTERFACE_VERSION',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"earnedForPeriod"`
 */
export const readVotingRewardEarnedForPeriod = /*#__PURE__*/ createReadContract(
  { abi: votingRewardAbi, functionName: 'earnedForPeriod' },
)

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"earnedForToken"`
 */
export const readVotingRewardEarnedForToken = /*#__PURE__*/ createReadContract({
  abi: votingRewardAbi,
  functionName: 'earnedForToken',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"earnedForTokenId"`
 */
export const readVotingRewardEarnedForTokenId =
  /*#__PURE__*/ createReadContract({
    abi: votingRewardAbi,
    functionName: 'earnedForTokenId',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"getCurrentPeriod"`
 */
export const readVotingRewardGetCurrentPeriod =
  /*#__PURE__*/ createReadContract({
    abi: votingRewardAbi,
    functionName: 'getCurrentPeriod',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"getRewardList"`
 */
export const readVotingRewardGetRewardList = /*#__PURE__*/ createReadContract({
  abi: votingRewardAbi,
  functionName: 'getRewardList',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"getRoleAdmin"`
 */
export const readVotingRewardGetRoleAdmin = /*#__PURE__*/ createReadContract({
  abi: votingRewardAbi,
  functionName: 'getRoleAdmin',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"hasRole"`
 */
export const readVotingRewardHasRole = /*#__PURE__*/ createReadContract({
  abi: votingRewardAbi,
  functionName: 'hasRole',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"owner"`
 */
export const readVotingRewardOwner = /*#__PURE__*/ createReadContract({
  abi: votingRewardAbi,
  functionName: 'owner',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"pendingOwner"`
 */
export const readVotingRewardPendingOwner = /*#__PURE__*/ createReadContract({
  abi: votingRewardAbi,
  functionName: 'pendingOwner',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"periodInit"`
 */
export const readVotingRewardPeriodInit = /*#__PURE__*/ createReadContract({
  abi: votingRewardAbi,
  functionName: 'periodInit',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const readVotingRewardProxiableUuid = /*#__PURE__*/ createReadContract({
  abi: votingRewardAbi,
  functionName: 'proxiableUUID',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"rewardForPeriod"`
 */
export const readVotingRewardRewardForPeriod = /*#__PURE__*/ createReadContract(
  { abi: votingRewardAbi, functionName: 'rewardForPeriod' },
)

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const readVotingRewardSupportsInterface =
  /*#__PURE__*/ createReadContract({
    abi: votingRewardAbi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"tokenIdRewardClaimedInPeriod"`
 */
export const readVotingRewardTokenIdRewardClaimedInPeriod =
  /*#__PURE__*/ createReadContract({
    abi: votingRewardAbi,
    functionName: 'tokenIdRewardClaimedInPeriod',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"tokenIdVotesInPeriod"`
 */
export const readVotingRewardTokenIdVotesInPeriod =
  /*#__PURE__*/ createReadContract({
    abi: votingRewardAbi,
    functionName: 'tokenIdVotesInPeriod',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"totalVotesInPeriod"`
 */
export const readVotingRewardTotalVotesInPeriod =
  /*#__PURE__*/ createReadContract({
    abi: votingRewardAbi,
    functionName: 'totalVotesInPeriod',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"veTOKEN"`
 */
export const readVotingRewardVeToken = /*#__PURE__*/ createReadContract({
  abi: votingRewardAbi,
  functionName: 'veTOKEN',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"voter"`
 */
export const readVotingRewardVoter = /*#__PURE__*/ createReadContract({
  abi: votingRewardAbi,
  functionName: 'voter',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link votingRewardAbi}__
 */
export const writeVotingReward = /*#__PURE__*/ createWriteContract({
  abi: votingRewardAbi,
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"_deposit"`
 */
export const writeVotingRewardDeposit = /*#__PURE__*/ createWriteContract({
  abi: votingRewardAbi,
  functionName: '_deposit',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"_withdraw"`
 */
export const writeVotingRewardWithdraw = /*#__PURE__*/ createWriteContract({
  abi: votingRewardAbi,
  functionName: '_withdraw',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"acceptOwnership"`
 */
export const writeVotingRewardAcceptOwnership =
  /*#__PURE__*/ createWriteContract({
    abi: votingRewardAbi,
    functionName: 'acceptOwnership',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"getRewardForOwner"`
 */
export const writeVotingRewardGetRewardForOwner =
  /*#__PURE__*/ createWriteContract({
    abi: votingRewardAbi,
    functionName: 'getRewardForOwner',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"getRewardForPeriod"`
 */
export const writeVotingRewardGetRewardForPeriod =
  /*#__PURE__*/ createWriteContract({
    abi: votingRewardAbi,
    functionName: 'getRewardForPeriod',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"getRewardForTokenId"`
 */
export const writeVotingRewardGetRewardForTokenId =
  /*#__PURE__*/ createWriteContract({
    abi: votingRewardAbi,
    functionName: 'getRewardForTokenId',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"grantNotifyRole"`
 */
export const writeVotingRewardGrantNotifyRole =
  /*#__PURE__*/ createWriteContract({
    abi: votingRewardAbi,
    functionName: 'grantNotifyRole',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"grantRole"`
 */
export const writeVotingRewardGrantRole = /*#__PURE__*/ createWriteContract({
  abi: votingRewardAbi,
  functionName: 'grantRole',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"incentivize"`
 */
export const writeVotingRewardIncentivize = /*#__PURE__*/ createWriteContract({
  abi: votingRewardAbi,
  functionName: 'incentivize',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"initialize"`
 */
export const writeVotingRewardInitialize = /*#__PURE__*/ createWriteContract({
  abi: votingRewardAbi,
  functionName: 'initialize',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"notifyRewardAmount"`
 */
export const writeVotingRewardNotifyRewardAmount =
  /*#__PURE__*/ createWriteContract({
    abi: votingRewardAbi,
    functionName: 'notifyRewardAmount',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const writeVotingRewardRenounceOwnership =
  /*#__PURE__*/ createWriteContract({
    abi: votingRewardAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"renounceRole"`
 */
export const writeVotingRewardRenounceRole = /*#__PURE__*/ createWriteContract({
  abi: votingRewardAbi,
  functionName: 'renounceRole',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"revokeRole"`
 */
export const writeVotingRewardRevokeRole = /*#__PURE__*/ createWriteContract({
  abi: votingRewardAbi,
  functionName: 'revokeRole',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"transferERC20"`
 */
export const writeVotingRewardTransferErc20 = /*#__PURE__*/ createWriteContract(
  { abi: votingRewardAbi, functionName: 'transferERC20' },
)

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const writeVotingRewardTransferOwnership =
  /*#__PURE__*/ createWriteContract({
    abi: votingRewardAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const writeVotingRewardUpgradeToAndCall =
  /*#__PURE__*/ createWriteContract({
    abi: votingRewardAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link votingRewardAbi}__
 */
export const simulateVotingReward = /*#__PURE__*/ createSimulateContract({
  abi: votingRewardAbi,
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"_deposit"`
 */
export const simulateVotingRewardDeposit = /*#__PURE__*/ createSimulateContract(
  { abi: votingRewardAbi, functionName: '_deposit' },
)

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"_withdraw"`
 */
export const simulateVotingRewardWithdraw =
  /*#__PURE__*/ createSimulateContract({
    abi: votingRewardAbi,
    functionName: '_withdraw',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"acceptOwnership"`
 */
export const simulateVotingRewardAcceptOwnership =
  /*#__PURE__*/ createSimulateContract({
    abi: votingRewardAbi,
    functionName: 'acceptOwnership',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"getRewardForOwner"`
 */
export const simulateVotingRewardGetRewardForOwner =
  /*#__PURE__*/ createSimulateContract({
    abi: votingRewardAbi,
    functionName: 'getRewardForOwner',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"getRewardForPeriod"`
 */
export const simulateVotingRewardGetRewardForPeriod =
  /*#__PURE__*/ createSimulateContract({
    abi: votingRewardAbi,
    functionName: 'getRewardForPeriod',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"getRewardForTokenId"`
 */
export const simulateVotingRewardGetRewardForTokenId =
  /*#__PURE__*/ createSimulateContract({
    abi: votingRewardAbi,
    functionName: 'getRewardForTokenId',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"grantNotifyRole"`
 */
export const simulateVotingRewardGrantNotifyRole =
  /*#__PURE__*/ createSimulateContract({
    abi: votingRewardAbi,
    functionName: 'grantNotifyRole',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"grantRole"`
 */
export const simulateVotingRewardGrantRole =
  /*#__PURE__*/ createSimulateContract({
    abi: votingRewardAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"incentivize"`
 */
export const simulateVotingRewardIncentivize =
  /*#__PURE__*/ createSimulateContract({
    abi: votingRewardAbi,
    functionName: 'incentivize',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"initialize"`
 */
export const simulateVotingRewardInitialize =
  /*#__PURE__*/ createSimulateContract({
    abi: votingRewardAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"notifyRewardAmount"`
 */
export const simulateVotingRewardNotifyRewardAmount =
  /*#__PURE__*/ createSimulateContract({
    abi: votingRewardAbi,
    functionName: 'notifyRewardAmount',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const simulateVotingRewardRenounceOwnership =
  /*#__PURE__*/ createSimulateContract({
    abi: votingRewardAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"renounceRole"`
 */
export const simulateVotingRewardRenounceRole =
  /*#__PURE__*/ createSimulateContract({
    abi: votingRewardAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"revokeRole"`
 */
export const simulateVotingRewardRevokeRole =
  /*#__PURE__*/ createSimulateContract({
    abi: votingRewardAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"transferERC20"`
 */
export const simulateVotingRewardTransferErc20 =
  /*#__PURE__*/ createSimulateContract({
    abi: votingRewardAbi,
    functionName: 'transferERC20',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const simulateVotingRewardTransferOwnership =
  /*#__PURE__*/ createSimulateContract({
    abi: votingRewardAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link votingRewardAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const simulateVotingRewardUpgradeToAndCall =
  /*#__PURE__*/ createSimulateContract({
    abi: votingRewardAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link votingRewardAbi}__
 */
export const watchVotingRewardEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: votingRewardAbi,
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link votingRewardAbi}__ and `eventName` set to `"ClaimReward"`
 */
export const watchVotingRewardClaimRewardEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: votingRewardAbi,
    eventName: 'ClaimReward',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link votingRewardAbi}__ and `eventName` set to `"Deposit"`
 */
export const watchVotingRewardDepositEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: votingRewardAbi,
    eventName: 'Deposit',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link votingRewardAbi}__ and `eventName` set to `"IncentivizedReward"`
 */
export const watchVotingRewardIncentivizedRewardEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: votingRewardAbi,
    eventName: 'IncentivizedReward',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link votingRewardAbi}__ and `eventName` set to `"Initialized"`
 */
export const watchVotingRewardInitializedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: votingRewardAbi,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link votingRewardAbi}__ and `eventName` set to `"NotifyReward"`
 */
export const watchVotingRewardNotifyRewardEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: votingRewardAbi,
    eventName: 'NotifyReward',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link votingRewardAbi}__ and `eventName` set to `"OwnershipTransferStarted"`
 */
export const watchVotingRewardOwnershipTransferStartedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: votingRewardAbi,
    eventName: 'OwnershipTransferStarted',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link votingRewardAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const watchVotingRewardOwnershipTransferredEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: votingRewardAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link votingRewardAbi}__ and `eventName` set to `"RoleAdminChanged"`
 */
export const watchVotingRewardRoleAdminChangedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: votingRewardAbi,
    eventName: 'RoleAdminChanged',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link votingRewardAbi}__ and `eventName` set to `"RoleGranted"`
 */
export const watchVotingRewardRoleGrantedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: votingRewardAbi,
    eventName: 'RoleGranted',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link votingRewardAbi}__ and `eventName` set to `"RoleRevoked"`
 */
export const watchVotingRewardRoleRevokedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: votingRewardAbi,
    eventName: 'RoleRevoked',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link votingRewardAbi}__ and `eventName` set to `"Upgraded"`
 */
export const watchVotingRewardUpgradedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: votingRewardAbi,
    eventName: 'Upgraded',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link votingRewardAbi}__ and `eventName` set to `"Withdraw"`
 */
export const watchVotingRewardWithdrawEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: votingRewardAbi,
    eventName: 'Withdraw',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link wrappedNativeAbi}__
 */
export const readWrappedNative = /*#__PURE__*/ createReadContract({
  abi: wrappedNativeAbi,
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link wrappedNativeAbi}__ and `functionName` set to `"name"`
 */
export const readWrappedNativeName = /*#__PURE__*/ createReadContract({
  abi: wrappedNativeAbi,
  functionName: 'name',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link wrappedNativeAbi}__ and `functionName` set to `"totalSupply"`
 */
export const readWrappedNativeTotalSupply = /*#__PURE__*/ createReadContract({
  abi: wrappedNativeAbi,
  functionName: 'totalSupply',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link wrappedNativeAbi}__ and `functionName` set to `"decimals"`
 */
export const readWrappedNativeDecimals = /*#__PURE__*/ createReadContract({
  abi: wrappedNativeAbi,
  functionName: 'decimals',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link wrappedNativeAbi}__ and `functionName` set to `"balanceOf"`
 */
export const readWrappedNativeBalanceOf = /*#__PURE__*/ createReadContract({
  abi: wrappedNativeAbi,
  functionName: 'balanceOf',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link wrappedNativeAbi}__ and `functionName` set to `"symbol"`
 */
export const readWrappedNativeSymbol = /*#__PURE__*/ createReadContract({
  abi: wrappedNativeAbi,
  functionName: 'symbol',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link wrappedNativeAbi}__ and `functionName` set to `"allowance"`
 */
export const readWrappedNativeAllowance = /*#__PURE__*/ createReadContract({
  abi: wrappedNativeAbi,
  functionName: 'allowance',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link wrappedNativeAbi}__
 */
export const writeWrappedNative = /*#__PURE__*/ createWriteContract({
  abi: wrappedNativeAbi,
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link wrappedNativeAbi}__ and `functionName` set to `"approve"`
 */
export const writeWrappedNativeApprove = /*#__PURE__*/ createWriteContract({
  abi: wrappedNativeAbi,
  functionName: 'approve',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link wrappedNativeAbi}__ and `functionName` set to `"transferFrom"`
 */
export const writeWrappedNativeTransferFrom = /*#__PURE__*/ createWriteContract(
  { abi: wrappedNativeAbi, functionName: 'transferFrom' },
)

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link wrappedNativeAbi}__ and `functionName` set to `"withdraw"`
 */
export const writeWrappedNativeWithdraw = /*#__PURE__*/ createWriteContract({
  abi: wrappedNativeAbi,
  functionName: 'withdraw',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link wrappedNativeAbi}__ and `functionName` set to `"transfer"`
 */
export const writeWrappedNativeTransfer = /*#__PURE__*/ createWriteContract({
  abi: wrappedNativeAbi,
  functionName: 'transfer',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link wrappedNativeAbi}__ and `functionName` set to `"deposit"`
 */
export const writeWrappedNativeDeposit = /*#__PURE__*/ createWriteContract({
  abi: wrappedNativeAbi,
  functionName: 'deposit',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link wrappedNativeAbi}__
 */
export const simulateWrappedNative = /*#__PURE__*/ createSimulateContract({
  abi: wrappedNativeAbi,
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link wrappedNativeAbi}__ and `functionName` set to `"approve"`
 */
export const simulateWrappedNativeApprove =
  /*#__PURE__*/ createSimulateContract({
    abi: wrappedNativeAbi,
    functionName: 'approve',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link wrappedNativeAbi}__ and `functionName` set to `"transferFrom"`
 */
export const simulateWrappedNativeTransferFrom =
  /*#__PURE__*/ createSimulateContract({
    abi: wrappedNativeAbi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link wrappedNativeAbi}__ and `functionName` set to `"withdraw"`
 */
export const simulateWrappedNativeWithdraw =
  /*#__PURE__*/ createSimulateContract({
    abi: wrappedNativeAbi,
    functionName: 'withdraw',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link wrappedNativeAbi}__ and `functionName` set to `"transfer"`
 */
export const simulateWrappedNativeTransfer =
  /*#__PURE__*/ createSimulateContract({
    abi: wrappedNativeAbi,
    functionName: 'transfer',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link wrappedNativeAbi}__ and `functionName` set to `"deposit"`
 */
export const simulateWrappedNativeDeposit =
  /*#__PURE__*/ createSimulateContract({
    abi: wrappedNativeAbi,
    functionName: 'deposit',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link wrappedNativeAbi}__
 */
export const watchWrappedNativeEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: wrappedNativeAbi,
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link wrappedNativeAbi}__ and `eventName` set to `"Approval"`
 */
export const watchWrappedNativeApprovalEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: wrappedNativeAbi,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link wrappedNativeAbi}__ and `eventName` set to `"Transfer"`
 */
export const watchWrappedNativeTransferEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: wrappedNativeAbi,
    eventName: 'Transfer',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link wrappedNativeAbi}__ and `eventName` set to `"Deposit"`
 */
export const watchWrappedNativeDepositEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: wrappedNativeAbi,
    eventName: 'Deposit',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link wrappedNativeAbi}__ and `eventName` set to `"Withdrawal"`
 */
export const watchWrappedNativeWithdrawalEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: wrappedNativeAbi,
    eventName: 'Withdrawal',
  })
