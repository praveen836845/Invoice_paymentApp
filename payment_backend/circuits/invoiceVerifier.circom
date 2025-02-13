pragma circom 2.0.0;

template InvoiceVerifier() {
    signal input invoiceID;
    signal input issuer;
    signal input payer;
    signal input amount;
    signal output verified;

    // Define binary signals (must be either 0 or 1)
    signal issuerValid;
    signal payerValid;
    signal amountValid;

    // Ensure issuerValid is 1 if issuer is non-zero, else 0
    issuerValid <-- (issuer != 0) ? 1 : 0;
    issuerValid * (issuerValid - 1) === 0; // Enforce binary signal

    // Ensure payerValid is 1 if payer is non-zero, else 0
    payerValid <-- (payer != 0) ? 1 : 0;
    payerValid * (payerValid - 1) === 0; // Enforce binary signal

    // Ensure amountValid is 1 if amount is greater than 0, else 0
    amountValid <-- (amount > 0) ? 1 : 0;
    amountValid * (amountValid - 1) === 0; // Enforce binary signal

    // Combine the validity checks into a final validity signal
    signal combinedValid;
    combinedValid <== issuerValid * payerValid; // Combine issuerValid and payerValid
    signal finalValid;
    finalValid <== combinedValid * amountValid; // Combine the result with amountValid

    // Enforce finalValid is binary (0 or 1)
    finalValid * (finalValid - 1) === 0;

    // Set the verified output to the final validity signal
    verified <== finalValid;
}

component main = InvoiceVerifier();