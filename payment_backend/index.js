



import express from "express";
import { ethers } from "ethers";
import routes from "./routes.js";
import { ALCHEMY_API_KEY, PRIVATE_KEY } from "./utils/config.js";
import cors from "cors";
import connectDB from "./utils/connectDB.js";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from 'url';
import dotenv from "dotenv";
import Invoices from "./InvoicSchema.js";
import generateProof from "./utils/generateproof.js";

dotenv.config();

connectDB();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(bodyParser.json());
app.use(cors());
app.use("/", routes);

// Resolve the current directory using `import.meta.url`
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the 'invoices' folder
app.use('/invoices', express.static(path.join(__dirname, 'invoices')));
app.use('/receipts', express.static(path.join(__dirname, 'receipts')));

// API route to generate a proof
app.post('/generate-proof', async (req, res) => {
    const { invoiceID, issuer, payer, amount } = req.body;
    
    try {
        const proof = await generateProof(invoiceID, issuer, payer, amount);
        res.json({ proof });
    } catch (error) {
        res.status(500).send('Error generating proof');
    }
});
async function extractInvoiceData(invoiceId) {
    try {
        const invoice = await Invoices.findOne({ invoiceId });
        const proof=await generateProof(invoice.invoiceId, invoice.issuer, invoice.payer, invoice.amount);
 return proof;
        // await generateProof(12345, "0xaE5e61cC6320822c8480d85A1D57a788E750a9ba", "0x5fa0f87877d74ccfdaa1bdc44d8e630b4ec1e065", 100);
        //  console.log("Extracted Invoice Data:", invoice);
    } catch (error) {
        console.error("❌ Error extracting invoice data:", error);
    }
}

// Run function on startup
// await extractInvoiceData(3);


//  const extractInvoice=await extractInvoiceData(invoiceID);

app.post("/verify", async (req, res) => {
  const { invoiceID } = req.body;  // Get the invoiceID from the request body

  if (!invoiceID) {
    return res.status(400).send("Invoice ID is required");  // Return error if no invoiceID is provided
  }
  
  const isProof=await extractInvoiceData(invoiceID);
  if(isProof){
    res.send("Successfully verified Zk-Verify ✔✔✔ ");
  }
  else{
  res.send("Zk-Verification failed ❌❌❌ ");
  }

  console.log("Received Invoice ID:", invoiceID);  // Log the invoiceID to the console

  // res.send("Verified");  // Send back a success message
});






app.listen(port, () => console.log(`Server running on ${port}`));


// import express from "express";
// import { ethers } from "ethers";
// import routes from "./routes.js";
// import { ALCHEMY_API_KEY, PRIVATE_KEY } from "./utils/config.js";
// import cors from "cors";
// import connectDB from "./utils/connectDB.js";
// import bodyParser from "body-parser";
// import path from "path";
// import { fileURLToPath } from 'url';
// import dotenv from "dotenv";
// import Invoices from "./InvoicSchema.js";
// import { generateProof } from './utils/generateproof.js'; // ✅ Correct import

// dotenv.config();

// connectDB();
// const app = express();
// const port = process.env.PORT || 3000;

// app.use(express.json());
// app.use(bodyParser.json());
// app.use(cors());
// app.use("/", routes);

// // Resolve the current directory using `import.meta.url`
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Serve static files from the 'invoices' folder
// app.use('/invoices', express.static(path.join(__dirname, 'invoices')));
// app.use('/receipts', express.static(path.join(__dirname, 'receipts')));

// // API route to generate a proof
// app.post('/generate-proof', async (req, res) => {
//     const { invoiceID, issuer, payer, amount } = req.body;
    
//     try {
//         const proof = await generateProof(invoiceID, issuer, payer, amount);
//         res.json({ proof });
//     } catch (error) {
//         res.status(500).send('Error generating proof');
//     }
// });

// export default async function extractInvoiceData(invoiceId) {
//     try {
//         const invoice = await Invoices.findOne({ invoiceId });
//         if (!invoice) {
//             throw new Error("Invoice not found");
//         }

//         const proof = await generateProof(invoice.invoiceId, invoice.issuer, invoice.payer, invoice.amount);
//         return proof;
//     } catch (error) {
//         console.error("❌ Error extracting invoice data:", error);
//         throw error;
//     }
// }

// // Verify proof API endpoint
// app.post("/verify", async (req, res) => {
//     const { invoiceID, issuer, payer, amount } = req.body;

//     try {
//         // Fetch the invoice data from DB (you can mock this for now if needed)
//         const invoice = await Invoices.findOne({ invoiceId: invoiceID });
        
//         if (!invoice) {
//             return res.status(404).send("Invoice not found");
//         }

//         // Generate and verify the proof
//         const proof = await generateProof(invoice.invoiceId, invoice.issuer, invoice.payer, invoice.amount);

//         if (proof) {
//             res.send("Verified");
//         } else {
//             res.status(400).send("Proof verification failed");
//         }
//     } catch (error) {
//         console.error("❌ Error during verification:", error);
//         res.status(500).send("Error during verification");
//     }
// });

// app.listen(port, () => {
//     console.log(`Server running on port ${port}`);
// });
