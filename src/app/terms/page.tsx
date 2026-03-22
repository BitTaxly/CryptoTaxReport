export default function TermsPage() {
  return (
    <div className="min-h-screen py-12 px-4" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8" style={{ color: 'var(--primary)' }}>
          Terms of Service
        </h1>

        <div className="space-y-6" style={{ color: 'var(--on-surface)' }}>
          <p className="text-sm" style={{ color: 'var(--on-surface-variant)' }}>
            <strong>Last Updated:</strong> March 22, 2026
          </p>

          <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--error-container)', borderLeft: '4px solid var(--error)' }}>
            <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--on-error-container)' }}>IMPORTANT DISCLAIMER</h2>
            <p className="mb-2" style={{ color: 'var(--on-error-container)' }}>
              <strong>BitTaxly IS NOT A TAX ADVISOR, FINANCIAL ADVISOR, OR LEGAL ADVISOR.</strong>
            </p>
            <p style={{ color: 'var(--on-error-container)' }}>
              This service provides informational data only. We are not responsible for the accuracy of tax calculations, financial decisions, or any losses incurred. Always consult a qualified tax professional or accountant before making tax-related decisions.
            </p>
          </div>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--on-surface)' }}>1. Agreement to Terms</h2>
            <p className="mb-4">
              By accessing or using BitTaxly ("Service", "Platform", "we", "us", "our"), you ("User", "you", "your") agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you must not use the Service.
            </p>
            <p className="mb-4">
              These Terms constitute a legally binding agreement between you and BitTaxly. We reserve the right to modify these Terms at any time. Continued use of the Service after changes constitutes acceptance of the modified Terms.
            </p>
            <p>
              <strong>BY USING THIS SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--on-surface)' }}>2. Description of Service</h2>
            <p className="mb-4">
              BitTaxly is a cryptocurrency tax reporting tool that:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Fetches publicly available blockchain data from public wallet addresses</li>
              <li>Displays token balances and transaction history</li>
              <li>Provides informational reports for potential tax purposes</li>
              <li>Does NOT provide tax advice, financial advice, or legal counsel</li>
            </ul>
            <p className="font-semibold">
              We are a data aggregation tool. All blockchain data is publicly available on blockchain networks. We do not have access to your private keys or funds.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--on-surface)' }}>3. No Financial, Tax, or Legal Advice</h2>

            <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: 'var(--surface)' }}>
              <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--on-surface)' }}>3.1 Not Tax Advice</h3>
              <p className="mb-2">
                BitTaxly does NOT provide tax advice. The information provided is for informational purposes only and should not be construed as tax advice. Tax laws vary by jurisdiction and change frequently.
              </p>
              <p className="font-semibold" style={{ color: 'var(--error)' }}>
                You are solely responsible for determining your own tax obligations and compliance.
              </p>
            </div>

            <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: 'var(--surface)' }}>
              <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--on-surface)' }}>3.2 Not Financial Advice</h3>
              <p className="mb-2">
                Nothing on this platform constitutes financial advice, investment advice, trading advice, or any other sort of advice. We do not recommend buying, selling, or holding any cryptocurrency or asset.
              </p>
              <p className="font-semibold" style={{ color: 'var(--error)' }}>
                All investment and financial decisions are made at your own risk.
              </p>
            </div>

            <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: 'var(--surface)' }}>
              <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--on-surface)' }}>3.3 Consult Professionals</h3>
              <p>
                Before making any tax, financial, or legal decisions, you should consult qualified professionals licensed in your jurisdiction:
              </p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>Certified Public Accountant (CPA)</li>
                <li>Tax Attorney</li>
                <li>Financial Advisor</li>
                <li>Legal Counsel</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--on-surface)' }}>4. Limitation of Liability</h2>

            <h3 className="text-xl font-semibold mb-3 mt-4" style={{ color: 'var(--on-surface)' }}>4.1 No Warranty on Accuracy</h3>
            <p className="mb-4">
              We make no representations or warranties about the accuracy, completeness, or timeliness of any data, information, or reports provided by the Service.
            </p>
            <p className="mb-4 font-semibold" style={{ color: 'var(--error)' }}>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT ANY WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4" style={{ color: 'var(--on-surface)' }}>4.2 No Liability for Losses</h3>
            <p className="mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, BITTAXLY SHALL NOT BE LIABLE FOR ANY:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Financial Losses:</strong> Including tax penalties, interest, fines, or investment losses</li>
              <li><strong>Indirect Damages:</strong> Including lost profits, lost data, or business interruption</li>
              <li><strong>Consequential Damages:</strong> Arising from use or inability to use the Service</li>
              <li><strong>Errors or Omissions:</strong> In data, calculations, or reports</li>
              <li><strong>Third-Party Services:</strong> Blockchain networks, RPC providers, or other external services</li>
              <li><strong>Regulatory Actions:</strong> Tax audits, penalties, or legal proceedings</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4" style={{ color: 'var(--on-surface)' }}>4.3 Maximum Liability Cap</h3>
            <p className="mb-4">
              In no event shall BitTaxly's total aggregate liability to you for all damages, losses, and causes of action exceed the amount you have paid to us in the past 12 months, or $100 USD, whichever is less.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4" style={{ color: 'var(--on-surface)' }}>4.4 Blockchain Data Limitations</h3>
            <p className="mb-2">
              We rely on third-party blockchain RPC providers and public blockchain networks. We are not responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Inaccuracies in blockchain data</li>
              <li>Delays or unavailability of blockchain networks</li>
              <li>Missing or incomplete transaction history</li>
              <li>Incorrectly labeled or categorized transactions</li>
              <li>Blockchain reorganizations or forks</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--on-surface)' }}>5. User Responsibilities</h2>

            <h3 className="text-xl font-semibold mb-3 mt-4" style={{ color: 'var(--on-surface)' }}>5.1 Verify All Information</h3>
            <p className="mb-4">
              You are solely responsible for verifying the accuracy of all data, calculations, and reports before using them for any purpose, including tax filing.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4" style={{ color: 'var(--on-surface)' }}>5.2 Compliance with Laws</h3>
            <p className="mb-4">
              You are responsible for complying with all applicable laws, regulations, and tax obligations in your jurisdiction. This includes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Accurate tax reporting and payment</li>
              <li>Maintaining proper records</li>
              <li>Filing required tax forms on time</li>
              <li>Consulting with tax professionals as needed</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4" style={{ color: 'var(--on-surface)' }}>5.3 Account Security</h3>
            <p className="mb-2">You are responsible for:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized access</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4" style={{ color: 'var(--on-surface)' }}>5.4 Prohibited Uses</h3>
            <p className="mb-2">You agree NOT to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the Service for any illegal purpose</li>
              <li>Violate any laws or regulations</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Use automated tools to scrape or harvest data</li>
              <li>Reverse engineer or decompile the Service</li>
              <li>Resell or redistribute our data or services</li>
              <li>Impersonate others or provide false information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--on-surface)' }}>6. Indemnification</h2>
            <p className="mb-4">
              You agree to indemnify, defend, and hold harmless BitTaxly, its owners, employees, contractors, and affiliates from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your use of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any laws or regulations</li>
              <li>Tax penalties, audits, or disputes</li>
              <li>Financial or investment losses</li>
              <li>Any third-party claims related to your use of the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--on-surface)' }}>7. Data and Privacy</h2>
            <p className="mb-4">
              Your use of the Service is also governed by our Privacy Policy. By using the Service, you consent to our data practices as described in the Privacy Policy.
            </p>
            <p className="mb-2">
              <strong>Key Points:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>We only access public blockchain data</li>
              <li>We do NOT have access to your private keys or funds</li>
              <li>We never sell your personal data</li>
              <li>You can delete your account and data at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--on-surface)' }}>8. Intellectual Property</h2>

            <h3 className="text-xl font-semibold mb-3 mt-4" style={{ color: 'var(--on-surface)' }}>8.1 Our Rights</h3>
            <p className="mb-4">
              All content, features, and functionality of the Service (including but not limited to text, graphics, logos, software, and design) are owned by BitTaxly and protected by copyright, trademark, and other intellectual property laws.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4" style={{ color: 'var(--on-surface)' }}>8.2 License to Use</h3>
            <p className="mb-4">
              We grant you a limited, non-exclusive, non-transferable, revocable license to use the Service for personal, non-commercial purposes, subject to these Terms.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4" style={{ color: 'var(--on-surface)' }}>8.3 Your Data</h3>
            <p>
              You retain ownership of any data you provide to the Service. By using the Service, you grant us a license to process your data solely to provide the Service to you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--on-surface)' }}>9. Service Availability</h2>

            <h3 className="text-xl font-semibold mb-3 mt-4" style={{ color: 'var(--on-surface)' }}>9.1 No Guarantee of Uptime</h3>
            <p className="mb-4">
              We do not guarantee that the Service will be available 24/7 or error-free. We may experience downtime for maintenance, updates, or technical issues.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4" style={{ color: 'var(--on-surface)' }}>9.2 Right to Modify or Discontinue</h3>
            <p className="mb-4">
              We reserve the right to modify, suspend, or discontinue the Service (or any part thereof) at any time, with or without notice, for any reason.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4" style={{ color: 'var(--on-surface)' }}>9.3 No Obligation to Update</h3>
            <p>
              We are under no obligation to update the Service, add new features, or support any particular blockchain network or token.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--on-surface)' }}>10. Account Termination</h2>

            <h3 className="text-xl font-semibold mb-3 mt-4" style={{ color: 'var(--on-surface)' }}>10.1 Termination by You</h3>
            <p className="mb-4">
              You may terminate your account at any time by deleting your account through the Service settings. Upon termination, all your data will be permanently deleted within 30 days.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4" style={{ color: 'var(--on-surface)' }}>10.2 Termination by Us</h3>
            <p className="mb-2">
              We reserve the right to suspend or terminate your account immediately, without notice, if you:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Violate these Terms</li>
              <li>Engage in fraudulent or abusive behavior</li>
              <li>Use the Service for illegal activities</li>
              <li>Pose a security risk to the Service or other users</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4" style={{ color: 'var(--on-surface)' }}>10.3 Effect of Termination</h3>
            <p>
              Upon termination, your right to use the Service will immediately cease. Sections of these Terms that should survive termination (including indemnification, limitation of liability, and dispute resolution) will remain in effect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--on-surface)' }}>11. Governing Law and Jurisdiction</h2>

            <h3 className="text-xl font-semibold mb-3 mt-4" style={{ color: 'var(--on-surface)' }}>11.1 Governing Law</h3>
            <p className="mb-4">
              These Terms shall be governed by and construed in accordance with the laws of Switzerland and the European Union, without regard to conflict of law principles.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4" style={{ color: 'var(--on-surface)' }}>11.2 Jurisdiction</h3>
            <p className="mb-4">
              Any disputes arising from these Terms or your use of the Service shall be subject to the exclusive jurisdiction of the courts of Switzerland.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4" style={{ color: 'var(--on-surface)' }}>11.3 GDPR and Swiss DPA Compliance</h3>
            <p>
              We comply with the General Data Protection Regulation (GDPR) and the Swiss Federal Act on Data Protection (FADP). Users in the EU and Switzerland have additional rights as described in our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--on-surface)' }}>12. Dispute Resolution</h2>

            <h3 className="text-xl font-semibold mb-3 mt-4" style={{ color: 'var(--on-surface)' }}>12.1 Informal Resolution</h3>
            <p className="mb-4">
              Before filing a legal claim, you agree to attempt to resolve any dispute informally by contacting us at legal@bittaxly.com.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4" style={{ color: 'var(--on-surface)' }}>12.2 Arbitration (Optional)</h3>
            <p className="mb-4">
              If informal resolution fails, disputes may be resolved through binding arbitration in accordance with Swiss arbitration rules, at the option of either party.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4" style={{ color: 'var(--on-surface)' }}>12.3 Class Action Waiver</h3>
            <p>
              To the extent permitted by law, you waive the right to participate in class action lawsuits or class-wide arbitration against BitTaxly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--on-surface)' }}>13. Severability</h2>
            <p>
              If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions will remain in full force and effect. The invalid provision will be modified to the minimum extent necessary to make it enforceable.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--on-surface)' }}>14. Entire Agreement</h2>
            <p>
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and BitTaxly regarding the Service and supersede all prior agreements and understandings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--on-surface)' }}>15. Changes to Terms</h2>
            <p className="mb-4">
              We reserve the right to modify these Terms at any time. We will notify you of significant changes via email or through a notice on the Service.
            </p>
            <p className="mb-4">
              <strong>Your continued use of the Service after changes constitutes acceptance of the modified Terms.</strong>
            </p>
            <p>
              If you do not agree to the modified Terms, you must stop using the Service and delete your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--on-surface)' }}>16. Contact Information</h2>
            <p className="mb-4">
              If you have questions about these Terms, please contact us:
            </p>
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--surface)' }}>
              <p><strong>Email:</strong> legal@bittaxly.com</p>
              <p><strong>Support:</strong> support@bittaxly.com</p>
              <p className="mt-4 text-sm" style={{ color: 'var(--on-surface-variant)' }}>
                For data protection inquiries: privacy@bittaxly.com
              </p>
            </div>
          </section>

          <section className="mt-12 p-6 rounded-lg" style={{ backgroundColor: 'var(--error-container)', borderLeft: '4px solid var(--error)' }}>
            <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--on-error-container)' }}>Legal Summary</h2>
            <p className="mb-3 font-semibold" style={{ color: 'var(--on-error-container)' }}>
              BY USING BITTAXLY, YOU ACKNOWLEDGE AND AGREE THAT:
            </p>
            <ul className="list-disc pl-6 space-y-2" style={{ color: 'var(--on-error-container)' }}>
              <li>BitTaxly is NOT a tax advisor, financial advisor, or legal advisor</li>
              <li>We provide informational data only, not professional advice</li>
              <li>You are solely responsible for your tax compliance and financial decisions</li>
              <li>We are not liable for any losses, penalties, or damages</li>
              <li>You must verify all information with qualified professionals</li>
              <li>The service is provided "AS IS" without warranties</li>
              <li>You indemnify us from any claims arising from your use of the Service</li>
            </ul>
            <p className="mt-4 font-semibold" style={{ color: 'var(--on-error-container)' }}>
              If you do not agree to these terms, you must not use the Service.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
