export default function DisclaimerPage() {
  return (
    <div className="min-h-screen py-12 px-4" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8" style={{ color: 'var(--primary)' }}>
          Legal Disclaimer
        </h1>

        <div className="space-y-6" style={{ color: 'var(--on-surface)' }}>
          <p className="text-sm" style={{ color: 'var(--on-surface-variant)' }}>
            <strong>Last Updated:</strong> March 22, 2026
          </p>

          {/* Main Disclaimer Banner */}
          <div
            className="p-6 rounded-lg"
            style={{
              backgroundColor: 'var(--error-container)',
              borderLeft: '4px solid var(--error)',
            }}
          >
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--on-error-container)' }}>
              IMPORTANT LEGAL DISCLAIMER
            </h2>
            <p className="text-lg font-semibold mb-3" style={{ color: 'var(--on-error-container)' }}>
              READ THIS CAREFULLY BEFORE USING BITTAXLY
            </p>
            <p style={{ color: 'var(--on-error-container)' }}>
              By using BitTaxly, you acknowledge and agree that you have read, understood, and accept all disclaimers set forth on this page. If you do not agree, you must not use this service.
            </p>
          </div>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--on-surface)' }}>
              1. No Tax Advice
            </h2>

            <div className="space-y-4">
              <p className="font-semibold text-lg" style={{ color: 'var(--error)' }}>
                BitTaxly IS NOT a tax advisor, tax preparer, or tax professional.
              </p>

              <p>
                The information provided by BitTaxly is for <strong>informational purposes only</strong> and does not constitute tax advice, tax preparation services, or professional tax consulting.
              </p>

              <p>
                We do not:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide personalized tax advice</li>
                <li>Prepare or file tax returns</li>
                <li>Guarantee the accuracy of tax calculations</li>
                <li>Interpret tax laws or regulations</li>
                <li>Advise on tax strategies or tax optimization</li>
                <li>Represent you before tax authorities</li>
              </ul>

              <div
                className="p-4 rounded-lg mt-4"
                style={{ backgroundColor: 'var(--warning-container)', borderLeft: '3px solid var(--warning)' }}
              >
                <p className="font-semibold mb-2" style={{ color: 'var(--on-warning-container)' }}>
                  You MUST consult a qualified tax professional
                </p>
                <p style={{ color: 'var(--on-warning-container)' }}>
                  Tax laws are complex and vary by jurisdiction. Always consult a certified public accountant (CPA), enrolled agent (EA), or licensed tax attorney before making tax-related decisions or filing tax returns.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--on-surface)' }}>
              2. No Financial Advice
            </h2>

            <div className="space-y-4">
              <p className="font-semibold text-lg" style={{ color: 'var(--error)' }}>
                BitTaxly IS NOT a financial advisor or investment advisor.
              </p>

              <p>
                Nothing on this platform constitutes financial advice, investment advice, trading advice, or recommendations to buy, sell, or hold any cryptocurrency, token, or other asset.
              </p>

              <p>
                We do not:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Recommend specific investments or trading strategies</li>
                <li>Provide financial planning or wealth management services</li>
                <li>Offer investment advice of any kind</li>
                <li>Guarantee any financial outcomes or returns</li>
              </ul>

              <div
                className="p-4 rounded-lg mt-4"
                style={{ backgroundColor: 'var(--warning-container)', borderLeft: '3px solid var(--warning)' }}
              >
                <p className="font-semibold mb-2" style={{ color: 'var(--on-warning-container)' }}>
                  Cryptocurrency investments carry significant risk
                </p>
                <p style={{ color: 'var(--on-warning-container)' }}>
                  You may lose your entire investment. Past performance does not guarantee future results. Only invest what you can afford to lose. Consult a licensed financial advisor before making investment decisions.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--on-surface)' }}>
              3. No Legal Advice
            </h2>

            <div className="space-y-4">
              <p className="font-semibold text-lg" style={{ color: 'var(--error)' }}>
                BitTaxly IS NOT a law firm and does not provide legal advice.
              </p>

              <p>
                The information on this platform does not constitute legal advice and should not be relied upon as such. We do not provide legal opinions or interpretations of laws and regulations.
              </p>

              <p>
                For legal advice regarding cryptocurrency regulations, tax law, securities law, or any other legal matter, consult a licensed attorney in your jurisdiction.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--on-surface)' }}>
              4. No Accuracy Guarantee
            </h2>

            <div className="space-y-4">
              <p className="font-semibold" style={{ color: 'var(--error)' }}>
                We make NO representations or warranties about the accuracy, completeness, or reliability of any data or information provided.
              </p>

              <p>
                Blockchain data, token prices, transaction histories, and tax calculations may contain errors, omissions, or inaccuracies. Sources of potential errors include:
              </p>

              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Blockchain Data:</strong> Incomplete transaction history, missing data, blockchain reorganizations</li>
                <li><strong>Price Data:</strong> Inaccurate or delayed price feeds, missing historical prices</li>
                <li><strong>Token Identification:</strong> Misidentified tokens, incorrect token metadata</li>
                <li><strong>Transaction Classification:</strong> Incorrectly categorized transactions (trade, transfer, etc.)</li>
                <li><strong>Tax Calculations:</strong> Errors in cost basis, gain/loss calculations, or tax treatment</li>
                <li><strong>Third-Party Services:</strong> Errors from blockchain RPC providers, price oracles, or APIs</li>
              </ul>

              <div
                className="p-4 rounded-lg mt-4"
                style={{ backgroundColor: 'var(--error-container)', borderLeft: '3px solid var(--error)' }}
              >
                <p className="font-semibold mb-2" style={{ color: 'var(--on-error-container)' }}>
                  YOU MUST VERIFY ALL DATA
                </p>
                <p style={{ color: 'var(--on-error-container)' }}>
                  It is your sole responsibility to verify the accuracy of all data, calculations, and reports before using them for tax filing, financial decisions, or any other purpose.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--on-surface)' }}>
              5. Limitation of Liability
            </h2>

            <div className="space-y-4">
              <p className="font-semibold text-lg">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW:
              </p>

              <div
                className="p-6 rounded-lg space-y-3"
                style={{ backgroundColor: 'var(--surface)', border: '2px solid var(--error)' }}
              >
                <p className="font-semibold" style={{ color: 'var(--error)' }}>
                  BitTaxly SHALL NOT BE LIABLE FOR:
                </p>

                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Tax Penalties or Interest:</strong> Any penalties, interest, fines, or additional taxes assessed by tax authorities</li>
                  <li><strong>Financial Losses:</strong> Investment losses, trading losses, or loss of cryptocurrency assets</li>
                  <li><strong>Inaccurate Tax Returns:</strong> Errors in tax filings based on our data or calculations</li>
                  <li><strong>Audit Costs:</strong> Costs associated with tax audits, appeals, or disputes</li>
                  <li><strong>Legal Fees:</strong> Attorney fees, accounting fees, or professional service costs</li>
                  <li><strong>Missed Opportunities:</strong> Lost profits, business opportunities, or investment gains</li>
                  <li><strong>Data Loss:</strong> Loss of data, reports, or account information</li>
                  <li><strong>Service Interruptions:</strong> Downtime, bugs, errors, or unavailability of the service</li>
                  <li><strong>Third-Party Actions:</strong> Actions or failures of blockchain networks, exchanges, or other third parties</li>
                </ul>

                <p className="font-semibold mt-4" style={{ color: 'var(--error)' }}>
                  Our maximum total liability to you shall not exceed the lesser of:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>The amount you paid us in the past 12 months, OR</li>
                  <li>$100 USD</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--on-surface)' }}>
              6. Jurisdictional Variations
            </h2>

            <p className="mb-4">
              Tax laws, financial regulations, and legal requirements vary significantly by jurisdiction. BitTaxly is not tailored to any specific jurisdiction.
            </p>

            <p className="mb-4">
              <strong>You are responsible for:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Understanding and complying with the laws of your jurisdiction</li>
              <li>Determining if cryptocurrency is legal in your country</li>
              <li>Knowing your local tax obligations and reporting requirements</li>
              <li>Consulting local tax professionals familiar with your jurisdiction's laws</li>
            </ul>

            <div
              className="p-4 rounded-lg mt-4"
              style={{ backgroundColor: 'var(--warning-container)', borderLeft: '3px solid var(--warning)' }}
            >
              <p style={{ color: 'var(--on-warning-container)' }}>
                <strong>International Users:</strong> If you are located outside Switzerland or the European Union, you are solely responsible for ensuring your use of BitTaxly complies with your local laws.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--on-surface)' }}>
              7. No Endorsement
            </h2>

            <p className="mb-4">
              Any mention of specific cryptocurrencies, tokens, blockchains, exchanges, wallets, or services does not constitute an endorsement or recommendation.
            </p>

            <p>
              We are not affiliated with or sponsored by any blockchain network, cryptocurrency project, exchange, or wallet provider unless explicitly stated.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--on-surface)' }}>
              8. Changes to Data and Service
            </h2>

            <p className="mb-4">
              We reserve the right to modify, update, or discontinue any aspect of the service at any time without notice. This includes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Adding or removing supported blockchains or tokens</li>
              <li>Changing data sources or calculation methods</li>
              <li>Modifying features or functionality</li>
              <li>Suspending or terminating the service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--on-surface)' }}>
              9. Forward-Looking Statements
            </h2>

            <p>
              Any statements about future features, updates, or plans are forward-looking and subject to change. We make no guarantees about future development or feature availability.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--on-surface)' }}>
              10. Your Responsibility
            </h2>

            <div
              className="p-6 rounded-lg"
              style={{ backgroundColor: 'var(--primary-container)', borderLeft: '4px solid var(--primary)' }}
            >
              <h3 className="font-bold text-lg mb-3" style={{ color: 'var(--on-primary-container)' }}>
                By using BitTaxly, you acknowledge that:
              </h3>

              <ul className="space-y-2" style={{ color: 'var(--on-primary-container)' }}>
                <li>✓ You are solely responsible for your tax compliance</li>
                <li>✓ You are solely responsible for your financial decisions</li>
                <li>✓ You will verify all data with qualified professionals</li>
                <li>✓ You understand the risks of cryptocurrency</li>
                <li>✓ You will consult tax, financial, and legal professionals as needed</li>
                <li>✓ You accept all disclaimers and limitations of liability</li>
                <li>✓ You release BitTaxly from any claims or damages</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--on-surface)' }}>
              Contact Information
            </h2>

            <p className="mb-4">
              If you have questions about this disclaimer:
            </p>

            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--surface)' }}>
              <p><strong>Email:</strong> legal@bittaxly.com</p>
              <p><strong>Support:</strong> support@bittaxly.com</p>
            </div>
          </section>

          {/* Final Warning */}
          <div
            className="mt-12 p-6 rounded-lg"
            style={{
              backgroundColor: 'var(--error-container)',
              border: '3px solid var(--error)',
            }}
          >
            <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--on-error-container)' }}>
              FINAL WARNING
            </h2>
            <p className="mb-3 font-semibold" style={{ color: 'var(--on-error-container)' }}>
              USE THIS SERVICE AT YOUR OWN RISK
            </p>
            <p style={{ color: 'var(--on-error-container)' }}>
              BitTaxly provides data aggregation and informational tools only. We are not tax advisors, financial advisors, or legal advisors. We make no guarantees about accuracy. We are not liable for any losses, penalties, or damages. You must verify all information with qualified professionals and are solely responsible for your tax and financial decisions.
            </p>
            <p className="mt-3 font-semibold" style={{ color: 'var(--on-error-container)' }}>
              IF YOU DO NOT ACCEPT THESE DISCLAIMERS, DO NOT USE THIS SERVICE.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
