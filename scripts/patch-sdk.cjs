/* Patches all @cryptoalgebra bundled copies of integral-sdk to add Hemi (43111).
 * Idempotent: safe to run multiple times. Invoked via the `postinstall` script.
 *
 * Why: upstream SDK is hardcoded to BaseSepolia only. Several Algebra SDK packages
 * (alm-sdk, custom-pools-sdk, integral-sdk) each bundle their OWN copy of the
 * integral-sdk constants. We patch every bundle so ChainId.Hemi is available
 * whichever bundle Vite picks up. Pool deployer + init code hash are read straight
 * from BrownFi's Algebra fork on Hemi (hemi-deploys.json / on-chain), so CREATE2
 * pool addresses compute correctly.
 */
const fs = require("fs");
const path = require("path");

const NODE_MODULES = path.join(__dirname, "..", "node_modules");

const HEMI_ID = 43111;
const HEMI_POOL_DEPLOYER = "0xd7cB0E0692f2D55A17bA81c1fE5501D66774fC4A";
// Same fork bytecode as Berachain → identical init code hash (verified on-chain
// via factory.POOL_INIT_CODE_HASH() on Hemi mainnet).
const HEMI_POOL_INIT_CODE_HASH = "0x62441ebe4e4315cf3d49d5957f94d66b253dbabe7006f34ad7f70947e60bf15c";
// Wrapped native ETH on Hemi (standard OP-stack predeploy).
const WETH = "0x4200000000000000000000000000000000000006";

function walk(dir, results = []) {
    if (!fs.existsSync(dir)) return results;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full, results);
        else if (entry.isFile() && /\.(cjs\.development|cjs\.production\.min|esm)\.js$/.test(entry.name)) {
            results.push(full);
        }
    }
    return results;
}

function patchDev(content) {
    if (!content.includes("BaseSepolia: 84532")) return null;
    if (content.includes("Hemi: " + HEMI_ID)) return null; // already patched

    let next = content;
    next = next.replace(
        "var ChainId = {\n  BaseSepolia: 84532\n};",
        `var ChainId = {\n  BaseSepolia: 84532,\n  Hemi: ${HEMI_ID}\n};`
    );
    next = next.replace(
        /_POOL_DEPLOYER_ADDRES\[ChainId\.BaseSepolia\] = '0xA064Bcb79F27213b6e39dC4a2E3b977e97489BC9', _POOL_DEPLOYER_ADDRES\)/,
        `_POOL_DEPLOYER_ADDRES[ChainId.BaseSepolia] = '0xA064Bcb79F27213b6e39dC4a2E3b977e97489BC9', _POOL_DEPLOYER_ADDRES[ChainId.Hemi] = '${HEMI_POOL_DEPLOYER}', _POOL_DEPLOYER_ADDRES)`
    );
    next = next.replace(
        /_POOL_INIT_CODE_HASH\[ChainId\.BaseSepolia\] = '0x62441ebe4e4315cf3d49d5957f94d66b253dbabe7006f34ad7f70947e60bf15c', _POOL_INIT_CODE_HASH\)/,
        `_POOL_INIT_CODE_HASH[ChainId.BaseSepolia] = '0x62441ebe4e4315cf3d49d5957f94d66b253dbabe7006f34ad7f70947e60bf15c', _POOL_INIT_CODE_HASH[ChainId.Hemi] = '${HEMI_POOL_INIT_CODE_HASH}', _POOL_INIT_CODE_HASH)`
    );
    next = next.replace(
        /_WNATIVE\[ChainId\.BaseSepolia\] = \/\*#__PURE__\*\/new Token\(ChainId\.BaseSepolia, '0x4200000000000000000000000000000000000006', 18, 'WETH', 'Wrapped ETH'\), _WNATIVE\)/,
        `_WNATIVE[ChainId.BaseSepolia] = /*#__PURE__*/new Token(ChainId.BaseSepolia, '0x4200000000000000000000000000000000000006', 18, 'WETH', 'Wrapped ETH'), _WNATIVE[ChainId.Hemi] = /*#__PURE__*/new Token(ChainId.Hemi, '${WETH}', 18, 'WETH', 'Wrapped Ether'), _WNATIVE)`
    );
    return next === content ? null : next;
}

function patchMin(content) {
    if (!content.includes("BaseSepolia:84532")) return null;
    if (content.includes("Hemi:" + HEMI_ID)) return null;

    let next = content;

    // ChainId enum: `BaseSepolia:84532` → `BaseSepolia:84532,Hemi:43111`
    next = next.replace("BaseSepolia:84532", `BaseSepolia:84532,Hemi:${HEMI_ID}`);

    // POOL_DEPLOYER_ADDRESSES — minified shape: `(VAR={})[CHAIN.BaseSepolia]="0xA064..."`.
    // Capture VAR + CHAIN minified vars and inject a Hemi entry right after.
    next = next.replace(
        /\((\w+)=\{\}\)\[(\w+)\.BaseSepolia\]="0xA064Bcb79F27213b6e39dC4a2E3b977e97489BC9"/g,
        `($1={})[$2.BaseSepolia]="0xA064Bcb79F27213b6e39dC4a2E3b977e97489BC9",$1[$2.Hemi]="${HEMI_POOL_DEPLOYER}"`
    );

    // POOL_INIT_CODE_HASH — same shape with the init-code-hash literal
    next = next.replace(
        /\((\w+)=\{\}\)\[(\w+)\.BaseSepolia\]="0x62441ebe4e4315cf3d49d5957f94d66b253dbabe7006f34ad7f70947e60bf15c"/g,
        `($1={})[$2.BaseSepolia]="0x62441ebe4e4315cf3d49d5957f94d66b253dbabe7006f34ad7f70947e60bf15c",$1[$2.Hemi]="${HEMI_POOL_INIT_CODE_HASH}"`
    );

    // WNATIVE — shape: `(VAR={})[CHAIN.BaseSepolia]=new TOKEN(CHAIN.BaseSepolia,"0x4200...",18,"WETH","Wrapped ETH")`
    next = next.replace(
        /\((\w+)=\{\}\)\[(\w+)\.BaseSepolia\]=new (\w+)\(\2\.BaseSepolia,"0x4200000000000000000000000000000000000006",18,"WETH","Wrapped ETH"\)/g,
        `($1={})[$2.BaseSepolia]=new $3($2.BaseSepolia,"0x4200000000000000000000000000000000000006",18,"WETH","Wrapped ETH"),$1[$2.Hemi]=new $3($2.Hemi,"${WETH}",18,"WETH","Wrapped Ether")`
    );

    return next === content ? null : next;
}

function patchDts() {
    const dts = path.join(NODE_MODULES, "@cryptoalgebra/integral-sdk/dist/constants/chainIds.d.ts");
    if (!fs.existsSync(dts)) return;
    let content = fs.readFileSync(dts, "utf8");
    if (content.includes("Hemi")) return;
    content = content.replace("BaseSepolia: number;", "BaseSepolia: number;\n    Hemi: number;");
    fs.writeFileSync(dts, content);
}

function main() {
    const bundles = walk(NODE_MODULES);
    let patched = 0;
    let alreadyPatched = 0;
    const drifted = [];

    for (const file of bundles) {
        const isMin = file.endsWith(".cjs.production.min.js");
        const content = fs.readFileSync(file, "utf8");

        // Only integral-sdk constants bundles carry the BaseSepolia ChainId marker.
        const chainMarker = isMin ? "BaseSepolia:84532" : "BaseSepolia: 84532";
        if (!content.includes(chainMarker)) continue;

        const hemiMarker = isMin ? "Hemi:" + HEMI_ID : "Hemi: " + HEMI_ID;
        if (content.includes(hemiMarker)) {
            alreadyPatched++;
            continue;
        }

        // ESM and dev CJS share the same unminified shape — patchDev handles both.
        const next = isMin ? patchMin(content) : patchDev(content);

        // A bundle carrying the BaseSepolia marker MUST come out with a matching
        // Hemi entry for every BaseSepolia entry it contained. If the pinned
        // replace literals drifted (upstream version bump / reformat), the
        // replaces become no-ops and we'd otherwise ship ChainId.Hemi === undefined
        // (breaking CREATE2 pool-address math) with a green build. Fail loudly instead.
        // Init-code-hash and WNATIVE addresses are identical on BaseSepolia and
        // Hemi, so we can only assert on the two entries that actually differ.
        const expectations = [
            { base: chainMarker, hemi: hemiMarker, label: "ChainId.Hemi" },
            { base: "0xA064Bcb79F27213b6e39dC4a2E3b977e97489BC9", hemi: HEMI_POOL_DEPLOYER, label: "POOL_DEPLOYER[Hemi]" },
        ];
        const missing = expectations.filter((e) => content.includes(e.base) && (!next || !next.includes(e.hemi)));
        if (missing.length) {
            drifted.push(`${path.relative(NODE_MODULES, file)} (missing: ${missing.map((m) => m.label).join(", ")})`);
            continue;
        }

        fs.writeFileSync(file, next);
        console.log(`[patch-sdk] patched ${path.relative(NODE_MODULES, file)}`);
        patched++;
    }
    patchDts();

    if (drifted.length) {
        throw new Error(
            `[patch-sdk] FAILED to inject Hemi into ${drifted.length} SDK bundle(s):\n` +
                drifted.map((f) => "  - " + f).join("\n") +
                "\n\nThe @cryptoalgebra bundle shape changed — the replace patterns in " +
                "scripts/patch-sdk.cjs no longer match. Update them to the new shape. " +
                "(The @cryptoalgebra/* deps are pinned exact in package.json to prevent this; " +
                "if you bumped one, re-verify the patch.)"
        );
    }
    if (patched === 0 && alreadyPatched === 0) {
        throw new Error(
            "[patch-sdk] No @cryptoalgebra integral-sdk constants bundle found to patch. " +
                "CLMM would ship with ChainId.Hemi undefined. Verify @cryptoalgebra/* deps are installed " +
                "and that postinstall ran (not skipped via --ignore-scripts)."
        );
    }
    if (patched === 0) console.log(`[patch-sdk] all ${alreadyPatched} bundle(s) already patched`);
    else console.log(`[patch-sdk] patched ${patched} bundle(s)${alreadyPatched ? `, ${alreadyPatched} already patched` : ""}`);
}

main();
