import React from 'react';
import Button from '@/components/ui/Button';
import { FaDownload } from 'react-icons/fa';
import { FILE_PATHS } from '@/lib/constants';

/**
 * Download Resume Button Component
 * Prominent, accessible button for resume download
 * Tracks download analytics
 */

interface DownloadResumeButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const DownloadResumeButton: React.FC<DownloadResumeButtonProps> = ({
  variant = 'primary',
  size = 'md',
  showIcon = true,
}) => {
  const handleDownload = () => {
    // Track download event (can integrate with analytics later)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'download', {
        event_category: 'Resume',
        event_label: 'Resume Download',
      });
    }

    // Open resume in new tab
    window.open(FILE_PATHS.RESUME_PDF, '_blank');
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDownload}
      leftIcon={showIcon ? <FaDownload /> : undefined}
      aria-label="Download Resume PDF"
    >
      Download Resume
    </Button>
  );
};

export default DownloadResumeButton;
