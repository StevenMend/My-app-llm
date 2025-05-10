"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-black transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </div>

          <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">📄 Terms and Conditions</h1>
            <p className="text-sm text-gray-500">Last updated: May 9, 2025</p>
          </header>

          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p>
                By creating an account and using this application, you expressly agree to these Terms and Conditions. If you disagree with any of them, you must refrain from using the platform.
              </p>
            </section>

            <hr className="my-8 border-gray-200" />

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">2. Purpose of the Application</h2>
              <p className="mb-4">
                This application is an AI-powered demonstration tool that allows users to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Upload PDF documents</li>
                <li>Interact with a language model to receive content-based responses</li>
                <li>View in-document text references</li>
              </ul>
              <p className="mt-4">
                This tool is intended for informational and experimental purposes only. It does not provide legal, professional, or technical advice.
              </p>
            </section>

            <hr className="my-8 border-gray-200" />

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">3. Data Processing and Storage</h2>

              <h3 className="text-lg font-medium mt-6 mb-3">3.1 Documents</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Uploaded documents are processed using text analysis and AI models.</li>
                <li>Vector representations and textual content are extracted to enable interaction.</li>
                <li>Documents and their metadata may be stored temporarily for functional purposes.</li>
              </ul>

              <h3 className="text-lg font-medium mt-6 mb-3">3.2 Personal Information</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>When registering, you provide your name, email address, and a hashed password.</li>
                <li>This data is only used to allow access and personalize the service.</li>
              </ul>
            </section>

            <hr className="my-8 border-gray-200" />

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">4. Privacy and Security</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>We do not share your personal data or documents with third parties.</li>
                <li>We implement reasonable security measures to prevent unauthorized access.</li>
                <li>JWT tokens are used to securely maintain active sessions.</li>
                <li>Document access is restricted by session and authenticated user.</li>
              </ul>
            </section>

            <hr className="my-8 border-gray-200" />

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">5. User Responsibilities</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>You are responsible for not uploading illegal, confidential (unauthorized), or third-party infringing content.</li>
                <li>You must use the platform ethically and in compliance with applicable laws.</li>
              </ul>
            </section>

            <hr className="my-8 border-gray-200" />

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">6. System Limitations</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>This system is a prototype. It may contain errors, resets, or updates that affect stored data.</li>
                <li>No guarantees are made regarding continuous availability or accuracy of AI responses.</li>
              </ul>
            </section>

            <hr className="my-8 border-gray-200" />

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">7. Intellectual Property</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>AI models, source code, and platform design are protected by copyright.</li>
                <li>You retain ownership of uploaded documents but grant temporary permission for analysis within the platform.</li>
              </ul>
            </section>

            <hr className="my-8 border-gray-200" />

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">8. Modifications</h2>
              <p>We may update these Terms and Conditions without prior notice. It is your responsibility to review them periodically.</p>
            </section>

            <hr className="my-8 border-gray-200" />

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">9. Contact</h2>
              <p>
                If you have any questions regarding these terms, feel free to contact us at:{" "}
                <a href="mailto:rodri.stevenmendez@gmail.com" className="text-primary hover:underline">
                  rodri.stevenmendez@gmail.com
                </a>
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              © {new Date().getFullYear()} AI Reader. All rights reserved.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}