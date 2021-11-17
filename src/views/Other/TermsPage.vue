<script>
import { defineComponent } from "vue"

/**
 * Base
 */
import Page from "@/components/base/Page"

export default defineComponent({
    name: "TermsPage",

    components: { Page },
})
</script>

<template>
    <Page>
        <h1 id="terms-of-use">Terms of Use</h1>
        <div :class="$style.description">Last Updated: October 25th 2021</div>

        <div :class="$style.block">
            <p>
                These Terms of Use, together with any documents and additional
                terms they expressly incorporate by reference (collectively,
                these “Terms”), are entered into between Juster (“Juster,” “we,”
                “us” and “our”) and you or the company or other legal entity you
                represent (“you” or “your”), and constitute a binding legal
                agreement. Please read these Terms carefully, as these Terms
                govern your use of our Website (<a href="https://app.juster.fi/"
                    >https://app.juster.fi/</a
                >) and the Juster Protocol (on-chain software), and expressly
                cover your rights and obligations, and our disclaimers and
                limitations of legal liability, relating to such use. By
                accessing or using our Website or our Protocol, you accept and
                agree to be bound by and to comply with these Terms. If you do
                not agree to these Terms, you must not access or use our Website
                or the Protocol for any purpose.
            </p>
        </div>

        <div :class="$style.block">
            <h2 id="-modifications-to-these-terms-">
                Modifications to these terms
            </h2>
            <p>
                Juster reserves the right to modify these Terms at any time and
                in our sole discretion. In case of any changes, we will provide
                you with notice of such changes, such as by sending an email,
                providing a notice through our Website or updating the date at
                the top of these Terms. Unless we say otherwise in our notice,
                any and all such modifications are effective immediately, and
                your continued use of our Website or our Protocol after we
                provide such notice will confirm your acceptance of the changes.
                If you do not agree to the amended Terms, you must stop using
                our Website and our Protocol.
            </p>
        </div>

        <div :class="$style.block">
            <h2 id="-definitions-">Definitions</h2>
            <p>
                For the purpose of these Terms, the following capitalized terms
                shall have the following meanings:
            </p>
            <p>
                “Protocol” means the Juster’s set of smart contracts that are
                deployed on the Tezos Blockchain.
            </p>
            <p>
                “Website” means the Juster’s application website and all its
                components (<a href="https://app.juster.fi/"
                    >https://app.juster.fi/</a
                >)
            </p>
            <p>
                “Tez” means the Tezos Blockchain utility token that may be used
                to perform actions on the Tezos Blockchain.
            </p>
            <p>
                “Event” means Juster’s contract data structure, consisting of a
                bunch of parameters and associated with some off-chain event
                through an on-chain oracle’s data feed. Each Juster’s Event has
                two possible outcomes and that is determined using the oracle
                data.
            </p>
            <p>
                “Bet” means an on-chain operation that represents a bet of a
                certain amount of tez on one of an Event’s outcomes.
            </p>
            <p>
                “Liquidity Providing” means an on-chain operation that
                represents adding a certain amount of tokens to the Event as
                liquidity.
            </p>
            <p>
                “Smart Contract” means an immutable piece of code stored on the
                blockchain, that contains a set of instructions and rules to
                trigger.
            </p>
        </div>

        <div :class="$style.block">
            <h2 id="-general-">General</h2>
            <p>
                Juster Protocol is an on-chain smart contract protocol allowing
                users to take part in an automated betting market by creating
                events, providing liquidity to them, and making bets. The Juster
                Website’s primary purpose is to enable users to interact with
                Juster’s smart contracts and hedge against risk or gain exposure
                to risk via the bets. It also allows users to observe events on
                Juster Protocol, users’ provided liquidity and bets and Protocol
                state and stats.
            </p>
            <p>Disclaimers</p>
            <p>
                Juster Protocol and Website is made up of free, public,
                open-source or source-available software including a set of
                smart contracts that are deployed on the Tezos Blockchain.
                However, Baking Bad OÜ does not provide, own, or control the
                Juster Protocol, which is run by smart contracts deployed on the
                Tezos blockchain. No developer or entity involved in creating
                the Juster Protocol and Website will be liable for any claims or
                damages whatsoever associated with your use, inability to use,
                or your interaction with other users of, the Juster Protocol and
                Website, including any direct, indirect, incidental, special,
                exemplary, punitive or consequential damages, or loss of
                profits, cryptocurrencies, tokens, or anything else of value.
            </p>
            <p>
                Baking Bad OÜ is not a financial institution, investment
                company, broker, money transmission provider, money service
                business, payment service provider or a company similar to them.
                Baking Bad OÜ is not a counterparty, intermediary, agent, or
                advisor in on-chain operations made between users, and is also
                not a market maker. Its activity is not subject to financial
                regulation of any jurisdiction.
            </p>
            <p>
                Baking Bad OÜ has no fiduciary relationship or obligation to you
                regarding any other decisions or activities that you effect when
                using the Juster’s Website or the Protocol. Neither our
                communications nor any information that we provide to you is
                intended as, or shall be considered or construed as, advice.
            </p>
            <p>Eligibility</p>
            <p>
                Prior to Your use of the Juster Protocol and Website and on an
                ongoing basis you represent, warrant, covenant and agree that:
            </p>
            <ul>
                <li>
                    You use Juster Protocol and Website at Your sole option,
                    discretion and risk;
                </li>
                <li>
                    You are solely responsible for any applicable taxes which
                    may be payable while using our product;
                </li>
                <li>
                    You represent and warrant that you are not under the control
                    of or a citizen or resident of a state, country, territory
                    or other jurisdiction that is embargoed by the United States
                    or where your use of the Website or the Protocol would be
                    illegal or otherwise violate any applicable law;
                </li>
                <li>
                    You are at least 18 years old or of other legal age,
                    according to Your relevant jurisdiction;
                </li>
                <li>
                    You have reviewed the relevant documentation and made sure
                    You understand how the Juster Protocol and Website works
                </li>
                <li>
                    there are risks, associated with Internet-based systems,
                    such as the failure of hardware, software, and Internet
                    connections and with the Blockchain Protocols, such as any
                    malfunction, unintended function, unexpected functioning of
                    or attack on the Blockchain protocols, that we shall not be
                    responsible for;
                </li>
                <li>
                    You guarantee that Your crypto assets belong to You and they
                    are not stolen, sold, encumbered, not in contention, or
                    under seizure, and that neither exist any rights of third
                    parties to your crypto assets;
                </li>
                <li>
                    You will not attempt to mix or launder via the Juster
                    Protocol any crypto assets, which are obtained from illegal
                    gambling activities; fraud; money-laundering; terrorist
                    activities; hacking or any other illegal activities;
                </li>
                <li>
                    You shall not use any code modifications, bugs of Juster’s
                    software, any third-party applications or any other
                    techniques for constructing any malicious on-chain
                    operations, including but not limited to incorrect, spam,
                    malicious, funds draining and front-running ones.
                </li>
                <li>
                    In case of finding out any algorithm, code or any other
                    vulnerabilities or any funds extracting opportunities you
                    shall contact the Juster’s stuff via any official way of
                    communication.
                </li>
                <li>
                    SYou shall not distribute any virus or other harmful
                    computer code through Juster Website or take any actions
                    that may impose an unreasonable or disproportionately large
                    load on Juster Website or any third-party providers’
                    infrastructure.
                </li>
            </ul>
        </div>

        <div :class="$style.block">
            <h2 id="-privacy-">Privacy</h2>
            <p>
                Juster Website doesn’t have access to Your Seed Phrase and
                private keys but has access to some certain impersonal data
                including logs, error codes, error descriptions and telemetry
                data. It is used to improve the application experience and solve
                technical issues. Juster will never collect, store or share Your
                personal information to third parties.
            </p>
        </div>

        <div :class="$style.block">
            <h2 id="-blockchain-risks-">Blockchain Risks</h2>
            <p>
                Cryptographic Currencies are associated with some apparent
                risks. The Juster Website provides functionality that allows You
                to generate Cryptographic Currency transactions and transmit
                them to Your wallet. But Juster Website has no control over the
                Tezos blockchain that You can interact with, and has no ability
                to cancel, modify or affect any transaction that You have caused
                to be transmitted to the Tezos blockchain network. The Juster
                Website does not guarantee that transactions You perform shall
                be stored in the Tezos blockchain or the conditions of the
                operation will be the same as expected. Providing correct
                transaction data including slippage, fees, gas limit, storage
                limit and e.g. is Your sole responsibility. You should take care
                to understand the details of the Tezos blockchain. Juster
                Website shall not be responsible for any losses You incur due to
                transaction fees, front-running attacks, lack of liquidity or
                any losses that occur due to incorrectly set transaction data.
            </p>
        </div>

        <div :class="$style.block">
            <h2 id="-instruments-prices-and-fees-">
                Instruments Prices and Fees
            </h2>
            <p>
                The estimated reward and liquidity provider fees in case of a
                bet and the ratio and reward for providing in the case of
                liquidity providing which is presented to You in the Juster
                Website prior to submitting the operation are not final. It can
                differ from the final values due to other users’ bets, changes
                of liquidity, front-running attacks, Tezos network conditions
                and e.g.
            </p>
            <p>
                Juster’s protocol supposes additional Fees to reward other
                participants for successfully completing Events, performing
                withdrawals for users, and other protocol maintaining works.
            </p>
            <p>
                Changes to the Juster protocol liquidity providing, bets and
                fees mechanisms and Website interface may be done at our sole
                discretion and are effective from the moment of making these
                changes, and will apply prospectively to any following Protocol
                operations.
            </p>
        </div>

        <div :class="$style.block">
            <h2 id="-license-">License</h2>
            <p>
                Juster Protocol and Website are developed by Baking Bad OÜ under
                a GPLv3 open-source license. Information regarding Juster’s
                current software can be found at<a
                    href="https://github.com/juster-finance"
                >
                    https://github.com/juster-finance</a
                >. Since software development is free, it can be accessed, used,
                and shared, in modified or unmodified form, by anyone. Please be
                aware that GPL is a copyleft license, which means that any
                derivative works can only be distributed under the same license
                terms as the original software. If you have any questions, you
                should review GNU’s terms and conditions at<a
                    href="https://www.gnu.org/licenses/gpl-3.0.en.html"
                >
                    https://www.gnu.org/licenses/gpl-3.0.en.html</a
                >. We may include other open-source software that are separately
                licensed and the license in this agreement does not cover the
                third-party open-source software that is provided by Juster
                Protocol and Website.
            </p>
        </div>

        <div :class="$style.block">
            <h2 id="-suspension-">Suspension</h2>
            <p>
                Juster Website contains elements that rely on backend
                infrastructure run by Baking Bad OÜ (and possibly other parties)
                that may be turned off temporarily or permanently without any
                notifications due to stop unlawful conduct or if it is deemed
                necessary to do so at the Baking Bad OÜ sole discretion. Some or
                all of the Juster Website service may not be available in all
                locations worldwide due to Local Laws, geodata block or other
                measures taken by Baking Bad OÜ to ensure compliance with laws
                or to improve the quality of service.
            </p>
        </div>

        <div :class="$style.block">
            <h2 id="-third-parties-">Third-Parties</h2>
            <p>
                Juster Protocol and Website provide services that You have the
                option of using which may involve third-party services that are
                owned and run by organizations (or companies) not related to us.
                There may be additional terms or rules applicable to third-party
                services, and we shall not be liable for any issues, actions, or
                negative consequences that arise as a result of Your use of
                third-party services.
            </p>
            <p>
                We retain the exclusive right to add to, modify, or cancel the
                availability of any Third-Party Service in our sole discretion.
            </p>
            <p>
                Notwithstanding the foregoing, if You make use of third-party
                services that enable Cryptographic Currency transfers or
                financial transfers then You may be at risk due to malfunctions
                or other issues with third-party services, for which we are not
                and cannot be responsible in any case.
            </p>
        </div>

        <div :class="$style.block">
            <h2 id="-support-">Support</h2>
            <p>
                We offer free technical support to all users of Juster Protocol
                and Website but this support is offered to You without any
                warranty of any kind of issues and shall be at Your sole risk.
                We may choose to refuse free technical support for You at any
                time and may choose to discontinue providing You with technical
                support at any time. You shall at all times act respectfully to
                Juster’s staff and must make sure that Your Seed Phrase, private
                keys, or any other confidential information are stored safely
                and shall not be disclosed, accidently or by any purpose.
            </p>
        </div>

        <div :class="$style.block">
            <h2 id="-limitation-on-liability-">Limitation on liability</h2>
            <ul>
                <li>
                    You acknowledge and agree that You assume full
                    responsibility for Your use of the software.
                </li>
                <li>
                    All data available through the Website is provided and
                    displayed “as is” and we provide no guarantee for its
                    correctness. We disclaim any responsibility for any missing
                    or wrong information. You understand that you are using any
                    information provided by the Website at your sole risk.
                </li>
                <li>
                    You acknowledge and agree that any information You send or
                    receive during Your use of the software may not be secure
                    and may be intercepted or later acquired by unauthorized
                    parties.
                </li>
                <li>
                    You acknowledge and agree that Your use of the software is
                    at Your own risk. Accordingly, You understand and agree
                    that, to the fullest extent permitted by applicable law, we
                    will not be liable to You for any direct, indirect, special,
                    consequential, exemplary, incidental, or other damages of
                    any kind, including damages for loss of profits or goodwill
                </li>
                <li>
                    You acknowledge that we are not liable the for losses of use
                    or the inability to use the software; unauthorized access to
                    Your account by third persons; human mistakes; technical
                    malfunctions and failures, including public utility or
                    network connection issues, interruptions, latency, packet
                    losses, deletions or any other defects of any device or
                    network, providers, or software;
                </li>
                <li>
                    We are not liable for any injury or damage to computer
                    equipment; inability to fully access the software or any
                    other website; the data delayed or provided incorrectly or
                    is incomplete or lost; theft, tampering, destruction, or
                    unauthorized access to any content of any kind; or any other
                    matter relating to the software.
                </li>
            </ul>
        </div>

        <div :class="$style.block">
            <h2 id="-statute-of-limitations-">Statute of Limitations</h2>
            <p>
                You agree that regardless of any statute or law to the contrary,
                any claim or cause of action arising out of or related to the
                use of the Terms of Use must be filed within one (1) month,
                otherwise such claim or cause of action must be refused or
                forever barred.
            </p>
        </div>

        <div :class="$style.block">
            <h2 id="-non-waiver-">Non-Waiver</h2>
            <p>
                No action or inaction on the part of Juster’s staff (except
                legal actions) shall be considered a waiver, of refusal, or
                exemption, of any right or obligation by Juster’s staff and/or
                Baking Bad OÜ.
            </p>
        </div>

        <div :class="$style.block">
            <h2 id="-entire-agreement-">Entire Agreement</h2>
            <p>
                This agreement is the entire agreement between the parties and
                fully supersedes any other representations or agreements between
                the parties. Moreover, the parties have entered into this
                agreement without relying on any representations or warranties
                made outside of this agreement.
            </p>
        </div>
    </Page>
</template>

<style module>
.description {
    font-size: 14px;
    line-height: 1;
    font-weight: 500;
    color: var(--text-tertiary);

    margin: 16px 0 40px 0;
}

.block {
    margin-bottom: 40px;
}

.block h2 {
    margin-bottom: 16px;
}

.block p, .block ul {
    font-size: 14px;
    line-height: 1.6;
    font-weight: 400;
    color: var(--text-secondary);
}
</style>
