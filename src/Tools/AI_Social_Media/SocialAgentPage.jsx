import React from 'react';
import { useNavigate } from 'react-router-dom';
import AiSocialMediaDashboard from './AiSocialMediaDashboard';

/**
 * SocialAgentPage — mounts the AI Ads Social Agent Dashboard as a full routed page.
 * The sidebar links (/dashboard/social-agent?tab=generation|calendar) resolve here.
 * The dashboard itself handles the ?tab query param via its own useSearchParams hook.
 */
const SocialAgentPage = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/dashboard/chat', { replace: true });
  };

  return (
    <AiSocialMediaDashboard
      isOpen={true}
      onClose={handleClose}
    />
  );
};

export default SocialAgentPage;
