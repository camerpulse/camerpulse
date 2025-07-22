export interface ShareData {
  title: string;
  text: string;
  url: string;
  hashtags?: string[];
}

export const shareToTwitter = (data: ShareData): void => {
  const twitterUrl = new URL('https://twitter.com/intent/tweet');
  
  let text = `${data.title}\n\n${data.text}`;
  if (data.hashtags && data.hashtags.length > 0) {
    text += `\n\n${data.hashtags.map(tag => `#${tag}`).join(' ')}`;
  }
  
  twitterUrl.searchParams.set('text', text);
  twitterUrl.searchParams.set('url', data.url);
  
  window.open(twitterUrl.toString(), '_blank', 'width=550,height=420');
};

export const shareToFacebook = (data: ShareData): void => {
  const facebookUrl = new URL('https://www.facebook.com/sharer/sharer.php');
  facebookUrl.searchParams.set('u', data.url);
  facebookUrl.searchParams.set('quote', `${data.title} - ${data.text}`);
  
  window.open(facebookUrl.toString(), '_blank', 'width=626,height=436');
};

export const shareToLinkedIn = (data: ShareData): void => {
  const linkedInUrl = new URL('https://www.linkedin.com/sharing/share-offsite/');
  linkedInUrl.searchParams.set('url', data.url);
  
  window.open(linkedInUrl.toString(), '_blank', 'width=550,height=420');
};

export const shareToWhatsApp = (data: ShareData): void => {
  const whatsappUrl = new URL('https://wa.me/');
  const text = `${data.title}\n\n${data.text}\n\n${data.url}`;
  whatsappUrl.searchParams.set('text', text);
  
  window.open(whatsappUrl.toString(), '_blank');
};

export const shareToTelegram = (data: ShareData): void => {
  const telegramUrl = new URL('https://t.me/share/url');
  telegramUrl.searchParams.set('url', data.url);
  telegramUrl.searchParams.set('text', `${data.title}\n\n${data.text}`);
  
  window.open(telegramUrl.toString(), '_blank');
};

export const copyToClipboard = async (data: ShareData): Promise<void> => {
  const text = `${data.title}\n\n${data.text}\n\n${data.url}`;
  
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    // Fallback for browsers that don't support clipboard API
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    document.execCommand('copy');
    textArea.remove();
  }
};

export const nativeShare = async (data: ShareData): Promise<boolean> => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: data.title,
        text: data.text,
        url: data.url,
      });
      return true;
    } catch (error) {
      console.error('Error sharing:', error);
      return false;
    }
  }
  return false;
};

export const shareSenatorProfile = (senator: { 
  name: string; 
  position: string; 
  party: string;
  trustScore: number;
  id: string;
}): ShareData => {
  const url = `${window.location.origin}/senators/${senator.id}`;
  
  return {
    title: `${senator.name} - ${senator.position}`,
    text: `Check out ${senator.name}'s profile on CamerPulse! ${senator.party} senator with a trust score of ${senator.trustScore}/100. Stay informed about your representatives.`,
    url,
    hashtags: ['CamerPulse', 'CameroonPolitics', 'CivicEngagement', 'Transparency', senator.party.replace(/\s+/g, '')]
  };
};