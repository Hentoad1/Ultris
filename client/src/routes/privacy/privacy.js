
import './privacy.css';

import Scrollbar from '../../assets/components/scrollbar';

function Privacy(){
  return (
    <div className = "page_content centered">
      <Scrollbar position = "fixed">
        <div className = 'privacy_policy'>
          <h1>Privacy Policy</h1>
          <p>Last updated: January 25, 2023</p>
          <h2>I. Introduction</h2>
          <p>In order for Ultris to function as a service some personal information must be collected. The goal of this document is to inform what information is collected and how it is used.</p>
          <p>When we refer to Ultris (or use replacements such as "We" or "Us") we are referring to the Ultris entity.</p>
          <p>When using Ultris the user has the option to remain as a guest where no personal data will be collected.</p>
          <h2>II. Data Collected</h2>
          <p>When the user creates an account the personal information that will be stored consists of</p>
          <ul className = 'nostyle'>
            <li>Display Name / Username</li>
            <li>Email Address</li>
          </ul>
          <p>All personal information is private except for the Display Name.</p>
          <p>When playing as a guest, no personal information will be stored.</p>
          <h2>III. Cookies</h2>
          <p>All Cookies on this site are necessary in order for the site to function, and have no uses of tracking the user.</p>
          <h2>IV. Use of Your Personal Data</h2>
          <p>We do not send any unsolicited emails. All emails will come as a result from an action somewhere within the Ultris service.</p>
          <h2>V. Children's Privacy</h2>
          <p>Our service is not intended for users under the age of 13. If it is found out there is a user under the age of 13, then the personal data relating to them will be removed.</p>
          <h2>VI. Links to Other Websites</h2>
          <p>Our Service may contain links to other websites that are not operated by us. If You click on a third party link, You will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit.</p>
          <h2>VII. Changes to this Privacy Policy</h2>
          <p>We may update Our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>
        </div>
      </Scrollbar>
    </div>
  )
}

export default Privacy;