🔐✅ BlockInvoice - A zkVerify-Powered Web3 Invoice System

## 🚀 Introduction
BlockInvoice is a decentralized invoice management system that enables merchants, consumers, or anyone to create invoices for services or products and request payments in ETH on the Arbitrum blockchain. The platform ensures security, transparency, and privacy using zkVerify, allowing verification of invoices without revealing sensitive details.

## 🔥 Problem Statement
Traditional invoice systems lack transparency and privacy, leading to trust issues between buyers and sellers. Additionally, verifying the authenticity of an invoice requires centralized trust, which can be manipulated.

## 🛠 Solution
BlockInvoice integrates zkVerify to generate zero-knowledge proofs (ZK proofs) for invoices, ensuring:

- Secure invoice creation and verification.
- Privacy-preserving validation using zk-SNARKs.
- Decentralized, trustless verification using cryptographic proofs.
- On-chain invoice payments in ETH using Arbitrum Sepolia.

## 🌟 Features
- 📜 Invoice Creation - Users can generate invoices for their transactions.
- 🔗 Invoice Verification - Buyers can verify invoices through zkVerify.
- 💰 Crypto Payments - Payments are processed in ETH on Arbitrum Sepolia.
- 🔒 Zero-Knowledge Proofs - Ensures privacy-preserving invoice verification.
- 🧾 Receipt Storage - Securely store invoices and receipts on the blockchain.

## ⚙ Technologies Used
- **Arbitrum Sepolia** - Blockchain network for transactions.
- **zkVerify** - Zero-knowledge proof verification platform.
- **Circom & SnarkJS** - Used for generating and verifying ZK proofs.
- **MongoDB** - Stores invoice data for proof generation.
- **Next.js & Tailwind CSS** - Frontend framework for a smooth user experience.
- **Solidity & Hardhat** - Smart contract development and deployment.
- **Ethers.js & MetaMask** - Blockchain interactions and wallet integration.

## 📌 Installation & Setup
Follow these steps to set up BlockInvoice locally:

### *1. Install Circom*
```sh
# Install Rust for Circom
curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh

# Clone Circom repository
git clone https://github.com/iden3/circom.git
cd circom

# Compile Circom
cargo build --release
cargo install --path circom
```

### *2. Install SnarkJS*
```sh
npm install -g snarkjs
```

### *3. Compile Circuit*
```sh
circom multiplier2.circom --r1cs --wasm --sym --c
```

### *4. Generate Proof & Verification Key*
```sh
# Prepare phase 2
snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau -v

# Setup proving key
snarkjs groth16 setup multiplier2.r1cs pot12_final.ptau multiplier2_0000.zkey

# Contribute to phase 2
snarkjs zkey contribute multiplier2_0000.zkey multiplier2_0001.zkey --name="1st Contributor Name" -v

# Export verification key
snarkjs zkey export verificationkey multiplier2_0001.zkey verification_key.json
```

### *5. Generate & Verify Proof*
```sh
# Generate proof
snarkjs groth16 prove multiplier2_0001.zkey witness.wtns proof.json public.json

# Verify proof
snarkjs groth16 verify verification_key.json public.json proof.json
```

### *6. Deploy Solidity Verifier*
```sh
snarkjs zkey export solidityverifier multiplier2_0001.zkey verifier.sol
```

## 📜 How zkVerify is Integrated
1. **Invoice Creation** - When a user creates an invoice, zkVerify generates a zero-knowledge proof for invoice details.
2. **Proof Generation** - Using Circom, the invoice data is processed with constraints to generate a cryptographic proof.
3. **Proof Verification** - The proof is verified using SnarkJS on zkVerify’s backend.
4. **User Confirmation** - zkVerify provides a boolean response, confirming invoice authenticity.

## 🚀 Future Enhancements
- **Multi-Currency Support** - Enable payments in other cryptocurrencies.
- **Mobile Application** - Develop a mobile-friendly version for broader adoption.
- **Decentralized Storage** - Store invoices using IPFS or Arweave for enhanced security.
- **Automated Tax Compliance** - Implement smart contract-based tax calculations.

## 🔗 Deployed Links
- **Frontend:** [invoice-payment-app.vercel.app ]
- **Backend:** [Insert Backend Link]

## 📧 Contact & Support
Have questions? Reach out at [g381412@gmail.com](mailto:g381412@gmail.com)

---

*Made with ❤ for the zkVerify Web3 Hackathon! 🚀*

