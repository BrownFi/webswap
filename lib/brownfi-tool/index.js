function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = require('react');
var JSBI = _interopDefault(require('jsbi'));
var invariant = _interopDefault(require('tiny-invariant'));
var warning = _interopDefault(require('tiny-warning'));
var address = require('@ethersproject/address');
var _Big = _interopDefault(require('big.js'));
var toFormat = _interopDefault(require('toformat'));
var _Decimal = _interopDefault(require('decimal.js-light'));
var solidity = require('@ethersproject/solidity');
var Web3 = _interopDefault(require('web3'));
var axios = _interopDefault(require('axios'));
var buffer = require('buffer');
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
})(exports.ChainId || (exports.ChainId = {}));
var ChainIdHex = (_ChainIdHex = {}, _ChainIdHex[exports.ChainId.MAINNET] = '0x1', _ChainIdHex[exports.ChainId.SEPOLIA] = '0xaa36a7', _ChainIdHex[exports.ChainId.BSC_TESTNET] = '0x61', _ChainIdHex[exports.ChainId.VICTION_TESTNET] = '0x59', _ChainIdHex[exports.ChainId.VICTION_MAINNET] = '0x58', _ChainIdHex[exports.ChainId.SONIC_TESTNET] = '0xFAA5', _ChainIdHex[exports.ChainId.MINATO_SONEIUM] = '0x79A', _ChainIdHex[exports.ChainId.BASE_SEPOLIA] = '0x14a34', _ChainIdHex[exports.ChainId.UNICHAIN_SEPOLIA] = '0x515', _ChainIdHex);
(function (TradeType) {
  TradeType[TradeType["EXACT_INPUT"] = 0] = "EXACT_INPUT";
  TradeType[TradeType["EXACT_OUTPUT"] = 1] = "EXACT_OUTPUT";
})(exports.TradeType || (exports.TradeType = {}));
(function (Rounding) {
  Rounding[Rounding["ROUND_DOWN"] = 0] = "ROUND_DOWN";
  Rounding[Rounding["ROUND_HALF_UP"] = 1] = "ROUND_HALF_UP";
  Rounding[Rounding["ROUND_UP"] = 2] = "ROUND_UP";
})(exports.Rounding || (exports.Rounding = {}));
var FACTORY_ADDRESS = (_FACTORY_ADDRESS = {}, _FACTORY_ADDRESS[exports.ChainId.MAINNET] = '0xD705B4e18055D8Fa1d099d0533163a9e8fA09E4A', _FACTORY_ADDRESS[exports.ChainId.SEPOLIA] = '0x782783378a9D3BCCC8d9A03F5ED452263758a571', _FACTORY_ADDRESS[exports.ChainId.SN_MAIN] = '', _FACTORY_ADDRESS[exports.ChainId.SN_SEPOLIA] = '0x05d789e22a62125d58773cd899e1b609b476b5daa0c86dccb32c72836dcec906', _FACTORY_ADDRESS[exports.ChainId.BSC_TESTNET] = '0xdd8C69C093B34e886726Cd3E40D24445E272B684', _FACTORY_ADDRESS[exports.ChainId.VICTION_TESTNET] = '0x782783378a9D3BCCC8d9A03F5ED452263758a571', _FACTORY_ADDRESS[exports.ChainId.VICTION_MAINNET] = '0x3fB701618Fa2827CB476Dd5A6ADDBa3bbD1ac9b9', _FACTORY_ADDRESS[exports.ChainId.SONIC_TESTNET] = '0x7cb2CF3dde3d518b408ea0B83738C067EEdb571D', _FACTORY_ADDRESS[exports.ChainId.MINATO_SONEIUM] = '0x0e63FffdB5d9Db4a3595Dc9F87cB6BBc4789fF9e', _FACTORY_ADDRESS[exports.ChainId.BASE_SEPOLIA] = '0x86d86dD68a2D7FD82de9760D447f1Ef11644B535', _FACTORY_ADDRESS[exports.ChainId.UNICHAIN_SEPOLIA] = '0x86d86dD68a2D7FD82de9760D447f1Ef11644B535', _FACTORY_ADDRESS);
var INIT_CODE_HASH = (_INIT_CODE_HASH = {}, _INIT_CODE_HASH[exports.ChainId.MAINNET] = '0xa92e1262e78c2029fb68aa25cd33df22da5c26a36d5ca3e7f82777add081632c', _INIT_CODE_HASH[exports.ChainId.SEPOLIA] = '0xa65692b959243ffbbccaece1c8d7df4e24a4a318bc91af76c654277ae6cbf298', _INIT_CODE_HASH[exports.ChainId.BSC_TESTNET] = '0xccd65ad557636196c3dbd40fffe1aab9c7d4e4d0b54ad1e60665ca595e186bac', _INIT_CODE_HASH[exports.ChainId.VICTION_TESTNET] = '0x711312ac9a4efcfb1916d57f2ec6e03f5e1299e46f449ac9400da95ffc6d5a42', _INIT_CODE_HASH[exports.ChainId.VICTION_MAINNET] = '0x114d0544828b902794dd44ecddc6d536315d4f8ef581de0fcac30677b2b9e26b', _INIT_CODE_HASH[exports.ChainId.SONIC_TESTNET] = '0x114d0544828b902794dd44ecddc6d536315d4f8ef581de0fcac30677b2b9e26b', _INIT_CODE_HASH[exports.ChainId.MINATO_SONEIUM] = '0xf2eab90754ebe4f7948efc0065f1fec022ffaed2fff5c5048776cf8ce4701a19', _INIT_CODE_HASH[exports.ChainId.BASE_SEPOLIA] = '0x330370b2bbf44605dd620805d2a2da4be4d6830689cdc295936cb2f1efb5e4af', _INIT_CODE_HASH[exports.ChainId.UNICHAIN_SEPOLIA] = '0x330370b2bbf44605dd620805d2a2da4be4d6830689cdc295936cb2f1efb5e4af', _INIT_CODE_HASH);
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
    if (CAN_SET_PROTOTYPE) Object.setPrototypeOf(_this2, (this instanceof InsufficientInputAmountError ? this.constructor : void 0).prototype);
    return _this2;
  }
  _inheritsLoose(InsufficientInputAmountError, _Error2);
  return InsufficientInputAmountError;
}( /*#__PURE__*/_wrapNativeSuper(Error));

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
var WETH = (_WETH = {}, _WETH[exports.ChainId.MAINNET] = new Token(exports.ChainId.MAINNET, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 18, 'WETH', 'Wrapped Ether'), _WETH[exports.ChainId.SEPOLIA] = new Token(exports.ChainId.SEPOLIA, '0x8Aca9B80b6752Ec62e06eC48E07a301e97852dAA', 18, 'WETH', 'Wrapped Ether'), _WETH[exports.ChainId.SN_MAIN] = new Token(exports.ChainId.SN_SEPOLIA, '0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7', 18, 'ETH', 'Ether'), _WETH[exports.ChainId.SN_SEPOLIA] = new Token(exports.ChainId.SN_SEPOLIA, '0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7', 18, 'ETH', 'Ether'), _WETH[exports.ChainId.BSC_TESTNET] = new Token(exports.ChainId.BSC_TESTNET, '0xCF1F5dB1a874Ebf820019c4CCA11c32ebb5eE33A', 18, 'WBNB', 'Wrapped BNB'), _WETH[exports.ChainId.VICTION_TESTNET] = new Token(exports.ChainId.VICTION_TESTNET, '0x8Aca9B80b6752Ec62e06eC48E07a301e97852dAA', 18, 'WVIC', 'Wrapped VIC'), _WETH[exports.ChainId.VICTION_MAINNET] = new Token(exports.ChainId.VICTION_MAINNET, '0xC054751BdBD24Ae713BA3Dc9Bd9434aBe2abc1ce', 18, 'WVIC', 'Wrapped VIC'), _WETH[exports.ChainId.SONIC_TESTNET] = new Token(exports.ChainId.SONIC_TESTNET, '0x782783378a9D3BCCC8d9A03F5ED452263758a571', 18, 'WS', 'Wrapped S'), _WETH[exports.ChainId.MINATO_SONEIUM] = new Token(exports.ChainId.MINATO_SONEIUM, '0x4200000000000000000000000000000000000006', 18, 'WETH', 'Wrapped ETH'), _WETH[exports.ChainId.BASE_SEPOLIA] = new Token(exports.ChainId.BASE_SEPOLIA, '0x4200000000000000000000000000000000000006', 18, 'ETH', 'Ether'), _WETH[exports.ChainId.UNICHAIN_SEPOLIA] = new Token(exports.ChainId.UNICHAIN_SEPOLIA, '0x4200000000000000000000000000000000000006', 18, 'ETH', 'Ether'), _WETH);

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

var IRouter = [
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

var IAggregator = [
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

var getPriceFeedUpdateData = function getPriceFeedUpdateData(basePriceIds, quotePriceIds) {
  try {
    var ids = [];
    if (basePriceIds !== ZERO_ADDRESS) {
      ids.push(basePriceIds);
    }
    if (quotePriceIds !== ZERO_ADDRESS) {
      ids.push(quotePriceIds);
    }
    return Promise.resolve(axios.get('https://hermes.pyth.network/api/latest_vaas', {
      params: {
        ids: ids
      }
    })).then(function (response) {
      return response.data.map(function (vaa) {
        return '0x' + buffer.Buffer.from(vaa, 'base64').toString('hex');
      });
    });
  } catch (e) {
    return Promise.reject(e);
  }
};
var getLatestPrice = function getLatestPrice(basePriceIds, quotePriceIds) {
  try {
    var ids = [];
    if (basePriceIds !== ZERO_ADDRESS) {
      ids.push(basePriceIds);
    }
    if (quotePriceIds !== ZERO_ADDRESS) {
      ids.push(quotePriceIds);
    }
    return Promise.resolve(axios.get('https://hermes.pyth.network/v2/updates/price/latest', {
      params: {
        ids: ids
      }
    })).then(function (response) {
      return response.data;
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
    this.liquidityToken = new Token(tokenAmounts[0].token.chainId, Pair.getAddress(tokenAmounts[0].token, tokenAmounts[1].token), 18, 'BRF-V1', 'BrownFI V1');
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
  _proto.getOutputAmountAsync = function getOutputAmountAsync(inputAmount, path, chainId, pairAddress) {
    try {
      var _this = this;
      invariant(_this.involvesToken(inputAmount.token), 'TOKEN');
      if (JSBI.equal(_this.reserve0.raw, ZERO) || JSBI.equal(_this.reserve1.raw, ZERO)) {
        throw new InsufficientReservesError();
      }
      var inputReserve = _this.reserveOf(inputAmount.token);
      var outputReserve = _this.reserveOf(inputAmount.token.equals(_this.token0) ? _this.token1 : _this.token0);
      var web3 = new Web3(new Web3.providers.HttpProvider(RPC_URLS[chainId]));
      var routerContract = new web3.eth.Contract(IRouter, ROUTER_ADDRESS[chainId]);
      var routerContractWithPrice = new web3.eth.Contract(IRouterWithPrice, ROUTER_ADDRESS_WITH_PRICE[chainId]);
      var pairContract = new web3.eth.Contract(IPair, pairAddress);
      return Promise.resolve(Promise.all([pairContract.methods.priceFeed().call(), pairContract.methods.qti().call()])).then(function (_ref) {
        var priceFeedAddress = _ref[0],
          qti = _ref[1];
        function _temp2() {
          return Promise.resolve(Promise.all([chainId === exports.ChainId.VICTION_MAINNET || chainId === exports.ChainId.SONIC_TESTNET ? routerContractWithPrice.methods.getAmountsOutWithPrice(inputAmount.raw.toString(), path === null || path === void 0 ? void 0 : path.map(function (token) {
            return token.address;
          }), priceFeedUpdateData).call({
            value: updateFee
          }) : routerContract.methods.getAmountsOut(inputAmount.raw.toString(), path === null || path === void 0 ? void 0 : path.map(function (token) {
            return token.address;
          })).call(), chainId !== exports.ChainId.VICTION_MAINNET && chainId !== exports.ChainId.SONIC_TESTNET && priceFeedContract.methods.latestRoundData().call(), chainId !== exports.ChainId.VICTION_MAINNET && chainId !== exports.ChainId.SONIC_TESTNET && priceFeedContract.methods.decimals().call(), (chainId === exports.ChainId.VICTION_MAINNET || chainId === exports.ChainId.SONIC_TESTNET) && getLatestPrice(basePriceIds, quotePriceIds)])).then(function (_ref2) {
            var _latestPrice$parsed;
            var balances = _ref2[0],
              latestRound = _ref2[1],
              decimals = _ref2[2],
              latestPrice = _ref2[3];
            var basePrice = 1;
            var quotePrice = 0;
            latestPrice === null || latestPrice === void 0 ? void 0 : (_latestPrice$parsed = latestPrice.parsed) === null || _latestPrice$parsed === void 0 ? void 0 : _latestPrice$parsed.forEach(function (item) {
              var _item$id, _basePriceIds, _item$id2, _quotePriceIds;
              if ("0x" + (item === null || item === void 0 ? void 0 : (_item$id = item.id) === null || _item$id === void 0 ? void 0 : _item$id.toLowerCase()) === ((_basePriceIds = basePriceIds) === null || _basePriceIds === void 0 ? void 0 : _basePriceIds.toLowerCase())) {
                var _item$price;
                basePrice = +(item === null || item === void 0 ? void 0 : (_item$price = item.price) === null || _item$price === void 0 ? void 0 : _item$price.price);
              }
              if ("0x" + (item === null || item === void 0 ? void 0 : (_item$id2 = item.id) === null || _item$id2 === void 0 ? void 0 : _item$id2.toLowerCase()) === ((_quotePriceIds = quotePriceIds) === null || _quotePriceIds === void 0 ? void 0 : _quotePriceIds.toLowerCase())) {
                var _item$price2;
                quotePrice = +(item === null || item === void 0 ? void 0 : (_item$price2 = item.price) === null || _item$price2 === void 0 ? void 0 : _item$price2.price);
              }
            });
            var odPrice = chainId === exports.ChainId.VICTION_MAINNET || chainId === exports.ChainId.SONIC_TESTNET ? qti === 1 ? basePrice / (quotePrice || Math.pow(10, 8)) : (quotePrice || Math.pow(10, 8)) / basePrice : +latestRound.answer / Math.pow(10, +decimals);
            var outputAmount = new TokenAmount(inputAmount.token.equals(_this.token0) ? _this.token1 : _this.token0, balances === null || balances === void 0 ? void 0 : balances[1]);
            if (JSBI.equal(outputAmount.raw, ZERO)) {
              throw new InsufficientInputAmountError();
            }
            return [outputAmount, new Pair(inputReserve.add(inputAmount), outputReserve.subtract(outputAmount)), odPrice, +qti, priceFeedUpdateData, updateFee];
          });
        }
        console.log('priceFeedAddress', priceFeedAddress);
        var priceFeedContract = new web3.eth.Contract(IAggregator, priceFeedAddress);
        var basePriceIds = '';
        var quotePriceIds = '';
        var priceFeedUpdateData;
        var updateFee = 0;
        var _temp = function () {
          if (chainId === exports.ChainId.VICTION_MAINNET || chainId === exports.ChainId.SONIC_TESTNET) {
            var pythPriceFeedContract = new web3.eth.Contract(IPythPriceFeed, priceFeedAddress);
            return Promise.resolve(Promise.all([pythPriceFeedContract.methods.baseTokenPriceId().call(), pythPriceFeedContract.methods.quoteTokenPriceId().call()])).then(function (_ref3) {
              var baseTokenPriceId = _ref3[0],
                quoteTokenPriceId = _ref3[1];
              console.log('baseTokenPriceId', baseTokenPriceId);
              basePriceIds = baseTokenPriceId;
              quotePriceIds = quoteTokenPriceId;
              return Promise.resolve(getPriceFeedUpdateData(basePriceIds, quotePriceIds)).then(function (_getPriceFeedUpdateDa) {
                priceFeedUpdateData = _getPriceFeedUpdateDa;
                var pythABI = [{
                  inputs: [{
                    internalType: 'bytes[]',
                    name: 'updateData',
                    type: 'bytes[]'
                  }],
                  name: 'getUpdateFee',
                  outputs: [{
                    internalType: 'uint256',
                    name: 'feeAmount',
                    type: 'uint256'
                  }],
                  stateMutability: 'view',
                  type: 'function'
                }];
                var pythContract = new web3.eth.Contract(pythABI, PYTH_ADDRESS[chainId]);
                return Promise.resolve(pythContract.methods.getUpdateFee(priceFeedUpdateData).call()).then(function (_pythContract$methods) {
                  updateFee = _pythContract$methods;
                });
              });
            });
          }
        }();
        return _temp && _temp.then ? _temp.then(_temp2) : _temp2(_temp);
      });
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
    console.log('test2 ===>', JSBI.add(JSBI.divide(numerator, denominator), ONE));
    var inputAmount = new TokenAmount(outputAmount.token.equals(this.token0) ? this.token1 : this.token0, JSBI.add(JSBI.divide(numerator, denominator), ONE));
    return [inputAmount, new Pair(inputReserve.add(inputAmount), outputReserve.subtract(outputAmount))];
  };
  _proto.getInputAmountAsync = function getInputAmountAsync(outputAmount, path, chainId, pairAddress) {
    try {
      var _this2 = this;
      invariant(_this2.involvesToken(outputAmount.token), 'TOKEN');
      if (JSBI.equal(_this2.reserve0.raw, ZERO) || JSBI.equal(_this2.reserve1.raw, ZERO) || JSBI.greaterThanOrEqual(outputAmount.raw, _this2.reserveOf(outputAmount.token).raw)) {
        throw new InsufficientReservesError();
      }
      var outputReserve = _this2.reserveOf(outputAmount.token);
      var inputReserve = _this2.reserveOf(outputAmount.token.equals(_this2.token0) ? _this2.token1 : _this2.token0);
      var web3 = new Web3(new Web3.providers.HttpProvider(RPC_URLS[chainId]));
      var routerContract = new web3.eth.Contract(IRouter, ROUTER_ADDRESS[chainId]);
      var routerContractWithPrice = new web3.eth.Contract(IRouterWithPrice, ROUTER_ADDRESS_WITH_PRICE[chainId]);
      var pairContract = new web3.eth.Contract(IPair, pairAddress);
      return Promise.resolve(Promise.all([pairContract.methods.priceFeed().call(), pairContract.methods.qti().call()])).then(function (_ref4) {
        var priceFeedAddress = _ref4[0],
          qti = _ref4[1];
        function _temp4() {
          return Promise.resolve(Promise.all([chainId === exports.ChainId.VICTION_MAINNET || chainId === exports.ChainId.SONIC_TESTNET ? routerContractWithPrice.methods.getAmountsInWithPrice(outputAmount.raw.toString(), path === null || path === void 0 ? void 0 : path.map(function (token) {
            return token.address;
          }), priceFeedUpdateData).call({
            value: updateFee
          }) : routerContract.methods.getAmountsIn(outputAmount.raw.toString(), path === null || path === void 0 ? void 0 : path.map(function (token) {
            return token.address;
          })).call(), chainId !== exports.ChainId.VICTION_MAINNET && chainId !== exports.ChainId.SONIC_TESTNET && priceFeedContract.methods.latestRoundData().call(), chainId !== exports.ChainId.VICTION_MAINNET && chainId !== exports.ChainId.SONIC_TESTNET && priceFeedContract.methods.decimals().call(), (chainId === exports.ChainId.VICTION_MAINNET || chainId === exports.ChainId.SONIC_TESTNET) && getLatestPrice(basePriceIds, quotePriceIds)])).then(function (_ref5) {
            var _latestPrice$parsed2;
            var balances = _ref5[0],
              latestRound = _ref5[1],
              decimals = _ref5[2],
              latestPrice = _ref5[3];
            var basePrice = 1;
            var quotePrice = 0;
            latestPrice === null || latestPrice === void 0 ? void 0 : (_latestPrice$parsed2 = latestPrice.parsed) === null || _latestPrice$parsed2 === void 0 ? void 0 : _latestPrice$parsed2.forEach(function (item) {
              var _item$id3, _basePriceIds2, _item$id4, _quotePriceIds2;
              if ("0x" + (item === null || item === void 0 ? void 0 : (_item$id3 = item.id) === null || _item$id3 === void 0 ? void 0 : _item$id3.toLowerCase()) === ((_basePriceIds2 = basePriceIds) === null || _basePriceIds2 === void 0 ? void 0 : _basePriceIds2.toLowerCase())) {
                var _item$price3;
                basePrice = +(item === null || item === void 0 ? void 0 : (_item$price3 = item.price) === null || _item$price3 === void 0 ? void 0 : _item$price3.price);
              }
              if ("0x" + (item === null || item === void 0 ? void 0 : (_item$id4 = item.id) === null || _item$id4 === void 0 ? void 0 : _item$id4.toLowerCase()) === ((_quotePriceIds2 = quotePriceIds) === null || _quotePriceIds2 === void 0 ? void 0 : _quotePriceIds2.toLowerCase())) {
                var _item$price4;
                quotePrice = +(item === null || item === void 0 ? void 0 : (_item$price4 = item.price) === null || _item$price4 === void 0 ? void 0 : _item$price4.price);
              }
            });
            var odPrice = chainId === exports.ChainId.VICTION_MAINNET || chainId === exports.ChainId.SONIC_TESTNET ? qti === 1 ? basePrice / (quotePrice || Math.pow(10, 8)) : (quotePrice || Math.pow(10, 8)) / basePrice : +latestRound.answer / Math.pow(10, +decimals);
            var inputAmount = new TokenAmount(outputAmount.token.equals(_this2.token0) ? _this2.token1 : _this2.token0, balances === null || balances === void 0 ? void 0 : balances[0]);
            return [inputAmount, new Pair(inputReserve.add(inputAmount), outputReserve.subtract(outputAmount)), odPrice, +qti, priceFeedUpdateData, updateFee];
          });
        }
        var priceFeedContract = new web3.eth.Contract(IAggregator, priceFeedAddress);
        var basePriceIds = '';
        var quotePriceIds = '';
        var priceFeedUpdateData;
        var updateFee = 0;
        var _temp3 = function () {
          if (chainId === exports.ChainId.VICTION_MAINNET || chainId === exports.ChainId.SONIC_TESTNET) {
            var pythPriceFeedContract = new web3.eth.Contract(IPythPriceFeed, priceFeedAddress);
            return Promise.resolve(Promise.all([pythPriceFeedContract.methods.baseTokenPriceId().call(), pythPriceFeedContract.methods.quoteTokenPriceId().call()])).then(function (_ref6) {
              var baseTokenPriceId = _ref6[0],
                quoteTokenPriceId = _ref6[1];
              basePriceIds = baseTokenPriceId;
              quotePriceIds = quoteTokenPriceId;
              return Promise.resolve(getPriceFeedUpdateData(basePriceIds, quotePriceIds)).then(function (_getPriceFeedUpdateDa2) {
                priceFeedUpdateData = _getPriceFeedUpdateDa2;
                var pythABI = [{
                  inputs: [{
                    internalType: 'bytes[]',
                    name: 'updateData',
                    type: 'bytes[]'
                  }],
                  name: 'getUpdateFee',
                  outputs: [{
                    internalType: 'uint256',
                    name: 'feeAmount',
                    type: 'uint256'
                  }],
                  stateMutability: 'view',
                  type: 'function'
                }];
                var pythContract = new web3.eth.Contract(pythABI, PYTH_ADDRESS[chainId]);
                return Promise.resolve(pythContract.methods.getUpdateFee(priceFeedUpdateData).call()).then(function (_pythContract$methods2) {
                  updateFee = _pythContract$methods2;
                });
              });
            });
          }
        }();
        return _temp3 && _temp3.then ? _temp3.then(_temp4) : _temp4(_temp3);
      });
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
var Trade = /*#__PURE__*/function () {
  function Trade(route, amount, tradeType) {
    var _this = this;
    this.init = function (route, amount, tradeType) {
      try {
        var _temp4 = function _temp4() {
          _this.route = route;
          _this.tradeType = tradeType;
          _this.inputAmount = tradeType === exports.TradeType.EXACT_INPUT ? amount : route.input === ETHER ? CurrencyAmount.ether(amounts[0].raw) : amounts[0];
          _this.outputAmount = tradeType === exports.TradeType.EXACT_OUTPUT ? amount : route.output === ETHER ? CurrencyAmount.ether(amounts[amounts.length - 1].raw) : amounts[amounts.length - 1];
          _this.executionPrice = new Price(_this.inputAmount.currency, _this.outputAmount.currency, _this.inputAmount.raw, _this.outputAmount.raw);
          _this.priceUpdate = newPriceUpdate;
          _this.slippage = (1 - +_this.outputAmount.raw / Math.pow(10, _this.outputAmount.currency.decimals) / (+_this.inputAmount.raw / Math.pow(10, _this.inputAmount.currency.decimals)) / +oPrice) * 100;
          console.log('alo', +_this.outputAmount.raw, +_this.inputAmount.raw, +oPrice);
          _this.priceImpact = new Percent('0');
          _this.updateFee = newUpdateFee;
        };
        var amounts = new Array(route.path.length);
        var nextPairs = new Array(route.pairs.length);
        var oPrice = 1;
        var newPriceUpdate = [];
        var newUpdateFee = 0;
        var _temp3 = function () {
          if (tradeType === exports.TradeType.EXACT_INPUT) {
            invariant(currencyEquals(amount.currency, route.input), 'INPUT');
            amounts[0] = wrappedAmount(amount, route.chainId);
            var _i = 0;
            var _temp = _for(function () {
              return _i < route.path.length - 1;
            }, function () {
              return _i++;
            }, function () {
              var pair = route.pairs[_i];
              return Promise.resolve(pair.getOutputAmountAsync(amounts[_i], route.path, pair.chainId, pair.liquidityToken.address)).then(function (_ref) {
                var outputAmount = _ref[0],
                  nextPair = _ref[1],
                  odPrice = _ref[2],
                  qti = _ref[3],
                  prices = _ref[4],
                  updateFeeData = _ref[5];
                amounts[_i + 1] = outputAmount;
                nextPairs[_i] = nextPair;
                oPrice *= qti === 1 && (nextPairs[0].token1.name === outputAmount.currency.name || route.input === ETHER) || qti === 0 && (nextPairs[0].token0.name === amounts[_i].currency.name || route.output === ETHER) ? +odPrice : 1 / +odPrice;
                newPriceUpdate = prices;
                newUpdateFee = updateFeeData;
              });
            });
            if (_temp && _temp.then) return _temp.then(function () {});
          } else {
            invariant(currencyEquals(amount.currency, route.output), 'OUTPUT');
            amounts[amounts.length - 1] = wrappedAmount(amount, route.chainId);
            var _i2 = route.path.length - 1;
            var _temp2 = _for(function () {
              return _i2 > 0;
            }, function () {
              return _i2--;
            }, function () {
              var pair = route.pairs[_i2 - 1];
              return Promise.resolve(pair.getInputAmountAsync(amounts[_i2], route.path, pair.chainId, pair.liquidityToken.address)).then(function (_ref2) {
                var inputAmount = _ref2[0],
                  nextPair = _ref2[1],
                  odPrice = _ref2[2],
                  qti = _ref2[3],
                  prices = _ref2[4],
                  updateFeeData = _ref2[5];
                amounts[_i2 - 1] = inputAmount;
                nextPairs[_i2 - 1] = nextPair;
                oPrice *= qti === 1 && (nextPairs[0].token1.name === amounts[_i2].currency.name || route.input === ETHER) || qti === 0 && (nextPairs[0].token0.name === inputAmount.currency.name || route.output === ETHER) ? +odPrice : 1 / +odPrice;
                newPriceUpdate = prices;
                newUpdateFee = updateFeeData;
              });
            });
            if (_temp2 && _temp2.then) return _temp2.then(function () {});
          }
        }();
        return Promise.resolve(_temp3 && _temp3.then ? _temp3.then(_temp4) : _temp4(_temp3));
      } catch (e) {
        return Promise.reject(e);
      }
    };
    this.route = route;
    this.tradeType = tradeType;
    this.amount = amount;
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
    var error = false;
    for (var _iterator = _createForOfIteratorHelperLoose(pairs.entries()), _step; !(_step = _iterator()).done;) {
      var _step$value = _step.value,
        _i3 = _step$value[0],
        pair = _step$value[1];
      var currentInput = path[_i3];
      if (!(currentInput.equals(pair.token0) || currentInput.equals(pair.token1))) {
        error = true;
      } else {
        var output = currentInput.equals(pair.token0) ? pair.token1 : pair.token0;
        path.push(output);
      }
    }
    return error ? null : path;
  };
  Trade.bestTradeExactIn = function bestTradeExactIn(pairs, currencyAmountIn, currencyOut, _temp9, currentPairs, originalAmountIn, bestTrades) {
    var _ref3 = _temp9 === void 0 ? {} : _temp9,
      _ref3$maxNumResults = _ref3.maxNumResults,
      maxNumResults = _ref3$maxNumResults === void 0 ? 3 : _ref3$maxNumResults,
      _ref3$maxHops = _ref3.maxHops,
      maxHops = _ref3$maxHops === void 0 ? 3 : _ref3$maxHops;
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
      var _exit = false;
      invariant(pairs.length > 0, 'PAIRS');
      invariant(maxHops > 0, 'MAX_HOPS');
      invariant(originalAmountIn === currencyAmountIn || currentPairs.length > 0, 'INVALID_RECURSION');
      var chainId = currencyAmountIn instanceof TokenAmount ? currencyAmountIn.token.chainId : currencyOut instanceof Token ? currencyOut.chainId : undefined;
      invariant(chainId !== undefined, 'CHAIN_ID');
      var amountIn = wrappedAmount(currencyAmountIn, chainId);
      var tokenOut = wrappedCurrency(currencyOut, chainId);
      var _temp8 = _forTo(pairs, function (i) {
        function _temp7(_result) {
          if (_exit) return _result;
          var _temp5 = function () {
            if (amountOut.token.equals(tokenOut)) {
              var newRoute = new Route([].concat(currentPairs, [pair]), originalAmountIn.currency, currencyOut);
              var newTrade = new Trade(newRoute, originalAmountIn, exports.TradeType.EXACT_INPUT);
              return Promise.resolve(newTrade.init(newRoute, originalAmountIn, exports.TradeType.EXACT_INPUT)).then(function () {
                sortedInsert(bestTrades, newTrade, maxNumResults, tradeComparator);
              });
            } else if (maxHops > 1 && pairs.length > 1) {
              var pairsExcludingThisPair = pairs.slice(0, i).concat(pairs.slice(i + 1, pairs.length));
              Trade.bestTradeExactIn(pairsExcludingThisPair, amountOut, currencyOut, {
                maxNumResults: maxNumResults,
                maxHops: maxHops - 1
              }, [].concat(currentPairs, [pair]), originalAmountIn, bestTrades);
            }
          }();
          if (_temp5 && _temp5.then) return _temp5.then(function () {});
        }
        var pair = pairs[i];
        if (!pair.token0.equals(amountIn.token) && !pair.token1.equals(amountIn.token)) return;
        if (pair.reserve0.equalTo(ZERO) || pair.reserve1.equalTo(ZERO)) return;
        var amountOut;
        var path = Trade.getPath(currencyAmountIn.currency, [].concat(currentPairs, [pair]));
        if (!path) {
          console.log('path null exact in');
          return;
        }
        var _temp6 = _catch(function () {
          ;
          return Promise.resolve(pair.getOutputAmountAsync(amountIn, path, chainId, pair.liquidityToken.address)).then(function (_pair$getOutputAmount) {
            amountOut = _pair$getOutputAmount[0];
          });
        }, function (error) {
          if (error !== null && error !== void 0 && error.isInsufficientInputAmountError) {
            return;
          }
          throw error;
        });
        return _temp6 && _temp6.then ? _temp6.then(_temp7) : _temp7(_temp6);
      }, function () {
        return _exit;
      });
      return Promise.resolve(_temp8 && _temp8.then ? _temp8.then(function (_result2) {
        return _exit ? _result2 : bestTrades;
      }) : _exit ? _temp8 : bestTrades);
    } catch (e) {
      return Promise.reject(e);
    }
  };
  Trade.bestTradeExactOut = function bestTradeExactOut(pairs, currencyIn, currencyAmountOut, _temp14, currentPairs, originalAmountOut, bestTrades) {
    var _ref4 = _temp14 === void 0 ? {} : _temp14,
      _ref4$maxNumResults = _ref4.maxNumResults,
      maxNumResults = _ref4$maxNumResults === void 0 ? 3 : _ref4$maxNumResults,
      _ref4$maxHops = _ref4.maxHops,
      maxHops = _ref4$maxHops === void 0 ? 3 : _ref4$maxHops;
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
      var _exit2 = false;
      invariant(pairs.length > 0, 'PAIRS');
      invariant(maxHops > 0, 'MAX_HOPS');
      invariant(originalAmountOut === currencyAmountOut || currentPairs.length > 0, 'INVALID_RECURSION');
      var chainId = currencyAmountOut instanceof TokenAmount ? currencyAmountOut.token.chainId : currencyIn instanceof Token ? currencyIn.chainId : undefined;
      invariant(chainId !== undefined, 'CHAIN_ID');
      var amountOut = wrappedAmount(currencyAmountOut, chainId);
      var tokenIn = wrappedCurrency(currencyIn, chainId);
      var _i4 = 0;
      var _temp13 = _for(function () {
        return !_exit2 && _i4 < (pairs === null || pairs === void 0 ? void 0 : pairs.length);
      }, function () {
        return _i4++;
      }, function () {
        function _temp12(_result3) {
          if (_exit2) return _result3;
          var _temp10 = function () {
            if (amountIn.token.equals(tokenIn)) {
              var newRoute = new Route([pair].concat(currentPairs), currencyIn, originalAmountOut.currency);
              var newTrade = new Trade(newRoute, originalAmountOut, exports.TradeType.EXACT_OUTPUT);
              return Promise.resolve(newTrade.init(newRoute, originalAmountOut, exports.TradeType.EXACT_OUTPUT)).then(function () {
                sortedInsert(bestTrades, newTrade, maxNumResults, tradeComparator);
              });
            } else if (maxHops > 1 && pairs.length > 1) {
              var pairsExcludingThisPair = pairs.slice(0, _i4).concat(pairs.slice(_i4 + 1, pairs.length));
              Trade.bestTradeExactOut(pairsExcludingThisPair, currencyIn, amountIn, {
                maxNumResults: maxNumResults,
                maxHops: maxHops - 1
              }, [pair].concat(currentPairs), originalAmountOut, bestTrades);
            }
          }();
          if (_temp10 && _temp10.then) return _temp10.then(function () {});
        }
        var pair = pairs[_i4];
        if (!(pair !== null && pair !== void 0 && pair.token0.equals(amountOut.token)) && !(pair !== null && pair !== void 0 && pair.token1.equals(amountOut.token))) return;
        if (pair.reserve0.equalTo(ZERO) || pair.reserve1.equalTo(ZERO)) return;
        var amountIn;
        var path = Trade.getPath(currencyIn, [].concat(currentPairs, [pair]));
        if (!path) {
          console.log('path null exact out');
          return;
        }
        var _temp11 = _catch(function () {
          ;
          return Promise.resolve(pair.getInputAmountAsync(amountOut, path, chainId, pair.liquidityToken.address)).then(function (_pair$getInputAmountA) {
            amountIn = _pair$getInputAmountA[0];
          });
        }, function (error) {
          if (error.isInsufficientReservesError) {
            return;
          }
          throw error;
        });
        return _temp11 && _temp11.then ? _temp11.then(_temp12) : _temp12(_temp11);
      });
      return Promise.resolve(_temp13 && _temp13.then ? _temp13.then(function (_result4) {
        return _exit2 ? _result4 : bestTrades;
      }) : _exit2 ? _temp13 : bestTrades);
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
        if (chainId === exports.ChainId.VICTION_MAINNET || chainId === exports.ChainId.SONIC_TESTNET) {
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
        if (chainId === exports.ChainId.VICTION_MAINNET || chainId === exports.ChainId.SONIC_TESTNET) {
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
var ROUTER_ADDRESS = (_ROUTER_ADDRESS = {}, _ROUTER_ADDRESS[exports.ChainId.MAINNET] = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', _ROUTER_ADDRESS[exports.ChainId.SEPOLIA] = '0x44FCf63f47F7d9587b67781cB46842dcFd95A9E8', _ROUTER_ADDRESS[exports.ChainId.SN_MAIN] = '', _ROUTER_ADDRESS[exports.ChainId.SN_SEPOLIA] = '0x07365f5f8f2f7748d31653133ba5a8be7501d5d90e9893e91372e44b4fe9c967', _ROUTER_ADDRESS[exports.ChainId.BSC_TESTNET] = '0x77DC5bfe485d1C933B173e2cC3013d24a4B73071', _ROUTER_ADDRESS[exports.ChainId.MINATO_SONEIUM] = '0x6D1f381cF674CeE888E61b088b78202559eCEEAB', _ROUTER_ADDRESS[exports.ChainId.VICTION_TESTNET] = '0x44FCf63f47F7d9587b67781cB46842dcFd95A9E8', _ROUTER_ADDRESS[exports.ChainId.VICTION_MAINNET] = '0xfB8CAdcdEdc1139E2A67442b35D0B8d544f920c4', _ROUTER_ADDRESS[exports.ChainId.SONIC_TESTNET] = '0x44FCf63f47F7d9587b67781cB46842dcFd95A9E8', _ROUTER_ADDRESS[exports.ChainId.BASE_SEPOLIA] = '0x7cb2CF3dde3d518b408ea0B83738C067EEdb571D', _ROUTER_ADDRESS[exports.ChainId.UNICHAIN_SEPOLIA] = '0x7cb2CF3dde3d518b408ea0B83738C067EEdb571D', _ROUTER_ADDRESS);
var ROUTER_ADDRESS_WITH_PRICE = (_ROUTER_ADDRESS_WITH_ = {}, _ROUTER_ADDRESS_WITH_[exports.ChainId.VICTION_MAINNET] = '0x66d82F09024D0AADB71B1335f5C791Ef25B7Bfdc', _ROUTER_ADDRESS_WITH_[exports.ChainId.SONIC_TESTNET] = '0x0f97Ca4E6B118502f83DD3Ce836A14Cb4937ed2a', _ROUTER_ADDRESS_WITH_);
var PYTH_ADDRESS = (_PYTH_ADDRESS = {}, _PYTH_ADDRESS[exports.ChainId.VICTION_MAINNET] = '0xA2aa501b19aff244D90cc15a4Cf739D2725B5729', _PYTH_ADDRESS[exports.ChainId.SONIC_TESTNET] = '0x96124d1f6e44ffdf1fb5d6d74bb2de1b7fbe7376', _PYTH_ADDRESS);
var RPC_URLS = (_RPC_URLS = {}, _RPC_URLS[exports.ChainId.SEPOLIA] = 'https://sepolia.infura.io/v3/5f8bfb8bae3945f28da51d768f736046', _RPC_URLS[exports.ChainId.BSC_TESTNET] = 'https://data-seed-prebsc-1-s1.binance.org:8545', _RPC_URLS[exports.ChainId.VICTION_TESTNET] = 'https://rpc-testnet.viction.xyz', _RPC_URLS[exports.ChainId.VICTION_MAINNET] = 'https://rpc.viction.xyz', _RPC_URLS[exports.ChainId.SONIC_TESTNET] = 'https://rpc.testnet.soniclabs.com', _RPC_URLS[exports.ChainId.MINATO_SONEIUM] = 'https://rpc.minato.soneium.org/', _RPC_URLS[exports.ChainId.BASE_SEPOLIA] = 'https://base-sepolia-rpc.publicnode.com', _RPC_URLS[exports.ChainId.UNICHAIN_SEPOLIA] = 'https://sepolia.unichain.org', _RPC_URLS);
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
var UNICHAIN_USDC = new Token(exports.ChainId.UNICHAIN_SEPOLIA, '0x8Aca9B80b6752Ec62e06eC48E07a301e97852dAA', 6, 'USD', 'USD');
var PINNED_PAIRS = (_PINNED_PAIRS = {}, _PINNED_PAIRS[exports.ChainId.MAINNET] = [[new Token(exports.ChainId.MAINNET, '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643', 8, 'cDAI', 'Compound Dai'), new Token(exports.ChainId.MAINNET, '0x39AA39c021dfbaE8faC545936693aC917d5E7563', 8, 'cUSDC', 'Compound USD Coin')], [USDC, USDT], [DAI, USDT]], _PINNED_PAIRS);
var WETH_ONLY = (_WETH_ONLY = {}, _WETH_ONLY[exports.ChainId.MAINNET] = [WETH[exports.ChainId.MAINNET]], _WETH_ONLY[exports.ChainId.SEPOLIA] = [WETH[exports.ChainId.SEPOLIA]], _WETH_ONLY[exports.ChainId.SN_MAIN] = [WETH[exports.ChainId.SN_MAIN]], _WETH_ONLY[exports.ChainId.SN_SEPOLIA] = [WETH[exports.ChainId.SN_SEPOLIA]], _WETH_ONLY[exports.ChainId.BSC_TESTNET] = [WETH[exports.ChainId.BSC_TESTNET]], _WETH_ONLY[exports.ChainId.VICTION_TESTNET] = [WETH[exports.ChainId.VICTION_TESTNET]], _WETH_ONLY[exports.ChainId.VICTION_MAINNET] = [WETH[exports.ChainId.VICTION_MAINNET]], _WETH_ONLY[exports.ChainId.SONIC_TESTNET] = [WETH[exports.ChainId.SONIC_TESTNET]], _WETH_ONLY[exports.ChainId.MINATO_SONEIUM] = [WETH[exports.ChainId.MINATO_SONEIUM]], _WETH_ONLY[exports.ChainId.BASE_SEPOLIA] = [WETH[exports.ChainId.BASE_SEPOLIA]], _WETH_ONLY[exports.ChainId.UNICHAIN_SEPOLIA] = [WETH[exports.ChainId.UNICHAIN_SEPOLIA]], _WETH_ONLY);
var BASES_TO_TRACK_LIQUIDITY_FOR = _extends({}, WETH_ONLY, (_extends2 = {}, _extends2[exports.ChainId.MAINNET] = [].concat(WETH_ONLY[exports.ChainId.MAINNET], [DAI, USDC, USDT, WBTC]), _extends2));

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

function getCjsExportFromNamespace (n) {
	return n && n['default'] || n;
}

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

const version = "logger/5.7.0";

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

const version$1 = "bytes/5.7.0";

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

const version$2 = "bignumber/5.7.0";

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
function getRouterContract(_, library, account) {
  return getContract(ROUTER_ADDRESS[_], IRouter, library, account);
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
    console.log('swapCalls', swapCalls);
    return Promise.resolve(Promise.all(swapCalls.map(function (call) {
      var _contract$estimateGas;
      var _call$parameters = call.parameters,
        methodName = _call$parameters.methodName,
        args = _call$parameters.args,
        value = _call$parameters.value,
        contract = call.contract;
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
    }))).then(function (estimatedCalls) {
      console.log('estimatedCalls', estimatedCalls);
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
  var contract = chainId === exports.ChainId.VICTION_MAINNET || chainId === exports.ChainId.SONIC_TESTNET ? getRouterContractWithPrice(chainId, library, account) : getRouterContract(chainId, library, account);
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
  if (trade.tradeType === exports.TradeType.EXACT_INPUT) {
    swapMethods.push(Router.swapCallParameters(trade, {
      feeOnTransfer: true,
      allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
      recipient: recipient,
      deadline: deadline.toNumber()
    }, chainId));
  }
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
    var _amountsMin2;
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
    var amountsMin = (_amountsMin2 = {}, _amountsMin2[exports.Field.CURRENCY_A] = calculateSlippageAmount(currencyAmountA, allowedSlippage)[0], _amountsMin2[exports.Field.CURRENCY_B] = calculateSlippageAmount(currencyAmountB, allowedSlippage)[0], _amountsMin2);
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
          console.log('methodName', methodName, args);
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
    var _amountsMin;
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
    var amountsMin = (_amountsMin = {}, _amountsMin[exports.Field.CURRENCY_A] = calculateSlippageAmount(parsedAmountA, noLiquidity ? 0 : allowedSlippage)[0], _amountsMin[exports.Field.CURRENCY_B] = calculateSlippageAmount(parsedAmountB, noLiquidity ? 0 : allowedSlippage)[0], _amountsMin);
    var estimate, method, args, value;
    if (currencyA === ETHER || currencyB === ETHER) {
      var _wrappedCurrency$addr3, _wrappedCurrency3;
      var tokenBIsETH = currencyB === ETHER;
      estimate = router.estimateGas.addLiquidityETH;
      method = router.addLiquidityETH;
      args = [(_wrappedCurrency$addr3 = (_wrappedCurrency3 = wrappedCurrency$1(tokenBIsETH ? currencyA : currencyB, chainId)) === null || _wrappedCurrency3 === void 0 ? void 0 : _wrappedCurrency3.address) != null ? _wrappedCurrency$addr3 : '', (tokenBIsETH ? parsedAmountA : parsedAmountB).raw.toString(), amountsMin[tokenBIsETH ? exports.Field.CURRENCY_A : exports.Field.CURRENCY_B].toString(), amountsMin[tokenBIsETH ? exports.Field.CURRENCY_B : exports.Field.CURRENCY_A].toString(), account, deadline.toHexString()];
      value = BigNumber.from((tokenBIsETH ? parsedAmountB : parsedAmountA).raw.toString());
    } else {
      var _wrappedCurrency$addr4, _wrappedCurrency4, _wrappedCurrency$addr5, _wrappedCurrency5;
      estimate = router.estimateGas.addLiquidity;
      method = router.addLiquidity;
      args = [(_wrappedCurrency$addr4 = (_wrappedCurrency4 = wrappedCurrency$1(currencyA, chainId)) === null || _wrappedCurrency4 === void 0 ? void 0 : _wrappedCurrency4.address) != null ? _wrappedCurrency$addr4 : '', (_wrappedCurrency$addr5 = (_wrappedCurrency5 = wrappedCurrency$1(currencyB, chainId)) === null || _wrappedCurrency5 === void 0 ? void 0 : _wrappedCurrency5.address) != null ? _wrappedCurrency$addr5 : '', parsedAmountA.raw.toString(), parsedAmountB.raw.toString(), amountsMin[exports.Field.CURRENCY_A].toString(), amountsMin[exports.Field.CURRENCY_B].toString(), account, deadline.toHexString()];
      value = null;
    }
    return Promise.resolve(estimate.apply(void 0, args.concat([value ? {
      value: value
    } : {}])).then(function (estimatedGasLimit) {
      return method.apply(void 0, args.concat([_extends({}, value ? {
        value: value
      } : {}, {
        gasLimit: calculateGasMargin(estimatedGasLimit)
      })])).then(function (response) {
        return response;
      });
    }));
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
function toV2LiquidityToken(_ref) {
  var tokenA = _ref[0],
    tokenB = _ref[1];
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
