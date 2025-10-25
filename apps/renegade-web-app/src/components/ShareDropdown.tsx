import { copyVehicleLink, openEmailShare } from '@/lib/share';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@renegade/ui';
import { Copy, Mail, Share } from 'lucide-react';
import { useState } from 'react';

interface ShareDropdownProps {
  vehicleData: {
    year: number;
    make: string;
    model: string;
    dailyRate: number;
    description: string;
    track?: { name: string; location: string };
  };
  vehicleId: string;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export function ShareDropdown({
  vehicleData,
  vehicleId,
  onSuccess,
  onError,
}: ShareDropdownProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCopyLink = async () => {
    setIsLoading(true);
    try {
      const success = await copyVehicleLink(vehicleData, vehicleId);
      if (success) {
        onSuccess?.('Link copied to clipboard');
      } else {
        onError?.('Failed to copy link');
      }
    } catch (_error) {
      onError?.('Failed to copy link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailShare = () => {
    try {
      openEmailShare(vehicleData, vehicleId);
    } catch (_error) {
      onError?.('Failed to open email');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='sm' disabled={isLoading}>
          <Share className='h-4 w-4 mr-2' />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-48'>
        <DropdownMenuItem onClick={handleCopyLink} disabled={isLoading}>
          <Copy className='h-4 w-4 mr-2' />
          Copy Link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEmailShare}>
          <Mail className='h-4 w-4 mr-2' />
          Email
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
