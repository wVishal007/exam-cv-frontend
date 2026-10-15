import { Mail, Phone, AtSign, FolderGit2, Globe } from "lucide-react";

import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { LegalLayout } from "@/components/layout/LegalLayout";
import { Card, CardBody } from "@/components/ui/Card";

const CONTACT_EMAIL = "vishalsingh31879@gmail.com";

const links = [
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/vishal-singh-188013324",
    icon: AtSign,
  },
  {
    label: "GitHub",
    href: "https://github.com/wVishal007",
    icon: FolderGit2,
  },
  {
    label: "Portfolio",
    href: "https://vishal4u.vercel.app",
    icon: Globe,
  },
];

export function Contact() {
  useDocumentTitle("Contact");

  return (
    <LegalLayout title="Contact">
      <p className="text-ink-muted dark:text-ink-muted-dark">
        Built and maintained by a full-stack engineer focused on AI-powered
        systems.
      </p>

      <Card className="soft-sm">
        <CardBody className="flex flex-col gap-5">
          <div>
            <p className="font-serif text-xl font-semibold tracking-tight">
              Vishal Singh
            </p>
            <p className="mt-0.5 text-sm text-ink-muted dark:text-ink-muted-dark">
              Full-Stack AI Engineer
            </p>
          </div>

          <div className="flex flex-col gap-2.5 text-sm">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex items-center gap-2.5 text-ink transition-colors hover:text-accent dark:text-ink-dark dark:hover:text-accent-dark"
            >
              <Mail className="h-4 w-4 text-accent dark:text-accent-dark" aria-hidden="true" />
              {CONTACT_EMAIL}
            </a>
            <a
              href="tel:+917290908461"
              className="inline-flex items-center gap-2.5 text-ink transition-colors hover:text-accent dark:text-ink-dark dark:hover:text-accent-dark"
            >
              <Phone className="h-4 w-4 text-accent dark:text-accent-dark" aria-hidden="true" />
              +91 7290908461
            </a>
          </div>

          <div className="flex flex-wrap gap-2">
            {links.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="soft-sm inline-flex items-center gap-1.5 rounded-lg border border-transparent bg-card px-3 py-1.5 text-xs font-medium text-ink transition-all hover:soft-hover active:soft-inset-sm dark:text-ink-dark"
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {label}
              </a>
            ))}
          </div>
        </CardBody>
      </Card>

      <section>
        <h2 className="font-serif text-lg font-semibold tracking-tight">
          Support & data requests
        </h2>
        <p className="mt-3">
          For support, questions, or deletion requests for your account and
          stored documents, email {CONTACT_EMAIL} and include the address you
          registered with.
        </p>
      </section>
    </LegalLayout>
  );
}