"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { Icon, type IconName } from "./Icons";
import { AccountDialog } from "./AccountDialog";
import "./Footer.css";

type FooterItem = { label: string; href?: string };
const columns: { title: string; links: FooterItem[] }[] = [
  {
    title: "CLOTHING",
    links: [
      { label: "Jackets", href: "/collections/jackets" },
      { label: "Suits", href: "/collections/suits" },
      { label: "Trousers", href: "/collections/trousers" },
      { label: "Classic Shirts", href: "/collections/shirts" },
      { label: "Casual Shirts", href: "/collections/shirts" },
      { label: "Outerwear", href: "/collections/jackets" },
      { label: "Tuxedo / Eveningwear", href: "/collections/suits" },
      { label: "Swimwear / Beach Towels", href: "/collections/summer" },
      { label: "Knitwear", href: "/collections/knitwear" },
      { label: "Waistcoats", href: "/collections/jackets" },
    ],
  },
  {
    title: "ACCESSORIES",
    links: [
      { label: "Shoes", href: "/collections/shoes" },
      ...[
        "Ties",
        "Pocket Squares",
        "Socks",
        "Leather goods",
        "Hats & Beanies",
        "Gloves",
        "Cufflinks",
        "Sunglasses",
        "Cozy at home",
      ].map((label) => ({ label, href: "/collections/accessories" })),
    ],
  },
  {
    title: "CUSTOMER SERVICE",
    links: [
      "Shipping & Returns",
      "Make a Return",
      "Exercise Your Right of Withdrawal",
      "Account",
      "WhatsApp",
      "Made to Measure",
      "F.A.Q.",
      "Contact Us",
    ].map((label) => ({ label })),
  },
  {
    title: "COMPANY",
    links: [
      { label: "About us", href: "/#our-story" },
      ...[
        "Blog",
        "Careers",
        "Wholesale / Franchising",
        "Terms & Conditions",
        "Privacy Policy",
      ].map((label) => ({ label })),
    ],
  },
];
const socials: { label: string; icon: IconName; href: string }[] = [
  { label: "Facebook", icon: "facebook", href: "https://www.facebook.com/" },
  { label: "Instagram", icon: "instagram", href: "https://www.instagram.com/" },
  { label: "YouTube", icon: "youtube", href: "https://www.youtube.com/" },
  { label: "TikTok", icon: "tiktok", href: "https://www.tiktok.com/" },
  { label: "X", icon: "x", href: "https://x.com/" },
  { label: "Pinterest", icon: "pinterest", href: "https://www.pinterest.com/" },
];
const payments = [
  "SSLCOMMERZ",
  "bKash",
  "Nagad",
  "EPS",
  "AMEX",
  "Apple Pay",
  "Google Pay",
  "Mastercard",
  "PayPal",
  "Shop Pay",
  "VISA",
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [signed, setSigned] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [information, setInformation] = useState("");
  const [region, setRegion] = useState("BD");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [analytics, setAnalytics] = useState(false);
  useEffect(() => {
    if (information) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [information]);
  function openInformation(label: string) {
    if (label === "Account") {
      setAccountOpen(true);
      return;
    }
    if (label === "Consent choices") {
      try {
        setAnalytics(localStorage.getItem("aura-analytics-consent") === "true");
      } catch {
        setAnalytics(false);
      }
    }
    setInformation(label);
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSigned(true);
    setEmail("");
  }
  return (
    <footer className="site-footer">
      <div className="service-strip" id="service">
        <div>
          <strong>100% MADE IN ITALY QUALITY</strong>
          <span>All our garments are 100% made in Italy</span>
        </div>
        <div>
          <strong>WORLDWIDE DHL SHIPPING</strong>
          <span>Fast, reliable and secured shipping</span>
        </div>
        <div>
          <strong>FREE RETURNS &amp; EXCHANGES</strong>
          <span>Within 30 days. 1 free return per order.</span>
        </div>
      </div>
      <div className="footer-watermark" aria-label="Aura BOED">
        AURA BOED
      </div>
      <div className="footer-main footer-expanded">
        <nav className="footer-links" aria-label="Footer navigation">
          {columns.map((column) => (
            <div key={column.title}>
              <h3>{column.title}</h3>
              {column.links.map((item) =>
                item.href ? (
                  <Link key={item.label} href={item.href}>
                    {item.label}
                  </Link>
                ) : (
                  <button
                    type="button"
                    key={item.label}
                    onClick={() => openInformation(item.label)}
                  >
                    {item.label}
                  </button>
                ),
              )}
            </div>
          ))}
        </nav>
        <section
          className="footer-signup"
          aria-labelledby="footer-newsletter-title"
        >
          <h3>STAY INFORMED WITH AURA BOED</h3>
          <h4 id="footer-newsletter-title">Newsletter</h4>
          <p className="newsletter-intro">
            Join our newsletter to be the first informed about new arrivals,
            restocks, promotions and more.
          </p>
          {signed ? (
            <p className="signup-success" role="status">
              Thank you! This is a newsletter preview. Your email has not been
              saved or sent.
            </p>
          ) : (
            <form onSubmit={submit}>
              <input
                type="email"
                required
                maxLength={254}
                autoComplete="email"
                placeholder="Email"
                aria-label="Newsletter email address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <button type="submit">SUBSCRIBE</button>
            </form>
          )}
          <p className="newsletter-consent">
            By signing up, you agree to receive our emails (new arrivals,
            personalised selections, offers). You can unsubscribe at any time.
            See our{" "}
            <button
              type="button"
              onClick={() => openInformation("Privacy Policy")}
            >
              privacy policy
            </button>
            .
          </p>
          <p className="newsletter-privacy">
            We respect your privacy. This newsletter is a design preview; your
            email stays in this form until submission and is then cleared. No
            email is stored or sent.
          </p>
        </section>
      </div>
      <div className="footer-utility">
        <div className="footer-socials" aria-label="Social media">
          {socials.map((social) => (
            <a
              key={social.label}
              href={social.href}
              aria-label={social.label}
              title={social.label}
              target="_blank"
              rel="noreferrer"
            >
              <Icon name={social.icon} size={18} />
            </a>
          ))}
        </div>
        <div className="footer-region">
          <label htmlFor="footer-region">Delivery in</label>
          <select
            id="footer-region"
            value={region}
            onChange={(event) => setRegion(event.target.value)}
          >
            <option value="BD">Bangladesh (BDT)</option>
            <option value="EU">Europe (EUR)</option>
            <option value="GB">United Kingdom (GBP)</option>
            <option value="US">United States (USD)</option>
          </select>
          {region !== "BD" && (
            <small>Region preview. Product prices remain in BDT.</small>
          )}
        </div>
      </div>
      <div className="footer-bottom footer-legal">
        <span>&copy; {new Date().getFullYear()} - Aura BOED</span>
        <button
          type="button"
          className="footer-consent-button"
          onClick={() => openInformation("Consent choices")}
        >
          Consent choices
        </button>
        <div className="footer-payments">
          <span>Payment methods</span>
          <div aria-label="Payment method design preview">
            {payments.map((payment) => (
              <span
                key={payment}
                className={`payment-mark payment-${payment.toLowerCase().replaceAll(" ", "-")}`}
              >
                {payment === "Mastercard" ? (
                  <>
                    <i />
                    <i />
                    <span className="footer-sr-only">Mastercard</span>
                  </>
                ) : (
                  payment
                )}
              </span>
            ))}
          </div>
          <small>Checkout integration coming soon</small>
        </div>
      </div>
      {accountOpen && <AccountDialog onClose={() => setAccountOpen(false)} />}
      <dialog
        ref={dialogRef}
        className="footer-info-dialog"
        aria-labelledby="footer-info-title"
        onCancel={() => setInformation("")}
        onClick={(event) => {
          if (event.target === event.currentTarget) setInformation("");
        }}
      >
        <button
          className="footer-info-close"
          type="button"
          aria-label="Close information"
          onClick={() => setInformation("")}
        >
          <Icon name="close" />
        </button>
        <span className="eyebrow">AURA BOED</span>
        <h2 id="footer-info-title">{information}</h2>
        {information === "Consent choices" ? (
          <>
            <p>
              Manage your preferences on this browser. Your cart and saved items
              use local storage. No analytics service is connected.
            </p>
            <label className="footer-consent-option">
              <input type="checkbox" checked disabled />
              Essential storage <span>Always active</span>
            </label>
            <label className="footer-consent-option">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(event) => setAnalytics(event.target.checked)}
              />
              Optional analytics
            </label>
            <button
              className="dark-button"
              type="button"
              onClick={() => {
                try {
                  localStorage.setItem(
                    "aura-analytics-consent",
                    String(analytics),
                  );
                } catch {}
                setInformation("");
              }}
            >
              SAVE PREFERENCES
            </button>
          </>
        ) : information === "Privacy Policy" ? (
          <p>
            This is a storefront preview. Newsletter emails are not stored or
            sent. Cart and saved items are stored locally on your browser. The
            full privacy policy will be available before the store launches.
          </p>
        ) : (
          <p>
            This service is coming soon. Details will be available when the
            store launches.
          </p>
        )}
      </dialog>
    </footer>
  );
}
