export const generateTonProof = async (baseUrl) => {
    try {
        const response = await fetch(`${baseUrl}/auth/generate-payload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();
        return { tonProof: data.payload };
    } catch {
        return null;
    }
}

export const checkTonProof = async (baseUrl, proof, account) => {
    try {
        const body = {
            address: account.address,
            network: account.chain,
            publicKey: account.publicKey,
            proof: {
                ...proof,
                state_init: account.walletStateInit,
            },
        };

        const response = await (
            await fetch(`${baseUrl}/auth/check-proof`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })
        ).json();

        return response?.authToken;
    } catch (e) {
        return null
    }
}
