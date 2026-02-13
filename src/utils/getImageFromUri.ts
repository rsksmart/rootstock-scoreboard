import { PINATA_URL } from "@/constants";

const isSafeUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    // Only allow standard web protocols
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

export async function getImageFromURI(baseURI: string): Promise<string | null> {
  const PINATA_GATEWAY = `${PINATA_URL}/ipfs/`;
  try {
    let metadataUrl = baseURI;
    if (metadataUrl.startsWith("ipfs://")) {
      metadataUrl = metadataUrl.replace("ipfs://", PINATA_GATEWAY);
    } else if (!metadataUrl.startsWith("http")) {
      metadataUrl = `${PINATA_GATEWAY}${metadataUrl}`;
    }

    if (!isSafeUrl(metadataUrl)) return null;

    const res = await fetch(metadataUrl);
    if (!res.ok) return null;

    const metadata = await res.json();
    let imageIpfs = metadata?.image;

    if (!imageIpfs) return null;

    if (imageIpfs.startsWith("ipfs://")) {
      imageIpfs = imageIpfs.replace("ipfs://", PINATA_GATEWAY);
    } else if (!imageIpfs.startsWith("http")) {
      imageIpfs = `${PINATA_GATEWAY}${imageIpfs}`;
    }

    if (!isSafeUrl(imageIpfs)) {
      console.warn("Blocked potentially malicious image URI:", imageIpfs);
      return null;
    }

    return imageIpfs;
  } catch (err) {
    console.error("Failed to load image from IPFS:", err);
    return null;
  }
}
