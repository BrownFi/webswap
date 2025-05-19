function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = require('react');
var JSBI = _interopDefault(require('jsbi'));
var invariant = _interopDefault(require('tiny-invariant'));
var warning = _interopDefault(require('tiny-warning'));
var address = require('@ethersproject/address');
var ethers = _interopDefault(require('ethers'));
var Web3 = _interopDefault(require('web3'));
var axios = _interopDefault(require('axios'));
var _Big = _interopDefault(require('big.js'));
var toFormat = _interopDefault(require('toformat'));
var _Decimal = _interopDefault(require('decimal.js-light'));
var solidity = require('@ethersproject/solidity');
var contracts = require('@ethersproject/contracts');
var networks$1 = require('@ethersproject/networks');
var providers = require('@ethersproject/providers');
var starknet = require('starknet');

function _arrayLikeToArray(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}
function _construct(t, e, r) {
  if (_isNativeReflectConstruct()) return Reflect.construct.apply(null, arguments);
  var o = [null];
  o.push.apply(o, e);
  var p = new (t.bind.apply(t, o))();
  return r && _setPrototypeOf(p, r.prototype), p;
}
function _defineProperties(e, r) {
  for (var t = 0; t < r.length; t++) {
    var o = r[t];
    o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o);
  }
}
function _createClass(e, r, t) {
  return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", {
    writable: !1
  }), e;
}
function _createForOfIteratorHelperLoose(r, e) {
  var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (t) return (t = t.call(r)).next.bind(t);
  if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) {
    t && (r = t);
    var o = 0;
    return function () {
      return o >= r.length ? {
        done: !0
      } : {
        done: !1,
        value: r[o++]
      };
    };
  }
  throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _extends() {
  return _extends = Object.assign ? Object.assign.bind() : function (n) {
    for (var e = 1; e < arguments.length; e++) {
      var t = arguments[e];
      for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
    }
    return n;
  }, _extends.apply(null, arguments);
}
function _getPrototypeOf(t) {
  return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) {
    return t.__proto__ || Object.getPrototypeOf(t);
  }, _getPrototypeOf(t);
}
function _inheritsLoose(t, o) {
  t.prototype = Object.create(o.prototype), t.prototype.constructor = t, _setPrototypeOf(t, o);
}
function _isNativeFunction(t) {
  try {
    return -1 !== Function.toString.call(t).indexOf("[native code]");
  } catch (n) {
    return "function" == typeof t;
  }
}
function _isNativeReflectConstruct() {
  try {
    var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
  } catch (t) {}
  return (_isNativeReflectConstruct = function () {
    return !!t;
  })();
}
function _setPrototypeOf(t, e) {
  return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) {
    return t.__proto__ = e, t;
  }, _setPrototypeOf(t, e);
}
function _toPrimitive(t, r) {
  if ("object" != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  return "symbol" == typeof i ? i : i + "";
}
function _unsupportedIterableToArray(r, a) {
  if (r) {
    if ("string" == typeof r) return _arrayLikeToArray(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
  }
}
function _wrapNativeSuper(t) {
  var r = "function" == typeof Map ? new Map() : void 0;
  return _wrapNativeSuper = function (t) {
    if (null === t || !_isNativeFunction(t)) return t;
    if ("function" != typeof t) throw new TypeError("Super expression must either be null or a function");
    if (void 0 !== r) {
      if (r.has(t)) return r.get(t);
      r.set(t, Wrapper);
    }
    function Wrapper() {
      return _construct(t, arguments, _getPrototypeOf(this).constructor);
    }
    return Wrapper.prototype = Object.create(t.prototype, {
      constructor: {
        value: Wrapper,
        enumerable: !1,
        writable: !0,
        configurable: !0
      }
    }), _setPrototypeOf(Wrapper, t);
  }, _wrapNativeSuper(t);
}

var _ChainIdHex, _FACTORY_ADDRESS, _INIT_CODE_HASH, _SOLIDITY_TYPE_MAXIMA;
(function (ChainId) {
  ChainId[ChainId["MAINNET"] = 1] = "MAINNET";
  ChainId[ChainId["SEPOLIA"] = 11155111] = "SEPOLIA";
  ChainId[ChainId["SN_MAIN"] = -1] = "SN_MAIN";
  ChainId[ChainId["SN_SEPOLIA"] = -11155111] = "SN_SEPOLIA";
  ChainId[ChainId["BSC_TESTNET"] = 97] = "BSC_TESTNET";
  ChainId[ChainId["VICTION_TESTNET"] = 89] = "VICTION_TESTNET";
  ChainId[ChainId["VICTION_MAINNET"] = 88] = "VICTION_MAINNET";
  ChainId[ChainId["SONIC_TESTNET"] = 64165] = "SONIC_TESTNET";
  ChainId[ChainId["MINATO_SONEIUM"] = 1946] = "MINATO_SONEIUM";
  ChainId[ChainId["BASE_SEPOLIA"] = 84532] = "BASE_SEPOLIA";
  ChainId[ChainId["UNICHAIN_SEPOLIA"] = 1301] = "UNICHAIN_SEPOLIA";
  ChainId[ChainId["AURORA_TESTNET"] = 1313161555] = "AURORA_TESTNET";
  ChainId[ChainId["METIS_MAINNET"] = 1088] = "METIS_MAINNET";
  ChainId[ChainId["TAIKO_TESTNET"] = 167009] = "TAIKO_TESTNET";
  ChainId[ChainId["BOBA_TESTNET"] = 28882] = "BOBA_TESTNET";
  ChainId[ChainId["NEOX_MAINNET"] = 47763] = "NEOX_MAINNET";
  ChainId[ChainId["U2U_MAINNET"] = 39] = "U2U_MAINNET";
  ChainId[ChainId["SCROLL_TESTNET"] = 534351] = "SCROLL_TESTNET";
  ChainId[ChainId["ARBITRUM_MAINNET"] = 42161] = "ARBITRUM_MAINNET";
  ChainId[ChainId["OP_MAINNET"] = 10] = "OP_MAINNET";
  ChainId[ChainId["BOBA_MAINNET"] = 288] = "BOBA_MAINNET";
  ChainId[ChainId["BERA_MAINNET"] = 80094] = "BERA_MAINNET";
})(exports.ChainId || (exports.ChainId = {}));
var ChainIdHex = (_ChainIdHex = {}, _ChainIdHex[exports.ChainId.MAINNET] = '0x1', _ChainIdHex[exports.ChainId.SEPOLIA] = '0xaa36a7', _ChainIdHex[exports.ChainId.BSC_TESTNET] = '0x61', _ChainIdHex[exports.ChainId.VICTION_TESTNET] = '0x59', _ChainIdHex[exports.ChainId.VICTION_MAINNET] = '0x58', _ChainIdHex[exports.ChainId.SONIC_TESTNET] = '0xFAA5', _ChainIdHex[exports.ChainId.MINATO_SONEIUM] = '0x79A', _ChainIdHex[exports.ChainId.BASE_SEPOLIA] = '0x14a34', _ChainIdHex[exports.ChainId.UNICHAIN_SEPOLIA] = '0x515', _ChainIdHex[exports.ChainId.AURORA_TESTNET] = '0x4e454153', _ChainIdHex[exports.ChainId.METIS_MAINNET] = '0x440', _ChainIdHex[exports.ChainId.TAIKO_TESTNET] = '0x28c61', _ChainIdHex[exports.ChainId.BOBA_TESTNET] = '0x70d2', _ChainIdHex[exports.ChainId.NEOX_MAINNET] = '0xba93', _ChainIdHex[exports.ChainId.U2U_MAINNET] = '0x27', _ChainIdHex[exports.ChainId.SCROLL_TESTNET] = '0x8274f', _ChainIdHex[exports.ChainId.ARBITRUM_MAINNET] = '0xa4b1', _ChainIdHex[exports.ChainId.OP_MAINNET] = '0xa', _ChainIdHex[exports.ChainId.BOBA_MAINNET] = '0x120', _ChainIdHex[exports.ChainId.BERA_MAINNET] = '0x138de', _ChainIdHex);
(function (TradeType) {
  TradeType[TradeType["EXACT_INPUT"] = 0] = "EXACT_INPUT";
  TradeType[TradeType["EXACT_OUTPUT"] = 1] = "EXACT_OUTPUT";
})(exports.TradeType || (exports.TradeType = {}));
(function (Rounding) {
  Rounding[Rounding["ROUND_DOWN"] = 0] = "ROUND_DOWN";
  Rounding[Rounding["ROUND_HALF_UP"] = 1] = "ROUND_HALF_UP";
  Rounding[Rounding["ROUND_UP"] = 2] = "ROUND_UP";
})(exports.Rounding || (exports.Rounding = {}));
var FACTORY_ADDRESS = (_FACTORY_ADDRESS = {}, _FACTORY_ADDRESS[exports.ChainId.MAINNET] = '0xD705B4e18055D8Fa1d099d0533163a9e8fA09E4A', _FACTORY_ADDRESS[exports.ChainId.SEPOLIA] = '0x43aFB543FdbcD0F00CeA9119819225F5Dc1Ec55d', _FACTORY_ADDRESS[exports.ChainId.SN_MAIN] = '', _FACTORY_ADDRESS[exports.ChainId.SN_SEPOLIA] = '0x05d789e22a62125d58773cd899e1b609b476b5daa0c86dccb32c72836dcec906', _FACTORY_ADDRESS[exports.ChainId.BSC_TESTNET] = '0xE780EEd4C1bADbdcbc702C7e6870Cab51005444A', _FACTORY_ADDRESS[exports.ChainId.VICTION_TESTNET] = '0x782783378a9D3BCCC8d9A03F5ED452263758a571', _FACTORY_ADDRESS[exports.ChainId.VICTION_MAINNET] = '0xa80258Eea4BA0865610eb239045737D08929c40b', _FACTORY_ADDRESS[exports.ChainId.SONIC_TESTNET] = '0x7cb2CF3dde3d518b408ea0B83738C067EEdb571D', _FACTORY_ADDRESS[exports.ChainId.MINATO_SONEIUM] = '0x0e63FffdB5d9Db4a3595Dc9F87cB6BBc4789fF9e', _FACTORY_ADDRESS[exports.ChainId.BASE_SEPOLIA] = '0x86d86dD68a2D7FD82de9760D447f1Ef11644B535', _FACTORY_ADDRESS[exports.ChainId.UNICHAIN_SEPOLIA] = '0x86d86dD68a2D7FD82de9760D447f1Ef11644B535', _FACTORY_ADDRESS[exports.ChainId.AURORA_TESTNET] = '0x86d86dd68a2d7fd82de9760d447f1ef11644b535', _FACTORY_ADDRESS[exports.ChainId.METIS_MAINNET] = '0x797691C82093Fe9EfAD6ceAcB1FC3080C2a4F85A', _FACTORY_ADDRESS[exports.ChainId.TAIKO_TESTNET] = '0x86d86dD68a2D7FD82de9760D447f1Ef11644B535', _FACTORY_ADDRESS[exports.ChainId.BOBA_TESTNET] = '0x7cb2CF3dde3d518b408ea0B83738C067EEdb571D', _FACTORY_ADDRESS[exports.ChainId.NEOX_MAINNET] = '0x40c2Be0C8c421235BDD93714BCac4ffB6A4067a5', _FACTORY_ADDRESS[exports.ChainId.U2U_MAINNET] = '0xb077EA75Bf218bf028AcEEBe61AEA4c4Ad85f62c', _FACTORY_ADDRESS[exports.ChainId.SCROLL_TESTNET] = '0x7cb2CF3dde3d518b408ea0B83738C067EEdb571D', _FACTORY_ADDRESS[exports.ChainId.ARBITRUM_MAINNET] = '0xb077EA75Bf218bf028AcEEBe61AEA4c4Ad85f62c', _FACTORY_ADDRESS[exports.ChainId.OP_MAINNET] = '0xb077EA75Bf218bf028AcEEBe61AEA4c4Ad85f62c', _FACTORY_ADDRESS[exports.ChainId.BOBA_MAINNET] = '0xb077EA75Bf218bf028AcEEBe61AEA4c4Ad85f62c', _FACTORY_ADDRESS[exports.ChainId.BERA_MAINNET] = '0xb077EA75Bf218bf028AcEEBe61AEA4c4Ad85f62c', _FACTORY_ADDRESS);
var INIT_CODE_HASH = (_INIT_CODE_HASH = {}, _INIT_CODE_HASH[exports.ChainId.MAINNET] = '0xa92e1262e78c2029fb68aa25cd33df22da5c26a36d5ca3e7f82777add081632c', _INIT_CODE_HASH[exports.ChainId.SEPOLIA] = '0xbcc73a27bdc3b703355edcfc04a012b1f2429e8501166b39158c19d079d031d1', _INIT_CODE_HASH[exports.ChainId.BSC_TESTNET] = '0x6b3b1d7e371199ab6de148d0ee63bc6809b9691d75ef9341bf6950bf4501702b', _INIT_CODE_HASH[exports.ChainId.VICTION_TESTNET] = '0x711312ac9a4efcfb1916d57f2ec6e03f5e1299e46f449ac9400da95ffc6d5a42', _INIT_CODE_HASH[exports.ChainId.VICTION_MAINNET] = '0x330370b2bbf44605dd620805d2a2da4be4d6830689cdc295936cb2f1efb5e4af', _INIT_CODE_HASH[exports.ChainId.SONIC_TESTNET] = '0x114d0544828b902794dd44ecddc6d536315d4f8ef581de0fcac30677b2b9e26b', _INIT_CODE_HASH[exports.ChainId.MINATO_SONEIUM] = '0xf2eab90754ebe4f7948efc0065f1fec022ffaed2fff5c5048776cf8ce4701a19', _INIT_CODE_HASH[exports.ChainId.BASE_SEPOLIA] = '0x330370b2bbf44605dd620805d2a2da4be4d6830689cdc295936cb2f1efb5e4af', _INIT_CODE_HASH[exports.ChainId.UNICHAIN_SEPOLIA] = '0x330370b2bbf44605dd620805d2a2da4be4d6830689cdc295936cb2f1efb5e4af', _INIT_CODE_HASH[exports.ChainId.AURORA_TESTNET] = '0x330370b2bbf44605dd620805d2a2da4be4d6830689cdc295936cb2f1efb5e4af', _INIT_CODE_HASH[exports.ChainId.METIS_MAINNET] = '0x330370b2bbf44605dd620805d2a2da4be4d6830689cdc295936cb2f1efb5e4af', _INIT_CODE_HASH[exports.ChainId.TAIKO_TESTNET] = '0x330370b2bbf44605dd620805d2a2da4be4d6830689cdc295936cb2f1efb5e4af', _INIT_CODE_HASH[exports.ChainId.BOBA_TESTNET] = '0x330370b2bbf44605dd620805d2a2da4be4d6830689cdc295936cb2f1efb5e4af', _INIT_CODE_HASH[exports.ChainId.NEOX_MAINNET] = '0x330370b2bbf44605dd620805d2a2da4be4d6830689cdc295936cb2f1efb5e4af', _INIT_CODE_HASH[exports.ChainId.U2U_MAINNET] = '0x330370b2bbf44605dd620805d2a2da4be4d6830689cdc295936cb2f1efb5e4af', _INIT_CODE_HASH[exports.ChainId.SCROLL_TESTNET] = '0x330370b2bbf44605dd620805d2a2da4be4d6830689cdc295936cb2f1efb5e4af', _INIT_CODE_HASH[exports.ChainId.ARBITRUM_MAINNET] = '0x330370b2bbf44605dd620805d2a2da4be4d6830689cdc295936cb2f1efb5e4af', _INIT_CODE_HASH[exports.ChainId.OP_MAINNET] = '0x330370b2bbf44605dd620805d2a2da4be4d6830689cdc295936cb2f1efb5e4af', _INIT_CODE_HASH[exports.ChainId.BOBA_MAINNET] = '0x330370b2bbf44605dd620805d2a2da4be4d6830689cdc295936cb2f1efb5e4af', _INIT_CODE_HASH[exports.ChainId.BERA_MAINNET] = '0x330370b2bbf44605dd620805d2a2da4be4d6830689cdc295936cb2f1efb5e4af', _INIT_CODE_HASH);
var MINIMUM_LIQUIDITY = JSBI.BigInt(1000);
var ZERO = JSBI.BigInt(0);
var ONE = JSBI.BigInt(1);
var TWO = JSBI.BigInt(2);
var THREE = JSBI.BigInt(3);
var FIVE = JSBI.BigInt(5);
var TEN = JSBI.BigInt(10);
var _100 = JSBI.BigInt(100);
var _997 = JSBI.BigInt(997);
var _1000 = JSBI.BigInt(1000);
var SolidityType;
(function (SolidityType) {
  SolidityType["uint8"] = "uint8";
  SolidityType["uint256"] = "uint256";
})(SolidityType || (SolidityType = {}));
var SOLIDITY_TYPE_MAXIMA = (_SOLIDITY_TYPE_MAXIMA = {}, _SOLIDITY_TYPE_MAXIMA[SolidityType.uint8] = JSBI.BigInt('0xff'), _SOLIDITY_TYPE_MAXIMA[SolidityType.uint256] = JSBI.BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'), _SOLIDITY_TYPE_MAXIMA);

var CAN_SET_PROTOTYPE = 'setPrototypeOf' in Object;
var InsufficientReservesError = /*#__PURE__*/function (_Error) {
  function InsufficientReservesError() {
    var _this;
    _this = _Error.call(this) || this;
    _this.isInsufficientReservesError = true;
    _this.name = _this.constructor.name;
    _this.message = 'INSUFFICIENT_RESERVES_ERROR';
    if (CAN_SET_PROTOTYPE) Object.setPrototypeOf(_this, (this instanceof InsufficientReservesError ? this.constructor : void 0).prototype);
    return _this;
  }
  _inheritsLoose(InsufficientReservesError, _Error);
  return InsufficientReservesError;
}( /*#__PURE__*/_wrapNativeSuper(Error));
var InsufficientInputAmountError = /*#__PURE__*/function (_Error2) {
  function InsufficientInputAmountError() {
    var _this2;
    _this2 = _Error2.call(this) || this;
    _this2.isInsufficientInputAmountError = true;
    _this2.name = _this2.constructor.name;
    _this2.message = 'INSUFFICIENT_INPUT_AMOUNT';
    if (CAN_SET_PROTOTYPE) Object.setPrototypeOf(_this2, (this instanceof InsufficientInputAmountError ? this.constructor : void 0).prototype);
    return _this2;
  }
  _inheritsLoose(InsufficientInputAmountError, _Error2);
  return InsufficientInputAmountError;
}( /*#__PURE__*/_wrapNativeSuper(Error));

var IFactoryV2 = [
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "token0",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "token1",
				type: "address"
			},
			{
				indexed: false,
				internalType: "address",
				name: "pair",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "totalPair",
				type: "uint256"
			}
		],
		name: "PairCreated",
		type: "event"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		name: "allPairs",
		outputs: [
			{
				internalType: "address",
				name: "pair",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "allPairsLength",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "tokenA",
				type: "address"
			},
			{
				internalType: "address",
				name: "tokenB",
				type: "address"
			},
			{
				internalType: "bytes32",
				name: "priceFeedA",
				type: "bytes32"
			},
			{
				internalType: "bytes32",
				name: "priceFeedB",
				type: "bytes32"
			}
		],
		name: "createPair",
		outputs: [
			{
				internalType: "address",
				name: "pair",
				type: "address"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
		],
		name: "feeTo",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "feeToSetter",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "tokenA",
				type: "address"
			},
			{
				internalType: "address",
				name: "tokenB",
				type: "address"
			}
		],
		name: "getPair",
		outputs: [
			{
				internalType: "address",
				name: "pair",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "minPriceAge",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "token",
				type: "address"
			}
		],
		name: "priceFeedIds",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "token",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "priceAge",
				type: "uint256"
			}
		],
		name: "priceOf",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "pyth",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		name: "setFeeTo",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		name: "setFeeToSetter",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "age",
				type: "uint256"
			}
		],
		name: "setMinPriceAge",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "token",
				type: "address"
			},
			{
				internalType: "bytes32",
				name: "priceFeedId",
				type: "bytes32"
			}
		],
		name: "setOracleOf",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	}
];

function validateSolidityTypeInstance(value, solidityType) {
  invariant(JSBI.greaterThanOrEqual(value, ZERO), value + " is not a " + solidityType + ".");
  invariant(JSBI.lessThanOrEqual(value, SOLIDITY_TYPE_MAXIMA[solidityType]), value + " is not a " + solidityType + ".");
}
function validateAndParseAddress(address$1, chainId) {
  try {
    if (chainId === exports.ChainId.SN_MAIN || chainId === exports.ChainId.SN_SEPOLIA) {
      return address$1;
    }
    var checksummedAddress = address.getAddress(address$1);
    warning(address$1 === checksummedAddress, address$1 + " is not checksummed.");
    return checksummedAddress;
  } catch (error) {
    invariant(false, address$1 + " is not a valid address.");
  }
}
function parseBigintIsh(bigintIsh) {
  return bigintIsh instanceof JSBI ? bigintIsh : typeof bigintIsh === 'bigint' ? JSBI.BigInt(bigintIsh.toString()) : JSBI.BigInt(bigintIsh);
}
function sqrt(y) {
  validateSolidityTypeInstance(y, SolidityType.uint256);
  var z = ZERO;
  var x;
  if (JSBI.greaterThan(y, THREE)) {
    z = y;
    x = JSBI.add(JSBI.divide(y, TWO), ONE);
    while (JSBI.lessThan(x, z)) {
      z = x;
      x = JSBI.divide(JSBI.add(JSBI.divide(y, x), x), TWO);
    }
  } else if (JSBI.notEqual(y, ZERO)) {
    z = ONE;
  }
  return z;
}
function sortedInsert(items, add, maxSize, comparator) {
  invariant(maxSize > 0, 'MAX_SIZE_ZERO');
  invariant(items.length <= maxSize, 'ITEMS_SIZE');
  if (items.length === 0) {
    items.push(add);
    return null;
  } else {
    var isFull = items.length === maxSize;
    if (isFull && comparator(items[items.length - 1], add) <= 0) {
      return add;
    }
    var lo = 0;
    var hi = items.length;
    while (lo < hi) {
      var mid = lo + hi >>> 1;
      if (comparator(items[mid], add) <= 0) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }
    items.splice(lo, 0, add);
    return isFull ? items.pop() : null;
  }
}
function supportContractWithPrice(chainId) {
  return chainId === exports.ChainId.VICTION_MAINNET || chainId === exports.ChainId.SONIC_TESTNET || chainId === exports.ChainId.AURORA_TESTNET || chainId === exports.ChainId.TAIKO_TESTNET || chainId === exports.ChainId.BOBA_TESTNET || chainId === exports.ChainId.BOBA_MAINNET || chainId === exports.ChainId.BERA_MAINNET;
}
function isRouterV2(chainId) {
  return chainId === exports.ChainId.SEPOLIA;
}
function isTestnetSkipAmountsMin(chainId) {
  return chainId === exports.ChainId.SEPOLIA;
}
var getDataBytes = function getDataBytes(chainId, addresses) {
  try {
    var web3 = new Web3(new Web3.providers.HttpProvider(RPC_URLS[chainId]));
    var factoryContract = new web3.eth.Contract(IFactoryV2, FACTORY_ADDRESS[chainId]);
    return Promise.resolve(Promise.all(addresses.map(function (address) {
      try {
        return Promise.resolve(factoryContract.methods.priceFeedIds(address).call());
      } catch (e) {
        return Promise.reject(e);
      }
    }))).then(function (priceFeedIds) {
      return Promise.resolve(axios.get('https://hermes.pyth.network/v2/updates/price/latest', {
        params: {
          ids: priceFeedIds
        }
      })).then(function (_ref) {
        var dataBytes = _ref.data;
        return dataBytes.binary.data.map(function (_byte) {
          return "0x" + _byte;
        });
      });
    });
  } catch (e) {
    return Promise.reject(e);
  }
};
var solidityPack = function solidityPack(chainId, addresses) {
  return Promise.resolve(getDataBytes(chainId, addresses)).then(function (dataBytes) {
    return ethers.utils.defaultAbiCoder.encode(['bytes[]'], [dataBytes]);
  });
};

var Currency = function Currency(decimals, symbol, name) {
  validateSolidityTypeInstance(JSBI.BigInt(decimals), SolidityType.uint8);
  this.decimals = decimals;
  this.symbol = symbol;
  this.name = name;
};
Currency.ETHER = new Currency(18, 'ETH', 'Ether');
var ETHER = Currency.ETHER;

var _WETH;
var Token = /*#__PURE__*/function (_Currency) {
  function Token(chainId, address, decimals, symbol, name) {
    var _this;
    _this = _Currency.call(this, decimals, symbol, name) || this;
    _this.chainId = chainId;
    _this.address = validateAndParseAddress(address, chainId);
    return _this;
  }
  _inheritsLoose(Token, _Currency);
  var _proto = Token.prototype;
  _proto.equals = function equals(other) {
    if (this === other) {
      return true;
    }
    return this.chainId === other.chainId && this.address === other.address;
  };
  _proto.sortsBefore = function sortsBefore(other) {
    invariant(this.chainId === other.chainId, 'CHAIN_IDS');
    invariant(this.address !== other.address, 'ADDRESSES');
    return this.address.toLowerCase() < other.address.toLowerCase();
  };
  return Token;
}(Currency);
function currencyEquals(currencyA, currencyB) {
  if (currencyA instanceof Token && currencyB instanceof Token) {
    return currencyA.equals(currencyB);
  } else if (currencyA instanceof Token) {
    return false;
  } else if (currencyB instanceof Token) {
    return false;
  } else {
    return currencyA === currencyB;
  }
}
var WETH = (_WETH = {}, _WETH[exports.ChainId.MAINNET] = new Token(exports.ChainId.MAINNET, '0xC054751BdBD24Ae713BA3Dc9Bd9434aBe2abc1ce', 18, 'WETH', 'Wrapped Ether'), _WETH[exports.ChainId.SEPOLIA] = new Token(exports.ChainId.SEPOLIA, '0xfff9976782d46cc05630d1f6ebab18b2324d6b14', 18, 'WETH', 'Wrapped Ether'), _WETH[exports.ChainId.SN_MAIN] = new Token(exports.ChainId.SN_SEPOLIA, '0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7', 18, 'ETH', 'Ether'), _WETH[exports.ChainId.SN_SEPOLIA] = new Token(exports.ChainId.SN_SEPOLIA, '0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7', 18, 'ETH', 'Ether'), _WETH[exports.ChainId.BSC_TESTNET] = new Token(exports.ChainId.BSC_TESTNET, '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd', 18, 'WBNB', 'Wrapped BNB'), _WETH[exports.ChainId.VICTION_TESTNET] = new Token(exports.ChainId.VICTION_TESTNET, '0x8Aca9B80b6752Ec62e06eC48E07a301e97852dAA', 18, 'WVIC', 'Wrapped VIC'), _WETH[exports.ChainId.VICTION_MAINNET] = new Token(exports.ChainId.VICTION_MAINNET, '0xC054751BdBD24Ae713BA3Dc9Bd9434aBe2abc1ce', 18, 'WVIC', 'Wrapped VIC'), _WETH[exports.ChainId.SONIC_TESTNET] = new Token(exports.ChainId.SONIC_TESTNET, '0x782783378a9D3BCCC8d9A03F5ED452263758a571', 18, 'WS', 'Wrapped S'), _WETH[exports.ChainId.MINATO_SONEIUM] = new Token(exports.ChainId.MINATO_SONEIUM, '0x4200000000000000000000000000000000000006', 18, 'WETH', 'Wrapped ETH'), _WETH[exports.ChainId.BASE_SEPOLIA] = new Token(exports.ChainId.BASE_SEPOLIA, '0x4200000000000000000000000000000000000006', 18, 'WETH', 'Wrapped Ether'), _WETH[exports.ChainId.UNICHAIN_SEPOLIA] = new Token(exports.ChainId.UNICHAIN_SEPOLIA, '0x4200000000000000000000000000000000000006', 18, 'ETH', 'Wrapped Ether'), _WETH[exports.ChainId.AURORA_TESTNET] = new Token(exports.ChainId.AURORA_TESTNET, '0x8aca9b80b6752ec62e06ec48e07a301e97852daa', 18, 'WETH', 'Wrapped ETH'), _WETH[exports.ChainId.METIS_MAINNET] = new Token(exports.ChainId.METIS_MAINNET, '0x75cb093e4d61d2a2e65d8e0bbb01de8d89b53481', 18, 'WMETIS', 'Wrapped METIS'), _WETH[exports.ChainId.TAIKO_TESTNET] = new Token(exports.ChainId.TAIKO_TESTNET, '0xae2C46ddb314B9Ba743C6dEE4878F151881333D9', 18, 'WETH', 'Wrapped ETH'), _WETH[exports.ChainId.BOBA_TESTNET] = new Token(exports.ChainId.BOBA_TESTNET, '0x0f97Ca4E6B118502f83DD3Ce836A14Cb4937ed2a', 18, 'WBOBA', 'Wrapped BOBA'), _WETH[exports.ChainId.NEOX_MAINNET] = new Token(exports.ChainId.NEOX_MAINNET, '0xdE41591ED1f8ED1484aC2CD8ca0876428de60EfF', 18, 'WGAS10', 'Wrapped GAS v10'), _WETH[exports.ChainId.U2U_MAINNET] = new Token(exports.ChainId.U2U_MAINNET, '0xA99cf32e9aAa700f9E881BA9BF2C57A211ae94df', 18, 'WU2U', 'Wrapped U2U'), _WETH[exports.ChainId.SCROLL_TESTNET] = new Token(exports.ChainId.SCROLL_TESTNET, '0x86d86dD68a2D7FD82de9760D447f1Ef11644B535', 18, 'WETH', 'Wrapped ETH'), _WETH[exports.ChainId.ARBITRUM_MAINNET] = new Token(exports.ChainId.ARBITRUM_MAINNET, '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', 18, 'WETH', 'Wrapped ETH'), _WETH[exports.ChainId.OP_MAINNET] = new Token(exports.ChainId.OP_MAINNET, '0x4200000000000000000000000000000000000006', 18, 'WETH', 'Wrapped ETH'), _WETH[exports.ChainId.BOBA_MAINNET] = new Token(exports.ChainId.BOBA_MAINNET, '0xa18bF3994C0Cc6E3b63ac420308E5383f53120D7', 18, 'ETH', 'Wrapped ETH'), _WETH[exports.ChainId.BERA_MAINNET] = new Token(exports.ChainId.BERA_MAINNET, '0x6969696969696969696969696969696969696969', 18, 'WBERA', 'Wrapped Bera'), _WETH);

var _toSignificantRoundin, _toFixedRounding;
var Decimal = toFormat(_Decimal);
var Big = toFormat(_Big);
var RoundingMode;
(function (RoundingMode) {
  RoundingMode[RoundingMode["RoundDown"] = 0] = "RoundDown";
  RoundingMode[RoundingMode["RoundHalfUp"] = 1] = "RoundHalfUp";
  RoundingMode[RoundingMode["RoundHalfEven"] = 2] = "RoundHalfEven";
  RoundingMode[RoundingMode["RoundUp"] = 3] = "RoundUp";
})(RoundingMode || (RoundingMode = {}));
var toSignificantRounding = (_toSignificantRoundin = {}, _toSignificantRoundin[exports.Rounding.ROUND_DOWN] = Decimal.ROUND_DOWN, _toSignificantRoundin[exports.Rounding.ROUND_HALF_UP] = Decimal.ROUND_HALF_UP, _toSignificantRoundin[exports.Rounding.ROUND_UP] = Decimal.ROUND_UP, _toSignificantRoundin);
var toFixedRounding = (_toFixedRounding = {}, _toFixedRounding[exports.Rounding.ROUND_DOWN] = RoundingMode.RoundDown, _toFixedRounding[exports.Rounding.ROUND_HALF_UP] = RoundingMode.RoundHalfUp, _toFixedRounding[exports.Rounding.ROUND_UP] = RoundingMode.RoundUp, _toFixedRounding);
var Fraction = /*#__PURE__*/function () {
  function Fraction(numerator, denominator) {
    if (denominator === void 0) {
      denominator = ONE;
    }
    this.numerator = parseBigintIsh(numerator);
    this.denominator = parseBigintIsh(denominator);
  }
  var _proto = Fraction.prototype;
  _proto.invert = function invert() {
    return new Fraction(this.denominator, this.numerator);
  };
  _proto.add = function add(other) {
    var otherParsed = other instanceof Fraction ? other : new Fraction(parseBigintIsh(other));
    if (JSBI.equal(this.denominator, otherParsed.denominator)) {
      return new Fraction(JSBI.add(this.numerator, otherParsed.numerator), this.denominator);
    }
    return new Fraction(JSBI.add(JSBI.multiply(this.numerator, otherParsed.denominator), JSBI.multiply(otherParsed.numerator, this.denominator)), JSBI.multiply(this.denominator, otherParsed.denominator));
  };
  _proto.subtract = function subtract(other) {
    var otherParsed = other instanceof Fraction ? other : new Fraction(parseBigintIsh(other));
    if (JSBI.equal(this.denominator, otherParsed.denominator)) {
      return new Fraction(JSBI.subtract(this.numerator, otherParsed.numerator), this.denominator);
    }
    return new Fraction(JSBI.subtract(JSBI.multiply(this.numerator, otherParsed.denominator), JSBI.multiply(otherParsed.numerator, this.denominator)), JSBI.multiply(this.denominator, otherParsed.denominator));
  };
  _proto.lessThan = function lessThan(other) {
    var otherParsed = other instanceof Fraction ? other : new Fraction(parseBigintIsh(other));
    return JSBI.lessThan(JSBI.multiply(this.numerator, otherParsed.denominator), JSBI.multiply(otherParsed.numerator, this.denominator));
  };
  _proto.equalTo = function equalTo(other) {
    var otherParsed = other instanceof Fraction ? other : new Fraction(parseBigintIsh(other));
    return JSBI.equal(JSBI.multiply(this.numerator, otherParsed.denominator), JSBI.multiply(otherParsed.numerator, this.denominator));
  };
  _proto.greaterThan = function greaterThan(other) {
    var otherParsed = other instanceof Fraction ? other : new Fraction(parseBigintIsh(other));
    return JSBI.greaterThan(JSBI.multiply(this.numerator, otherParsed.denominator), JSBI.multiply(otherParsed.numerator, this.denominator));
  };
  _proto.multiply = function multiply(other) {
    var otherParsed = other instanceof Fraction ? other : new Fraction(parseBigintIsh(other));
    return new Fraction(JSBI.multiply(this.numerator, otherParsed.numerator), JSBI.multiply(this.denominator, otherParsed.denominator));
  };
  _proto.divide = function divide(other) {
    var otherParsed = other instanceof Fraction ? other : new Fraction(parseBigintIsh(other));
    return new Fraction(JSBI.multiply(this.numerator, otherParsed.denominator), JSBI.multiply(this.denominator, otherParsed.numerator));
  };
  _proto.toSignificant = function toSignificant(significantDigits, format, rounding) {
    if (format === void 0) {
      format = {
        groupSeparator: ''
      };
    }
    if (rounding === void 0) {
      rounding = exports.Rounding.ROUND_HALF_UP;
    }
    invariant(Number.isInteger(significantDigits), significantDigits + " is not an integer.");
    invariant(significantDigits > 0, significantDigits + " is not positive.");
    Decimal.set({
      precision: significantDigits + 1,
      rounding: toSignificantRounding[rounding]
    });
    var quotient = new Decimal(this.numerator.toString()).div(this.denominator.toString()).toSignificantDigits(significantDigits);
    return quotient.toFormat(quotient.decimalPlaces(), format);
  };
  _proto.toFixed = function toFixed(decimalPlaces, format, rounding) {
    if (format === void 0) {
      format = {
        groupSeparator: ''
      };
    }
    if (rounding === void 0) {
      rounding = exports.Rounding.ROUND_HALF_UP;
    }
    invariant(Number.isInteger(decimalPlaces), decimalPlaces + " is not an integer.");
    invariant(decimalPlaces >= 0, decimalPlaces + " is negative.");
    Big.DP = decimalPlaces;
    Big.RM = toFixedRounding[rounding];
    return new Big(this.numerator.toString()).div(this.denominator.toString()).toFormat(decimalPlaces, format);
  };
  return _createClass(Fraction, [{
    key: "quotient",
    get: function get() {
      return JSBI.divide(this.numerator, this.denominator);
    }
  }, {
    key: "remainder",
    get: function get() {
      return new Fraction(JSBI.remainder(this.numerator, this.denominator), this.denominator);
    }
  }]);
}();

var Big$1 = toFormat(_Big);
var CurrencyAmount = /*#__PURE__*/function (_Fraction) {
  function CurrencyAmount(currency, amount) {
    var _this;
    var parsedAmount = parseBigintIsh(amount);
    validateSolidityTypeInstance(parsedAmount, SolidityType.uint256);
    _this = _Fraction.call(this, parsedAmount, JSBI.exponentiate(TEN, JSBI.BigInt(currency.decimals))) || this;
    _this.currency = currency;
    return _this;
  }
  _inheritsLoose(CurrencyAmount, _Fraction);
  CurrencyAmount.ether = function ether(amount) {
    return new CurrencyAmount(ETHER, amount);
  };
  var _proto = CurrencyAmount.prototype;
  _proto.add = function add(other) {
    invariant(currencyEquals(this.currency, other.currency), 'TOKEN');
    return new CurrencyAmount(this.currency, JSBI.add(this.raw, other.raw));
  };
  _proto.subtract = function subtract(other) {
    invariant(currencyEquals(this.currency, other.currency), 'TOKEN');
    return new CurrencyAmount(this.currency, JSBI.subtract(this.raw, other.raw));
  };
  _proto.toSignificant = function toSignificant(significantDigits, format, rounding) {
    if (significantDigits === void 0) {
      significantDigits = 6;
    }
    if (rounding === void 0) {
      rounding = exports.Rounding.ROUND_DOWN;
    }
    return _Fraction.prototype.toSignificant.call(this, significantDigits, format, rounding);
  };
  _proto.toFixed = function toFixed(decimalPlaces, format, rounding) {
    if (decimalPlaces === void 0) {
      decimalPlaces = this.currency.decimals;
    }
    if (rounding === void 0) {
      rounding = exports.Rounding.ROUND_DOWN;
    }
    invariant(decimalPlaces <= this.currency.decimals, 'DECIMALS');
    return _Fraction.prototype.toFixed.call(this, decimalPlaces, format, rounding);
  };
  _proto.toExact = function toExact(format) {
    if (format === void 0) {
      format = {
        groupSeparator: ''
      };
    }
    Big$1.DP = this.currency.decimals;
    return new Big$1(this.numerator.toString()).div(this.denominator.toString()).toFormat(format);
  };
  return _createClass(CurrencyAmount, [{
    key: "raw",
    get: function get() {
      return this.numerator;
    }
  }]);
}(Fraction);

var TokenAmount = /*#__PURE__*/function (_CurrencyAmount) {
  function TokenAmount(token, amount) {
    var _this;
    _this = _CurrencyAmount.call(this, token, amount) || this;
    _this.token = token;
    return _this;
  }
  _inheritsLoose(TokenAmount, _CurrencyAmount);
  var _proto = TokenAmount.prototype;
  _proto.add = function add(other) {
    invariant(this.token.equals(other.token), 'TOKEN');
    return new TokenAmount(this.token, JSBI.add(this.raw, other.raw));
  };
  _proto.subtract = function subtract(other) {
    invariant(this.token.equals(other.token), 'TOKEN');
    return new TokenAmount(this.token, JSBI.subtract(this.raw, other.raw));
  };
  return TokenAmount;
}(CurrencyAmount);

var Price = /*#__PURE__*/function (_Fraction) {
  function Price(baseCurrency, quoteCurrency, denominator, numerator) {
    var _this;
    _this = _Fraction.call(this, numerator, denominator) || this;
    _this.baseCurrency = baseCurrency;
    _this.quoteCurrency = quoteCurrency;
    _this.scalar = new Fraction(JSBI.exponentiate(TEN, JSBI.BigInt(baseCurrency.decimals)), JSBI.exponentiate(TEN, JSBI.BigInt(quoteCurrency.decimals)));
    return _this;
  }
  _inheritsLoose(Price, _Fraction);
  Price.fromRoute = function fromRoute(route) {
    var prices = [];
    for (var _iterator = _createForOfIteratorHelperLoose(route.pairs.entries()), _step; !(_step = _iterator()).done;) {
      var _step$value = _step.value,
        i = _step$value[0],
        pair = _step$value[1];
      prices.push(route.path[i].equals(pair.token0) ? new Price(pair.reserve0.currency, pair.reserve1.currency, pair.reserve0.raw, pair.reserve1.raw) : new Price(pair.reserve1.currency, pair.reserve0.currency, pair.reserve1.raw, pair.reserve0.raw));
    }
    return prices.slice(1).reduce(function (accumulator, currentValue) {
      return accumulator.multiply(currentValue);
    }, prices[0]);
  };
  var _proto = Price.prototype;
  _proto.invert = function invert() {
    return new Price(this.quoteCurrency, this.baseCurrency, this.numerator, this.denominator);
  };
  _proto.multiply = function multiply(other) {
    invariant(currencyEquals(this.quoteCurrency, other.baseCurrency), 'TOKEN');
    var fraction = _Fraction.prototype.multiply.call(this, other);
    return new Price(this.baseCurrency, other.quoteCurrency, fraction.denominator, fraction.numerator);
  };
  _proto.quote = function quote(currencyAmount) {
    invariant(currencyEquals(currencyAmount.currency, this.baseCurrency), 'TOKEN');
    if (this.quoteCurrency instanceof Token) {
      return new TokenAmount(this.quoteCurrency, _Fraction.prototype.multiply.call(this, currencyAmount.raw).quotient);
    }
    return CurrencyAmount.ether(_Fraction.prototype.multiply.call(this, currencyAmount.raw).quotient);
  };
  _proto.toSignificant = function toSignificant(significantDigits, format, rounding) {
    if (significantDigits === void 0) {
      significantDigits = 6;
    }
    return this.adjusted.toSignificant(significantDigits, format, rounding);
  };
  _proto.toFixed = function toFixed(decimalPlaces, format, rounding) {
    if (decimalPlaces === void 0) {
      decimalPlaces = 4;
    }
    return this.adjusted.toFixed(decimalPlaces, format, rounding);
  };
  return _createClass(Price, [{
    key: "raw",
    get: function get() {
      return new Fraction(this.numerator, this.denominator);
    }
  }, {
    key: "adjusted",
    get: function get() {
      return _Fraction.prototype.multiply.call(this, this.scalar);
    }
  }]);
}(Fraction);

var IRouterV2 = [
	{
		inputs: [
		],
		name: "WETH",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "pure",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "tokenA",
				type: "address"
			},
			{
				internalType: "address",
				name: "tokenB",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "amountADesired",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountBDesired",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountAMin",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountBMin",
				type: "uint256"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256"
			},
			{
				internalType: "bytes",
				name: "data",
				type: "bytes"
			}
		],
		name: "addLiquidity",
		outputs: [
			{
				internalType: "uint256",
				name: "amountA",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountB",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "liquidity",
				type: "uint256"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "token",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "amountTokenDesired",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountTokenMin",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountETHMin",
				type: "uint256"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256"
			},
			{
				internalType: "bytes",
				name: "data",
				type: "bytes"
			}
		],
		name: "addLiquidityETH",
		outputs: [
			{
				internalType: "uint256",
				name: "amountToken",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountETH",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "liquidity",
				type: "uint256"
			}
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
		],
		name: "factory",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "pure",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "tokenIn",
				type: "address"
			},
			{
				internalType: "address",
				name: "tokenOut",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "amountOut",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "reserveOut",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "priceIn",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "priceOut",
				type: "uint256"
			},
			{
				internalType: "uint32",
				name: "k",
				type: "uint32"
			},
			{
				internalType: "uint32",
				name: "fee",
				type: "uint32"
			}
		],
		name: "getAmountIn",
		outputs: [
			{
				internalType: "uint256",
				name: "amountIn",
				type: "uint256"
			}
		],
		stateMutability: "pure",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "tokenIn",
				type: "address"
			},
			{
				internalType: "address",
				name: "tokenOut",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "amountIn",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "reserveOut",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "priceIn",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "priceOut",
				type: "uint256"
			},
			{
				internalType: "uint32",
				name: "k",
				type: "uint32"
			},
			{
				internalType: "uint32",
				name: "fee",
				type: "uint32"
			}
		],
		name: "getAmountOut",
		outputs: [
			{
				internalType: "uint256",
				name: "amountOut",
				type: "uint256"
			}
		],
		stateMutability: "pure",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "amountOut",
				type: "uint256"
			},
			{
				internalType: "address[]",
				name: "path",
				type: "address[]"
			}
		],
		name: "getAmountsIn",
		outputs: [
			{
				internalType: "uint256[]",
				name: "amounts",
				type: "uint256[]"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "amountIn",
				type: "uint256"
			},
			{
				internalType: "address[]",
				name: "path",
				type: "address[]"
			}
		],
		name: "getAmountsOut",
		outputs: [
			{
				internalType: "uint256[]",
				name: "amounts",
				type: "uint256[]"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "tokenA",
				type: "address"
			},
			{
				internalType: "address",
				name: "tokenB",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "amountA",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "priceA",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "priceB",
				type: "uint256"
			}
		],
		name: "quote",
		outputs: [
			{
				internalType: "uint256",
				name: "amountB",
				type: "uint256"
			}
		],
		stateMutability: "pure",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "tokenA",
				type: "address"
			},
			{
				internalType: "address",
				name: "tokenB",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "liquidity",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountAMin",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountBMin",
				type: "uint256"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256"
			}
		],
		name: "removeLiquidity",
		outputs: [
			{
				internalType: "uint256",
				name: "amountA",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountB",
				type: "uint256"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "token",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "liquidity",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountTokenMin",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountETHMin",
				type: "uint256"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256"
			}
		],
		name: "removeLiquidityETH",
		outputs: [
			{
				internalType: "uint256",
				name: "amountToken",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountETH",
				type: "uint256"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "token",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "liquidity",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountTokenMin",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountETHMin",
				type: "uint256"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256"
			}
		],
		name: "removeLiquidityETHSupportingFeeOnTransferTokens",
		outputs: [
			{
				internalType: "uint256",
				name: "amountETH",
				type: "uint256"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "token",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "liquidity",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountTokenMin",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountETHMin",
				type: "uint256"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256"
			},
			{
				internalType: "bool",
				name: "approveMax",
				type: "bool"
			},
			{
				internalType: "uint8",
				name: "v",
				type: "uint8"
			},
			{
				internalType: "bytes32",
				name: "r",
				type: "bytes32"
			},
			{
				internalType: "bytes32",
				name: "s",
				type: "bytes32"
			}
		],
		name: "removeLiquidityETHWithPermit",
		outputs: [
			{
				internalType: "uint256",
				name: "amountToken",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountETH",
				type: "uint256"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "token",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "liquidity",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountTokenMin",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountETHMin",
				type: "uint256"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256"
			},
			{
				internalType: "bool",
				name: "approveMax",
				type: "bool"
			},
			{
				internalType: "uint8",
				name: "v",
				type: "uint8"
			},
			{
				internalType: "bytes32",
				name: "r",
				type: "bytes32"
			},
			{
				internalType: "bytes32",
				name: "s",
				type: "bytes32"
			}
		],
		name: "removeLiquidityETHWithPermitSupportingFeeOnTransferTokens",
		outputs: [
			{
				internalType: "uint256",
				name: "amountETH",
				type: "uint256"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "tokenA",
				type: "address"
			},
			{
				internalType: "address",
				name: "tokenB",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "liquidity",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountAMin",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountBMin",
				type: "uint256"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256"
			},
			{
				internalType: "bool",
				name: "approveMax",
				type: "bool"
			},
			{
				internalType: "uint8",
				name: "v",
				type: "uint8"
			},
			{
				internalType: "bytes32",
				name: "r",
				type: "bytes32"
			},
			{
				internalType: "bytes32",
				name: "s",
				type: "bytes32"
			}
		],
		name: "removeLiquidityWithPermit",
		outputs: [
			{
				internalType: "uint256",
				name: "amountA",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountB",
				type: "uint256"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "amountOut",
				type: "uint256"
			},
			{
				internalType: "address[]",
				name: "path",
				type: "address[]"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256"
			},
			{
				internalType: "bytes",
				name: "updateData",
				type: "bytes"
			}
		],
		name: "swapETHForExactTokens",
		outputs: [
			{
				internalType: "uint256[]",
				name: "amounts",
				type: "uint256[]"
			}
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "amountOutMin",
				type: "uint256"
			},
			{
				internalType: "address[]",
				name: "path",
				type: "address[]"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256"
			},
			{
				internalType: "bytes",
				name: "updateData",
				type: "bytes"
			}
		],
		name: "swapExactETHForTokens",
		outputs: [
			{
				internalType: "uint256[]",
				name: "amounts",
				type: "uint256[]"
			}
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "amountOutMin",
				type: "uint256"
			},
			{
				internalType: "address[]",
				name: "path",
				type: "address[]"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256"
			},
			{
				internalType: "bytes",
				name: "updateData",
				type: "bytes"
			}
		],
		name: "swapExactETHForTokensSupportingFeeOnTransferTokens",
		outputs: [
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "amountIn",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountOutMin",
				type: "uint256"
			},
			{
				internalType: "address[]",
				name: "path",
				type: "address[]"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256"
			},
			{
				internalType: "bytes",
				name: "updateData",
				type: "bytes"
			}
		],
		name: "swapExactTokensForETH",
		outputs: [
			{
				internalType: "uint256[]",
				name: "amounts",
				type: "uint256[]"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "amountIn",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountOutMin",
				type: "uint256"
			},
			{
				internalType: "address[]",
				name: "path",
				type: "address[]"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256"
			},
			{
				internalType: "bytes",
				name: "updateData",
				type: "bytes"
			}
		],
		name: "swapExactTokensForETHSupportingFeeOnTransferTokens",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "amountIn",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountOutMin",
				type: "uint256"
			},
			{
				internalType: "address[]",
				name: "path",
				type: "address[]"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256"
			},
			{
				internalType: "bytes",
				name: "updateData",
				type: "bytes"
			}
		],
		name: "swapExactTokensForTokens",
		outputs: [
			{
				internalType: "uint256[]",
				name: "amounts",
				type: "uint256[]"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "amountIn",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountOutMin",
				type: "uint256"
			},
			{
				internalType: "address[]",
				name: "path",
				type: "address[]"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256"
			},
			{
				internalType: "bytes",
				name: "updateData",
				type: "bytes"
			}
		],
		name: "swapExactTokensForTokensSupportingFeeOnTransferTokens",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "amountOut",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountInMax",
				type: "uint256"
			},
			{
				internalType: "address[]",
				name: "path",
				type: "address[]"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256"
			},
			{
				internalType: "bytes",
				name: "updateData",
				type: "bytes"
			}
		],
		name: "swapTokensForExactETH",
		outputs: [
			{
				internalType: "uint256[]",
				name: "amounts",
				type: "uint256[]"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "amountOut",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountInMax",
				type: "uint256"
			},
			{
				internalType: "address[]",
				name: "path",
				type: "address[]"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256"
			},
			{
				internalType: "bytes",
				name: "updateData",
				type: "bytes"
			}
		],
		name: "swapTokensForExactTokens",
		outputs: [
			{
				internalType: "uint256[]",
				name: "amounts",
				type: "uint256[]"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	}
];

var IRouterWithPrice = [
	{
		inputs: [
			{
				internalType: "address",
				name: "_factory",
				type: "address"
			},
			{
				internalType: "address",
				name: "_WETH",
				type: "address"
			},
			{
				internalType: "address",
				name: "_PYTH",
				type: "address"
			}
		],
		stateMutability: "nonpayable",
		type: "constructor"
	},
	{
		inputs: [
		],
		name: "PYTH",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "WETH",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "factory",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "amountOut",
				type: "uint256"
			},
			{
				internalType: "address[]",
				name: "path",
				type: "address[]"
			},
			{
				internalType: "bytes[]",
				name: "priceUpdate",
				type: "bytes[]"
			}
		],
		name: "getAmountsInWithPrice",
		outputs: [
			{
				internalType: "uint256[]",
				name: "amounts",
				type: "uint256[]"
			}
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "amountIn",
				type: "uint256"
			},
			{
				internalType: "address[]",
				name: "path",
				type: "address[]"
			},
			{
				internalType: "bytes[]",
				name: "priceUpdate",
				type: "bytes[]"
			}
		],
		name: "getAmountsOutWithPrice",
		outputs: [
			{
				internalType: "uint256[]",
				name: "amounts",
				type: "uint256[]"
			}
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "amountOut",
				type: "uint256"
			},
			{
				internalType: "address[]",
				name: "path",
				type: "address[]"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256"
			},
			{
				internalType: "bytes[]",
				name: "priceUpdate",
				type: "bytes[]"
			}
		],
		name: "swapETHForExactTokensWithPrice",
		outputs: [
			{
				internalType: "uint256[]",
				name: "amounts",
				type: "uint256[]"
			}
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "amountOutMin",
				type: "uint256"
			},
			{
				internalType: "address[]",
				name: "path",
				type: "address[]"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256"
			},
			{
				internalType: "bytes[]",
				name: "priceUpdate",
				type: "bytes[]"
			}
		],
		name: "swapExactETHForTokensSupportingFeeOnTransferTokensWithPrice",
		outputs: [
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "amountOutMin",
				type: "uint256"
			},
			{
				internalType: "address[]",
				name: "path",
				type: "address[]"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256"
			},
			{
				internalType: "bytes[]",
				name: "priceUpdate",
				type: "bytes[]"
			}
		],
		name: "swapExactETHForTokensWithPrice",
		outputs: [
			{
				internalType: "uint256[]",
				name: "amounts",
				type: "uint256[]"
			}
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "amountIn",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountOutMin",
				type: "uint256"
			},
			{
				internalType: "address[]",
				name: "path",
				type: "address[]"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256"
			},
			{
				internalType: "bytes[]",
				name: "priceUpdate",
				type: "bytes[]"
			}
		],
		name: "swapExactTokensForETHSupportingFeeOnTransferTokensWithPrice",
		outputs: [
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "amountIn",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountOutMin",
				type: "uint256"
			},
			{
				internalType: "address[]",
				name: "path",
				type: "address[]"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256"
			},
			{
				internalType: "bytes[]",
				name: "priceUpdate",
				type: "bytes[]"
			}
		],
		name: "swapExactTokensForETHWithPrice",
		outputs: [
			{
				internalType: "uint256[]",
				name: "amounts",
				type: "uint256[]"
			}
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "amountIn",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountOutMin",
				type: "uint256"
			},
			{
				internalType: "address[]",
				name: "path",
				type: "address[]"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256"
			},
			{
				internalType: "bytes[]",
				name: "priceUpdate",
				type: "bytes[]"
			}
		],
		name: "swapExactTokensForTokensSupportingFeeOnTransferTokensWithPrice",
		outputs: [
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "amountIn",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountOutMin",
				type: "uint256"
			},
			{
				internalType: "address[]",
				name: "path",
				type: "address[]"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256"
			},
			{
				internalType: "bytes[]",
				name: "priceUpdate",
				type: "bytes[]"
			}
		],
		name: "swapExactTokensForTokensWithPrice",
		outputs: [
			{
				internalType: "uint256[]",
				name: "amounts",
				type: "uint256[]"
			}
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "amountOut",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountInMax",
				type: "uint256"
			},
			{
				internalType: "address[]",
				name: "path",
				type: "address[]"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256"
			},
			{
				internalType: "bytes[]",
				name: "priceUpdate",
				type: "bytes[]"
			}
		],
		name: "swapTokensForExactETHWithPrice",
		outputs: [
			{
				internalType: "uint256[]",
				name: "amounts",
				type: "uint256[]"
			}
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "amountOut",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountInMax",
				type: "uint256"
			},
			{
				internalType: "address[]",
				name: "path",
				type: "address[]"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256"
			},
			{
				internalType: "bytes[]",
				name: "priceUpdate",
				type: "bytes[]"
			}
		],
		name: "swapTokensForExactTokensWithPrice",
		outputs: [
			{
				internalType: "uint256[]",
				name: "amounts",
				type: "uint256[]"
			}
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		stateMutability: "payable",
		type: "receive"
	}
];

var IPair = [
	{
		inputs: [
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "constructor"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "owner",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "spender",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "value",
				type: "uint256"
			}
		],
		name: "Approval",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "sender",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount0",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount1",
				type: "uint256"
			},
			{
				indexed: true,
				internalType: "address",
				name: "to",
				type: "address"
			}
		],
		name: "Burn",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "sender",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount0",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount1",
				type: "uint256"
			}
		],
		name: "Mint",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "sender",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount0In",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount1In",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount0Out",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount1Out",
				type: "uint256"
			},
			{
				indexed: true,
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "swapPrice",
				type: "uint256"
			}
		],
		name: "Swap",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "sender",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount0In",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount1In",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount0Out",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount1Out",
				type: "uint256"
			},
			{
				indexed: true,
				internalType: "address",
				name: "to",
				type: "address"
			}
		],
		name: "Swap",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "uint112",
				name: "reserve0",
				type: "uint112"
			},
			{
				indexed: false,
				internalType: "uint112",
				name: "reserve1",
				type: "uint112"
			}
		],
		name: "Sync",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "from",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "value",
				type: "uint256"
			}
		],
		name: "Transfer",
		type: "event"
	},
	{
		constant: true,
		inputs: [
		],
		name: "DOMAIN_SEPARATOR",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: true,
		inputs: [
		],
		name: "MINIMUM_LIQUIDITY",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: true,
		inputs: [
		],
		name: "PERMIT_TYPEHASH",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: true,
		inputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			},
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		name: "allowance",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: false,
		inputs: [
			{
				internalType: "address",
				name: "spender",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "value",
				type: "uint256"
			}
		],
		name: "approve",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool"
			}
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		constant: true,
		inputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		name: "balanceOf",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: false,
		inputs: [
			{
				internalType: "address",
				name: "to",
				type: "address"
			}
		],
		name: "burn",
		outputs: [
			{
				internalType: "uint256",
				name: "amount0",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amount1",
				type: "uint256"
			}
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		constant: true,
		inputs: [
		],
		name: "decimals",
		outputs: [
			{
				internalType: "uint8",
				name: "",
				type: "uint8"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: true,
		inputs: [
		],
		name: "factory",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: true,
		inputs: [
		],
		name: "fee",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: true,
		inputs: [
		],
		name: "getReserves",
		outputs: [
			{
				internalType: "uint112",
				name: "_reserve0",
				type: "uint112"
			},
			{
				internalType: "uint112",
				name: "_reserve1",
				type: "uint112"
			},
			{
				internalType: "uint32",
				name: "_blockTimestampLast",
				type: "uint32"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: false,
		inputs: [
			{
				internalType: "address",
				name: "_token0",
				type: "address"
			},
			{
				internalType: "address",
				name: "_token1",
				type: "address"
			}
		],
		name: "initialize",
		outputs: [
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		constant: true,
		inputs: [
		],
		name: "kLast",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: true,
		inputs: [
		],
		name: "kappa",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: false,
		inputs: [
			{
				internalType: "address",
				name: "to",
				type: "address"
			}
		],
		name: "mint",
		outputs: [
			{
				internalType: "uint256",
				name: "liquidity",
				type: "uint256"
			}
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		constant: true,
		inputs: [
		],
		name: "name",
		outputs: [
			{
				internalType: "string",
				name: "",
				type: "string"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: true,
		inputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		name: "nonces",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: false,
		inputs: [
			{
				internalType: "address",
				name: "owner",
				type: "address"
			},
			{
				internalType: "address",
				name: "spender",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "value",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256"
			},
			{
				internalType: "uint8",
				name: "v",
				type: "uint8"
			},
			{
				internalType: "bytes32",
				name: "r",
				type: "bytes32"
			},
			{
				internalType: "bytes32",
				name: "s",
				type: "bytes32"
			}
		],
		name: "permit",
		outputs: [
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		constant: true,
		inputs: [
		],
		name: "price0CumulativeLast",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: true,
		inputs: [
		],
		name: "price1CumulativeLast",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: true,
		inputs: [
		],
		name: "priceFeed",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: true,
		inputs: [
		],
		name: "qti",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: false,
		inputs: [
			{
				internalType: "uint256",
				name: "_fee",
				type: "uint256"
			}
		],
		name: "setFee",
		outputs: [
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		constant: false,
		inputs: [
			{
				internalType: "bool",
				name: "_isVerify",
				type: "bool"
			}
		],
		name: "setIsVerify",
		outputs: [
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		constant: false,
		inputs: [
			{
				internalType: "uint256",
				name: "_kappa",
				type: "uint256"
			}
		],
		name: "setKappa",
		outputs: [
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		constant: false,
		inputs: [
			{
				internalType: "address",
				name: "_priceFeed",
				type: "address"
			}
		],
		name: "setPriceFeed",
		outputs: [
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		constant: false,
		inputs: [
			{
				internalType: "uint256",
				name: "_qti",
				type: "uint256"
			}
		],
		name: "setQTI",
		outputs: [
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		constant: false,
		inputs: [
			{
				internalType: "address",
				name: "to",
				type: "address"
			}
		],
		name: "skim",
		outputs: [
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		constant: false,
		inputs: [
			{
				internalType: "uint256",
				name: "amount0Out",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amount1Out",
				type: "uint256"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "bytes",
				name: "data",
				type: "bytes"
			}
		],
		name: "swap",
		outputs: [
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		constant: true,
		inputs: [
		],
		name: "symbol",
		outputs: [
			{
				internalType: "string",
				name: "",
				type: "string"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: false,
		inputs: [
		],
		name: "sync",
		outputs: [
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		constant: true,
		inputs: [
		],
		name: "token0",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: true,
		inputs: [
		],
		name: "token1",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: true,
		inputs: [
		],
		name: "totalSupply",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: false,
		inputs: [
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "value",
				type: "uint256"
			}
		],
		name: "transfer",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool"
			}
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		constant: false,
		inputs: [
			{
				internalType: "address",
				name: "from",
				type: "address"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "value",
				type: "uint256"
			}
		],
		name: "transferFrom",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool"
			}
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "function"
	}
];

var IPythPriceFeed = [
	{
		inputs: [
			{
				internalType: "address",
				name: "pythContract",
				type: "address"
			},
			{
				internalType: "bytes32",
				name: "_baseTokenPriceId",
				type: "bytes32"
			},
			{
				internalType: "bytes32",
				name: "_quoteTokenPriceId",
				type: "bytes32"
			}
		],
		stateMutability: "nonpayable",
		type: "constructor"
	},
	{
		inputs: [
		],
		name: "baseTokenPriceId",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "decimals",
		outputs: [
			{
				internalType: "uint8",
				name: "",
				type: "uint8"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "description",
		outputs: [
			{
				internalType: "string",
				name: "",
				type: "string"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint80",
				name: "_roundId",
				type: "uint80"
			}
		],
		name: "getRoundData",
		outputs: [
			{
				internalType: "uint80",
				name: "roundId",
				type: "uint80"
			},
			{
				internalType: "int256",
				name: "answer",
				type: "int256"
			},
			{
				internalType: "uint256",
				name: "startedAt",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "updatedAt",
				type: "uint256"
			},
			{
				internalType: "uint80",
				name: "answeredInRound",
				type: "uint80"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes[]",
				name: "priceUpdate",
				type: "bytes[]"
			}
		],
		name: "getUpdateFee",
		outputs: [
			{
				internalType: "uint256",
				name: "fee",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "latestRoundData",
		outputs: [
			{
				internalType: "uint80",
				name: "roundId",
				type: "uint80"
			},
			{
				internalType: "int256",
				name: "answer",
				type: "int256"
			},
			{
				internalType: "uint256",
				name: "startedAt",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "updatedAt",
				type: "uint256"
			},
			{
				internalType: "uint80",
				name: "answeredInRound",
				type: "uint80"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "quoteTokenPriceId",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes[]",
				name: "priceUpdate",
				type: "bytes[]"
			}
		],
		name: "setLatestPrice",
		outputs: [
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
		],
		name: "version",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	}
];

var IPyth = [
	{
		inputs: [
			{
				internalType: "bytes[]",
				name: "updateData",
				type: "bytes[]"
			}
		],
		name: "getUpdateFee",
		outputs: [
			{
				internalType: "uint256",
				name: "feeAmount",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes[]",
				name: "updateData",
				type: "bytes[]"
			}
		],
		name: "updatePriceFeeds",
		outputs: [
		],
		stateMutability: "payable",
		type: "function"
	}
];

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

function getCjsExportFromNamespace (n) {
	return n && n['default'] || n;
}

var byteLength_1 = byteLength;
var toByteArray_1 = toByteArray;
var fromByteArray_1 = fromByteArray;

var lookup = [];
var revLookup = [];
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i];
  revLookup[code.charCodeAt(i)] = i;
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62;
revLookup['_'.charCodeAt(0)] = 63;

function getLens (b64) {
  var len = b64.length;

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=');
  if (validLen === -1) validLen = len;

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4);

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64);
  var validLen = lens[0];
  var placeHoldersLen = lens[1];
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp;
  var lens = getLens(b64);
  var validLen = lens[0];
  var placeHoldersLen = lens[1];

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));

  var curByte = 0;

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen;

  var i;
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)];
    arr[curByte++] = (tmp >> 16) & 0xFF;
    arr[curByte++] = (tmp >> 8) & 0xFF;
    arr[curByte++] = tmp & 0xFF;
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4);
    arr[curByte++] = tmp & 0xFF;
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2);
    arr[curByte++] = (tmp >> 8) & 0xFF;
    arr[curByte++] = tmp & 0xFF;
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp;
  var output = [];
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF);
    output.push(tripletToBase64(tmp));
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp;
  var len = uint8.length;
  var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
  var parts = [];
  var maxChunkLength = 16383; // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)));
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1];
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    );
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1];
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    );
  }

  return parts.join('')
}

var base64Js = {
	byteLength: byteLength_1,
	toByteArray: toByteArray_1,
	fromByteArray: fromByteArray_1
};

/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
var read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m;
  var eLen = (nBytes * 8) - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var nBits = -7;
  var i = isLE ? (nBytes - 1) : 0;
  var d = isLE ? -1 : 1;
  var s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
};

var write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c;
  var eLen = (nBytes * 8) - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0);
  var i = isLE ? 0 : (nBytes - 1);
  var d = isLE ? 1 : -1;
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128;
};

var ieee754 = {
	read: read,
	write: write
};

var toString = {}.toString;

var isarray = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

var buffer = createCommonjsModule(function (module, exports) {





exports.Buffer = Buffer;
exports.SlowBuffer = SlowBuffer;
exports.INSPECT_MAX_BYTES = 50;

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = commonjsGlobal.TYPED_ARRAY_SUPPORT !== undefined
  ? commonjsGlobal.TYPED_ARRAY_SUPPORT
  : typedArraySupport();

/*
 * Export kMaxLength after typed array support is determined.
 */
exports.kMaxLength = kMaxLength();

function typedArraySupport () {
  try {
    var arr = new Uint8Array(1);
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }};
    return arr.foo() === 42 && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

function createBuffer (that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length')
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length);
    that.__proto__ = Buffer.prototype;
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length);
    }
    that.length = length;
  }

  return that
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length)
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(this, arg)
  }
  return from(this, arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192; // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype;
  return arr
};

function from (that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset)
  }

  return fromObject(that, value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length)
};

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype;
  Buffer.__proto__ = Uint8Array;
  if (typeof Symbol !== 'undefined' && Symbol.species &&
      Buffer[Symbol.species] === Buffer) {
    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
    Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true
    });
  }
}

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (that, size, fill, encoding) {
  assertSize(size);
  if (size <= 0) {
    return createBuffer(that, size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(that, size).fill(fill, encoding)
      : createBuffer(that, size).fill(fill)
  }
  return createBuffer(that, size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding)
};

function allocUnsafe (that, size) {
  assertSize(size);
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0);
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0;
    }
  }
  return that
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size)
};
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size)
};

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8';
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0;
  that = createBuffer(that, length);

  var actual = that.write(string, encoding);

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    that = that.slice(0, actual);
  }

  return that
}

function fromArrayLike (that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0;
  that = createBuffer(that, length);
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255;
  }
  return that
}

function fromArrayBuffer (that, array, byteOffset, length) {

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array);
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset);
  } else {
    array = new Uint8Array(array, byteOffset, length);
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array;
    that.__proto__ = Buffer.prototype;
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array);
  }
  return that
}

function fromObject (that, obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0;
    that = createBuffer(that, len);

    if (that.length === 0) {
      return that
    }

    obj.copy(that, 0, 0, len);
    return that
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && isarray(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < kMaxLength()` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0;
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
};

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length;
  var y = b.length;

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i];
      y = b[i];
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
};

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
};

Buffer.concat = function concat (list, length) {
  if (!isarray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i;
  if (length === undefined) {
    length = 0;
    for (i = 0; i < list.length; ++i) {
      length += list[i].length;
    }
  }

  var buffer = Buffer.allocUnsafe(length);
  var pos = 0;
  for (i = 0; i < list.length; ++i) {
    var buf = list[i];
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos);
    pos += buf.length;
  }
  return buffer
};

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string;
  }

  var len = string.length;
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false;
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase();
        loweredCase = true;
    }
  }
}
Buffer.byteLength = byteLength;

function slowToString (encoding, start, end) {
  var loweredCase = false;

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0;
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length;
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0;
  start >>>= 0;

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8';

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase();
        loweredCase = true;
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true;

function swap (b, n, m) {
  var i = b[n];
  b[n] = b[m];
  b[m] = i;
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length;
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1);
  }
  return this
};

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length;
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3);
    swap(this, i + 1, i + 2);
  }
  return this
};

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length;
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7);
    swap(this, i + 1, i + 6);
    swap(this, i + 2, i + 5);
    swap(this, i + 3, i + 4);
  }
  return this
};

Buffer.prototype.toString = function toString () {
  var length = this.length | 0;
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
};

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
};

Buffer.prototype.inspect = function inspect () {
  var str = '';
  var max = exports.INSPECT_MAX_BYTES;
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ');
    if (this.length > max) str += ' ... ';
  }
  return '<Buffer ' + str + '>'
};

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0;
  }
  if (end === undefined) {
    end = target ? target.length : 0;
  }
  if (thisStart === undefined) {
    thisStart = 0;
  }
  if (thisEnd === undefined) {
    thisEnd = this.length;
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0;
  end >>>= 0;
  thisStart >>>= 0;
  thisEnd >>>= 0;

  if (this === target) return 0

  var x = thisEnd - thisStart;
  var y = end - start;
  var len = Math.min(x, y);

  var thisCopy = this.slice(thisStart, thisEnd);
  var targetCopy = target.slice(start, end);

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i];
      y = targetCopy[i];
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
};

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset;
    byteOffset = 0;
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff;
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000;
  }
  byteOffset = +byteOffset;  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1);
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1;
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0;
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding);
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF; // Search for a byte value [0-255]
    if (Buffer.TYPED_ARRAY_SUPPORT &&
        typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1;
  var arrLength = arr.length;
  var valLength = val.length;

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase();
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2;
      arrLength /= 2;
      valLength /= 2;
      byteOffset /= 2;
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i;
  if (dir) {
    var foundIndex = -1;
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i;
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex;
        foundIndex = -1;
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
    for (i = byteOffset; i >= 0; i--) {
      var found = true;
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false;
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
};

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
};

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
};

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0;
  var remaining = buf.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = Number(length);
    if (length > remaining) {
      length = remaining;
    }
  }

  // must be an even number of digits
  var strLen = string.length;
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2;
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16);
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed;
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8';
    length = this.length;
    offset = 0;
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset;
    length = this.length;
    offset = 0;
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0;
    if (isFinite(length)) {
      length = length | 0;
      if (encoding === undefined) encoding = 'utf8';
    } else {
      encoding = length;
      length = undefined;
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset;
  if (length === undefined || length > remaining) length = remaining;

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8';

  var loweredCase = false;
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase();
        loweredCase = true;
    }
  }
};

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
};

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64Js.fromByteArray(buf)
  } else {
    return base64Js.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end);
  var res = [];

  var i = start;
  while (i < end) {
    var firstByte = buf[i];
    var codePoint = null;
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1;

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint;

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte;
          }
          break
        case 2:
          secondByte = buf[i + 1];
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F);
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint;
            }
          }
          break
        case 3:
          secondByte = buf[i + 1];
          thirdByte = buf[i + 2];
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F);
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint;
            }
          }
          break
        case 4:
          secondByte = buf[i + 1];
          thirdByte = buf[i + 2];
          fourthByte = buf[i + 3];
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F);
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint;
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD;
      bytesPerSequence = 1;
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000;
      res.push(codePoint >>> 10 & 0x3FF | 0xD800);
      codePoint = 0xDC00 | codePoint & 0x3FF;
    }

    res.push(codePoint);
    i += bytesPerSequence;
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000;

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length;
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = '';
  var i = 0;
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    );
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = '';
  end = Math.min(buf.length, end);

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F);
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = '';
  end = Math.min(buf.length, end);

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i]);
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length;

  if (!start || start < 0) start = 0;
  if (!end || end < 0 || end > len) end = len;

  var out = '';
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i]);
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end);
  var res = '';
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length;
  start = ~~start;
  end = end === undefined ? len : ~~end;

  if (start < 0) {
    start += len;
    if (start < 0) start = 0;
  } else if (start > len) {
    start = len;
  }

  if (end < 0) {
    end += len;
    if (end < 0) end = 0;
  } else if (end > len) {
    end = len;
  }

  if (end < start) end = start;

  var newBuf;
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end);
    newBuf.__proto__ = Buffer.prototype;
  } else {
    var sliceLen = end - start;
    newBuf = new Buffer(sliceLen, undefined);
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start];
    }
  }

  return newBuf
};

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) checkOffset(offset, byteLength, this.length);

  var val = this[offset];
  var mul = 1;
  var i = 0;
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul;
  }

  return val
};

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length);
  }

  var val = this[offset + --byteLength];
  var mul = 1;
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul;
  }

  return val
};

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length);
  return this[offset]
};

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  return this[offset] | (this[offset + 1] << 8)
};

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  return (this[offset] << 8) | this[offset + 1]
};

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
};

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
};

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) checkOffset(offset, byteLength, this.length);

  var val = this[offset];
  var mul = 1;
  var i = 0;
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul;
  }
  mul *= 0x80;

  if (val >= mul) val -= Math.pow(2, 8 * byteLength);

  return val
};

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) checkOffset(offset, byteLength, this.length);

  var i = byteLength;
  var mul = 1;
  var val = this[offset + --i];
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul;
  }
  mul *= 0x80;

  if (val >= mul) val -= Math.pow(2, 8 * byteLength);

  return val
};

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length);
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
};

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  var val = this[offset] | (this[offset + 1] << 8);
  return (val & 0x8000) ? val | 0xFFFF0000 : val
};

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  var val = this[offset + 1] | (this[offset] << 8);
  return (val & 0x8000) ? val | 0xFFFF0000 : val
};

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
};

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
};

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);
  return ieee754.read(this, offset, true, 23, 4)
};

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);
  return ieee754.read(this, offset, false, 23, 4)
};

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length);
  return ieee754.read(this, offset, true, 52, 8)
};

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length);
  return ieee754.read(this, offset, false, 52, 8)
};

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1;
    checkInt(this, value, offset, byteLength, maxBytes, 0);
  }

  var mul = 1;
  var i = 0;
  this[offset] = value & 0xFF;
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF;
  }

  return offset + byteLength
};

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1;
    checkInt(this, value, offset, byteLength, maxBytes, 0);
  }

  var i = byteLength - 1;
  var mul = 1;
  this[offset + i] = value & 0xFF;
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF;
  }

  return offset + byteLength
};

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
  this[offset] = (value & 0xff);
  return offset + 1
};

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1;
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8;
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff);
    this[offset + 1] = (value >>> 8);
  } else {
    objectWriteUInt16(this, value, offset, true);
  }
  return offset + 2
};

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8);
    this[offset + 1] = (value & 0xff);
  } else {
    objectWriteUInt16(this, value, offset, false);
  }
  return offset + 2
};

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1;
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff;
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24);
    this[offset + 2] = (value >>> 16);
    this[offset + 1] = (value >>> 8);
    this[offset] = (value & 0xff);
  } else {
    objectWriteUInt32(this, value, offset, true);
  }
  return offset + 4
};

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24);
    this[offset + 1] = (value >>> 16);
    this[offset + 2] = (value >>> 8);
    this[offset + 3] = (value & 0xff);
  } else {
    objectWriteUInt32(this, value, offset, false);
  }
  return offset + 4
};

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1);

    checkInt(this, value, offset, byteLength, limit - 1, -limit);
  }

  var i = 0;
  var mul = 1;
  var sub = 0;
  this[offset] = value & 0xFF;
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1;
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
  }

  return offset + byteLength
};

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1);

    checkInt(this, value, offset, byteLength, limit - 1, -limit);
  }

  var i = byteLength - 1;
  var mul = 1;
  var sub = 0;
  this[offset + i] = value & 0xFF;
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1;
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
  }

  return offset + byteLength
};

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
  if (value < 0) value = 0xff + value + 1;
  this[offset] = (value & 0xff);
  return offset + 1
};

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff);
    this[offset + 1] = (value >>> 8);
  } else {
    objectWriteUInt16(this, value, offset, true);
  }
  return offset + 2
};

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8);
    this[offset + 1] = (value & 0xff);
  } else {
    objectWriteUInt16(this, value, offset, false);
  }
  return offset + 2
};

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff);
    this[offset + 1] = (value >>> 8);
    this[offset + 2] = (value >>> 16);
    this[offset + 3] = (value >>> 24);
  } else {
    objectWriteUInt32(this, value, offset, true);
  }
  return offset + 4
};

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
  if (value < 0) value = 0xffffffff + value + 1;
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24);
    this[offset + 1] = (value >>> 16);
    this[offset + 2] = (value >>> 8);
    this[offset + 3] = (value & 0xff);
  } else {
    objectWriteUInt32(this, value, offset, false);
  }
  return offset + 4
};

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4);
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4);
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
};

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
};

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8);
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8);
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
};

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
};

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0;
  if (!end && end !== 0) end = this.length;
  if (targetStart >= target.length) targetStart = target.length;
  if (!targetStart) targetStart = 0;
  if (end > 0 && end < start) end = start;

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length;
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start;
  }

  var len = end - start;
  var i;

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start];
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start];
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    );
  }

  return len
};

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start;
      start = 0;
      end = this.length;
    } else if (typeof end === 'string') {
      encoding = end;
      end = this.length;
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0);
      if (code < 256) {
        val = code;
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255;
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0;
  end = end === undefined ? this.length : end >>> 0;

  if (!val) val = 0;

  var i;
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val;
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : utf8ToBytes(new Buffer(val, encoding).toString());
    var len = bytes.length;
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len];
    }
  }

  return this
};

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '');
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '=';
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity;
  var codePoint;
  var length = string.length;
  var leadSurrogate = null;
  var bytes = [];

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i);

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
          continue
        }

        // valid lead
        leadSurrogate = codePoint;

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
        leadSurrogate = codePoint;
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
    }

    leadSurrogate = null;

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint);
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      );
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      );
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      );
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = [];
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF);
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo;
  var byteArray = [];
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i);
    hi = c >> 8;
    lo = c % 256;
    byteArray.push(lo);
    byteArray.push(hi);
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64Js.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i];
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}
});
var buffer_1 = buffer.Buffer;

var getFeedPriceAndFee = function getFeedPriceAndFee(pairs, chainId) {
  try {
    var web3 = new Web3(new Web3.providers.HttpProvider(RPC_URLS[chainId]));
    var pythContract = new web3.eth.Contract(IPyth, PYTH_ADDRESS[chainId]);
    return Promise.resolve(Promise.all(pairs.map(function (pair) {
      try {
        var pairContract = new web3.eth.Contract(IPair, pair.liquidityToken.address);
        return Promise.resolve(pairContract.methods.priceFeed().call()).then(function (priceFeedAddress) {
          var pythPriceFeedContract = new web3.eth.Contract(IPythPriceFeed, priceFeedAddress);
          return Promise.resolve(Promise.all([pythPriceFeedContract.methods.baseTokenPriceId().call(), pythPriceFeedContract.methods.quoteTokenPriceId().call()])).then(function (_ref) {
            var baseTokenPriceId = _ref[0],
              quoteTokenPriceId = _ref[1];
            return [baseTokenPriceId, quoteTokenPriceId];
          });
        });
      } catch (e) {
        return Promise.reject(e);
      }
    })).then(function (allIds) {
      return allIds.flat();
    })).then(function (allIds) {
      var uniqueIds = allIds.filter(function (item, index, array) {
        return array.indexOf(item) === index;
      });
      return Promise.resolve(getFeedPriceUpdateData(uniqueIds)).then(function (priceUpdate) {
        return Promise.resolve(pythContract.methods.getUpdateFee(priceUpdate).call()).then(function (updateFee) {
          return [priceUpdate, updateFee];
        });
      });
    });
  } catch (e) {
    return Promise.reject(e);
  }
};
var getFeedPriceUpdateData = function getFeedPriceUpdateData(ids) {
  try {
    ids = ids.filter(function (id) {
      return id !== ZERO_ADDRESS;
    });
    return Promise.resolve(axios.get('https://hermes.pyth.network/api/latest_vaas', {
      params: {
        ids: ids
      }
    })).then(function (response) {
      return response.data.map(function (vaa) {
        return '0x' + buffer_1.from(vaa, 'base64').toString('hex');
      });
    });
  } catch (e) {
    return Promise.reject(e);
  }
};
var PAIR_ADDRESS_CACHE = {};
var ZERO_ADDRESS = '0x0000000000000000000000000000000000000000000000000000000000000000';
var Pair = /*#__PURE__*/function () {
  function Pair(tokenAmountA, tokenAmountB) {
    var tokenAmounts = tokenAmountA.token.sortsBefore(tokenAmountB.token) ? [tokenAmountA, tokenAmountB] : [tokenAmountB, tokenAmountA];
    var v2 = isRouterV2(tokenAmounts[0].token.chainId);
    this.liquidityToken = new Token(tokenAmounts[0].token.chainId, Pair.getAddress(tokenAmounts[0].token, tokenAmounts[1].token), 18, v2 ? "BF-V2" : "BRF-V1", v2 ? "BrownFi V2" : "BrownFi V1");
    this.tokenAmounts = tokenAmounts;
  }
  Pair.getAddress = function getAddress(tokenA, tokenB) {
    var _PAIR_ADDRESS_CACHE, _PAIR_ADDRESS_CACHE$t;
    var tokens = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA];
    if (((_PAIR_ADDRESS_CACHE = PAIR_ADDRESS_CACHE) === null || _PAIR_ADDRESS_CACHE === void 0 ? void 0 : (_PAIR_ADDRESS_CACHE$t = _PAIR_ADDRESS_CACHE[tokens[0].address]) === null || _PAIR_ADDRESS_CACHE$t === void 0 ? void 0 : _PAIR_ADDRESS_CACHE$t[tokens[1].address]) === undefined) {
      var _PAIR_ADDRESS_CACHE2, _extends2, _extends3;
      PAIR_ADDRESS_CACHE = _extends({}, PAIR_ADDRESS_CACHE, (_extends3 = {}, _extends3[tokens[0].address] = _extends({}, (_PAIR_ADDRESS_CACHE2 = PAIR_ADDRESS_CACHE) === null || _PAIR_ADDRESS_CACHE2 === void 0 ? void 0 : _PAIR_ADDRESS_CACHE2[tokens[0].address], (_extends2 = {}, _extends2[tokens[1].address] = address.getCreate2Address(FACTORY_ADDRESS[tokenA.chainId], solidity.keccak256(['bytes'], [solidity.pack(['address', 'address'], [tokens[0].address, tokens[1].address])]), INIT_CODE_HASH[tokenA.chainId]), _extends2)), _extends3));
    }
    return PAIR_ADDRESS_CACHE[tokens[0].address][tokens[1].address];
  };
  var _proto = Pair.prototype;
  _proto.involvesToken = function involvesToken(token) {
    return token.equals(this.token0) || token.equals(this.token1);
  };
  _proto.priceOf = function priceOf(token) {
    invariant(this.involvesToken(token), 'TOKEN');
    return token.equals(this.token0) ? this.token0Price : this.token1Price;
  };
  _proto.reserveOf = function reserveOf(token) {
    invariant(this.involvesToken(token), 'TOKEN');
    return token.equals(this.token0) ? this.reserve0 : this.reserve1;
  };
  _proto.getTradingFee = function getTradingFee() {
    try {
      var _this = this;
      var web3 = new Web3(new Web3.providers.HttpProvider(RPC_URLS[_this.chainId]));
      var pairContract = new web3.eth.Contract(IPair, _this.liquidityToken.address);
      return Promise.resolve(pairContract.methods.fee().call()).then(function (fee) {
        var mult = (isRouterV2(_this.chainId) ? 1000000 : 10000) / 100;
        return Number(fee) / mult;
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };
  _proto.getOutputAmount = function getOutputAmount(inputAmount) {
    invariant(this.involvesToken(inputAmount.token), 'TOKEN');
    if (JSBI.equal(this.reserve0.raw, ZERO) || JSBI.equal(this.reserve1.raw, ZERO)) {
      throw new InsufficientReservesError();
    }
    var inputReserve = this.reserveOf(inputAmount.token);
    var outputReserve = this.reserveOf(inputAmount.token.equals(this.token0) ? this.token1 : this.token0);
    var inputAmountWithFee = JSBI.multiply(inputAmount.raw, _997);
    var numerator = JSBI.multiply(inputAmountWithFee, outputReserve.raw);
    var denominator = JSBI.add(JSBI.multiply(inputReserve.raw, _1000), inputAmountWithFee);
    var outputAmount = new TokenAmount(inputAmount.token.equals(this.token0) ? this.token1 : this.token0, JSBI.divide(numerator, denominator));
    if (JSBI.equal(outputAmount.raw, ZERO)) {
      throw new InsufficientInputAmountError();
    }
    return [outputAmount, new Pair(inputReserve.add(inputAmount), outputReserve.subtract(outputAmount))];
  };
  _proto.getOutputAmountAsync = function getOutputAmountAsync(inputAmount, pairs, path, chainId, account) {
    try {
      var _temp2 = function _temp2() {
        var outputAmount = new TokenAmount(outputReserve.token, amountOuts[amountOuts.length - 1]);
        if (JSBI.equal(outputAmount.raw, ZERO)) {
          throw new InsufficientInputAmountError();
        }
        var ratio = outputAmount.divide(outputReserve.subtract(outputAmount)).toSignificant(6);
        var priceImpactK = 0.001 * Number(ratio) * 100;
        return [outputAmount, new Pair(inputReserve.add(inputAmount), outputReserve.subtract(outputAmount)), priceUpdate, updateFee, priceImpactK];
      };
      var _this2 = this;
      invariant(_this2.involvesToken(inputAmount.token), 'TOKEN');
      if (JSBI.equal(_this2.reserve0.raw, ZERO) || JSBI.equal(_this2.reserve1.raw, ZERO)) {
        throw new InsufficientReservesError();
      }
      var inputReserve = _this2.reserveOf(inputAmount.token);
      var outputReserve = _this2.reserveOf(inputAmount.token.equals(_this2.token0) ? _this2.token1 : _this2.token0);
      var web3 = new Web3(new Web3.providers.HttpProvider(RPC_URLS[chainId]));
      var routerContract = new web3.eth.Contract(IRouterV2, ROUTER_ADDRESS[chainId]);
      var routerContractWithPrice = new web3.eth.Contract(IRouterWithPrice, ROUTER_ADDRESS_WITH_PRICE[chainId]);
      var priceUpdate = [];
      var updateFee = 0;
      var amountOuts;
      var _temp = function () {
        if (supportContractWithPrice(chainId)) {
          return Promise.resolve(getFeedPriceAndFee(pairs, chainId)).then(function (_getFeedPriceAndFee) {
            priceUpdate = _getFeedPriceAndFee[0];
            updateFee = _getFeedPriceAndFee[1];
            return Promise.resolve(routerContractWithPrice.methods.getAmountsOutWithPrice(inputAmount.raw.toString(), path.map(function (token) {
              return token.address;
            }), priceUpdate).call({
              value: updateFee,
              from: account
            })).then(function (_routerContractWithPr) {
              amountOuts = _routerContractWithPr;
            });
          });
        } else {
          return Promise.resolve(routerContract.methods.getAmountsOut(inputAmount.raw.toString(), path.map(function (token) {
            return token.address;
          })).call()).then(function (_routerContract$metho) {
            amountOuts = _routerContract$metho;
          });
        }
      }();
      return Promise.resolve(_temp && _temp.then ? _temp.then(_temp2) : _temp2(_temp));
    } catch (e) {
      return Promise.reject(e);
    }
  };
  _proto.getInputAmount = function getInputAmount(outputAmount) {
    invariant(this.involvesToken(outputAmount.token), 'TOKEN');
    if (JSBI.equal(this.reserve0.raw, ZERO) || JSBI.equal(this.reserve1.raw, ZERO) || JSBI.greaterThanOrEqual(outputAmount.raw, this.reserveOf(outputAmount.token).raw)) {
      throw new InsufficientReservesError();
    }
    var outputReserve = this.reserveOf(outputAmount.token);
    var inputReserve = this.reserveOf(outputAmount.token.equals(this.token0) ? this.token1 : this.token0);
    var numerator = JSBI.multiply(JSBI.multiply(inputReserve.raw, outputAmount.raw), _1000);
    var denominator = JSBI.multiply(JSBI.subtract(outputReserve.raw, outputAmount.raw), _997);
    var inputAmount = new TokenAmount(outputAmount.token.equals(this.token0) ? this.token1 : this.token0, JSBI.add(JSBI.divide(numerator, denominator), ONE));
    return [inputAmount, new Pair(inputReserve.add(inputAmount), outputReserve.subtract(outputAmount))];
  };
  _proto.getInputAmountAsync = function getInputAmountAsync(outputAmount, pairs, path, chainId, account) {
    try {
      var _temp4 = function _temp4() {
        var inputAmount = new TokenAmount(inputReserve.token, amountIns[0]);
        var ratio = outputAmount.divide(outputReserve.subtract(outputAmount)).toSignificant(6);
        var priceImpactK = 0.001 * Number(ratio) * 100;
        return [inputAmount, new Pair(inputReserve.add(inputAmount), outputReserve.subtract(outputAmount)), priceUpdate, updateFee, priceImpactK];
      };
      var _this3 = this;
      invariant(_this3.involvesToken(outputAmount.token), 'TOKEN');
      if (JSBI.equal(_this3.reserve0.raw, ZERO) || JSBI.equal(_this3.reserve1.raw, ZERO) || JSBI.greaterThanOrEqual(outputAmount.raw, _this3.reserveOf(outputAmount.token).raw)) {
        throw new InsufficientReservesError();
      }
      var outputReserve = _this3.reserveOf(outputAmount.token);
      var inputReserve = _this3.reserveOf(outputAmount.token.equals(_this3.token0) ? _this3.token1 : _this3.token0);
      var web3 = new Web3(new Web3.providers.HttpProvider(RPC_URLS[chainId]));
      var routerContract = new web3.eth.Contract(IRouterV2, ROUTER_ADDRESS[chainId]);
      var routerContractWithPrice = new web3.eth.Contract(IRouterWithPrice, ROUTER_ADDRESS_WITH_PRICE[chainId]);
      var priceUpdate = [];
      var updateFee = 0;
      var amountIns;
      var _temp3 = function () {
        if (supportContractWithPrice(chainId)) {
          return Promise.resolve(getFeedPriceAndFee(pairs, chainId)).then(function (_getFeedPriceAndFee2) {
            priceUpdate = _getFeedPriceAndFee2[0];
            updateFee = _getFeedPriceAndFee2[1];
            return Promise.resolve(routerContractWithPrice.methods.getAmountsInWithPrice(outputAmount.raw.toString(), path.map(function (token) {
              return token.address;
            }), priceUpdate).call({
              value: updateFee,
              from: account
            })).then(function (_routerContractWithPr2) {
              amountIns = _routerContractWithPr2;
            });
          });
        } else {
          return Promise.resolve(routerContract.methods.getAmountsIn(outputAmount.raw.toString(), path.map(function (token) {
            return token.address;
          })).call()).then(function (_routerContract$metho2) {
            amountIns = _routerContract$metho2;
          });
        }
      }();
      return Promise.resolve(_temp3 && _temp3.then ? _temp3.then(_temp4) : _temp4(_temp3));
    } catch (e) {
      return Promise.reject(e);
    }
  };
  _proto.getLiquidityMinted = function getLiquidityMinted(totalSupply, tokenAmountA, tokenAmountB) {
    invariant(totalSupply.token.equals(this.liquidityToken), 'LIQUIDITY');
    var tokenAmounts = tokenAmountA.token.sortsBefore(tokenAmountB.token) ? [tokenAmountA, tokenAmountB] : [tokenAmountB, tokenAmountA];
    invariant(tokenAmounts[0].token.equals(this.token0) && tokenAmounts[1].token.equals(this.token1), 'TOKEN');
    var liquidity;
    if (JSBI.equal(totalSupply.raw, ZERO)) {
      liquidity = JSBI.subtract(sqrt(JSBI.multiply(tokenAmounts[0].raw, tokenAmounts[1].raw)), MINIMUM_LIQUIDITY);
    } else {
      var amount0 = JSBI.divide(JSBI.multiply(tokenAmounts[0].raw, totalSupply.raw), this.reserve0.raw);
      var amount1 = JSBI.divide(JSBI.multiply(tokenAmounts[1].raw, totalSupply.raw), this.reserve1.raw);
      liquidity = JSBI.lessThanOrEqual(amount0, amount1) ? amount0 : amount1;
    }
    if (!JSBI.greaterThan(liquidity, ZERO)) {
      throw new InsufficientInputAmountError();
    }
    return new TokenAmount(this.liquidityToken, liquidity);
  };
  _proto.getLiquidityValue = function getLiquidityValue(token, totalSupply, liquidity, feeOn, kLast) {
    if (feeOn === void 0) {
      feeOn = false;
    }
    invariant(this.involvesToken(token), 'TOKEN');
    invariant(totalSupply.token.equals(this.liquidityToken), 'TOTAL_SUPPLY');
    invariant(liquidity.token.equals(this.liquidityToken), 'LIQUIDITY');
    invariant(JSBI.lessThanOrEqual(liquidity.raw, totalSupply.raw), 'LIQUIDITY');
    var totalSupplyAdjusted;
    if (!feeOn) {
      totalSupplyAdjusted = totalSupply;
    } else {
      invariant(!!kLast, 'K_LAST');
      var kLastParsed = parseBigintIsh(kLast);
      if (!JSBI.equal(kLastParsed, ZERO)) {
        var rootK = sqrt(JSBI.multiply(this.reserve0.raw, this.reserve1.raw));
        var rootKLast = sqrt(kLastParsed);
        if (JSBI.greaterThan(rootK, rootKLast)) {
          var numerator = JSBI.multiply(totalSupply.raw, JSBI.subtract(rootK, rootKLast));
          var denominator = JSBI.add(JSBI.multiply(rootK, FIVE), rootKLast);
          var feeLiquidity = JSBI.divide(numerator, denominator);
          totalSupplyAdjusted = totalSupply.add(new TokenAmount(this.liquidityToken, feeLiquidity));
        } else {
          totalSupplyAdjusted = totalSupply;
        }
      } else {
        totalSupplyAdjusted = totalSupply;
      }
    }
    return new TokenAmount(token, JSBI.divide(JSBI.multiply(liquidity.raw, this.reserveOf(token).raw), totalSupplyAdjusted.raw));
  };
  return _createClass(Pair, [{
    key: "token0Price",
    get: function get() {
      return new Price(this.token0, this.token1, this.tokenAmounts[0].raw, this.tokenAmounts[1].raw);
    }
  }, {
    key: "token1Price",
    get: function get() {
      return new Price(this.token1, this.token0, this.tokenAmounts[1].raw, this.tokenAmounts[0].raw);
    }
  }, {
    key: "chainId",
    get: function get() {
      return this.token0.chainId;
    }
  }, {
    key: "token0",
    get: function get() {
      return this.tokenAmounts[0].token;
    }
  }, {
    key: "token1",
    get: function get() {
      return this.tokenAmounts[1].token;
    }
  }, {
    key: "reserve0",
    get: function get() {
      return this.tokenAmounts[0];
    }
  }, {
    key: "reserve1",
    get: function get() {
      return this.tokenAmounts[1];
    }
  }]);
}();

var Route = /*#__PURE__*/function () {
  function Route(pairs, input, output) {
    invariant(pairs.length > 0, 'PAIRS');
    invariant(pairs.every(function (pair) {
      return pair.chainId === pairs[0].chainId;
    }), 'CHAIN_IDS');
    invariant(input instanceof Token && pairs[0].involvesToken(input) || input === ETHER && pairs[0].involvesToken(WETH[pairs[0].chainId]), 'INPUT');
    invariant(typeof output === 'undefined' || output instanceof Token && pairs[pairs.length - 1].involvesToken(output) || output === ETHER && pairs[pairs.length - 1].involvesToken(WETH[pairs[0].chainId]), 'OUTPUT');
    var path = [input instanceof Token ? input : WETH[pairs[0].chainId]];
    for (var _iterator = _createForOfIteratorHelperLoose(pairs.entries()), _step; !(_step = _iterator()).done;) {
      var _step$value = _step.value,
        i = _step$value[0],
        pair = _step$value[1];
      var currentInput = path[i];
      invariant(currentInput.equals(pair.token0) || currentInput.equals(pair.token1), 'PATH');
      var _output = currentInput.equals(pair.token0) ? pair.token1 : pair.token0;
      path.push(_output);
    }
    this.pairs = pairs;
    this.path = path;
    this.midPrice = Price.fromRoute(this);
    this.input = input;
    this.output = output != null ? output : path[path.length - 1];
  }
  return _createClass(Route, [{
    key: "chainId",
    get: function get() {
      return this.pairs[0].chainId;
    }
  }]);
}();

// A type of promise-like that resolves synchronously and supports only one observer
const _Pact = /*#__PURE__*/(function() {
	function _Pact() {}
	_Pact.prototype.then = function(onFulfilled, onRejected) {
		const result = new _Pact();
		const state = this.s;
		if (state) {
			const callback = state & 1 ? onFulfilled : onRejected;
			if (callback) {
				try {
					_settle(result, 1, callback(this.v));
				} catch (e) {
					_settle(result, 2, e);
				}
				return result;
			} else {
				return this;
			}
		}
		this.o = function(_this) {
			try {
				const value = _this.v;
				if (_this.s & 1) {
					_settle(result, 1, onFulfilled ? onFulfilled(value) : value);
				} else if (onRejected) {
					_settle(result, 1, onRejected(value));
				} else {
					_settle(result, 2, value);
				}
			} catch (e) {
				_settle(result, 2, e);
			}
		};
		return result;
	};
	return _Pact;
})();

// Settles a pact synchronously
function _settle(pact, state, value) {
	if (!pact.s) {
		if (value instanceof _Pact) {
			if (value.s) {
				if (state & 1) {
					state = value.s;
				}
				value = value.v;
			} else {
				value.o = _settle.bind(null, pact, state);
				return;
			}
		}
		if (value && value.then) {
			value.then(_settle.bind(null, pact, state), _settle.bind(null, pact, 2));
			return;
		}
		pact.s = state;
		pact.v = value;
		const observer = pact.o;
		if (observer) {
			observer(pact);
		}
	}
}

function _isSettledPact(thenable) {
	return thenable instanceof _Pact && thenable.s & 1;
}

// Asynchronously iterate through an object that has a length property, passing the index as the first argument to the callback (even as the length property changes)
function _forTo(array, body, check) {
	var i = -1, pact, reject;
	function _cycle(result) {
		try {
			while (++i < array.length && (!check || !check())) {
				result = body(i);
				if (result && result.then) {
					if (_isSettledPact(result)) {
						result = result.v;
					} else {
						result.then(_cycle, reject || (reject = _settle.bind(null, pact = new _Pact(), 2)));
						return;
					}
				}
			}
			if (pact) {
				_settle(pact, 1, result);
			} else {
				pact = result;
			}
		} catch (e) {
			_settle(pact || (pact = new _Pact()), 2, e);
		}
	}
	_cycle();
	return pact;
}

const _iteratorSymbol = /*#__PURE__*/ typeof Symbol !== "undefined" ? (Symbol.iterator || (Symbol.iterator = Symbol("Symbol.iterator"))) : "@@iterator";

// Asynchronously iterate through an object's values
// Uses for...of if the runtime supports it, otherwise iterates until length on a copy
function _forOf(target, body, check) {
	if (typeof target[_iteratorSymbol] === "function") {
		var iterator = target[_iteratorSymbol](), step, pact, reject;
		function _cycle(result) {
			try {
				while (!(step = iterator.next()).done && (!check || !check())) {
					result = body(step.value);
					if (result && result.then) {
						if (_isSettledPact(result)) {
							result = result.v;
						} else {
							result.then(_cycle, reject || (reject = _settle.bind(null, pact = new _Pact(), 2)));
							return;
						}
					}
				}
				if (pact) {
					_settle(pact, 1, result);
				} else {
					pact = result;
				}
			} catch (e) {
				_settle(pact || (pact = new _Pact()), 2, e);
			}
		}
		_cycle();
		if (iterator.return) {
			var _fixup = function(value) {
				try {
					if (!step.done) {
						iterator.return();
					}
				} catch(e) {
				}
				return value;
			};
			if (pact && pact.then) {
				return pact.then(_fixup, function(e) {
					throw _fixup(e);
				});
			}
			_fixup();
		}
		return pact;
	}
	// No support for Symbol.iterator
	if (!("length" in target)) {
		throw new TypeError("Object is not iterable");
	}
	// Handle live collections properly
	var values = [];
	for (var i = 0; i < target.length; i++) {
		values.push(target[i]);
	}
	return _forTo(values, function(i) { return body(values[i]); }, check);
}

const _asyncIteratorSymbol = /*#__PURE__*/ typeof Symbol !== "undefined" ? (Symbol.asyncIterator || (Symbol.asyncIterator = Symbol("Symbol.asyncIterator"))) : "@@asyncIterator";

// Asynchronously implement a generic for loop
function _for(test, update, body) {
	var stage;
	for (;;) {
		var shouldContinue = test();
		if (_isSettledPact(shouldContinue)) {
			shouldContinue = shouldContinue.v;
		}
		if (!shouldContinue) {
			return result;
		}
		if (shouldContinue.then) {
			stage = 0;
			break;
		}
		var result = body();
		if (result && result.then) {
			if (_isSettledPact(result)) {
				result = result.s;
			} else {
				stage = 1;
				break;
			}
		}
		if (update) {
			var updateValue = update();
			if (updateValue && updateValue.then && !_isSettledPact(updateValue)) {
				stage = 2;
				break;
			}
		}
	}
	var pact = new _Pact();
	var reject = _settle.bind(null, pact, 2);
	(stage === 0 ? shouldContinue.then(_resumeAfterTest) : stage === 1 ? result.then(_resumeAfterBody) : updateValue.then(_resumeAfterUpdate)).then(void 0, reject);
	return pact;
	function _resumeAfterBody(value) {
		result = value;
		do {
			if (update) {
				updateValue = update();
				if (updateValue && updateValue.then && !_isSettledPact(updateValue)) {
					updateValue.then(_resumeAfterUpdate).then(void 0, reject);
					return;
				}
			}
			shouldContinue = test();
			if (!shouldContinue || (_isSettledPact(shouldContinue) && !shouldContinue.v)) {
				_settle(pact, 1, result);
				return;
			}
			if (shouldContinue.then) {
				shouldContinue.then(_resumeAfterTest).then(void 0, reject);
				return;
			}
			result = body();
			if (_isSettledPact(result)) {
				result = result.v;
			}
		} while (!result || !result.then);
		result.then(_resumeAfterBody).then(void 0, reject);
	}
	function _resumeAfterTest(shouldContinue) {
		if (shouldContinue) {
			result = body();
			if (result && result.then) {
				result.then(_resumeAfterBody).then(void 0, reject);
			} else {
				_resumeAfterBody(result);
			}
		} else {
			_settle(pact, 1, result);
		}
	}
	function _resumeAfterUpdate() {
		if (shouldContinue = test()) {
			if (shouldContinue.then) {
				shouldContinue.then(_resumeAfterTest).then(void 0, reject);
			} else {
				_resumeAfterTest(shouldContinue);
			}
		} else {
			_settle(pact, 1, result);
		}
	}
}

// Asynchronously call a function and send errors to recovery continuation
function _catch(body, recover) {
	try {
		var result = body();
	} catch(e) {
		return recover(e);
	}
	if (result && result.then) {
		return result.then(void 0, recover);
	}
	return result;
}

var _100_PERCENT = new Fraction(_100);
var Percent = /*#__PURE__*/function (_Fraction) {
  function Percent() {
    return _Fraction.apply(this, arguments) || this;
  }
  _inheritsLoose(Percent, _Fraction);
  var _proto = Percent.prototype;
  _proto.toSignificant = function toSignificant(significantDigits, format, rounding) {
    if (significantDigits === void 0) {
      significantDigits = 5;
    }
    return this.multiply(_100_PERCENT).toSignificant(significantDigits, format, rounding);
  };
  _proto.toFixed = function toFixed(decimalPlaces, format, rounding) {
    if (decimalPlaces === void 0) {
      decimalPlaces = 2;
    }
    return this.multiply(_100_PERCENT).toFixed(decimalPlaces, format, rounding);
  };
  return Percent;
}(Fraction);

var getTradingFee = function getTradingFee(pairs) {
  try {
    var maxTradingFee = 0;
    var _temp13 = _forOf(pairs, function (pair) {
      return Promise.resolve(pair.getTradingFee()).then(function (tradingFee) {
        if (tradingFee > maxTradingFee) maxTradingFee = tradingFee;
      });
    });
    return Promise.resolve(_temp13 && _temp13.then ? _temp13.then(function () {
      return maxTradingFee;
    }) : maxTradingFee);
  } catch (e) {
    return Promise.reject(e);
  }
};
function inputOutputComparator(a, b) {
  invariant(currencyEquals(a.inputAmount.currency, b.inputAmount.currency), 'INPUT_CURRENCY');
  invariant(currencyEquals(a.outputAmount.currency, b.outputAmount.currency), 'OUTPUT_CURRENCY');
  if (a.outputAmount.equalTo(b.outputAmount)) {
    if (a.inputAmount.equalTo(b.inputAmount)) {
      return 0;
    }
    if (a.inputAmount.lessThan(b.inputAmount)) {
      return -1;
    } else {
      return 1;
    }
  } else {
    if (a.outputAmount.lessThan(b.outputAmount)) {
      return 1;
    } else {
      return -1;
    }
  }
}
function tradeComparator(a, b) {
  if (!a.priceImpact || !b.priceImpact || !a.inputAmount || !b.inputAmount || !a.outputAmount || !b.outputAmount) {
    return -1;
  }
  var ioComp = inputOutputComparator(a, b);
  if (ioComp !== 0) {
    return ioComp;
  }
  if (a.priceImpact.lessThan(b.priceImpact)) {
    return -1;
  } else if (a.priceImpact.greaterThan(b.priceImpact)) {
    return 1;
  }
  return a.route.path.length - b.route.path.length;
}
function wrappedAmount(currencyAmount, chainId) {
  if (currencyAmount instanceof TokenAmount) return currencyAmount;
  if (currencyAmount.currency === ETHER) return new TokenAmount(WETH[chainId], currencyAmount.raw);
  invariant(false, 'CURRENCY');
}
function wrappedCurrency(currency, chainId) {
  if (currency instanceof Token) return currency;
  if (currency === ETHER) return WETH[chainId];
  invariant(false, 'CURRENCY');
}
function getComputePair(pairs, path) {
  var firstTokenAmounts = pairs[0].tokenAmounts;
  var firstToken = path[0];
  var inputReserve = firstTokenAmounts[0].token.equals(firstToken) ? firstTokenAmounts[0] : firstTokenAmounts[1];
  var lastTokenAmounts = pairs[pairs.length - 1].tokenAmounts;
  var lastToken = path[path.length - 1];
  var outputReserve = lastTokenAmounts[0].token.equals(lastToken) ? lastTokenAmounts[0] : lastTokenAmounts[1];
  return new Pair(inputReserve, outputReserve);
}
var Trade = /*#__PURE__*/function () {
  function Trade(route, amount, tradeType) {
    var _this = this;
    this.computeAmount = function (_ref) {
      var amount = _ref.value,
        account = _ref.from;
      try {
        var _temp2 = function _temp2() {
          return Promise.resolve(getTradingFee(_route.pairs)).then(function (_getTradingFee) {
            _this.tradingFee = _getTradingFee;
            _this.inputAmount = _tradeType === exports.TradeType.EXACT_INPUT ? amount : _route.input === ETHER ? CurrencyAmount.ether(amounts[0].raw) : amounts[0];
            _this.outputAmount = _tradeType === exports.TradeType.EXACT_OUTPUT ? amount : _route.output === ETHER ? CurrencyAmount.ether(amounts[amounts.length - 1].raw) : amounts[amounts.length - 1];
            _this.executionPrice = new Price(_this.inputAmount.currency, _this.outputAmount.currency, _this.inputAmount.raw, _this.outputAmount.raw);
          });
        };
        var _ref2 = [_this.route, _this.tradeType],
          _route = _ref2[0],
          _tradeType = _ref2[1];
        var amounts = new Array(2);
        var _temp = function () {
          if (_tradeType === exports.TradeType.EXACT_INPUT) {
            invariant(currencyEquals(amount.currency, _route.input), 'INPUT');
            var inputAmount = wrappedAmount(amount, _route.chainId);
            var computePair = getComputePair(_route.pairs, _route.path);
            return Promise.resolve(computePair.getOutputAmountAsync(inputAmount, _route.pairs, _route.path, _route.chainId, account)).then(function (_ref3) {
              var amountOut = _ref3[0],
                nextPair = _ref3[1],
                priceUpdate = _ref3[2],
                updateFee = _ref3[3],
                priceImpactK = _ref3[4];
              amounts[amounts.length - 1] = amountOut;
              _this.priceUpdate = priceUpdate;
              _this.updateFee = updateFee;
              _this.priceImpactK = priceImpactK;
            });
          } else {
            invariant(currencyEquals(amount.currency, _route.output), 'OUTPUT');
            var outputAmount = wrappedAmount(amount, _route.chainId);
            var _computePair = getComputePair(_route.pairs, _route.path);
            return Promise.resolve(_computePair.getInputAmountAsync(outputAmount, _route.pairs, _route.path, _route.chainId, account)).then(function (_ref4) {
              var amountIn = _ref4[0],
                nextPair = _ref4[1],
                priceUpdate = _ref4[2],
                updateFee = _ref4[3],
                priceImpactK = _ref4[4];
              amounts[0] = amountIn;
              _this.priceUpdate = priceUpdate;
              _this.updateFee = updateFee;
              _this.priceImpactK = priceImpactK;
            });
          }
        }();
        return Promise.resolve(_temp && _temp.then ? _temp.then(_temp2) : _temp2(_temp));
      } catch (e) {
        return Promise.reject(e);
      }
    };
    this.route = route;
    this.tradeType = tradeType;
    this.priceImpact = new Percent('0');
    this.priceUpdate = [];
    this.updateFee = 0;
  }
  Trade.exactIn = function exactIn(route, amountIn) {
    return new Trade(route, amountIn, exports.TradeType.EXACT_INPUT);
  };
  Trade.exactOut = function exactOut(route, amountOut) {
    return new Trade(route, amountOut, exports.TradeType.EXACT_OUTPUT);
  };
  var _proto = Trade.prototype;
  _proto.minimumAmountOut = function minimumAmountOut(slippageTolerance) {
    if (!this.outputAmount) {
      return CurrencyAmount.ether('0');
    }
    invariant(!slippageTolerance.lessThan(ZERO), 'SLIPPAGE_TOLERANCE');
    if (this.tradeType === exports.TradeType.EXACT_OUTPUT) {
      return this.outputAmount;
    } else {
      var slippageAdjustedAmountOut = new Fraction(ONE).add(slippageTolerance).invert().multiply(this.outputAmount.raw).quotient;
      return this.outputAmount instanceof TokenAmount ? new TokenAmount(this.outputAmount.token, slippageAdjustedAmountOut) : CurrencyAmount.ether(slippageAdjustedAmountOut);
    }
  };
  _proto.maximumAmountIn = function maximumAmountIn(slippageTolerance) {
    if (!this.inputAmount) {
      return CurrencyAmount.ether('0');
    }
    invariant(!slippageTolerance.lessThan(ZERO), 'SLIPPAGE_TOLERANCE');
    if (this.tradeType === exports.TradeType.EXACT_INPUT) {
      return this.inputAmount;
    } else {
      var slippageAdjustedAmountIn = new Fraction(ONE).add(slippageTolerance).multiply(this.inputAmount.raw).quotient;
      return this.inputAmount instanceof TokenAmount ? new TokenAmount(this.inputAmount.token, slippageAdjustedAmountIn) : CurrencyAmount.ether(slippageAdjustedAmountIn);
    }
  };
  Trade.sleep = function sleep(timeout) {
    return new Promise(function (resolve) {
      setTimeout(function () {
        resolve(true);
      }, timeout);
    });
  };
  Trade.getPath = function getPath(input, pairs) {
    var path = [input instanceof Token ? input : WETH[pairs[0].chainId]];
    for (var _iterator = _createForOfIteratorHelperLoose(pairs.entries()), _step; !(_step = _iterator()).done;) {
      var _step$value = _step.value,
        i = _step$value[0],
        pair = _step$value[1];
      var currentInput = path[i];
      invariant(currentInput.equals(pair.token0) || currentInput.equals(pair.token1), 'PATH');
      var output = currentInput.equals(pair.token0) ? pair.token1 : pair.token0;
      path.push(output);
    }
    return path;
  };
  Trade.bestTradeExactIn = function bestTradeExactIn(account, pairs, currencyAmountIn, currencyOut, _temp6, currentPairs, originalAmountIn, bestTrades) {
    var _ref5 = _temp6 === void 0 ? {} : _temp6,
      _ref5$maxNumResults = _ref5.maxNumResults,
      maxNumResults = _ref5$maxNumResults === void 0 ? 3 : _ref5$maxNumResults,
      _ref5$maxHops = _ref5.maxHops,
      maxHops = _ref5$maxHops === void 0 ? 3 : _ref5$maxHops;
    if (currentPairs === void 0) {
      currentPairs = [];
    }
    if (originalAmountIn === void 0) {
      originalAmountIn = currencyAmountIn;
    }
    if (bestTrades === void 0) {
      bestTrades = [];
    }
    try {
      invariant(pairs.length > 0, 'PAIRS');
      invariant(maxHops > 0, 'MAX_HOPS');
      invariant(originalAmountIn === currencyAmountIn || currentPairs.length > 0, 'INVALID_RECURSION');
      var chainId = currencyAmountIn instanceof TokenAmount ? currencyAmountIn.token.chainId : currencyOut instanceof Token ? currencyOut.chainId : undefined;
      invariant(chainId !== undefined, 'CHAIN_ID');
      var amountIn = wrappedAmount(currencyAmountIn, chainId);
      var tokenOut = wrappedCurrency(currencyOut, chainId);
      var _temp5 = _forTo(pairs, function (i) {
        var pair = pairs[i];
        if (!pair.token0.equals(amountIn.token) && !pair.token1.equals(amountIn.token)) return;
        if (pair.reserve0.equalTo(ZERO) || pair.reserve1.equalTo(ZERO)) return;
        var path = Trade.getPath(originalAmountIn.currency, [].concat(currentPairs, [pair]));
        var oAmountIn = wrappedAmount(originalAmountIn, chainId);
        var computePair = getComputePair([].concat(currentPairs, [pair]), path);
        return Promise.resolve(computePair.getOutputAmountAsync(oAmountIn, [].concat(currentPairs, [pair]), path, chainId, account)).then(function (_ref6) {
          var amountOut = _ref6[0];
          var _temp4 = function () {
            if (amountOut.token.equals(tokenOut)) {
              var newRoute = new Route([].concat(currentPairs, [pair]), originalAmountIn.currency, currencyOut);
              var newTrade = new Trade(newRoute, originalAmountIn, exports.TradeType.EXACT_INPUT);
              return Promise.resolve(newTrade.computeAmount({
                value: originalAmountIn,
                from: account
              })).then(function () {
                sortedInsert(bestTrades, newTrade, maxNumResults, tradeComparator);
              });
            } else {
              var _temp7 = function () {
                if (maxHops > 1 && pairs.length > 1) {
                  var pairsExcludingThisPair = pairs.slice(0, i).concat(pairs.slice(i + 1, pairs.length));
                  return Promise.resolve(Trade.bestTradeExactIn(account, pairsExcludingThisPair, amountOut, currencyOut, {
                    maxNumResults: maxNumResults,
                    maxHops: maxHops - 1
                  }, [].concat(currentPairs, [pair]), originalAmountIn, bestTrades)).then(function () {});
                }
              }();
              if (_temp7 && _temp7.then) return _temp7.then(function () {});
            }
          }();
          if (_temp4 && _temp4.then) return _temp4.then(function () {});
        });
      });
      return Promise.resolve(_temp5 && _temp5.then ? _temp5.then(function () {
        return bestTrades;
      }) : bestTrades);
    } catch (e) {
      return Promise.reject(e);
    }
  };
  Trade.bestTradeExactOut = function bestTradeExactOut(account, pairs, currencyIn, currencyAmountOut, _temp11, currentPairs, originalAmountOut, bestTrades) {
    var _ref7 = _temp11 === void 0 ? {} : _temp11,
      _ref7$maxNumResults = _ref7.maxNumResults,
      maxNumResults = _ref7$maxNumResults === void 0 ? 3 : _ref7$maxNumResults,
      _ref7$maxHops = _ref7.maxHops,
      maxHops = _ref7$maxHops === void 0 ? 3 : _ref7$maxHops;
    if (currentPairs === void 0) {
      currentPairs = [];
    }
    if (originalAmountOut === void 0) {
      originalAmountOut = currencyAmountOut;
    }
    if (bestTrades === void 0) {
      bestTrades = [];
    }
    try {
      invariant(pairs.length > 0, 'PAIRS');
      invariant(maxHops > 0, 'MAX_HOPS');
      invariant(originalAmountOut === currencyAmountOut || currentPairs.length > 0, 'INVALID_RECURSION');
      var chainId = currencyAmountOut instanceof TokenAmount ? currencyAmountOut.token.chainId : currencyIn instanceof Token ? currencyIn.chainId : undefined;
      invariant(chainId !== undefined, 'CHAIN_ID');
      var amountOut = wrappedAmount(currencyAmountOut, chainId);
      var tokenIn = wrappedCurrency(currencyIn, chainId);
      var _i = 0;
      var _temp10 = _for(function () {
        return _i < (pairs === null || pairs === void 0 ? void 0 : pairs.length);
      }, function () {
        return _i++;
      }, function () {
        var pair = pairs[_i];
        if (!(pair !== null && pair !== void 0 && pair.token0.equals(amountOut.token)) && !(pair !== null && pair !== void 0 && pair.token1.equals(amountOut.token))) return;
        if (pair.reserve0.equalTo(ZERO) || pair.reserve1.equalTo(ZERO)) return;
        var path = Trade.getPath(originalAmountOut.currency, [].concat(currentPairs, [pair])).reverse();
        var oAmountOut = wrappedAmount(originalAmountOut, chainId);
        var computePair = getComputePair([pair].concat(currentPairs), path);
        return Promise.resolve(computePair.getInputAmountAsync(oAmountOut, [].concat(currentPairs, [pair]), path, chainId, account)).then(function (_ref8) {
          var amountIn = _ref8[0];
          var _temp9 = function () {
            if (amountIn.token.equals(tokenIn)) {
              var newRoute = new Route([pair].concat(currentPairs), currencyIn, originalAmountOut.currency);
              var newTrade = new Trade(newRoute, originalAmountOut, exports.TradeType.EXACT_OUTPUT);
              return Promise.resolve(newTrade.computeAmount({
                value: originalAmountOut,
                from: account
              })).then(function () {
                sortedInsert(bestTrades, newTrade, maxNumResults, tradeComparator);
              });
            } else {
              var _temp12 = function () {
                if (maxHops > 1 && pairs.length > 1) {
                  var pairsExcludingThisPair = pairs.slice(0, _i).concat(pairs.slice(_i + 1, pairs.length));
                  return Promise.resolve(Trade.bestTradeExactOut(account, pairsExcludingThisPair, currencyIn, amountIn, {
                    maxNumResults: maxNumResults,
                    maxHops: maxHops - 1
                  }, [pair].concat(currentPairs), originalAmountOut, bestTrades)).then(function () {});
                }
              }();
              if (_temp12 && _temp12.then) return _temp12.then(function () {});
            }
          }();
          if (_temp9 && _temp9.then) return _temp9.then(function () {});
        });
      });
      return Promise.resolve(_temp10 && _temp10.then ? _temp10.then(function () {
        return bestTrades;
      }) : bestTrades);
    } catch (e) {
      return Promise.reject(e);
    }
  };
  return Trade;
}();

function toHex(currencyAmount) {
  return "0x" + currencyAmount.raw.toString(16);
}
var ZERO_HEX = '0x0';
var Router = /*#__PURE__*/function () {
  function Router() {}
  Router.swapCallParameters = function swapCallParameters(trade, options, chainId) {
    var _trade$inputAmount, _trade$outputAmount;
    var etherIn = (trade === null || trade === void 0 ? void 0 : (_trade$inputAmount = trade.inputAmount) === null || _trade$inputAmount === void 0 ? void 0 : _trade$inputAmount.currency) === ETHER;
    var etherOut = ((_trade$outputAmount = trade.outputAmount) === null || _trade$outputAmount === void 0 ? void 0 : _trade$outputAmount.currency) === ETHER;
    invariant(!(etherIn && etherOut), 'ETHER_IN_OUT');
    invariant(!('ttl' in options) || options.ttl > 0, 'TTL');
    var to = validateAndParseAddress(options.recipient, chainId);
    var amountIn = trade !== null && trade !== void 0 && trade.inputAmount ? toHex(trade.maximumAmountIn(options.allowedSlippage)) : '0';
    var amountOut = toHex(trade.minimumAmountOut(options.allowedSlippage));
    var path = trade.route.path.map(function (token) {
      return token.address;
    });
    var deadline = 'ttl' in options ? "0x" + (Math.floor(new Date().getTime() / 1000) + options.ttl).toString(16) : "0x" + options.deadline.toString(16);
    var useFeeOnTransfer = Boolean(options.feeOnTransfer);
    var priceUpdate = trade.priceUpdate;
    var updateFee = +trade.updateFee;
    var methodName;
    var args;
    var value;
    switch (trade.tradeType) {
      case exports.TradeType.EXACT_INPUT:
        if (supportContractWithPrice(chainId)) {
          if (etherIn) {
            methodName = useFeeOnTransfer ? 'swapExactETHForTokensSupportingFeeOnTransferTokensWithPrice' : 'swapExactETHForTokensWithPrice';
            args = [amountOut, path, to, deadline, priceUpdate];
            value = trade !== null && trade !== void 0 && trade.inputAmount ? "0x" + (+trade.maximumAmountIn(options.allowedSlippage).raw + updateFee).toString(16) : '0';
          } else if (etherOut) {
            methodName = useFeeOnTransfer ? 'swapExactTokensForETHSupportingFeeOnTransferTokensWithPrice' : 'swapExactTokensForETHWithPrice';
            args = [amountIn, amountOut, path, to, deadline, priceUpdate];
            value = "0x" + updateFee.toString(16);
          } else {
            methodName = useFeeOnTransfer ? 'swapExactTokensForTokensSupportingFeeOnTransferTokensWithPrice' : 'swapExactTokensForTokensWithPrice';
            args = [amountIn, amountOut, path, to, deadline, priceUpdate];
            value = "" + updateFee;
          }
        } else {
          if (etherIn) {
            methodName = useFeeOnTransfer ? 'swapExactETHForTokensSupportingFeeOnTransferTokens' : 'swapExactETHForTokens';
            args = [amountOut, path, to, deadline];
            value = amountIn;
          } else if (etherOut) {
            methodName = useFeeOnTransfer ? 'swapExactTokensForETHSupportingFeeOnTransferTokens' : 'swapExactTokensForETH';
            args = [amountIn, amountOut, path, to, deadline];
            value = ZERO_HEX;
          } else {
            methodName = useFeeOnTransfer ? 'swapExactTokensForTokensSupportingFeeOnTransferTokens' : 'swapExactTokensForTokens';
            args = [amountIn, amountOut, path, to, deadline];
            value = ZERO_HEX;
          }
        }
        break;
      case exports.TradeType.EXACT_OUTPUT:
        invariant(!useFeeOnTransfer, 'EXACT_OUT_FOT');
        if (supportContractWithPrice(chainId)) {
          if (etherIn) {
            methodName = 'swapETHForExactTokensWithPrice';
            args = [amountOut, path, to, deadline, priceUpdate];
            value = value = trade !== null && trade !== void 0 && trade.inputAmount ? "0x" + (+trade.maximumAmountIn(options.allowedSlippage).raw + updateFee).toString(16) : '0';
          } else if (etherOut) {
            methodName = 'swapTokensForExactETHWithPrice';
            args = [amountOut, amountIn, path, to, deadline, priceUpdate];
            value = "" + updateFee;
          } else {
            methodName = 'swapTokensForExactTokensWithPrice';
            args = [amountOut, amountIn, path, to, deadline, priceUpdate];
            value = "" + updateFee;
          }
        } else {
          if (etherIn) {
            methodName = 'swapETHForExactTokens';
            args = [amountOut, path, to, deadline];
            value = amountIn;
          } else if (etherOut) {
            methodName = 'swapTokensForExactETH';
            args = [amountOut, amountIn, path, to, deadline];
            value = ZERO_HEX;
          } else {
            methodName = 'swapTokensForExactTokens';
            args = [amountOut, amountIn, path, to, deadline];
            value = ZERO_HEX;
          }
        }
        break;
    }
    return {
      methodName: methodName,
      args: args,
      value: value
    };
  };
  return Router;
}();

var ERC20 = [
	{
		constant: true,
		inputs: [
		],
		name: "decimals",
		outputs: [
			{
				name: "",
				type: "uint8"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: true,
		inputs: [
			{
				name: "",
				type: "address"
			}
		],
		name: "balanceOf",
		outputs: [
			{
				name: "",
				type: "uint256"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	}
];

var contractName = "ISafeswapPair";
var abi = [
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "owner",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "spender",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "value",
				type: "uint256"
			}
		],
		name: "Approval",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "sender",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount0",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount1",
				type: "uint256"
			},
			{
				indexed: true,
				internalType: "address",
				name: "to",
				type: "address"
			}
		],
		name: "Burn",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "sender",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount0",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount1",
				type: "uint256"
			}
		],
		name: "Mint",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "sender",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount0In",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount1In",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount0Out",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount1Out",
				type: "uint256"
			},
			{
				indexed: true,
				internalType: "address",
				name: "to",
				type: "address"
			}
		],
		name: "Swap",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "uint112",
				name: "reserve0",
				type: "uint112"
			},
			{
				indexed: false,
				internalType: "uint112",
				name: "reserve1",
				type: "uint112"
			}
		],
		name: "Sync",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "from",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "value",
				type: "uint256"
			}
		],
		name: "Transfer",
		type: "event"
	},
	{
		inputs: [
		],
		name: "DOMAIN_SEPARATOR",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "MINIMUM_LIQUIDITY",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "PERMIT_TYPEHASH",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			},
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		name: "allowance",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "spender",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "value",
				type: "uint256"
			}
		],
		name: "approve",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		name: "balanceOf",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "to",
				type: "address"
			}
		],
		name: "burn",
		outputs: [
			{
				internalType: "uint256",
				name: "amount0",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amount1",
				type: "uint256"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
		],
		name: "decimals",
		outputs: [
			{
				internalType: "uint8",
				name: "",
				type: "uint8"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "factory",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "getReserves",
		outputs: [
			{
				internalType: "uint112",
				name: "_reserve0",
				type: "uint112"
			},
			{
				internalType: "uint112",
				name: "_reserve1",
				type: "uint112"
			},
			{
				internalType: "uint32",
				name: "_blockTimestampLast",
				type: "uint32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "_token0",
				type: "address"
			},
			{
				internalType: "address",
				name: "_token1",
				type: "address"
			}
		],
		name: "initialize",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
		],
		name: "kLast",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "to",
				type: "address"
			}
		],
		name: "mint",
		outputs: [
			{
				internalType: "uint256",
				name: "liquidity",
				type: "uint256"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
		],
		name: "name",
		outputs: [
			{
				internalType: "string",
				name: "",
				type: "string"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		name: "nonces",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "owner",
				type: "address"
			},
			{
				internalType: "address",
				name: "spender",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "value",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256"
			},
			{
				internalType: "uint8",
				name: "v",
				type: "uint8"
			},
			{
				internalType: "bytes32",
				name: "r",
				type: "bytes32"
			},
			{
				internalType: "bytes32",
				name: "s",
				type: "bytes32"
			}
		],
		name: "permit",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
		],
		name: "price0CumulativeLast",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "price1CumulativeLast",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "to",
				type: "address"
			}
		],
		name: "skim",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "amount0Out",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amount1Out",
				type: "uint256"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "bytes",
				name: "data",
				type: "bytes"
			}
		],
		name: "swap",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
		],
		name: "symbol",
		outputs: [
			{
				internalType: "string",
				name: "",
				type: "string"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "sync",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
		],
		name: "token0",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "token1",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "totalSupply",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "value",
				type: "uint256"
			}
		],
		name: "transfer",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "from",
				type: "address"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "value",
				type: "uint256"
			}
		],
		name: "transferFrom",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	}
];
var metadata = "{\"compiler\":{\"version\":\"0.5.16+commit.9c3226ce\"},\"language\":\"Solidity\",\"output\":{\"abi\":[{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"spender\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"value\",\"type\":\"uint256\"}],\"name\":\"Approval\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"sender\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"amount0\",\"type\":\"uint256\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"amount1\",\"type\":\"uint256\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"to\",\"type\":\"address\"}],\"name\":\"Burn\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"sender\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"amount0\",\"type\":\"uint256\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"amount1\",\"type\":\"uint256\"}],\"name\":\"Mint\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"sender\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"amount0In\",\"type\":\"uint256\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"amount1In\",\"type\":\"uint256\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"amount0Out\",\"type\":\"uint256\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"amount1Out\",\"type\":\"uint256\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"to\",\"type\":\"address\"}],\"name\":\"Swap\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"internalType\":\"uint112\",\"name\":\"reserve0\",\"type\":\"uint112\"},{\"indexed\":false,\"internalType\":\"uint112\",\"name\":\"reserve1\",\"type\":\"uint112\"}],\"name\":\"Sync\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"from\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"to\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"value\",\"type\":\"uint256\"}],\"name\":\"Transfer\",\"type\":\"event\"},{\"constant\":true,\"inputs\":[],\"name\":\"DOMAIN_SEPARATOR\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"MINIMUM_LIQUIDITY\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"pure\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"PERMIT_TYPEHASH\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"payable\":false,\"stateMutability\":\"pure\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"spender\",\"type\":\"address\"}],\"name\":\"allowance\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"internalType\":\"address\",\"name\":\"spender\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"value\",\"type\":\"uint256\"}],\"name\":\"approve\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"}],\"name\":\"balanceOf\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"internalType\":\"address\",\"name\":\"to\",\"type\":\"address\"}],\"name\":\"burn\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"amount0\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"amount1\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"decimals\",\"outputs\":[{\"internalType\":\"uint8\",\"name\":\"\",\"type\":\"uint8\"}],\"payable\":false,\"stateMutability\":\"pure\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"factory\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"getReserves\",\"outputs\":[{\"internalType\":\"uint112\",\"name\":\"reserve0\",\"type\":\"uint112\"},{\"internalType\":\"uint112\",\"name\":\"reserve1\",\"type\":\"uint112\"},{\"internalType\":\"uint32\",\"name\":\"blockTimestampLast\",\"type\":\"uint32\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"name\":\"initialize\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"kLast\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"internalType\":\"address\",\"name\":\"to\",\"type\":\"address\"}],\"name\":\"mint\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"liquidity\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"name\",\"outputs\":[{\"internalType\":\"string\",\"name\":\"\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"pure\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"}],\"name\":\"nonces\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"spender\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"value\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"deadline\",\"type\":\"uint256\"},{\"internalType\":\"uint8\",\"name\":\"v\",\"type\":\"uint8\"},{\"internalType\":\"bytes32\",\"name\":\"r\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"s\",\"type\":\"bytes32\"}],\"name\":\"permit\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"price0CumulativeLast\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"price1CumulativeLast\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"internalType\":\"address\",\"name\":\"to\",\"type\":\"address\"}],\"name\":\"skim\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"amount0Out\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"amount1Out\",\"type\":\"uint256\"},{\"internalType\":\"address\",\"name\":\"to\",\"type\":\"address\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"name\":\"swap\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"symbol\",\"outputs\":[{\"internalType\":\"string\",\"name\":\"\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"pure\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[],\"name\":\"sync\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"token0\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"token1\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"totalSupply\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"internalType\":\"address\",\"name\":\"to\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"value\",\"type\":\"uint256\"}],\"name\":\"transfer\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"internalType\":\"address\",\"name\":\"from\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"to\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"value\",\"type\":\"uint256\"}],\"name\":\"transferFrom\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"}],\"devdoc\":{\"methods\":{}},\"userdoc\":{\"methods\":{}}},\"settings\":{\"compilationTarget\":{\"project:/contracts/interfaces/ISafeswapPair.sol\":\"ISafeswapPair\"},\"evmVersion\":\"istanbul\",\"libraries\":{},\"optimizer\":{\"enabled\":true,\"runs\":999999},\"remappings\":[]},\"sources\":{\"project:/contracts/interfaces/ISafeswapPair.sol\":{\"keccak256\":\"0x01e4c89672eb1a089889c4088a4c40c6f481e73f0e58e4fcf58654eccd5bf5c5\",\"urls\":[\"bzz-raw://57fd37bbe214eb608ae67583fc204ef399868e1932429ac39dd097cd5e0a222d\",\"dweb:/ipfs/QmZxB5VcV8TwTqumezNGQWQjzga5XwcxdXn58wM9obUzSB\"]}},\"version\":1}";
var bytecode = "0x";
var deployedBytecode = "0x";
var sourceMap = "";
var deployedSourceMap = "";
var source = "pragma solidity >=0.5.0;\n\ninterface ISafeswapPair {\n    event Approval(address indexed owner, address indexed spender, uint value);\n    event Transfer(address indexed from, address indexed to, uint value);\n\n    function name() external pure returns (string memory);\n    function symbol() external pure returns (string memory);\n    function decimals() external pure returns (uint8);\n    function totalSupply() external view returns (uint);\n    function balanceOf(address owner) external view returns (uint);\n    function allowance(address owner, address spender) external view returns (uint);\n\n    function approve(address spender, uint value) external returns (bool);\n    function transfer(address to, uint value) external returns (bool);\n    function transferFrom(address from, address to, uint value) external returns (bool);\n\n    function DOMAIN_SEPARATOR() external view returns (bytes32);\n    function PERMIT_TYPEHASH() external pure returns (bytes32);\n    function nonces(address owner) external view returns (uint);\n\n    function permit(address owner, address spender, uint value, uint deadline, uint8 v, bytes32 r, bytes32 s) external;\n\n    event Mint(address indexed sender, uint amount0, uint amount1);\n    event Burn(address indexed sender, uint amount0, uint amount1, address indexed to);\n    event Swap(\n        address indexed sender,\n        uint amount0In,\n        uint amount1In,\n        uint amount0Out,\n        uint amount1Out,\n        address indexed to\n    );\n    event Sync(uint112 reserve0, uint112 reserve1);\n\n    function MINIMUM_LIQUIDITY() external pure returns (uint);\n    function factory() external view returns (address);\n    function token0() external view returns (address);\n    function token1() external view returns (address);\n    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);\n    function price0CumulativeLast() external view returns (uint);\n    function price1CumulativeLast() external view returns (uint);\n    function kLast() external view returns (uint);\n\n    function mint(address to) external returns (uint liquidity);\n    function burn(address to) external returns (uint amount0, uint amount1);\n    function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external;\n    function skim(address to) external;\n    function sync() external;\n\n    function initialize(address, address) external;\n}\n";
var sourcePath = "E:\\safemoon\\solidity\\compile\\swap-factory\\contracts\\interfaces\\ISafeswapPair.sol";
var ast = {
	absolutePath: "project:/contracts/interfaces/ISafeswapPair.sol",
	exportedSymbols: {
		ISafeswapPair: [
			2189
		]
	},
	id: 2190,
	nodeType: "SourceUnit",
	nodes: [
		{
			id: 1949,
			literals: [
				"solidity",
				">=",
				"0.5",
				".0"
			],
			nodeType: "PragmaDirective",
			src: "0:24:8"
		},
		{
			baseContracts: [
			],
			contractDependencies: [
			],
			contractKind: "interface",
			documentation: null,
			fullyImplemented: false,
			id: 2189,
			linearizedBaseContracts: [
				2189
			],
			name: "ISafeswapPair",
			nodeType: "ContractDefinition",
			nodes: [
				{
					anonymous: false,
					documentation: null,
					id: 1957,
					name: "Approval",
					nodeType: "EventDefinition",
					parameters: {
						id: 1956,
						nodeType: "ParameterList",
						parameters: [
							{
								constant: false,
								id: 1951,
								indexed: true,
								name: "owner",
								nodeType: "VariableDeclaration",
								scope: 1957,
								src: "71:21:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_address",
									typeString: "address"
								},
								typeName: {
									id: 1950,
									name: "address",
									nodeType: "ElementaryTypeName",
									src: "71:7:8",
									stateMutability: "nonpayable",
									typeDescriptions: {
										typeIdentifier: "t_address",
										typeString: "address"
									}
								},
								value: null,
								visibility: "internal"
							},
							{
								constant: false,
								id: 1953,
								indexed: true,
								name: "spender",
								nodeType: "VariableDeclaration",
								scope: 1957,
								src: "94:23:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_address",
									typeString: "address"
								},
								typeName: {
									id: 1952,
									name: "address",
									nodeType: "ElementaryTypeName",
									src: "94:7:8",
									stateMutability: "nonpayable",
									typeDescriptions: {
										typeIdentifier: "t_address",
										typeString: "address"
									}
								},
								value: null,
								visibility: "internal"
							},
							{
								constant: false,
								id: 1955,
								indexed: false,
								name: "value",
								nodeType: "VariableDeclaration",
								scope: 1957,
								src: "119:10:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_uint256",
									typeString: "uint256"
								},
								typeName: {
									id: 1954,
									name: "uint",
									nodeType: "ElementaryTypeName",
									src: "119:4:8",
									typeDescriptions: {
										typeIdentifier: "t_uint256",
										typeString: "uint256"
									}
								},
								value: null,
								visibility: "internal"
							}
						],
						src: "70:60:8"
					},
					src: "56:75:8"
				},
				{
					anonymous: false,
					documentation: null,
					id: 1965,
					name: "Transfer",
					nodeType: "EventDefinition",
					parameters: {
						id: 1964,
						nodeType: "ParameterList",
						parameters: [
							{
								constant: false,
								id: 1959,
								indexed: true,
								name: "from",
								nodeType: "VariableDeclaration",
								scope: 1965,
								src: "151:20:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_address",
									typeString: "address"
								},
								typeName: {
									id: 1958,
									name: "address",
									nodeType: "ElementaryTypeName",
									src: "151:7:8",
									stateMutability: "nonpayable",
									typeDescriptions: {
										typeIdentifier: "t_address",
										typeString: "address"
									}
								},
								value: null,
								visibility: "internal"
							},
							{
								constant: false,
								id: 1961,
								indexed: true,
								name: "to",
								nodeType: "VariableDeclaration",
								scope: 1965,
								src: "173:18:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_address",
									typeString: "address"
								},
								typeName: {
									id: 1960,
									name: "address",
									nodeType: "ElementaryTypeName",
									src: "173:7:8",
									stateMutability: "nonpayable",
									typeDescriptions: {
										typeIdentifier: "t_address",
										typeString: "address"
									}
								},
								value: null,
								visibility: "internal"
							},
							{
								constant: false,
								id: 1963,
								indexed: false,
								name: "value",
								nodeType: "VariableDeclaration",
								scope: 1965,
								src: "193:10:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_uint256",
									typeString: "uint256"
								},
								typeName: {
									id: 1962,
									name: "uint",
									nodeType: "ElementaryTypeName",
									src: "193:4:8",
									typeDescriptions: {
										typeIdentifier: "t_uint256",
										typeString: "uint256"
									}
								},
								value: null,
								visibility: "internal"
							}
						],
						src: "150:54:8"
					},
					src: "136:69:8"
				},
				{
					body: null,
					documentation: null,
					id: 1970,
					implemented: false,
					kind: "function",
					modifiers: [
					],
					name: "name",
					nodeType: "FunctionDefinition",
					parameters: {
						id: 1966,
						nodeType: "ParameterList",
						parameters: [
						],
						src: "224:2:8"
					},
					returnParameters: {
						id: 1969,
						nodeType: "ParameterList",
						parameters: [
							{
								constant: false,
								id: 1968,
								name: "",
								nodeType: "VariableDeclaration",
								scope: 1970,
								src: "250:13:8",
								stateVariable: false,
								storageLocation: "memory",
								typeDescriptions: {
									typeIdentifier: "t_string_memory_ptr",
									typeString: "string"
								},
								typeName: {
									id: 1967,
									name: "string",
									nodeType: "ElementaryTypeName",
									src: "250:6:8",
									typeDescriptions: {
										typeIdentifier: "t_string_storage_ptr",
										typeString: "string"
									}
								},
								value: null,
								visibility: "internal"
							}
						],
						src: "249:15:8"
					},
					scope: 2189,
					src: "211:54:8",
					stateMutability: "pure",
					superFunction: null,
					visibility: "external"
				},
				{
					body: null,
					documentation: null,
					id: 1975,
					implemented: false,
					kind: "function",
					modifiers: [
					],
					name: "symbol",
					nodeType: "FunctionDefinition",
					parameters: {
						id: 1971,
						nodeType: "ParameterList",
						parameters: [
						],
						src: "285:2:8"
					},
					returnParameters: {
						id: 1974,
						nodeType: "ParameterList",
						parameters: [
							{
								constant: false,
								id: 1973,
								name: "",
								nodeType: "VariableDeclaration",
								scope: 1975,
								src: "311:13:8",
								stateVariable: false,
								storageLocation: "memory",
								typeDescriptions: {
									typeIdentifier: "t_string_memory_ptr",
									typeString: "string"
								},
								typeName: {
									id: 1972,
									name: "string",
									nodeType: "ElementaryTypeName",
									src: "311:6:8",
									typeDescriptions: {
										typeIdentifier: "t_string_storage_ptr",
										typeString: "string"
									}
								},
								value: null,
								visibility: "internal"
							}
						],
						src: "310:15:8"
					},
					scope: 2189,
					src: "270:56:8",
					stateMutability: "pure",
					superFunction: null,
					visibility: "external"
				},
				{
					body: null,
					documentation: null,
					id: 1980,
					implemented: false,
					kind: "function",
					modifiers: [
					],
					name: "decimals",
					nodeType: "FunctionDefinition",
					parameters: {
						id: 1976,
						nodeType: "ParameterList",
						parameters: [
						],
						src: "348:2:8"
					},
					returnParameters: {
						id: 1979,
						nodeType: "ParameterList",
						parameters: [
							{
								constant: false,
								id: 1978,
								name: "",
								nodeType: "VariableDeclaration",
								scope: 1980,
								src: "374:5:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_uint8",
									typeString: "uint8"
								},
								typeName: {
									id: 1977,
									name: "uint8",
									nodeType: "ElementaryTypeName",
									src: "374:5:8",
									typeDescriptions: {
										typeIdentifier: "t_uint8",
										typeString: "uint8"
									}
								},
								value: null,
								visibility: "internal"
							}
						],
						src: "373:7:8"
					},
					scope: 2189,
					src: "331:50:8",
					stateMutability: "pure",
					superFunction: null,
					visibility: "external"
				},
				{
					body: null,
					documentation: null,
					id: 1985,
					implemented: false,
					kind: "function",
					modifiers: [
					],
					name: "totalSupply",
					nodeType: "FunctionDefinition",
					parameters: {
						id: 1981,
						nodeType: "ParameterList",
						parameters: [
						],
						src: "406:2:8"
					},
					returnParameters: {
						id: 1984,
						nodeType: "ParameterList",
						parameters: [
							{
								constant: false,
								id: 1983,
								name: "",
								nodeType: "VariableDeclaration",
								scope: 1985,
								src: "432:4:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_uint256",
									typeString: "uint256"
								},
								typeName: {
									id: 1982,
									name: "uint",
									nodeType: "ElementaryTypeName",
									src: "432:4:8",
									typeDescriptions: {
										typeIdentifier: "t_uint256",
										typeString: "uint256"
									}
								},
								value: null,
								visibility: "internal"
							}
						],
						src: "431:6:8"
					},
					scope: 2189,
					src: "386:52:8",
					stateMutability: "view",
					superFunction: null,
					visibility: "external"
				},
				{
					body: null,
					documentation: null,
					id: 1992,
					implemented: false,
					kind: "function",
					modifiers: [
					],
					name: "balanceOf",
					nodeType: "FunctionDefinition",
					parameters: {
						id: 1988,
						nodeType: "ParameterList",
						parameters: [
							{
								constant: false,
								id: 1987,
								name: "owner",
								nodeType: "VariableDeclaration",
								scope: 1992,
								src: "462:13:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_address",
									typeString: "address"
								},
								typeName: {
									id: 1986,
									name: "address",
									nodeType: "ElementaryTypeName",
									src: "462:7:8",
									stateMutability: "nonpayable",
									typeDescriptions: {
										typeIdentifier: "t_address",
										typeString: "address"
									}
								},
								value: null,
								visibility: "internal"
							}
						],
						src: "461:15:8"
					},
					returnParameters: {
						id: 1991,
						nodeType: "ParameterList",
						parameters: [
							{
								constant: false,
								id: 1990,
								name: "",
								nodeType: "VariableDeclaration",
								scope: 1992,
								src: "500:4:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_uint256",
									typeString: "uint256"
								},
								typeName: {
									id: 1989,
									name: "uint",
									nodeType: "ElementaryTypeName",
									src: "500:4:8",
									typeDescriptions: {
										typeIdentifier: "t_uint256",
										typeString: "uint256"
									}
								},
								value: null,
								visibility: "internal"
							}
						],
						src: "499:6:8"
					},
					scope: 2189,
					src: "443:63:8",
					stateMutability: "view",
					superFunction: null,
					visibility: "external"
				},
				{
					body: null,
					documentation: null,
					id: 2001,
					implemented: false,
					kind: "function",
					modifiers: [
					],
					name: "allowance",
					nodeType: "FunctionDefinition",
					parameters: {
						id: 1997,
						nodeType: "ParameterList",
						parameters: [
							{
								constant: false,
								id: 1994,
								name: "owner",
								nodeType: "VariableDeclaration",
								scope: 2001,
								src: "530:13:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_address",
									typeString: "address"
								},
								typeName: {
									id: 1993,
									name: "address",
									nodeType: "ElementaryTypeName",
									src: "530:7:8",
									stateMutability: "nonpayable",
									typeDescriptions: {
										typeIdentifier: "t_address",
										typeString: "address"
									}
								},
								value: null,
								visibility: "internal"
							},
							{
								constant: false,
								id: 1996,
								name: "spender",
								nodeType: "VariableDeclaration",
								scope: 2001,
								src: "545:15:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_address",
									typeString: "address"
								},
								typeName: {
									id: 1995,
									name: "address",
									nodeType: "ElementaryTypeName",
									src: "545:7:8",
									stateMutability: "nonpayable",
									typeDescriptions: {
										typeIdentifier: "t_address",
										typeString: "address"
									}
								},
								value: null,
								visibility: "internal"
							}
						],
						src: "529:32:8"
					},
					returnParameters: {
						id: 2000,
						nodeType: "ParameterList",
						parameters: [
							{
								constant: false,
								id: 1999,
								name: "",
								nodeType: "VariableDeclaration",
								scope: 2001,
								src: "585:4:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_uint256",
									typeString: "uint256"
								},
								typeName: {
									id: 1998,
									name: "uint",
									nodeType: "ElementaryTypeName",
									src: "585:4:8",
									typeDescriptions: {
										typeIdentifier: "t_uint256",
										typeString: "uint256"
									}
								},
								value: null,
								visibility: "internal"
							}
						],
						src: "584:6:8"
					},
					scope: 2189,
					src: "511:80:8",
					stateMutability: "view",
					superFunction: null,
					visibility: "external"
				},
				{
					body: null,
					documentation: null,
					id: 2010,
					implemented: false,
					kind: "function",
					modifiers: [
					],
					name: "approve",
					nodeType: "FunctionDefinition",
					parameters: {
						id: 2006,
						nodeType: "ParameterList",
						parameters: [
							{
								constant: false,
								id: 2003,
								name: "spender",
								nodeType: "VariableDeclaration",
								scope: 2010,
								src: "614:15:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_address",
									typeString: "address"
								},
								typeName: {
									id: 2002,
									name: "address",
									nodeType: "ElementaryTypeName",
									src: "614:7:8",
									stateMutability: "nonpayable",
									typeDescriptions: {
										typeIdentifier: "t_address",
										typeString: "address"
									}
								},
								value: null,
								visibility: "internal"
							},
							{
								constant: false,
								id: 2005,
								name: "value",
								nodeType: "VariableDeclaration",
								scope: 2010,
								src: "631:10:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_uint256",
									typeString: "uint256"
								},
								typeName: {
									id: 2004,
									name: "uint",
									nodeType: "ElementaryTypeName",
									src: "631:4:8",
									typeDescriptions: {
										typeIdentifier: "t_uint256",
										typeString: "uint256"
									}
								},
								value: null,
								visibility: "internal"
							}
						],
						src: "613:29:8"
					},
					returnParameters: {
						id: 2009,
						nodeType: "ParameterList",
						parameters: [
							{
								constant: false,
								id: 2008,
								name: "",
								nodeType: "VariableDeclaration",
								scope: 2010,
								src: "661:4:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_bool",
									typeString: "bool"
								},
								typeName: {
									id: 2007,
									name: "bool",
									nodeType: "ElementaryTypeName",
									src: "661:4:8",
									typeDescriptions: {
										typeIdentifier: "t_bool",
										typeString: "bool"
									}
								},
								value: null,
								visibility: "internal"
							}
						],
						src: "660:6:8"
					},
					scope: 2189,
					src: "597:70:8",
					stateMutability: "nonpayable",
					superFunction: null,
					visibility: "external"
				},
				{
					body: null,
					documentation: null,
					id: 2019,
					implemented: false,
					kind: "function",
					modifiers: [
					],
					name: "transfer",
					nodeType: "FunctionDefinition",
					parameters: {
						id: 2015,
						nodeType: "ParameterList",
						parameters: [
							{
								constant: false,
								id: 2012,
								name: "to",
								nodeType: "VariableDeclaration",
								scope: 2019,
								src: "690:10:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_address",
									typeString: "address"
								},
								typeName: {
									id: 2011,
									name: "address",
									nodeType: "ElementaryTypeName",
									src: "690:7:8",
									stateMutability: "nonpayable",
									typeDescriptions: {
										typeIdentifier: "t_address",
										typeString: "address"
									}
								},
								value: null,
								visibility: "internal"
							},
							{
								constant: false,
								id: 2014,
								name: "value",
								nodeType: "VariableDeclaration",
								scope: 2019,
								src: "702:10:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_uint256",
									typeString: "uint256"
								},
								typeName: {
									id: 2013,
									name: "uint",
									nodeType: "ElementaryTypeName",
									src: "702:4:8",
									typeDescriptions: {
										typeIdentifier: "t_uint256",
										typeString: "uint256"
									}
								},
								value: null,
								visibility: "internal"
							}
						],
						src: "689:24:8"
					},
					returnParameters: {
						id: 2018,
						nodeType: "ParameterList",
						parameters: [
							{
								constant: false,
								id: 2017,
								name: "",
								nodeType: "VariableDeclaration",
								scope: 2019,
								src: "732:4:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_bool",
									typeString: "bool"
								},
								typeName: {
									id: 2016,
									name: "bool",
									nodeType: "ElementaryTypeName",
									src: "732:4:8",
									typeDescriptions: {
										typeIdentifier: "t_bool",
										typeString: "bool"
									}
								},
								value: null,
								visibility: "internal"
							}
						],
						src: "731:6:8"
					},
					scope: 2189,
					src: "672:66:8",
					stateMutability: "nonpayable",
					superFunction: null,
					visibility: "external"
				},
				{
					body: null,
					documentation: null,
					id: 2030,
					implemented: false,
					kind: "function",
					modifiers: [
					],
					name: "transferFrom",
					nodeType: "FunctionDefinition",
					parameters: {
						id: 2026,
						nodeType: "ParameterList",
						parameters: [
							{
								constant: false,
								id: 2021,
								name: "from",
								nodeType: "VariableDeclaration",
								scope: 2030,
								src: "765:12:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_address",
									typeString: "address"
								},
								typeName: {
									id: 2020,
									name: "address",
									nodeType: "ElementaryTypeName",
									src: "765:7:8",
									stateMutability: "nonpayable",
									typeDescriptions: {
										typeIdentifier: "t_address",
										typeString: "address"
									}
								},
								value: null,
								visibility: "internal"
							},
							{
								constant: false,
								id: 2023,
								name: "to",
								nodeType: "VariableDeclaration",
								scope: 2030,
								src: "779:10:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_address",
									typeString: "address"
								},
								typeName: {
									id: 2022,
									name: "address",
									nodeType: "ElementaryTypeName",
									src: "779:7:8",
									stateMutability: "nonpayable",
									typeDescriptions: {
										typeIdentifier: "t_address",
										typeString: "address"
									}
								},
								value: null,
								visibility: "internal"
							},
							{
								constant: false,
								id: 2025,
								name: "value",
								nodeType: "VariableDeclaration",
								scope: 2030,
								src: "791:10:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_uint256",
									typeString: "uint256"
								},
								typeName: {
									id: 2024,
									name: "uint",
									nodeType: "ElementaryTypeName",
									src: "791:4:8",
									typeDescriptions: {
										typeIdentifier: "t_uint256",
										typeString: "uint256"
									}
								},
								value: null,
								visibility: "internal"
							}
						],
						src: "764:38:8"
					},
					returnParameters: {
						id: 2029,
						nodeType: "ParameterList",
						parameters: [
							{
								constant: false,
								id: 2028,
								name: "",
								nodeType: "VariableDeclaration",
								scope: 2030,
								src: "821:4:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_bool",
									typeString: "bool"
								},
								typeName: {
									id: 2027,
									name: "bool",
									nodeType: "ElementaryTypeName",
									src: "821:4:8",
									typeDescriptions: {
										typeIdentifier: "t_bool",
										typeString: "bool"
									}
								},
								value: null,
								visibility: "internal"
							}
						],
						src: "820:6:8"
					},
					scope: 2189,
					src: "743:84:8",
					stateMutability: "nonpayable",
					superFunction: null,
					visibility: "external"
				},
				{
					body: null,
					documentation: null,
					id: 2035,
					implemented: false,
					kind: "function",
					modifiers: [
					],
					name: "DOMAIN_SEPARATOR",
					nodeType: "FunctionDefinition",
					parameters: {
						id: 2031,
						nodeType: "ParameterList",
						parameters: [
						],
						src: "858:2:8"
					},
					returnParameters: {
						id: 2034,
						nodeType: "ParameterList",
						parameters: [
							{
								constant: false,
								id: 2033,
								name: "",
								nodeType: "VariableDeclaration",
								scope: 2035,
								src: "884:7:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_bytes32",
									typeString: "bytes32"
								},
								typeName: {
									id: 2032,
									name: "bytes32",
									nodeType: "ElementaryTypeName",
									src: "884:7:8",
									typeDescriptions: {
										typeIdentifier: "t_bytes32",
										typeString: "bytes32"
									}
								},
								value: null,
								visibility: "internal"
							}
						],
						src: "883:9:8"
					},
					scope: 2189,
					src: "833:60:8",
					stateMutability: "view",
					superFunction: null,
					visibility: "external"
				},
				{
					body: null,
					documentation: null,
					id: 2040,
					implemented: false,
					kind: "function",
					modifiers: [
					],
					name: "PERMIT_TYPEHASH",
					nodeType: "FunctionDefinition",
					parameters: {
						id: 2036,
						nodeType: "ParameterList",
						parameters: [
						],
						src: "922:2:8"
					},
					returnParameters: {
						id: 2039,
						nodeType: "ParameterList",
						parameters: [
							{
								constant: false,
								id: 2038,
								name: "",
								nodeType: "VariableDeclaration",
								scope: 2040,
								src: "948:7:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_bytes32",
									typeString: "bytes32"
								},
								typeName: {
									id: 2037,
									name: "bytes32",
									nodeType: "ElementaryTypeName",
									src: "948:7:8",
									typeDescriptions: {
										typeIdentifier: "t_bytes32",
										typeString: "bytes32"
									}
								},
								value: null,
								visibility: "internal"
							}
						],
						src: "947:9:8"
					},
					scope: 2189,
					src: "898:59:8",
					stateMutability: "pure",
					superFunction: null,
					visibility: "external"
				},
				{
					body: null,
					documentation: null,
					id: 2047,
					implemented: false,
					kind: "function",
					modifiers: [
					],
					name: "nonces",
					nodeType: "FunctionDefinition",
					parameters: {
						id: 2043,
						nodeType: "ParameterList",
						parameters: [
							{
								constant: false,
								id: 2042,
								name: "owner",
								nodeType: "VariableDeclaration",
								scope: 2047,
								src: "978:13:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_address",
									typeString: "address"
								},
								typeName: {
									id: 2041,
									name: "address",
									nodeType: "ElementaryTypeName",
									src: "978:7:8",
									stateMutability: "nonpayable",
									typeDescriptions: {
										typeIdentifier: "t_address",
										typeString: "address"
									}
								},
								value: null,
								visibility: "internal"
							}
						],
						src: "977:15:8"
					},
					returnParameters: {
						id: 2046,
						nodeType: "ParameterList",
						parameters: [
							{
								constant: false,
								id: 2045,
								name: "",
								nodeType: "VariableDeclaration",
								scope: 2047,
								src: "1016:4:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_uint256",
									typeString: "uint256"
								},
								typeName: {
									id: 2044,
									name: "uint",
									nodeType: "ElementaryTypeName",
									src: "1016:4:8",
									typeDescriptions: {
										typeIdentifier: "t_uint256",
										typeString: "uint256"
									}
								},
								value: null,
								visibility: "internal"
							}
						],
						src: "1015:6:8"
					},
					scope: 2189,
					src: "962:60:8",
					stateMutability: "view",
					superFunction: null,
					visibility: "external"
				},
				{
					body: null,
					documentation: null,
					id: 2064,
					implemented: false,
					kind: "function",
					modifiers: [
					],
					name: "permit",
					nodeType: "FunctionDefinition",
					parameters: {
						id: 2062,
						nodeType: "ParameterList",
						parameters: [
							{
								constant: false,
								id: 2049,
								name: "owner",
								nodeType: "VariableDeclaration",
								scope: 2064,
								src: "1044:13:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_address",
									typeString: "address"
								},
								typeName: {
									id: 2048,
									name: "address",
									nodeType: "ElementaryTypeName",
									src: "1044:7:8",
									stateMutability: "nonpayable",
									typeDescriptions: {
										typeIdentifier: "t_address",
										typeString: "address"
									}
								},
								value: null,
								visibility: "internal"
							},
							{
								constant: false,
								id: 2051,
								name: "spender",
								nodeType: "VariableDeclaration",
								scope: 2064,
								src: "1059:15:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_address",
									typeString: "address"
								},
								typeName: {
									id: 2050,
									name: "address",
									nodeType: "ElementaryTypeName",
									src: "1059:7:8",
									stateMutability: "nonpayable",
									typeDescriptions: {
										typeIdentifier: "t_address",
										typeString: "address"
									}
								},
								value: null,
								visibility: "internal"
							},
							{
								constant: false,
								id: 2053,
								name: "value",
								nodeType: "VariableDeclaration",
								scope: 2064,
								src: "1076:10:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_uint256",
									typeString: "uint256"
								},
								typeName: {
									id: 2052,
									name: "uint",
									nodeType: "ElementaryTypeName",
									src: "1076:4:8",
									typeDescriptions: {
										typeIdentifier: "t_uint256",
										typeString: "uint256"
									}
								},
								value: null,
								visibility: "internal"
							},
							{
								constant: false,
								id: 2055,
								name: "deadline",
								nodeType: "VariableDeclaration",
								scope: 2064,
								src: "1088:13:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_uint256",
									typeString: "uint256"
								},
								typeName: {
									id: 2054,
									name: "uint",
									nodeType: "ElementaryTypeName",
									src: "1088:4:8",
									typeDescriptions: {
										typeIdentifier: "t_uint256",
										typeString: "uint256"
									}
								},
								value: null,
								visibility: "internal"
							},
							{
								constant: false,
								id: 2057,
								name: "v",
								nodeType: "VariableDeclaration",
								scope: 2064,
								src: "1103:7:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_uint8",
									typeString: "uint8"
								},
								typeName: {
									id: 2056,
									name: "uint8",
									nodeType: "ElementaryTypeName",
									src: "1103:5:8",
									typeDescriptions: {
										typeIdentifier: "t_uint8",
										typeString: "uint8"
									}
								},
								value: null,
								visibility: "internal"
							},
							{
								constant: false,
								id: 2059,
								name: "r",
								nodeType: "VariableDeclaration",
								scope: 2064,
								src: "1112:9:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_bytes32",
									typeString: "bytes32"
								},
								typeName: {
									id: 2058,
									name: "bytes32",
									nodeType: "ElementaryTypeName",
									src: "1112:7:8",
									typeDescriptions: {
										typeIdentifier: "t_bytes32",
										typeString: "bytes32"
									}
								},
								value: null,
								visibility: "internal"
							},
							{
								constant: false,
								id: 2061,
								name: "s",
								nodeType: "VariableDeclaration",
								scope: 2064,
								src: "1123:9:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_bytes32",
									typeString: "bytes32"
								},
								typeName: {
									id: 2060,
									name: "bytes32",
									nodeType: "ElementaryTypeName",
									src: "1123:7:8",
									typeDescriptions: {
										typeIdentifier: "t_bytes32",
										typeString: "bytes32"
									}
								},
								value: null,
								visibility: "internal"
							}
						],
						src: "1043:90:8"
					},
					returnParameters: {
						id: 2063,
						nodeType: "ParameterList",
						parameters: [
						],
						src: "1142:0:8"
					},
					scope: 2189,
					src: "1028:115:8",
					stateMutability: "nonpayable",
					superFunction: null,
					visibility: "external"
				},
				{
					anonymous: false,
					documentation: null,
					id: 2072,
					name: "Mint",
					nodeType: "EventDefinition",
					parameters: {
						id: 2071,
						nodeType: "ParameterList",
						parameters: [
							{
								constant: false,
								id: 2066,
								indexed: true,
								name: "sender",
								nodeType: "VariableDeclaration",
								scope: 2072,
								src: "1160:22:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_address",
									typeString: "address"
								},
								typeName: {
									id: 2065,
									name: "address",
									nodeType: "ElementaryTypeName",
									src: "1160:7:8",
									stateMutability: "nonpayable",
									typeDescriptions: {
										typeIdentifier: "t_address",
										typeString: "address"
									}
								},
								value: null,
								visibility: "internal"
							},
							{
								constant: false,
								id: 2068,
								indexed: false,
								name: "amount0",
								nodeType: "VariableDeclaration",
								scope: 2072,
								src: "1184:12:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_uint256",
									typeString: "uint256"
								},
								typeName: {
									id: 2067,
									name: "uint",
									nodeType: "ElementaryTypeName",
									src: "1184:4:8",
									typeDescriptions: {
										typeIdentifier: "t_uint256",
										typeString: "uint256"
									}
								},
								value: null,
								visibility: "internal"
							},
							{
								constant: false,
								id: 2070,
								indexed: false,
								name: "amount1",
								nodeType: "VariableDeclaration",
								scope: 2072,
								src: "1198:12:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_uint256",
									typeString: "uint256"
								},
								typeName: {
									id: 2069,
									name: "uint",
									nodeType: "ElementaryTypeName",
									src: "1198:4:8",
									typeDescriptions: {
										typeIdentifier: "t_uint256",
										typeString: "uint256"
									}
								},
								value: null,
								visibility: "internal"
							}
						],
						src: "1159:52:8"
					},
					src: "1149:63:8"
				},
				{
					anonymous: false,
					documentation: null,
					id: 2082,
					name: "Burn",
					nodeType: "EventDefinition",
					parameters: {
						id: 2081,
						nodeType: "ParameterList",
						parameters: [
							{
								constant: false,
								id: 2074,
								indexed: true,
								name: "sender",
								nodeType: "VariableDeclaration",
								scope: 2082,
								src: "1228:22:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_address",
									typeString: "address"
								},
								typeName: {
									id: 2073,
									name: "address",
									nodeType: "ElementaryTypeName",
									src: "1228:7:8",
									stateMutability: "nonpayable",
									typeDescriptions: {
										typeIdentifier: "t_address",
										typeString: "address"
									}
								},
								value: null,
								visibility: "internal"
							},
							{
								constant: false,
								id: 2076,
								indexed: false,
								name: "amount0",
								nodeType: "VariableDeclaration",
								scope: 2082,
								src: "1252:12:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_uint256",
									typeString: "uint256"
								},
								typeName: {
									id: 2075,
									name: "uint",
									nodeType: "ElementaryTypeName",
									src: "1252:4:8",
									typeDescriptions: {
										typeIdentifier: "t_uint256",
										typeString: "uint256"
									}
								},
								value: null,
								visibility: "internal"
							},
							{
								constant: false,
								id: 2078,
								indexed: false,
								name: "amount1",
								nodeType: "VariableDeclaration",
								scope: 2082,
								src: "1266:12:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_uint256",
									typeString: "uint256"
								},
								typeName: {
									id: 2077,
									name: "uint",
									nodeType: "ElementaryTypeName",
									src: "1266:4:8",
									typeDescriptions: {
										typeIdentifier: "t_uint256",
										typeString: "uint256"
									}
								},
								value: null,
								visibility: "internal"
							},
							{
								constant: false,
								id: 2080,
								indexed: true,
								name: "to",
								nodeType: "VariableDeclaration",
								scope: 2082,
								src: "1280:18:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_address",
									typeString: "address"
								},
								typeName: {
									id: 2079,
									name: "address",
									nodeType: "ElementaryTypeName",
									src: "1280:7:8",
									stateMutability: "nonpayable",
									typeDescriptions: {
										typeIdentifier: "t_address",
										typeString: "address"
									}
								},
								value: null,
								visibility: "internal"
							}
						],
						src: "1227:72:8"
					},
					src: "1217:83:8"
				},
				{
					anonymous: false,
					documentation: null,
					id: 2096,
					name: "Swap",
					nodeType: "EventDefinition",
					parameters: {
						id: 2095,
						nodeType: "ParameterList",
						parameters: [
							{
								constant: false,
								id: 2084,
								indexed: true,
								name: "sender",
								nodeType: "VariableDeclaration",
								scope: 2096,
								src: "1325:22:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_address",
									typeString: "address"
								},
								typeName: {
									id: 2083,
									name: "address",
									nodeType: "ElementaryTypeName",
									src: "1325:7:8",
									stateMutability: "nonpayable",
									typeDescriptions: {
										typeIdentifier: "t_address",
										typeString: "address"
									}
								},
								value: null,
								visibility: "internal"
							},
							{
								constant: false,
								id: 2086,
								indexed: false,
								name: "amount0In",
								nodeType: "VariableDeclaration",
								scope: 2096,
								src: "1357:14:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_uint256",
									typeString: "uint256"
								},
								typeName: {
									id: 2085,
									name: "uint",
									nodeType: "ElementaryTypeName",
									src: "1357:4:8",
									typeDescriptions: {
										typeIdentifier: "t_uint256",
										typeString: "uint256"
									}
								},
								value: null,
								visibility: "internal"
							},
							{
								constant: false,
								id: 2088,
								indexed: false,
								name: "amount1In",
								nodeType: "VariableDeclaration",
								scope: 2096,
								src: "1381:14:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_uint256",
									typeString: "uint256"
								},
								typeName: {
									id: 2087,
									name: "uint",
									nodeType: "ElementaryTypeName",
									src: "1381:4:8",
									typeDescriptions: {
										typeIdentifier: "t_uint256",
										typeString: "uint256"
									}
								},
								value: null,
								visibility: "internal"
							},
							{
								constant: false,
								id: 2090,
								indexed: false,
								name: "amount0Out",
								nodeType: "VariableDeclaration",
								scope: 2096,
								src: "1405:15:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_uint256",
									typeString: "uint256"
								},
								typeName: {
									id: 2089,
									name: "uint",
									nodeType: "ElementaryTypeName",
									src: "1405:4:8",
									typeDescriptions: {
										typeIdentifier: "t_uint256",
										typeString: "uint256"
									}
								},
								value: null,
								visibility: "internal"
							},
							{
								constant: false,
								id: 2092,
								indexed: false,
								name: "amount1Out",
								nodeType: "VariableDeclaration",
								scope: 2096,
								src: "1430:15:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_uint256",
									typeString: "uint256"
								},
								typeName: {
									id: 2091,
									name: "uint",
									nodeType: "ElementaryTypeName",
									src: "1430:4:8",
									typeDescriptions: {
										typeIdentifier: "t_uint256",
										typeString: "uint256"
									}
								},
								value: null,
								visibility: "internal"
							},
							{
								constant: false,
								id: 2094,
								indexed: true,
								name: "to",
								nodeType: "VariableDeclaration",
								scope: 2096,
								src: "1455:18:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_address",
									typeString: "address"
								},
								typeName: {
									id: 2093,
									name: "address",
									nodeType: "ElementaryTypeName",
									src: "1455:7:8",
									stateMutability: "nonpayable",
									typeDescriptions: {
										typeIdentifier: "t_address",
										typeString: "address"
									}
								},
								value: null,
								visibility: "internal"
							}
						],
						src: "1315:164:8"
					},
					src: "1305:175:8"
				},
				{
					anonymous: false,
					documentation: null,
					id: 2102,
					name: "Sync",
					nodeType: "EventDefinition",
					parameters: {
						id: 2101,
						nodeType: "ParameterList",
						parameters: [
							{
								constant: false,
								id: 2098,
								indexed: false,
								name: "reserve0",
								nodeType: "VariableDeclaration",
								scope: 2102,
								src: "1496:16:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_uint112",
									typeString: "uint112"
								},
								typeName: {
									id: 2097,
									name: "uint112",
									nodeType: "ElementaryTypeName",
									src: "1496:7:8",
									typeDescriptions: {
										typeIdentifier: "t_uint112",
										typeString: "uint112"
									}
								},
								value: null,
								visibility: "internal"
							},
							{
								constant: false,
								id: 2100,
								indexed: false,
								name: "reserve1",
								nodeType: "VariableDeclaration",
								scope: 2102,
								src: "1514:16:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_uint112",
									typeString: "uint112"
								},
								typeName: {
									id: 2099,
									name: "uint112",
									nodeType: "ElementaryTypeName",
									src: "1514:7:8",
									typeDescriptions: {
										typeIdentifier: "t_uint112",
										typeString: "uint112"
									}
								},
								value: null,
								visibility: "internal"
							}
						],
						src: "1495:36:8"
					},
					src: "1485:47:8"
				},
				{
					body: null,
					documentation: null,
					id: 2107,
					implemented: false,
					kind: "function",
					modifiers: [
					],
					name: "MINIMUM_LIQUIDITY",
					nodeType: "FunctionDefinition",
					parameters: {
						id: 2103,
						nodeType: "ParameterList",
						parameters: [
						],
						src: "1564:2:8"
					},
					returnParameters: {
						id: 2106,
						nodeType: "ParameterList",
						parameters: [
							{
								constant: false,
								id: 2105,
								name: "",
								nodeType: "VariableDeclaration",
								scope: 2107,
								src: "1590:4:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_uint256",
									typeString: "uint256"
								},
								typeName: {
									id: 2104,
									name: "uint",
									nodeType: "ElementaryTypeName",
									src: "1590:4:8",
									typeDescriptions: {
										typeIdentifier: "t_uint256",
										typeString: "uint256"
									}
								},
								value: null,
								visibility: "internal"
							}
						],
						src: "1589:6:8"
					},
					scope: 2189,
					src: "1538:58:8",
					stateMutability: "pure",
					superFunction: null,
					visibility: "external"
				},
				{
					body: null,
					documentation: null,
					id: 2112,
					implemented: false,
					kind: "function",
					modifiers: [
					],
					name: "factory",
					nodeType: "FunctionDefinition",
					parameters: {
						id: 2108,
						nodeType: "ParameterList",
						parameters: [
						],
						src: "1617:2:8"
					},
					returnParameters: {
						id: 2111,
						nodeType: "ParameterList",
						parameters: [
							{
								constant: false,
								id: 2110,
								name: "",
								nodeType: "VariableDeclaration",
								scope: 2112,
								src: "1643:7:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_address",
									typeString: "address"
								},
								typeName: {
									id: 2109,
									name: "address",
									nodeType: "ElementaryTypeName",
									src: "1643:7:8",
									stateMutability: "nonpayable",
									typeDescriptions: {
										typeIdentifier: "t_address",
										typeString: "address"
									}
								},
								value: null,
								visibility: "internal"
							}
						],
						src: "1642:9:8"
					},
					scope: 2189,
					src: "1601:51:8",
					stateMutability: "view",
					superFunction: null,
					visibility: "external"
				},
				{
					body: null,
					documentation: null,
					id: 2117,
					implemented: false,
					kind: "function",
					modifiers: [
					],
					name: "token0",
					nodeType: "FunctionDefinition",
					parameters: {
						id: 2113,
						nodeType: "ParameterList",
						parameters: [
						],
						src: "1672:2:8"
					},
					returnParameters: {
						id: 2116,
						nodeType: "ParameterList",
						parameters: [
							{
								constant: false,
								id: 2115,
								name: "",
								nodeType: "VariableDeclaration",
								scope: 2117,
								src: "1698:7:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_address",
									typeString: "address"
								},
								typeName: {
									id: 2114,
									name: "address",
									nodeType: "ElementaryTypeName",
									src: "1698:7:8",
									stateMutability: "nonpayable",
									typeDescriptions: {
										typeIdentifier: "t_address",
										typeString: "address"
									}
								},
								value: null,
								visibility: "internal"
							}
						],
						src: "1697:9:8"
					},
					scope: 2189,
					src: "1657:50:8",
					stateMutability: "view",
					superFunction: null,
					visibility: "external"
				},
				{
					body: null,
					documentation: null,
					id: 2122,
					implemented: false,
					kind: "function",
					modifiers: [
					],
					name: "token1",
					nodeType: "FunctionDefinition",
					parameters: {
						id: 2118,
						nodeType: "ParameterList",
						parameters: [
						],
						src: "1727:2:8"
					},
					returnParameters: {
						id: 2121,
						nodeType: "ParameterList",
						parameters: [
							{
								constant: false,
								id: 2120,
								name: "",
								nodeType: "VariableDeclaration",
								scope: 2122,
								src: "1753:7:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_address",
									typeString: "address"
								},
								typeName: {
									id: 2119,
									name: "address",
									nodeType: "ElementaryTypeName",
									src: "1753:7:8",
									stateMutability: "nonpayable",
									typeDescriptions: {
										typeIdentifier: "t_address",
										typeString: "address"
									}
								},
								value: null,
								visibility: "internal"
							}
						],
						src: "1752:9:8"
					},
					scope: 2189,
					src: "1712:50:8",
					stateMutability: "view",
					superFunction: null,
					visibility: "external"
				},
				{
					body: null,
					documentation: null,
					id: 2131,
					implemented: false,
					kind: "function",
					modifiers: [
					],
					name: "getReserves",
					nodeType: "FunctionDefinition",
					parameters: {
						id: 2123,
						nodeType: "ParameterList",
						parameters: [
						],
						src: "1787:2:8"
					},
					returnParameters: {
						id: 2130,
						nodeType: "ParameterList",
						parameters: [
							{
								constant: false,
								id: 2125,
								name: "reserve0",
								nodeType: "VariableDeclaration",
								scope: 2131,
								src: "1813:16:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_uint112",
									typeString: "uint112"
								},
								typeName: {
									id: 2124,
									name: "uint112",
									nodeType: "ElementaryTypeName",
									src: "1813:7:8",
									typeDescriptions: {
										typeIdentifier: "t_uint112",
										typeString: "uint112"
									}
								},
								value: null,
								visibility: "internal"
							},
							{
								constant: false,
								id: 2127,
								name: "reserve1",
								nodeType: "VariableDeclaration",
								scope: 2131,
								src: "1831:16:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_uint112",
									typeString: "uint112"
								},
								typeName: {
									id: 2126,
									name: "uint112",
									nodeType: "ElementaryTypeName",
									src: "1831:7:8",
									typeDescriptions: {
										typeIdentifier: "t_uint112",
										typeString: "uint112"
									}
								},
								value: null,
								visibility: "internal"
							},
							{
								constant: false,
								id: 2129,
								name: "blockTimestampLast",
								nodeType: "VariableDeclaration",
								scope: 2131,
								src: "1849:25:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_uint32",
									typeString: "uint32"
								},
								typeName: {
									id: 2128,
									name: "uint32",
									nodeType: "ElementaryTypeName",
									src: "1849:6:8",
									typeDescriptions: {
										typeIdentifier: "t_uint32",
										typeString: "uint32"
									}
								},
								value: null,
								visibility: "internal"
							}
						],
						src: "1812:63:8"
					},
					scope: 2189,
					src: "1767:109:8",
					stateMutability: "view",
					superFunction: null,
					visibility: "external"
				},
				{
					body: null,
					documentation: null,
					id: 2136,
					implemented: false,
					kind: "function",
					modifiers: [
					],
					name: "price0CumulativeLast",
					nodeType: "FunctionDefinition",
					parameters: {
						id: 2132,
						nodeType: "ParameterList",
						parameters: [
						],
						src: "1910:2:8"
					},
					returnParameters: {
						id: 2135,
						nodeType: "ParameterList",
						parameters: [
							{
								constant: false,
								id: 2134,
								name: "",
								nodeType: "VariableDeclaration",
								scope: 2136,
								src: "1936:4:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_uint256",
									typeString: "uint256"
								},
								typeName: {
									id: 2133,
									name: "uint",
									nodeType: "ElementaryTypeName",
									src: "1936:4:8",
									typeDescriptions: {
										typeIdentifier: "t_uint256",
										typeString: "uint256"
									}
								},
								value: null,
								visibility: "internal"
							}
						],
						src: "1935:6:8"
					},
					scope: 2189,
					src: "1881:61:8",
					stateMutability: "view",
					superFunction: null,
					visibility: "external"
				},
				{
					body: null,
					documentation: null,
					id: 2141,
					implemented: false,
					kind: "function",
					modifiers: [
					],
					name: "price1CumulativeLast",
					nodeType: "FunctionDefinition",
					parameters: {
						id: 2137,
						nodeType: "ParameterList",
						parameters: [
						],
						src: "1976:2:8"
					},
					returnParameters: {
						id: 2140,
						nodeType: "ParameterList",
						parameters: [
							{
								constant: false,
								id: 2139,
								name: "",
								nodeType: "VariableDeclaration",
								scope: 2141,
								src: "2002:4:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_uint256",
									typeString: "uint256"
								},
								typeName: {
									id: 2138,
									name: "uint",
									nodeType: "ElementaryTypeName",
									src: "2002:4:8",
									typeDescriptions: {
										typeIdentifier: "t_uint256",
										typeString: "uint256"
									}
								},
								value: null,
								visibility: "internal"
							}
						],
						src: "2001:6:8"
					},
					scope: 2189,
					src: "1947:61:8",
					stateMutability: "view",
					superFunction: null,
					visibility: "external"
				},
				{
					body: null,
					documentation: null,
					id: 2146,
					implemented: false,
					kind: "function",
					modifiers: [
					],
					name: "kLast",
					nodeType: "FunctionDefinition",
					parameters: {
						id: 2142,
						nodeType: "ParameterList",
						parameters: [
						],
						src: "2027:2:8"
					},
					returnParameters: {
						id: 2145,
						nodeType: "ParameterList",
						parameters: [
							{
								constant: false,
								id: 2144,
								name: "",
								nodeType: "VariableDeclaration",
								scope: 2146,
								src: "2053:4:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_uint256",
									typeString: "uint256"
								},
								typeName: {
									id: 2143,
									name: "uint",
									nodeType: "ElementaryTypeName",
									src: "2053:4:8",
									typeDescriptions: {
										typeIdentifier: "t_uint256",
										typeString: "uint256"
									}
								},
								value: null,
								visibility: "internal"
							}
						],
						src: "2052:6:8"
					},
					scope: 2189,
					src: "2013:46:8",
					stateMutability: "view",
					superFunction: null,
					visibility: "external"
				},
				{
					body: null,
					documentation: null,
					id: 2153,
					implemented: false,
					kind: "function",
					modifiers: [
					],
					name: "mint",
					nodeType: "FunctionDefinition",
					parameters: {
						id: 2149,
						nodeType: "ParameterList",
						parameters: [
							{
								constant: false,
								id: 2148,
								name: "to",
								nodeType: "VariableDeclaration",
								scope: 2153,
								src: "2079:10:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_address",
									typeString: "address"
								},
								typeName: {
									id: 2147,
									name: "address",
									nodeType: "ElementaryTypeName",
									src: "2079:7:8",
									stateMutability: "nonpayable",
									typeDescriptions: {
										typeIdentifier: "t_address",
										typeString: "address"
									}
								},
								value: null,
								visibility: "internal"
							}
						],
						src: "2078:12:8"
					},
					returnParameters: {
						id: 2152,
						nodeType: "ParameterList",
						parameters: [
							{
								constant: false,
								id: 2151,
								name: "liquidity",
								nodeType: "VariableDeclaration",
								scope: 2153,
								src: "2109:14:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_uint256",
									typeString: "uint256"
								},
								typeName: {
									id: 2150,
									name: "uint",
									nodeType: "ElementaryTypeName",
									src: "2109:4:8",
									typeDescriptions: {
										typeIdentifier: "t_uint256",
										typeString: "uint256"
									}
								},
								value: null,
								visibility: "internal"
							}
						],
						src: "2108:16:8"
					},
					scope: 2189,
					src: "2065:60:8",
					stateMutability: "nonpayable",
					superFunction: null,
					visibility: "external"
				},
				{
					body: null,
					documentation: null,
					id: 2162,
					implemented: false,
					kind: "function",
					modifiers: [
					],
					name: "burn",
					nodeType: "FunctionDefinition",
					parameters: {
						id: 2156,
						nodeType: "ParameterList",
						parameters: [
							{
								constant: false,
								id: 2155,
								name: "to",
								nodeType: "VariableDeclaration",
								scope: 2162,
								src: "2144:10:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_address",
									typeString: "address"
								},
								typeName: {
									id: 2154,
									name: "address",
									nodeType: "ElementaryTypeName",
									src: "2144:7:8",
									stateMutability: "nonpayable",
									typeDescriptions: {
										typeIdentifier: "t_address",
										typeString: "address"
									}
								},
								value: null,
								visibility: "internal"
							}
						],
						src: "2143:12:8"
					},
					returnParameters: {
						id: 2161,
						nodeType: "ParameterList",
						parameters: [
							{
								constant: false,
								id: 2158,
								name: "amount0",
								nodeType: "VariableDeclaration",
								scope: 2162,
								src: "2174:12:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_uint256",
									typeString: "uint256"
								},
								typeName: {
									id: 2157,
									name: "uint",
									nodeType: "ElementaryTypeName",
									src: "2174:4:8",
									typeDescriptions: {
										typeIdentifier: "t_uint256",
										typeString: "uint256"
									}
								},
								value: null,
								visibility: "internal"
							},
							{
								constant: false,
								id: 2160,
								name: "amount1",
								nodeType: "VariableDeclaration",
								scope: 2162,
								src: "2188:12:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_uint256",
									typeString: "uint256"
								},
								typeName: {
									id: 2159,
									name: "uint",
									nodeType: "ElementaryTypeName",
									src: "2188:4:8",
									typeDescriptions: {
										typeIdentifier: "t_uint256",
										typeString: "uint256"
									}
								},
								value: null,
								visibility: "internal"
							}
						],
						src: "2173:28:8"
					},
					scope: 2189,
					src: "2130:72:8",
					stateMutability: "nonpayable",
					superFunction: null,
					visibility: "external"
				},
				{
					body: null,
					documentation: null,
					id: 2173,
					implemented: false,
					kind: "function",
					modifiers: [
					],
					name: "swap",
					nodeType: "FunctionDefinition",
					parameters: {
						id: 2171,
						nodeType: "ParameterList",
						parameters: [
							{
								constant: false,
								id: 2164,
								name: "amount0Out",
								nodeType: "VariableDeclaration",
								scope: 2173,
								src: "2221:15:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_uint256",
									typeString: "uint256"
								},
								typeName: {
									id: 2163,
									name: "uint",
									nodeType: "ElementaryTypeName",
									src: "2221:4:8",
									typeDescriptions: {
										typeIdentifier: "t_uint256",
										typeString: "uint256"
									}
								},
								value: null,
								visibility: "internal"
							},
							{
								constant: false,
								id: 2166,
								name: "amount1Out",
								nodeType: "VariableDeclaration",
								scope: 2173,
								src: "2238:15:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_uint256",
									typeString: "uint256"
								},
								typeName: {
									id: 2165,
									name: "uint",
									nodeType: "ElementaryTypeName",
									src: "2238:4:8",
									typeDescriptions: {
										typeIdentifier: "t_uint256",
										typeString: "uint256"
									}
								},
								value: null,
								visibility: "internal"
							},
							{
								constant: false,
								id: 2168,
								name: "to",
								nodeType: "VariableDeclaration",
								scope: 2173,
								src: "2255:10:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_address",
									typeString: "address"
								},
								typeName: {
									id: 2167,
									name: "address",
									nodeType: "ElementaryTypeName",
									src: "2255:7:8",
									stateMutability: "nonpayable",
									typeDescriptions: {
										typeIdentifier: "t_address",
										typeString: "address"
									}
								},
								value: null,
								visibility: "internal"
							},
							{
								constant: false,
								id: 2170,
								name: "data",
								nodeType: "VariableDeclaration",
								scope: 2173,
								src: "2267:19:8",
								stateVariable: false,
								storageLocation: "calldata",
								typeDescriptions: {
									typeIdentifier: "t_bytes_calldata_ptr",
									typeString: "bytes"
								},
								typeName: {
									id: 2169,
									name: "bytes",
									nodeType: "ElementaryTypeName",
									src: "2267:5:8",
									typeDescriptions: {
										typeIdentifier: "t_bytes_storage_ptr",
										typeString: "bytes"
									}
								},
								value: null,
								visibility: "internal"
							}
						],
						src: "2220:67:8"
					},
					returnParameters: {
						id: 2172,
						nodeType: "ParameterList",
						parameters: [
						],
						src: "2296:0:8"
					},
					scope: 2189,
					src: "2207:90:8",
					stateMutability: "nonpayable",
					superFunction: null,
					visibility: "external"
				},
				{
					body: null,
					documentation: null,
					id: 2178,
					implemented: false,
					kind: "function",
					modifiers: [
					],
					name: "skim",
					nodeType: "FunctionDefinition",
					parameters: {
						id: 2176,
						nodeType: "ParameterList",
						parameters: [
							{
								constant: false,
								id: 2175,
								name: "to",
								nodeType: "VariableDeclaration",
								scope: 2178,
								src: "2316:10:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_address",
									typeString: "address"
								},
								typeName: {
									id: 2174,
									name: "address",
									nodeType: "ElementaryTypeName",
									src: "2316:7:8",
									stateMutability: "nonpayable",
									typeDescriptions: {
										typeIdentifier: "t_address",
										typeString: "address"
									}
								},
								value: null,
								visibility: "internal"
							}
						],
						src: "2315:12:8"
					},
					returnParameters: {
						id: 2177,
						nodeType: "ParameterList",
						parameters: [
						],
						src: "2336:0:8"
					},
					scope: 2189,
					src: "2302:35:8",
					stateMutability: "nonpayable",
					superFunction: null,
					visibility: "external"
				},
				{
					body: null,
					documentation: null,
					id: 2181,
					implemented: false,
					kind: "function",
					modifiers: [
					],
					name: "sync",
					nodeType: "FunctionDefinition",
					parameters: {
						id: 2179,
						nodeType: "ParameterList",
						parameters: [
						],
						src: "2355:2:8"
					},
					returnParameters: {
						id: 2180,
						nodeType: "ParameterList",
						parameters: [
						],
						src: "2366:0:8"
					},
					scope: 2189,
					src: "2342:25:8",
					stateMutability: "nonpayable",
					superFunction: null,
					visibility: "external"
				},
				{
					body: null,
					documentation: null,
					id: 2188,
					implemented: false,
					kind: "function",
					modifiers: [
					],
					name: "initialize",
					nodeType: "FunctionDefinition",
					parameters: {
						id: 2186,
						nodeType: "ParameterList",
						parameters: [
							{
								constant: false,
								id: 2183,
								name: "",
								nodeType: "VariableDeclaration",
								scope: 2188,
								src: "2393:7:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_address",
									typeString: "address"
								},
								typeName: {
									id: 2182,
									name: "address",
									nodeType: "ElementaryTypeName",
									src: "2393:7:8",
									stateMutability: "nonpayable",
									typeDescriptions: {
										typeIdentifier: "t_address",
										typeString: "address"
									}
								},
								value: null,
								visibility: "internal"
							},
							{
								constant: false,
								id: 2185,
								name: "",
								nodeType: "VariableDeclaration",
								scope: 2188,
								src: "2402:7:8",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_address",
									typeString: "address"
								},
								typeName: {
									id: 2184,
									name: "address",
									nodeType: "ElementaryTypeName",
									src: "2402:7:8",
									stateMutability: "nonpayable",
									typeDescriptions: {
										typeIdentifier: "t_address",
										typeString: "address"
									}
								},
								value: null,
								visibility: "internal"
							}
						],
						src: "2392:18:8"
					},
					returnParameters: {
						id: 2187,
						nodeType: "ParameterList",
						parameters: [
						],
						src: "2419:0:8"
					},
					scope: 2189,
					src: "2373:47:8",
					stateMutability: "nonpayable",
					superFunction: null,
					visibility: "external"
				}
			],
			scope: 2190,
			src: "26:2396:8"
		}
	],
	src: "0:2423:8"
};
var legacyAST = {
	attributes: {
		absolutePath: "project:/contracts/interfaces/ISafeswapPair.sol",
		exportedSymbols: {
			ISafeswapPair: [
				2189
			]
		}
	},
	children: [
		{
			attributes: {
				literals: [
					"solidity",
					">=",
					"0.5",
					".0"
				]
			},
			id: 1949,
			name: "PragmaDirective",
			src: "0:24:8"
		},
		{
			attributes: {
				baseContracts: [
					null
				],
				contractDependencies: [
					null
				],
				contractKind: "interface",
				documentation: null,
				fullyImplemented: false,
				linearizedBaseContracts: [
					2189
				],
				name: "ISafeswapPair",
				scope: 2190
			},
			children: [
				{
					attributes: {
						anonymous: false,
						documentation: null,
						name: "Approval"
					},
					children: [
						{
							children: [
								{
									attributes: {
										constant: false,
										indexed: true,
										name: "owner",
										scope: 1957,
										stateVariable: false,
										storageLocation: "default",
										type: "address",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "address",
												stateMutability: "nonpayable",
												type: "address"
											},
											id: 1950,
											name: "ElementaryTypeName",
											src: "71:7:8"
										}
									],
									id: 1951,
									name: "VariableDeclaration",
									src: "71:21:8"
								},
								{
									attributes: {
										constant: false,
										indexed: true,
										name: "spender",
										scope: 1957,
										stateVariable: false,
										storageLocation: "default",
										type: "address",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "address",
												stateMutability: "nonpayable",
												type: "address"
											},
											id: 1952,
											name: "ElementaryTypeName",
											src: "94:7:8"
										}
									],
									id: 1953,
									name: "VariableDeclaration",
									src: "94:23:8"
								},
								{
									attributes: {
										constant: false,
										indexed: false,
										name: "value",
										scope: 1957,
										stateVariable: false,
										storageLocation: "default",
										type: "uint256",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "uint",
												type: "uint256"
											},
											id: 1954,
											name: "ElementaryTypeName",
											src: "119:4:8"
										}
									],
									id: 1955,
									name: "VariableDeclaration",
									src: "119:10:8"
								}
							],
							id: 1956,
							name: "ParameterList",
							src: "70:60:8"
						}
					],
					id: 1957,
					name: "EventDefinition",
					src: "56:75:8"
				},
				{
					attributes: {
						anonymous: false,
						documentation: null,
						name: "Transfer"
					},
					children: [
						{
							children: [
								{
									attributes: {
										constant: false,
										indexed: true,
										name: "from",
										scope: 1965,
										stateVariable: false,
										storageLocation: "default",
										type: "address",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "address",
												stateMutability: "nonpayable",
												type: "address"
											},
											id: 1958,
											name: "ElementaryTypeName",
											src: "151:7:8"
										}
									],
									id: 1959,
									name: "VariableDeclaration",
									src: "151:20:8"
								},
								{
									attributes: {
										constant: false,
										indexed: true,
										name: "to",
										scope: 1965,
										stateVariable: false,
										storageLocation: "default",
										type: "address",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "address",
												stateMutability: "nonpayable",
												type: "address"
											},
											id: 1960,
											name: "ElementaryTypeName",
											src: "173:7:8"
										}
									],
									id: 1961,
									name: "VariableDeclaration",
									src: "173:18:8"
								},
								{
									attributes: {
										constant: false,
										indexed: false,
										name: "value",
										scope: 1965,
										stateVariable: false,
										storageLocation: "default",
										type: "uint256",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "uint",
												type: "uint256"
											},
											id: 1962,
											name: "ElementaryTypeName",
											src: "193:4:8"
										}
									],
									id: 1963,
									name: "VariableDeclaration",
									src: "193:10:8"
								}
							],
							id: 1964,
							name: "ParameterList",
							src: "150:54:8"
						}
					],
					id: 1965,
					name: "EventDefinition",
					src: "136:69:8"
				},
				{
					attributes: {
						body: null,
						documentation: null,
						implemented: false,
						isConstructor: false,
						kind: "function",
						modifiers: [
							null
						],
						name: "name",
						scope: 2189,
						stateMutability: "pure",
						superFunction: null,
						visibility: "external"
					},
					children: [
						{
							attributes: {
								parameters: [
									null
								]
							},
							children: [
							],
							id: 1966,
							name: "ParameterList",
							src: "224:2:8"
						},
						{
							children: [
								{
									attributes: {
										constant: false,
										name: "",
										scope: 1970,
										stateVariable: false,
										storageLocation: "memory",
										type: "string",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "string",
												type: "string"
											},
											id: 1967,
											name: "ElementaryTypeName",
											src: "250:6:8"
										}
									],
									id: 1968,
									name: "VariableDeclaration",
									src: "250:13:8"
								}
							],
							id: 1969,
							name: "ParameterList",
							src: "249:15:8"
						}
					],
					id: 1970,
					name: "FunctionDefinition",
					src: "211:54:8"
				},
				{
					attributes: {
						body: null,
						documentation: null,
						implemented: false,
						isConstructor: false,
						kind: "function",
						modifiers: [
							null
						],
						name: "symbol",
						scope: 2189,
						stateMutability: "pure",
						superFunction: null,
						visibility: "external"
					},
					children: [
						{
							attributes: {
								parameters: [
									null
								]
							},
							children: [
							],
							id: 1971,
							name: "ParameterList",
							src: "285:2:8"
						},
						{
							children: [
								{
									attributes: {
										constant: false,
										name: "",
										scope: 1975,
										stateVariable: false,
										storageLocation: "memory",
										type: "string",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "string",
												type: "string"
											},
											id: 1972,
											name: "ElementaryTypeName",
											src: "311:6:8"
										}
									],
									id: 1973,
									name: "VariableDeclaration",
									src: "311:13:8"
								}
							],
							id: 1974,
							name: "ParameterList",
							src: "310:15:8"
						}
					],
					id: 1975,
					name: "FunctionDefinition",
					src: "270:56:8"
				},
				{
					attributes: {
						body: null,
						documentation: null,
						implemented: false,
						isConstructor: false,
						kind: "function",
						modifiers: [
							null
						],
						name: "decimals",
						scope: 2189,
						stateMutability: "pure",
						superFunction: null,
						visibility: "external"
					},
					children: [
						{
							attributes: {
								parameters: [
									null
								]
							},
							children: [
							],
							id: 1976,
							name: "ParameterList",
							src: "348:2:8"
						},
						{
							children: [
								{
									attributes: {
										constant: false,
										name: "",
										scope: 1980,
										stateVariable: false,
										storageLocation: "default",
										type: "uint8",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "uint8",
												type: "uint8"
											},
											id: 1977,
											name: "ElementaryTypeName",
											src: "374:5:8"
										}
									],
									id: 1978,
									name: "VariableDeclaration",
									src: "374:5:8"
								}
							],
							id: 1979,
							name: "ParameterList",
							src: "373:7:8"
						}
					],
					id: 1980,
					name: "FunctionDefinition",
					src: "331:50:8"
				},
				{
					attributes: {
						body: null,
						documentation: null,
						implemented: false,
						isConstructor: false,
						kind: "function",
						modifiers: [
							null
						],
						name: "totalSupply",
						scope: 2189,
						stateMutability: "view",
						superFunction: null,
						visibility: "external"
					},
					children: [
						{
							attributes: {
								parameters: [
									null
								]
							},
							children: [
							],
							id: 1981,
							name: "ParameterList",
							src: "406:2:8"
						},
						{
							children: [
								{
									attributes: {
										constant: false,
										name: "",
										scope: 1985,
										stateVariable: false,
										storageLocation: "default",
										type: "uint256",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "uint",
												type: "uint256"
											},
											id: 1982,
											name: "ElementaryTypeName",
											src: "432:4:8"
										}
									],
									id: 1983,
									name: "VariableDeclaration",
									src: "432:4:8"
								}
							],
							id: 1984,
							name: "ParameterList",
							src: "431:6:8"
						}
					],
					id: 1985,
					name: "FunctionDefinition",
					src: "386:52:8"
				},
				{
					attributes: {
						body: null,
						documentation: null,
						implemented: false,
						isConstructor: false,
						kind: "function",
						modifiers: [
							null
						],
						name: "balanceOf",
						scope: 2189,
						stateMutability: "view",
						superFunction: null,
						visibility: "external"
					},
					children: [
						{
							children: [
								{
									attributes: {
										constant: false,
										name: "owner",
										scope: 1992,
										stateVariable: false,
										storageLocation: "default",
										type: "address",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "address",
												stateMutability: "nonpayable",
												type: "address"
											},
											id: 1986,
											name: "ElementaryTypeName",
											src: "462:7:8"
										}
									],
									id: 1987,
									name: "VariableDeclaration",
									src: "462:13:8"
								}
							],
							id: 1988,
							name: "ParameterList",
							src: "461:15:8"
						},
						{
							children: [
								{
									attributes: {
										constant: false,
										name: "",
										scope: 1992,
										stateVariable: false,
										storageLocation: "default",
										type: "uint256",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "uint",
												type: "uint256"
											},
											id: 1989,
											name: "ElementaryTypeName",
											src: "500:4:8"
										}
									],
									id: 1990,
									name: "VariableDeclaration",
									src: "500:4:8"
								}
							],
							id: 1991,
							name: "ParameterList",
							src: "499:6:8"
						}
					],
					id: 1992,
					name: "FunctionDefinition",
					src: "443:63:8"
				},
				{
					attributes: {
						body: null,
						documentation: null,
						implemented: false,
						isConstructor: false,
						kind: "function",
						modifiers: [
							null
						],
						name: "allowance",
						scope: 2189,
						stateMutability: "view",
						superFunction: null,
						visibility: "external"
					},
					children: [
						{
							children: [
								{
									attributes: {
										constant: false,
										name: "owner",
										scope: 2001,
										stateVariable: false,
										storageLocation: "default",
										type: "address",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "address",
												stateMutability: "nonpayable",
												type: "address"
											},
											id: 1993,
											name: "ElementaryTypeName",
											src: "530:7:8"
										}
									],
									id: 1994,
									name: "VariableDeclaration",
									src: "530:13:8"
								},
								{
									attributes: {
										constant: false,
										name: "spender",
										scope: 2001,
										stateVariable: false,
										storageLocation: "default",
										type: "address",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "address",
												stateMutability: "nonpayable",
												type: "address"
											},
											id: 1995,
											name: "ElementaryTypeName",
											src: "545:7:8"
										}
									],
									id: 1996,
									name: "VariableDeclaration",
									src: "545:15:8"
								}
							],
							id: 1997,
							name: "ParameterList",
							src: "529:32:8"
						},
						{
							children: [
								{
									attributes: {
										constant: false,
										name: "",
										scope: 2001,
										stateVariable: false,
										storageLocation: "default",
										type: "uint256",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "uint",
												type: "uint256"
											},
											id: 1998,
											name: "ElementaryTypeName",
											src: "585:4:8"
										}
									],
									id: 1999,
									name: "VariableDeclaration",
									src: "585:4:8"
								}
							],
							id: 2000,
							name: "ParameterList",
							src: "584:6:8"
						}
					],
					id: 2001,
					name: "FunctionDefinition",
					src: "511:80:8"
				},
				{
					attributes: {
						body: null,
						documentation: null,
						implemented: false,
						isConstructor: false,
						kind: "function",
						modifiers: [
							null
						],
						name: "approve",
						scope: 2189,
						stateMutability: "nonpayable",
						superFunction: null,
						visibility: "external"
					},
					children: [
						{
							children: [
								{
									attributes: {
										constant: false,
										name: "spender",
										scope: 2010,
										stateVariable: false,
										storageLocation: "default",
										type: "address",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "address",
												stateMutability: "nonpayable",
												type: "address"
											},
											id: 2002,
											name: "ElementaryTypeName",
											src: "614:7:8"
										}
									],
									id: 2003,
									name: "VariableDeclaration",
									src: "614:15:8"
								},
								{
									attributes: {
										constant: false,
										name: "value",
										scope: 2010,
										stateVariable: false,
										storageLocation: "default",
										type: "uint256",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "uint",
												type: "uint256"
											},
											id: 2004,
											name: "ElementaryTypeName",
											src: "631:4:8"
										}
									],
									id: 2005,
									name: "VariableDeclaration",
									src: "631:10:8"
								}
							],
							id: 2006,
							name: "ParameterList",
							src: "613:29:8"
						},
						{
							children: [
								{
									attributes: {
										constant: false,
										name: "",
										scope: 2010,
										stateVariable: false,
										storageLocation: "default",
										type: "bool",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "bool",
												type: "bool"
											},
											id: 2007,
											name: "ElementaryTypeName",
											src: "661:4:8"
										}
									],
									id: 2008,
									name: "VariableDeclaration",
									src: "661:4:8"
								}
							],
							id: 2009,
							name: "ParameterList",
							src: "660:6:8"
						}
					],
					id: 2010,
					name: "FunctionDefinition",
					src: "597:70:8"
				},
				{
					attributes: {
						body: null,
						documentation: null,
						implemented: false,
						isConstructor: false,
						kind: "function",
						modifiers: [
							null
						],
						name: "transfer",
						scope: 2189,
						stateMutability: "nonpayable",
						superFunction: null,
						visibility: "external"
					},
					children: [
						{
							children: [
								{
									attributes: {
										constant: false,
										name: "to",
										scope: 2019,
										stateVariable: false,
										storageLocation: "default",
										type: "address",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "address",
												stateMutability: "nonpayable",
												type: "address"
											},
											id: 2011,
											name: "ElementaryTypeName",
											src: "690:7:8"
										}
									],
									id: 2012,
									name: "VariableDeclaration",
									src: "690:10:8"
								},
								{
									attributes: {
										constant: false,
										name: "value",
										scope: 2019,
										stateVariable: false,
										storageLocation: "default",
										type: "uint256",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "uint",
												type: "uint256"
											},
											id: 2013,
											name: "ElementaryTypeName",
											src: "702:4:8"
										}
									],
									id: 2014,
									name: "VariableDeclaration",
									src: "702:10:8"
								}
							],
							id: 2015,
							name: "ParameterList",
							src: "689:24:8"
						},
						{
							children: [
								{
									attributes: {
										constant: false,
										name: "",
										scope: 2019,
										stateVariable: false,
										storageLocation: "default",
										type: "bool",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "bool",
												type: "bool"
											},
											id: 2016,
											name: "ElementaryTypeName",
											src: "732:4:8"
										}
									],
									id: 2017,
									name: "VariableDeclaration",
									src: "732:4:8"
								}
							],
							id: 2018,
							name: "ParameterList",
							src: "731:6:8"
						}
					],
					id: 2019,
					name: "FunctionDefinition",
					src: "672:66:8"
				},
				{
					attributes: {
						body: null,
						documentation: null,
						implemented: false,
						isConstructor: false,
						kind: "function",
						modifiers: [
							null
						],
						name: "transferFrom",
						scope: 2189,
						stateMutability: "nonpayable",
						superFunction: null,
						visibility: "external"
					},
					children: [
						{
							children: [
								{
									attributes: {
										constant: false,
										name: "from",
										scope: 2030,
										stateVariable: false,
										storageLocation: "default",
										type: "address",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "address",
												stateMutability: "nonpayable",
												type: "address"
											},
											id: 2020,
											name: "ElementaryTypeName",
											src: "765:7:8"
										}
									],
									id: 2021,
									name: "VariableDeclaration",
									src: "765:12:8"
								},
								{
									attributes: {
										constant: false,
										name: "to",
										scope: 2030,
										stateVariable: false,
										storageLocation: "default",
										type: "address",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "address",
												stateMutability: "nonpayable",
												type: "address"
											},
											id: 2022,
											name: "ElementaryTypeName",
											src: "779:7:8"
										}
									],
									id: 2023,
									name: "VariableDeclaration",
									src: "779:10:8"
								},
								{
									attributes: {
										constant: false,
										name: "value",
										scope: 2030,
										stateVariable: false,
										storageLocation: "default",
										type: "uint256",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "uint",
												type: "uint256"
											},
											id: 2024,
											name: "ElementaryTypeName",
											src: "791:4:8"
										}
									],
									id: 2025,
									name: "VariableDeclaration",
									src: "791:10:8"
								}
							],
							id: 2026,
							name: "ParameterList",
							src: "764:38:8"
						},
						{
							children: [
								{
									attributes: {
										constant: false,
										name: "",
										scope: 2030,
										stateVariable: false,
										storageLocation: "default",
										type: "bool",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "bool",
												type: "bool"
											},
											id: 2027,
											name: "ElementaryTypeName",
											src: "821:4:8"
										}
									],
									id: 2028,
									name: "VariableDeclaration",
									src: "821:4:8"
								}
							],
							id: 2029,
							name: "ParameterList",
							src: "820:6:8"
						}
					],
					id: 2030,
					name: "FunctionDefinition",
					src: "743:84:8"
				},
				{
					attributes: {
						body: null,
						documentation: null,
						implemented: false,
						isConstructor: false,
						kind: "function",
						modifiers: [
							null
						],
						name: "DOMAIN_SEPARATOR",
						scope: 2189,
						stateMutability: "view",
						superFunction: null,
						visibility: "external"
					},
					children: [
						{
							attributes: {
								parameters: [
									null
								]
							},
							children: [
							],
							id: 2031,
							name: "ParameterList",
							src: "858:2:8"
						},
						{
							children: [
								{
									attributes: {
										constant: false,
										name: "",
										scope: 2035,
										stateVariable: false,
										storageLocation: "default",
										type: "bytes32",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "bytes32",
												type: "bytes32"
											},
											id: 2032,
											name: "ElementaryTypeName",
											src: "884:7:8"
										}
									],
									id: 2033,
									name: "VariableDeclaration",
									src: "884:7:8"
								}
							],
							id: 2034,
							name: "ParameterList",
							src: "883:9:8"
						}
					],
					id: 2035,
					name: "FunctionDefinition",
					src: "833:60:8"
				},
				{
					attributes: {
						body: null,
						documentation: null,
						implemented: false,
						isConstructor: false,
						kind: "function",
						modifiers: [
							null
						],
						name: "PERMIT_TYPEHASH",
						scope: 2189,
						stateMutability: "pure",
						superFunction: null,
						visibility: "external"
					},
					children: [
						{
							attributes: {
								parameters: [
									null
								]
							},
							children: [
							],
							id: 2036,
							name: "ParameterList",
							src: "922:2:8"
						},
						{
							children: [
								{
									attributes: {
										constant: false,
										name: "",
										scope: 2040,
										stateVariable: false,
										storageLocation: "default",
										type: "bytes32",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "bytes32",
												type: "bytes32"
											},
											id: 2037,
											name: "ElementaryTypeName",
											src: "948:7:8"
										}
									],
									id: 2038,
									name: "VariableDeclaration",
									src: "948:7:8"
								}
							],
							id: 2039,
							name: "ParameterList",
							src: "947:9:8"
						}
					],
					id: 2040,
					name: "FunctionDefinition",
					src: "898:59:8"
				},
				{
					attributes: {
						body: null,
						documentation: null,
						implemented: false,
						isConstructor: false,
						kind: "function",
						modifiers: [
							null
						],
						name: "nonces",
						scope: 2189,
						stateMutability: "view",
						superFunction: null,
						visibility: "external"
					},
					children: [
						{
							children: [
								{
									attributes: {
										constant: false,
										name: "owner",
										scope: 2047,
										stateVariable: false,
										storageLocation: "default",
										type: "address",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "address",
												stateMutability: "nonpayable",
												type: "address"
											},
											id: 2041,
											name: "ElementaryTypeName",
											src: "978:7:8"
										}
									],
									id: 2042,
									name: "VariableDeclaration",
									src: "978:13:8"
								}
							],
							id: 2043,
							name: "ParameterList",
							src: "977:15:8"
						},
						{
							children: [
								{
									attributes: {
										constant: false,
										name: "",
										scope: 2047,
										stateVariable: false,
										storageLocation: "default",
										type: "uint256",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "uint",
												type: "uint256"
											},
											id: 2044,
											name: "ElementaryTypeName",
											src: "1016:4:8"
										}
									],
									id: 2045,
									name: "VariableDeclaration",
									src: "1016:4:8"
								}
							],
							id: 2046,
							name: "ParameterList",
							src: "1015:6:8"
						}
					],
					id: 2047,
					name: "FunctionDefinition",
					src: "962:60:8"
				},
				{
					attributes: {
						body: null,
						documentation: null,
						implemented: false,
						isConstructor: false,
						kind: "function",
						modifiers: [
							null
						],
						name: "permit",
						scope: 2189,
						stateMutability: "nonpayable",
						superFunction: null,
						visibility: "external"
					},
					children: [
						{
							children: [
								{
									attributes: {
										constant: false,
										name: "owner",
										scope: 2064,
										stateVariable: false,
										storageLocation: "default",
										type: "address",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "address",
												stateMutability: "nonpayable",
												type: "address"
											},
											id: 2048,
											name: "ElementaryTypeName",
											src: "1044:7:8"
										}
									],
									id: 2049,
									name: "VariableDeclaration",
									src: "1044:13:8"
								},
								{
									attributes: {
										constant: false,
										name: "spender",
										scope: 2064,
										stateVariable: false,
										storageLocation: "default",
										type: "address",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "address",
												stateMutability: "nonpayable",
												type: "address"
											},
											id: 2050,
											name: "ElementaryTypeName",
											src: "1059:7:8"
										}
									],
									id: 2051,
									name: "VariableDeclaration",
									src: "1059:15:8"
								},
								{
									attributes: {
										constant: false,
										name: "value",
										scope: 2064,
										stateVariable: false,
										storageLocation: "default",
										type: "uint256",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "uint",
												type: "uint256"
											},
											id: 2052,
											name: "ElementaryTypeName",
											src: "1076:4:8"
										}
									],
									id: 2053,
									name: "VariableDeclaration",
									src: "1076:10:8"
								},
								{
									attributes: {
										constant: false,
										name: "deadline",
										scope: 2064,
										stateVariable: false,
										storageLocation: "default",
										type: "uint256",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "uint",
												type: "uint256"
											},
											id: 2054,
											name: "ElementaryTypeName",
											src: "1088:4:8"
										}
									],
									id: 2055,
									name: "VariableDeclaration",
									src: "1088:13:8"
								},
								{
									attributes: {
										constant: false,
										name: "v",
										scope: 2064,
										stateVariable: false,
										storageLocation: "default",
										type: "uint8",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "uint8",
												type: "uint8"
											},
											id: 2056,
											name: "ElementaryTypeName",
											src: "1103:5:8"
										}
									],
									id: 2057,
									name: "VariableDeclaration",
									src: "1103:7:8"
								},
								{
									attributes: {
										constant: false,
										name: "r",
										scope: 2064,
										stateVariable: false,
										storageLocation: "default",
										type: "bytes32",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "bytes32",
												type: "bytes32"
											},
											id: 2058,
											name: "ElementaryTypeName",
											src: "1112:7:8"
										}
									],
									id: 2059,
									name: "VariableDeclaration",
									src: "1112:9:8"
								},
								{
									attributes: {
										constant: false,
										name: "s",
										scope: 2064,
										stateVariable: false,
										storageLocation: "default",
										type: "bytes32",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "bytes32",
												type: "bytes32"
											},
											id: 2060,
											name: "ElementaryTypeName",
											src: "1123:7:8"
										}
									],
									id: 2061,
									name: "VariableDeclaration",
									src: "1123:9:8"
								}
							],
							id: 2062,
							name: "ParameterList",
							src: "1043:90:8"
						},
						{
							attributes: {
								parameters: [
									null
								]
							},
							children: [
							],
							id: 2063,
							name: "ParameterList",
							src: "1142:0:8"
						}
					],
					id: 2064,
					name: "FunctionDefinition",
					src: "1028:115:8"
				},
				{
					attributes: {
						anonymous: false,
						documentation: null,
						name: "Mint"
					},
					children: [
						{
							children: [
								{
									attributes: {
										constant: false,
										indexed: true,
										name: "sender",
										scope: 2072,
										stateVariable: false,
										storageLocation: "default",
										type: "address",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "address",
												stateMutability: "nonpayable",
												type: "address"
											},
											id: 2065,
											name: "ElementaryTypeName",
											src: "1160:7:8"
										}
									],
									id: 2066,
									name: "VariableDeclaration",
									src: "1160:22:8"
								},
								{
									attributes: {
										constant: false,
										indexed: false,
										name: "amount0",
										scope: 2072,
										stateVariable: false,
										storageLocation: "default",
										type: "uint256",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "uint",
												type: "uint256"
											},
											id: 2067,
											name: "ElementaryTypeName",
											src: "1184:4:8"
										}
									],
									id: 2068,
									name: "VariableDeclaration",
									src: "1184:12:8"
								},
								{
									attributes: {
										constant: false,
										indexed: false,
										name: "amount1",
										scope: 2072,
										stateVariable: false,
										storageLocation: "default",
										type: "uint256",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "uint",
												type: "uint256"
											},
											id: 2069,
											name: "ElementaryTypeName",
											src: "1198:4:8"
										}
									],
									id: 2070,
									name: "VariableDeclaration",
									src: "1198:12:8"
								}
							],
							id: 2071,
							name: "ParameterList",
							src: "1159:52:8"
						}
					],
					id: 2072,
					name: "EventDefinition",
					src: "1149:63:8"
				},
				{
					attributes: {
						anonymous: false,
						documentation: null,
						name: "Burn"
					},
					children: [
						{
							children: [
								{
									attributes: {
										constant: false,
										indexed: true,
										name: "sender",
										scope: 2082,
										stateVariable: false,
										storageLocation: "default",
										type: "address",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "address",
												stateMutability: "nonpayable",
												type: "address"
											},
											id: 2073,
											name: "ElementaryTypeName",
											src: "1228:7:8"
										}
									],
									id: 2074,
									name: "VariableDeclaration",
									src: "1228:22:8"
								},
								{
									attributes: {
										constant: false,
										indexed: false,
										name: "amount0",
										scope: 2082,
										stateVariable: false,
										storageLocation: "default",
										type: "uint256",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "uint",
												type: "uint256"
											},
											id: 2075,
											name: "ElementaryTypeName",
											src: "1252:4:8"
										}
									],
									id: 2076,
									name: "VariableDeclaration",
									src: "1252:12:8"
								},
								{
									attributes: {
										constant: false,
										indexed: false,
										name: "amount1",
										scope: 2082,
										stateVariable: false,
										storageLocation: "default",
										type: "uint256",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "uint",
												type: "uint256"
											},
											id: 2077,
											name: "ElementaryTypeName",
											src: "1266:4:8"
										}
									],
									id: 2078,
									name: "VariableDeclaration",
									src: "1266:12:8"
								},
								{
									attributes: {
										constant: false,
										indexed: true,
										name: "to",
										scope: 2082,
										stateVariable: false,
										storageLocation: "default",
										type: "address",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "address",
												stateMutability: "nonpayable",
												type: "address"
											},
											id: 2079,
											name: "ElementaryTypeName",
											src: "1280:7:8"
										}
									],
									id: 2080,
									name: "VariableDeclaration",
									src: "1280:18:8"
								}
							],
							id: 2081,
							name: "ParameterList",
							src: "1227:72:8"
						}
					],
					id: 2082,
					name: "EventDefinition",
					src: "1217:83:8"
				},
				{
					attributes: {
						anonymous: false,
						documentation: null,
						name: "Swap"
					},
					children: [
						{
							children: [
								{
									attributes: {
										constant: false,
										indexed: true,
										name: "sender",
										scope: 2096,
										stateVariable: false,
										storageLocation: "default",
										type: "address",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "address",
												stateMutability: "nonpayable",
												type: "address"
											},
											id: 2083,
											name: "ElementaryTypeName",
											src: "1325:7:8"
										}
									],
									id: 2084,
									name: "VariableDeclaration",
									src: "1325:22:8"
								},
								{
									attributes: {
										constant: false,
										indexed: false,
										name: "amount0In",
										scope: 2096,
										stateVariable: false,
										storageLocation: "default",
										type: "uint256",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "uint",
												type: "uint256"
											},
											id: 2085,
											name: "ElementaryTypeName",
											src: "1357:4:8"
										}
									],
									id: 2086,
									name: "VariableDeclaration",
									src: "1357:14:8"
								},
								{
									attributes: {
										constant: false,
										indexed: false,
										name: "amount1In",
										scope: 2096,
										stateVariable: false,
										storageLocation: "default",
										type: "uint256",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "uint",
												type: "uint256"
											},
											id: 2087,
											name: "ElementaryTypeName",
											src: "1381:4:8"
										}
									],
									id: 2088,
									name: "VariableDeclaration",
									src: "1381:14:8"
								},
								{
									attributes: {
										constant: false,
										indexed: false,
										name: "amount0Out",
										scope: 2096,
										stateVariable: false,
										storageLocation: "default",
										type: "uint256",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "uint",
												type: "uint256"
											},
											id: 2089,
											name: "ElementaryTypeName",
											src: "1405:4:8"
										}
									],
									id: 2090,
									name: "VariableDeclaration",
									src: "1405:15:8"
								},
								{
									attributes: {
										constant: false,
										indexed: false,
										name: "amount1Out",
										scope: 2096,
										stateVariable: false,
										storageLocation: "default",
										type: "uint256",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "uint",
												type: "uint256"
											},
											id: 2091,
											name: "ElementaryTypeName",
											src: "1430:4:8"
										}
									],
									id: 2092,
									name: "VariableDeclaration",
									src: "1430:15:8"
								},
								{
									attributes: {
										constant: false,
										indexed: true,
										name: "to",
										scope: 2096,
										stateVariable: false,
										storageLocation: "default",
										type: "address",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "address",
												stateMutability: "nonpayable",
												type: "address"
											},
											id: 2093,
											name: "ElementaryTypeName",
											src: "1455:7:8"
										}
									],
									id: 2094,
									name: "VariableDeclaration",
									src: "1455:18:8"
								}
							],
							id: 2095,
							name: "ParameterList",
							src: "1315:164:8"
						}
					],
					id: 2096,
					name: "EventDefinition",
					src: "1305:175:8"
				},
				{
					attributes: {
						anonymous: false,
						documentation: null,
						name: "Sync"
					},
					children: [
						{
							children: [
								{
									attributes: {
										constant: false,
										indexed: false,
										name: "reserve0",
										scope: 2102,
										stateVariable: false,
										storageLocation: "default",
										type: "uint112",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "uint112",
												type: "uint112"
											},
											id: 2097,
											name: "ElementaryTypeName",
											src: "1496:7:8"
										}
									],
									id: 2098,
									name: "VariableDeclaration",
									src: "1496:16:8"
								},
								{
									attributes: {
										constant: false,
										indexed: false,
										name: "reserve1",
										scope: 2102,
										stateVariable: false,
										storageLocation: "default",
										type: "uint112",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "uint112",
												type: "uint112"
											},
											id: 2099,
											name: "ElementaryTypeName",
											src: "1514:7:8"
										}
									],
									id: 2100,
									name: "VariableDeclaration",
									src: "1514:16:8"
								}
							],
							id: 2101,
							name: "ParameterList",
							src: "1495:36:8"
						}
					],
					id: 2102,
					name: "EventDefinition",
					src: "1485:47:8"
				},
				{
					attributes: {
						body: null,
						documentation: null,
						implemented: false,
						isConstructor: false,
						kind: "function",
						modifiers: [
							null
						],
						name: "MINIMUM_LIQUIDITY",
						scope: 2189,
						stateMutability: "pure",
						superFunction: null,
						visibility: "external"
					},
					children: [
						{
							attributes: {
								parameters: [
									null
								]
							},
							children: [
							],
							id: 2103,
							name: "ParameterList",
							src: "1564:2:8"
						},
						{
							children: [
								{
									attributes: {
										constant: false,
										name: "",
										scope: 2107,
										stateVariable: false,
										storageLocation: "default",
										type: "uint256",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "uint",
												type: "uint256"
											},
											id: 2104,
											name: "ElementaryTypeName",
											src: "1590:4:8"
										}
									],
									id: 2105,
									name: "VariableDeclaration",
									src: "1590:4:8"
								}
							],
							id: 2106,
							name: "ParameterList",
							src: "1589:6:8"
						}
					],
					id: 2107,
					name: "FunctionDefinition",
					src: "1538:58:8"
				},
				{
					attributes: {
						body: null,
						documentation: null,
						implemented: false,
						isConstructor: false,
						kind: "function",
						modifiers: [
							null
						],
						name: "factory",
						scope: 2189,
						stateMutability: "view",
						superFunction: null,
						visibility: "external"
					},
					children: [
						{
							attributes: {
								parameters: [
									null
								]
							},
							children: [
							],
							id: 2108,
							name: "ParameterList",
							src: "1617:2:8"
						},
						{
							children: [
								{
									attributes: {
										constant: false,
										name: "",
										scope: 2112,
										stateVariable: false,
										storageLocation: "default",
										type: "address",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "address",
												stateMutability: "nonpayable",
												type: "address"
											},
											id: 2109,
											name: "ElementaryTypeName",
											src: "1643:7:8"
										}
									],
									id: 2110,
									name: "VariableDeclaration",
									src: "1643:7:8"
								}
							],
							id: 2111,
							name: "ParameterList",
							src: "1642:9:8"
						}
					],
					id: 2112,
					name: "FunctionDefinition",
					src: "1601:51:8"
				},
				{
					attributes: {
						body: null,
						documentation: null,
						implemented: false,
						isConstructor: false,
						kind: "function",
						modifiers: [
							null
						],
						name: "token0",
						scope: 2189,
						stateMutability: "view",
						superFunction: null,
						visibility: "external"
					},
					children: [
						{
							attributes: {
								parameters: [
									null
								]
							},
							children: [
							],
							id: 2113,
							name: "ParameterList",
							src: "1672:2:8"
						},
						{
							children: [
								{
									attributes: {
										constant: false,
										name: "",
										scope: 2117,
										stateVariable: false,
										storageLocation: "default",
										type: "address",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "address",
												stateMutability: "nonpayable",
												type: "address"
											},
											id: 2114,
											name: "ElementaryTypeName",
											src: "1698:7:8"
										}
									],
									id: 2115,
									name: "VariableDeclaration",
									src: "1698:7:8"
								}
							],
							id: 2116,
							name: "ParameterList",
							src: "1697:9:8"
						}
					],
					id: 2117,
					name: "FunctionDefinition",
					src: "1657:50:8"
				},
				{
					attributes: {
						body: null,
						documentation: null,
						implemented: false,
						isConstructor: false,
						kind: "function",
						modifiers: [
							null
						],
						name: "token1",
						scope: 2189,
						stateMutability: "view",
						superFunction: null,
						visibility: "external"
					},
					children: [
						{
							attributes: {
								parameters: [
									null
								]
							},
							children: [
							],
							id: 2118,
							name: "ParameterList",
							src: "1727:2:8"
						},
						{
							children: [
								{
									attributes: {
										constant: false,
										name: "",
										scope: 2122,
										stateVariable: false,
										storageLocation: "default",
										type: "address",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "address",
												stateMutability: "nonpayable",
												type: "address"
											},
											id: 2119,
											name: "ElementaryTypeName",
											src: "1753:7:8"
										}
									],
									id: 2120,
									name: "VariableDeclaration",
									src: "1753:7:8"
								}
							],
							id: 2121,
							name: "ParameterList",
							src: "1752:9:8"
						}
					],
					id: 2122,
					name: "FunctionDefinition",
					src: "1712:50:8"
				},
				{
					attributes: {
						body: null,
						documentation: null,
						implemented: false,
						isConstructor: false,
						kind: "function",
						modifiers: [
							null
						],
						name: "getReserves",
						scope: 2189,
						stateMutability: "view",
						superFunction: null,
						visibility: "external"
					},
					children: [
						{
							attributes: {
								parameters: [
									null
								]
							},
							children: [
							],
							id: 2123,
							name: "ParameterList",
							src: "1787:2:8"
						},
						{
							children: [
								{
									attributes: {
										constant: false,
										name: "reserve0",
										scope: 2131,
										stateVariable: false,
										storageLocation: "default",
										type: "uint112",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "uint112",
												type: "uint112"
											},
											id: 2124,
											name: "ElementaryTypeName",
											src: "1813:7:8"
										}
									],
									id: 2125,
									name: "VariableDeclaration",
									src: "1813:16:8"
								},
								{
									attributes: {
										constant: false,
										name: "reserve1",
										scope: 2131,
										stateVariable: false,
										storageLocation: "default",
										type: "uint112",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "uint112",
												type: "uint112"
											},
											id: 2126,
											name: "ElementaryTypeName",
											src: "1831:7:8"
										}
									],
									id: 2127,
									name: "VariableDeclaration",
									src: "1831:16:8"
								},
								{
									attributes: {
										constant: false,
										name: "blockTimestampLast",
										scope: 2131,
										stateVariable: false,
										storageLocation: "default",
										type: "uint32",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "uint32",
												type: "uint32"
											},
											id: 2128,
											name: "ElementaryTypeName",
											src: "1849:6:8"
										}
									],
									id: 2129,
									name: "VariableDeclaration",
									src: "1849:25:8"
								}
							],
							id: 2130,
							name: "ParameterList",
							src: "1812:63:8"
						}
					],
					id: 2131,
					name: "FunctionDefinition",
					src: "1767:109:8"
				},
				{
					attributes: {
						body: null,
						documentation: null,
						implemented: false,
						isConstructor: false,
						kind: "function",
						modifiers: [
							null
						],
						name: "price0CumulativeLast",
						scope: 2189,
						stateMutability: "view",
						superFunction: null,
						visibility: "external"
					},
					children: [
						{
							attributes: {
								parameters: [
									null
								]
							},
							children: [
							],
							id: 2132,
							name: "ParameterList",
							src: "1910:2:8"
						},
						{
							children: [
								{
									attributes: {
										constant: false,
										name: "",
										scope: 2136,
										stateVariable: false,
										storageLocation: "default",
										type: "uint256",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "uint",
												type: "uint256"
											},
											id: 2133,
											name: "ElementaryTypeName",
											src: "1936:4:8"
										}
									],
									id: 2134,
									name: "VariableDeclaration",
									src: "1936:4:8"
								}
							],
							id: 2135,
							name: "ParameterList",
							src: "1935:6:8"
						}
					],
					id: 2136,
					name: "FunctionDefinition",
					src: "1881:61:8"
				},
				{
					attributes: {
						body: null,
						documentation: null,
						implemented: false,
						isConstructor: false,
						kind: "function",
						modifiers: [
							null
						],
						name: "price1CumulativeLast",
						scope: 2189,
						stateMutability: "view",
						superFunction: null,
						visibility: "external"
					},
					children: [
						{
							attributes: {
								parameters: [
									null
								]
							},
							children: [
							],
							id: 2137,
							name: "ParameterList",
							src: "1976:2:8"
						},
						{
							children: [
								{
									attributes: {
										constant: false,
										name: "",
										scope: 2141,
										stateVariable: false,
										storageLocation: "default",
										type: "uint256",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "uint",
												type: "uint256"
											},
											id: 2138,
											name: "ElementaryTypeName",
											src: "2002:4:8"
										}
									],
									id: 2139,
									name: "VariableDeclaration",
									src: "2002:4:8"
								}
							],
							id: 2140,
							name: "ParameterList",
							src: "2001:6:8"
						}
					],
					id: 2141,
					name: "FunctionDefinition",
					src: "1947:61:8"
				},
				{
					attributes: {
						body: null,
						documentation: null,
						implemented: false,
						isConstructor: false,
						kind: "function",
						modifiers: [
							null
						],
						name: "kLast",
						scope: 2189,
						stateMutability: "view",
						superFunction: null,
						visibility: "external"
					},
					children: [
						{
							attributes: {
								parameters: [
									null
								]
							},
							children: [
							],
							id: 2142,
							name: "ParameterList",
							src: "2027:2:8"
						},
						{
							children: [
								{
									attributes: {
										constant: false,
										name: "",
										scope: 2146,
										stateVariable: false,
										storageLocation: "default",
										type: "uint256",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "uint",
												type: "uint256"
											},
											id: 2143,
											name: "ElementaryTypeName",
											src: "2053:4:8"
										}
									],
									id: 2144,
									name: "VariableDeclaration",
									src: "2053:4:8"
								}
							],
							id: 2145,
							name: "ParameterList",
							src: "2052:6:8"
						}
					],
					id: 2146,
					name: "FunctionDefinition",
					src: "2013:46:8"
				},
				{
					attributes: {
						body: null,
						documentation: null,
						implemented: false,
						isConstructor: false,
						kind: "function",
						modifiers: [
							null
						],
						name: "mint",
						scope: 2189,
						stateMutability: "nonpayable",
						superFunction: null,
						visibility: "external"
					},
					children: [
						{
							children: [
								{
									attributes: {
										constant: false,
										name: "to",
										scope: 2153,
										stateVariable: false,
										storageLocation: "default",
										type: "address",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "address",
												stateMutability: "nonpayable",
												type: "address"
											},
											id: 2147,
											name: "ElementaryTypeName",
											src: "2079:7:8"
										}
									],
									id: 2148,
									name: "VariableDeclaration",
									src: "2079:10:8"
								}
							],
							id: 2149,
							name: "ParameterList",
							src: "2078:12:8"
						},
						{
							children: [
								{
									attributes: {
										constant: false,
										name: "liquidity",
										scope: 2153,
										stateVariable: false,
										storageLocation: "default",
										type: "uint256",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "uint",
												type: "uint256"
											},
											id: 2150,
											name: "ElementaryTypeName",
											src: "2109:4:8"
										}
									],
									id: 2151,
									name: "VariableDeclaration",
									src: "2109:14:8"
								}
							],
							id: 2152,
							name: "ParameterList",
							src: "2108:16:8"
						}
					],
					id: 2153,
					name: "FunctionDefinition",
					src: "2065:60:8"
				},
				{
					attributes: {
						body: null,
						documentation: null,
						implemented: false,
						isConstructor: false,
						kind: "function",
						modifiers: [
							null
						],
						name: "burn",
						scope: 2189,
						stateMutability: "nonpayable",
						superFunction: null,
						visibility: "external"
					},
					children: [
						{
							children: [
								{
									attributes: {
										constant: false,
										name: "to",
										scope: 2162,
										stateVariable: false,
										storageLocation: "default",
										type: "address",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "address",
												stateMutability: "nonpayable",
												type: "address"
											},
											id: 2154,
											name: "ElementaryTypeName",
											src: "2144:7:8"
										}
									],
									id: 2155,
									name: "VariableDeclaration",
									src: "2144:10:8"
								}
							],
							id: 2156,
							name: "ParameterList",
							src: "2143:12:8"
						},
						{
							children: [
								{
									attributes: {
										constant: false,
										name: "amount0",
										scope: 2162,
										stateVariable: false,
										storageLocation: "default",
										type: "uint256",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "uint",
												type: "uint256"
											},
											id: 2157,
											name: "ElementaryTypeName",
											src: "2174:4:8"
										}
									],
									id: 2158,
									name: "VariableDeclaration",
									src: "2174:12:8"
								},
								{
									attributes: {
										constant: false,
										name: "amount1",
										scope: 2162,
										stateVariable: false,
										storageLocation: "default",
										type: "uint256",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "uint",
												type: "uint256"
											},
											id: 2159,
											name: "ElementaryTypeName",
											src: "2188:4:8"
										}
									],
									id: 2160,
									name: "VariableDeclaration",
									src: "2188:12:8"
								}
							],
							id: 2161,
							name: "ParameterList",
							src: "2173:28:8"
						}
					],
					id: 2162,
					name: "FunctionDefinition",
					src: "2130:72:8"
				},
				{
					attributes: {
						body: null,
						documentation: null,
						implemented: false,
						isConstructor: false,
						kind: "function",
						modifiers: [
							null
						],
						name: "swap",
						scope: 2189,
						stateMutability: "nonpayable",
						superFunction: null,
						visibility: "external"
					},
					children: [
						{
							children: [
								{
									attributes: {
										constant: false,
										name: "amount0Out",
										scope: 2173,
										stateVariable: false,
										storageLocation: "default",
										type: "uint256",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "uint",
												type: "uint256"
											},
											id: 2163,
											name: "ElementaryTypeName",
											src: "2221:4:8"
										}
									],
									id: 2164,
									name: "VariableDeclaration",
									src: "2221:15:8"
								},
								{
									attributes: {
										constant: false,
										name: "amount1Out",
										scope: 2173,
										stateVariable: false,
										storageLocation: "default",
										type: "uint256",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "uint",
												type: "uint256"
											},
											id: 2165,
											name: "ElementaryTypeName",
											src: "2238:4:8"
										}
									],
									id: 2166,
									name: "VariableDeclaration",
									src: "2238:15:8"
								},
								{
									attributes: {
										constant: false,
										name: "to",
										scope: 2173,
										stateVariable: false,
										storageLocation: "default",
										type: "address",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "address",
												stateMutability: "nonpayable",
												type: "address"
											},
											id: 2167,
											name: "ElementaryTypeName",
											src: "2255:7:8"
										}
									],
									id: 2168,
									name: "VariableDeclaration",
									src: "2255:10:8"
								},
								{
									attributes: {
										constant: false,
										name: "data",
										scope: 2173,
										stateVariable: false,
										storageLocation: "calldata",
										type: "bytes",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "bytes",
												type: "bytes"
											},
											id: 2169,
											name: "ElementaryTypeName",
											src: "2267:5:8"
										}
									],
									id: 2170,
									name: "VariableDeclaration",
									src: "2267:19:8"
								}
							],
							id: 2171,
							name: "ParameterList",
							src: "2220:67:8"
						},
						{
							attributes: {
								parameters: [
									null
								]
							},
							children: [
							],
							id: 2172,
							name: "ParameterList",
							src: "2296:0:8"
						}
					],
					id: 2173,
					name: "FunctionDefinition",
					src: "2207:90:8"
				},
				{
					attributes: {
						body: null,
						documentation: null,
						implemented: false,
						isConstructor: false,
						kind: "function",
						modifiers: [
							null
						],
						name: "skim",
						scope: 2189,
						stateMutability: "nonpayable",
						superFunction: null,
						visibility: "external"
					},
					children: [
						{
							children: [
								{
									attributes: {
										constant: false,
										name: "to",
										scope: 2178,
										stateVariable: false,
										storageLocation: "default",
										type: "address",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "address",
												stateMutability: "nonpayable",
												type: "address"
											},
											id: 2174,
											name: "ElementaryTypeName",
											src: "2316:7:8"
										}
									],
									id: 2175,
									name: "VariableDeclaration",
									src: "2316:10:8"
								}
							],
							id: 2176,
							name: "ParameterList",
							src: "2315:12:8"
						},
						{
							attributes: {
								parameters: [
									null
								]
							},
							children: [
							],
							id: 2177,
							name: "ParameterList",
							src: "2336:0:8"
						}
					],
					id: 2178,
					name: "FunctionDefinition",
					src: "2302:35:8"
				},
				{
					attributes: {
						body: null,
						documentation: null,
						implemented: false,
						isConstructor: false,
						kind: "function",
						modifiers: [
							null
						],
						name: "sync",
						scope: 2189,
						stateMutability: "nonpayable",
						superFunction: null,
						visibility: "external"
					},
					children: [
						{
							attributes: {
								parameters: [
									null
								]
							},
							children: [
							],
							id: 2179,
							name: "ParameterList",
							src: "2355:2:8"
						},
						{
							attributes: {
								parameters: [
									null
								]
							},
							children: [
							],
							id: 2180,
							name: "ParameterList",
							src: "2366:0:8"
						}
					],
					id: 2181,
					name: "FunctionDefinition",
					src: "2342:25:8"
				},
				{
					attributes: {
						body: null,
						documentation: null,
						implemented: false,
						isConstructor: false,
						kind: "function",
						modifiers: [
							null
						],
						name: "initialize",
						scope: 2189,
						stateMutability: "nonpayable",
						superFunction: null,
						visibility: "external"
					},
					children: [
						{
							children: [
								{
									attributes: {
										constant: false,
										name: "",
										scope: 2188,
										stateVariable: false,
										storageLocation: "default",
										type: "address",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "address",
												stateMutability: "nonpayable",
												type: "address"
											},
											id: 2182,
											name: "ElementaryTypeName",
											src: "2393:7:8"
										}
									],
									id: 2183,
									name: "VariableDeclaration",
									src: "2393:7:8"
								},
								{
									attributes: {
										constant: false,
										name: "",
										scope: 2188,
										stateVariable: false,
										storageLocation: "default",
										type: "address",
										value: null,
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "address",
												stateMutability: "nonpayable",
												type: "address"
											},
											id: 2184,
											name: "ElementaryTypeName",
											src: "2402:7:8"
										}
									],
									id: 2185,
									name: "VariableDeclaration",
									src: "2402:7:8"
								}
							],
							id: 2186,
							name: "ParameterList",
							src: "2392:18:8"
						},
						{
							attributes: {
								parameters: [
									null
								]
							},
							children: [
							],
							id: 2187,
							name: "ParameterList",
							src: "2419:0:8"
						}
					],
					id: 2188,
					name: "FunctionDefinition",
					src: "2373:47:8"
				}
			],
			id: 2189,
			name: "ContractDefinition",
			src: "26:2396:8"
		}
	],
	id: 2190,
	name: "SourceUnit",
	src: "0:2423:8"
};
var compiler = {
	name: "solc",
	version: "0.5.16+commit.9c3226ce.Emscripten.clang"
};
var networks = {
};
var schemaVersion = "3.4.2";
var updatedAt = "2021-08-14T11:27:34.742Z";
var devdoc = {
	methods: {
	}
};
var userdoc = {
	methods: {
	}
};
var IUniswapV2Pair = {
	contractName: contractName,
	abi: abi,
	metadata: metadata,
	bytecode: bytecode,
	deployedBytecode: deployedBytecode,
	sourceMap: sourceMap,
	deployedSourceMap: deployedSourceMap,
	source: source,
	sourcePath: sourcePath,
	ast: ast,
	legacyAST: legacyAST,
	compiler: compiler,
	networks: networks,
	schemaVersion: schemaVersion,
	updatedAt: updatedAt,
	devdoc: devdoc,
	userdoc: userdoc
};

var _TOKEN_DECIMALS_CACHE;
var TOKEN_DECIMALS_CACHE = (_TOKEN_DECIMALS_CACHE = {}, _TOKEN_DECIMALS_CACHE[exports.ChainId.MAINNET] = {
  '0xE0B7927c4aF23765Cb51314A0E0521A9645F0E2A': 9
}, _TOKEN_DECIMALS_CACHE);
var Fetcher = /*#__PURE__*/function () {
  function Fetcher() {}
  Fetcher.fetchTokenData = function fetchTokenData(chainId, address, provider, symbol, name) {
    try {
      var _TOKEN_DECIMALS_CACHE2, _TOKEN_DECIMALS_CACHE3;
      var _temp2 = function _temp2(parsedDecimals) {
        return new Token(chainId, address, parsedDecimals, symbol, name);
      };
      if (provider === undefined) provider = providers.getDefaultProvider(networks$1.getNetwork(chainId));
      var _temp = typeof ((_TOKEN_DECIMALS_CACHE2 = TOKEN_DECIMALS_CACHE) === null || _TOKEN_DECIMALS_CACHE2 === void 0 ? void 0 : (_TOKEN_DECIMALS_CACHE3 = _TOKEN_DECIMALS_CACHE2[chainId]) === null || _TOKEN_DECIMALS_CACHE3 === void 0 ? void 0 : _TOKEN_DECIMALS_CACHE3[address]) === 'number';
      return Promise.resolve(_temp ? _temp2(TOKEN_DECIMALS_CACHE[chainId][address]) : Promise.resolve(new contracts.Contract(address, ERC20, provider).decimals().then(function (decimals) {
        var _TOKEN_DECIMALS_CACHE4, _extends2, _extends3;
        TOKEN_DECIMALS_CACHE = _extends({}, TOKEN_DECIMALS_CACHE, (_extends3 = {}, _extends3[chainId] = _extends({}, (_TOKEN_DECIMALS_CACHE4 = TOKEN_DECIMALS_CACHE) === null || _TOKEN_DECIMALS_CACHE4 === void 0 ? void 0 : _TOKEN_DECIMALS_CACHE4[chainId], (_extends2 = {}, _extends2[address] = decimals, _extends2)), _extends3));
        return decimals;
      })).then(_temp2));
    } catch (e) {
      return Promise.reject(e);
    }
  };
  Fetcher.fetchPairData = function fetchPairData(tokenA, tokenB, provider) {
    try {
      if (provider === undefined) provider = providers.getDefaultProvider(networks$1.getNetwork(tokenA.chainId));
      invariant(tokenA.chainId === tokenB.chainId, 'CHAIN_ID');
      var address = Pair.getAddress(tokenA, tokenB);
      return Promise.resolve(new contracts.Contract(address, IUniswapV2Pair.abi, provider).getReserves()).then(function (_ref) {
        var reserves0 = _ref[0],
          reserves1 = _ref[1];
        var balances = tokenA.sortsBefore(tokenB) ? [reserves0, reserves1] : [reserves1, reserves0];
        return new Pair(new TokenAmount(tokenA, balances[0]), new TokenAmount(tokenB, balances[1]));
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };
  return Fetcher;
}();

var _ROUTER_ADDRESS, _ROUTER_ADDRESS_WITH_, _PYTH_ADDRESS, _RPC_URLS, _PINNED_PAIRS, _WETH_ONLY, _extends2;
var BIPS_BASE = JSBI.BigInt(10000);
var AddressZero = '0x0000000000000000000000000000000000000000';
var ROUTER_ADDRESS = (_ROUTER_ADDRESS = {}, _ROUTER_ADDRESS[exports.ChainId.MAINNET] = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', _ROUTER_ADDRESS[exports.ChainId.SEPOLIA] = '0x4CACe6D85e0FAEb480bA2a91dd79549F780fBc5E', _ROUTER_ADDRESS[exports.ChainId.SN_MAIN] = '', _ROUTER_ADDRESS[exports.ChainId.SN_SEPOLIA] = '0x07365f5f8f2f7748d31653133ba5a8be7501d5d90e9893e91372e44b4fe9c967', _ROUTER_ADDRESS[exports.ChainId.BSC_TESTNET] = '0xdbbF4542574a8c6e54e3F0e5f8F9Eea3e463F9B8', _ROUTER_ADDRESS[exports.ChainId.MINATO_SONEIUM] = '0x6D1f381cF674CeE888E61b088b78202559eCEEAB', _ROUTER_ADDRESS[exports.ChainId.VICTION_TESTNET] = '0x44FCf63f47F7d9587b67781cB46842dcFd95A9E8', _ROUTER_ADDRESS[exports.ChainId.VICTION_MAINNET] = '0x7932606E387479C9cc97efde08BDcaFC5A50ac5A', _ROUTER_ADDRESS[exports.ChainId.SONIC_TESTNET] = '0x44FCf63f47F7d9587b67781cB46842dcFd95A9E8', _ROUTER_ADDRESS[exports.ChainId.BASE_SEPOLIA] = '0x7cb2CF3dde3d518b408ea0B83738C067EEdb571D', _ROUTER_ADDRESS[exports.ChainId.UNICHAIN_SEPOLIA] = '0x7cb2CF3dde3d518b408ea0B83738C067EEdb571D', _ROUTER_ADDRESS[exports.ChainId.AURORA_TESTNET] = '0x7cb2CF3dde3d518b408ea0B83738C067EEdb571D', _ROUTER_ADDRESS[exports.ChainId.METIS_MAINNET] = '0xcfdcAC1f0bb8a212990Ec408f0d27A7EC5384ac6', _ROUTER_ADDRESS[exports.ChainId.TAIKO_TESTNET] = '0x7cb2CF3dde3d518b408ea0B83738C067EEdb571D', _ROUTER_ADDRESS[exports.ChainId.BOBA_TESTNET] = '0x782783378a9D3BCCC8d9A03F5ED452263758a571', _ROUTER_ADDRESS[exports.ChainId.NEOX_MAINNET] = '0xa244C6d127Ec19689f0DEf715417736c7f6cf0C4', _ROUTER_ADDRESS[exports.ChainId.U2U_MAINNET] = '0x40c2Be0C8c421235BDD93714BCac4ffB6A4067a5', _ROUTER_ADDRESS[exports.ChainId.SCROLL_TESTNET] = '0x782783378a9D3BCCC8d9A03F5ED452263758a571', _ROUTER_ADDRESS[exports.ChainId.ARBITRUM_MAINNET] = '0x40c2Be0C8c421235BDD93714BCac4ffB6A4067a5', _ROUTER_ADDRESS[exports.ChainId.OP_MAINNET] = '0x40c2Be0C8c421235BDD93714BCac4ffB6A4067a5', _ROUTER_ADDRESS[exports.ChainId.BOBA_MAINNET] = '0x40c2Be0C8c421235BDD93714BCac4ffB6A4067a5', _ROUTER_ADDRESS[exports.ChainId.BERA_MAINNET] = '0x40c2Be0C8c421235BDD93714BCac4ffB6A4067a5', _ROUTER_ADDRESS);
var ROUTER_ADDRESS_WITH_PRICE = (_ROUTER_ADDRESS_WITH_ = {}, _ROUTER_ADDRESS_WITH_[exports.ChainId.VICTION_MAINNET] = '0x0194CcfC49C3ebc7457E0b41B9c6b840C22f5985', _ROUTER_ADDRESS_WITH_[exports.ChainId.SONIC_TESTNET] = '0x0f97Ca4E6B118502f83DD3Ce836A14Cb4937ed2a', _ROUTER_ADDRESS_WITH_[exports.ChainId.AURORA_TESTNET] = '0x83A8D57634239a9e52197d34cbc74CD9455383d1', _ROUTER_ADDRESS_WITH_[exports.ChainId.TAIKO_TESTNET] = '0x68Ce9bf4De2E0f44f39d80611d21556665120b91', _ROUTER_ADDRESS_WITH_[exports.ChainId.BOBA_TESTNET] = '0x44FCf63f47F7d9587b67781cB46842dcFd95A9E8', _ROUTER_ADDRESS_WITH_[exports.ChainId.BOBA_MAINNET] = '0xa244C6d127Ec19689f0DEf715417736c7f6cf0C4', _ROUTER_ADDRESS_WITH_[exports.ChainId.BERA_MAINNET] = '0xa244C6d127Ec19689f0DEf715417736c7f6cf0C4', _ROUTER_ADDRESS_WITH_);
var PYTH_ADDRESS = (_PYTH_ADDRESS = {}, _PYTH_ADDRESS[exports.ChainId.SEPOLIA] = '0xDd24F84d36BF92C65F92307595335bdFab5Bbd21', _PYTH_ADDRESS[exports.ChainId.VICTION_MAINNET] = '0xA2aa501b19aff244D90cc15a4Cf739D2725B5729', _PYTH_ADDRESS[exports.ChainId.SONIC_TESTNET] = '0x96124d1f6e44ffdf1fb5d6d74bb2de1b7fbe7376', _PYTH_ADDRESS[exports.ChainId.AURORA_TESTNET] = '0x74f09cb3c7e2A01865f424FD14F6dc9A14E3e94E', _PYTH_ADDRESS[exports.ChainId.TAIKO_TESTNET] = '0x2880aB155794e7179c9eE2e38200202908C17B43', _PYTH_ADDRESS[exports.ChainId.BOBA_TESTNET] = '0x8D254a21b3C86D32F7179855531CE99164721933', _PYTH_ADDRESS[exports.ChainId.BOBA_MAINNET] = '0x4374e5a8b9C22271E9EB878A2AA31DE97DF15DAF', _PYTH_ADDRESS[exports.ChainId.BERA_MAINNET] = '0x2880aB155794e7179c9eE2e38200202908C17B43', _PYTH_ADDRESS);
var RPC_URLS = (_RPC_URLS = {}, _RPC_URLS[exports.ChainId.SEPOLIA] = 'https://sepolia.drpc.org', _RPC_URLS[exports.ChainId.BSC_TESTNET] = 'https://bsc-testnet.drpc.org', _RPC_URLS[exports.ChainId.VICTION_TESTNET] = 'https://rpc-testnet.viction.xyz', _RPC_URLS[exports.ChainId.VICTION_MAINNET] = 'https://rpc.viction.xyz', _RPC_URLS[exports.ChainId.SONIC_TESTNET] = 'https://rpc.testnet.soniclabs.com', _RPC_URLS[exports.ChainId.MINATO_SONEIUM] = 'https://rpc.minato.soneium.org/', _RPC_URLS[exports.ChainId.BASE_SEPOLIA] = 'https://base-sepolia-rpc.publicnode.com', _RPC_URLS[exports.ChainId.UNICHAIN_SEPOLIA] = 'https://sepolia.unichain.org', _RPC_URLS[exports.ChainId.AURORA_TESTNET] = 'https://testnet.aurora.dev', _RPC_URLS[exports.ChainId.METIS_MAINNET] = 'https://andromeda.metis.io/?owner=1088', _RPC_URLS[exports.ChainId.TAIKO_TESTNET] = 'https://rpc.hekla.taiko.xyz', _RPC_URLS[exports.ChainId.BOBA_TESTNET] = 'https://sepolia.boba.network', _RPC_URLS[exports.ChainId.NEOX_MAINNET] = 'https://mainnet-1.rpc.banelabs.org', _RPC_URLS[exports.ChainId.U2U_MAINNET] = 'https://rpc-mainnet.u2u.xyz', _RPC_URLS[exports.ChainId.SCROLL_TESTNET] = 'https://scroll-sepolia.chainstacklabs.com', _RPC_URLS[exports.ChainId.ARBITRUM_MAINNET] = 'https://arbitrum.llamarpc.com', _RPC_URLS[exports.ChainId.OP_MAINNET] = 'https://optimism.llamarpc.com', _RPC_URLS[exports.ChainId.BOBA_MAINNET] = 'https://mainnet.boba.network', _RPC_URLS[exports.ChainId.BERA_MAINNET] = 'https://berachain.blockpi.network/v1/rpc/public', _RPC_URLS);
(function (Field) {
  Field["CURRENCY_A"] = "CURRENCY_A";
  Field["CURRENCY_B"] = "CURRENCY_B";
  Field["LIQUIDITY_PERCENT"] = "LIQUIDITY_PERCENT";
  Field["LIQUIDITY"] = "LIQUIDITY";
})(exports.Field || (exports.Field = {}));
(function (ApprovalState) {
  ApprovalState[ApprovalState["UNKNOWN"] = 0] = "UNKNOWN";
  ApprovalState[ApprovalState["NOT_APPROVED"] = 1] = "NOT_APPROVED";
  ApprovalState[ApprovalState["PENDING"] = 2] = "PENDING";
  ApprovalState[ApprovalState["APPROVED"] = 3] = "APPROVED";
})(exports.ApprovalState || (exports.ApprovalState = {}));
var DAI = new Token(exports.ChainId.MAINNET, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 'DAI', 'Dai Stablecoin');
var USDC = new Token(exports.ChainId.MAINNET, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USD//C');
var USDT = new Token(exports.ChainId.MAINNET, '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6, 'USDT', 'Tether USD');
var WBTC = new Token(exports.ChainId.MAINNET, '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', 8, 'WBTC', 'Wrapped BTC');
var BASE_USDC = new Token(exports.ChainId.BASE_SEPOLIA, '0x036CbD53842c5426634e7929541eC2318f3dCF7e', 6, 'USDC', 'USDC');
var UNICHAIN_USDC = new Token(exports.ChainId.UNICHAIN_SEPOLIA, '0x8Aca9B80b6752Ec62e06eC48E07a301e97852dAA', 18, 'USDC', 'USDC');
var METIS_USDC = new Token(exports.ChainId.METIS_MAINNET, '0xEA32A96608495e54156Ae48931A7c20f0dcc1a21', 6, 'USDC', 'USDC');
var PINNED_PAIRS = (_PINNED_PAIRS = {}, _PINNED_PAIRS[exports.ChainId.MAINNET] = [[new Token(exports.ChainId.MAINNET, '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643', 8, 'cDAI', 'Compound Dai'), new Token(exports.ChainId.MAINNET, '0x39AA39c021dfbaE8faC545936693aC917d5E7563', 8, 'cUSDC', 'Compound USD Coin')], [USDC, USDT], [DAI, USDT]], _PINNED_PAIRS);
var WETH_ONLY = (_WETH_ONLY = {}, _WETH_ONLY[exports.ChainId.MAINNET] = [WETH[exports.ChainId.MAINNET]], _WETH_ONLY[exports.ChainId.SEPOLIA] = [WETH[exports.ChainId.SEPOLIA]], _WETH_ONLY[exports.ChainId.SN_MAIN] = [WETH[exports.ChainId.SN_MAIN]], _WETH_ONLY[exports.ChainId.SN_SEPOLIA] = [WETH[exports.ChainId.SN_SEPOLIA]], _WETH_ONLY[exports.ChainId.BSC_TESTNET] = [WETH[exports.ChainId.BSC_TESTNET]], _WETH_ONLY[exports.ChainId.VICTION_TESTNET] = [WETH[exports.ChainId.VICTION_TESTNET]], _WETH_ONLY[exports.ChainId.VICTION_MAINNET] = [WETH[exports.ChainId.VICTION_MAINNET]], _WETH_ONLY[exports.ChainId.SONIC_TESTNET] = [WETH[exports.ChainId.SONIC_TESTNET]], _WETH_ONLY[exports.ChainId.MINATO_SONEIUM] = [WETH[exports.ChainId.MINATO_SONEIUM]], _WETH_ONLY[exports.ChainId.BASE_SEPOLIA] = [WETH[exports.ChainId.BASE_SEPOLIA]], _WETH_ONLY[exports.ChainId.UNICHAIN_SEPOLIA] = [WETH[exports.ChainId.UNICHAIN_SEPOLIA]], _WETH_ONLY[exports.ChainId.AURORA_TESTNET] = [WETH[exports.ChainId.AURORA_TESTNET]], _WETH_ONLY[exports.ChainId.METIS_MAINNET] = [WETH[exports.ChainId.METIS_MAINNET]], _WETH_ONLY[exports.ChainId.TAIKO_TESTNET] = [WETH[exports.ChainId.TAIKO_TESTNET]], _WETH_ONLY[exports.ChainId.BOBA_TESTNET] = [WETH[exports.ChainId.BOBA_TESTNET]], _WETH_ONLY[exports.ChainId.NEOX_MAINNET] = [WETH[exports.ChainId.NEOX_MAINNET]], _WETH_ONLY[exports.ChainId.U2U_MAINNET] = [WETH[exports.ChainId.U2U_MAINNET]], _WETH_ONLY[exports.ChainId.SCROLL_TESTNET] = [WETH[exports.ChainId.SCROLL_TESTNET]], _WETH_ONLY[exports.ChainId.ARBITRUM_MAINNET] = [WETH[exports.ChainId.ARBITRUM_MAINNET]], _WETH_ONLY[exports.ChainId.OP_MAINNET] = [WETH[exports.ChainId.OP_MAINNET]], _WETH_ONLY[exports.ChainId.BOBA_MAINNET] = [WETH[exports.ChainId.BOBA_MAINNET]], _WETH_ONLY[exports.ChainId.BERA_MAINNET] = [WETH[exports.ChainId.BERA_MAINNET]], _WETH_ONLY);
var BASES_TO_TRACK_LIQUIDITY_FOR = _extends({}, WETH_ONLY, (_extends2 = {}, _extends2[exports.ChainId.MAINNET] = [].concat(WETH_ONLY[exports.ChainId.MAINNET], [DAI, USDC, USDT, WBTC]), _extends2));

var _nodeResolve_empty = {};

var _nodeResolve_empty$1 = {
  __proto__: null,
  'default': _nodeResolve_empty
};

var require$$0 = getCjsExportFromNamespace(_nodeResolve_empty$1);

var bn = createCommonjsModule(function (module) {
(function (module, exports) {

  // Utils
  function assert (val, msg) {
    if (!val) throw new Error(msg || 'Assertion failed');
  }

  // Could use `inherits` module, but don't want to move from single file
  // architecture yet.
  function inherits (ctor, superCtor) {
    ctor.super_ = superCtor;
    var TempCtor = function () {};
    TempCtor.prototype = superCtor.prototype;
    ctor.prototype = new TempCtor();
    ctor.prototype.constructor = ctor;
  }

  // BN

  function BN (number, base, endian) {
    if (BN.isBN(number)) {
      return number;
    }

    this.negative = 0;
    this.words = null;
    this.length = 0;

    // Reduction context
    this.red = null;

    if (number !== null) {
      if (base === 'le' || base === 'be') {
        endian = base;
        base = 10;
      }

      this._init(number || 0, base || 10, endian || 'be');
    }
  }
  if (typeof module === 'object') {
    module.exports = BN;
  } else {
    exports.BN = BN;
  }

  BN.BN = BN;
  BN.wordSize = 26;

  var Buffer;
  try {
    if (typeof window !== 'undefined' && typeof window.Buffer !== 'undefined') {
      Buffer = window.Buffer;
    } else {
      Buffer = require$$0.Buffer;
    }
  } catch (e) {
  }

  BN.isBN = function isBN (num) {
    if (num instanceof BN) {
      return true;
    }

    return num !== null && typeof num === 'object' &&
      num.constructor.wordSize === BN.wordSize && Array.isArray(num.words);
  };

  BN.max = function max (left, right) {
    if (left.cmp(right) > 0) return left;
    return right;
  };

  BN.min = function min (left, right) {
    if (left.cmp(right) < 0) return left;
    return right;
  };

  BN.prototype._init = function init (number, base, endian) {
    if (typeof number === 'number') {
      return this._initNumber(number, base, endian);
    }

    if (typeof number === 'object') {
      return this._initArray(number, base, endian);
    }

    if (base === 'hex') {
      base = 16;
    }
    assert(base === (base | 0) && base >= 2 && base <= 36);

    number = number.toString().replace(/\s+/g, '');
    var start = 0;
    if (number[0] === '-') {
      start++;
      this.negative = 1;
    }

    if (start < number.length) {
      if (base === 16) {
        this._parseHex(number, start, endian);
      } else {
        this._parseBase(number, base, start);
        if (endian === 'le') {
          this._initArray(this.toArray(), base, endian);
        }
      }
    }
  };

  BN.prototype._initNumber = function _initNumber (number, base, endian) {
    if (number < 0) {
      this.negative = 1;
      number = -number;
    }
    if (number < 0x4000000) {
      this.words = [number & 0x3ffffff];
      this.length = 1;
    } else if (number < 0x10000000000000) {
      this.words = [
        number & 0x3ffffff,
        (number / 0x4000000) & 0x3ffffff
      ];
      this.length = 2;
    } else {
      assert(number < 0x20000000000000); // 2 ^ 53 (unsafe)
      this.words = [
        number & 0x3ffffff,
        (number / 0x4000000) & 0x3ffffff,
        1
      ];
      this.length = 3;
    }

    if (endian !== 'le') return;

    // Reverse the bytes
    this._initArray(this.toArray(), base, endian);
  };

  BN.prototype._initArray = function _initArray (number, base, endian) {
    // Perhaps a Uint8Array
    assert(typeof number.length === 'number');
    if (number.length <= 0) {
      this.words = [0];
      this.length = 1;
      return this;
    }

    this.length = Math.ceil(number.length / 3);
    this.words = new Array(this.length);
    for (var i = 0; i < this.length; i++) {
      this.words[i] = 0;
    }

    var j, w;
    var off = 0;
    if (endian === 'be') {
      for (i = number.length - 1, j = 0; i >= 0; i -= 3) {
        w = number[i] | (number[i - 1] << 8) | (number[i - 2] << 16);
        this.words[j] |= (w << off) & 0x3ffffff;
        this.words[j + 1] = (w >>> (26 - off)) & 0x3ffffff;
        off += 24;
        if (off >= 26) {
          off -= 26;
          j++;
        }
      }
    } else if (endian === 'le') {
      for (i = 0, j = 0; i < number.length; i += 3) {
        w = number[i] | (number[i + 1] << 8) | (number[i + 2] << 16);
        this.words[j] |= (w << off) & 0x3ffffff;
        this.words[j + 1] = (w >>> (26 - off)) & 0x3ffffff;
        off += 24;
        if (off >= 26) {
          off -= 26;
          j++;
        }
      }
    }
    return this._strip();
  };

  function parseHex4Bits (string, index) {
    var c = string.charCodeAt(index);
    // '0' - '9'
    if (c >= 48 && c <= 57) {
      return c - 48;
    // 'A' - 'F'
    } else if (c >= 65 && c <= 70) {
      return c - 55;
    // 'a' - 'f'
    } else if (c >= 97 && c <= 102) {
      return c - 87;
    } else {
      assert(false, 'Invalid character in ' + string);
    }
  }

  function parseHexByte (string, lowerBound, index) {
    var r = parseHex4Bits(string, index);
    if (index - 1 >= lowerBound) {
      r |= parseHex4Bits(string, index - 1) << 4;
    }
    return r;
  }

  BN.prototype._parseHex = function _parseHex (number, start, endian) {
    // Create possibly bigger array to ensure that it fits the number
    this.length = Math.ceil((number.length - start) / 6);
    this.words = new Array(this.length);
    for (var i = 0; i < this.length; i++) {
      this.words[i] = 0;
    }

    // 24-bits chunks
    var off = 0;
    var j = 0;

    var w;
    if (endian === 'be') {
      for (i = number.length - 1; i >= start; i -= 2) {
        w = parseHexByte(number, start, i) << off;
        this.words[j] |= w & 0x3ffffff;
        if (off >= 18) {
          off -= 18;
          j += 1;
          this.words[j] |= w >>> 26;
        } else {
          off += 8;
        }
      }
    } else {
      var parseLength = number.length - start;
      for (i = parseLength % 2 === 0 ? start + 1 : start; i < number.length; i += 2) {
        w = parseHexByte(number, start, i) << off;
        this.words[j] |= w & 0x3ffffff;
        if (off >= 18) {
          off -= 18;
          j += 1;
          this.words[j] |= w >>> 26;
        } else {
          off += 8;
        }
      }
    }

    this._strip();
  };

  function parseBase (str, start, end, mul) {
    var r = 0;
    var b = 0;
    var len = Math.min(str.length, end);
    for (var i = start; i < len; i++) {
      var c = str.charCodeAt(i) - 48;

      r *= mul;

      // 'a'
      if (c >= 49) {
        b = c - 49 + 0xa;

      // 'A'
      } else if (c >= 17) {
        b = c - 17 + 0xa;

      // '0' - '9'
      } else {
        b = c;
      }
      assert(c >= 0 && b < mul, 'Invalid character');
      r += b;
    }
    return r;
  }

  BN.prototype._parseBase = function _parseBase (number, base, start) {
    // Initialize as zero
    this.words = [0];
    this.length = 1;

    // Find length of limb in base
    for (var limbLen = 0, limbPow = 1; limbPow <= 0x3ffffff; limbPow *= base) {
      limbLen++;
    }
    limbLen--;
    limbPow = (limbPow / base) | 0;

    var total = number.length - start;
    var mod = total % limbLen;
    var end = Math.min(total, total - mod) + start;

    var word = 0;
    for (var i = start; i < end; i += limbLen) {
      word = parseBase(number, i, i + limbLen, base);

      this.imuln(limbPow);
      if (this.words[0] + word < 0x4000000) {
        this.words[0] += word;
      } else {
        this._iaddn(word);
      }
    }

    if (mod !== 0) {
      var pow = 1;
      word = parseBase(number, i, number.length, base);

      for (i = 0; i < mod; i++) {
        pow *= base;
      }

      this.imuln(pow);
      if (this.words[0] + word < 0x4000000) {
        this.words[0] += word;
      } else {
        this._iaddn(word);
      }
    }

    this._strip();
  };

  BN.prototype.copy = function copy (dest) {
    dest.words = new Array(this.length);
    for (var i = 0; i < this.length; i++) {
      dest.words[i] = this.words[i];
    }
    dest.length = this.length;
    dest.negative = this.negative;
    dest.red = this.red;
  };

  function move (dest, src) {
    dest.words = src.words;
    dest.length = src.length;
    dest.negative = src.negative;
    dest.red = src.red;
  }

  BN.prototype._move = function _move (dest) {
    move(dest, this);
  };

  BN.prototype.clone = function clone () {
    var r = new BN(null);
    this.copy(r);
    return r;
  };

  BN.prototype._expand = function _expand (size) {
    while (this.length < size) {
      this.words[this.length++] = 0;
    }
    return this;
  };

  // Remove leading `0` from `this`
  BN.prototype._strip = function strip () {
    while (this.length > 1 && this.words[this.length - 1] === 0) {
      this.length--;
    }
    return this._normSign();
  };

  BN.prototype._normSign = function _normSign () {
    // -0 = 0
    if (this.length === 1 && this.words[0] === 0) {
      this.negative = 0;
    }
    return this;
  };

  // Check Symbol.for because not everywhere where Symbol defined
  // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol#Browser_compatibility
  if (typeof Symbol !== 'undefined' && typeof Symbol.for === 'function') {
    try {
      BN.prototype[Symbol.for('nodejs.util.inspect.custom')] = inspect;
    } catch (e) {
      BN.prototype.inspect = inspect;
    }
  } else {
    BN.prototype.inspect = inspect;
  }

  function inspect () {
    return (this.red ? '<BN-R: ' : '<BN: ') + this.toString(16) + '>';
  }

  /*

  var zeros = [];
  var groupSizes = [];
  var groupBases = [];

  var s = '';
  var i = -1;
  while (++i < BN.wordSize) {
    zeros[i] = s;
    s += '0';
  }
  groupSizes[0] = 0;
  groupSizes[1] = 0;
  groupBases[0] = 0;
  groupBases[1] = 0;
  var base = 2 - 1;
  while (++base < 36 + 1) {
    var groupSize = 0;
    var groupBase = 1;
    while (groupBase < (1 << BN.wordSize) / base) {
      groupBase *= base;
      groupSize += 1;
    }
    groupSizes[base] = groupSize;
    groupBases[base] = groupBase;
  }

  */

  var zeros = [
    '',
    '0',
    '00',
    '000',
    '0000',
    '00000',
    '000000',
    '0000000',
    '00000000',
    '000000000',
    '0000000000',
    '00000000000',
    '000000000000',
    '0000000000000',
    '00000000000000',
    '000000000000000',
    '0000000000000000',
    '00000000000000000',
    '000000000000000000',
    '0000000000000000000',
    '00000000000000000000',
    '000000000000000000000',
    '0000000000000000000000',
    '00000000000000000000000',
    '000000000000000000000000',
    '0000000000000000000000000'
  ];

  var groupSizes = [
    0, 0,
    25, 16, 12, 11, 10, 9, 8,
    8, 7, 7, 7, 7, 6, 6,
    6, 6, 6, 6, 6, 5, 5,
    5, 5, 5, 5, 5, 5, 5,
    5, 5, 5, 5, 5, 5, 5
  ];

  var groupBases = [
    0, 0,
    33554432, 43046721, 16777216, 48828125, 60466176, 40353607, 16777216,
    43046721, 10000000, 19487171, 35831808, 62748517, 7529536, 11390625,
    16777216, 24137569, 34012224, 47045881, 64000000, 4084101, 5153632,
    6436343, 7962624, 9765625, 11881376, 14348907, 17210368, 20511149,
    24300000, 28629151, 33554432, 39135393, 45435424, 52521875, 60466176
  ];

  BN.prototype.toString = function toString (base, padding) {
    base = base || 10;
    padding = padding | 0 || 1;

    var out;
    if (base === 16 || base === 'hex') {
      out = '';
      var off = 0;
      var carry = 0;
      for (var i = 0; i < this.length; i++) {
        var w = this.words[i];
        var word = (((w << off) | carry) & 0xffffff).toString(16);
        carry = (w >>> (24 - off)) & 0xffffff;
        off += 2;
        if (off >= 26) {
          off -= 26;
          i--;
        }
        if (carry !== 0 || i !== this.length - 1) {
          out = zeros[6 - word.length] + word + out;
        } else {
          out = word + out;
        }
      }
      if (carry !== 0) {
        out = carry.toString(16) + out;
      }
      while (out.length % padding !== 0) {
        out = '0' + out;
      }
      if (this.negative !== 0) {
        out = '-' + out;
      }
      return out;
    }

    if (base === (base | 0) && base >= 2 && base <= 36) {
      // var groupSize = Math.floor(BN.wordSize * Math.LN2 / Math.log(base));
      var groupSize = groupSizes[base];
      // var groupBase = Math.pow(base, groupSize);
      var groupBase = groupBases[base];
      out = '';
      var c = this.clone();
      c.negative = 0;
      while (!c.isZero()) {
        var r = c.modrn(groupBase).toString(base);
        c = c.idivn(groupBase);

        if (!c.isZero()) {
          out = zeros[groupSize - r.length] + r + out;
        } else {
          out = r + out;
        }
      }
      if (this.isZero()) {
        out = '0' + out;
      }
      while (out.length % padding !== 0) {
        out = '0' + out;
      }
      if (this.negative !== 0) {
        out = '-' + out;
      }
      return out;
    }

    assert(false, 'Base should be between 2 and 36');
  };

  BN.prototype.toNumber = function toNumber () {
    var ret = this.words[0];
    if (this.length === 2) {
      ret += this.words[1] * 0x4000000;
    } else if (this.length === 3 && this.words[2] === 0x01) {
      // NOTE: at this stage it is known that the top bit is set
      ret += 0x10000000000000 + (this.words[1] * 0x4000000);
    } else if (this.length > 2) {
      assert(false, 'Number can only safely store up to 53 bits');
    }
    return (this.negative !== 0) ? -ret : ret;
  };

  BN.prototype.toJSON = function toJSON () {
    return this.toString(16, 2);
  };

  if (Buffer) {
    BN.prototype.toBuffer = function toBuffer (endian, length) {
      return this.toArrayLike(Buffer, endian, length);
    };
  }

  BN.prototype.toArray = function toArray (endian, length) {
    return this.toArrayLike(Array, endian, length);
  };

  var allocate = function allocate (ArrayType, size) {
    if (ArrayType.allocUnsafe) {
      return ArrayType.allocUnsafe(size);
    }
    return new ArrayType(size);
  };

  BN.prototype.toArrayLike = function toArrayLike (ArrayType, endian, length) {
    this._strip();

    var byteLength = this.byteLength();
    var reqLength = length || Math.max(1, byteLength);
    assert(byteLength <= reqLength, 'byte array longer than desired length');
    assert(reqLength > 0, 'Requested array length <= 0');

    var res = allocate(ArrayType, reqLength);
    var postfix = endian === 'le' ? 'LE' : 'BE';
    this['_toArrayLike' + postfix](res, byteLength);
    return res;
  };

  BN.prototype._toArrayLikeLE = function _toArrayLikeLE (res, byteLength) {
    var position = 0;
    var carry = 0;

    for (var i = 0, shift = 0; i < this.length; i++) {
      var word = (this.words[i] << shift) | carry;

      res[position++] = word & 0xff;
      if (position < res.length) {
        res[position++] = (word >> 8) & 0xff;
      }
      if (position < res.length) {
        res[position++] = (word >> 16) & 0xff;
      }

      if (shift === 6) {
        if (position < res.length) {
          res[position++] = (word >> 24) & 0xff;
        }
        carry = 0;
        shift = 0;
      } else {
        carry = word >>> 24;
        shift += 2;
      }
    }

    if (position < res.length) {
      res[position++] = carry;

      while (position < res.length) {
        res[position++] = 0;
      }
    }
  };

  BN.prototype._toArrayLikeBE = function _toArrayLikeBE (res, byteLength) {
    var position = res.length - 1;
    var carry = 0;

    for (var i = 0, shift = 0; i < this.length; i++) {
      var word = (this.words[i] << shift) | carry;

      res[position--] = word & 0xff;
      if (position >= 0) {
        res[position--] = (word >> 8) & 0xff;
      }
      if (position >= 0) {
        res[position--] = (word >> 16) & 0xff;
      }

      if (shift === 6) {
        if (position >= 0) {
          res[position--] = (word >> 24) & 0xff;
        }
        carry = 0;
        shift = 0;
      } else {
        carry = word >>> 24;
        shift += 2;
      }
    }

    if (position >= 0) {
      res[position--] = carry;

      while (position >= 0) {
        res[position--] = 0;
      }
    }
  };

  if (Math.clz32) {
    BN.prototype._countBits = function _countBits (w) {
      return 32 - Math.clz32(w);
    };
  } else {
    BN.prototype._countBits = function _countBits (w) {
      var t = w;
      var r = 0;
      if (t >= 0x1000) {
        r += 13;
        t >>>= 13;
      }
      if (t >= 0x40) {
        r += 7;
        t >>>= 7;
      }
      if (t >= 0x8) {
        r += 4;
        t >>>= 4;
      }
      if (t >= 0x02) {
        r += 2;
        t >>>= 2;
      }
      return r + t;
    };
  }

  BN.prototype._zeroBits = function _zeroBits (w) {
    // Short-cut
    if (w === 0) return 26;

    var t = w;
    var r = 0;
    if ((t & 0x1fff) === 0) {
      r += 13;
      t >>>= 13;
    }
    if ((t & 0x7f) === 0) {
      r += 7;
      t >>>= 7;
    }
    if ((t & 0xf) === 0) {
      r += 4;
      t >>>= 4;
    }
    if ((t & 0x3) === 0) {
      r += 2;
      t >>>= 2;
    }
    if ((t & 0x1) === 0) {
      r++;
    }
    return r;
  };

  // Return number of used bits in a BN
  BN.prototype.bitLength = function bitLength () {
    var w = this.words[this.length - 1];
    var hi = this._countBits(w);
    return (this.length - 1) * 26 + hi;
  };

  function toBitArray (num) {
    var w = new Array(num.bitLength());

    for (var bit = 0; bit < w.length; bit++) {
      var off = (bit / 26) | 0;
      var wbit = bit % 26;

      w[bit] = (num.words[off] >>> wbit) & 0x01;
    }

    return w;
  }

  // Number of trailing zero bits
  BN.prototype.zeroBits = function zeroBits () {
    if (this.isZero()) return 0;

    var r = 0;
    for (var i = 0; i < this.length; i++) {
      var b = this._zeroBits(this.words[i]);
      r += b;
      if (b !== 26) break;
    }
    return r;
  };

  BN.prototype.byteLength = function byteLength () {
    return Math.ceil(this.bitLength() / 8);
  };

  BN.prototype.toTwos = function toTwos (width) {
    if (this.negative !== 0) {
      return this.abs().inotn(width).iaddn(1);
    }
    return this.clone();
  };

  BN.prototype.fromTwos = function fromTwos (width) {
    if (this.testn(width - 1)) {
      return this.notn(width).iaddn(1).ineg();
    }
    return this.clone();
  };

  BN.prototype.isNeg = function isNeg () {
    return this.negative !== 0;
  };

  // Return negative clone of `this`
  BN.prototype.neg = function neg () {
    return this.clone().ineg();
  };

  BN.prototype.ineg = function ineg () {
    if (!this.isZero()) {
      this.negative ^= 1;
    }

    return this;
  };

  // Or `num` with `this` in-place
  BN.prototype.iuor = function iuor (num) {
    while (this.length < num.length) {
      this.words[this.length++] = 0;
    }

    for (var i = 0; i < num.length; i++) {
      this.words[i] = this.words[i] | num.words[i];
    }

    return this._strip();
  };

  BN.prototype.ior = function ior (num) {
    assert((this.negative | num.negative) === 0);
    return this.iuor(num);
  };

  // Or `num` with `this`
  BN.prototype.or = function or (num) {
    if (this.length > num.length) return this.clone().ior(num);
    return num.clone().ior(this);
  };

  BN.prototype.uor = function uor (num) {
    if (this.length > num.length) return this.clone().iuor(num);
    return num.clone().iuor(this);
  };

  // And `num` with `this` in-place
  BN.prototype.iuand = function iuand (num) {
    // b = min-length(num, this)
    var b;
    if (this.length > num.length) {
      b = num;
    } else {
      b = this;
    }

    for (var i = 0; i < b.length; i++) {
      this.words[i] = this.words[i] & num.words[i];
    }

    this.length = b.length;

    return this._strip();
  };

  BN.prototype.iand = function iand (num) {
    assert((this.negative | num.negative) === 0);
    return this.iuand(num);
  };

  // And `num` with `this`
  BN.prototype.and = function and (num) {
    if (this.length > num.length) return this.clone().iand(num);
    return num.clone().iand(this);
  };

  BN.prototype.uand = function uand (num) {
    if (this.length > num.length) return this.clone().iuand(num);
    return num.clone().iuand(this);
  };

  // Xor `num` with `this` in-place
  BN.prototype.iuxor = function iuxor (num) {
    // a.length > b.length
    var a;
    var b;
    if (this.length > num.length) {
      a = this;
      b = num;
    } else {
      a = num;
      b = this;
    }

    for (var i = 0; i < b.length; i++) {
      this.words[i] = a.words[i] ^ b.words[i];
    }

    if (this !== a) {
      for (; i < a.length; i++) {
        this.words[i] = a.words[i];
      }
    }

    this.length = a.length;

    return this._strip();
  };

  BN.prototype.ixor = function ixor (num) {
    assert((this.negative | num.negative) === 0);
    return this.iuxor(num);
  };

  // Xor `num` with `this`
  BN.prototype.xor = function xor (num) {
    if (this.length > num.length) return this.clone().ixor(num);
    return num.clone().ixor(this);
  };

  BN.prototype.uxor = function uxor (num) {
    if (this.length > num.length) return this.clone().iuxor(num);
    return num.clone().iuxor(this);
  };

  // Not ``this`` with ``width`` bitwidth
  BN.prototype.inotn = function inotn (width) {
    assert(typeof width === 'number' && width >= 0);

    var bytesNeeded = Math.ceil(width / 26) | 0;
    var bitsLeft = width % 26;

    // Extend the buffer with leading zeroes
    this._expand(bytesNeeded);

    if (bitsLeft > 0) {
      bytesNeeded--;
    }

    // Handle complete words
    for (var i = 0; i < bytesNeeded; i++) {
      this.words[i] = ~this.words[i] & 0x3ffffff;
    }

    // Handle the residue
    if (bitsLeft > 0) {
      this.words[i] = ~this.words[i] & (0x3ffffff >> (26 - bitsLeft));
    }

    // And remove leading zeroes
    return this._strip();
  };

  BN.prototype.notn = function notn (width) {
    return this.clone().inotn(width);
  };

  // Set `bit` of `this`
  BN.prototype.setn = function setn (bit, val) {
    assert(typeof bit === 'number' && bit >= 0);

    var off = (bit / 26) | 0;
    var wbit = bit % 26;

    this._expand(off + 1);

    if (val) {
      this.words[off] = this.words[off] | (1 << wbit);
    } else {
      this.words[off] = this.words[off] & ~(1 << wbit);
    }

    return this._strip();
  };

  // Add `num` to `this` in-place
  BN.prototype.iadd = function iadd (num) {
    var r;

    // negative + positive
    if (this.negative !== 0 && num.negative === 0) {
      this.negative = 0;
      r = this.isub(num);
      this.negative ^= 1;
      return this._normSign();

    // positive + negative
    } else if (this.negative === 0 && num.negative !== 0) {
      num.negative = 0;
      r = this.isub(num);
      num.negative = 1;
      return r._normSign();
    }

    // a.length > b.length
    var a, b;
    if (this.length > num.length) {
      a = this;
      b = num;
    } else {
      a = num;
      b = this;
    }

    var carry = 0;
    for (var i = 0; i < b.length; i++) {
      r = (a.words[i] | 0) + (b.words[i] | 0) + carry;
      this.words[i] = r & 0x3ffffff;
      carry = r >>> 26;
    }
    for (; carry !== 0 && i < a.length; i++) {
      r = (a.words[i] | 0) + carry;
      this.words[i] = r & 0x3ffffff;
      carry = r >>> 26;
    }

    this.length = a.length;
    if (carry !== 0) {
      this.words[this.length] = carry;
      this.length++;
    // Copy the rest of the words
    } else if (a !== this) {
      for (; i < a.length; i++) {
        this.words[i] = a.words[i];
      }
    }

    return this;
  };

  // Add `num` to `this`
  BN.prototype.add = function add (num) {
    var res;
    if (num.negative !== 0 && this.negative === 0) {
      num.negative = 0;
      res = this.sub(num);
      num.negative ^= 1;
      return res;
    } else if (num.negative === 0 && this.negative !== 0) {
      this.negative = 0;
      res = num.sub(this);
      this.negative = 1;
      return res;
    }

    if (this.length > num.length) return this.clone().iadd(num);

    return num.clone().iadd(this);
  };

  // Subtract `num` from `this` in-place
  BN.prototype.isub = function isub (num) {
    // this - (-num) = this + num
    if (num.negative !== 0) {
      num.negative = 0;
      var r = this.iadd(num);
      num.negative = 1;
      return r._normSign();

    // -this - num = -(this + num)
    } else if (this.negative !== 0) {
      this.negative = 0;
      this.iadd(num);
      this.negative = 1;
      return this._normSign();
    }

    // At this point both numbers are positive
    var cmp = this.cmp(num);

    // Optimization - zeroify
    if (cmp === 0) {
      this.negative = 0;
      this.length = 1;
      this.words[0] = 0;
      return this;
    }

    // a > b
    var a, b;
    if (cmp > 0) {
      a = this;
      b = num;
    } else {
      a = num;
      b = this;
    }

    var carry = 0;
    for (var i = 0; i < b.length; i++) {
      r = (a.words[i] | 0) - (b.words[i] | 0) + carry;
      carry = r >> 26;
      this.words[i] = r & 0x3ffffff;
    }
    for (; carry !== 0 && i < a.length; i++) {
      r = (a.words[i] | 0) + carry;
      carry = r >> 26;
      this.words[i] = r & 0x3ffffff;
    }

    // Copy rest of the words
    if (carry === 0 && i < a.length && a !== this) {
      for (; i < a.length; i++) {
        this.words[i] = a.words[i];
      }
    }

    this.length = Math.max(this.length, i);

    if (a !== this) {
      this.negative = 1;
    }

    return this._strip();
  };

  // Subtract `num` from `this`
  BN.prototype.sub = function sub (num) {
    return this.clone().isub(num);
  };

  function smallMulTo (self, num, out) {
    out.negative = num.negative ^ self.negative;
    var len = (self.length + num.length) | 0;
    out.length = len;
    len = (len - 1) | 0;

    // Peel one iteration (compiler can't do it, because of code complexity)
    var a = self.words[0] | 0;
    var b = num.words[0] | 0;
    var r = a * b;

    var lo = r & 0x3ffffff;
    var carry = (r / 0x4000000) | 0;
    out.words[0] = lo;

    for (var k = 1; k < len; k++) {
      // Sum all words with the same `i + j = k` and accumulate `ncarry`,
      // note that ncarry could be >= 0x3ffffff
      var ncarry = carry >>> 26;
      var rword = carry & 0x3ffffff;
      var maxJ = Math.min(k, num.length - 1);
      for (var j = Math.max(0, k - self.length + 1); j <= maxJ; j++) {
        var i = (k - j) | 0;
        a = self.words[i] | 0;
        b = num.words[j] | 0;
        r = a * b + rword;
        ncarry += (r / 0x4000000) | 0;
        rword = r & 0x3ffffff;
      }
      out.words[k] = rword | 0;
      carry = ncarry | 0;
    }
    if (carry !== 0) {
      out.words[k] = carry | 0;
    } else {
      out.length--;
    }

    return out._strip();
  }

  // TODO(indutny): it may be reasonable to omit it for users who don't need
  // to work with 256-bit numbers, otherwise it gives 20% improvement for 256-bit
  // multiplication (like elliptic secp256k1).
  var comb10MulTo = function comb10MulTo (self, num, out) {
    var a = self.words;
    var b = num.words;
    var o = out.words;
    var c = 0;
    var lo;
    var mid;
    var hi;
    var a0 = a[0] | 0;
    var al0 = a0 & 0x1fff;
    var ah0 = a0 >>> 13;
    var a1 = a[1] | 0;
    var al1 = a1 & 0x1fff;
    var ah1 = a1 >>> 13;
    var a2 = a[2] | 0;
    var al2 = a2 & 0x1fff;
    var ah2 = a2 >>> 13;
    var a3 = a[3] | 0;
    var al3 = a3 & 0x1fff;
    var ah3 = a3 >>> 13;
    var a4 = a[4] | 0;
    var al4 = a4 & 0x1fff;
    var ah4 = a4 >>> 13;
    var a5 = a[5] | 0;
    var al5 = a5 & 0x1fff;
    var ah5 = a5 >>> 13;
    var a6 = a[6] | 0;
    var al6 = a6 & 0x1fff;
    var ah6 = a6 >>> 13;
    var a7 = a[7] | 0;
    var al7 = a7 & 0x1fff;
    var ah7 = a7 >>> 13;
    var a8 = a[8] | 0;
    var al8 = a8 & 0x1fff;
    var ah8 = a8 >>> 13;
    var a9 = a[9] | 0;
    var al9 = a9 & 0x1fff;
    var ah9 = a9 >>> 13;
    var b0 = b[0] | 0;
    var bl0 = b0 & 0x1fff;
    var bh0 = b0 >>> 13;
    var b1 = b[1] | 0;
    var bl1 = b1 & 0x1fff;
    var bh1 = b1 >>> 13;
    var b2 = b[2] | 0;
    var bl2 = b2 & 0x1fff;
    var bh2 = b2 >>> 13;
    var b3 = b[3] | 0;
    var bl3 = b3 & 0x1fff;
    var bh3 = b3 >>> 13;
    var b4 = b[4] | 0;
    var bl4 = b4 & 0x1fff;
    var bh4 = b4 >>> 13;
    var b5 = b[5] | 0;
    var bl5 = b5 & 0x1fff;
    var bh5 = b5 >>> 13;
    var b6 = b[6] | 0;
    var bl6 = b6 & 0x1fff;
    var bh6 = b6 >>> 13;
    var b7 = b[7] | 0;
    var bl7 = b7 & 0x1fff;
    var bh7 = b7 >>> 13;
    var b8 = b[8] | 0;
    var bl8 = b8 & 0x1fff;
    var bh8 = b8 >>> 13;
    var b9 = b[9] | 0;
    var bl9 = b9 & 0x1fff;
    var bh9 = b9 >>> 13;

    out.negative = self.negative ^ num.negative;
    out.length = 19;
    /* k = 0 */
    lo = Math.imul(al0, bl0);
    mid = Math.imul(al0, bh0);
    mid = (mid + Math.imul(ah0, bl0)) | 0;
    hi = Math.imul(ah0, bh0);
    var w0 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w0 >>> 26)) | 0;
    w0 &= 0x3ffffff;
    /* k = 1 */
    lo = Math.imul(al1, bl0);
    mid = Math.imul(al1, bh0);
    mid = (mid + Math.imul(ah1, bl0)) | 0;
    hi = Math.imul(ah1, bh0);
    lo = (lo + Math.imul(al0, bl1)) | 0;
    mid = (mid + Math.imul(al0, bh1)) | 0;
    mid = (mid + Math.imul(ah0, bl1)) | 0;
    hi = (hi + Math.imul(ah0, bh1)) | 0;
    var w1 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w1 >>> 26)) | 0;
    w1 &= 0x3ffffff;
    /* k = 2 */
    lo = Math.imul(al2, bl0);
    mid = Math.imul(al2, bh0);
    mid = (mid + Math.imul(ah2, bl0)) | 0;
    hi = Math.imul(ah2, bh0);
    lo = (lo + Math.imul(al1, bl1)) | 0;
    mid = (mid + Math.imul(al1, bh1)) | 0;
    mid = (mid + Math.imul(ah1, bl1)) | 0;
    hi = (hi + Math.imul(ah1, bh1)) | 0;
    lo = (lo + Math.imul(al0, bl2)) | 0;
    mid = (mid + Math.imul(al0, bh2)) | 0;
    mid = (mid + Math.imul(ah0, bl2)) | 0;
    hi = (hi + Math.imul(ah0, bh2)) | 0;
    var w2 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w2 >>> 26)) | 0;
    w2 &= 0x3ffffff;
    /* k = 3 */
    lo = Math.imul(al3, bl0);
    mid = Math.imul(al3, bh0);
    mid = (mid + Math.imul(ah3, bl0)) | 0;
    hi = Math.imul(ah3, bh0);
    lo = (lo + Math.imul(al2, bl1)) | 0;
    mid = (mid + Math.imul(al2, bh1)) | 0;
    mid = (mid + Math.imul(ah2, bl1)) | 0;
    hi = (hi + Math.imul(ah2, bh1)) | 0;
    lo = (lo + Math.imul(al1, bl2)) | 0;
    mid = (mid + Math.imul(al1, bh2)) | 0;
    mid = (mid + Math.imul(ah1, bl2)) | 0;
    hi = (hi + Math.imul(ah1, bh2)) | 0;
    lo = (lo + Math.imul(al0, bl3)) | 0;
    mid = (mid + Math.imul(al0, bh3)) | 0;
    mid = (mid + Math.imul(ah0, bl3)) | 0;
    hi = (hi + Math.imul(ah0, bh3)) | 0;
    var w3 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w3 >>> 26)) | 0;
    w3 &= 0x3ffffff;
    /* k = 4 */
    lo = Math.imul(al4, bl0);
    mid = Math.imul(al4, bh0);
    mid = (mid + Math.imul(ah4, bl0)) | 0;
    hi = Math.imul(ah4, bh0);
    lo = (lo + Math.imul(al3, bl1)) | 0;
    mid = (mid + Math.imul(al3, bh1)) | 0;
    mid = (mid + Math.imul(ah3, bl1)) | 0;
    hi = (hi + Math.imul(ah3, bh1)) | 0;
    lo = (lo + Math.imul(al2, bl2)) | 0;
    mid = (mid + Math.imul(al2, bh2)) | 0;
    mid = (mid + Math.imul(ah2, bl2)) | 0;
    hi = (hi + Math.imul(ah2, bh2)) | 0;
    lo = (lo + Math.imul(al1, bl3)) | 0;
    mid = (mid + Math.imul(al1, bh3)) | 0;
    mid = (mid + Math.imul(ah1, bl3)) | 0;
    hi = (hi + Math.imul(ah1, bh3)) | 0;
    lo = (lo + Math.imul(al0, bl4)) | 0;
    mid = (mid + Math.imul(al0, bh4)) | 0;
    mid = (mid + Math.imul(ah0, bl4)) | 0;
    hi = (hi + Math.imul(ah0, bh4)) | 0;
    var w4 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w4 >>> 26)) | 0;
    w4 &= 0x3ffffff;
    /* k = 5 */
    lo = Math.imul(al5, bl0);
    mid = Math.imul(al5, bh0);
    mid = (mid + Math.imul(ah5, bl0)) | 0;
    hi = Math.imul(ah5, bh0);
    lo = (lo + Math.imul(al4, bl1)) | 0;
    mid = (mid + Math.imul(al4, bh1)) | 0;
    mid = (mid + Math.imul(ah4, bl1)) | 0;
    hi = (hi + Math.imul(ah4, bh1)) | 0;
    lo = (lo + Math.imul(al3, bl2)) | 0;
    mid = (mid + Math.imul(al3, bh2)) | 0;
    mid = (mid + Math.imul(ah3, bl2)) | 0;
    hi = (hi + Math.imul(ah3, bh2)) | 0;
    lo = (lo + Math.imul(al2, bl3)) | 0;
    mid = (mid + Math.imul(al2, bh3)) | 0;
    mid = (mid + Math.imul(ah2, bl3)) | 0;
    hi = (hi + Math.imul(ah2, bh3)) | 0;
    lo = (lo + Math.imul(al1, bl4)) | 0;
    mid = (mid + Math.imul(al1, bh4)) | 0;
    mid = (mid + Math.imul(ah1, bl4)) | 0;
    hi = (hi + Math.imul(ah1, bh4)) | 0;
    lo = (lo + Math.imul(al0, bl5)) | 0;
    mid = (mid + Math.imul(al0, bh5)) | 0;
    mid = (mid + Math.imul(ah0, bl5)) | 0;
    hi = (hi + Math.imul(ah0, bh5)) | 0;
    var w5 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w5 >>> 26)) | 0;
    w5 &= 0x3ffffff;
    /* k = 6 */
    lo = Math.imul(al6, bl0);
    mid = Math.imul(al6, bh0);
    mid = (mid + Math.imul(ah6, bl0)) | 0;
    hi = Math.imul(ah6, bh0);
    lo = (lo + Math.imul(al5, bl1)) | 0;
    mid = (mid + Math.imul(al5, bh1)) | 0;
    mid = (mid + Math.imul(ah5, bl1)) | 0;
    hi = (hi + Math.imul(ah5, bh1)) | 0;
    lo = (lo + Math.imul(al4, bl2)) | 0;
    mid = (mid + Math.imul(al4, bh2)) | 0;
    mid = (mid + Math.imul(ah4, bl2)) | 0;
    hi = (hi + Math.imul(ah4, bh2)) | 0;
    lo = (lo + Math.imul(al3, bl3)) | 0;
    mid = (mid + Math.imul(al3, bh3)) | 0;
    mid = (mid + Math.imul(ah3, bl3)) | 0;
    hi = (hi + Math.imul(ah3, bh3)) | 0;
    lo = (lo + Math.imul(al2, bl4)) | 0;
    mid = (mid + Math.imul(al2, bh4)) | 0;
    mid = (mid + Math.imul(ah2, bl4)) | 0;
    hi = (hi + Math.imul(ah2, bh4)) | 0;
    lo = (lo + Math.imul(al1, bl5)) | 0;
    mid = (mid + Math.imul(al1, bh5)) | 0;
    mid = (mid + Math.imul(ah1, bl5)) | 0;
    hi = (hi + Math.imul(ah1, bh5)) | 0;
    lo = (lo + Math.imul(al0, bl6)) | 0;
    mid = (mid + Math.imul(al0, bh6)) | 0;
    mid = (mid + Math.imul(ah0, bl6)) | 0;
    hi = (hi + Math.imul(ah0, bh6)) | 0;
    var w6 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w6 >>> 26)) | 0;
    w6 &= 0x3ffffff;
    /* k = 7 */
    lo = Math.imul(al7, bl0);
    mid = Math.imul(al7, bh0);
    mid = (mid + Math.imul(ah7, bl0)) | 0;
    hi = Math.imul(ah7, bh0);
    lo = (lo + Math.imul(al6, bl1)) | 0;
    mid = (mid + Math.imul(al6, bh1)) | 0;
    mid = (mid + Math.imul(ah6, bl1)) | 0;
    hi = (hi + Math.imul(ah6, bh1)) | 0;
    lo = (lo + Math.imul(al5, bl2)) | 0;
    mid = (mid + Math.imul(al5, bh2)) | 0;
    mid = (mid + Math.imul(ah5, bl2)) | 0;
    hi = (hi + Math.imul(ah5, bh2)) | 0;
    lo = (lo + Math.imul(al4, bl3)) | 0;
    mid = (mid + Math.imul(al4, bh3)) | 0;
    mid = (mid + Math.imul(ah4, bl3)) | 0;
    hi = (hi + Math.imul(ah4, bh3)) | 0;
    lo = (lo + Math.imul(al3, bl4)) | 0;
    mid = (mid + Math.imul(al3, bh4)) | 0;
    mid = (mid + Math.imul(ah3, bl4)) | 0;
    hi = (hi + Math.imul(ah3, bh4)) | 0;
    lo = (lo + Math.imul(al2, bl5)) | 0;
    mid = (mid + Math.imul(al2, bh5)) | 0;
    mid = (mid + Math.imul(ah2, bl5)) | 0;
    hi = (hi + Math.imul(ah2, bh5)) | 0;
    lo = (lo + Math.imul(al1, bl6)) | 0;
    mid = (mid + Math.imul(al1, bh6)) | 0;
    mid = (mid + Math.imul(ah1, bl6)) | 0;
    hi = (hi + Math.imul(ah1, bh6)) | 0;
    lo = (lo + Math.imul(al0, bl7)) | 0;
    mid = (mid + Math.imul(al0, bh7)) | 0;
    mid = (mid + Math.imul(ah0, bl7)) | 0;
    hi = (hi + Math.imul(ah0, bh7)) | 0;
    var w7 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w7 >>> 26)) | 0;
    w7 &= 0x3ffffff;
    /* k = 8 */
    lo = Math.imul(al8, bl0);
    mid = Math.imul(al8, bh0);
    mid = (mid + Math.imul(ah8, bl0)) | 0;
    hi = Math.imul(ah8, bh0);
    lo = (lo + Math.imul(al7, bl1)) | 0;
    mid = (mid + Math.imul(al7, bh1)) | 0;
    mid = (mid + Math.imul(ah7, bl1)) | 0;
    hi = (hi + Math.imul(ah7, bh1)) | 0;
    lo = (lo + Math.imul(al6, bl2)) | 0;
    mid = (mid + Math.imul(al6, bh2)) | 0;
    mid = (mid + Math.imul(ah6, bl2)) | 0;
    hi = (hi + Math.imul(ah6, bh2)) | 0;
    lo = (lo + Math.imul(al5, bl3)) | 0;
    mid = (mid + Math.imul(al5, bh3)) | 0;
    mid = (mid + Math.imul(ah5, bl3)) | 0;
    hi = (hi + Math.imul(ah5, bh3)) | 0;
    lo = (lo + Math.imul(al4, bl4)) | 0;
    mid = (mid + Math.imul(al4, bh4)) | 0;
    mid = (mid + Math.imul(ah4, bl4)) | 0;
    hi = (hi + Math.imul(ah4, bh4)) | 0;
    lo = (lo + Math.imul(al3, bl5)) | 0;
    mid = (mid + Math.imul(al3, bh5)) | 0;
    mid = (mid + Math.imul(ah3, bl5)) | 0;
    hi = (hi + Math.imul(ah3, bh5)) | 0;
    lo = (lo + Math.imul(al2, bl6)) | 0;
    mid = (mid + Math.imul(al2, bh6)) | 0;
    mid = (mid + Math.imul(ah2, bl6)) | 0;
    hi = (hi + Math.imul(ah2, bh6)) | 0;
    lo = (lo + Math.imul(al1, bl7)) | 0;
    mid = (mid + Math.imul(al1, bh7)) | 0;
    mid = (mid + Math.imul(ah1, bl7)) | 0;
    hi = (hi + Math.imul(ah1, bh7)) | 0;
    lo = (lo + Math.imul(al0, bl8)) | 0;
    mid = (mid + Math.imul(al0, bh8)) | 0;
    mid = (mid + Math.imul(ah0, bl8)) | 0;
    hi = (hi + Math.imul(ah0, bh8)) | 0;
    var w8 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w8 >>> 26)) | 0;
    w8 &= 0x3ffffff;
    /* k = 9 */
    lo = Math.imul(al9, bl0);
    mid = Math.imul(al9, bh0);
    mid = (mid + Math.imul(ah9, bl0)) | 0;
    hi = Math.imul(ah9, bh0);
    lo = (lo + Math.imul(al8, bl1)) | 0;
    mid = (mid + Math.imul(al8, bh1)) | 0;
    mid = (mid + Math.imul(ah8, bl1)) | 0;
    hi = (hi + Math.imul(ah8, bh1)) | 0;
    lo = (lo + Math.imul(al7, bl2)) | 0;
    mid = (mid + Math.imul(al7, bh2)) | 0;
    mid = (mid + Math.imul(ah7, bl2)) | 0;
    hi = (hi + Math.imul(ah7, bh2)) | 0;
    lo = (lo + Math.imul(al6, bl3)) | 0;
    mid = (mid + Math.imul(al6, bh3)) | 0;
    mid = (mid + Math.imul(ah6, bl3)) | 0;
    hi = (hi + Math.imul(ah6, bh3)) | 0;
    lo = (lo + Math.imul(al5, bl4)) | 0;
    mid = (mid + Math.imul(al5, bh4)) | 0;
    mid = (mid + Math.imul(ah5, bl4)) | 0;
    hi = (hi + Math.imul(ah5, bh4)) | 0;
    lo = (lo + Math.imul(al4, bl5)) | 0;
    mid = (mid + Math.imul(al4, bh5)) | 0;
    mid = (mid + Math.imul(ah4, bl5)) | 0;
    hi = (hi + Math.imul(ah4, bh5)) | 0;
    lo = (lo + Math.imul(al3, bl6)) | 0;
    mid = (mid + Math.imul(al3, bh6)) | 0;
    mid = (mid + Math.imul(ah3, bl6)) | 0;
    hi = (hi + Math.imul(ah3, bh6)) | 0;
    lo = (lo + Math.imul(al2, bl7)) | 0;
    mid = (mid + Math.imul(al2, bh7)) | 0;
    mid = (mid + Math.imul(ah2, bl7)) | 0;
    hi = (hi + Math.imul(ah2, bh7)) | 0;
    lo = (lo + Math.imul(al1, bl8)) | 0;
    mid = (mid + Math.imul(al1, bh8)) | 0;
    mid = (mid + Math.imul(ah1, bl8)) | 0;
    hi = (hi + Math.imul(ah1, bh8)) | 0;
    lo = (lo + Math.imul(al0, bl9)) | 0;
    mid = (mid + Math.imul(al0, bh9)) | 0;
    mid = (mid + Math.imul(ah0, bl9)) | 0;
    hi = (hi + Math.imul(ah0, bh9)) | 0;
    var w9 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w9 >>> 26)) | 0;
    w9 &= 0x3ffffff;
    /* k = 10 */
    lo = Math.imul(al9, bl1);
    mid = Math.imul(al9, bh1);
    mid = (mid + Math.imul(ah9, bl1)) | 0;
    hi = Math.imul(ah9, bh1);
    lo = (lo + Math.imul(al8, bl2)) | 0;
    mid = (mid + Math.imul(al8, bh2)) | 0;
    mid = (mid + Math.imul(ah8, bl2)) | 0;
    hi = (hi + Math.imul(ah8, bh2)) | 0;
    lo = (lo + Math.imul(al7, bl3)) | 0;
    mid = (mid + Math.imul(al7, bh3)) | 0;
    mid = (mid + Math.imul(ah7, bl3)) | 0;
    hi = (hi + Math.imul(ah7, bh3)) | 0;
    lo = (lo + Math.imul(al6, bl4)) | 0;
    mid = (mid + Math.imul(al6, bh4)) | 0;
    mid = (mid + Math.imul(ah6, bl4)) | 0;
    hi = (hi + Math.imul(ah6, bh4)) | 0;
    lo = (lo + Math.imul(al5, bl5)) | 0;
    mid = (mid + Math.imul(al5, bh5)) | 0;
    mid = (mid + Math.imul(ah5, bl5)) | 0;
    hi = (hi + Math.imul(ah5, bh5)) | 0;
    lo = (lo + Math.imul(al4, bl6)) | 0;
    mid = (mid + Math.imul(al4, bh6)) | 0;
    mid = (mid + Math.imul(ah4, bl6)) | 0;
    hi = (hi + Math.imul(ah4, bh6)) | 0;
    lo = (lo + Math.imul(al3, bl7)) | 0;
    mid = (mid + Math.imul(al3, bh7)) | 0;
    mid = (mid + Math.imul(ah3, bl7)) | 0;
    hi = (hi + Math.imul(ah3, bh7)) | 0;
    lo = (lo + Math.imul(al2, bl8)) | 0;
    mid = (mid + Math.imul(al2, bh8)) | 0;
    mid = (mid + Math.imul(ah2, bl8)) | 0;
    hi = (hi + Math.imul(ah2, bh8)) | 0;
    lo = (lo + Math.imul(al1, bl9)) | 0;
    mid = (mid + Math.imul(al1, bh9)) | 0;
    mid = (mid + Math.imul(ah1, bl9)) | 0;
    hi = (hi + Math.imul(ah1, bh9)) | 0;
    var w10 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w10 >>> 26)) | 0;
    w10 &= 0x3ffffff;
    /* k = 11 */
    lo = Math.imul(al9, bl2);
    mid = Math.imul(al9, bh2);
    mid = (mid + Math.imul(ah9, bl2)) | 0;
    hi = Math.imul(ah9, bh2);
    lo = (lo + Math.imul(al8, bl3)) | 0;
    mid = (mid + Math.imul(al8, bh3)) | 0;
    mid = (mid + Math.imul(ah8, bl3)) | 0;
    hi = (hi + Math.imul(ah8, bh3)) | 0;
    lo = (lo + Math.imul(al7, bl4)) | 0;
    mid = (mid + Math.imul(al7, bh4)) | 0;
    mid = (mid + Math.imul(ah7, bl4)) | 0;
    hi = (hi + Math.imul(ah7, bh4)) | 0;
    lo = (lo + Math.imul(al6, bl5)) | 0;
    mid = (mid + Math.imul(al6, bh5)) | 0;
    mid = (mid + Math.imul(ah6, bl5)) | 0;
    hi = (hi + Math.imul(ah6, bh5)) | 0;
    lo = (lo + Math.imul(al5, bl6)) | 0;
    mid = (mid + Math.imul(al5, bh6)) | 0;
    mid = (mid + Math.imul(ah5, bl6)) | 0;
    hi = (hi + Math.imul(ah5, bh6)) | 0;
    lo = (lo + Math.imul(al4, bl7)) | 0;
    mid = (mid + Math.imul(al4, bh7)) | 0;
    mid = (mid + Math.imul(ah4, bl7)) | 0;
    hi = (hi + Math.imul(ah4, bh7)) | 0;
    lo = (lo + Math.imul(al3, bl8)) | 0;
    mid = (mid + Math.imul(al3, bh8)) | 0;
    mid = (mid + Math.imul(ah3, bl8)) | 0;
    hi = (hi + Math.imul(ah3, bh8)) | 0;
    lo = (lo + Math.imul(al2, bl9)) | 0;
    mid = (mid + Math.imul(al2, bh9)) | 0;
    mid = (mid + Math.imul(ah2, bl9)) | 0;
    hi = (hi + Math.imul(ah2, bh9)) | 0;
    var w11 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w11 >>> 26)) | 0;
    w11 &= 0x3ffffff;
    /* k = 12 */
    lo = Math.imul(al9, bl3);
    mid = Math.imul(al9, bh3);
    mid = (mid + Math.imul(ah9, bl3)) | 0;
    hi = Math.imul(ah9, bh3);
    lo = (lo + Math.imul(al8, bl4)) | 0;
    mid = (mid + Math.imul(al8, bh4)) | 0;
    mid = (mid + Math.imul(ah8, bl4)) | 0;
    hi = (hi + Math.imul(ah8, bh4)) | 0;
    lo = (lo + Math.imul(al7, bl5)) | 0;
    mid = (mid + Math.imul(al7, bh5)) | 0;
    mid = (mid + Math.imul(ah7, bl5)) | 0;
    hi = (hi + Math.imul(ah7, bh5)) | 0;
    lo = (lo + Math.imul(al6, bl6)) | 0;
    mid = (mid + Math.imul(al6, bh6)) | 0;
    mid = (mid + Math.imul(ah6, bl6)) | 0;
    hi = (hi + Math.imul(ah6, bh6)) | 0;
    lo = (lo + Math.imul(al5, bl7)) | 0;
    mid = (mid + Math.imul(al5, bh7)) | 0;
    mid = (mid + Math.imul(ah5, bl7)) | 0;
    hi = (hi + Math.imul(ah5, bh7)) | 0;
    lo = (lo + Math.imul(al4, bl8)) | 0;
    mid = (mid + Math.imul(al4, bh8)) | 0;
    mid = (mid + Math.imul(ah4, bl8)) | 0;
    hi = (hi + Math.imul(ah4, bh8)) | 0;
    lo = (lo + Math.imul(al3, bl9)) | 0;
    mid = (mid + Math.imul(al3, bh9)) | 0;
    mid = (mid + Math.imul(ah3, bl9)) | 0;
    hi = (hi + Math.imul(ah3, bh9)) | 0;
    var w12 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w12 >>> 26)) | 0;
    w12 &= 0x3ffffff;
    /* k = 13 */
    lo = Math.imul(al9, bl4);
    mid = Math.imul(al9, bh4);
    mid = (mid + Math.imul(ah9, bl4)) | 0;
    hi = Math.imul(ah9, bh4);
    lo = (lo + Math.imul(al8, bl5)) | 0;
    mid = (mid + Math.imul(al8, bh5)) | 0;
    mid = (mid + Math.imul(ah8, bl5)) | 0;
    hi = (hi + Math.imul(ah8, bh5)) | 0;
    lo = (lo + Math.imul(al7, bl6)) | 0;
    mid = (mid + Math.imul(al7, bh6)) | 0;
    mid = (mid + Math.imul(ah7, bl6)) | 0;
    hi = (hi + Math.imul(ah7, bh6)) | 0;
    lo = (lo + Math.imul(al6, bl7)) | 0;
    mid = (mid + Math.imul(al6, bh7)) | 0;
    mid = (mid + Math.imul(ah6, bl7)) | 0;
    hi = (hi + Math.imul(ah6, bh7)) | 0;
    lo = (lo + Math.imul(al5, bl8)) | 0;
    mid = (mid + Math.imul(al5, bh8)) | 0;
    mid = (mid + Math.imul(ah5, bl8)) | 0;
    hi = (hi + Math.imul(ah5, bh8)) | 0;
    lo = (lo + Math.imul(al4, bl9)) | 0;
    mid = (mid + Math.imul(al4, bh9)) | 0;
    mid = (mid + Math.imul(ah4, bl9)) | 0;
    hi = (hi + Math.imul(ah4, bh9)) | 0;
    var w13 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w13 >>> 26)) | 0;
    w13 &= 0x3ffffff;
    /* k = 14 */
    lo = Math.imul(al9, bl5);
    mid = Math.imul(al9, bh5);
    mid = (mid + Math.imul(ah9, bl5)) | 0;
    hi = Math.imul(ah9, bh5);
    lo = (lo + Math.imul(al8, bl6)) | 0;
    mid = (mid + Math.imul(al8, bh6)) | 0;
    mid = (mid + Math.imul(ah8, bl6)) | 0;
    hi = (hi + Math.imul(ah8, bh6)) | 0;
    lo = (lo + Math.imul(al7, bl7)) | 0;
    mid = (mid + Math.imul(al7, bh7)) | 0;
    mid = (mid + Math.imul(ah7, bl7)) | 0;
    hi = (hi + Math.imul(ah7, bh7)) | 0;
    lo = (lo + Math.imul(al6, bl8)) | 0;
    mid = (mid + Math.imul(al6, bh8)) | 0;
    mid = (mid + Math.imul(ah6, bl8)) | 0;
    hi = (hi + Math.imul(ah6, bh8)) | 0;
    lo = (lo + Math.imul(al5, bl9)) | 0;
    mid = (mid + Math.imul(al5, bh9)) | 0;
    mid = (mid + Math.imul(ah5, bl9)) | 0;
    hi = (hi + Math.imul(ah5, bh9)) | 0;
    var w14 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w14 >>> 26)) | 0;
    w14 &= 0x3ffffff;
    /* k = 15 */
    lo = Math.imul(al9, bl6);
    mid = Math.imul(al9, bh6);
    mid = (mid + Math.imul(ah9, bl6)) | 0;
    hi = Math.imul(ah9, bh6);
    lo = (lo + Math.imul(al8, bl7)) | 0;
    mid = (mid + Math.imul(al8, bh7)) | 0;
    mid = (mid + Math.imul(ah8, bl7)) | 0;
    hi = (hi + Math.imul(ah8, bh7)) | 0;
    lo = (lo + Math.imul(al7, bl8)) | 0;
    mid = (mid + Math.imul(al7, bh8)) | 0;
    mid = (mid + Math.imul(ah7, bl8)) | 0;
    hi = (hi + Math.imul(ah7, bh8)) | 0;
    lo = (lo + Math.imul(al6, bl9)) | 0;
    mid = (mid + Math.imul(al6, bh9)) | 0;
    mid = (mid + Math.imul(ah6, bl9)) | 0;
    hi = (hi + Math.imul(ah6, bh9)) | 0;
    var w15 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w15 >>> 26)) | 0;
    w15 &= 0x3ffffff;
    /* k = 16 */
    lo = Math.imul(al9, bl7);
    mid = Math.imul(al9, bh7);
    mid = (mid + Math.imul(ah9, bl7)) | 0;
    hi = Math.imul(ah9, bh7);
    lo = (lo + Math.imul(al8, bl8)) | 0;
    mid = (mid + Math.imul(al8, bh8)) | 0;
    mid = (mid + Math.imul(ah8, bl8)) | 0;
    hi = (hi + Math.imul(ah8, bh8)) | 0;
    lo = (lo + Math.imul(al7, bl9)) | 0;
    mid = (mid + Math.imul(al7, bh9)) | 0;
    mid = (mid + Math.imul(ah7, bl9)) | 0;
    hi = (hi + Math.imul(ah7, bh9)) | 0;
    var w16 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w16 >>> 26)) | 0;
    w16 &= 0x3ffffff;
    /* k = 17 */
    lo = Math.imul(al9, bl8);
    mid = Math.imul(al9, bh8);
    mid = (mid + Math.imul(ah9, bl8)) | 0;
    hi = Math.imul(ah9, bh8);
    lo = (lo + Math.imul(al8, bl9)) | 0;
    mid = (mid + Math.imul(al8, bh9)) | 0;
    mid = (mid + Math.imul(ah8, bl9)) | 0;
    hi = (hi + Math.imul(ah8, bh9)) | 0;
    var w17 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w17 >>> 26)) | 0;
    w17 &= 0x3ffffff;
    /* k = 18 */
    lo = Math.imul(al9, bl9);
    mid = Math.imul(al9, bh9);
    mid = (mid + Math.imul(ah9, bl9)) | 0;
    hi = Math.imul(ah9, bh9);
    var w18 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w18 >>> 26)) | 0;
    w18 &= 0x3ffffff;
    o[0] = w0;
    o[1] = w1;
    o[2] = w2;
    o[3] = w3;
    o[4] = w4;
    o[5] = w5;
    o[6] = w6;
    o[7] = w7;
    o[8] = w8;
    o[9] = w9;
    o[10] = w10;
    o[11] = w11;
    o[12] = w12;
    o[13] = w13;
    o[14] = w14;
    o[15] = w15;
    o[16] = w16;
    o[17] = w17;
    o[18] = w18;
    if (c !== 0) {
      o[19] = c;
      out.length++;
    }
    return out;
  };

  // Polyfill comb
  if (!Math.imul) {
    comb10MulTo = smallMulTo;
  }

  function bigMulTo (self, num, out) {
    out.negative = num.negative ^ self.negative;
    out.length = self.length + num.length;

    var carry = 0;
    var hncarry = 0;
    for (var k = 0; k < out.length - 1; k++) {
      // Sum all words with the same `i + j = k` and accumulate `ncarry`,
      // note that ncarry could be >= 0x3ffffff
      var ncarry = hncarry;
      hncarry = 0;
      var rword = carry & 0x3ffffff;
      var maxJ = Math.min(k, num.length - 1);
      for (var j = Math.max(0, k - self.length + 1); j <= maxJ; j++) {
        var i = k - j;
        var a = self.words[i] | 0;
        var b = num.words[j] | 0;
        var r = a * b;

        var lo = r & 0x3ffffff;
        ncarry = (ncarry + ((r / 0x4000000) | 0)) | 0;
        lo = (lo + rword) | 0;
        rword = lo & 0x3ffffff;
        ncarry = (ncarry + (lo >>> 26)) | 0;

        hncarry += ncarry >>> 26;
        ncarry &= 0x3ffffff;
      }
      out.words[k] = rword;
      carry = ncarry;
      ncarry = hncarry;
    }
    if (carry !== 0) {
      out.words[k] = carry;
    } else {
      out.length--;
    }

    return out._strip();
  }

  function jumboMulTo (self, num, out) {
    // Temporary disable, see https://github.com/indutny/bn.js/issues/211
    // var fftm = new FFTM();
    // return fftm.mulp(self, num, out);
    return bigMulTo(self, num, out);
  }

  BN.prototype.mulTo = function mulTo (num, out) {
    var res;
    var len = this.length + num.length;
    if (this.length === 10 && num.length === 10) {
      res = comb10MulTo(this, num, out);
    } else if (len < 63) {
      res = smallMulTo(this, num, out);
    } else if (len < 1024) {
      res = bigMulTo(this, num, out);
    } else {
      res = jumboMulTo(this, num, out);
    }

    return res;
  };

  // Multiply `this` by `num`
  BN.prototype.mul = function mul (num) {
    var out = new BN(null);
    out.words = new Array(this.length + num.length);
    return this.mulTo(num, out);
  };

  // Multiply employing FFT
  BN.prototype.mulf = function mulf (num) {
    var out = new BN(null);
    out.words = new Array(this.length + num.length);
    return jumboMulTo(this, num, out);
  };

  // In-place Multiplication
  BN.prototype.imul = function imul (num) {
    return this.clone().mulTo(num, this);
  };

  BN.prototype.imuln = function imuln (num) {
    var isNegNum = num < 0;
    if (isNegNum) num = -num;

    assert(typeof num === 'number');
    assert(num < 0x4000000);

    // Carry
    var carry = 0;
    for (var i = 0; i < this.length; i++) {
      var w = (this.words[i] | 0) * num;
      var lo = (w & 0x3ffffff) + (carry & 0x3ffffff);
      carry >>= 26;
      carry += (w / 0x4000000) | 0;
      // NOTE: lo is 27bit maximum
      carry += lo >>> 26;
      this.words[i] = lo & 0x3ffffff;
    }

    if (carry !== 0) {
      this.words[i] = carry;
      this.length++;
    }

    return isNegNum ? this.ineg() : this;
  };

  BN.prototype.muln = function muln (num) {
    return this.clone().imuln(num);
  };

  // `this` * `this`
  BN.prototype.sqr = function sqr () {
    return this.mul(this);
  };

  // `this` * `this` in-place
  BN.prototype.isqr = function isqr () {
    return this.imul(this.clone());
  };

  // Math.pow(`this`, `num`)
  BN.prototype.pow = function pow (num) {
    var w = toBitArray(num);
    if (w.length === 0) return new BN(1);

    // Skip leading zeroes
    var res = this;
    for (var i = 0; i < w.length; i++, res = res.sqr()) {
      if (w[i] !== 0) break;
    }

    if (++i < w.length) {
      for (var q = res.sqr(); i < w.length; i++, q = q.sqr()) {
        if (w[i] === 0) continue;

        res = res.mul(q);
      }
    }

    return res;
  };

  // Shift-left in-place
  BN.prototype.iushln = function iushln (bits) {
    assert(typeof bits === 'number' && bits >= 0);
    var r = bits % 26;
    var s = (bits - r) / 26;
    var carryMask = (0x3ffffff >>> (26 - r)) << (26 - r);
    var i;

    if (r !== 0) {
      var carry = 0;

      for (i = 0; i < this.length; i++) {
        var newCarry = this.words[i] & carryMask;
        var c = ((this.words[i] | 0) - newCarry) << r;
        this.words[i] = c | carry;
        carry = newCarry >>> (26 - r);
      }

      if (carry) {
        this.words[i] = carry;
        this.length++;
      }
    }

    if (s !== 0) {
      for (i = this.length - 1; i >= 0; i--) {
        this.words[i + s] = this.words[i];
      }

      for (i = 0; i < s; i++) {
        this.words[i] = 0;
      }

      this.length += s;
    }

    return this._strip();
  };

  BN.prototype.ishln = function ishln (bits) {
    // TODO(indutny): implement me
    assert(this.negative === 0);
    return this.iushln(bits);
  };

  // Shift-right in-place
  // NOTE: `hint` is a lowest bit before trailing zeroes
  // NOTE: if `extended` is present - it will be filled with destroyed bits
  BN.prototype.iushrn = function iushrn (bits, hint, extended) {
    assert(typeof bits === 'number' && bits >= 0);
    var h;
    if (hint) {
      h = (hint - (hint % 26)) / 26;
    } else {
      h = 0;
    }

    var r = bits % 26;
    var s = Math.min((bits - r) / 26, this.length);
    var mask = 0x3ffffff ^ ((0x3ffffff >>> r) << r);
    var maskedWords = extended;

    h -= s;
    h = Math.max(0, h);

    // Extended mode, copy masked part
    if (maskedWords) {
      for (var i = 0; i < s; i++) {
        maskedWords.words[i] = this.words[i];
      }
      maskedWords.length = s;
    }

    if (s === 0) ; else if (this.length > s) {
      this.length -= s;
      for (i = 0; i < this.length; i++) {
        this.words[i] = this.words[i + s];
      }
    } else {
      this.words[0] = 0;
      this.length = 1;
    }

    var carry = 0;
    for (i = this.length - 1; i >= 0 && (carry !== 0 || i >= h); i--) {
      var word = this.words[i] | 0;
      this.words[i] = (carry << (26 - r)) | (word >>> r);
      carry = word & mask;
    }

    // Push carried bits as a mask
    if (maskedWords && carry !== 0) {
      maskedWords.words[maskedWords.length++] = carry;
    }

    if (this.length === 0) {
      this.words[0] = 0;
      this.length = 1;
    }

    return this._strip();
  };

  BN.prototype.ishrn = function ishrn (bits, hint, extended) {
    // TODO(indutny): implement me
    assert(this.negative === 0);
    return this.iushrn(bits, hint, extended);
  };

  // Shift-left
  BN.prototype.shln = function shln (bits) {
    return this.clone().ishln(bits);
  };

  BN.prototype.ushln = function ushln (bits) {
    return this.clone().iushln(bits);
  };

  // Shift-right
  BN.prototype.shrn = function shrn (bits) {
    return this.clone().ishrn(bits);
  };

  BN.prototype.ushrn = function ushrn (bits) {
    return this.clone().iushrn(bits);
  };

  // Test if n bit is set
  BN.prototype.testn = function testn (bit) {
    assert(typeof bit === 'number' && bit >= 0);
    var r = bit % 26;
    var s = (bit - r) / 26;
    var q = 1 << r;

    // Fast case: bit is much higher than all existing words
    if (this.length <= s) return false;

    // Check bit and return
    var w = this.words[s];

    return !!(w & q);
  };

  // Return only lowers bits of number (in-place)
  BN.prototype.imaskn = function imaskn (bits) {
    assert(typeof bits === 'number' && bits >= 0);
    var r = bits % 26;
    var s = (bits - r) / 26;

    assert(this.negative === 0, 'imaskn works only with positive numbers');

    if (this.length <= s) {
      return this;
    }

    if (r !== 0) {
      s++;
    }
    this.length = Math.min(s, this.length);

    if (r !== 0) {
      var mask = 0x3ffffff ^ ((0x3ffffff >>> r) << r);
      this.words[this.length - 1] &= mask;
    }

    return this._strip();
  };

  // Return only lowers bits of number
  BN.prototype.maskn = function maskn (bits) {
    return this.clone().imaskn(bits);
  };

  // Add plain number `num` to `this`
  BN.prototype.iaddn = function iaddn (num) {
    assert(typeof num === 'number');
    assert(num < 0x4000000);
    if (num < 0) return this.isubn(-num);

    // Possible sign change
    if (this.negative !== 0) {
      if (this.length === 1 && (this.words[0] | 0) <= num) {
        this.words[0] = num - (this.words[0] | 0);
        this.negative = 0;
        return this;
      }

      this.negative = 0;
      this.isubn(num);
      this.negative = 1;
      return this;
    }

    // Add without checks
    return this._iaddn(num);
  };

  BN.prototype._iaddn = function _iaddn (num) {
    this.words[0] += num;

    // Carry
    for (var i = 0; i < this.length && this.words[i] >= 0x4000000; i++) {
      this.words[i] -= 0x4000000;
      if (i === this.length - 1) {
        this.words[i + 1] = 1;
      } else {
        this.words[i + 1]++;
      }
    }
    this.length = Math.max(this.length, i + 1);

    return this;
  };

  // Subtract plain number `num` from `this`
  BN.prototype.isubn = function isubn (num) {
    assert(typeof num === 'number');
    assert(num < 0x4000000);
    if (num < 0) return this.iaddn(-num);

    if (this.negative !== 0) {
      this.negative = 0;
      this.iaddn(num);
      this.negative = 1;
      return this;
    }

    this.words[0] -= num;

    if (this.length === 1 && this.words[0] < 0) {
      this.words[0] = -this.words[0];
      this.negative = 1;
    } else {
      // Carry
      for (var i = 0; i < this.length && this.words[i] < 0; i++) {
        this.words[i] += 0x4000000;
        this.words[i + 1] -= 1;
      }
    }

    return this._strip();
  };

  BN.prototype.addn = function addn (num) {
    return this.clone().iaddn(num);
  };

  BN.prototype.subn = function subn (num) {
    return this.clone().isubn(num);
  };

  BN.prototype.iabs = function iabs () {
    this.negative = 0;

    return this;
  };

  BN.prototype.abs = function abs () {
    return this.clone().iabs();
  };

  BN.prototype._ishlnsubmul = function _ishlnsubmul (num, mul, shift) {
    var len = num.length + shift;
    var i;

    this._expand(len);

    var w;
    var carry = 0;
    for (i = 0; i < num.length; i++) {
      w = (this.words[i + shift] | 0) + carry;
      var right = (num.words[i] | 0) * mul;
      w -= right & 0x3ffffff;
      carry = (w >> 26) - ((right / 0x4000000) | 0);
      this.words[i + shift] = w & 0x3ffffff;
    }
    for (; i < this.length - shift; i++) {
      w = (this.words[i + shift] | 0) + carry;
      carry = w >> 26;
      this.words[i + shift] = w & 0x3ffffff;
    }

    if (carry === 0) return this._strip();

    // Subtraction overflow
    assert(carry === -1);
    carry = 0;
    for (i = 0; i < this.length; i++) {
      w = -(this.words[i] | 0) + carry;
      carry = w >> 26;
      this.words[i] = w & 0x3ffffff;
    }
    this.negative = 1;

    return this._strip();
  };

  BN.prototype._wordDiv = function _wordDiv (num, mode) {
    var shift = this.length - num.length;

    var a = this.clone();
    var b = num;

    // Normalize
    var bhi = b.words[b.length - 1] | 0;
    var bhiBits = this._countBits(bhi);
    shift = 26 - bhiBits;
    if (shift !== 0) {
      b = b.ushln(shift);
      a.iushln(shift);
      bhi = b.words[b.length - 1] | 0;
    }

    // Initialize quotient
    var m = a.length - b.length;
    var q;

    if (mode !== 'mod') {
      q = new BN(null);
      q.length = m + 1;
      q.words = new Array(q.length);
      for (var i = 0; i < q.length; i++) {
        q.words[i] = 0;
      }
    }

    var diff = a.clone()._ishlnsubmul(b, 1, m);
    if (diff.negative === 0) {
      a = diff;
      if (q) {
        q.words[m] = 1;
      }
    }

    for (var j = m - 1; j >= 0; j--) {
      var qj = (a.words[b.length + j] | 0) * 0x4000000 +
        (a.words[b.length + j - 1] | 0);

      // NOTE: (qj / bhi) is (0x3ffffff * 0x4000000 + 0x3ffffff) / 0x2000000 max
      // (0x7ffffff)
      qj = Math.min((qj / bhi) | 0, 0x3ffffff);

      a._ishlnsubmul(b, qj, j);
      while (a.negative !== 0) {
        qj--;
        a.negative = 0;
        a._ishlnsubmul(b, 1, j);
        if (!a.isZero()) {
          a.negative ^= 1;
        }
      }
      if (q) {
        q.words[j] = qj;
      }
    }
    if (q) {
      q._strip();
    }
    a._strip();

    // Denormalize
    if (mode !== 'div' && shift !== 0) {
      a.iushrn(shift);
    }

    return {
      div: q || null,
      mod: a
    };
  };

  // NOTE: 1) `mode` can be set to `mod` to request mod only,
  //       to `div` to request div only, or be absent to
  //       request both div & mod
  //       2) `positive` is true if unsigned mod is requested
  BN.prototype.divmod = function divmod (num, mode, positive) {
    assert(!num.isZero());

    if (this.isZero()) {
      return {
        div: new BN(0),
        mod: new BN(0)
      };
    }

    var div, mod, res;
    if (this.negative !== 0 && num.negative === 0) {
      res = this.neg().divmod(num, mode);

      if (mode !== 'mod') {
        div = res.div.neg();
      }

      if (mode !== 'div') {
        mod = res.mod.neg();
        if (positive && mod.negative !== 0) {
          mod.iadd(num);
        }
      }

      return {
        div: div,
        mod: mod
      };
    }

    if (this.negative === 0 && num.negative !== 0) {
      res = this.divmod(num.neg(), mode);

      if (mode !== 'mod') {
        div = res.div.neg();
      }

      return {
        div: div,
        mod: res.mod
      };
    }

    if ((this.negative & num.negative) !== 0) {
      res = this.neg().divmod(num.neg(), mode);

      if (mode !== 'div') {
        mod = res.mod.neg();
        if (positive && mod.negative !== 0) {
          mod.isub(num);
        }
      }

      return {
        div: res.div,
        mod: mod
      };
    }

    // Both numbers are positive at this point

    // Strip both numbers to approximate shift value
    if (num.length > this.length || this.cmp(num) < 0) {
      return {
        div: new BN(0),
        mod: this
      };
    }

    // Very short reduction
    if (num.length === 1) {
      if (mode === 'div') {
        return {
          div: this.divn(num.words[0]),
          mod: null
        };
      }

      if (mode === 'mod') {
        return {
          div: null,
          mod: new BN(this.modrn(num.words[0]))
        };
      }

      return {
        div: this.divn(num.words[0]),
        mod: new BN(this.modrn(num.words[0]))
      };
    }

    return this._wordDiv(num, mode);
  };

  // Find `this` / `num`
  BN.prototype.div = function div (num) {
    return this.divmod(num, 'div', false).div;
  };

  // Find `this` % `num`
  BN.prototype.mod = function mod (num) {
    return this.divmod(num, 'mod', false).mod;
  };

  BN.prototype.umod = function umod (num) {
    return this.divmod(num, 'mod', true).mod;
  };

  // Find Round(`this` / `num`)
  BN.prototype.divRound = function divRound (num) {
    var dm = this.divmod(num);

    // Fast case - exact division
    if (dm.mod.isZero()) return dm.div;

    var mod = dm.div.negative !== 0 ? dm.mod.isub(num) : dm.mod;

    var half = num.ushrn(1);
    var r2 = num.andln(1);
    var cmp = mod.cmp(half);

    // Round down
    if (cmp < 0 || (r2 === 1 && cmp === 0)) return dm.div;

    // Round up
    return dm.div.negative !== 0 ? dm.div.isubn(1) : dm.div.iaddn(1);
  };

  BN.prototype.modrn = function modrn (num) {
    var isNegNum = num < 0;
    if (isNegNum) num = -num;

    assert(num <= 0x3ffffff);
    var p = (1 << 26) % num;

    var acc = 0;
    for (var i = this.length - 1; i >= 0; i--) {
      acc = (p * acc + (this.words[i] | 0)) % num;
    }

    return isNegNum ? -acc : acc;
  };

  // WARNING: DEPRECATED
  BN.prototype.modn = function modn (num) {
    return this.modrn(num);
  };

  // In-place division by number
  BN.prototype.idivn = function idivn (num) {
    var isNegNum = num < 0;
    if (isNegNum) num = -num;

    assert(num <= 0x3ffffff);

    var carry = 0;
    for (var i = this.length - 1; i >= 0; i--) {
      var w = (this.words[i] | 0) + carry * 0x4000000;
      this.words[i] = (w / num) | 0;
      carry = w % num;
    }

    this._strip();
    return isNegNum ? this.ineg() : this;
  };

  BN.prototype.divn = function divn (num) {
    return this.clone().idivn(num);
  };

  BN.prototype.egcd = function egcd (p) {
    assert(p.negative === 0);
    assert(!p.isZero());

    var x = this;
    var y = p.clone();

    if (x.negative !== 0) {
      x = x.umod(p);
    } else {
      x = x.clone();
    }

    // A * x + B * y = x
    var A = new BN(1);
    var B = new BN(0);

    // C * x + D * y = y
    var C = new BN(0);
    var D = new BN(1);

    var g = 0;

    while (x.isEven() && y.isEven()) {
      x.iushrn(1);
      y.iushrn(1);
      ++g;
    }

    var yp = y.clone();
    var xp = x.clone();

    while (!x.isZero()) {
      for (var i = 0, im = 1; (x.words[0] & im) === 0 && i < 26; ++i, im <<= 1);
      if (i > 0) {
        x.iushrn(i);
        while (i-- > 0) {
          if (A.isOdd() || B.isOdd()) {
            A.iadd(yp);
            B.isub(xp);
          }

          A.iushrn(1);
          B.iushrn(1);
        }
      }

      for (var j = 0, jm = 1; (y.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1);
      if (j > 0) {
        y.iushrn(j);
        while (j-- > 0) {
          if (C.isOdd() || D.isOdd()) {
            C.iadd(yp);
            D.isub(xp);
          }

          C.iushrn(1);
          D.iushrn(1);
        }
      }

      if (x.cmp(y) >= 0) {
        x.isub(y);
        A.isub(C);
        B.isub(D);
      } else {
        y.isub(x);
        C.isub(A);
        D.isub(B);
      }
    }

    return {
      a: C,
      b: D,
      gcd: y.iushln(g)
    };
  };

  // This is reduced incarnation of the binary EEA
  // above, designated to invert members of the
  // _prime_ fields F(p) at a maximal speed
  BN.prototype._invmp = function _invmp (p) {
    assert(p.negative === 0);
    assert(!p.isZero());

    var a = this;
    var b = p.clone();

    if (a.negative !== 0) {
      a = a.umod(p);
    } else {
      a = a.clone();
    }

    var x1 = new BN(1);
    var x2 = new BN(0);

    var delta = b.clone();

    while (a.cmpn(1) > 0 && b.cmpn(1) > 0) {
      for (var i = 0, im = 1; (a.words[0] & im) === 0 && i < 26; ++i, im <<= 1);
      if (i > 0) {
        a.iushrn(i);
        while (i-- > 0) {
          if (x1.isOdd()) {
            x1.iadd(delta);
          }

          x1.iushrn(1);
        }
      }

      for (var j = 0, jm = 1; (b.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1);
      if (j > 0) {
        b.iushrn(j);
        while (j-- > 0) {
          if (x2.isOdd()) {
            x2.iadd(delta);
          }

          x2.iushrn(1);
        }
      }

      if (a.cmp(b) >= 0) {
        a.isub(b);
        x1.isub(x2);
      } else {
        b.isub(a);
        x2.isub(x1);
      }
    }

    var res;
    if (a.cmpn(1) === 0) {
      res = x1;
    } else {
      res = x2;
    }

    if (res.cmpn(0) < 0) {
      res.iadd(p);
    }

    return res;
  };

  BN.prototype.gcd = function gcd (num) {
    if (this.isZero()) return num.abs();
    if (num.isZero()) return this.abs();

    var a = this.clone();
    var b = num.clone();
    a.negative = 0;
    b.negative = 0;

    // Remove common factor of two
    for (var shift = 0; a.isEven() && b.isEven(); shift++) {
      a.iushrn(1);
      b.iushrn(1);
    }

    do {
      while (a.isEven()) {
        a.iushrn(1);
      }
      while (b.isEven()) {
        b.iushrn(1);
      }

      var r = a.cmp(b);
      if (r < 0) {
        // Swap `a` and `b` to make `a` always bigger than `b`
        var t = a;
        a = b;
        b = t;
      } else if (r === 0 || b.cmpn(1) === 0) {
        break;
      }

      a.isub(b);
    } while (true);

    return b.iushln(shift);
  };

  // Invert number in the field F(num)
  BN.prototype.invm = function invm (num) {
    return this.egcd(num).a.umod(num);
  };

  BN.prototype.isEven = function isEven () {
    return (this.words[0] & 1) === 0;
  };

  BN.prototype.isOdd = function isOdd () {
    return (this.words[0] & 1) === 1;
  };

  // And first word and num
  BN.prototype.andln = function andln (num) {
    return this.words[0] & num;
  };

  // Increment at the bit position in-line
  BN.prototype.bincn = function bincn (bit) {
    assert(typeof bit === 'number');
    var r = bit % 26;
    var s = (bit - r) / 26;
    var q = 1 << r;

    // Fast case: bit is much higher than all existing words
    if (this.length <= s) {
      this._expand(s + 1);
      this.words[s] |= q;
      return this;
    }

    // Add bit and propagate, if needed
    var carry = q;
    for (var i = s; carry !== 0 && i < this.length; i++) {
      var w = this.words[i] | 0;
      w += carry;
      carry = w >>> 26;
      w &= 0x3ffffff;
      this.words[i] = w;
    }
    if (carry !== 0) {
      this.words[i] = carry;
      this.length++;
    }
    return this;
  };

  BN.prototype.isZero = function isZero () {
    return this.length === 1 && this.words[0] === 0;
  };

  BN.prototype.cmpn = function cmpn (num) {
    var negative = num < 0;

    if (this.negative !== 0 && !negative) return -1;
    if (this.negative === 0 && negative) return 1;

    this._strip();

    var res;
    if (this.length > 1) {
      res = 1;
    } else {
      if (negative) {
        num = -num;
      }

      assert(num <= 0x3ffffff, 'Number is too big');

      var w = this.words[0] | 0;
      res = w === num ? 0 : w < num ? -1 : 1;
    }
    if (this.negative !== 0) return -res | 0;
    return res;
  };

  // Compare two numbers and return:
  // 1 - if `this` > `num`
  // 0 - if `this` == `num`
  // -1 - if `this` < `num`
  BN.prototype.cmp = function cmp (num) {
    if (this.negative !== 0 && num.negative === 0) return -1;
    if (this.negative === 0 && num.negative !== 0) return 1;

    var res = this.ucmp(num);
    if (this.negative !== 0) return -res | 0;
    return res;
  };

  // Unsigned comparison
  BN.prototype.ucmp = function ucmp (num) {
    // At this point both numbers have the same sign
    if (this.length > num.length) return 1;
    if (this.length < num.length) return -1;

    var res = 0;
    for (var i = this.length - 1; i >= 0; i--) {
      var a = this.words[i] | 0;
      var b = num.words[i] | 0;

      if (a === b) continue;
      if (a < b) {
        res = -1;
      } else if (a > b) {
        res = 1;
      }
      break;
    }
    return res;
  };

  BN.prototype.gtn = function gtn (num) {
    return this.cmpn(num) === 1;
  };

  BN.prototype.gt = function gt (num) {
    return this.cmp(num) === 1;
  };

  BN.prototype.gten = function gten (num) {
    return this.cmpn(num) >= 0;
  };

  BN.prototype.gte = function gte (num) {
    return this.cmp(num) >= 0;
  };

  BN.prototype.ltn = function ltn (num) {
    return this.cmpn(num) === -1;
  };

  BN.prototype.lt = function lt (num) {
    return this.cmp(num) === -1;
  };

  BN.prototype.lten = function lten (num) {
    return this.cmpn(num) <= 0;
  };

  BN.prototype.lte = function lte (num) {
    return this.cmp(num) <= 0;
  };

  BN.prototype.eqn = function eqn (num) {
    return this.cmpn(num) === 0;
  };

  BN.prototype.eq = function eq (num) {
    return this.cmp(num) === 0;
  };

  //
  // A reduce context, could be using montgomery or something better, depending
  // on the `m` itself.
  //
  BN.red = function red (num) {
    return new Red(num);
  };

  BN.prototype.toRed = function toRed (ctx) {
    assert(!this.red, 'Already a number in reduction context');
    assert(this.negative === 0, 'red works only with positives');
    return ctx.convertTo(this)._forceRed(ctx);
  };

  BN.prototype.fromRed = function fromRed () {
    assert(this.red, 'fromRed works only with numbers in reduction context');
    return this.red.convertFrom(this);
  };

  BN.prototype._forceRed = function _forceRed (ctx) {
    this.red = ctx;
    return this;
  };

  BN.prototype.forceRed = function forceRed (ctx) {
    assert(!this.red, 'Already a number in reduction context');
    return this._forceRed(ctx);
  };

  BN.prototype.redAdd = function redAdd (num) {
    assert(this.red, 'redAdd works only with red numbers');
    return this.red.add(this, num);
  };

  BN.prototype.redIAdd = function redIAdd (num) {
    assert(this.red, 'redIAdd works only with red numbers');
    return this.red.iadd(this, num);
  };

  BN.prototype.redSub = function redSub (num) {
    assert(this.red, 'redSub works only with red numbers');
    return this.red.sub(this, num);
  };

  BN.prototype.redISub = function redISub (num) {
    assert(this.red, 'redISub works only with red numbers');
    return this.red.isub(this, num);
  };

  BN.prototype.redShl = function redShl (num) {
    assert(this.red, 'redShl works only with red numbers');
    return this.red.shl(this, num);
  };

  BN.prototype.redMul = function redMul (num) {
    assert(this.red, 'redMul works only with red numbers');
    this.red._verify2(this, num);
    return this.red.mul(this, num);
  };

  BN.prototype.redIMul = function redIMul (num) {
    assert(this.red, 'redMul works only with red numbers');
    this.red._verify2(this, num);
    return this.red.imul(this, num);
  };

  BN.prototype.redSqr = function redSqr () {
    assert(this.red, 'redSqr works only with red numbers');
    this.red._verify1(this);
    return this.red.sqr(this);
  };

  BN.prototype.redISqr = function redISqr () {
    assert(this.red, 'redISqr works only with red numbers');
    this.red._verify1(this);
    return this.red.isqr(this);
  };

  // Square root over p
  BN.prototype.redSqrt = function redSqrt () {
    assert(this.red, 'redSqrt works only with red numbers');
    this.red._verify1(this);
    return this.red.sqrt(this);
  };

  BN.prototype.redInvm = function redInvm () {
    assert(this.red, 'redInvm works only with red numbers');
    this.red._verify1(this);
    return this.red.invm(this);
  };

  // Return negative clone of `this` % `red modulo`
  BN.prototype.redNeg = function redNeg () {
    assert(this.red, 'redNeg works only with red numbers');
    this.red._verify1(this);
    return this.red.neg(this);
  };

  BN.prototype.redPow = function redPow (num) {
    assert(this.red && !num.red, 'redPow(normalNum)');
    this.red._verify1(this);
    return this.red.pow(this, num);
  };

  // Prime numbers with efficient reduction
  var primes = {
    k256: null,
    p224: null,
    p192: null,
    p25519: null
  };

  // Pseudo-Mersenne prime
  function MPrime (name, p) {
    // P = 2 ^ N - K
    this.name = name;
    this.p = new BN(p, 16);
    this.n = this.p.bitLength();
    this.k = new BN(1).iushln(this.n).isub(this.p);

    this.tmp = this._tmp();
  }

  MPrime.prototype._tmp = function _tmp () {
    var tmp = new BN(null);
    tmp.words = new Array(Math.ceil(this.n / 13));
    return tmp;
  };

  MPrime.prototype.ireduce = function ireduce (num) {
    // Assumes that `num` is less than `P^2`
    // num = HI * (2 ^ N - K) + HI * K + LO = HI * K + LO (mod P)
    var r = num;
    var rlen;

    do {
      this.split(r, this.tmp);
      r = this.imulK(r);
      r = r.iadd(this.tmp);
      rlen = r.bitLength();
    } while (rlen > this.n);

    var cmp = rlen < this.n ? -1 : r.ucmp(this.p);
    if (cmp === 0) {
      r.words[0] = 0;
      r.length = 1;
    } else if (cmp > 0) {
      r.isub(this.p);
    } else {
      if (r.strip !== undefined) {
        // r is a BN v4 instance
        r.strip();
      } else {
        // r is a BN v5 instance
        r._strip();
      }
    }

    return r;
  };

  MPrime.prototype.split = function split (input, out) {
    input.iushrn(this.n, 0, out);
  };

  MPrime.prototype.imulK = function imulK (num) {
    return num.imul(this.k);
  };

  function K256 () {
    MPrime.call(
      this,
      'k256',
      'ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f');
  }
  inherits(K256, MPrime);

  K256.prototype.split = function split (input, output) {
    // 256 = 9 * 26 + 22
    var mask = 0x3fffff;

    var outLen = Math.min(input.length, 9);
    for (var i = 0; i < outLen; i++) {
      output.words[i] = input.words[i];
    }
    output.length = outLen;

    if (input.length <= 9) {
      input.words[0] = 0;
      input.length = 1;
      return;
    }

    // Shift by 9 limbs
    var prev = input.words[9];
    output.words[output.length++] = prev & mask;

    for (i = 10; i < input.length; i++) {
      var next = input.words[i] | 0;
      input.words[i - 10] = ((next & mask) << 4) | (prev >>> 22);
      prev = next;
    }
    prev >>>= 22;
    input.words[i - 10] = prev;
    if (prev === 0 && input.length > 10) {
      input.length -= 10;
    } else {
      input.length -= 9;
    }
  };

  K256.prototype.imulK = function imulK (num) {
    // K = 0x1000003d1 = [ 0x40, 0x3d1 ]
    num.words[num.length] = 0;
    num.words[num.length + 1] = 0;
    num.length += 2;

    // bounded at: 0x40 * 0x3ffffff + 0x3d0 = 0x100000390
    var lo = 0;
    for (var i = 0; i < num.length; i++) {
      var w = num.words[i] | 0;
      lo += w * 0x3d1;
      num.words[i] = lo & 0x3ffffff;
      lo = w * 0x40 + ((lo / 0x4000000) | 0);
    }

    // Fast length reduction
    if (num.words[num.length - 1] === 0) {
      num.length--;
      if (num.words[num.length - 1] === 0) {
        num.length--;
      }
    }
    return num;
  };

  function P224 () {
    MPrime.call(
      this,
      'p224',
      'ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001');
  }
  inherits(P224, MPrime);

  function P192 () {
    MPrime.call(
      this,
      'p192',
      'ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff');
  }
  inherits(P192, MPrime);

  function P25519 () {
    // 2 ^ 255 - 19
    MPrime.call(
      this,
      '25519',
      '7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed');
  }
  inherits(P25519, MPrime);

  P25519.prototype.imulK = function imulK (num) {
    // K = 0x13
    var carry = 0;
    for (var i = 0; i < num.length; i++) {
      var hi = (num.words[i] | 0) * 0x13 + carry;
      var lo = hi & 0x3ffffff;
      hi >>>= 26;

      num.words[i] = lo;
      carry = hi;
    }
    if (carry !== 0) {
      num.words[num.length++] = carry;
    }
    return num;
  };

  // Exported mostly for testing purposes, use plain name instead
  BN._prime = function prime (name) {
    // Cached version of prime
    if (primes[name]) return primes[name];

    var prime;
    if (name === 'k256') {
      prime = new K256();
    } else if (name === 'p224') {
      prime = new P224();
    } else if (name === 'p192') {
      prime = new P192();
    } else if (name === 'p25519') {
      prime = new P25519();
    } else {
      throw new Error('Unknown prime ' + name);
    }
    primes[name] = prime;

    return prime;
  };

  //
  // Base reduction engine
  //
  function Red (m) {
    if (typeof m === 'string') {
      var prime = BN._prime(m);
      this.m = prime.p;
      this.prime = prime;
    } else {
      assert(m.gtn(1), 'modulus must be greater than 1');
      this.m = m;
      this.prime = null;
    }
  }

  Red.prototype._verify1 = function _verify1 (a) {
    assert(a.negative === 0, 'red works only with positives');
    assert(a.red, 'red works only with red numbers');
  };

  Red.prototype._verify2 = function _verify2 (a, b) {
    assert((a.negative | b.negative) === 0, 'red works only with positives');
    assert(a.red && a.red === b.red,
      'red works only with red numbers');
  };

  Red.prototype.imod = function imod (a) {
    if (this.prime) return this.prime.ireduce(a)._forceRed(this);

    move(a, a.umod(this.m)._forceRed(this));
    return a;
  };

  Red.prototype.neg = function neg (a) {
    if (a.isZero()) {
      return a.clone();
    }

    return this.m.sub(a)._forceRed(this);
  };

  Red.prototype.add = function add (a, b) {
    this._verify2(a, b);

    var res = a.add(b);
    if (res.cmp(this.m) >= 0) {
      res.isub(this.m);
    }
    return res._forceRed(this);
  };

  Red.prototype.iadd = function iadd (a, b) {
    this._verify2(a, b);

    var res = a.iadd(b);
    if (res.cmp(this.m) >= 0) {
      res.isub(this.m);
    }
    return res;
  };

  Red.prototype.sub = function sub (a, b) {
    this._verify2(a, b);

    var res = a.sub(b);
    if (res.cmpn(0) < 0) {
      res.iadd(this.m);
    }
    return res._forceRed(this);
  };

  Red.prototype.isub = function isub (a, b) {
    this._verify2(a, b);

    var res = a.isub(b);
    if (res.cmpn(0) < 0) {
      res.iadd(this.m);
    }
    return res;
  };

  Red.prototype.shl = function shl (a, num) {
    this._verify1(a);
    return this.imod(a.ushln(num));
  };

  Red.prototype.imul = function imul (a, b) {
    this._verify2(a, b);
    return this.imod(a.imul(b));
  };

  Red.prototype.mul = function mul (a, b) {
    this._verify2(a, b);
    return this.imod(a.mul(b));
  };

  Red.prototype.isqr = function isqr (a) {
    return this.imul(a, a.clone());
  };

  Red.prototype.sqr = function sqr (a) {
    return this.mul(a, a);
  };

  Red.prototype.sqrt = function sqrt (a) {
    if (a.isZero()) return a.clone();

    var mod3 = this.m.andln(3);
    assert(mod3 % 2 === 1);

    // Fast case
    if (mod3 === 3) {
      var pow = this.m.add(new BN(1)).iushrn(2);
      return this.pow(a, pow);
    }

    // Tonelli-Shanks algorithm (Totally unoptimized and slow)
    //
    // Find Q and S, that Q * 2 ^ S = (P - 1)
    var q = this.m.subn(1);
    var s = 0;
    while (!q.isZero() && q.andln(1) === 0) {
      s++;
      q.iushrn(1);
    }
    assert(!q.isZero());

    var one = new BN(1).toRed(this);
    var nOne = one.redNeg();

    // Find quadratic non-residue
    // NOTE: Max is such because of generalized Riemann hypothesis.
    var lpow = this.m.subn(1).iushrn(1);
    var z = this.m.bitLength();
    z = new BN(2 * z * z).toRed(this);

    while (this.pow(z, lpow).cmp(nOne) !== 0) {
      z.redIAdd(nOne);
    }

    var c = this.pow(z, q);
    var r = this.pow(a, q.addn(1).iushrn(1));
    var t = this.pow(a, q);
    var m = s;
    while (t.cmp(one) !== 0) {
      var tmp = t;
      for (var i = 0; tmp.cmp(one) !== 0; i++) {
        tmp = tmp.redSqr();
      }
      assert(i < m);
      var b = this.pow(c, new BN(1).iushln(m - i - 1));

      r = r.redMul(b);
      c = b.redSqr();
      t = t.redMul(c);
      m = i;
    }

    return r;
  };

  Red.prototype.invm = function invm (a) {
    var inv = a._invmp(this.m);
    if (inv.negative !== 0) {
      inv.negative = 0;
      return this.imod(inv).redNeg();
    } else {
      return this.imod(inv);
    }
  };

  Red.prototype.pow = function pow (a, num) {
    if (num.isZero()) return new BN(1).toRed(this);
    if (num.cmpn(1) === 0) return a.clone();

    var windowSize = 4;
    var wnd = new Array(1 << windowSize);
    wnd[0] = new BN(1).toRed(this);
    wnd[1] = a;
    for (var i = 2; i < wnd.length; i++) {
      wnd[i] = this.mul(wnd[i - 1], a);
    }

    var res = wnd[0];
    var current = 0;
    var currentLen = 0;
    var start = num.bitLength() % 26;
    if (start === 0) {
      start = 26;
    }

    for (i = num.length - 1; i >= 0; i--) {
      var word = num.words[i];
      for (var j = start - 1; j >= 0; j--) {
        var bit = (word >> j) & 1;
        if (res !== wnd[0]) {
          res = this.sqr(res);
        }

        if (bit === 0 && current === 0) {
          currentLen = 0;
          continue;
        }

        current <<= 1;
        current |= bit;
        currentLen++;
        if (currentLen !== windowSize && (i !== 0 || j !== 0)) continue;

        res = this.mul(res, wnd[current]);
        currentLen = 0;
        current = 0;
      }
      start = 26;
    }

    return res;
  };

  Red.prototype.convertTo = function convertTo (num) {
    var r = num.umod(this.m);

    return r === num ? r.clone() : r;
  };

  Red.prototype.convertFrom = function convertFrom (num) {
    var res = num.clone();
    res.red = null;
    return res;
  };

  //
  // Montgomery method engine
  //

  BN.mont = function mont (num) {
    return new Mont(num);
  };

  function Mont (m) {
    Red.call(this, m);

    this.shift = this.m.bitLength();
    if (this.shift % 26 !== 0) {
      this.shift += 26 - (this.shift % 26);
    }

    this.r = new BN(1).iushln(this.shift);
    this.r2 = this.imod(this.r.sqr());
    this.rinv = this.r._invmp(this.m);

    this.minv = this.rinv.mul(this.r).isubn(1).div(this.m);
    this.minv = this.minv.umod(this.r);
    this.minv = this.r.sub(this.minv);
  }
  inherits(Mont, Red);

  Mont.prototype.convertTo = function convertTo (num) {
    return this.imod(num.ushln(this.shift));
  };

  Mont.prototype.convertFrom = function convertFrom (num) {
    var r = this.imod(num.mul(this.rinv));
    r.red = null;
    return r;
  };

  Mont.prototype.imul = function imul (a, b) {
    if (a.isZero() || b.isZero()) {
      a.words[0] = 0;
      a.length = 1;
      return a;
    }

    var t = a.imul(b);
    var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
    var u = t.isub(c).iushrn(this.shift);
    var res = u;

    if (u.cmp(this.m) >= 0) {
      res = u.isub(this.m);
    } else if (u.cmpn(0) < 0) {
      res = u.iadd(this.m);
    }

    return res._forceRed(this);
  };

  Mont.prototype.mul = function mul (a, b) {
    if (a.isZero() || b.isZero()) return new BN(0)._forceRed(this);

    var t = a.mul(b);
    var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
    var u = t.isub(c).iushrn(this.shift);
    var res = u;
    if (u.cmp(this.m) >= 0) {
      res = u.isub(this.m);
    } else if (u.cmpn(0) < 0) {
      res = u.iadd(this.m);
    }

    return res._forceRed(this);
  };

  Mont.prototype.invm = function invm (a) {
    // (AR)^-1 * R^2 = (A^-1 * R^-1) * R^2 = A^-1 * R
    var res = this.imod(a._invmp(this.m).mul(this.r2));
    return res._forceRed(this);
  };
})( module, commonjsGlobal);
});

const version = "logger/5.8.0";

let _permanentCensorErrors = false;
let _censorErrors = false;
const LogLevels = { debug: 1, "default": 2, info: 2, warning: 3, error: 4, off: 5 };
let _logLevel = LogLevels["default"];
let _globalLogger = null;
function _checkNormalize() {
    try {
        const missing = [];
        // Make sure all forms of normalization are supported
        ["NFD", "NFC", "NFKD", "NFKC"].forEach((form) => {
            try {
                if ("test".normalize(form) !== "test") {
                    throw new Error("bad normalize");
                }
                ;
            }
            catch (error) {
                missing.push(form);
            }
        });
        if (missing.length) {
            throw new Error("missing " + missing.join(", "));
        }
        if (String.fromCharCode(0xe9).normalize("NFD") !== String.fromCharCode(0x65, 0x0301)) {
            throw new Error("broken implementation");
        }
    }
    catch (error) {
        return error.message;
    }
    return null;
}
const _normalizeError = _checkNormalize();
var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "DEBUG";
    LogLevel["INFO"] = "INFO";
    LogLevel["WARNING"] = "WARNING";
    LogLevel["ERROR"] = "ERROR";
    LogLevel["OFF"] = "OFF";
})(LogLevel || (LogLevel = {}));
var ErrorCode;
(function (ErrorCode) {
    ///////////////////
    // Generic Errors
    // Unknown Error
    ErrorCode["UNKNOWN_ERROR"] = "UNKNOWN_ERROR";
    // Not Implemented
    ErrorCode["NOT_IMPLEMENTED"] = "NOT_IMPLEMENTED";
    // Unsupported Operation
    //   - operation
    ErrorCode["UNSUPPORTED_OPERATION"] = "UNSUPPORTED_OPERATION";
    // Network Error (i.e. Ethereum Network, such as an invalid chain ID)
    //   - event ("noNetwork" is not re-thrown in provider.ready; otherwise thrown)
    ErrorCode["NETWORK_ERROR"] = "NETWORK_ERROR";
    // Some sort of bad response from the server
    ErrorCode["SERVER_ERROR"] = "SERVER_ERROR";
    // Timeout
    ErrorCode["TIMEOUT"] = "TIMEOUT";
    ///////////////////
    // Operational  Errors
    // Buffer Overrun
    ErrorCode["BUFFER_OVERRUN"] = "BUFFER_OVERRUN";
    // Numeric Fault
    //   - operation: the operation being executed
    //   - fault: the reason this faulted
    ErrorCode["NUMERIC_FAULT"] = "NUMERIC_FAULT";
    ///////////////////
    // Argument Errors
    // Missing new operator to an object
    //  - name: The name of the class
    ErrorCode["MISSING_NEW"] = "MISSING_NEW";
    // Invalid argument (e.g. value is incompatible with type) to a function:
    //   - argument: The argument name that was invalid
    //   - value: The value of the argument
    ErrorCode["INVALID_ARGUMENT"] = "INVALID_ARGUMENT";
    // Missing argument to a function:
    //   - count: The number of arguments received
    //   - expectedCount: The number of arguments expected
    ErrorCode["MISSING_ARGUMENT"] = "MISSING_ARGUMENT";
    // Too many arguments
    //   - count: The number of arguments received
    //   - expectedCount: The number of arguments expected
    ErrorCode["UNEXPECTED_ARGUMENT"] = "UNEXPECTED_ARGUMENT";
    ///////////////////
    // Blockchain Errors
    // Call exception
    //  - transaction: the transaction
    //  - address?: the contract address
    //  - args?: The arguments passed into the function
    //  - method?: The Solidity method signature
    //  - errorSignature?: The EIP848 error signature
    //  - errorArgs?: The EIP848 error parameters
    //  - reason: The reason (only for EIP848 "Error(string)")
    ErrorCode["CALL_EXCEPTION"] = "CALL_EXCEPTION";
    // Insufficient funds (< value + gasLimit * gasPrice)
    //   - transaction: the transaction attempted
    ErrorCode["INSUFFICIENT_FUNDS"] = "INSUFFICIENT_FUNDS";
    // Nonce has already been used
    //   - transaction: the transaction attempted
    ErrorCode["NONCE_EXPIRED"] = "NONCE_EXPIRED";
    // The replacement fee for the transaction is too low
    //   - transaction: the transaction attempted
    ErrorCode["REPLACEMENT_UNDERPRICED"] = "REPLACEMENT_UNDERPRICED";
    // The gas limit could not be estimated
    //   - transaction: the transaction passed to estimateGas
    ErrorCode["UNPREDICTABLE_GAS_LIMIT"] = "UNPREDICTABLE_GAS_LIMIT";
    // The transaction was replaced by one with a higher gas price
    //   - reason: "cancelled", "replaced" or "repriced"
    //   - cancelled: true if reason == "cancelled" or reason == "replaced")
    //   - hash: original transaction hash
    //   - replacement: the full TransactionsResponse for the replacement
    //   - receipt: the receipt of the replacement
    ErrorCode["TRANSACTION_REPLACED"] = "TRANSACTION_REPLACED";
    ///////////////////
    // Interaction Errors
    // The user rejected the action, such as signing a message or sending
    // a transaction
    ErrorCode["ACTION_REJECTED"] = "ACTION_REJECTED";
})(ErrorCode || (ErrorCode = {}));
const HEX = "0123456789abcdef";
class Logger {
    constructor(version) {
        Object.defineProperty(this, "version", {
            enumerable: true,
            value: version,
            writable: false
        });
    }
    _log(logLevel, args) {
        const level = logLevel.toLowerCase();
        if (LogLevels[level] == null) {
            this.throwArgumentError("invalid log level name", "logLevel", logLevel);
        }
        if (_logLevel > LogLevels[level]) {
            return;
        }
        console.log.apply(console, args);
    }
    debug(...args) {
        this._log(Logger.levels.DEBUG, args);
    }
    info(...args) {
        this._log(Logger.levels.INFO, args);
    }
    warn(...args) {
        this._log(Logger.levels.WARNING, args);
    }
    makeError(message, code, params) {
        // Errors are being censored
        if (_censorErrors) {
            return this.makeError("censored error", code, {});
        }
        if (!code) {
            code = Logger.errors.UNKNOWN_ERROR;
        }
        if (!params) {
            params = {};
        }
        const messageDetails = [];
        Object.keys(params).forEach((key) => {
            const value = params[key];
            try {
                if (value instanceof Uint8Array) {
                    let hex = "";
                    for (let i = 0; i < value.length; i++) {
                        hex += HEX[value[i] >> 4];
                        hex += HEX[value[i] & 0x0f];
                    }
                    messageDetails.push(key + "=Uint8Array(0x" + hex + ")");
                }
                else {
                    messageDetails.push(key + "=" + JSON.stringify(value));
                }
            }
            catch (error) {
                messageDetails.push(key + "=" + JSON.stringify(params[key].toString()));
            }
        });
        messageDetails.push(`code=${code}`);
        messageDetails.push(`version=${this.version}`);
        const reason = message;
        let url = "";
        switch (code) {
            case ErrorCode.NUMERIC_FAULT: {
                url = "NUMERIC_FAULT";
                const fault = message;
                switch (fault) {
                    case "overflow":
                    case "underflow":
                    case "division-by-zero":
                        url += "-" + fault;
                        break;
                    case "negative-power":
                    case "negative-width":
                        url += "-unsupported";
                        break;
                    case "unbound-bitwise-result":
                        url += "-unbound-result";
                        break;
                }
                break;
            }
            case ErrorCode.CALL_EXCEPTION:
            case ErrorCode.INSUFFICIENT_FUNDS:
            case ErrorCode.MISSING_NEW:
            case ErrorCode.NONCE_EXPIRED:
            case ErrorCode.REPLACEMENT_UNDERPRICED:
            case ErrorCode.TRANSACTION_REPLACED:
            case ErrorCode.UNPREDICTABLE_GAS_LIMIT:
                url = code;
                break;
        }
        if (url) {
            message += " [ See: https:/\/links.ethers.org/v5-errors-" + url + " ]";
        }
        if (messageDetails.length) {
            message += " (" + messageDetails.join(", ") + ")";
        }
        // @TODO: Any??
        const error = new Error(message);
        error.reason = reason;
        error.code = code;
        Object.keys(params).forEach(function (key) {
            error[key] = params[key];
        });
        return error;
    }
    throwError(message, code, params) {
        throw this.makeError(message, code, params);
    }
    throwArgumentError(message, name, value) {
        return this.throwError(message, Logger.errors.INVALID_ARGUMENT, {
            argument: name,
            value: value
        });
    }
    assert(condition, message, code, params) {
        if (!!condition) {
            return;
        }
        this.throwError(message, code, params);
    }
    assertArgument(condition, message, name, value) {
        if (!!condition) {
            return;
        }
        this.throwArgumentError(message, name, value);
    }
    checkNormalize(message) {
        if (_normalizeError) {
            this.throwError("platform missing String.prototype.normalize", Logger.errors.UNSUPPORTED_OPERATION, {
                operation: "String.prototype.normalize", form: _normalizeError
            });
        }
    }
    checkSafeUint53(value, message) {
        if (typeof (value) !== "number") {
            return;
        }
        if (message == null) {
            message = "value not safe";
        }
        if (value < 0 || value >= 0x1fffffffffffff) {
            this.throwError(message, Logger.errors.NUMERIC_FAULT, {
                operation: "checkSafeInteger",
                fault: "out-of-safe-range",
                value: value
            });
        }
        if (value % 1) {
            this.throwError(message, Logger.errors.NUMERIC_FAULT, {
                operation: "checkSafeInteger",
                fault: "non-integer",
                value: value
            });
        }
    }
    checkArgumentCount(count, expectedCount, message) {
        if (message) {
            message = ": " + message;
        }
        else {
            message = "";
        }
        if (count < expectedCount) {
            this.throwError("missing argument" + message, Logger.errors.MISSING_ARGUMENT, {
                count: count,
                expectedCount: expectedCount
            });
        }
        if (count > expectedCount) {
            this.throwError("too many arguments" + message, Logger.errors.UNEXPECTED_ARGUMENT, {
                count: count,
                expectedCount: expectedCount
            });
        }
    }
    checkNew(target, kind) {
        if (target === Object || target == null) {
            this.throwError("missing new", Logger.errors.MISSING_NEW, { name: kind.name });
        }
    }
    checkAbstract(target, kind) {
        if (target === kind) {
            this.throwError("cannot instantiate abstract class " + JSON.stringify(kind.name) + " directly; use a sub-class", Logger.errors.UNSUPPORTED_OPERATION, { name: target.name, operation: "new" });
        }
        else if (target === Object || target == null) {
            this.throwError("missing new", Logger.errors.MISSING_NEW, { name: kind.name });
        }
    }
    static globalLogger() {
        if (!_globalLogger) {
            _globalLogger = new Logger(version);
        }
        return _globalLogger;
    }
    static setCensorship(censorship, permanent) {
        if (!censorship && permanent) {
            this.globalLogger().throwError("cannot permanently disable censorship", Logger.errors.UNSUPPORTED_OPERATION, {
                operation: "setCensorship"
            });
        }
        if (_permanentCensorErrors) {
            if (!censorship) {
                return;
            }
            this.globalLogger().throwError("error censorship permanent", Logger.errors.UNSUPPORTED_OPERATION, {
                operation: "setCensorship"
            });
        }
        _censorErrors = !!censorship;
        _permanentCensorErrors = !!permanent;
    }
    static setLogLevel(logLevel) {
        const level = LogLevels[logLevel.toLowerCase()];
        if (level == null) {
            Logger.globalLogger().warn("invalid log level - " + logLevel);
            return;
        }
        _logLevel = level;
    }
    static from(version) {
        return new Logger(version);
    }
}
Logger.errors = ErrorCode;
Logger.levels = LogLevel;

const version$1 = "bytes/5.8.0";

const logger = new Logger(version$1);
///////////////////////////////
function isHexable(value) {
    return !!(value.toHexString);
}
function isInteger(value) {
    return (typeof (value) === "number" && value == value && (value % 1) === 0);
}
function isBytes(value) {
    if (value == null) {
        return false;
    }
    if (value.constructor === Uint8Array) {
        return true;
    }
    if (typeof (value) === "string") {
        return false;
    }
    if (!isInteger(value.length) || value.length < 0) {
        return false;
    }
    for (let i = 0; i < value.length; i++) {
        const v = value[i];
        if (!isInteger(v) || v < 0 || v >= 256) {
            return false;
        }
    }
    return true;
}
function isHexString(value, length) {
    if (typeof (value) !== "string" || !value.match(/^0x[0-9A-Fa-f]*$/)) {
        return false;
    }
    if (length && value.length !== 2 + 2 * length) {
        return false;
    }
    return true;
}
const HexCharacters = "0123456789abcdef";
function hexlify(value, options) {
    if (!options) {
        options = {};
    }
    if (typeof (value) === "number") {
        logger.checkSafeUint53(value, "invalid hexlify value");
        let hex = "";
        while (value) {
            hex = HexCharacters[value & 0xf] + hex;
            value = Math.floor(value / 16);
        }
        if (hex.length) {
            if (hex.length % 2) {
                hex = "0" + hex;
            }
            return "0x" + hex;
        }
        return "0x00";
    }
    if (typeof (value) === "bigint") {
        value = value.toString(16);
        if (value.length % 2) {
            return ("0x0" + value);
        }
        return "0x" + value;
    }
    if (options.allowMissingPrefix && typeof (value) === "string" && value.substring(0, 2) !== "0x") {
        value = "0x" + value;
    }
    if (isHexable(value)) {
        return value.toHexString();
    }
    if (isHexString(value)) {
        if (value.length % 2) {
            if (options.hexPad === "left") {
                value = "0x0" + value.substring(2);
            }
            else if (options.hexPad === "right") {
                value += "0";
            }
            else {
                logger.throwArgumentError("hex data is odd-length", "value", value);
            }
        }
        return value.toLowerCase();
    }
    if (isBytes(value)) {
        let result = "0x";
        for (let i = 0; i < value.length; i++) {
            let v = value[i];
            result += HexCharacters[(v & 0xf0) >> 4] + HexCharacters[v & 0x0f];
        }
        return result;
    }
    return logger.throwArgumentError("invalid hexlify value", "value", value);
}

const version$2 = "bignumber/5.8.0";

var BN = bn.BN;
const logger$1 = new Logger(version$2);
const _constructorGuard = {};
const MAX_SAFE = 0x1fffffffffffff;
// Only warn about passing 10 into radix once
let _warnedToStringRadix = false;
class BigNumber {
    constructor(constructorGuard, hex) {
        if (constructorGuard !== _constructorGuard) {
            logger$1.throwError("cannot call constructor directly; use BigNumber.from", Logger.errors.UNSUPPORTED_OPERATION, {
                operation: "new (BigNumber)"
            });
        }
        this._hex = hex;
        this._isBigNumber = true;
        Object.freeze(this);
    }
    fromTwos(value) {
        return toBigNumber(toBN(this).fromTwos(value));
    }
    toTwos(value) {
        return toBigNumber(toBN(this).toTwos(value));
    }
    abs() {
        if (this._hex[0] === "-") {
            return BigNumber.from(this._hex.substring(1));
        }
        return this;
    }
    add(other) {
        return toBigNumber(toBN(this).add(toBN(other)));
    }
    sub(other) {
        return toBigNumber(toBN(this).sub(toBN(other)));
    }
    div(other) {
        const o = BigNumber.from(other);
        if (o.isZero()) {
            throwFault("division-by-zero", "div");
        }
        return toBigNumber(toBN(this).div(toBN(other)));
    }
    mul(other) {
        return toBigNumber(toBN(this).mul(toBN(other)));
    }
    mod(other) {
        const value = toBN(other);
        if (value.isNeg()) {
            throwFault("division-by-zero", "mod");
        }
        return toBigNumber(toBN(this).umod(value));
    }
    pow(other) {
        const value = toBN(other);
        if (value.isNeg()) {
            throwFault("negative-power", "pow");
        }
        return toBigNumber(toBN(this).pow(value));
    }
    and(other) {
        const value = toBN(other);
        if (this.isNegative() || value.isNeg()) {
            throwFault("unbound-bitwise-result", "and");
        }
        return toBigNumber(toBN(this).and(value));
    }
    or(other) {
        const value = toBN(other);
        if (this.isNegative() || value.isNeg()) {
            throwFault("unbound-bitwise-result", "or");
        }
        return toBigNumber(toBN(this).or(value));
    }
    xor(other) {
        const value = toBN(other);
        if (this.isNegative() || value.isNeg()) {
            throwFault("unbound-bitwise-result", "xor");
        }
        return toBigNumber(toBN(this).xor(value));
    }
    mask(value) {
        if (this.isNegative() || value < 0) {
            throwFault("negative-width", "mask");
        }
        return toBigNumber(toBN(this).maskn(value));
    }
    shl(value) {
        if (this.isNegative() || value < 0) {
            throwFault("negative-width", "shl");
        }
        return toBigNumber(toBN(this).shln(value));
    }
    shr(value) {
        if (this.isNegative() || value < 0) {
            throwFault("negative-width", "shr");
        }
        return toBigNumber(toBN(this).shrn(value));
    }
    eq(other) {
        return toBN(this).eq(toBN(other));
    }
    lt(other) {
        return toBN(this).lt(toBN(other));
    }
    lte(other) {
        return toBN(this).lte(toBN(other));
    }
    gt(other) {
        return toBN(this).gt(toBN(other));
    }
    gte(other) {
        return toBN(this).gte(toBN(other));
    }
    isNegative() {
        return (this._hex[0] === "-");
    }
    isZero() {
        return toBN(this).isZero();
    }
    toNumber() {
        try {
            return toBN(this).toNumber();
        }
        catch (error) {
            throwFault("overflow", "toNumber", this.toString());
        }
        return null;
    }
    toBigInt() {
        try {
            return BigInt(this.toString());
        }
        catch (e) { }
        return logger$1.throwError("this platform does not support BigInt", Logger.errors.UNSUPPORTED_OPERATION, {
            value: this.toString()
        });
    }
    toString() {
        // Lots of people expect this, which we do not support, so check (See: #889)
        if (arguments.length > 0) {
            if (arguments[0] === 10) {
                if (!_warnedToStringRadix) {
                    _warnedToStringRadix = true;
                    logger$1.warn("BigNumber.toString does not accept any parameters; base-10 is assumed");
                }
            }
            else if (arguments[0] === 16) {
                logger$1.throwError("BigNumber.toString does not accept any parameters; use bigNumber.toHexString()", Logger.errors.UNEXPECTED_ARGUMENT, {});
            }
            else {
                logger$1.throwError("BigNumber.toString does not accept parameters", Logger.errors.UNEXPECTED_ARGUMENT, {});
            }
        }
        return toBN(this).toString(10);
    }
    toHexString() {
        return this._hex;
    }
    toJSON(key) {
        return { type: "BigNumber", hex: this.toHexString() };
    }
    static from(value) {
        if (value instanceof BigNumber) {
            return value;
        }
        if (typeof (value) === "string") {
            if (value.match(/^-?0x[0-9a-f]+$/i)) {
                return new BigNumber(_constructorGuard, toHex$1(value));
            }
            if (value.match(/^-?[0-9]+$/)) {
                return new BigNumber(_constructorGuard, toHex$1(new BN(value)));
            }
            return logger$1.throwArgumentError("invalid BigNumber string", "value", value);
        }
        if (typeof (value) === "number") {
            if (value % 1) {
                throwFault("underflow", "BigNumber.from", value);
            }
            if (value >= MAX_SAFE || value <= -MAX_SAFE) {
                throwFault("overflow", "BigNumber.from", value);
            }
            return BigNumber.from(String(value));
        }
        const anyValue = value;
        if (typeof (anyValue) === "bigint") {
            return BigNumber.from(anyValue.toString());
        }
        if (isBytes(anyValue)) {
            return BigNumber.from(hexlify(anyValue));
        }
        if (anyValue) {
            // Hexable interface (takes priority)
            if (anyValue.toHexString) {
                const hex = anyValue.toHexString();
                if (typeof (hex) === "string") {
                    return BigNumber.from(hex);
                }
            }
            else {
                // For now, handle legacy JSON-ified values (goes away in v6)
                let hex = anyValue._hex;
                // New-form JSON
                if (hex == null && anyValue.type === "BigNumber") {
                    hex = anyValue.hex;
                }
                if (typeof (hex) === "string") {
                    if (isHexString(hex) || (hex[0] === "-" && isHexString(hex.substring(1)))) {
                        return BigNumber.from(hex);
                    }
                }
            }
        }
        return logger$1.throwArgumentError("invalid BigNumber value", "value", value);
    }
    static isBigNumber(value) {
        return !!(value && value._isBigNumber);
    }
}
// Normalize the hex string
function toHex$1(value) {
    // For BN, call on the hex string
    if (typeof (value) !== "string") {
        return toHex$1(value.toString(16));
    }
    // If negative, prepend the negative sign to the normalized positive value
    if (value[0] === "-") {
        // Strip off the negative sign
        value = value.substring(1);
        // Cannot have multiple negative signs (e.g. "--0x04")
        if (value[0] === "-") {
            logger$1.throwArgumentError("invalid hex", "value", value);
        }
        // Call toHex on the positive component
        value = toHex$1(value);
        // Do not allow "-0x00"
        if (value === "0x00") {
            return value;
        }
        // Negate the value
        return "-" + value;
    }
    // Add a "0x" prefix if missing
    if (value.substring(0, 2) !== "0x") {
        value = "0x" + value;
    }
    // Normalize zero
    if (value === "0x") {
        return "0x00";
    }
    // Make the string even length
    if (value.length % 2) {
        value = "0x0" + value.substring(2);
    }
    // Trim to smallest even-length string
    while (value.length > 4 && value.substring(0, 4) === "0x00") {
        value = "0x" + value.substring(4);
    }
    return value;
}
function toBigNumber(value) {
    return BigNumber.from(toHex$1(value));
}
function toBN(value) {
    const hex = BigNumber.from(value).toHexString();
    if (hex[0] === "-") {
        return (new BN("-" + hex.substring(3), 16));
    }
    return new BN(hex.substring(2), 16);
}
function throwFault(fault, operation, value) {
    const params = { fault: fault, operation: operation };
    if (value != null) {
        params.value = value;
    }
    return logger$1.throwError(fault, Logger.errors.NUMERIC_FAULT, params);
}

var IRouterV1 = [
	{
		inputs: [
			{
				internalType: "address",
				name: "_factory",
				type: "address"
			},
			{
				internalType: "address",
				name: "_WETH",
				type: "address"
			}
		],
		stateMutability: "nonpayable",
		type: "constructor"
	},
	{
		inputs: [
		],
		name: "WETH",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "tokenA",
				type: "address"
			},
			{
				internalType: "address",
				name: "tokenB",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "amountADesired",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountBDesired",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountAMin",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountBMin",
				type: "uint256"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256"
			}
		],
		name: "addLiquidity",
		outputs: [
			{
				internalType: "uint256",
				name: "amountA",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountB",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "liquidity",
				type: "uint256"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "token",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "amountTokenDesired",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountTokenMin",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountETHMin",
				type: "uint256"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256"
			}
		],
		name: "addLiquidityETH",
		outputs: [
			{
				internalType: "uint256",
				name: "amountToken",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountETH",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "liquidity",
				type: "uint256"
			}
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
		],
		name: "factory",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "amountOut",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "reserveIn",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "reserveOut",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "kappa",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "oPrice",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "fee",
				type: "uint256"
			},
			{
				internalType: "bool",
				name: "zeroForOne",
				type: "bool"
			}
		],
		name: "getAmountIn",
		outputs: [
			{
				internalType: "uint256",
				name: "amountIn",
				type: "uint256"
			}
		],
		stateMutability: "pure",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "amountIn",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "reserveIn",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "reserveOut",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "kappa",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "oPrice",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "fee",
				type: "uint256"
			},
			{
				internalType: "bool",
				name: "zeroForOne",
				type: "bool"
			}
		],
		name: "getAmountOut",
		outputs: [
			{
				internalType: "uint256",
				name: "amountOut",
				type: "uint256"
			}
		],
		stateMutability: "pure",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "amountIn",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "reserveIn",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "reserveOut",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "kappa",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "oPrice",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "fee",
				type: "uint256"
			},
			{
				internalType: "bool",
				name: "zeroForOne",
				type: "bool"
			},
			{
				internalType: "uint256",
				name: "tolerance",
				type: "uint256"
			}
		],
		name: "getAmountOutWithTolerance",
		outputs: [
			{
				internalType: "uint256",
				name: "amountOut",
				type: "uint256"
			}
		],
		stateMutability: "pure",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "amountOut",
				type: "uint256"
			},
			{
				internalType: "address[]",
				name: "path",
				type: "address[]"
			}
		],
		name: "getAmountsIn",
		outputs: [
			{
				internalType: "uint256[]",
				name: "amounts",
				type: "uint256[]"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "amountIn",
				type: "uint256"
			},
			{
				internalType: "address[]",
				name: "path",
				type: "address[]"
			}
		],
		name: "getAmountsOut",
		outputs: [
			{
				internalType: "uint256[]",
				name: "amounts",
				type: "uint256[]"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "amountIn",
				type: "uint256"
			},
			{
				internalType: "address[]",
				name: "path",
				type: "address[]"
			},
			{
				internalType: "uint256",
				name: "tolerance",
				type: "uint256"
			}
		],
		name: "getAmountsOutWithTolerance",
		outputs: [
			{
				internalType: "uint256[]",
				name: "amounts",
				type: "uint256[]"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "amountA",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "reserveA",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "reserveB",
				type: "uint256"
			}
		],
		name: "quote",
		outputs: [
			{
				internalType: "uint256",
				name: "amountB",
				type: "uint256"
			}
		],
		stateMutability: "pure",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "tokenA",
				type: "address"
			},
			{
				internalType: "address",
				name: "tokenB",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "liquidity",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountAMin",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountBMin",
				type: "uint256"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256"
			}
		],
		name: "removeLiquidity",
		outputs: [
			{
				internalType: "uint256",
				name: "amountA",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountB",
				type: "uint256"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "token",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "liquidity",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountTokenMin",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountETHMin",
				type: "uint256"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256"
			}
		],
		name: "removeLiquidityETH",
		outputs: [
			{
				internalType: "uint256",
				name: "amountToken",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountETH",
				type: "uint256"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "token",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "liquidity",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountTokenMin",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountETHMin",
				type: "uint256"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256"
			}
		],
		name: "removeLiquidityETHSupportingFeeOnTransferTokens",
		outputs: [
			{
				internalType: "uint256",
				name: "amountETH",
				type: "uint256"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "token",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "liquidity",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountTokenMin",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountETHMin",
				type: "uint256"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256"
			},
			{
				internalType: "bool",
				name: "approveMax",
				type: "bool"
			},
			{
				internalType: "uint8",
				name: "v",
				type: "uint8"
			},
			{
				internalType: "bytes32",
				name: "r",
				type: "bytes32"
			},
			{
				internalType: "bytes32",
				name: "s",
				type: "bytes32"
			}
		],
		name: "removeLiquidityETHWithPermit",
		outputs: [
			{
				internalType: "uint256",
				name: "amountToken",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountETH",
				type: "uint256"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "token",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "liquidity",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountTokenMin",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountETHMin",
				type: "uint256"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256"
			},
			{
				internalType: "bool",
				name: "approveMax",
				type: "bool"
			},
			{
				internalType: "uint8",
				name: "v",
				type: "uint8"
			},
			{
				internalType: "bytes32",
				name: "r",
				type: "bytes32"
			},
			{
				internalType: "bytes32",
				name: "s",
				type: "bytes32"
			}
		],
		name: "removeLiquidityETHWithPermitSupportingFeeOnTransferTokens",
		outputs: [
			{
				internalType: "uint256",
				name: "amountETH",
				type: "uint256"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "tokenA",
				type: "address"
			},
			{
				internalType: "address",
				name: "tokenB",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "liquidity",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountAMin",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountBMin",
				type: "uint256"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256"
			},
			{
				internalType: "bool",
				name: "approveMax",
				type: "bool"
			},
			{
				internalType: "uint8",
				name: "v",
				type: "uint8"
			},
			{
				internalType: "bytes32",
				name: "r",
				type: "bytes32"
			},
			{
				internalType: "bytes32",
				name: "s",
				type: "bytes32"
			}
		],
		name: "removeLiquidityWithPermit",
		outputs: [
			{
				internalType: "uint256",
				name: "amountA",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountB",
				type: "uint256"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "amountOut",
				type: "uint256"
			},
			{
				internalType: "address[]",
				name: "path",
				type: "address[]"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256"
			}
		],
		name: "swapETHForExactTokens",
		outputs: [
			{
				internalType: "uint256[]",
				name: "amounts",
				type: "uint256[]"
			}
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "amountOutMin",
				type: "uint256"
			},
			{
				internalType: "address[]",
				name: "path",
				type: "address[]"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256"
			}
		],
		name: "swapExactETHForTokens",
		outputs: [
			{
				internalType: "uint256[]",
				name: "amounts",
				type: "uint256[]"
			}
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "amountOutMin",
				type: "uint256"
			},
			{
				internalType: "address[]",
				name: "path",
				type: "address[]"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256"
			}
		],
		name: "swapExactETHForTokensSupportingFeeOnTransferTokens",
		outputs: [
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "amountIn",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountOutMin",
				type: "uint256"
			},
			{
				internalType: "address[]",
				name: "path",
				type: "address[]"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256"
			}
		],
		name: "swapExactTokensForETH",
		outputs: [
			{
				internalType: "uint256[]",
				name: "amounts",
				type: "uint256[]"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "amountIn",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountOutMin",
				type: "uint256"
			},
			{
				internalType: "address[]",
				name: "path",
				type: "address[]"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256"
			}
		],
		name: "swapExactTokensForETHSupportingFeeOnTransferTokens",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "amountIn",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountOutMin",
				type: "uint256"
			},
			{
				internalType: "address[]",
				name: "path",
				type: "address[]"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256"
			}
		],
		name: "swapExactTokensForTokens",
		outputs: [
			{
				internalType: "uint256[]",
				name: "amounts",
				type: "uint256[]"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "amountIn",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountOutMin",
				type: "uint256"
			},
			{
				internalType: "address[]",
				name: "path",
				type: "address[]"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256"
			}
		],
		name: "swapExactTokensForTokensSupportingFeeOnTransferTokens",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "amountOut",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountInMax",
				type: "uint256"
			},
			{
				internalType: "address[]",
				name: "path",
				type: "address[]"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256"
			}
		],
		name: "swapTokensForExactETH",
		outputs: [
			{
				internalType: "uint256[]",
				name: "amounts",
				type: "uint256[]"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "amountOut",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountInMax",
				type: "uint256"
			},
			{
				internalType: "address[]",
				name: "path",
				type: "address[]"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256"
			}
		],
		name: "swapTokensForExactTokens",
		outputs: [
			{
				internalType: "uint256[]",
				name: "amounts",
				type: "uint256[]"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		stateMutability: "payable",
		type: "receive"
	}
];

function isZero(hexNumberString) {
  return /^0x0*$/.test(hexNumberString);
}
function calculateGasMargin(value) {
  return value.mul(BigNumber.from(10000).add(BigNumber.from(1000))).div(BigNumber.from(10000));
}
function isAddress(value) {
  try {
    return address.getAddress(value);
  } catch (_unused) {
    return false;
  }
}
function getSigner(library, account) {
  return library.getSigner(account).connectUnchecked();
}
function getProviderOrSigner(library, account) {
  return account ? getSigner(library, account) : library;
}
function getContract(address, ABI, library, account) {
  if (!isAddress(address) || address === AddressZero) {
    throw Error("Invalid 'address' parameter '" + address + "'.");
  }
  return new contracts.Contract(address, ABI, getProviderOrSigner(library, account));
}
function getRouterContract(chainId, library, account) {
  var IRouter = isRouterV2(chainId) ? IRouterV2 : IRouterV1;
  return getContract(ROUTER_ADDRESS[chainId], IRouter, library, account);
}
function getRouterContractWithPrice(_, library, account) {
  return getContract(ROUTER_ADDRESS_WITH_PRICE[_], IRouterWithPrice, library, account);
}
function calculateSlippageAmount(value, slippage) {
  if (slippage < 0 || slippage > 10000) {
    throw Error("Unexpected slippage value: " + slippage);
  }
  return [JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 - slippage)), JSBI.BigInt(10000)), JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 + slippage)), JSBI.BigInt(10000))];
}

var ISNPair = [
	{
		name: "BrownAMMPairImpl",
		type: "impl",
		interface_name: "brown_amm::interfaces::pair::IBrownAMMPair"
	},
	{
		name: "core::integer::u256",
		type: "struct",
		members: [
			{
				name: "low",
				type: "core::integer::u128"
			},
			{
				name: "high",
				type: "core::integer::u128"
			}
		]
	},
	{
		name: "core::bool",
		type: "enum",
		variants: [
			{
				name: "False",
				type: "()"
			},
			{
				name: "True",
				type: "()"
			}
		]
	},
	{
		name: "brown_amm::interfaces::pair::Snapshot",
		type: "struct",
		members: [
			{
				name: "token0",
				type: "core::starknet::contract_address::ContractAddress"
			},
			{
				name: "token1",
				type: "core::starknet::contract_address::ContractAddress"
			},
			{
				name: "decimal0",
				type: "core::integer::u256"
			},
			{
				name: "decimal1",
				type: "core::integer::u256"
			},
			{
				name: "reserve0",
				type: "core::integer::u256"
			},
			{
				name: "reserve1",
				type: "core::integer::u256"
			}
		]
	},
	{
		name: "brown_amm::interfaces::pair::IBrownAMMPair",
		type: "interface",
		items: [
			{
				name: "name",
				type: "function",
				inputs: [
				],
				outputs: [
					{
						type: "core::felt252"
					}
				],
				state_mutability: "view"
			},
			{
				name: "symbol",
				type: "function",
				inputs: [
				],
				outputs: [
					{
						type: "core::felt252"
					}
				],
				state_mutability: "view"
			},
			{
				name: "decimals",
				type: "function",
				inputs: [
				],
				outputs: [
					{
						type: "core::integer::u8"
					}
				],
				state_mutability: "view"
			},
			{
				name: "total_supply",
				type: "function",
				inputs: [
				],
				outputs: [
					{
						type: "core::integer::u256"
					}
				],
				state_mutability: "view"
			},
			{
				name: "balance_of",
				type: "function",
				inputs: [
					{
						name: "account",
						type: "core::starknet::contract_address::ContractAddress"
					}
				],
				outputs: [
					{
						type: "core::integer::u256"
					}
				],
				state_mutability: "view"
			},
			{
				name: "allowance",
				type: "function",
				inputs: [
					{
						name: "owner",
						type: "core::starknet::contract_address::ContractAddress"
					},
					{
						name: "spender",
						type: "core::starknet::contract_address::ContractAddress"
					}
				],
				outputs: [
					{
						type: "core::integer::u256"
					}
				],
				state_mutability: "view"
			},
			{
				name: "approve",
				type: "function",
				inputs: [
					{
						name: "spender",
						type: "core::starknet::contract_address::ContractAddress"
					},
					{
						name: "amount",
						type: "core::integer::u256"
					}
				],
				outputs: [
					{
						type: "core::bool"
					}
				],
				state_mutability: "external"
			},
			{
				name: "increase_allowance",
				type: "function",
				inputs: [
					{
						name: "spender",
						type: "core::starknet::contract_address::ContractAddress"
					},
					{
						name: "addedValue",
						type: "core::integer::u256"
					}
				],
				outputs: [
					{
						type: "core::bool"
					}
				],
				state_mutability: "external"
			},
			{
				name: "decrease_allowance",
				type: "function",
				inputs: [
					{
						name: "spender",
						type: "core::starknet::contract_address::ContractAddress"
					},
					{
						name: "subtractedValue",
						type: "core::integer::u256"
					}
				],
				outputs: [
					{
						type: "core::bool"
					}
				],
				state_mutability: "external"
			},
			{
				name: "transfer",
				type: "function",
				inputs: [
					{
						name: "recipient",
						type: "core::starknet::contract_address::ContractAddress"
					},
					{
						name: "amount",
						type: "core::integer::u256"
					}
				],
				outputs: [
					{
						type: "core::bool"
					}
				],
				state_mutability: "external"
			},
			{
				name: "transfer_from",
				type: "function",
				inputs: [
					{
						name: "sender",
						type: "core::starknet::contract_address::ContractAddress"
					},
					{
						name: "recipient",
						type: "core::starknet::contract_address::ContractAddress"
					},
					{
						name: "amount",
						type: "core::integer::u256"
					}
				],
				outputs: [
					{
						type: "core::bool"
					}
				],
				state_mutability: "external"
			},
			{
				name: "factory",
				type: "function",
				inputs: [
				],
				outputs: [
					{
						type: "core::starknet::contract_address::ContractAddress"
					}
				],
				state_mutability: "view"
			},
			{
				name: "token0",
				type: "function",
				inputs: [
				],
				outputs: [
					{
						type: "core::starknet::contract_address::ContractAddress"
					}
				],
				state_mutability: "view"
			},
			{
				name: "token1",
				type: "function",
				inputs: [
				],
				outputs: [
					{
						type: "core::starknet::contract_address::ContractAddress"
					}
				],
				state_mutability: "view"
			},
			{
				name: "fee_vault",
				type: "function",
				inputs: [
				],
				outputs: [
					{
						type: "core::starknet::contract_address::ContractAddress"
					}
				],
				state_mutability: "view"
			},
			{
				name: "snapshot",
				type: "function",
				inputs: [
				],
				outputs: [
					{
						type: "brown_amm::interfaces::pair::Snapshot"
					}
				],
				state_mutability: "view"
			},
			{
				name: "get_reserves",
				type: "function",
				inputs: [
				],
				outputs: [
					{
						type: "(core::integer::u256, core::integer::u256, core::integer::u64)"
					}
				],
				state_mutability: "view"
			},
			{
				name: "price0_cumulative_last",
				type: "function",
				inputs: [
				],
				outputs: [
					{
						type: "core::integer::u256"
					}
				],
				state_mutability: "view"
			},
			{
				name: "price1_cumulative_last",
				type: "function",
				inputs: [
				],
				outputs: [
					{
						type: "core::integer::u256"
					}
				],
				state_mutability: "view"
			},
			{
				name: "invariant_k",
				type: "function",
				inputs: [
				],
				outputs: [
					{
						type: "core::integer::u256"
					}
				],
				state_mutability: "view"
			},
			{
				name: "mint",
				type: "function",
				inputs: [
					{
						name: "to",
						type: "core::starknet::contract_address::ContractAddress"
					}
				],
				outputs: [
					{
						type: "core::integer::u256"
					}
				],
				state_mutability: "external"
			},
			{
				name: "burn",
				type: "function",
				inputs: [
					{
						name: "to",
						type: "core::starknet::contract_address::ContractAddress"
					}
				],
				outputs: [
					{
						type: "(core::integer::u256, core::integer::u256)"
					}
				],
				state_mutability: "external"
			},
			{
				name: "swap",
				type: "function",
				inputs: [
					{
						name: "amount0In",
						type: "core::integer::u256"
					},
					{
						name: "amount1In",
						type: "core::integer::u256"
					},
					{
						name: "to",
						type: "core::starknet::contract_address::ContractAddress"
					},
					{
						name: "data",
						type: "core::array::Array::<core::felt252>"
					}
				],
				outputs: [
				],
				state_mutability: "external"
			},
			{
				name: "skim",
				type: "function",
				inputs: [
					{
						name: "to",
						type: "core::starknet::contract_address::ContractAddress"
					}
				],
				outputs: [
				],
				state_mutability: "external"
			},
			{
				name: "sync",
				type: "function",
				inputs: [
				],
				outputs: [
				],
				state_mutability: "external"
			},
			{
				name: "claim_fees",
				type: "function",
				inputs: [
				],
				outputs: [
				],
				state_mutability: "external"
			},
			{
				name: "get_amount_in",
				type: "function",
				inputs: [
					{
						name: "tokenOut",
						type: "core::starknet::contract_address::ContractAddress"
					},
					{
						name: "amountOut",
						type: "core::integer::u256"
					}
				],
				outputs: [
					{
						type: "core::integer::u256"
					}
				],
				state_mutability: "external"
			}
		]
	},
	{
		name: "BrownAMMPairCamelOnlyImpl",
		type: "impl",
		interface_name: "brown_amm::interfaces::pair::IBrownAMMPairCamelOnly"
	},
	{
		name: "brown_amm::interfaces::pair::IBrownAMMPairCamelOnly",
		type: "interface",
		items: [
			{
				name: "totalSupply",
				type: "function",
				inputs: [
				],
				outputs: [
					{
						type: "core::integer::u256"
					}
				],
				state_mutability: "view"
			},
			{
				name: "balanceOf",
				type: "function",
				inputs: [
					{
						name: "account",
						type: "core::starknet::contract_address::ContractAddress"
					}
				],
				outputs: [
					{
						type: "core::integer::u256"
					}
				],
				state_mutability: "view"
			},
			{
				name: "increaseAllowance",
				type: "function",
				inputs: [
					{
						name: "spender",
						type: "core::starknet::contract_address::ContractAddress"
					},
					{
						name: "addedValue",
						type: "core::integer::u256"
					}
				],
				outputs: [
					{
						type: "core::bool"
					}
				],
				state_mutability: "external"
			},
			{
				name: "decreaseAllowance",
				type: "function",
				inputs: [
					{
						name: "spender",
						type: "core::starknet::contract_address::ContractAddress"
					},
					{
						name: "subtractedValue",
						type: "core::integer::u256"
					}
				],
				outputs: [
					{
						type: "core::bool"
					}
				],
				state_mutability: "external"
			},
			{
				name: "transferFrom",
				type: "function",
				inputs: [
					{
						name: "sender",
						type: "core::starknet::contract_address::ContractAddress"
					},
					{
						name: "recipient",
						type: "core::starknet::contract_address::ContractAddress"
					},
					{
						name: "amount",
						type: "core::integer::u256"
					}
				],
				outputs: [
					{
						type: "core::bool"
					}
				],
				state_mutability: "external"
			},
			{
				name: "getReserves",
				type: "function",
				inputs: [
				],
				outputs: [
					{
						type: "(core::integer::u256, core::integer::u256, core::integer::u64)"
					}
				],
				state_mutability: "view"
			},
			{
				name: "price0CumulativeLast",
				type: "function",
				inputs: [
				],
				outputs: [
					{
						type: "core::integer::u256"
					}
				],
				state_mutability: "view"
			},
			{
				name: "price1CumulativeLast",
				type: "function",
				inputs: [
				],
				outputs: [
					{
						type: "core::integer::u256"
					}
				],
				state_mutability: "view"
			},
			{
				name: "getAmountIn",
				type: "function",
				inputs: [
					{
						name: "tokenOut",
						type: "core::starknet::contract_address::ContractAddress"
					},
					{
						name: "amountOut",
						type: "core::integer::u256"
					}
				],
				outputs: [
					{
						type: "core::integer::u256"
					}
				],
				state_mutability: "external"
			}
		]
	},
	{
		name: "UpgradableImpl",
		type: "impl",
		interface_name: "brown_amm::utils::upgradable::IUpgradable"
	},
	{
		name: "brown_amm::utils::upgradable::IUpgradable",
		type: "interface",
		items: [
			{
				name: "upgrade",
				type: "function",
				inputs: [
					{
						name: "new_class_hash",
						type: "core::starknet::class_hash::ClassHash"
					}
				],
				outputs: [
				],
				state_mutability: "external"
			}
		]
	},
	{
		name: "constructor",
		type: "constructor",
		inputs: [
			{
				name: "tokenA",
				type: "core::starknet::contract_address::ContractAddress"
			},
			{
				name: "tokenB",
				type: "core::starknet::contract_address::ContractAddress"
			},
			{
				name: "vault_class_hash",
				type: "core::starknet::class_hash::ClassHash"
			}
		]
	},
	{
		name: "brown_amm::interfaces::pair::RelativeFeesAccum",
		type: "struct",
		members: [
			{
				name: "token0",
				type: "core::integer::u256"
			},
			{
				name: "token1",
				type: "core::integer::u256"
			},
			{
				name: "claimable0",
				type: "core::integer::u256"
			},
			{
				name: "claimable1",
				type: "core::integer::u256"
			}
		]
	},
	{
		name: "brown_amm::interfaces::pair::GlobalFeesAccum",
		type: "struct",
		members: [
			{
				name: "token0",
				type: "core::integer::u256"
			},
			{
				name: "token1",
				type: "core::integer::u256"
			}
		]
	},
	{
		name: "fee_state",
		type: "function",
		inputs: [
			{
				name: "user",
				type: "core::starknet::contract_address::ContractAddress"
			}
		],
		outputs: [
			{
				type: "(core::integer::u256, brown_amm::interfaces::pair::RelativeFeesAccum, brown_amm::interfaces::pair::GlobalFeesAccum)"
			}
		],
		state_mutability: "view"
	},
	{
		name: "feeState",
		type: "function",
		inputs: [
			{
				name: "user",
				type: "core::starknet::contract_address::ContractAddress"
			}
		],
		outputs: [
			{
				type: "(core::integer::u256, brown_amm::interfaces::pair::RelativeFeesAccum, brown_amm::interfaces::pair::GlobalFeesAccum)"
			}
		],
		state_mutability: "view"
	},
	{
		kind: "struct",
		name: "brown_amm::pair::BrownAMMPair::Mint",
		type: "event",
		members: [
			{
				kind: "key",
				name: "sender",
				type: "core::starknet::contract_address::ContractAddress"
			},
			{
				kind: "data",
				name: "amount0",
				type: "core::integer::u256"
			},
			{
				kind: "data",
				name: "amount1",
				type: "core::integer::u256"
			}
		]
	},
	{
		kind: "struct",
		name: "brown_amm::pair::BrownAMMPair::Burn",
		type: "event",
		members: [
			{
				kind: "key",
				name: "sender",
				type: "core::starknet::contract_address::ContractAddress"
			},
			{
				kind: "data",
				name: "amount0",
				type: "core::integer::u256"
			},
			{
				kind: "data",
				name: "amount1",
				type: "core::integer::u256"
			},
			{
				kind: "key",
				name: "to",
				type: "core::starknet::contract_address::ContractAddress"
			}
		]
	},
	{
		kind: "struct",
		name: "brown_amm::pair::BrownAMMPair::Swap",
		type: "event",
		members: [
			{
				kind: "key",
				name: "sender",
				type: "core::starknet::contract_address::ContractAddress"
			},
			{
				kind: "data",
				name: "amount0In",
				type: "core::integer::u256"
			},
			{
				kind: "data",
				name: "amount1In",
				type: "core::integer::u256"
			},
			{
				kind: "data",
				name: "amount0Out",
				type: "core::integer::u256"
			},
			{
				kind: "data",
				name: "amount1Out",
				type: "core::integer::u256"
			},
			{
				kind: "key",
				name: "to",
				type: "core::starknet::contract_address::ContractAddress"
			}
		]
	},
	{
		kind: "struct",
		name: "brown_amm::pair::BrownAMMPair::Sync",
		type: "event",
		members: [
			{
				kind: "data",
				name: "reserve0",
				type: "core::integer::u256"
			},
			{
				kind: "data",
				name: "reserve1",
				type: "core::integer::u256"
			}
		]
	},
	{
		kind: "struct",
		name: "brown_amm::pair::BrownAMMPair::Claim",
		type: "event",
		members: [
			{
				kind: "key",
				name: "sender",
				type: "core::starknet::contract_address::ContractAddress"
			},
			{
				kind: "data",
				name: "amount0",
				type: "core::integer::u256"
			},
			{
				kind: "data",
				name: "amount1",
				type: "core::integer::u256"
			},
			{
				kind: "key",
				name: "to",
				type: "core::starknet::contract_address::ContractAddress"
			}
		]
	},
	{
		kind: "enum",
		name: "brown_amm::pair::BrownAMMPair::Event",
		type: "event",
		variants: [
			{
				kind: "nested",
				name: "Mint",
				type: "brown_amm::pair::BrownAMMPair::Mint"
			},
			{
				kind: "nested",
				name: "Burn",
				type: "brown_amm::pair::BrownAMMPair::Burn"
			},
			{
				kind: "nested",
				name: "Swap",
				type: "brown_amm::pair::BrownAMMPair::Swap"
			},
			{
				kind: "nested",
				name: "Sync",
				type: "brown_amm::pair::BrownAMMPair::Sync"
			},
			{
				kind: "nested",
				name: "Claim",
				type: "brown_amm::pair::BrownAMMPair::Claim"
			}
		]
	}
];

var ISNRouter = [
	{
		name: "BrownAMMRouterImp",
		type: "impl",
		interface_name: "brown_amm::interfaces::router::IBrownAMMRouter"
	},
	{
		name: "core::integer::u256",
		type: "struct",
		members: [
			{
				name: "low",
				type: "core::integer::u128"
			},
			{
				name: "high",
				type: "core::integer::u128"
			}
		]
	},
	{
		name: "brown_amm::interfaces::router::SwapPath",
		type: "struct",
		members: [
			{
				name: "tokenIn",
				type: "core::starknet::contract_address::ContractAddress"
			},
			{
				name: "tokenOut",
				type: "core::starknet::contract_address::ContractAddress"
			}
		]
	},
	{
		name: "core::bool",
		type: "enum",
		variants: [
			{
				name: "False",
				type: "()"
			},
			{
				name: "True",
				type: "()"
			}
		]
	},
	{
		name: "brown_amm::interfaces::router::IBrownAMMRouter",
		type: "interface",
		items: [
			{
				name: "factory",
				type: "function",
				inputs: [
				],
				outputs: [
					{
						type: "core::starknet::contract_address::ContractAddress"
					}
				],
				state_mutability: "view"
			},
			{
				name: "sort_tokens",
				type: "function",
				inputs: [
					{
						name: "tokenA",
						type: "core::starknet::contract_address::ContractAddress"
					},
					{
						name: "tokenB",
						type: "core::starknet::contract_address::ContractAddress"
					}
				],
				outputs: [
					{
						type: "(core::starknet::contract_address::ContractAddress, core::starknet::contract_address::ContractAddress)"
					}
				],
				state_mutability: "view"
			},
			{
				name: "quote",
				type: "function",
				inputs: [
					{
						name: "amountA",
						type: "core::integer::u256"
					},
					{
						name: "reserveA",
						type: "core::integer::u256"
					},
					{
						name: "reserveB",
						type: "core::integer::u256"
					}
				],
				outputs: [
					{
						type: "core::integer::u256"
					}
				],
				state_mutability: "view"
			},
			{
				name: "get_amounts_out",
				type: "function",
				inputs: [
					{
						name: "amountIn",
						type: "core::integer::u256"
					},
					{
						name: "path",
						type: "core::array::Array::<brown_amm::interfaces::router::SwapPath>"
					}
				],
				outputs: [
					{
						type: "core::array::Array::<core::integer::u256>"
					}
				],
				state_mutability: "view"
			},
			{
				name: "add_liquidity",
				type: "function",
				inputs: [
					{
						name: "tokenA",
						type: "core::starknet::contract_address::ContractAddress"
					},
					{
						name: "tokenB",
						type: "core::starknet::contract_address::ContractAddress"
					},
					{
						name: "stable",
						type: "core::bool"
					},
					{
						name: "feeTier",
						type: "core::integer::u8"
					},
					{
						name: "amountADesired",
						type: "core::integer::u256"
					},
					{
						name: "amountBDesired",
						type: "core::integer::u256"
					},
					{
						name: "amountAMin",
						type: "core::integer::u256"
					},
					{
						name: "amountBMin",
						type: "core::integer::u256"
					},
					{
						name: "to",
						type: "core::starknet::contract_address::ContractAddress"
					},
					{
						name: "deadline",
						type: "core::integer::u64"
					}
				],
				outputs: [
					{
						type: "(core::integer::u256, core::integer::u256, core::integer::u256)"
					}
				],
				state_mutability: "external"
			},
			{
				name: "remove_liquidity",
				type: "function",
				inputs: [
					{
						name: "tokenA",
						type: "core::starknet::contract_address::ContractAddress"
					},
					{
						name: "tokenB",
						type: "core::starknet::contract_address::ContractAddress"
					},
					{
						name: "stable",
						type: "core::bool"
					},
					{
						name: "feeTier",
						type: "core::integer::u8"
					},
					{
						name: "liquidity",
						type: "core::integer::u256"
					},
					{
						name: "amountAMin",
						type: "core::integer::u256"
					},
					{
						name: "amountBMin",
						type: "core::integer::u256"
					},
					{
						name: "to",
						type: "core::starknet::contract_address::ContractAddress"
					},
					{
						name: "deadline",
						type: "core::integer::u64"
					}
				],
				outputs: [
					{
						type: "(core::integer::u256, core::integer::u256)"
					}
				],
				state_mutability: "external"
			},
			{
				name: "swap_exact_tokens_for_tokens",
				type: "function",
				inputs: [
					{
						name: "amountIn",
						type: "core::integer::u256"
					},
					{
						name: "amountOutMin",
						type: "core::integer::u256"
					},
					{
						name: "path",
						type: "core::array::Array::<brown_amm::interfaces::router::SwapPath>"
					},
					{
						name: "to",
						type: "core::starknet::contract_address::ContractAddress"
					},
					{
						name: "deadline",
						type: "core::integer::u64"
					}
				],
				outputs: [
					{
						type: "core::array::Array::<core::integer::u256>"
					}
				],
				state_mutability: "external"
			},
			{
				name: "swap_exact_tokens_for_tokens_supporting_fees_on_transfer_tokens",
				type: "function",
				inputs: [
					{
						name: "amountIn",
						type: "core::integer::u256"
					},
					{
						name: "amountOutMin",
						type: "core::integer::u256"
					},
					{
						name: "path",
						type: "core::array::Array::<brown_amm::interfaces::router::SwapPath>"
					},
					{
						name: "to",
						type: "core::starknet::contract_address::ContractAddress"
					},
					{
						name: "deadline",
						type: "core::integer::u64"
					}
				],
				outputs: [
				],
				state_mutability: "external"
			}
		]
	},
	{
		name: "UpgradableImpl",
		type: "impl",
		interface_name: "brown_amm::utils::upgradable::IUpgradable"
	},
	{
		name: "brown_amm::utils::upgradable::IUpgradable",
		type: "interface",
		items: [
			{
				name: "upgrade",
				type: "function",
				inputs: [
					{
						name: "new_class_hash",
						type: "core::starknet::class_hash::ClassHash"
					}
				],
				outputs: [
				],
				state_mutability: "external"
			}
		]
	},
	{
		name: "constructor",
		type: "constructor",
		inputs: [
			{
				name: "factory",
				type: "core::starknet::contract_address::ContractAddress"
			}
		]
	},
	{
		name: "set_factory",
		type: "function",
		inputs: [
			{
				name: "factory",
				type: "core::starknet::contract_address::ContractAddress"
			}
		],
		outputs: [
		],
		state_mutability: "external"
	},
	{
		kind: "enum",
		name: "brown_amm::router::BrownAMMRouter::Event",
		type: "event",
		variants: [
		]
	}
];

var callSwapContract = function callSwapContract(trade, account, allowedSlippage, recipient, chainId, library, deadline) {
  try {
    if (chainId === exports.ChainId.SN_SEPOLIA || chainId === exports.ChainId.SN_MAIN) {
      return callSwapContractStarknet(chainId, library, account, trade, allowedSlippage, deadline);
    }
    var swapCalls = getSwapCallArguments(trade, account, allowedSlippage, recipient, chainId, library, deadline);
    return Promise.resolve(Promise.all(swapCalls.map(function (call, index) {
      try {
        var _call$parameters = call.parameters,
          methodName = _call$parameters.methodName,
          args = _call$parameters.args,
          value = _call$parameters.value,
          contract = call.contract;
        return Promise.resolve(solidityPack(chainId, trade.route.path.map(function (token) {
          return token.address;
        }))).then(function (pack) {
          var _contract$estimateGas;
          args.push(pack);
          console.log('========= Swap', index);
          console.log({
            methodName: methodName,
            value: value
          });
          console.log(args);
          var options = !value || isZero(value) ? {} : {
            value: value
          };
          return (_contract$estimateGas = contract.estimateGas)[methodName].apply(_contract$estimateGas, args.concat([options])).then(function (gasEstimate) {
            return {
              call: call,
              gasEstimate: gasEstimate
            };
          })["catch"](function (gasError) {
            var _contract$callStatic;
            console.debug('Gas estimate failed, trying eth_call to extract error', call);
            return (_contract$callStatic = contract.callStatic)[methodName].apply(_contract$callStatic, args.concat([options])).then(function (result) {
              console.debug('Unexpected successful call after failed estimate gas', call, gasError, result);
              return {
                call: call,
                error: new Error('Unexpected issue with estimating the gas. Please try again.')
              };
            })["catch"](function (callError) {
              console.debug('Call threw error', call, callError);
              var errorMessage;
              switch (callError.reason) {
                case 'UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT':
                case 'UniswapV2Router: EXCESSIVE_INPUT_AMOUNT':
                  errorMessage = 'This transaction will not succeed either due to price movement or fee on transfer. Try increasing your slippage tolerance.';
                  break;
                default:
                  errorMessage = "The transaction cannot succeed due to error: " + callError.reason + ". This is probably an issue with one of the tokens you are swapping.";
              }
              return {
                call: call,
                error: new Error(errorMessage)
              };
            });
          });
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }))).then(function (estimatedCalls) {
      var successfulEstimation = estimatedCalls.find(function (el) {
        return el === null || el === void 0 ? void 0 : el.gasEstimate;
      });
      if (!successfulEstimation) {
        var errorCalls = estimatedCalls.filter(function (call) {
          return 'error' in call;
        });
        if (errorCalls.length > 0) throw errorCalls[errorCalls.length - 1].error;
        throw new Error('Unexpected error. Please contact support: none of the calls threw an error');
      }
      var _successfulEstimation = successfulEstimation.call,
        contract = _successfulEstimation.contract,
        _successfulEstimation2 = _successfulEstimation.parameters,
        methodName = _successfulEstimation2.methodName,
        args = _successfulEstimation2.args,
        value = _successfulEstimation2.value,
        gasEstimate = successfulEstimation.gasEstimate;
      return contract[methodName].apply(contract, args.concat([_extends({
        gasLimit: calculateGasMargin(gasEstimate)
      }, value && !isZero(value) ? {
        value: value,
        from: account
      } : {
        from: account
      })])).then(function (response) {
        return response;
      })["catch"](function (error) {
        if ((error === null || error === void 0 ? void 0 : error.code) === 4001) {
          throw new Error('Transaction rejected.');
        } else {
          console.error("Swap failed", error, methodName, args, value);
          throw new Error("Swap failed: " + error.message);
        }
      });
    });
  } catch (e) {
    return Promise.reject(e);
  }
};
(function (SwapCallbackState) {
  SwapCallbackState[SwapCallbackState["INVALID"] = 0] = "INVALID";
  SwapCallbackState[SwapCallbackState["LOADING"] = 1] = "LOADING";
  SwapCallbackState[SwapCallbackState["VALID"] = 2] = "VALID";
})(exports.SwapCallbackState || (exports.SwapCallbackState = {}));
function getSwapCallArguments(trade, account, allowedSlippage, recipient, chainId, library, deadline) {
  var contract = supportContractWithPrice(chainId) ? getRouterContractWithPrice(chainId, library, account) : getRouterContract(chainId, library, account);
  if (!contract) {
    return [];
  }
  var swapMethods = [];
  swapMethods.push(Router.swapCallParameters(trade, {
    feeOnTransfer: false,
    allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
    recipient: recipient,
    deadline: deadline.toNumber()
  }, chainId));
  return swapMethods.map(function (parameters) {
    return {
      parameters: parameters,
      contract: contract
    };
  });
}
var callSwapContractStarknet = function callSwapContractStarknet(chainId, library, account, trade, allowedSlippage, deadline) {
  try {
    return Promise.resolve(_catch(function () {
      if (!account || !allowedSlippage || !trade.inputAmount) {
        throw new Error('Unexpected error. Please contact support: none of the calls threw an error');
      }
      var approveCall = new starknet.Contract(ISNPair, trade.route.path[0].address, library).populate('approve', {
        spender: ROUTER_ADDRESS[chainId],
        amount: trade.inputAmount.raw.toString()
      });
      var swapCall = new starknet.Contract(ISNRouter, ROUTER_ADDRESS[chainId], library).populate('swap_exact_tokens_for_tokens', {
        amountIn: trade.inputAmount.raw.toString(),
        amountOutMin: '0',
        path: [{
          tokenIn: trade.route.path[0].address,
          tokenOut: trade.route.path[1].address
        }],
        to: library.address,
        deadline: deadline
      });
      return Promise.resolve(library.execute([approveCall, swapCall])).then(function (tx) {
        return {
          hash: tx.transaction_hash
        };
      });
    }, function (error) {
      console.error('user reject transaction', error);
      throw error;
    }));
  } catch (e) {
    return Promise.reject(e);
  }
};

function wrappedCurrency$1(currency, chainId) {
  return chainId && currency === ETHER ? WETH[chainId] : currency instanceof Token ? currency : undefined;
}

var removeLiquidity = function removeLiquidity(chainId, library, account, parsedAmounts, deadline, allowedSlippage, approval, signatureData) {
  try {
    var _ref3, _ref4;
    if (!chainId || !library || !account || !deadline) throw new Error('missing dependencies');
    var currencyAmountA = parsedAmounts[exports.Field.CURRENCY_A],
      currencyAmountB = parsedAmounts[exports.Field.CURRENCY_B],
      currencyA = parsedAmounts.currencyA,
      currencyB = parsedAmounts.currencyB;
    var liquidityAmount = parsedAmounts[exports.Field.LIQUIDITY];
    if (!liquidityAmount) throw new Error('missing liquidity amount');
    if (!currencyAmountA || !currencyAmountB) {
      throw new Error('missing currency amounts');
    }
    var tokenA = wrappedCurrency$1(currencyA, chainId);
    var tokenB = wrappedCurrency$1(currencyB, chainId);
    if (chainId === exports.ChainId.SN_MAIN || chainId === exports.ChainId.SN_SEPOLIA) {
      return removeLiquidityStarknet(chainId, account, library, liquidityAmount.raw.toString(), tokenA, tokenB, deadline);
    }
    var router = getRouterContract(chainId, library, account);
    var amountsMin = isTestnetSkipAmountsMin(chainId) ? (_ref3 = {}, _ref3[exports.Field.CURRENCY_A] = 0, _ref3[exports.Field.CURRENCY_B] = 0, _ref3) : (_ref4 = {}, _ref4[exports.Field.CURRENCY_A] = calculateSlippageAmount(currencyAmountA, allowedSlippage)[0], _ref4[exports.Field.CURRENCY_B] = calculateSlippageAmount(currencyAmountB, allowedSlippage)[0], _ref4);
    if (!currencyA || !currencyB) throw new Error('missing tokens');
    var currencyBIsETH = currencyB === ETHER;
    var oneCurrencyIsETH = currencyA === ETHER || currencyBIsETH;
    if (!tokenA || !tokenB) throw new Error('could not wrap');
    var methodNames, args;
    if (approval === exports.ApprovalState.APPROVED) {
      if (oneCurrencyIsETH) {
        methodNames = ['removeLiquidityETH', 'removeLiquidityETHSupportingFeeOnTransferTokens'];
        args = [currencyBIsETH ? tokenA.address : tokenB.address, liquidityAmount.raw.toString(), amountsMin[currencyBIsETH ? exports.Field.CURRENCY_A : exports.Field.CURRENCY_B].toString(), amountsMin[currencyBIsETH ? exports.Field.CURRENCY_B : exports.Field.CURRENCY_A].toString(), account, deadline.toHexString()];
      } else {
        methodNames = ['removeLiquidity'];
        args = [tokenA.address, tokenB.address, liquidityAmount.raw.toString(), amountsMin[exports.Field.CURRENCY_A].toString(), amountsMin[exports.Field.CURRENCY_B].toString(), account, deadline.toHexString()];
      }
    } else if (signatureData !== null) {
      if (oneCurrencyIsETH) {
        methodNames = ['removeLiquidityETHWithPermit', 'removeLiquidityETHWithPermitSupportingFeeOnTransferTokens'];
        args = [currencyBIsETH ? tokenA.address : tokenB.address, liquidityAmount.raw.toString(), amountsMin[currencyBIsETH ? exports.Field.CURRENCY_A : exports.Field.CURRENCY_B].toString(), amountsMin[currencyBIsETH ? exports.Field.CURRENCY_B : exports.Field.CURRENCY_A].toString(), account, signatureData.deadline, false, signatureData.v, signatureData.r, signatureData.s];
      } else {
        methodNames = ['removeLiquidityWithPermit'];
        args = [tokenA.address, tokenB.address, liquidityAmount.raw.toString(), amountsMin[exports.Field.CURRENCY_A].toString(), amountsMin[exports.Field.CURRENCY_B].toString(), account, signatureData.deadline, false, signatureData.v, signatureData.r, signatureData.s];
      }
    } else {
      throw new Error('Attempting to confirm without approval or a signature. Please contact support.');
    }
    return Promise.resolve(Promise.all(methodNames.map(function (methodName) {
      var _router$estimateGas;
      return (_router$estimateGas = router.estimateGas)[methodName].apply(_router$estimateGas, args).then(calculateGasMargin)["catch"](function (error) {
        console.error("estimateGas failed", methodName, args, error);
        return undefined;
      });
    }))).then(function (safeGasEstimates) {
      var indexOfSuccessfulEstimation = safeGasEstimates.findIndex(function (safeGasEstimate) {
        return BigNumber.isBigNumber(safeGasEstimate);
      });
      return function () {
        if (indexOfSuccessfulEstimation === -1) {
          console.error('This transaction would fail. Please contact support.');
        } else {
          var methodName = methodNames[indexOfSuccessfulEstimation];
          var safeGasEstimate = safeGasEstimates[indexOfSuccessfulEstimation];
          return Promise.resolve(router[methodName].apply(router, args.concat([{
            gasLimit: safeGasEstimate
          }])).then(function (response) {
            return response;
          })["catch"](function (e) {
            console.log(e);
            return null;
          }));
        }
      }();
    });
  } catch (e) {
    return Promise.reject(e);
  }
};
var addLiquidity = function addLiquidity(chainId, library, account, parsedAmountA, parsedAmountB, deadline, noLiquidity, allowedSlippage) {
  try {
    var _ref, _ref2;
    var _temp5 = function _temp5() {
      var _console;
      var inputs = isRouterV2(chainId) ? argsV2 : args;
      console.log('ADD LP ======== ', method);
      (_console = console).log.apply(_console, ['input'].concat(inputs));
      console.log('value', value);
      return Promise.resolve(estimate.apply(void 0, inputs.concat([value ? {
        value: value
      } : {}])).then(function (estimatedGasLimit) {
        return method.apply(void 0, inputs.concat([_extends({}, value ? {
          value: value
        } : {}, {
          gasLimit: calculateGasMargin(estimatedGasLimit)
        })])).then(function (response) {
          return response;
        });
      }));
    };
    if (!chainId || !library || !account) return Promise.resolve();
    if (chainId === exports.ChainId.SN_SEPOLIA || chainId === exports.ChainId.SN_MAIN) {
      return addLiquidityStarket(chainId, library, account, parsedAmountA, parsedAmountB, deadline);
    }
    var router = getRouterContract(chainId, library, account);
    var currencyA = parsedAmountA === null || parsedAmountA === void 0 ? void 0 : parsedAmountA.currency;
    var currencyB = parsedAmountB === null || parsedAmountB === void 0 ? void 0 : parsedAmountB.currency;
    if (!parsedAmountA || !parsedAmountB || !currencyA || !currencyB || !deadline) {
      return Promise.resolve();
    }
    var amountsMin = isTestnetSkipAmountsMin(chainId) ? (_ref = {}, _ref[exports.Field.CURRENCY_A] = 0, _ref[exports.Field.CURRENCY_B] = 0, _ref) : (_ref2 = {}, _ref2[exports.Field.CURRENCY_A] = calculateSlippageAmount(parsedAmountA, noLiquidity ? 0 : allowedSlippage)[0], _ref2[exports.Field.CURRENCY_B] = calculateSlippageAmount(parsedAmountB, noLiquidity ? 0 : allowedSlippage)[0], _ref2);
    var estimate, method, args, value;
    var argsV2;
    var _temp4 = function () {
      if (currencyA === ETHER || currencyB === ETHER) {
        var _wrappedCurrency$addr3, _wrappedCurrency3, _wrappedCurrency$addr4, _wrappedCurrency4, _wrappedCurrency$addr5, _wrappedCurrency5, _wrappedCurrency$addr6, _wrappedCurrency6;
        var tokenBIsETH = currencyB === ETHER;
        estimate = router.estimateGas.addLiquidityETH;
        method = router.addLiquidityETH;
        args = [(_wrappedCurrency$addr3 = (_wrappedCurrency3 = wrappedCurrency$1(tokenBIsETH ? currencyA : currencyB, chainId)) === null || _wrappedCurrency3 === void 0 ? void 0 : _wrappedCurrency3.address) != null ? _wrappedCurrency$addr3 : '', (tokenBIsETH ? parsedAmountA : parsedAmountB).raw.toString(), amountsMin[tokenBIsETH ? exports.Field.CURRENCY_A : exports.Field.CURRENCY_B].toString(), amountsMin[tokenBIsETH ? exports.Field.CURRENCY_B : exports.Field.CURRENCY_A].toString(), account, deadline.toHexString()];
        var _deadline$toHexString = deadline.toHexString(),
          _amountsMin$toString2 = amountsMin[tokenBIsETH ? exports.Field.CURRENCY_B : exports.Field.CURRENCY_A].toString(),
          _amountsMin$toString = amountsMin[tokenBIsETH ? exports.Field.CURRENCY_A : exports.Field.CURRENCY_B].toString(),
          _raw$toString = (tokenBIsETH ? parsedAmountA : parsedAmountB).raw.toString(),
          _temp = (_wrappedCurrency$addr4 = (_wrappedCurrency4 = wrappedCurrency$1(tokenBIsETH ? currencyA : currencyB, chainId)) === null || _wrappedCurrency4 === void 0 ? void 0 : _wrappedCurrency4.address) != null ? _wrappedCurrency$addr4 : '';
        return Promise.resolve(solidityPack(chainId, [(_wrappedCurrency$addr5 = (_wrappedCurrency5 = wrappedCurrency$1(currencyA, chainId)) === null || _wrappedCurrency5 === void 0 ? void 0 : _wrappedCurrency5.address) != null ? _wrappedCurrency$addr5 : '', (_wrappedCurrency$addr6 = (_wrappedCurrency6 = wrappedCurrency$1(currencyB, chainId)) === null || _wrappedCurrency6 === void 0 ? void 0 : _wrappedCurrency6.address) != null ? _wrappedCurrency$addr6 : ''])).then(function (_solidityPack) {
          argsV2 = [_temp, _raw$toString, _amountsMin$toString, _amountsMin$toString2, account, _deadline$toHexString, _solidityPack];
          value = BigNumber.from((tokenBIsETH ? parsedAmountB : parsedAmountA).raw.toString());
        });
      } else {
        var _wrappedCurrency$addr7, _wrappedCurrency7, _wrappedCurrency$addr8, _wrappedCurrency8, _wrappedCurrency$addr9, _wrappedCurrency9, _wrappedCurrency$addr10, _wrappedCurrency10, _wrappedCurrency$addr11, _wrappedCurrency11, _wrappedCurrency$addr12, _wrappedCurrency12;
        estimate = router.estimateGas.addLiquidity;
        method = router.addLiquidity;
        args = [(_wrappedCurrency$addr7 = (_wrappedCurrency7 = wrappedCurrency$1(currencyA, chainId)) === null || _wrappedCurrency7 === void 0 ? void 0 : _wrappedCurrency7.address) != null ? _wrappedCurrency$addr7 : '', (_wrappedCurrency$addr8 = (_wrappedCurrency8 = wrappedCurrency$1(currencyB, chainId)) === null || _wrappedCurrency8 === void 0 ? void 0 : _wrappedCurrency8.address) != null ? _wrappedCurrency$addr8 : '', parsedAmountA.raw.toString(), parsedAmountB.raw.toString(), amountsMin[exports.Field.CURRENCY_A].toString(), amountsMin[exports.Field.CURRENCY_B].toString(), account, deadline.toHexString()];
        var _deadline$toHexString2 = deadline.toHexString(),
          _amountsMin$Field$CUR2 = amountsMin[exports.Field.CURRENCY_B].toString(),
          _amountsMin$Field$CUR = amountsMin[exports.Field.CURRENCY_A].toString(),
          _parsedAmountB$raw$to = parsedAmountB.raw.toString(),
          _parsedAmountA$raw$to = parsedAmountA.raw.toString(),
          _temp3 = (_wrappedCurrency$addr9 = (_wrappedCurrency9 = wrappedCurrency$1(currencyB, chainId)) === null || _wrappedCurrency9 === void 0 ? void 0 : _wrappedCurrency9.address) != null ? _wrappedCurrency$addr9 : '',
          _temp2 = (_wrappedCurrency$addr10 = (_wrappedCurrency10 = wrappedCurrency$1(currencyA, chainId)) === null || _wrappedCurrency10 === void 0 ? void 0 : _wrappedCurrency10.address) != null ? _wrappedCurrency$addr10 : '';
        return Promise.resolve(solidityPack(chainId, [(_wrappedCurrency$addr11 = (_wrappedCurrency11 = wrappedCurrency$1(currencyA, chainId)) === null || _wrappedCurrency11 === void 0 ? void 0 : _wrappedCurrency11.address) != null ? _wrappedCurrency$addr11 : '', (_wrappedCurrency$addr12 = (_wrappedCurrency12 = wrappedCurrency$1(currencyB, chainId)) === null || _wrappedCurrency12 === void 0 ? void 0 : _wrappedCurrency12.address) != null ? _wrappedCurrency$addr12 : ''])).then(function (_solidityPack2) {
          argsV2 = [_temp2, _temp3, _parsedAmountA$raw$to, _parsedAmountB$raw$to, _amountsMin$Field$CUR, _amountsMin$Field$CUR2, account, _deadline$toHexString2, _solidityPack2];
          value = null;
        });
      }
    }();
    return Promise.resolve(_temp4 && _temp4.then ? _temp4.then(_temp5) : _temp5(_temp4));
  } catch (e) {
    return Promise.reject(e);
  }
};
var addLiquidityStarket = function addLiquidityStarket(chainId, library, account, parsedAmountA, parsedAmountB, deadline) {
  try {
    return Promise.resolve(_catch(function () {
      var _wrappedCurrency$addr, _wrappedCurrency, _wrappedCurrency$addr2, _wrappedCurrency2;
      if (!account || !library || !parsedAmountA || !parsedAmountB || !deadline) return;
      var routerContract = new starknet.Contract(ISNRouter, ROUTER_ADDRESS[chainId], library);
      var currencyA = parsedAmountA === null || parsedAmountA === void 0 ? void 0 : parsedAmountA.currency;
      var currencyB = parsedAmountB === null || parsedAmountB === void 0 ? void 0 : parsedAmountB.currency;
      var addLiquidityCall = routerContract.populate('add_liquidity', {
        tokenA: (_wrappedCurrency$addr = (_wrappedCurrency = wrappedCurrency$1(currencyA, chainId)) === null || _wrappedCurrency === void 0 ? void 0 : _wrappedCurrency.address) != null ? _wrappedCurrency$addr : '',
        tokenB: (_wrappedCurrency$addr2 = (_wrappedCurrency2 = wrappedCurrency$1(currencyB, chainId)) === null || _wrappedCurrency2 === void 0 ? void 0 : _wrappedCurrency2.address) != null ? _wrappedCurrency$addr2 : '',
        stable: false,
        feeTier: 0,
        amountADesired: parsedAmountA.raw.toString(),
        amountBDesired: parsedAmountB.raw.toString(),
        amountAMin: 0,
        amountBMin: 0,
        to: account,
        deadline: deadline
      });
      return Promise.resolve(library.execute([addLiquidityCall])).then(function (tx) {
        return {
          hash: tx.transaction_hash
        };
      });
    }, function (error) {
      console.error(error);
      throw error;
    }));
  } catch (e) {
    return Promise.reject(e);
  }
};
var removeLiquidityStarknet = function removeLiquidityStarknet(chainId, account, library, removeAmount, tokenA, tokenB, deadline) {
  try {
    return Promise.resolve(_catch(function () {
      if (!account || !library || !removeAmount || !tokenA || !tokenB) throw new Error('missing dependencies');
      var routerContract = new starknet.Contract(ISNRouter, ROUTER_ADDRESS[chainId], library);
      var addLiquidityCall = routerContract.populate('remove_liquidity', {
        tokenA: tokenA.address || '',
        tokenB: tokenB.address || '',
        stable: false,
        feeTier: 0,
        liquidity: removeAmount,
        amountAMin: 0,
        amountBMin: 0,
        to: account,
        deadline: deadline
      });
      return Promise.resolve(library.execute([addLiquidityCall])).then(function (tx) {
        return {
          hash: tx.transaction_hash
        };
      });
    }, function (error) {
      console.error(error);
      throw error;
    }));
  } catch (e) {
    return Promise.reject(e);
  }
};
function toV2LiquidityToken(_ref5) {
  var tokenA = _ref5[0],
    tokenB = _ref5[1];
  return new Token(tokenA.chainId, Pair.getAddress(tokenA, tokenB), 18, 'UNI-V2', 'Uniswap V2');
}

var AppComponent = function AppComponent() {
  return React.createElement("div", null);
};

exports.JSBI = JSBI;
exports.AddressZero = AddressZero;
exports.AppComponent = AppComponent;
exports.BASES_TO_TRACK_LIQUIDITY_FOR = BASES_TO_TRACK_LIQUIDITY_FOR;
exports.BASE_USDC = BASE_USDC;
exports.BIPS_BASE = BIPS_BASE;
exports.ChainIdHex = ChainIdHex;
exports.Currency = Currency;
exports.CurrencyAmount = CurrencyAmount;
exports.DAI = DAI;
exports.ETHER = ETHER;
exports.FACTORY_ADDRESS = FACTORY_ADDRESS;
exports.Fetcher = Fetcher;
exports.Fraction = Fraction;
exports.INIT_CODE_HASH = INIT_CODE_HASH;
exports.InsufficientInputAmountError = InsufficientInputAmountError;
exports.InsufficientReservesError = InsufficientReservesError;
exports.METIS_USDC = METIS_USDC;
exports.MINIMUM_LIQUIDITY = MINIMUM_LIQUIDITY;
exports.PINNED_PAIRS = PINNED_PAIRS;
exports.PYTH_ADDRESS = PYTH_ADDRESS;
exports.Pair = Pair;
exports.Percent = Percent;
exports.Price = Price;
exports.ROUTER_ADDRESS = ROUTER_ADDRESS;
exports.ROUTER_ADDRESS_WITH_PRICE = ROUTER_ADDRESS_WITH_PRICE;
exports.RPC_URLS = RPC_URLS;
exports.Route = Route;
exports.Router = Router;
exports.Token = Token;
exports.TokenAmount = TokenAmount;
exports.Trade = Trade;
exports.UNICHAIN_USDC = UNICHAIN_USDC;
exports.USDC = USDC;
exports.USDT = USDT;
exports.WBTC = WBTC;
exports.WETH = WETH;
exports.ZERO_ADDRESS = ZERO_ADDRESS;
exports.addLiquidity = addLiquidity;
exports.addLiquidityStarket = addLiquidityStarket;
exports.callSwapContract = callSwapContract;
exports.callSwapContractStarknet = callSwapContractStarknet;
exports.currencyEquals = currencyEquals;
exports.inputOutputComparator = inputOutputComparator;
exports.removeLiquidity = removeLiquidity;
exports.toV2LiquidityToken = toV2LiquidityToken;
exports.tradeComparator = tradeComparator;
//# sourceMappingURL=index.js.map
