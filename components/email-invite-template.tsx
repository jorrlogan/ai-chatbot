import * as React from 'react';

interface EmailTemplateProps {
  orgName: string;
  registrationLink: string;
}

export const EmailInviteTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  orgName,
  registrationLink,
}) => (
  <div>
    <h1>Welcome to DashDocs!</h1>
    <p>You've been invited to join {orgName} on DashDocs.</p>
    <div style={{ marginTop: '24px', marginBottom: '24px' }}>
      <a
        href={registrationLink}
        style={{
          padding: '12px 24px',
          backgroundColor: '#6366f1',
          color: '#ffffff',
          textDecoration: 'none',
          borderRadius: '4px',
          display: 'inline-block',
        }}
      >
        Register Now
      </a>
    </div>
    <p>Click the button above to complete your registration for DashDocs.</p>
  </div>
);
