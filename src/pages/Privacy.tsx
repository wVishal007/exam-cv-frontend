import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { LegalLayout } from "@/components/layout/LegalLayout";

const CONTACT_EMAIL = "vishalsingh31879@gmail.com";

export function Privacy() {
  useDocumentTitle("Privacy policy");

  return (
    <LegalLayout title="Privacy policy">
      <p className="text-ink-muted dark:text-ink-muted-dark">
        Last updated: October 2026. This policy explains what exam-cv
        collects, why it collects it, and how you can ask for it to be removed.
      </p>

      <section>
        <h2 className="font-serif text-lg font-semibold tracking-tight">
          What we collect
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>
            Account details — your name and email address when you register.
          </li>
          <li>
            Documents you upload — résumés (PDF) and the job descriptions you
            paste alongside them.
          </li>
          <li>
            Results we generate — ATS scores, feedback, rewritten résumés, and
            the PDFs we compile from them.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="font-serif text-lg font-semibold tracking-tight">
          How we use it
        </h2>
        <p className="mt-3">
          Your résumé text and job description are sent to an AI provider
          solely to analyze and rewrite your document. The results are stored
          on your account so your analysis and rewrite history are available
          every time you sign in. Generated preview images are hosted with a
          third-party service so they can be displayed back to you.
        </p>
        <p className="mt-3">
          We do not sell your data, show your documents to other users, or use
          them to train external models.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-lg font-semibold tracking-tight">
          How long we keep it
        </h2>
        <p className="mt-3">
          The PDF you upload is processed and then removed from the server.
          The extracted text, your scores, and any generated PDFs are kept for
          as long as your account needs them to show your history.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-lg font-semibold tracking-tight">
          Where it lives
        </h2>
        <p className="mt-3">
          Login tokens are stored in your browser's local storage so you stay
          signed in between visits. We do not place third-party tracking
          cookies or analytics on this site.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-lg font-semibold tracking-tight">
          Requesting removal
        </h2>
        <p className="mt-3">
          To have your account and its stored documents removed, email
          {` ${CONTACT_EMAIL}`} with the address you registered with. We will
          respond promptly and confirm once your data is gone.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-lg font-semibold tracking-tight">
          Contact
        </h2>
        <p className="mt-3">
          Questions about this policy can be sent to {CONTACT_EMAIL}.
        </p>
      </section>
    </LegalLayout>
  );
}