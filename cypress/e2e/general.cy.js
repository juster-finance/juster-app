describe("General Tests", () => {
	it("correct loading of the main page", () => {
		cy.visit("/")

		cy.getBySel("market-card").should("be.visible").should("have.length", 3)
		cy.getBySel("rating-card-liquidity")
			.should("be.visible")
			.should("have.length", 1)
		cy.getBySel("event-card").should("be.visible").should("have.length", 3)
		cy.getBySel("rating-card-bettors")
			.should("exist")
			.should("have.length", 1)

		cy.getBySel("systems-status")
			.should("exist")
			.should("satisfy", (elements) => {
				const text = elements[0].innerText
				return (
					text === "All systems online" ||
					text === "Some systems delayed"
				)
			})
		cy.getBySel("network-dropdown")
			.should("exist")
			.should("satisfy", (elements) => {
				const text = elements[0].innerText
				return text === "Mainnet" || text === "Testnet"
			})
	})
})
