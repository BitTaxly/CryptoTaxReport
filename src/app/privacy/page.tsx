export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-12 px-4" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8" style={{ color: 'var(--primary)' }}>
          Privacy Policy
        </h1>

        <div className="space-y-6" style={{ color: 'var(--on-surface)' }}>
          <p className="text-sm" style={{ color: 'var(--on-surface-variant)' }}>
            <strong>Last Updated:</strong> March 22, 2026
          </p>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--on-surface)' }}>1. Introduction</h2>
            <p className="mb-4">
              BitTaxly ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our cryptocurrency tax reporting service.
            </p>
            <p>
              By using BitTaxly, you agree to the collection and use of information in accordance with this policy. This Privacy Policy complies with the General Data Protection Regulation (GDPR) and the Swiss Federal Act on Data Protection (FADP).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--on-surface)' }}>2. Information We Collect</h2>

            <h3 className="text-xl font-semibold mb-3 mt-4" style={{ color: 'var(--on-surface)' }}>2.1 Information You Provide</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Information:</strong> Email address, name (optional), password (encrypted)</li>
              <li><strong>Wallet Addresses:</strong> Public blockchain wallet addresses you choose to analyze</li>
              <li><strong>OAuth Information:</strong> If you sign in with Google, we receive your name and email</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4" style={{ color: 'var(--on-surface)' }}>2.2 Automatically Collected Information</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Usage Data:</strong> Pages visited, features used, time spent on the service</li>
              <li><strong>Device Information:</strong> Browser type, operating system, IP address (hashed for privacy)</li>
              <li><strong>Cookies:</strong> Session cookies for authentication (essential cookies only)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4" style={{ color: 'var(--on-surface)' }}>2.3 Blockchain Data</h3>
            <p>
              We fetch publicly available blockchain data (token balances, transaction history) from public blockchain networks. This data is already public on the blockchain and does not constitute personal information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--on-surface)' }}>3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide and maintain our service</li>
              <li>To authenticate your account and manage sessions</li>
              <li>To analyze wallet holdings and generate tax reports</li>
              <li>To save your analysis history (if you're logged in)</li>
              <li>To send verification emails and important service updates</li>
              <li>To improve our service and user experience</li>
              <li>To detect and prevent fraud or abuse</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--on-surface)' }}>4. Data Storage and Security</h2>

            <h3 className="text-xl font-semibold mb-3 mt-4" style={{ color: 'var(--on-surface)' }}>4.1 Security Measures</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Encryption:</strong> All data encrypted at rest (AES-256) and in transit (TLS 1.3)</li>
              <li><strong>Password Security:</strong> Passwords hashed with bcrypt (12 rounds, irreversible)</li>
              <li><strong>Database Security:</strong> Row-level security ensures users only access their own data</li>
              <li><strong>Access Control:</strong> Strict authentication and authorization on all API endpoints</li>
              <li><strong>Rate Limiting:</strong> Protection against brute force and abuse attacks</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4" style={{ color: 'var(--on-surface)' }}>4.2 Data Storage</h3>
            <p className="mb-2">
              Your data is stored on secure servers provided by Supabase (SOC 2 Type II and ISO 27001 certified). Data can be stored in EU regions for GDPR compliance upon request.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--on-surface)' }}>5. Data Sharing and Disclosure</h2>

            <h3 className="text-xl font-semibold mb-3 mt-4" style={{ color: 'var(--on-surface)' }}>5.1 We DO NOT Sell Your Data</h3>
            <p className="mb-4">
              We do not sell, rent, or trade your personal information to third parties for marketing purposes.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4" style={{ color: 'var(--on-surface)' }}>5.2 Service Providers</h3>
            <p className="mb-2">We share data with trusted service providers who help us operate our service:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Supabase:</strong> Database and authentication (SOC 2, ISO 27001, GDPR compliant)</li>
              <li><strong>Vercel:</strong> Hosting and deployment (SOC 2, ISO 27001 certified)</li>
              <li><strong>Blockchain RPC Providers:</strong> To fetch public blockchain data (Alchemy, QuickNode, Helius)</li>
              <li><strong>Email Service:</strong> To send verification and notification emails</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4" style={{ color: 'var(--on-surface)' }}>5.3 Legal Requirements</h3>
            <p>
              We may disclose your information if required by law, court order, or to protect our rights and safety.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--on-surface)' }}>6. Your Rights (GDPR & FADP)</h2>
            <p className="mb-4">Under GDPR and Swiss data protection law, you have the following rights:</p>

            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Right to Access:</strong> Request a copy of all your personal data</li>
              <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete data</li>
              <li><strong>Right to Erasure:</strong> Request deletion of your account and all associated data</li>
              <li><strong>Right to Data Portability:</strong> Export your data in machine-readable format (JSON)</li>
              <li><strong>Right to Object:</strong> Object to processing of your personal data</li>
              <li><strong>Right to Restrict Processing:</strong> Request limitation of data processing</li>
              <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time</li>
            </ul>

            <p className="mt-4">
              <strong>To exercise your rights:</strong> Email us at privacy@bittaxly.com or use the data export/deletion features in your account settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--on-surface)' }}>7. Data Retention</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Data:</strong> Retained until you delete your account</li>
              <li><strong>Analysis History:</strong> Retained until you delete it or your account</li>
              <li><strong>Logs:</strong> Security and access logs retained for 90 days</li>
              <li><strong>After Account Deletion:</strong> All data permanently deleted within 30 days</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--on-surface)' }}>8. Cookies and Tracking</h2>

            <h3 className="text-xl font-semibold mb-3 mt-4" style={{ color: 'var(--on-surface)' }}>8.1 Essential Cookies</h3>
            <p className="mb-2">We use essential cookies required for the service to function:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Authentication Cookies:</strong> To keep you logged in</li>
              <li><strong>Session Cookies:</strong> To maintain your session state</li>
              <li><strong>Preference Cookies:</strong> To remember your theme preference (light/dark mode)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4" style={{ color: 'var(--on-surface)' }}>8.2 Analytics (Optional)</h3>
            <p>
              We may use privacy-focused analytics to improve our service. You can opt-out of analytics in your account settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--on-surface)' }}>9. International Data Transfers</h2>
            <p>
              Your data may be transferred and stored in countries outside your residence. We ensure appropriate safeguards are in place for international transfers, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>EU Standard Contractual Clauses (SCCs)</li>
              <li>Data Processing Agreements with all service providers</li>
              <li>Option to store data in EU regions for EU/Swiss users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--on-surface)' }}>10. Children's Privacy</h2>
            <p>
              BitTaxly is not intended for users under 18 years of age. We do not knowingly collect personal information from children. If we become aware that we have collected data from a child, we will delete it immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--on-surface)' }}>11. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through a notice on our service. Continued use after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--on-surface)' }}>12. Contact Us</h2>
            <p className="mb-4">
              If you have questions about this Privacy Policy or wish to exercise your rights, contact us:
            </p>
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--surface)' }}>
              <p><strong>Email:</strong> privacy@bittaxly.com</p>
              <p><strong>Data Protection Officer:</strong> dpo@bittaxly.com</p>
              <p className="mt-4 text-sm" style={{ color: 'var(--on-surface-variant)' }}>
                For EU/Swiss users: You have the right to lodge a complaint with your local data protection authority.
              </p>
            </div>
          </section>

          <section className="mt-12 p-6 rounded-lg" style={{ backgroundColor: 'var(--surface)', borderLeft: '4px solid var(--primary)' }}>
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--on-surface)' }}>Your Privacy Matters</h2>
            <p className="mb-3">
              We are committed to protecting your privacy and handling your data with care. We follow industry best practices and comply with all applicable data protection laws.
            </p>
            <p>
              <strong>Key Promises:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>We never sell your data</li>
              <li>We use enterprise-grade encryption</li>
              <li>We give you full control over your data</li>
              <li>We are transparent about our practices</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
