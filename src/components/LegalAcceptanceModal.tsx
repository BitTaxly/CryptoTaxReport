'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LEGAL_ACCEPTANCE_KEY = 'bittaxly_legal_accepted';
const LEGAL_ACCEPTANCE_VERSION = '1.0'; // Increment this when terms change

// Pages that should NOT show the modal (so users can read them)
const EXCLUDED_PAGES = ['/privacy', '/terms', '/disclaimer'];

export default function LegalAcceptanceModal() {
  const [showModal, setShowModal] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // Don't show modal on legal pages (users need to read them first!)
    if (EXCLUDED_PAGES.includes(pathname)) {
      setIsLoading(false);
      return;
    }

    // Check if user has already accepted
    const acceptedVersion = localStorage.getItem(LEGAL_ACCEPTANCE_KEY);

    if (acceptedVersion !== LEGAL_ACCEPTANCE_VERSION) {
      // User hasn't accepted current version, show modal
      setShowModal(true);
    }

    setIsLoading(false);
  }, [pathname]);

  const handleAccept = () => {
    if (!accepted) {
      return; // User must check the box
    }

    // Store acceptance in localStorage
    localStorage.setItem(LEGAL_ACCEPTANCE_KEY, LEGAL_ACCEPTANCE_VERSION);
    setShowModal(false);
  };

  const handleDecline = () => {
    // User declined - redirect them away or show message
    alert('You must accept the Terms of Service and Privacy Policy to use BitTaxly.');
    // Optionally: window.location.href = 'https://google.com';
  };

  if (isLoading) {
    return null; // Don't render anything while checking
  }

  if (!showModal) {
    return null; // User already accepted
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-70 z-50 backdrop-blur-sm"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="max-w-2xl w-full rounded-2xl shadow-2xl overflow-hidden"
          style={{
            backgroundColor: 'var(--surface)',
            border: '2px solid var(--outline)',
          }}
        >
          {/* Header */}
          <div
            className="p-6 border-b"
            style={{
              backgroundColor: 'var(--primary-container)',
              borderBottomColor: 'var(--outline)',
            }}
          >
            <h2
              className="text-2xl font-bold mb-2"
              style={{ color: 'var(--on-primary-container)' }}
            >
              Welcome to BitTaxly
            </h2>
            <p
              className="text-sm"
              style={{ color: 'var(--on-primary-container)' }}
            >
              Please review and accept our terms before continuing
            </p>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {/* Important Notice */}
            <div
              className="p-4 rounded-lg mb-6"
              style={{
                backgroundColor: 'var(--error-container)',
                borderLeft: '4px solid var(--error)',
              }}
            >
              <h3
                className="font-bold text-lg mb-2"
                style={{ color: 'var(--on-error-container)' }}
              >
                Important Disclaimer
              </h3>
              <p
                className="text-sm mb-2"
                style={{ color: 'var(--on-error-container)' }}
              >
                <strong>BitTaxly is NOT a tax advisor, financial advisor, or legal advisor.</strong>
              </p>
              <p
                className="text-sm"
                style={{ color: 'var(--on-error-container)' }}
              >
                We provide informational data only. We are not responsible for the accuracy of tax calculations, financial decisions, or any losses incurred. Always consult a qualified professional.
              </p>
            </div>

            {/* Key Points */}
            <div className="space-y-4 mb-6">
              <h3
                className="font-semibold text-lg"
                style={{ color: 'var(--on-surface)' }}
              >
                By using BitTaxly, you acknowledge that:
              </h3>

              <ul className="space-y-3" style={{ color: 'var(--on-surface-variant)' }}>
                <li className="flex items-start gap-3">
                  <span className="text-xl font-bold" style={{ color: 'var(--primary)' }}>•</span>
                  <span className="text-sm">
                    <strong style={{ color: 'var(--on-surface)' }}>Data Only:</strong> We provide publicly available blockchain data for informational purposes. This is not tax or financial advice.
                  </span>
                </li>

                <li className="flex items-start gap-3">
                  <span className="text-xl font-bold" style={{ color: 'var(--primary)' }}>•</span>
                  <span className="text-sm">
                    <strong style={{ color: 'var(--on-surface)' }}>Your Responsibility:</strong> You are solely responsible for verifying all data and ensuring tax compliance in your jurisdiction.
                  </span>
                </li>

                <li className="flex items-start gap-3">
                  <span className="text-xl font-bold" style={{ color: 'var(--primary)' }}>•</span>
                  <span className="text-sm">
                    <strong style={{ color: 'var(--on-surface)' }}>Public Keys Only:</strong> We only access public blockchain addresses. We never have access to your private keys or funds.
                  </span>
                </li>

                <li className="flex items-start gap-3">
                  <span className="text-xl font-bold" style={{ color: 'var(--primary)' }}>•</span>
                  <span className="text-sm">
                    <strong style={{ color: 'var(--on-surface)' }}>No Liability:</strong> We are not liable for any losses, penalties, tax issues, or damages arising from use of this service.
                  </span>
                </li>

                <li className="flex items-start gap-3">
                  <span className="text-xl font-bold" style={{ color: 'var(--primary)' }}>•</span>
                  <span className="text-sm">
                    <strong style={{ color: 'var(--on-surface)' }}>GDPR Compliant:</strong> Your data is protected under EU GDPR and Swiss data protection laws. You can delete your data anytime.
                  </span>
                </li>

                <li className="flex items-start gap-3">
                  <span className="text-xl font-bold" style={{ color: 'var(--primary)' }}>•</span>
                  <span className="text-sm">
                    <strong style={{ color: 'var(--on-surface)' }}>Consult Professionals:</strong> Always consult a certified tax professional, CPA, or accountant for tax advice.
                  </span>
                </li>
              </ul>
            </div>

            {/* Legal Documents */}
            <div
              className="p-4 rounded-lg mb-6"
              style={{ backgroundColor: 'var(--surface-variant)' }}
            >
              <p className="text-sm mb-3" style={{ color: 'var(--on-surface-variant)' }}>
                Please read our legal documents:
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/terms"
                  target="_blank"
                  className="px-4 py-2 rounded-lg font-semibold text-sm transition-all"
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: 'var(--on-primary)',
                  }}
                >
                  Terms of Service
                </Link>
                <Link
                  href="/privacy"
                  target="_blank"
                  className="px-4 py-2 rounded-lg font-semibold text-sm transition-all"
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: 'var(--on-primary)',
                  }}
                >
                  Privacy Policy
                </Link>
              </div>
            </div>

            {/* Acceptance Checkbox */}
            <label
              className="flex items-start gap-3 cursor-pointer p-4 rounded-lg transition-all"
              style={{
                backgroundColor: accepted ? 'var(--primary-container)' : 'var(--surface-variant)',
              }}
            >
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-1 w-5 h-5 cursor-pointer"
                style={{
                  accentColor: 'var(--primary)',
                }}
              />
              <span
                className="text-sm leading-relaxed"
                style={{
                  color: accepted ? 'var(--on-primary-container)' : 'var(--on-surface)',
                }}
              >
                <strong>I have read and agree to the Terms of Service and Privacy Policy.</strong> I understand that BitTaxly is not a tax advisor and that I am solely responsible for my tax compliance and financial decisions.
              </span>
            </label>
          </div>

          {/* Footer */}
          <div
            className="p-6 border-t flex flex-col sm:flex-row gap-3"
            style={{
              backgroundColor: 'var(--surface)',
              borderTopColor: 'var(--outline)',
            }}
          >
            <button
              onClick={handleDecline}
              className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all"
              style={{
                backgroundColor: 'var(--surface-variant)',
                color: 'var(--on-surface-variant)',
              }}
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              disabled={!accepted}
              className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: accepted ? 'var(--primary)' : 'var(--surface-variant)',
                color: accepted ? 'var(--on-primary)' : 'var(--on-surface-variant)',
              }}
            >
              {accepted ? 'Accept and Continue' : 'Please check the box above'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
