export interface ShareData {
  title: string;
  text: string;
  url: string;
}

export async function shareVehicle(
  vehicleData: {
    year: number;
    make: string;
    model: string;
    dailyRate: number;
    description: string;
    track?: { name: string; location: string };
  },
  vehicleId: string
): Promise<boolean> {
  const shareData: ShareData = {
    title: `${vehicleData.year} ${vehicleData.make} ${vehicleData.model}`,
    text: `Check out this amazing ${vehicleData.year} ${vehicleData.make} ${vehicleData.model} available for rent! ${vehicleData.description}`,
    url: `${window.location.origin}/vehicles/${vehicleId}`,
  };

  // Check if Web Share API is supported
  if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
      return true;
    } catch (error) {
      // User cancelled or error occurred
      console.log('Share cancelled or failed:', error);
      return false;
    }
  } else {
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(
        `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`
      );
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }
}

export function canShare(): boolean {
  return !!(navigator.share && navigator.canShare);
}

export function copyVehicleLink(
  vehicleData: {
    year: number;
    make: string;
    model: string;
    dailyRate: number;
    description: string;
    track?: { name: string; location: string };
  },
  vehicleId: string
): Promise<boolean> {
  const url = `${window.location.origin}/vehicles/${vehicleId}`;

  return navigator.clipboard
    .writeText(url)
    .then(() => true)
    .catch(() => false);
}

export function openEmailShare(
  vehicleData: {
    year: number;
    make: string;
    model: string;
    dailyRate: number;
    description: string;
    track?: { name: string; location: string };
  },
  vehicleId: string
): void {
  const shareData: ShareData = {
    title: `${vehicleData.year} ${vehicleData.make} ${vehicleData.model}`,
    text: `Check out this amazing ${vehicleData.year} ${vehicleData.make} ${vehicleData.model} available for rent! ${vehicleData.description}`,
    url: `${window.location.origin}/vehicles/${vehicleId}`,
  };

  const subject = encodeURIComponent(
    `Check out this ${vehicleData.year} ${vehicleData.make} ${vehicleData.model}`
  );
  const body = encodeURIComponent(
    `${shareData.text}\n\nView it here: ${shareData.url}`
  );

  const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
  window.open(mailtoLink, '_blank');
}
