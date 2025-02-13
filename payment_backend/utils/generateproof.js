

import * as snarkjs from 'snarkjs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get the correct directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths to compiled files
const wasmPath = path.join(__dirname, '../circuits/invoiceVerifier_js/invoiceVerifier.wasm');
const zkeyPath = path.join(__dirname, '../circuits/invoiceVerifier_js/invoiceVerifier_0001.zkey');
const vKeyPath = path.join(__dirname, '../circuits/invoiceVerifier_js/verification_key.json');

// Check if required files exist
if (!fs.existsSync(wasmPath) || !fs.existsSync(zkeyPath) || !fs.existsSync(vKeyPath)) {
    console.error("❌ Error: Required circuit files are missing.");
    process.exit(1);
}

// Function to generate and verify proof
export default async function generateProof(invoiceID, issuer, payer, amount) {
    try {
        // Convert inputs to strings (Circom expects field elements in JSON)
        const inputData = {
            invoiceID: invoiceID.toString(),
            issuer: issuer.toString(),
            payer: payer.toString(),
            amount: amount.toString()
        };

        console.log("\n🔍 Running Proof Generation...");
        console.log("Input Data:", inputData);

        // Generate proof using SnarkJS
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(inputData, wasmPath, zkeyPath);

        console.log("\n🛠 Proof Generated:");
        console.log(JSON.stringify(proof, null, 2));

        // Load verification key
        const vKey = JSON.parse(fs.readFileSync(vKeyPath, 'utf-8'));

        // Verify the proof
        const verified = await snarkjs.groth16.verify(vKey, publicSignals, proof);

        if (verified) {
            console.log("\n✅ Proof is valid and verified!");
        } else {
            console.log("\n❌ Proof verification failed.");
        }

        return proof;
    } catch (error) {
        console.error("❌ Error generating/verifying proof:", error);
        throw error;
    }
}
